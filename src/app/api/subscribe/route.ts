import { NextResponse } from "next/server";
import webpush from "web-push";

// VAPID details setup karna zaroori hai
webpush.setVapidDetails(
  "mailto:anas@taskmind.com", // Yahan koi bhi email daal sakte ho
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    const subscription = await req.json();

    // Asli app mein hum is 'subscription' ko MongoDB mein user ke sath save karte hain
    // Par abhi testing ke liye hum turant ek "Welcome" notification bhejenge!

    const payload = JSON.stringify({
      title: "TaskMind PWA Ready! 🚀",
      body: "Bhai Anas, tumhare Push Notifications perfectly set ho gaye hain!"
    });

    // Send the notification
    await webpush.sendNotification(subscription, payload);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Push API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}