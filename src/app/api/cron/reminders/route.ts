import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Task from "@/models/Task";
import PushSubscription from "@/models/PushSubscription";
import webpush from "web-push";

// Initialize web-push with VAPID keys
webpush.setVapidDetails(
  "mailto:anas@taskmind.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function GET(req: Request) {
  try {
    // 1. Security Check: Ensure the request comes from Vercel Cron
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized request", { status: 401 });
    }

    await connectToDatabase();

    // 2. Define the time range for "Today"
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    // 3. Find all tasks that are due today and not yet completed
    const dueTasks = await Task.find({
      status: { $ne: "DONE" },
      dueDate: { $gte: startOfDay, $lte: endOfDay }
    });

    if (dueTasks.length === 0) {
      return NextResponse.json({ message: "No tasks due today. Process finished." });
    }

    // 4. Group tasks by the user ID so we can send one combined notification per user
    const tasksByUser: Record<string, any[]> = {};
    dueTasks.forEach(task => {
      if (!tasksByUser[task.userId]) {
        tasksByUser[task.userId] = [];
      }
      tasksByUser[task.userId].push(task);
    });

    // 5. Send automated notifications to users
    for (const userId of Object.keys(tasksByUser)) {
      const userTasks = tasksByUser[userId];
      const userSubscriptions = await PushSubscription.find({ userId });

      if (userSubscriptions.length > 0) {
        const payload = JSON.stringify({
          title: "📅 Daily Task Reminder",
          body: `Good morning! You have ${userTasks.length} task(s) due today. Time to get things done.`
        });

        // Send to all registered devices for this user
        const pushPromises = userSubscriptions.map((sub: any) => 
          webpush.sendNotification(sub.subscription, payload).catch((err) => {
            // Remove subscription if the user has disabled notifications on that device
            if (err.statusCode === 410 || err.statusCode === 404) {
              return PushSubscription.deleteOne({ _id: sub._id });
            }
          })
        );
        
        await Promise.all(pushPromises);
      }
    }

    return NextResponse.json({ success: true, message: "Automated reminders sent successfully." });
  } catch (error: any) {
    console.error("Cron Execution Error:", error);
    return NextResponse.json({ error: "Failed to execute background job." }, { status: 500 });
  }
}