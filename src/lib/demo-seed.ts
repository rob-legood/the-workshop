import type { Prisma } from "../generated/prisma/client";

// Uses a relative import (not "@/") so prisma/seed.ts can share this module.

type Db = Prisma.TransactionClient;

/** Setting row recording the date of the last demo reset (see demo-reset.ts). */
export const DEMO_MARKER_KEY = "demoSeedDate";

const TEAMS = [
  "Platform",
  "Web",
  "Mobile",
  "Data & Analytics",
  "Infrastructure",
  "Quality Engineering",
  "Security",
  "Product & Design",
];

const FEEDBACK_STATUSES = [
  { name: "New", isClosed: false },
  { name: "Open", isClosed: false },
  { name: "Tracked", isClosed: true },
  { name: "Implemented", isClosed: true },
  { name: "Rejected", isClosed: true },
];

interface SeedPresentation {
  title: string;
  description: string;
  name: string;
  team: string;
  minutes: number;
  feedback?: { name: string; text: string; status: string }[];
}

interface SeedWorkshop {
  daysFromToday: number;
  chair: string;
  maxMinutes: number;
  presentations: SeedPresentation[];
}

const WORKSHOPS: SeedWorkshop[] = [
  // Past workshops
  {
    daysFromToday: -42,
    chair: "Jane Doe",
    maxMinutes: 35,
    presentations: [
      {
        title: "React Server Components Deep Dive",
        description: "An in-depth look at RSC architecture, streaming, and migration.",
        name: "Alice Johnson",
        team: "Web",
        minutes: 15,
        feedback: [
          { name: "David Lee", text: "Great overview of RSC! Would love a follow-up on streaming patterns.", status: "Tracked" },
          { name: "Emma Wilson", text: "Very clear explanation. The migration tips were especially useful.", status: "Implemented" },
        ],
      },
      {
        title: "Our Incident Review Process",
        description: "How we run blameless post-mortems and what we've learned from the last ten.",
        name: "Raj Patel",
        team: "Infrastructure",
        minutes: 10,
        feedback: [
          { name: "Grace Kim", text: "Would be great to share the post-mortem template with every team.", status: "Open" },
        ],
      },
    ],
  },
  {
    daysFromToday: -28,
    chair: "John Smith",
    maxMinutes: 45,
    presentations: [
      {
        title: "Building with AI Agents",
        description: "Demo of integrating LLM-powered agents into internal tooling.",
        name: "Bob Smith",
        team: "Platform",
        minutes: 15,
        feedback: [
          { name: "Frank Chen", text: "Impressive demo. How does this handle rate limiting with the LLM provider?", status: "Open" },
        ],
      },
      {
        title: "Offline-First Mobile Sync",
        description: "Lessons learned making our mobile app work reliably on flaky connections.",
        name: "Priya Shah",
        team: "Mobile",
        minutes: 10,
      },
      {
        title: "Threat Modeling in 15 Minutes",
        description: "A lightweight threat-modeling exercise any team can run during planning.",
        name: "Marcus Brown",
        team: "Security",
        minutes: 15,
        feedback: [
          { name: "Alice Johnson", text: "Let's add this to our sprint planning checklist.", status: "Implemented" },
          { name: "Tom Nguyen", text: "Could we get a recording for people who missed it?", status: "Rejected" },
        ],
      },
    ],
  },
  {
    daysFromToday: -14,
    chair: "Maria Garcia",
    maxMinutes: 30,
    presentations: [
      {
        title: "Design System v2 Rollout",
        description: "Walkthrough of the new component library and Figma sync.",
        name: "Carol Williams",
        team: "Product & Design",
        minutes: 15,
        feedback: [
          { name: "Grace Kim", text: "The new component library looks polished. Excited for the Figma sync feature.", status: "New" },
        ],
      },
      {
        title: "Flaky Tests: A Field Guide",
        description: "Patterns we found behind our flakiest end-to-end tests and how we fixed them.",
        name: "Sam Okafor",
        team: "Quality Engineering",
        minutes: 10,
        feedback: [
          { name: "Bob Smith", text: "The quarantine-lane idea is great. Can we pilot it on our pipeline?", status: "New" },
        ],
      },
    ],
  },
  // Upcoming workshops
  {
    daysFromToday: 7,
    chair: "Jane Doe",
    maxMinutes: 35,
    presentations: [
      {
        title: "Data Contracts Between Teams",
        description: "How explicit schemas stopped our downstream dashboards from breaking.",
        name: "Lena Fischer",
        team: "Data & Analytics",
        minutes: 10,
      },
      {
        title: "Cutting Our Cloud Bill by 30%",
        description: "The handful of changes that made the biggest dent in infrastructure costs.",
        name: "Raj Patel",
        team: "Infrastructure",
        minutes: 10,
      },
    ],
  },
  {
    daysFromToday: 21,
    chair: "John Smith",
    maxMinutes: 45,
    presentations: [
      {
        title: "Accessibility Quick Wins",
        description: "Five fixes that made our web app usable with a screen reader.",
        name: "Carol Williams",
        team: "Web",
        minutes: 5,
      },
    ],
  },
  {
    daysFromToday: 35,
    chair: "Maria Garcia",
    maxMinutes: 30,
    presentations: [],
  },
];

function emailFor(name: string) {
  return `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`;
}

function dateFromToday(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(17, 0, 0, 0); // midday in North America
  return date;
}

/** Wipes all data and inserts demo data with dates relative to today. */
export async function seedDemoData(db: Db) {
  // Order matters due to foreign keys
  await db.feedback.deleteMany();
  await db.feedbackStatus.deleteMany();
  await db.presentation.deleteMany();
  await db.workshop.deleteMany();
  await db.department.deleteMany();
  await db.setting.deleteMany({ where: { key: { not: DEMO_MARKER_KEY } } });

  await db.feedbackStatus.createMany({ data: FEEDBACK_STATUSES });
  const statuses = await db.feedbackStatus.findMany();
  const statusId = Object.fromEntries(statuses.map((s) => [s.name, s.id]));

  await db.department.createMany({ data: TEAMS.map((name) => ({ name })) });
  const departments = await db.department.findMany();
  const teamId = Object.fromEntries(departments.map((d) => [d.name, d.id]));

  let presentationCount = 0;
  let feedbackCount = 0;

  for (const w of WORKSHOPS) {
    const workshop = await db.workshop.create({
      data: {
        chair: w.chair,
        date: dateFromToday(w.daysFromToday),
        maxMinutes: w.maxMinutes,
      },
    });

    for (const p of w.presentations) {
      const presentation = await db.presentation.create({
        data: {
          title: p.title,
          description: p.description,
          name: p.name,
          email: emailFor(p.name),
          departmentId: teamId[p.team],
          minutes: p.minutes,
          workshopId: workshop.id,
        },
      });
      presentationCount++;

      if (p.feedback?.length) {
        await db.feedback.createMany({
          data: p.feedback.map((f) => ({
            name: f.name,
            text: f.text,
            presentationId: presentation.id,
            statusId: statusId[f.status],
          })),
        });
        feedbackCount += p.feedback.length;
      }
    }
  }

  return {
    teams: TEAMS.length,
    statuses: FEEDBACK_STATUSES.length,
    workshops: WORKSHOPS.length,
    presentations: presentationCount,
    feedback: feedbackCount,
  };
}
