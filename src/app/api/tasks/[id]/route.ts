import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Task from "@/models/Task";

// PATCH API: Kisi specific task ka status update karne ke liye
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Yahan Promise add kiya
) {
  try {
    const body = await request.json();
    const { status } = body;
    
    // NAYA RULE: Next.js latest version mein params ko await karna padta hai
    const { id } = await params; 

    await connectToDatabase();

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { status },
      { new: true }
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

// DELETE API: Task ko hamesha ke liye database se udane ke liye
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Yahan Promise add kiya
) {
  try {
    // NAYA RULE: Params ko await karo
    const { id } = await params;

    await connectToDatabase();
    
    const deletedTask = await Task.findByIdAndDelete(id);
    
    if (!deletedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
} 