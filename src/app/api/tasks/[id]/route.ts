import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import { auth } from "@clerk/nextjs/server";

// NAYA: TypeScript ko batana hoga ki params ab ek Promise hai
export async function PATCH(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    await dbConnect();
    const body = await req.json();
    
    // NAYA: params ko await karke usme se 'id' nikalna zaroori hai
    const { id } = await params;
    
    // Find karte waqt naye 'id' aur userId ko match kiya
    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, userId }, 
      { status: body.status },
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
    
    // NAYA: Yahan bhi params ko await karna hai
    const { id } = await params;
    
    // Sirf wahi task delete hoga jo logged-in user ka hai
    const deletedTask = await Task.findOneAndDelete({ _id: id, userId });

    if (!deletedTask) return new NextResponse("Not Found", { status: 404 });
    return new NextResponse("Task deleted", { status: 200 });
  } catch (error) {
    return new NextResponse("Error deleting task", { status: 500 });
  }
}