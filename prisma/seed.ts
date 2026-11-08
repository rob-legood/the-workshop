// Seeds the local D1 database (the one `npm run dev` uses) with demo data.
// The deployed demo seeds itself daily; see src/lib/demo-reset.ts.
import { getPlatformProxy } from "wrangler";
import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "../src/generated/prisma-node/client";
import { seedDemoData } from "../src/lib/demo-seed";

async function main() {
  const { env, dispose } = await getPlatformProxy<CloudflareEnv>();
  const prisma = new PrismaClient({ adapter: new PrismaD1(env.DB) });
  try {
    // The Node and Cloudflare builds of the client are identical apart from
    // their runtime, but TypeScript treats them as unrelated types.
    const counts = await seedDemoData(
      prisma as unknown as Parameters<typeof seedDemoData>[0]
    );
    console.log(
      `Seeded ${counts.teams} teams, ${counts.statuses} feedback statuses, ${counts.workshops} workshops, ${counts.presentations} presentations, and ${counts.feedback} feedbacks.`
    );
  } finally {
    await prisma.$disconnect();
    await dispose();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
