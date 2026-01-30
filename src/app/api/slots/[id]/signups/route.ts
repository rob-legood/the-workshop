import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: slotId } = await params;
  const body = await request.json();
  const { name, email, department } = body;

  if (!name || !email || !department) {
    return NextResponse.json(
      { error: "Name, email, and department are required" },
      { status: 400 }
    );
  }

  const slot = await prisma.slot.findUnique({
    where: { id: slotId },
    include: { signups: true },
  });

  if (!slot) {
    return NextResponse.json({ error: "Slot not found" }, { status: 404 });
  }

  if (slot.signups.length >= slot.maxAttendees) {
    return NextResponse.json({ error: "Slot is full" }, { status: 409 });
  }

  const existing = slot.signups.find(
    (s) => s.email === email
  );
  if (existing) {
    return NextResponse.json(
      { error: "You are already signed up for this slot" },
      { status: 409 }
    );
  }

  const signup = await prisma.signup.create({
    data: { name, email, department, slotId },
  });

  return NextResponse.json(signup, { status: 201 });
}
