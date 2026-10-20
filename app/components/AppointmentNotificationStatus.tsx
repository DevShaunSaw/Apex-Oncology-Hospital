"use client";

import { useState } from "react";
import { usePushNotifications } from "@/lib/usePushNotifications";
import { Bell, Calendar, Clock, CheckCircle2, AlertCircle, Smartphone, Laptop, Sparkles } from "lucide-react";

export default function AppointmentNotificationStatus() {
  const {
    isSupported,
    permission,
    isSubscribed,
    loading,
    deviceType,
    isStandalone,
    subscribeToPush,
    sendTestAppointmentReminder,
  } = usePushNotifications();

  const [testLoading, setTestLoading] = useState(false);
  const [testFeedback, setTestFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleTest = async (type: "24h" | "1h") => {
    setTestLoading(true);
    setTestFeedback(null);
    const res = await sendTestAppointmentReminder(type);
    if (res.success) {
      setTestFeedback({
        type: "success",
        message: `${type === "24h" ? "24-Hour" : "1-Hour"} reminder push alert dispatched! Check your desktop / device lock screen.`,
      });
    } else {
      setTestFeedback({
        type: "error",
        message: res.error || "Failed to trigger reminder alert.",
      });
    }
    setTestLoading(false);
    setTimeout(() => {
      setTestFeedback(null);
    }, 6000);
  };

  const handleSubscribe = async () => {
    setTestLoading(true);
    const res = await subscribeToPush();
    if (res.success) {
      setTestFeedback({
        type: "success",
        message: "Push notifications enabled! You will receive 24h and 1h appointment alerts.",
      });
    } else {
      setTestFeedback({
        type: "error",
        message: res.error || "Failed to enable notifications.",
      });
    }
    setTestLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-teal-900/90 via-slate-900 to-teal-950 text-white rounded-2xl p-5 shadow-xl border border-teal-500/30 overflow-hidden relative mb-6">
      <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 rounded-full bg-teal-500/10 blur-2xl pointer-events-none"></div>

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Information */}
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-teal-600/30 border border-teal-400/30 flex items-center justify-center shrink-0 shadow-inner">
            <Bell className="text-teal-300" size={22} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-sm text-white">Automated Push Reminders Active</h3>
              <span className="text-[10px] font-semibold bg-teal-500/20 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-400/30 flex items-center gap-1">
                <Sparkles size={11} /> 24h & 1h Alerts
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              Our automated system pushes alerts <strong>24 hours</strong> and <strong>1 hour</strong> prior to your scheduled appointments on desktop browsers and installed mobile PWAs.
            </p>

            {/* Device & Status Indicator */}
            <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                {deviceType.includes("mobile") ? <Smartphone size={13} className="text-teal-400" /> : <Laptop size={13} className="text-teal-400" />}
                Device: <strong className="text-slate-200 capitalize">{deviceType.replace("-", " ")}</strong>
                <span className="text-slate-500">({isStandalone ? "Installed PWA" : "Browser"})</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                Status:
                {isSubscribed ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Subscribed on this device
                  </span>
                ) : !isSupported ? (
                  <span className="text-rose-400 font-semibold">Browser unsupported</span>
                ) : (
                  <span className="text-amber-400 font-semibold">Not enabled yet</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions & Testing */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          {!isSubscribed ? (
            permission === "denied" ? (
              <span className="text-[11px] bg-rose-500/20 text-rose-300 border border-rose-400/30 px-3 py-2 rounded-xl text-center">
                Notifications blocked in browser. Allow in site settings.
              </span>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={testLoading || loading}
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Bell size={14} />
                Enable Push Alerts
              </button>
            )
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTest("24h")}
                disabled={testLoading}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-3 py-2 rounded-xl border border-white/10 transition-colors flex items-center gap-1.5"
                title="Send test 24-hour reminder push"
              >
                <Calendar size={13} className="text-teal-300" />
                Test 24h Alert
              </button>
              <button
                onClick={() => handleTest("1h")}
                disabled={testLoading}
                className="bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs px-3 py-2 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                title="Send test 1-hour reminder push"
              >
                <Clock size={13} className="text-white" />
                Test 1h Alert
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Test Feedback Notice */}
      {testFeedback && (
        <div
          className={`mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 border animate-fadeIn ${
            testFeedback.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/80 border-rose-500/40 text-rose-200"
          }`}
        >
          {testFeedback.type === "success" ? (
            <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle size={15} className="shrink-0 text-rose-400" />
          )}
          <span>{testFeedback.message}</span>
        </div>
      )}
    </div>
  );
}
