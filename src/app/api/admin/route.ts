import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { readJson, writeRoute } from "@/lib/validation";

// Rate-limited via writeRoute, which also slows PIN guessing.
export const POST = writeRoute(async (request: Request) => {
  const { env } = await getCloudflareContext({ async: true });
  const adminPin = env.ADMIN_PIN || "1234";
  const { pin } = await readJson(request);

  if (pin === adminPin) {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json(
    { authenticated: false, error: "Invalid PIN" },
    { status: 401 }
  );
});
