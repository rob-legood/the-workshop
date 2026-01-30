import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const workshops = await prisma.workshop.findMany({
    include: { presentations: { include: { department: true } } },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(workshops);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { chair, date, maxMinutes } = body;

  if (!chair || !date) {
    return NextResponse.json(
      { error: "Chair and date are required" },
      { status: 400 }
    );
  }

  const workshop = await prisma.workshop.create({
    data: {
      chair,
      date: new Date(date),
      maxMinutes: maxMinutes ?? 35,
    },
  });

  return NextResponse.json(workshop, { status: 201 });
}
