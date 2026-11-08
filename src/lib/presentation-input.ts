import { LIMITS, MINUTES, email, integer, text } from "@/lib/validation";

/** Validates the fields shared by presentation create and update. */
export function parsePresentation(body: Record<string, unknown>) {
  return {
    title: text(body.title, "Title", LIMITS.title),
    description: text(body.description, "Description", LIMITS.description),
    name: text(body.name, "Name", LIMITS.name),
    email: email(body.email),
    departmentId: text(body.departmentId, "Team", LIMITS.id),
    minutes: integer(body.minutes ?? 5, "Minutes", MINUTES),
  };
}
