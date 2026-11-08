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

export async function GET() {
  const prisma = await getDb();
  const workshops = await prisma.workshop.findMany({
    include: { presentations: { include: { department: true } } },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(workshops);
}

export const POST = writeRoute(async (request: Request) => {
  const prisma = await getDb();
  const body = await readJson(request);

  const workshop = await prisma.workshop.create({
    data: {
      chair: text(body.chair, "Chair", LIMITS.chair),
      date: date(body.date, "Date"),
      maxMinutes: integer(body.maxMinutes ?? 35, "Max minutes", MAX_MINUTES),
    },
  });

  return NextResponse.json(workshop, { status: 201 });
});
