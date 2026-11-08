import type { PrismaClient } from "../generated/prisma/client";
import { DEMO_MARKER_KEY, seedDemoData } from "./demo-seed";

// When DEMO_MODE=true, the database is wiped and reseeded on the first
// request of each new day (in DEMO_TIMEZONE), so demo visitors can play
// freely without the data accumulating junk.
//
// D1 has no transactions, so the marker row doubles as a lock: whichever
// request atomically flips it to today's date performs the reset.

// Per-isolate cache so most requests skip the database check entirely.
let checkedDate: string | null = null;

function today(timeZone: string) {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Atomically claims today's reset. Returns the previous marker, or false if already claimed. */
async function claimReset(db: PrismaClient, date: string) {
  const marker = await db.setting.findUnique({
    where: { key: DEMO_MARKER_KEY },
  });

  if (!marker) {
    try {
      await db.setting.create({ data: { key: DEMO_MARKER_KEY, value: date } });
      return { previous: null };
    } catch {
      return false; // Another request created it first
    }
  }

  if (marker.value === date) return false;

  const { count } = await db.setting.updateMany({
    where: { key: DEMO_MARKER_KEY, value: marker.value },
    data: { value: date },
  });
  return count === 1 ? { previous: marker.value } : false;
}

export async function ensureDailyDemoReset(
  db: PrismaClient,
  timeZone = "America/Toronto"
) {
  const date = today(timeZone);
  if (checkedDate === date) return;

  const claim = await claimReset(db, date);
  if (claim) {
    try {
      await seedDemoData(db);
      console.log(`[demo] Database reset for ${date}`);
    } catch (e) {
      // Release the claim so the next request retries the reset.
      await db.setting.updateMany({
        where: { key: DEMO_MARKER_KEY },
        data: { value: claim.previous ?? "" },
      });
      throw e;
    }
  }

  checkedDate = date;
}
