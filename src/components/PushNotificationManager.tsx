"use client";
import { useState } from "react";

export default function PushNotificationManager() {
  const [isSubscribed, setIsSubscribed] = useState(false);

  const enableNotifications = async () => {
    try {
      // 1. Service worker register karo
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // 2. Push manager se subscribe karo
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      // 3. Backend API ko data bhejo (Jo turant ek test notification return karegi)
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      setIsSubscribed(true);
    } catch (error) {
      console.error("Notification Error:", error);
      alert("Push notification block ho gaya ya browser support nahi karta.");
    }
  };

  return (
    <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 text-white mb-6">
      <h3 className="font-semibold mb-2">Enable Push Notifications 🔔</h3>
      <p className="text-sm text-zinc-400 mb-4">Get instant alerts for your high priority tasks.</p>
      
      {!isSubscribed ? (
        <button 
          onClick={enableNotifications}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-all"
        >
          Allow Notifications
        </button>
      ) : (
        <span className="text-green-400 text-sm font-medium">✅ Notifications Enabled</span>
      )}
    </div>
  );
}