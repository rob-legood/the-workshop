import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  {
    params,
  }: { params: Promise<{ id: string; presentationId: string }> }
) {
  const { id: workshopId, presentationId } = await params;

  const presentation = await prisma.presentation.findFirst({
    where: { id: presentationId, workshopId },
    include: { feedbacks: { orderBy: { createdAt: "desc" } } },
  });

  if (!presentation) {
    return NextResponse.json(
      { error: "Presentation not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(presentation.feedbacks);
}

export async function POST(
  request: Request,
  {
    params,
  }: { params: Promise<{ id: string; presentationId: string }> }
) {
  const { id: workshopId, presentationId } = await params;
  const body = await request.json();
  const { name, text } = body;

  if (!name || !text) {
    return NextResponse.json(
      { error: "Name and text are required" },
      { status: 400 }
    );
  }

  const presentation = await prisma.presentation.findFirst({
    where: { id: presentationId, workshopId },
  });

  if (!presentation) {
    return NextResponse.json(
      { error: "Presentation not found" },
      { status: 404 }
    );
  }

  // Get the "New" status for default assignment
  const newStatus = await prisma.feedbackStatus.findUnique({
    where: { name: "New" },
  });

  if (!newStatus) {
    return NextResponse.json(
      { error: "Feedback status not configured" },
      { status: 500 }
    );
  }

  const feedback = await prisma.feedback.create({
    data: { name, text, presentationId, statusId: newStatus.id },
  });

  return NextResponse.json(feedback, { status: 201 });
}
