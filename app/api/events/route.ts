import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Event from "@/models/Event";
import { events as mockEvents } from "@/app/data/mockData";

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        // 1. Seed events if collection is empty
        const count = await Event.countDocuments();
        if (count === 0) {
            console.log("[SEED] No events found in database. Seeding mock events/seminars...");
            const eventsToSeed = mockEvents.map(e => {
                const { id, ...eventData } = e;
                return eventData;
            });
            await Event.insertMany(eventsToSeed);
            console.log("[SEED] Mock events seeded successfully.");
        }

        // 2. Fetch events
        const eventsList = await Event.find().sort({ createdAt: -1 });
        
        // Map to format containing standard 'id' field
        const formattedEvents = eventsList.map(e => {
            const obj = e.toObject();
            obj.id = obj._id.toString();
            return obj;
        });

        return NextResponse.json({ success: true, events: formattedEvents });
    } catch (err: any) {
        console.error("[EVENTS GET]", err);
        return NextResponse.json({ success: false, error: err.message || "Server error." }, { status: 500 });
    }
}

// POST /api/events — create a new event
export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const body = await req.json();
        const { title, type, date, time, speaker, seats, registered, mode, location } = body;

        if (!title || !type || !date || !time || !speaker || !mode || !location) {
            return NextResponse.json(
                { success: false, error: "All required fields must be provided." },
                { status: 400 }
            );
        }

        const event = await Event.create({
            title,
            type,
            date,
            time,
            speaker,
            seats: seats || 100,
            registered: registered || 0,
            mode,
            location,
        });

        const obj = event.toObject();
        obj.id = obj._id.toString();

        return NextResponse.json({ success: true, event: obj }, { status: 201 });
    } catch (err: any) {
        console.error("[EVENTS POST]", err);
        return NextResponse.json(
            { success: false, error: err.message || "Server error." },
            { status: 500 }
        );
    }
}

// PATCH /api/events — update an existing event
export async function PATCH(req: NextRequest) {
    try {
        await connectToDatabase();

        const body = await req.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Event ID is required." },
                { status: 400 }
            );
        }

        const event = await Event.findByIdAndUpdate(id, updates, { new: true });
        if (!event) {
            return NextResponse.json(
                { success: false, error: "Event not found." },
                { status: 404 }
            );
        }

        const obj = event.toObject();
        obj.id = obj._id.toString();

        return NextResponse.json({ success: true, event: obj });
    } catch (err: any) {
        console.error("[EVENTS PATCH]", err);
        return NextResponse.json(
            { success: false, error: err.message || "Server error." },
            { status: 500 }
        );
    }
}

// DELETE /api/events — remove an event
export async function DELETE(req: NextRequest) {
    try {
        await connectToDatabase();

        const id = req.nextUrl.searchParams.get("id");
        if (!id) {
            return NextResponse.json(
                { success: false, error: "Event ID is required." },
                { status: 400 }
            );
        }

        const event = await Event.findByIdAndDelete(id);
        if (!event) {
            return NextResponse.json(
                { success: false, error: "Event not found." },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: "Event deleted successfully." });
    } catch (err: any) {
        console.error("[EVENTS DELETE]", err);
        return NextResponse.json(
            { success: false, error: err.message || "Server error." },
            { status: 500 }
        );
    }
}

