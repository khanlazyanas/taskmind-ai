import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
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
      `- [${t.status}] ${t.title} (Priority: ${t.priority}, Due: ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'None'})`
    ).join("\n");

    // 4. Gemini ko System Prompt aur Data bhejo
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are 'TaskMind AI', a smart, helpful, and highly efficient personal project manager assistant.
      The user is asking you a question about their tasks. 
      
      Here is the user's current task list:
      ${taskContext || "The user currently has no tasks."}

      User's Question: "${message}"

      Instructions for your response:
      1. Be concise, friendly, and professional.
      2. Answer specifically based on the task list provided above.
      3. If they ask what to do next, suggest high priority or overdue/due-today tasks.
      4. Use formatting (bullet points, bold text) to make it easy to read.
      5. Do not hallucinate tasks that don't exist in the list.
    `;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    return NextResponse.json({ reply: aiResponse });

  } catch (error) {
    console.error("Chat API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}