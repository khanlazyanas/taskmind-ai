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
            type: SchemaType.OBJECT, // <-- UPDATE: String ki jagah SchemaType.OBJECT
            properties: {
              title: { type: SchemaType.STRING, description: "The clear title or description of the task." }, // <-- UPDATE
              priority: { type: SchemaType.STRING, description: "Priority level: must be 'low', 'medium', or 'high'." }, // <-- UPDATE
              dueDate: { type: SchemaType.STRING, description: "ISO date string (YYYY-MM-DD) for when the task is due based on current date context." }, // <-- UPDATE
            },
            required: ["title"],
          },
        }
      ],
    };

    // Gemini Model instance with Tools setup
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      tools: [taskTools as any] // <-- UPDATE: Type safety ke liye 'as any' add kiya taaki aage koi error na aaye
    });

    const prompt = `
      You are 'TaskMind AI', a smart, helpful, and highly efficient personal project manager assistant.
      The user is asking you a question or giving you a direct command to manage their tasks.
      
      Today's date is: ${todayStr}

      Here is the user's current task list:
      ${taskContext || "The user currently has no tasks."}

      User's Question/Command: "${message}"

      Instructions for your response:
      1. Be concise, friendly, and professional.
      2. Answer specifically based on the task list provided above.
      3. If they ask to add, create, or schedule a task, invoke the 'createTask' tool immediately.
      4. If they ask what to do next, suggest high priority or overdue/due-today tasks.
      5. Use formatting (bullet points, bold text) to make it easy to read.
      6. Do not hallucinate tasks that don't exist in the list.
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
        
        // Database mein Task entry execute karo
        await Task.create({
          userId,
          title: args.title,
          priority: args.priority || "medium",
          status: "todo",
          dueDate: args.dueDate ? new Date(args.dueDate) : null
        });

        // Trigger dynamic layout sync for dashboard
        shouldRefresh = true;

        // Multi-turn turn setup: Tool ki response wapas Gemini ko bhejo taaki wo badhiya confirmation response generate kare
        const history = [
          { role: "user", parts: [{ text: prompt }] },
          { role: "model", parts: [{ functionCall: call }] },
          { 
            role: "user", 
            parts: [{ 
              functionResponse: { 
                name: "createTask", 
                response: { success: true, message: `Successfully created task: ${args.title}` } 
              } 
            }] 
          }
        ];

        const finalResult = await model.generateContent({ contents: history });
        aiResponse = finalResult.response.text();
      }
    }

    // Response ke sath refresh flag bhej rahe hain taaki screen load ho sake
    return NextResponse.json({ reply: aiResponse, refresh: shouldRefresh });

  } catch (error) {
    console.error("Chat API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}