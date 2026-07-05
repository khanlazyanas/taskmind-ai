import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongodb";
import PushSubscription from "@/models/PushSubscription";
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:anas@taskmind.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const subscription = await req.json();
    await connectToDatabase();

    // User ka subscription save karo (agar naya device hai toh add karo)
    await PushSubscription.findOneAndUpdate(
      { userId, "subscription.endpoint": subscription.endpoint }, 
      { userId, subscription },
      { upsert: true, new: true }
    );

    // Ek chhota sa confirmation alert
    const payload = JSON.stringify({
      title: "Alerts Active! 🔔",
      body: "TaskMind ke real-time notifications successfully enable ho gaye hain."
    });

    await webpush.sendNotification(subscription, payload);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Subscription Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}