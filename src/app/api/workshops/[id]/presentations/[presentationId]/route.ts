import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  {
    params,
  }: { params: Promise<{ id: string; presentationId: string }> }
) {
  const { id: workshopId, presentationId } = await params;
  const body = await request.json();
  const { title, description, name, email, departmentId, minutes = 5 } = body;

  if (!title || !name || !email || !departmentId) {
    return NextResponse.json(
      { error: "Title, name, email, and department are required" },
      { status: 400 }
    );
  }

  const dept = await prisma.department.findUnique({
    where: { id: departmentId },
  });
  if (!dept) {
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

  const presentation = workshop.presentations.find(
    (p) => p.id === presentationId
  );
  if (!presentation) {
    return NextResponse.json(
      { error: "Presentation not found" },
      { status: 404 }
    );
  }

  const otherMinutes = workshop.presentations
    .filter((p) => p.id !== presentationId)
    .reduce((sum, p) => sum + p.minutes, 0);

  if (otherMinutes + minutes > workshop.maxMinutes) {
    return NextResponse.json(
      { error: "Not enough time remaining in this workshop" },
      { status: 409 }
    );
  }

  if (email !== presentation.email) {
    const duplicate = workshop.presentations.find(
      (p) => p.id !== presentationId && p.email === email
    );
    if (duplicate) {
      return NextResponse.json(
        { error: "That email is already signed up for this workshop" },
        { status: 409 }
      );
    }
  }

  const updated = await prisma.presentation.update({
    where: { id: presentationId },
    data: { title, description, name, email, departmentId, minutes },
  });

  return NextResponse.json(updated);
}
