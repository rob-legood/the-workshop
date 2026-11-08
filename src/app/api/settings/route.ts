import { NextResponse } from "next/server";
import { getDb } from "@/lib/prisma";
import {
  ValidationError,
  integer,
  readJson,
  writeRoute,
} from "@/lib/validation";

export async function GET(request: Request) {
  const prisma = await getDb();
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

// Only these keys can be written through the API (each with its own check).
const WRITABLE_SETTINGS: Record<string, (value: unknown) => string> = {
  metricsYear: (value) =>
    String(integer(value, "Metrics year", { min: 2000, max: 2100 })),
};

export const POST = writeRoute(async (request: Request) => {
  const prisma = await getDb();
  const body = await readJson(request);
  const key = typeof body.key === "string" ? body.key : "";
  const parse = WRITABLE_SETTINGS[key];

  if (!Object.hasOwn(WRITABLE_SETTINGS, key)) {
    throw new ValidationError("Unknown setting");
  }
  const value = parse(body.value);

  const setting = await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  return NextResponse.json(setting);
});
