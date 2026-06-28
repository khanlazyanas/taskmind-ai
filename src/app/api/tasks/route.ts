import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Task from "@/models/Task";

// GET API: Saare tasks fetch karne ke liye
export async function GET() {
  try {
    await connectToDatabase();
    // Latest tasks sabse upar aayenge (sorted by createdAt)
    const tasks = await Task.find().sort({ createdAt: -1 });
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// POST API: Naya task create karne ke liye
export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();
    
    // Naya task database me save kar rahe hain
    const newTask = await Task.create(body);
    
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}