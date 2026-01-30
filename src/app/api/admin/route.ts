import { NextResponse } from "next/server";

const ADMIN_PIN = process.env.ADMIN_PIN || "1234";

export async function POST(request: Request) {
  const body = await request.json();
  const { pin } = body;

  if (pin === ADMIN_PIN) {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json(
    { authenticated: false, error: "Invalid PIN" },
    { status: 401 }
  );
}
