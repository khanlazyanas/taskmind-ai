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
      `- ID: ${t._id} | [${t.status}] ${t.title} (Priority: ${t.priority})`
    ).join("\n");

    const todayStr = new Date().toLocaleDateString();

    // 4. Model Setup - FIXED: Wapas 'gemini-2.5-flash' laga diya gaya hai!
    const taskTools = {
      functionDeclarations: [
        {
          name: "createTask",
          description: "Create a new task in the database.",
          parameters: {
            type: SchemaType.OBJECT, 
            properties: {
              title: { type: SchemaType.STRING, description: "The exact task description." }, 
              priority: { type: SchemaType.STRING, description: "Must be 'low', 'medium', or 'high'." }
            },
            required: ["title"],
          },
        }
      ],
    };

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      tools: [taskTools as any],
    });

    const prompt = `
      You are 'TaskMind AI'. Today's date is: ${todayStr}.
      User tasks: ${taskContext || "No tasks currently."}
      User command: "${message}"

      CRITICAL RULES:
      If the user wants to add/create a task, you MUST call the 'createTask' tool.
      Do NOT say "I have added it" in text. Call the tool!
    `;

    // 5. Execute Gemini AI
    const result = await model.generateContent(prompt);
    const response = result.response;
    const functionCalls = response.functionCalls ? response.functionCalls() : [];

    let shouldRefresh = false;
    let aiResponse = "";
    
    // Check agar user task banane ko keh raha hai
    const msgLower = message.toLowerCase();
    const isAddingTask = msgLower.includes("add") || msgLower.includes("create") || msgLower.includes("bana");

    // 6. Execution & Fallback Logic (The Brahmastra)
    if (functionCalls && functionCalls.length > 0) {
      // SCENARIO A: AI ne Tool chalaya
      const call = functionCalls[0];
      if (call.name === "createTask") {
        const args = call.args as any;
        
        await Task.create({
          userId,
          title: args.title,
          priority: args.priority || "medium",
          status: "todo"
        });

        shouldRefresh = true;
        aiResponse = `✅ Done bhai! Task "${args.title}" successfully add ho gaya hai!`;
      }
    } else if (isAddingTask) {
      // SCENARIO B: AI ne Tool nahi chalaya (Manual Override)
      let extractedTitle = message
        .replace(/add a new task to my list:?/i, "")
        .replace(/add a new task:?/i, "")
        .replace(/add task:?/i, "")
        .replace(/create a task:?/i, "")
        .replace(/.*bana do:?/i, "")
        .trim();
        
      if (!extractedTitle || extractedTitle.length < 2) {
        extractedTitle = message; 
      }

      await Task.create({
        userId,
        title: extractedTitle,
        priority: "medium",
        status: "todo"
      });

      shouldRefresh = true;
      aiResponse = `✅ Done bhai! Task "${extractedTitle}" add kar diya gaya hai.`;
    } else {
      // SCENARIO C: Normal chat
      try {
        aiResponse = response.text();
      } catch (e) {
        aiResponse = "Main tumhari task list manage karne mein help kar sakta hoon. Try 'Add a task...'";
      }
    }

    return NextResponse.json({ reply: aiResponse, refresh: shouldRefresh });

  } catch (error) {
    console.error("Chat API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}