import { NextResponse } from "next/server";
import { getDb } from "@/lib/prisma";

export async function GET() {
  const prisma = await getDb();
  const statuses = await prisma.feedbackStatus.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(statuses);
}
