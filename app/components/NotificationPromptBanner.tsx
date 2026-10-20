"use client";

import { useState } from "react";
import { usePushNotifications } from "@/lib/usePushNotifications";
import { useApp } from "../context/AppContext";
import { Bell, X, Check, Calendar, MessageSquare } from "lucide-react";

export default function NotificationPromptBanner() {
  const { isLoggedIn } = useApp();
  const { isSubscribed, isSupported, permission, subscribeToPush, loading } = usePushNotifications();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return Boolean(sessionStorage.getItem("push_banner_dismissed"));
  });
  const [subscribing, setSubscribing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isLoggedIn || !isSupported || isSubscribed || dismissed || permission === "denied") {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("push_banner_dismissed", "true");
  };

  const handleSubscribe = async () => {
    setSubscribing(true);
    const res = await subscribeToPush();
    setSubscribing(false);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setDismissed(true);
      }, 2500);
    }
  };

  return (
    <div className="fixed top-20 right-4 left-4 sm:left-auto sm:right-6 max-w-md z-40 animate-slideIn">
      <div className="bg-slate-900/95 backdrop-blur-md text-white border border-teal-500/40 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600/30 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30">
              {success ? <Check size={20} className="text-emerald-400" /> : <Bell size={20} />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {success ? "Push Notifications Enabled!" : "Enable Push Notifications"}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                {success
                  ? "You'll now receive timely 24h & 1h appointment alerts and direct chat updates."
                  : "Get 24-hour & 1-hour appointment reminders and instant chat alerts directly on your device."}
              </p>
              {!success && (
                <div className="flex items-center gap-3 mt-2 text-[11px] text-teal-300/80">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> 24h & 1h Reminders
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MessageSquare size={12} /> Chat Messages
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {!success && (
          <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              onClick={handleDismiss}
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 font-medium transition-colors"
            >
              Later
            </button>
            <button
              onClick={handleSubscribe}
              disabled={subscribing || loading}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs px-4 py-1.5 rounded-xl transition-all shadow-sm"
            >
              {subscribing ? "Activating..." : "Enable Notifications"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
