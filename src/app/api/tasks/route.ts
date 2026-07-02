import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Task from "@/models/Task";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";

export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();
    const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description } = body;
    
    await connectToDatabase();

    // NAYA: Yahan 'gemini-1.5-pro' use kar rahe hain deep reasoning ke liye
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = `
      You are an expert agile project manager. Analyze the following task and:
      1. Determine its priority (HIGH, MEDIUM, LOW).
      2. Provide up to 3 relevant tags.
      3. Break down the task into 3 to 4 actionable subtasks.
      
      Task Title: "${title}"
      Task Context/Description: "${description || "No description provided."}"
      
      Respond ONLY with a valid JSON object strictly matching this format:
      {
        "priority": "HIGH" | "MEDIUM" | "LOW",
        "tags": ["tag1", "tag2"],
        "subtasks": ["Step 1 description", "Step 2 description", "Step 3 description"]
      }
    `;

    const result = await model.generateContent(prompt);
    const aiResponseText = result.response.text();
    const cleanedText = aiResponseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const aiData = JSON.parse(cleanedText);

    // AI ne jo subtasks diye (strings), unko MongoDB ke format mein convert kiya
    const generatedSubtasks = aiData.subtasks 
      ? aiData.subtasks.map((step: string) => ({ title: step, completed: false }))
      : [];

    const newTask = await Task.create({
      userId,
      title,
      description,
      priority: aiData.priority || "MEDIUM",
      tags: aiData.tags || [],
      subtasks: generatedSubtasks, // NAYA: Database mein save kiya
    });
    
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Error creating AI task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}