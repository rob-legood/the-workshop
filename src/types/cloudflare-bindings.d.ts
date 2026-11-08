// Minimal ambient types for the Cloudflare bindings referenced by the
// generated cloudflare-env.d.ts. The full Workers runtime types
// (@cloudflare/workers-types) are deliberately not used: they replace DOM
// types such as Response.json() project-wide and break the client pages.

// The exact D1Database type the Prisma D1 adapter expects.
type D1Database = Extract<
  ConstructorParameters<typeof import("@prisma/adapter-d1").PrismaD1>[0],
  { prepare: unknown }
>;

interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}
