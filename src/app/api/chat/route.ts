import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"; // <-- UPDATE: SchemaType add kiya hai
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

    // Tasks ko ek simple readable format mein convert karo taaki AI samajh sake
    const taskContext = tasks.map(t => 
      `- ID: ${t._id} | [${t.status}] ${t.title} (Priority: ${t.priority}, Due: ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'None'})`
    ).join("\n");

    // Aaj ki date provide karein taaki relative phrases (like "tomorrow", "next monday") AI samajh sake
    const todayStr = new Date().toLocaleDateString();

    // 4. Gemini Function Calling / Tools Definition
    const taskTools = {
      functionDeclarations: [
        {
          name: "createTask",
          description: "Create a new task in the database when the user explicitly asks to add, save, or create a task.",
          parameters: {
            type: SchemaType.OBJECT, 
            properties: {
              title: { type: SchemaType.STRING, description: "The clear title or description of the task." }, 
              priority: { type: SchemaType.STRING, description: "Priority level: must be 'low', 'medium', or 'high'." }, 
              dueDate: { type: SchemaType.STRING, description: "ISO date string (YYYY-MM-DD) for when the task is due based on current date context." }, 
            },
            required: ["title"],
          },
        }
      ],
    };

    // Gemini Model instance with Tools setup
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      tools: [taskTools as any] 
    });

    const prompt = `
      You are 'TaskMind AI', a smart, helpful, and highly efficient personal project manager assistant.
      The user is asking you a question or giving you a direct command to manage their tasks.
      
      Today's date is: ${todayStr}

      Here is the user's current task list:
      ${taskContext || "The user currently has no tasks."}

      User's Question/Command: "${message}"

      STRICT INSTRUCTIONS FOR YOUR RESPONSE:
      1. LANGUAGE: Always reply in the exact same language the user is speaking. If the user writes in Hindi/Hinglish, you MUST reply in natural, friendly Hinglish.
      2. TASK CREATION: If the user asks to add, create, or schedule a task, YOU MUST INVOKE the 'createTask' tool IMMEDIATELY. 
      3. NO QUESTIONS: DO NOT ask the user for missing details like priority or due date. 
         - If priority is not explicitly mentioned, silently default to "medium".
         - If a date/time is mentioned (like "kal", "tomorrow", "next week"), calculate the ISO date based on Today's date and send it to the tool. 
         - If no date is mentioned, leave it empty.
      4. Just execute the tool! Do not chat unnecessarily before executing the tool.
    `;

    // Initial check query execution
    const result = await model.generateContent(prompt);
    const response = result.response;
    const functionCalls = response.functionCalls();

    let shouldRefresh = false;
    let aiResponse = "";

    try {
      aiResponse = response.text();
    } catch (e) {
      // Pure function call alerts won't return text in initial step, which is fine.
    }

    // 5. Tool Call Handling
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      
      if (call.name === "createTask") {
        const args = call.args as any;
        
        // Date ko safe tarike se parse karna taaki database crash na ho
        let finalDate = null;
        if (args.dueDate) {
            const parsed = new Date(args.dueDate);
            if (!isNaN(parsed.getTime())) {
                finalDate = parsed;
            }
        }

        // Database mein Task entry execute karo
        await Task.create({
          userId,
          title: args.title,
          priority: args.priority || "medium",
          status: "todo",
          dueDate: finalDate
        });

        // Trigger dynamic layout sync for dashboard
        shouldRefresh = true;

        // CRASH FIX: Bina second API call kiye direct confirm message de diya 
        aiResponse = `Done! Task "${args.title}" has been successfully added to your workspace. 🚀`;
      }
    }

    // Response ke sath refresh flag bhej rahe hain taaki screen load ho sake
    return NextResponse.json({ reply: aiResponse || "Understood!", refresh: shouldRefresh });

  } catch (error) {
    console.error("Chat API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}