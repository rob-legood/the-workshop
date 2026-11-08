import { NextResponse } from "next/server";
import { getDb } from "@/lib/prisma";
import {
  LIMITS,
  optionalText,
  readJson,
  writeRoute,
} from "@/lib/validation";

export const PATCH = writeRoute(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const prisma = await getDb();
    const { id } = await params;
    const body = await readJson(request);

    const updateData = {
      statusId: optionalText(body.statusId, "Status", LIMITS.id),
      name: optionalText(body.name, "Name", LIMITS.name),
      text: optionalText(body.text, "Feedback", LIMITS.feedbackText),
    };

    if (Object.values(updateData).every((v) => v === undefined)) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    if (updateData.statusId) {
      const status = await prisma.feedbackStatus.findUnique({
        where: { id: updateData.statusId },
      });
      if (!status) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
    }

    const existing = await prisma.feedback.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    const feedback = await prisma.feedback.update({
      where: { id },
      data: updateData,
      include: { status: true },
    });

    return NextResponse.json(feedback);
  }
);
