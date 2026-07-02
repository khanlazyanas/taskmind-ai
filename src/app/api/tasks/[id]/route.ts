import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import { auth } from "@clerk/nextjs/server";

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
    
    // NAYA: edit title and description
    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.subtasks) updateData.subtasks = body.subtasks;
    if (body.title) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description; // undefined check kiya kyunki empty string bhi save honi chahiye

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, userId }, 
      { $set: updateData },
      { new: true }
    );

    if (!updatedTask) return new NextResponse("Not Found", { status: 404 });
    return NextResponse.json(updatedTask);
  } catch (error) {
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