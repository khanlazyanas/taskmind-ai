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

    // Save user subscription (add if it's a new device)
    await PushSubscription.findOneAndUpdate(
      { userId, "subscription.endpoint": subscription.endpoint }, 
      { userId, subscription },
      { upsert: true, new: true }
    );

    // A small confirmation alert
    const payload = JSON.stringify({
      title: "Alerts Active! 🔔",
      body: "TaskMind real-time notifications have been successfully enabled."
    });

    await webpush.sendNotification(subscription, payload);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Subscription Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}