import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { statusId } = body;

  if (!statusId) {
    return NextResponse.json(
      { error: "statusId is required" },
      { status: 400 }
    );
  }

  const status = await prisma.feedbackStatus.findUnique({
    where: { id: statusId },
  });

  if (!status) {
    return NextResponse.json(
      { error: "Invalid status" },
      { status: 400 }
    );
  }

  const feedback = await prisma.feedback.update({
    where: { id },
    data: { statusId },
    include: { status: true },
  });

  return NextResponse.json(feedback);
}
