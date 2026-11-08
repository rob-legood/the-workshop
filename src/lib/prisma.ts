import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@/generated/prisma/client";
import { ensureDailyDemoReset } from "@/lib/demo-reset";

/**
 * Returns a Prisma client bound to the D1 database for the current request.
 *
 * Cloudflare Workers don't allow sharing a client across requests, so call
 * this once per route handler: `const prisma = await getDb();`
 */
export async function getDb() {
  const { env } = await getCloudflareContext({ async: true });
  const base = new PrismaClient({ adapter: new PrismaD1(env.DB) });
  const demoMode = env.DEMO_MODE === "true";

  // In demo mode, every query first makes sure today's reset has happened.
  return base.$extends({
    query: {
      async $allOperations({ args, query }) {
        if (demoMode) await ensureDailyDemoReset(base, env.DEMO_TIMEZONE);
        return query(args);
      },
    },
  });
}
