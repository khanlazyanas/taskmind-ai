import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongodb";
import Task from "@/models/Task";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { message } = body;
    if (!message) {
      return new NextResponse("Message is required", { status: 400 });
    }

    await connectToDatabase();
    const tasks = await Task.find({ userId }).lean();

    const taskContext = tasks.map(t => 
      `- ID: ${t._id} | [${t.status}] ${t.title} (Priority: ${t.priority}, Due: ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'None'})`
    ).join("\n");

    const todayStr = new Date().toLocaleDateString();

    const taskTools = {
      functionDeclarations: [
        {
          name: "createTask",
          description: "Create a new task in the database.",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              title: { type: SchemaType.STRING, description: "The clear title of the task." },
              priority: { type: SchemaType.STRING, description: "Priority level: 'LOW', 'MEDIUM', or 'HIGH'." },
              dueDate: { type: SchemaType.STRING, description: "ISO date string (YYYY-MM-DD)." },
            },
            required: ["title"],
          },
        },
        {
          name: "updateTask",
          description: "Update an existing task's status, priority, or due date. Use this to reschedule or complete tasks.",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              taskId: { type: SchemaType.STRING, description: "The exact ID of the task to update." },
              status: { type: SchemaType.STRING, description: "New status: 'TODO', 'IN_PROGRESS', or 'DONE'." },
              priority: { type: SchemaType.STRING, description: "New priority: 'LOW', 'MEDIUM', or 'HIGH'." },
              dueDate: { type: SchemaType.STRING, description: "New ISO date string (YYYY-MM-DD)." },
            },
            required: ["taskId"],
          },
        },
        {
          name: "deleteTask",
          description: "Delete a task from the database.",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              taskId: { type: SchemaType.STRING, description: "The exact ID of the task to delete." },
            },
            required: ["taskId"],
          },
        }
      ],
    };

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      tools: [taskTools as any]
    });

    const prompt = `
      You are 'TaskMind AI', a smart, helpful, and highly efficient personal project manager assistant.
      The user's name is Anas. You can greet him naturally if appropriate.
      
      Today's date is: ${todayStr}

      Here is Anas's current task list:
      ${taskContext || "The user currently has no tasks."}

      User's Question/Command: "${message}"

      STRICT INSTRUCTIONS FOR YOUR RESPONSE:
      1. LANGUAGE: You MUST reply entirely in professional English. Do not use Hindi or Hinglish.
      2. EXECUTE ACTIONS: If the user asks to add, create, update, complete, reschedule, or delete a task, YOU MUST INVOKE the relevant tool IMMEDIATELY.
      3. NO QUESTIONS: DO NOT ask the user for missing details like priority or exact dates. 
         - If priority is not explicitly mentioned, silently default to "MEDIUM".
         - If a date/time is mentioned (like "tomorrow", "next week"), calculate the ISO date based on Today's date and send it to the tool.
      4. DO NOT chat unnecessarily before executing a tool. Just execute it.
      5. FORMATTING: NEVER display raw database IDs (like 6a4a9c...) to the user. If summarizing tasks, present them in a clean, human-readable bulleted list (e.g., "• Task Title (Medium Priority, Due: Date)"). Use the IDs silently in the background for tool calls.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const functionCalls = response.functionCalls();

    let shouldRefresh = false;
    let aiResponse = "";

    try {
      aiResponse = response.text();
    } catch (e) {}

    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      const args = call.args as any;
      let actionResult = "";
      
      if (call.name === "createTask") {
        await Task.create({
          userId,
          title: args.title,
          priority: args.priority || "MEDIUM",
          status: "TODO", // <-- FIXED BUG: Uppercase
          dueDate: args.dueDate ? new Date(args.dueDate) : null
        });
        shouldRefresh = true;
        actionResult = `Successfully created task: ${args.title}`;
      } 
      else if (call.name === "updateTask") {
        const updateData: any = {};
        if (args.status) updateData.status = args.status;
        if (args.priority) updateData.priority = args.priority;
        if (args.dueDate) updateData.dueDate = new Date(args.dueDate);
        
        await Task.findByIdAndUpdate(args.taskId, updateData);
        shouldRefresh = true;
        actionResult = `Successfully updated the task.`;
      }
      else if (call.name === "deleteTask") {
        await Task.findByIdAndDelete(args.taskId);
        shouldRefresh = true;
        actionResult = `Successfully deleted the task.`;
      }

      const history = [
        { role: "user", parts: [{ text: prompt }] },
        { role: "model", parts: [{ functionCall: call }] },
        { 
          role: "user", 
          parts: [{ 
            functionResponse: { 
              name: call.name, 
              response: { success: true, message: actionResult } 
            } 
          }] 
        }
      ];

      const finalResult = await model.generateContent({ contents: history });
      aiResponse = finalResult.response.text();
    }

    return NextResponse.json({ reply: aiResponse, refresh: shouldRefresh });

  } catch (error) {
    console.error("Chat API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}