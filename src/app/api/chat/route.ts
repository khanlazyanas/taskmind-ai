import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongodb";
import Task from "@/models/Task";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    // 1. User Auth Check
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. User ka message receive karo
    const body = await req.json();
    const { message } = body;
    if (!message) {
      return new NextResponse("Message is required", { status: 400 });
    }

    // 3. User ke saare tasks fetch karo (Context ke liye)
    await connectToDatabase();
    const tasks = await Task.find({ userId }).lean();

    const taskContext = tasks.map(t => 
      `- ID: ${t._id} | [${t.status}] ${t.title} (Priority: ${t.priority}, Due: ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'None'})`
    ).join("\n");

    const todayStr = new Date().toLocaleDateString();

    // 4. Gemini Function Calling / Tools Definition
    const taskTools = {
      functionDeclarations: [
        {
          name: "createTask",
          description: "Create a new task in the database. MUST be called when user asks to add, save, or create a task.",
          parameters: {
            type: SchemaType.OBJECT, 
            properties: {
              title: { type: SchemaType.STRING, description: "The title of the task." }, 
              priority: { type: SchemaType.STRING, description: "Must be 'low', 'medium', or 'high'." }, 
              dueDate: { type: SchemaType.STRING, description: "ISO date string (YYYY-MM-DD)." }, 
            },
            required: ["title"],
          },
        }
      ],
    };

    // Gemini Model instance
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      tools: [taskTools as any],
    });

    // SUPER STRICT PROMPT
    const prompt = `
      System Role: You are 'TaskMind AI', a strict backend execution agent.
      Today's date: ${todayStr}
      Current tasks: ${taskContext || "None."}
      User's command: "${message}"

      CRITICAL RULES (FAILING THESE WILL CRASH THE SYSTEM):
      1. MANDATORY TOOL USAGE: If the user asks to add, create, schedule, or put a task on the list, YOU MUST CALL THE 'createTask' TOOL.
      2. NO HALLUCINATIONS: NEVER reply with plain text saying "I have added it to your list". If you do not call the tool, the task is NOT added. Call the tool!
      3. DEFAULTS: If priority is missing, use "medium". If date is missing, leave it empty. Do not ask for them.
      4. GENERAL CHAT: ONLY reply with normal text if the user is asking a general question (like "what are my tasks?") and NOT asking to create a task.
      5. LANGUAGE: If you reply with text, match the user's language (Hinglish/English).
    `;

    // 5. Execute Gemini AI
    const result = await model.generateContent(prompt);
    const response = result.response;
    const functionCalls = response.functionCalls();

    let shouldRefresh = false;
    let aiResponse = "";

    try {
      aiResponse = response.text();
    } catch (e) {
      // Ignored if text doesn't exist
    }

    // 6. Tool Call Handling
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      
      if (call.name === "createTask") {
        const args = call.args as any;
        
        let finalDate = null;
        if (args.dueDate) {
            const parsed = new Date(args.dueDate);
            if (!isNaN(parsed.getTime())) {
                finalDate = parsed;
            }
        }

        // Database mein Task save karo
        await Task.create({
          userId,
          title: args.title,
          priority: args.priority || "medium",
          status: "todo",
          dueDate: finalDate
        });

        shouldRefresh = true;
        aiResponse = `Done! Task "${args.title}" has been successfully added to your workspace. 🚀`;
      }
    } else if (message.toLowerCase().includes("add") || message.toLowerCase().includes("create") || message.toLowerCase().includes("bana")) {
      // FALLBACK SAFEGUARD: Agar AI fir se hawabaazi kare, toh usko pakdo
      aiResponse = "System Error: Task save nahi ho paya. Please ek baar dobara try karo (eg: 'Add task: ...')";
    }

    return NextResponse.json({ reply: aiResponse || "Understood!", refresh: shouldRefresh });

  } catch (error) {
    console.error("Chat API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}