import { NextResponse } from "next/server";
import { getDb } from "@/lib/prisma";

export async function GET() {
  const prisma = await getDb();
  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(departments);
}
