import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const showClosed = searchParams.get("showClosed") === "true";
  const departmentId = searchParams.get("departmentId");

  const skip = (page - 1) * limit;

  // Build where clause
  const where: Record<string, unknown> = {};

  // Filter by open status if not showing closed
  if (!showClosed) {
    const openStatuses = await prisma.feedbackStatus.findMany({
      where: { isClosed: false },
      select: { id: true },
    });
    where.statusId = { in: openStatuses.map((s) => s.id) };
  }

  // Filter by department if specified
  if (departmentId) {
    where.presentation = { departmentId };
  }

  const [feedbacks, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      include: {
        status: true,
        presentation: {
          include: {
            department: true,
            workshop: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.feedback.count({ where }),
  ]);

  return NextResponse.json({
    feedbacks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
