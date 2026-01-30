import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workshopId } = await params;
  const body = await request.json();
  const { title, description, name, email, departmentId, minutes = 5 } = body;

  if (!title || !name || !email || !departmentId) {
    return NextResponse.json(
      { error: "Title, name, email, and department are required" },
      { status: 400 }
    );
  }

  const department = await prisma.department.findUnique({
    where: { id: departmentId },
  });
  if (!department) {
    return NextResponse.json(
      { error: "Invalid department" },
      { status: 400 }
    );
  }

  if (minutes < 1) {
    return NextResponse.json(
      { error: "Minutes must be at least 1" },
      { status: 400 }
    );
  }

  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
    include: { presentations: true },
  });

  if (!workshop) {
    return NextResponse.json({ error: "Workshop not found" }, { status: 404 });
  }

  const totalMinutes = workshop.presentations.reduce(
    (sum, p) => sum + p.minutes,
    0
  );
  if (totalMinutes + minutes > workshop.maxMinutes) {
    return NextResponse.json(
      { error: "Not enough time remaining in this workshop" },
      { status: 409 }
    );
  }

  const existing = workshop.presentations.find((p) => p.email === email);
  if (existing) {
    return NextResponse.json(
      { error: "You are already signed up for this workshop" },
      { status: 409 }
    );
  }

  const presentation = await prisma.presentation.create({
    data: { title, description, name, email, departmentId, minutes, workshopId },
  });

  return NextResponse.json(presentation, { status: 201 });
}
