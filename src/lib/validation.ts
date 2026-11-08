import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { LIMITS } from "@/lib/limits";

export { LIMITS, MINUTES, MAX_MINUTES } from "@/lib/limits";

export class ValidationError extends Error {}

/**
 * Wraps a route handler that writes data:
 * - rate-limits per visitor IP (Cloudflare WRITE_LIMITER binding), and
 * - turns a thrown ValidationError into a 400 response.
 */
export function writeRoute<Args extends [Request, ...unknown[]]>(
  handler: (...args: Args) => Promise<Response>
) {
  return async (...args: Args): Promise<Response> => {
    if (!(await withinRateLimit(args[0]))) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute and try again." },
        { status: 429 }
      );
    }
    try {
      return await handler(...args);
    } catch (e) {
      if (e instanceof ValidationError) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
      throw e;
    }
  };
}

async function withinRateLimit(request: Request) {
  const { env } = await getCloudflareContext({ async: true });
  if (!env.WRITE_LIMITER) return true; // binding not configured
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const { success } = await env.WRITE_LIMITER.limit({ key: ip });
  return success;
}

/** Parses a JSON object body, rejecting malformed or non-object payloads. */
export async function readJson(
  request: Request
): Promise<Record<string, unknown>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError("Request body must be valid JSON");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("Request body must be a JSON object");
  }
  return body as Record<string, unknown>;
}

/** A trimmed, non-empty string no longer than `max`. */
export function text(value: unknown, field: string, max: number): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new ValidationError(`${field} is required`);
  }
  const trimmed = value.trim();
  if (trimmed.length > max) {
    throw new ValidationError(`${field} must be ${max} characters or fewer`);
  }
  return trimmed;
}

/** Like `text`, but returns undefined when the value is absent. */
export function optionalText(
  value: unknown,
  field: string,
  max: number
): string | undefined {
  return value === undefined ? undefined : text(value, field, max);
}

export function email(value: unknown): string {
  const result = text(value, "Email", LIMITS.email).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) {
    throw new ValidationError("Email must be a valid email address");
  }
  return result;
}

/** A whole number in [min, max]. Numeric strings are accepted. */
export function integer(
  value: unknown,
  field: string,
  { min, max }: { min: number; max: number }
): number {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isInteger(n) || n < min || n > max) {
    throw new ValidationError(
      `${field} must be a whole number between ${min} and ${max}`
    );
  }
  return n;
}

/** A parseable date within ~5 years of today. */
export function date(value: unknown, field: string): Date {
  const d = typeof value === "string" ? new Date(value) : null;
  if (!d || isNaN(d.getTime())) {
    throw new ValidationError(`${field} must be a valid date`);
  }
  const fiveYears = 5 * 365 * 24 * 60 * 60 * 1000;
  if (Math.abs(d.getTime() - Date.now()) > fiveYears) {
    throw new ValidationError(`${field} must be within 5 years of today`);
  }
  return d;
}

/** Parses a positive integer query param, clamped to [1, max]. */
export function queryInt(
  value: string | null,
  fallback: number,
  max: number
): number {
  const n = parseInt(value ?? "", 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, max);
}
