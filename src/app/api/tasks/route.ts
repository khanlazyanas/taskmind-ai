import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Task from "@/models/Task";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server"; // NAYA: Clerk import

// Initialize Gemini AI with your API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// GET API: Sirf logged-in user ke tasks fetch karne ke liye
export async function GET() {
  try {
    const { userId } = await auth(); // <-- NAYA: Yahan 'await' lagaya
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    // NAYA: find() ke andar userId daal diya taaki sirf is user ke tasks aayen
    const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
    
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// POST API: Naya task create karne ke liye (AI Logic + Auth)
export async function POST(request: Request) {
  try {
    const { userId } = await auth(); // <-- NAYA: Yahan bhi 'await' lagaya
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description } = body;
    
    await connectToDatabase();

    // 1. Setup Gemini Prompt
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
      You are an expert project manager. Analyze the following task and determine its priority and relevant tags.
      
      Task Title: "${title}"
      Task Context/Description: "${description || "No description provided."}"
      
      Respond ONLY with a valid JSON object strictly matching this format (no extra text, no markdown):
      {
        "priority": "HIGH" | "MEDIUM" | "LOW",
        "tags": ["tag1", "tag2", "tag3"]
      }
      Keep tags short (1-2 words max) and limit to a maximum of 3 tags.
    `;

    // 2. Ask Gemini for Priority and Tags
    const result = await model.generateContent(prompt);
    const aiResponseText = result.response.text();
    
    // 3. Clean up the response
    const cleanedText = aiResponseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const aiData = JSON.parse(cleanedText);

    // 4. Merge User Data with AI Data and Save to MongoDB
    const newTask = await Task.create({
      userId, // <--- NAYA: Task ke sath userId bhi database mein save hoga
      title,
      description,
      priority: aiData.priority || "MEDIUM",
      tags: aiData.tags || [],
    });
    
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Error creating AI task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}