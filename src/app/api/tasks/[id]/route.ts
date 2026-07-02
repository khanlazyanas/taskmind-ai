import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai"; // NAYA: Gemini Import

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function PATCH(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    await dbConnect();
    const body = await req.json();
    const { id } = await params;
    
    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.subtasks) updateData.subtasks = body.subtasks;
    if (body.title) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;

    // NAYA: Agar frontend ne 'regenerateAI' flag bheja hai, toh Gemini ko wapas bulao!
    if (body.regenerateAI && body.title) {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `
        You are an expert agile project manager. Analyze the following updated task and:
        1. Determine its priority (HIGH, MEDIUM, LOW).
        2. Provide up to 3 relevant tags.
        3. Break down the task into 3 to 4 actionable subtasks.
        
        Task Title: "${body.title}"
        Task Context/Description: "${body.description || "No description provided."}"
        
        Respond ONLY with a valid JSON object strictly matching this format:
        {
          "priority": "HIGH" | "MEDIUM" | "LOW",
          "tags": ["tag1", "tag2"],
          "subtasks": ["Step 1 description", "Step 2 description", "Step 3 description"]
        }
      `;

      const result = await model.generateContent(prompt);
      const aiData = JSON.parse(result.response.text());

      // AI se naya data milte hi usko updateData mein daal do
      updateData.priority = aiData.priority || "MEDIUM";
      updateData.tags = aiData.tags || [];
      updateData.subtasks = aiData.subtasks 
        ? aiData.subtasks.map((step: string) => ({ title: step, completed: false }))
        : [];
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, userId }, 
      { $set: updateData },
      { new: true }
    );

    if (!updatedTask) return new NextResponse("Not Found", { status: 404 });
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error patching task:", error);
    return new NextResponse("Error updating task", { status: 500 });
  }
}

export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    await dbConnect();
    const { id } = await params;
    
    const deletedTask = await Task.findOneAndDelete({ _id: id, userId });

    if (!deletedTask) return new NextResponse("Not Found", { status: 404 });
    return new NextResponse("Task deleted", { status: 200 });
  } catch (error) {
    return new NextResponse("Error deleting task", { status: 500 });
  }
}