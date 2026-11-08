import { connection } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Shown on every page when DEMO_MODE=true. Reads env at request time (not
 * build time) so the flag and PIN can be set as Worker variables/secrets.
 */
export async function DemoBanner() {
  await connection();
  const { env } = await getCloudflareContext({ async: true });
  if (env.DEMO_MODE !== "true") return null;

  const pin = env.ADMIN_PIN || "1234";

  return (
    <div className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
      This is a demo site. All data resets daily, so please don&apos;t enter
      real names or email addresses. Try the{" "}
      <a href="/admin" className="font-medium underline underline-offset-2">
        admin dashboard
      </a>{" "}
      with PIN <span className="font-mono font-semibold">{pin}</span>.
    </div>
  );
}
