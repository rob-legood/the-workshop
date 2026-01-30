import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const slots = await prisma.slot.findMany({
    include: { signups: true },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(slots);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, description, date, maxAttendees } = body;

  if (!title || !description || !date) {
    return NextResponse.json(
      { error: "Title, description, and date are required" },
      { status: 400 }
    );
  }

  const slot = await prisma.slot.create({
    data: {
      title,
      description,
      date: new Date(date),
      maxAttendees: maxAttendees ?? 20,
    },
  });

  return NextResponse.json(slot, { status: 201 });
}
