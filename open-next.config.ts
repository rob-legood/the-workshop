import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No incremental cache configured: every page is either static or
// fetches its data client-side, so there is no ISR to cache.
export default defineCloudflareConfig({});
