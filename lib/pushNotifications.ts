import webpush from "web-push";
import { connectToDatabase } from "./mongodb";
import PushSubscription from "@/models/PushSubscription";
import Appointment from "@/models/Appointment";
import type { Types } from "mongoose";

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BK5dmtBk6BfNBqhiczv3F9OV2YkqKasRV64Uj7IATjLFfq2DUhfdEITy2lOhQpWLlem-Jz0rST5lTwOoQo9hQLk";

const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  "0b3tsl2kFDHzvZ7EvolqnEx6Blfr2uredIlnWQDBcKA";

const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || "mailto:support@apexonco.com";

// Configure web-push with VAPID credentials
try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (err) {
  console.error("[WebPush] Configuration error:", err);
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

export interface ReminderResult {
  appointmentId: string;
  type: "24h" | "1h";
  patient: string;
  doctor: string;
  time: string;
  date: string;
}

/**
 * Send a web push notification to all active devices registered for a user.
 * Automatically cleans up expired or invalidated subscriptions (HTTP 404/410).
 */
export async function sendPushNotificationToUser(
  userId: string | Types.ObjectId,
  payload: NotificationPayload
) {
  await connectToDatabase();

  const subscriptions = await PushSubscription.find({ user: userId });
  if (!subscriptions || subscriptions.length === 0) {
    return { success: true, sentCount: 0, removedCount: 0 };
  }

  const pushData = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || "/icons/icon-192x192.png",
    badge: payload.badge || "/icons/icon-192x192.png",
    image: payload.image,
    url: payload.url || "/",
    tag: payload.tag || "general",
    data: {
      url: payload.url || "/",
      ...payload.data,
    },
  });

  let sentCount = 0;
  let removedCount = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      const pushConfig = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
        },
      };

      try {
        await webpush.sendNotification(pushConfig, pushData, {
          TTL: 86400, // 24 hours
          urgency: "high",
        });
        sentCount++;
      } catch (err: unknown) {
        const status = (err as { statusCode?: number })?.statusCode;
        console.error(`[WebPush] Error sending to endpoint ${sub.endpoint}:`, status || err);
        // Clean up subscriptions that are no longer valid or unsubscribed by client
        if (status === 404 || status === 410) {
          await PushSubscription.findByIdAndDelete(sub._id);
          removedCount++;
        }
      }
    })
  );

  return { success: true, sentCount, removedCount };
}

/**
 * Helper to parse appointment date (YYYY-MM-DD) and time (e.g. "10:00 AM")
 * into a valid Date object in local time.
 */
export function parseAppointmentDateTime(dateStr: string, timeStr: string): Date | null {
  if (!dateStr || !timeStr) return null;
  try {
    const timeMatch = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!timeMatch) return null;

    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const period = timeMatch[3].toUpperCase();

    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    const dateParts = dateStr.trim().split("-").map(Number);
    if (dateParts.length !== 3) return null;

    const [year, month, day] = dateParts;
    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  } catch (err) {
    console.error("[WebPush] Date parse error:", err);
    return null;
  }
}

/**
 * Checks all confirmed appointments and sends:
 * 1) 24 hours before appointment reminder
 * 2) 1 hour before appointment reminder
 */
export async function checkAndSendAppointmentReminders() {
  await connectToDatabase();

  const now = new Date();
  const nowMs = now.getTime();

  // Find confirmed appointments that haven't sent both reminders
  const appointments = await Appointment.find({
    status: { $in: ["confirmed", "pending"] },
    $or: [{ reminded24h: { $ne: true } }, { reminded1h: { $ne: true } }],
  })
    .populate("patient", "name email")
    .populate("doctor", "name specialty");

  const results: ReminderResult[] = [];

  for (const appt of appointments) {
    const apptDate = parseAppointmentDateTime(appt.date, appt.time);
    if (!apptDate) continue;

    const apptMs = apptDate.getTime();
    const diffMs = apptMs - nowMs;
    const diffHours = diffMs / (1000 * 60 * 60);

    const patientName = appt.patient?.name || "Patient";
    const doctorName = appt.doctor?.name || "Doctor";
    const apptType = appt.type || "Appointment";
    const patientId = appt.patient?._id;
    const doctorId = appt.doctor?._id;

    // 1) 24-HOUR REMINDER:
    // When time to appointment is <= 24 hours and > 1 hour, and not yet reminded for 24h
    if (diffHours <= 24 && diffHours > 1 && !appt.reminded24h) {
      if (patientId) {
        await sendPushNotificationToUser(patientId, {
          title: "Upcoming Appointment in 24 Hours",
          body: `Reminder: You have a ${apptType} appointment with ${doctorName} tomorrow at ${appt.time}.`,
          url: "/appointments",
          tag: `appt-24h-${appt._id}`,
          data: { appointmentId: appt._id.toString() },
        });
      }

      if (doctorId) {
        await sendPushNotificationToUser(doctorId, {
          title: "Upcoming Patient Visit in 24 Hours",
          body: `Reminder: Scheduled ${apptType} with ${patientName} tomorrow at ${appt.time}.`,
          url: "/appointments",
          tag: `appt-24h-${appt._id}`,
          data: { appointmentId: appt._id.toString() },
        });
      }

      appt.reminded24h = true;
      appt.reminded24hAt = new Date();
      await appt.save();

      results.push({
        appointmentId: appt._id.toString(),
        type: "24h",
        patient: patientName,
        doctor: doctorName,
        time: appt.time,
        date: appt.date,
      });
    }

    // 2) 1-HOUR REMINDER:
    // When time to appointment is <= 1 hour and > 0, and not yet reminded for 1h
    if (diffHours <= 1 && diffHours > -0.25 && !appt.reminded1h) {
      if (patientId) {
        await sendPushNotificationToUser(patientId, {
          title: "Appointment Starting in 1 Hour ⏰",
          body: `Your ${apptType} appointment with ${doctorName} begins at ${appt.time}. Please be prepared.`,
          url: "/appointments",
          tag: `appt-1h-${appt._id}`,
          data: { appointmentId: appt._id.toString() },
        });
      }

      if (doctorId) {
        await sendPushNotificationToUser(doctorId, {
          title: "Patient Consultation in 1 Hour ⏰",
          body: `Your ${apptType} consultation with ${patientName} starts at ${appt.time}.`,
          url: "/appointments",
          tag: `appt-1h-${appt._id}`,
          data: { appointmentId: appt._id.toString() },
        });
      }

      appt.reminded1h = true;
      appt.reminded1hAt = new Date();
      await appt.save();

      results.push({
        appointmentId: appt._id.toString(),
        type: "1h",
        patient: patientName,
        doctor: doctorName,
        time: appt.time,
        date: appt.date,
      });
    }
  }

  return { checked: appointments.length, sentReminders: results };
}
