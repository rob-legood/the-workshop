import { NextResponse } from "next/server";
import { getDb } from "@/lib/prisma";
import {
  LIMITS,
  MAX_MINUTES,
  date,
  integer,
  readJson,
  text,
  writeRoute,
} from "@/lib/validation";

export const PUT = writeRoute(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const prisma = await getDb();
    const { id } = await params;
    const body = await readJson(request);
    const chair = text(body.chair, "Chair", LIMITS.chair);
    const workshopDate = date(body.date, "Date");
    const maxMinutes = integer(body.maxMinutes ?? 35, "Max minutes", MAX_MINUTES);

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
      data: { chair, date: workshopDate, maxMinutes },
    });

    return NextResponse.json(updated);
  }
);
