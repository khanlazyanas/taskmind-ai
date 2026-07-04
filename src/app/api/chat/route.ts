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

    // Is message mein task creation command hai ya nahi, check karne ke liye flag
    const isTaskCreation = 
      message.toLowerCase().includes("add") || 
      message.toLowerCase().includes("create") || 
      message.toLowerCase().includes("bana") || 
      message.toLowerCase().includes("schedule");

    // 4. Gemini Function Calling / Tools Definition
    const taskTools = {
      functionDeclarations: [
        {
          name: "createTask",
          description: "Create a new task in the database.",
          parameters: {
            type: SchemaType.OBJECT, 
            properties: {
              title: { type: SchemaType.STRING, description: "The clear title or description of the task." }, 
              priority: { type: SchemaType.STRING, description: "Priority level: must be 'low', 'medium', or 'high'." }, 
              dueDate: { type: SchemaType.STRING, description: "ISO date string (YYYY-MM-DD)." }, 
            },
            required: ["title"],
          },
        }
      ],
    };

    // NAYA & POWERFUL UPGRADE: Agar user task bana raha hai, toh force karo tool use karne ke liye!
    const modelConfig: any = {
      model: "gemini-2.5-flash",
      tools: [taskTools as any],
    };

    if (isTaskCreation) {
      modelConfig.toolConfig = {
        functionCallingConfig: {
          mode: "ANY", // <-- AI KO FORCED FUNCTION CALLING PAR DAAL DIYA (Ab wo text jhooth nahi bol payega)
          allowedFunctionNames: ["createTask"]
        }
      };
    }

    const model = genAI.getGenerativeModel(modelConfig);

    const prompt = `
      You are 'TaskMind AI', a smart project manager agent.
      Today's date is: ${todayStr}
      Current user task list:
      ${taskContext || "No tasks currently."}

      User command: "${message}"

      INSTRUCTIONS:
      Extract the title, priority, and due date from the user command to fill the 'createTask' tool parameters.
      - If priority is missing, set "medium".
      - If date is missing, leave it blank.
    `;

    // 5. Execute Gemini AI
    const result = await model.generateContent(prompt);
    const response = result.response;
    const functionCalls = response.functionCalls();

    let shouldRefresh = false;
    let aiResponse = "";

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

        // Real MongoDB Entry
        await Task.create({
          userId,
          title: args.title,
          priority: args.priority || "medium",
          status: "todo",
          dueDate: finalDate
        });

        shouldRefresh = true;
        
        // Response language check
        const isHindi = message.match(/[\u0600-\u06FF\u0900-\u097F]/) || message.toLowerCase().includes("bana") || message.toLowerCase().includes("bhai");
        aiResponse = isHindi 
          ? `Done bhai! Task "${args.title}" successfully add ho gaya hai workspace me. 🚀`
          : `Done! Task "${args.title}" has been successfully added to your workspace. 🚀`;
      }
    } else {
      // Normal chat handle agar creation command nahi hai
      try {
        aiResponse = response.text();
      } catch (e) {
        aiResponse = "I can help you manage your tasks. Try saying 'Add a new task: ...'";
      }
    }

    return NextResponse.json({ reply: aiResponse, refresh: shouldRefresh });

  } catch (error) {
    console.error("Chat API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}