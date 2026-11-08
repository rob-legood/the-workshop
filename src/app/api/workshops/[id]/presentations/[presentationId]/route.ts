import { NextResponse } from "next/server";
import { getDb } from "@/lib/prisma";
import { readJson, writeRoute } from "@/lib/validation";
import { parsePresentation } from "@/lib/presentation-input";

export const PUT = writeRoute(
  async (
    request: Request,
    { params }: { params: Promise<{ id: string; presentationId: string }> }
  ) => {
    const prisma = await getDb();
    const { id: workshopId, presentationId } = await params;
    const input = parsePresentation(await readJson(request));

    const dept = await prisma.department.findUnique({
      where: { id: input.departmentId },
    });
    if (!dept) {
      return NextResponse.json({ error: "Invalid department" }, { status: 400 });
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

    if (otherMinutes + input.minutes > workshop.maxMinutes) {
      return NextResponse.json(
        { error: "Not enough time remaining in this workshop" },
        { status: 409 }
      );
    }

    const duplicate = workshop.presentations.find(
      (p) => p.id !== presentationId && p.email.toLowerCase() === input.email
    );
    if (duplicate) {
      return NextResponse.json(
        { error: "That email is already signed up for this workshop" },
        { status: 409 }
      );
    }

    const updated = await prisma.presentation.update({
      where: { id: presentationId },
      data: input,
    });

    return NextResponse.json(updated);
  }
);
