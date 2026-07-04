import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongodb";
import Task from "@/models/Task";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ reply: "Unauthorized user." });

    const body = await req.json();
    const { message } = body;
    if (!message) return NextResponse.json({ reply: "Message is required." });

    await connectToDatabase();
    
    const tasks = await Task.find({ userId }).lean();
    const taskContext = tasks.map((t: any) => `- ${t.title}`).join("\n");

    const taskTools: any = {
      functionDeclarations: [
        {
          name: "createTask",
          description: "Create a new task in the database.",
          parameters: {
            type: SchemaType.OBJECT, 
            properties: {
              title: { type: SchemaType.STRING, description: "Exact task title" }
            },
            required: ["title"],
          },
        }
      ],
    };

    // 🚀 UNIVERSAL MODEL UPDATE: 'gemini-pro' har version par support karta hai
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      tools: [taskTools],
    });

    const prompt = `Context: ${taskContext}. Command: "${message}". Call 'createTask' tool immediately if adding a task.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    
    let shouldRefresh = false;
    let aiResponse = "";

    const responseData = response as any;
    let calls: any[] = [];
    if (responseData.functionCalls && typeof responseData.functionCalls === "function") {
        calls = responseData.functionCalls();
    } else if (Array.isArray(responseData.functionCalls)) {
        calls = responseData.functionCalls;
    }

    const isAddingTask = message.toLowerCase().includes("add") || message.toLowerCase().includes("create");

    if (calls && calls.length > 0) {
      const args = calls[0].args;
      
      await Task.create({
        userId,
        title: args.title,
        priority: "medium",
        status: "todo",
        dueDate: null
      });

      shouldRefresh = true;
      aiResponse = `✅ Done bhai! Task "${args.title}" successfully add ho gaya!`;

    } else if (isAddingTask) {
      let extTitle = message.replace(/add a new task to my list:?/i, "").replace(/add a new task:?/i, "").trim();
      if (!extTitle) extTitle = "New Task";

      await Task.create({
        userId,
        title: extTitle,
        priority: "medium",
        status: "todo",
        dueDate: null
      });

      shouldRefresh = true;
      aiResponse = `✅ Done bhai! Task "${extTitle}" add kar diya gaya hai.`;

    } else {
      try {
        aiResponse = response.text();
      } catch (e) {
        aiResponse = "Main task manager hoon. Mujhe batao kaunsa task add karna hai.";
      }
    }

    return NextResponse.json({ reply: aiResponse, refresh: shouldRefresh });

  } catch (error: any) {
    return NextResponse.json({ 
      reply: `⚠️ Database/API Error: ${error.message}`, 
      refresh: false 
    });
  }
}