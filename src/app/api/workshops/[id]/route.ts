import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { chair, date, maxMinutes } = body;

  if (!chair || !date) {
    return NextResponse.json(
      { error: "Chair and date are required" },
      { status: 400 }
    );
  }

  const workshop = await prisma.workshop.findUnique({
    where: { id },
    include: { presentations: true },
  });

  if (!workshop) {
    return NextResponse.json({ error: "Workshop not found" }, { status: 404 });
  }

  const totalMinutes = workshop.presentations.reduce(
    (sum, p) => sum + p.minutes,
    0
  );

  if (maxMinutes < totalMinutes) {
    return NextResponse.json(
      {
        error: `Max minutes cannot be less than the ${totalMinutes} minutes already allocated`,
      },
      { status: 409 }
    );
  }

  const updated = await prisma.workshop.update({
    where: { id },
    data: {
      chair,
      date: new Date(date),
      maxMinutes: maxMinutes ?? 35,
    },
  });

  return NextResponse.json(updated);
}
