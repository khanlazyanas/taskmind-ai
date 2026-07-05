import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Task from "@/models/Task";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";

// <-- NAYA IMPORTS: Push Notification ke liye
import PushSubscription from "@/models/PushSubscription";
import webpush from "web-push";

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
    // dueDate ko body se extract kiya
    const { title, description, dueDate } = body;
    
    await connectToDatabase();

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    
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
    const aiData = JSON.parse(result.response.text());

    const generatedSubtasks = aiData.subtasks 
      ? aiData.subtasks.map((step: string) => ({ title: step, completed: false }))
      : [];

    const newTask = await Task.create({
      userId,
      title,
      description,
      priority: aiData.priority || "MEDIUM",
      tags: aiData.tags || [],
      subtasks: generatedSubtasks, 
      // Agar dueDate aayi hai toh usko Date object banakar save karo
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });
    
    // ==========================================
    // 🚀 NAYA LOGIC: PUSH NOTIFICATION TRIGGER
    // ==========================================
    try {
      // 1. User ke saare devices (subscriptions) database se nikaalo
      const userSubscriptions = await PushSubscription.find({ userId });
      
      if (userSubscriptions.length > 0) {
        // VAPID keys setup karo
        webpush.setVapidDetails(
          "mailto:anas@taskmind.com",
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
          process.env.VAPID_PRIVATE_KEY!
        );

        // 2. Notification ka message banao (AI priority use karke)
        const payload = JSON.stringify({
          title: aiData.priority === 'HIGH' ? "🚨 High Priority Task!" : "📌 Naya Task Add Hua",
          body: `"${title}" successfully add ho gaya hai.`
        });

        // 3. Sabhi active devices par push notification bhejo
        const pushPromises = userSubscriptions.map((sub: any) => 
          webpush.sendNotification(sub.subscription, payload).catch((err) => {
            // Agar browser se notification block ho gaya ya expire ho gaya, toh DB se clean kar do
            if (err.statusCode === 410 || err.statusCode === 404) {
              return PushSubscription.deleteOne({ _id: sub._id });
            }
          })
        );
        
        // Promise.all use karke background mein run hone do, API ko block mat karo
        Promise.all(pushPromises).catch(console.error); 
      }
    } catch (pushError) {
      console.error("Push notification logic error:", pushError);
      // Galti se push fail hua, toh bhi user ka task theek se ban jaye
    }
    // ==========================================

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Error creating AI task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}