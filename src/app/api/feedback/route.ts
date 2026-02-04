import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const showClosed = searchParams.get("showClosed") === "true";

  const skip = (page - 1) * limit;

  // Get open status IDs if filtering
  let statusFilter = {};
  if (!showClosed) {
    const openStatuses = await prisma.feedbackStatus.findMany({
      where: { isClosed: false },
      select: { id: true },
    });
    statusFilter = { statusId: { in: openStatuses.map((s) => s.id) } };
  }

  const [feedbacks, total] = await Promise.all([
    prisma.feedback.findMany({
      where: statusFilter,
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
    prisma.feedback.count({ where: statusFilter }),
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
