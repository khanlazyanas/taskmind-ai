"use client";
import { useState, useEffect } from "react";

export default function PushNotificationManager() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const enableNotifications = async () => {
    try {
      setErrorMsg(""); // Reset error

      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setErrorMsg("Your browser doesn't support push notifications.");
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      const readyReg = await navigator.serviceWorker.ready;
      
      const subscription = await readyReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      setIsSubscribed(true);
    } catch (error: any) {
      console.error("Notification Error:", error);
      // Agar mobile browser block karta hai, toh user ko professional English message dikhao
      setErrorMsg("To enable notifications on your mobile device, please install the app using 'Add to Home Screen'.");
    }
  };

  return (
    <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 text-white mb-6">
      <h3 className="font-semibold mb-2">Enable Push Notifications 🔔</h3>
      <p className="text-sm text-zinc-400 mb-4">Get instant alerts for your high priority tasks.</p>
      
      {!isSubscribed ? (
        <div className="flex flex-col items-start gap-3">
          <button 
            onClick={enableNotifications}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          >
            Allow Notifications
          </button>
          {/* Error Message Niche Dikhega Alert Box Ke Bajaye */}
          {errorMsg && (
            <span className="text-amber-500 text-xs font-medium bg-amber-500/10 p-2 rounded border border-amber-500/20">
              ⚠️ {errorMsg}
            </span>
          )}
        </div>
      ) : (
        <span className="text-green-400 text-sm font-medium">✅ Notifications Enabled</span>
      )}
    </div>
  );
}