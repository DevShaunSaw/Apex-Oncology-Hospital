"use client";

import { useState, useEffect, useCallback } from "react";

export function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function checkSupport(): boolean {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

function checkPermission(): NotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window)) return "default";
  return Notification.permission;
}

function checkIsIOS(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function checkIsStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function getDeviceTypeString(): string {
  if (typeof window === "undefined") return "desktop-browser";
  const ios = checkIsIOS();
  const standalone = checkIsStandalone();
  const ua = navigator.userAgent;

  if (standalone) {
    return ios ? "ios-pwa" : "mobile-pwa";
  }
  if (ios) {
    return "ios-safari";
  }
  if (/Android/i.test(ua)) {
    return "android-browser";
  }
  return "desktop-browser";
}

export function usePushNotifications() {
  const [isSupported] = useState<boolean>(() => checkSupport());
  const [permission, setPermission] = useState<NotificationPermission>(() => checkPermission());
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isIOS] = useState<boolean>(() => checkIsIOS());
  const [isStandalone] = useState<boolean>(() => checkIsStandalone());
  const [deviceType] = useState<string>(() => getDeviceTypeString());

  // Sync with service worker and server on mount
  useEffect(() => {
    const verifySubscription = async () => {
      try {
        if (!checkSupport()) {
          setLoading(false);
          return;
        }

        // Ensure service worker is actively registering
        if ("serviceWorker" in navigator) {
          try {
            await navigator.serviceWorker.register("/sw.js");
          } catch (e) {
            console.warn("[usePushNotifications] Direct SW register note:", e);
          }
        }

        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();

        if (sub) {
          setIsSubscribed(true);
        } else {
          const res = await fetch("/api/notifications/subscribe");
          const data = await res.json();
          setIsSubscribed(Boolean(data.hasActiveSubscription));
        }
      } catch (err) {
        console.error("[usePushNotifications] Verification failed:", err);
      } finally {
        setLoading(false);
      }
    };

    void verifySubscription();
  }, []);

  // Subscribe current device
  const subscribeToPush = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!isSupported) {
        if (isIOS && !isStandalone) {
          return {
            success: false,
            error: "On iPhone/iPad, please add Apex to your Home Screen first to enable push notifications.",
          };
        }
        return {
          success: false,
          error: "Push notifications are not supported on this browser.",
        };
      }

      setLoading(true);

      // 1. Request Notification permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        setLoading(false);
        return {
          success: false,
          error: "Notification permission was denied. Please allow notifications in browser site settings.",
        };
      }

      // 2. Fetch VAPID public key
      const keyRes = await fetch("/api/notifications/vapid-key");
      const { publicKey } = await keyRes.json();
      if (!publicKey) {
        setLoading(false);
        return { success: false, error: "Failed to retrieve VAPID public key." };
      }

      // 3. Ensure service worker is registered and ready
      if ("serviceWorker" in navigator) {
        try {
          await navigator.serviceWorker.register("/sw.js");
        } catch (e) {
          console.warn("[usePushNotifications] SW registration in subscribe note:", e);
        }
      }
      const reg = await navigator.serviceWorker.ready;

      // 4. Check or create subscription
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      // 5. Send to backend
      const saveRes = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          deviceType,
          userAgent: navigator.userAgent,
        }),
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok || !saveData.success) {
        setLoading(false);
        return { success: false, error: saveData.error || "Failed to save push subscription." };
      }

      setIsSubscribed(true);
      setLoading(false);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to subscribe.";
      console.error("[usePushNotifications] Subscription error:", err);
      setLoading(false);
      return { success: false, error: msg };
    }
  }, [isSupported, isIOS, isStandalone, deviceType]);

  // Unsubscribe current device
  const unsubscribeFromPush = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          const endpoint = sub.endpoint;
          await sub.unsubscribe();
          await fetch("/api/notifications/unsubscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint }),
          });
        } else {
          await fetch("/api/notifications/unsubscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });
        }
      }
      setIsSubscribed(false);
      setLoading(false);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to unsubscribe.";
      console.error("[usePushNotifications] Unsubscribe error:", err);
      setLoading(false);
      return { success: false, error: msg };
    }
  }, []);

  // Send a test push notification
  const sendTestNotification = useCallback(async (): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const res = await fetch("/api/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Apex Oncology Notifications",
          body: "Push notification system is active! You will receive 24h & 1h appointment alerts and real-time chat messages.",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error || "Failed to send test push notification." };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Test notification request failed.";
      return { success: false, error: msg };
    }
  }, []);

  // Send simulated 24h or 1h appointment reminder
  const sendTestAppointmentReminder = useCallback(
    async (reminderType: "24h" | "1h"): Promise<{ success: boolean; message?: string; error?: string }> => {
      try {
        const res = await fetch("/api/notifications/test-appointment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reminderType }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          return { success: true, message: data.message };
        } else {
          return { success: false, error: data.error || "Failed to send appointment reminder test." };
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Appointment reminder test failed.";
        return { success: false, error: msg };
      }
    },
    []
  );

  return {
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
  };
}
