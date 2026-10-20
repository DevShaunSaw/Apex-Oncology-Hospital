import { NextResponse } from "next/server";

export async function GET() {
  const publicKey =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    "BK5dmtBk6BfNBqhiczv3F9OV2YkqKasRV64Uj7IATjLFfq2DUhfdEITy2lOhQpWLlem-Jz0rST5lTwOoQo9hQLk";

  return NextResponse.json({ publicKey });
}
