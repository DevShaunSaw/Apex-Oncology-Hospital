/**
 * Date and Time utilities for Indian Standard Time (IST)
 * Timezone: Asia/Kolkata (UTC +05:30)
 */

export const IST_TIMEZONE = "Asia/Kolkata";

/**
 * Format a Date object, ISO string, or timestamp into IST Date & Time.
 * Example: "Oct 26, 2026, 01:39 PM IST"
 */
export function formatToISTDateTime(date: Date | string | number = new Date()): string {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    if (!d || isNaN(d.getTime())) {
        return typeof date === "string" ? date : "";
    }

    const formatted = d.toLocaleString("en-US", {
        timeZone: IST_TIMEZONE,
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    return `${formatted} IST`;
}

/**
 * Format a Date object, ISO string, or timestamp into IST Date only.
 * Example: "Oct 26, 2026"
 */
export function formatToISTDate(date: Date | string | number = new Date()): string {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    if (!d || isNaN(d.getTime())) {
        return typeof date === "string" ? date : "";
    }

    return d.toLocaleDateString("en-US", {
        timeZone: IST_TIMEZONE,
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

/**
 * Format a Date object, ISO string, or timestamp into IST Time only.
 * Example: "01:39 PM IST"
 */
export function formatToISTTime(date: Date | string | number = new Date()): string {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    if (!d || isNaN(d.getTime())) {
        return typeof date === "string" ? date : "";
    }

    return (
        d.toLocaleTimeString("en-US", {
            timeZone: IST_TIMEZONE,
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }) + " IST"
    );
}

/**
 * Normalizes a vitals timestamp into IST.
 * If updatedAt (Date) is provided, it calculates the exact IST string.
 * If only lastUpdated string is provided:
 *  - If it already has "IST", returns as is.
 *  - If it's an ISO or parseable date string, parses it and returns the IST string.
 *  - Otherwise returns the original string.
 */
export function formatVitalsTimestamp(
    lastUpdated?: string | null,
    updatedAt?: Date | string | null
): string {
    if (updatedAt) {
        const d = new Date(updatedAt);
        if (!isNaN(d.getTime())) {
            return formatToISTDateTime(d);
        }
    }

    if (!lastUpdated) return "";

    if (typeof lastUpdated === "string") {
        if (lastUpdated.includes("IST")) {
            return lastUpdated;
        }

        // Try parsing string as date
        const parsed = new Date(lastUpdated);
        if (!isNaN(parsed.getTime())) {
            return formatToISTDateTime(parsed);
        }

        // If string matches format like "Oct 26, 2026, 08:03 AM", it might be an older UTC string
        return `${lastUpdated} (IST)`;
    }

    return String(lastUpdated);
}
