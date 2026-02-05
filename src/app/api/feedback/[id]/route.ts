import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { statusId, name, text } = body;

  // Build update data object with provided fields
  const updateData: { statusId?: string; name?: string; text?: string } = {};

  if (statusId) {
    const status = await prisma.feedbackStatus.findUnique({
      where: { id: statusId },
    });
    if (!status) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }
    updateData.statusId = statusId;
  }

  if (name !== undefined) {
    if (!name.trim()) {
      return NextResponse.json(
        { error: "Name cannot be empty" },
        { status: 400 }
      );
    }
    updateData.name = name.trim();
  }

  if (text !== undefined) {
    if (!text.trim()) {
      return NextResponse.json(
        { error: "Feedback text cannot be empty" },
        { status: 400 }
      );
    }
    updateData.text = text.trim();
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  const feedback = await prisma.feedback.update({
    where: { id },
    data: updateData,
    include: { status: true },
  });

  return NextResponse.json(feedback);
}
