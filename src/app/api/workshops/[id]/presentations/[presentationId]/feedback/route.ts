import { NextResponse } from "next/server";
import { getDb } from "@/lib/prisma";
import { LIMITS, readJson, text, writeRoute } from "@/lib/validation";

export async function GET(
  _request: Request,
  {
    params,
  }: { params: Promise<{ id: string; presentationId: string }> }
) {
  const prisma = await getDb();
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

export const POST = writeRoute(async (
  request: Request,
  {
    params,
  }: { params: Promise<{ id: string; presentationId: string }> }
) => {
  const prisma = await getDb();
  const { id: workshopId, presentationId } = await params;
  const body = await readJson(request);
  const name = text(body.name, "Name", LIMITS.name);
  const feedbackText = text(body.text, "Feedback", LIMITS.feedbackText);

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
    data: { name, text: feedbackText, presentationId, statusId: newStatus.id },
  });

  return NextResponse.json(feedback, { status: 201 });
});
