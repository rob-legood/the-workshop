import { NextResponse } from "next/server";
import { getDb } from "@/lib/prisma";

export async function GET(request: Request) {
  const prisma = await getDb();
  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get("year");

  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

  const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
  const now = new Date();
  const yearEnd = new Date(`${year + 1}-01-01T00:00:00.000Z`);
  const endDate = now < yearEnd ? now : yearEnd;

  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
  });

  const presentationCounts = await prisma.presentation.groupBy({
    by: ["departmentId"],
    _count: { id: true },
    where: {
      workshop: {
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
    },
  });

  const countMap = new Map(
    presentationCounts.map((p) => [p.departmentId, p._count.id])
  );

  const data = departments.map((dept) => ({
    department: dept.name,
    departmentId: dept.id,
    presentations: countMap.get(dept.id) || 0,
  }));

  return NextResponse.json({
    year,
    data,
    total: data.reduce((sum, d) => sum + d.presentations, 0),
  });
}
