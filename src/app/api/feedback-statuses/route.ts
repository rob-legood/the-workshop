import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const statuses = await prisma.feedbackStatus.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(statuses);
}
