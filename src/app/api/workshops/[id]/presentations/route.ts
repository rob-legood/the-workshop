import { NextResponse } from "next/server";
import { getDb } from "@/lib/prisma";
import { readJson, writeRoute } from "@/lib/validation";
import { parsePresentation } from "@/lib/presentation-input";

export const POST = writeRoute(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const prisma = await getDb();
    const { id: workshopId } = await params;
    const input = parsePresentation(await readJson(request));

    const department = await prisma.department.findUnique({
      where: { id: input.departmentId },
    });
    if (!department) {
      return NextResponse.json({ error: "Invalid department" }, { status: 400 });
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
    if (totalMinutes + input.minutes > workshop.maxMinutes) {
      return NextResponse.json(
        { error: "Not enough time remaining in this workshop" },
        { status: 409 }
      );
    }

    const existing = workshop.presentations.find(
      (p) => p.email.toLowerCase() === input.email
    );
    if (existing) {
      return NextResponse.json(
        { error: "You are already signed up for this workshop" },
        { status: 409 }
      );
    }

    const presentation = await prisma.presentation.create({
      data: { ...input, workshopId },
    });

    return NextResponse.json(presentation, { status: 201 });
  }
);
