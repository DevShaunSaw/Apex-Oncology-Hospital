"use client";

import { useState } from "react";
import { usePushNotifications } from "@/lib/usePushNotifications";
import {
  Bell,
  BellOff,
  BellRing,
  Clock,
  Calendar,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  X,
  Smartphone,
  Laptop,
  Share,
  PlusSquare,
  Sparkles,
} from "lucide-react";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const {
    isSupported,
    permission,
    isSubscribed,
    loading,
    isIOS,
    isStandalone,
    deviceType,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification,
    sendTestAppointmentReminder,
  } = usePushNotifications();

  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  if (!isOpen) return null;

  const handleToggle = async () => {
    setActionLoading(true);
    setFeedback(null);

    if (isSubscribed) {
      const res = await unsubscribeFromPush();
      if (res.success) {
        setFeedback({ type: "success", message: "Push notifications turned off on this device." });
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to turn off notifications." });
      }
    } else {
      const res = await subscribeToPush();
      if (res.success) {
        setFeedback({
          type: "success",
          message: "Push notifications enabled! You will now receive appointment & chat alerts.",
        });
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to enable notifications." });
      }
    }
    setActionLoading(false);
  };

  const handleTest = async (type: "general" | "24h" | "1h") => {
    setActionLoading(true);
    setFeedback(null);

    let res: { success: boolean; message?: string; error?: string };
    if (type === "general") {
      res = await sendTestNotification();
    } else {
      res = await sendTestAppointmentReminder(type);
    }

    if (res.success) {
      setFeedback({
        type: "success",
        message: res.message || "Test push alert dispatched! Check your desktop/lock screen.",
      });
    } else {
      setFeedback({
        type: "error",
        message: res.error || "Failed to dispatch test notification.",
      });
    }
    setActionLoading(false);
  };

  const isBlocked = permission === "denied";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-teal-100 overflow-hidden flex flex-col my-auto max-h-[calc(100vh-2rem)]">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-teal-700 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            aria-label="Close notification settings"
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-inner">
              <BellRing className="text-teal-200" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-display text-white">Push Notifications</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/30 text-teal-100 border border-teal-400/30">
                  Web Push & PWA
                </span>
              </div>
              <p className="text-xs text-teal-100/90 mt-0.5">
                Real-time alerts for appointments and instant messages
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Status Box */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isSubscribed
                ? "bg-emerald-50/70 border-emerald-200"
                : isBlocked
                ? "bg-rose-50/70 border-rose-200"
                : "bg-amber-50/70 border-amber-200"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isSubscribed
                      ? "bg-emerald-600 text-white"
                      : isBlocked
                      ? "bg-rose-600 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {isSubscribed ? (
                    <Bell size={20} />
                  ) : isBlocked ? (
                    <BellOff size={20} />
                  ) : (
                    <Bell size={20} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-800">
                      {isSubscribed
                        ? "Push Notifications Active"
                        : isBlocked
                        ? "Notifications Blocked"
                        : "Notifications Disabled"}
                    </h4>
                    {isSubscribed && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {isSubscribed
                      ? `Registered on this ${
                          deviceType.includes("mobile") || deviceType.includes("ios")
                            ? "Mobile PWA"
                            : "Desktop Browser"
                        }`
                      : isBlocked
                      ? "Notifications are blocked in your browser settings. Unblock to receive alerts."
                      : !isSupported
                      ? "Push notifications are not supported by this browser/device."
                      : "Enable notifications to receive timely care reminders."}
                  </p>
                </div>
              </div>

              {!isBlocked && (
                <button
                  onClick={handleToggle}
                  disabled={actionLoading || loading || !isSupported}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 ${
                    !isSupported
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : isSubscribed
                      ? "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                      : "bg-teal-600 text-white hover:bg-teal-700"
                  }`}
                >
                  {actionLoading ? "Processing..." : isSubscribed ? "Disable" : !isSupported ? "Unsupported" : "Enable Now"}
                </button>
              )}
            </div>

            {/* Device Info Tag */}
            <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                {deviceType.includes("mobile") || isIOS ? (
                  <Smartphone size={13} className="text-teal-600" />
                ) : (
                  <Laptop size={13} className="text-teal-600" />
                )}
                Device: <strong className="text-slate-700 capitalize">{deviceType.replace("-", " ")}</strong>
              </span>
              <span>
                PWA Mode: <strong className="text-slate-700">{isStandalone ? "Installed App" : "Browser"}</strong>
              </span>
            </div>
          </div>

          {/* Feedback Alert */}
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-fadeIn ${
                feedback.type === "success"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-rose-100 text-rose-800 border border-rose-300"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle size={16} className="shrink-0 text-rose-600" />
              )}
              <span className="font-medium">{feedback.message}</span>
            </div>
          )}

          {/* iOS Safari Special Guidance */}
          {isIOS && !isStandalone && (
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs text-sky-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sky-800">
                <Share size={15} />
                <span>Notice for iPhone & iPad Safari Users</span>
              </div>
              <p className="leading-relaxed text-sky-700">
                Apple requires web apps to be installed to the Home Screen to receive Web Push notifications.
              </p>
              <div className="flex items-center gap-3 pt-1 text-[11px] font-semibold text-sky-800">
                <span className="flex items-center gap-1">
                  1. Tap <strong>Share</strong> <Share size={12} />
                </span>
                <span>→</span>
                <span className="flex items-center gap-1">
                  2. <strong>Add to Home Screen</strong> <PlusSquare size={12} />
                </span>
                <span>→</span>
                <span>3. Open from Home Screen</span>
              </div>
            </div>
          )}

          {/* Notification Triggers Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Configured Automated Alerts
            </h4>

            <div className="grid grid-cols-1 gap-2.5">
              {/* 24-Hour Reminder */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex items-start gap-3">
                <div className="p-2 bg-teal-100 text-teal-700 rounded-lg shrink-0">
                  <Calendar size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">24 Hours Before Appointment</span>
                    <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      Day Prior
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Pushes a reminder 24 hours in advance with the visit time, doctor, and treatment details.
                  </p>
                </div>
              </div>

              {/* 1-Hour Reminder */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex items-start gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
                  <Clock size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">1 Hour Before Appointment</span>
                    <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                      Urgent Alert
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Pushes an immediate countdown reminder 1 hour prior so you are fully prepared for the session.
                  </p>
                </div>
              </div>

              {/* Chat Message Alert */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex items-start gap-3">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-lg shrink-0">
                  <MessageSquare size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">Real-Time Chat Messages</span>
                    <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                      Instant
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Triggers a push notification whenever the other user (patient or doctor) messages you in chat.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Instant Testing Center */}
          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles size={13} className="text-teal-600" />
                Live Notification Testing
              </h4>
              <span className="text-[10px] text-slate-400">Verify your device</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => handleTest("general")}
                disabled={actionLoading || !isSubscribed}
                className="bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-semibold text-[11px] py-2 px-2.5 rounded-xl transition-colors border border-slate-200 text-center"
              >
                🔔 Test Push
              </button>
              <button
                onClick={() => handleTest("24h")}
                disabled={actionLoading || !isSubscribed}
                className="bg-teal-50 hover:bg-teal-100 disabled:opacity-50 text-teal-800 font-semibold text-[11px] py-2 px-2.5 rounded-xl transition-colors border border-teal-200 text-center"
              >
                📅 Test 24h Alert
              </button>
              <button
                onClick={() => handleTest("1h")}
                disabled={actionLoading || !isSubscribed}
                className="bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 text-indigo-800 font-semibold text-[11px] py-2 px-2.5 rounded-xl transition-colors border border-indigo-200 text-center"
              >
                ⏰ Test 1h Alert
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400">Apex Integrated Oncology</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
