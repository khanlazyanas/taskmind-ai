import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth(); // <-- NAYA: Yahan 'await' lagana zaroori hai
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    await dbConnect();
    const body = await req.json();
    
    // Find karte waqt _id ke sath userId bhi match hona chahiye
    const updatedTask = await Task.findOneAndUpdate(
      { _id: params.id, userId }, 
      { status: body.status },
      { new: true }
    );

    if (!updatedTask) return new NextResponse("Not Found", { status: 404 });
    return NextResponse.json(updatedTask);
  } catch (error) {
    return new NextResponse("Error updating task", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth(); // <-- NAYA: Yahan bhi 'await' lagana hai
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    await dbConnect();
    
    // Sirf wahi task delete hoga jo logged-in user ka hai
    const deletedTask = await Task.findOneAndDelete({ _id: params.id, userId });

    if (!deletedTask) return new NextResponse("Not Found", { status: 404 });
    return new NextResponse("Task deleted", { status: 200 });
  } catch (error) {
    return new NextResponse("Error deleting task", { status: 500 });
  }
}