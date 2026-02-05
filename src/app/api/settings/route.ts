import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (key) {
    const setting = await prisma.setting.findUnique({
      where: { key },
    });
    return NextResponse.json(setting ?? { key, value: null });
  }

  const settings = await prisma.setting.findMany();
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { key, value } = body;

  if (!key || value === undefined) {
    return NextResponse.json(
      { error: "Key and value are required" },
      { status: 400 }
    );
  }

  const setting = await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  return NextResponse.json(setting);
}
