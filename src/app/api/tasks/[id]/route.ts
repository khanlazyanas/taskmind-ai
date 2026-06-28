import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Task from "@/models/Task";

// PATCH API: Kisi specific task ka status update karne ke liye
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    await connectToDatabase();

    // Database mein task find karke uska status update karo
    const updatedTask = await Task.findByIdAndUpdate(
      params.id,
      { status },
      { new: true } // Ye ensure karta hai ki updated data return ho
    );

    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error("Error updating task status:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}