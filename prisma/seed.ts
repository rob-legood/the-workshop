import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:dev.db" });
const prisma = new PrismaClient({ adapter });

const DEPARTMENT_NAMES = [
  "Softy",
  "Codebusters",
  "French Press",
  "PMO",
  "Product",
  "Design",
  "Marketing",
  "Contact Centre",
];

async function main() {
  // Clear existing data (order matters due to foreign keys)
  await prisma.feedback.deleteMany();
  await prisma.feedbackStatus.deleteMany();
  await prisma.presentation.deleteMany();
  await prisma.workshop.deleteMany();
  await prisma.department.deleteMany();

  // Seed feedback statuses
  const FEEDBACK_STATUSES = [
    { name: "New", isClosed: false },
    { name: "Open", isClosed: false },
    { name: "Tracked", isClosed: false },
    { name: "Implemented", isClosed: true },
    { name: "Rejected", isClosed: true },
  ];
  await prisma.feedbackStatus.createMany({ data: FEEDBACK_STATUSES });
  const statuses = await prisma.feedbackStatus.findMany();
  const statusByName = Object.fromEntries(statuses.map((s) => [s.name, s.id]));

  // Seed departments
  await prisma.department.createMany({
    data: DEPARTMENT_NAMES.map((name) => ({ name })),
  });

  const departments = await prisma.department.findMany();
  const deptByName = Object.fromEntries(departments.map((d) => [d.name, d.id]));

  // Create sample workshops
  const workshop1 = await prisma.workshop.create({
    data: {
      chair: "Jane Doe",
      date: new Date("2026-02-15T10:00:00"),
      maxMinutes: 35,
    },
  });

  const workshop2 = await prisma.workshop.create({
    data: {
      chair: "John Smith",
      date: new Date("2026-02-22T14:00:00"),
      maxMinutes: 45,
    },
  });

  await prisma.workshop.create({
    data: {
      chair: "Maria Garcia",
      date: new Date("2026-03-01T11:00:00"),
      maxMinutes: 30,
    },
  });

  // Add a few sample presentations
  const pres1 = await prisma.presentation.create({
    data: {
      title: "React Server Components Deep Dive",
      description:
        "An in-depth look at RSC architecture, streaming, and migration.",
      name: "Alice Johnson",
      email: "alice@company.com",
      departmentId: deptByName["Codebusters"],
      minutes: 10,
      workshopId: workshop1.id,
    },
  });

  const pres2 = await prisma.presentation.create({
    data: {
      title: "Building with AI Agents",
      description:
        "Demo of integrating LLM-powered agents into internal tooling.",
      name: "Bob Smith",
      email: "bob@company.com",
      departmentId: deptByName["Product"],
      minutes: 5,
      workshopId: workshop1.id,
    },
  });

  const pres3 = await prisma.presentation.create({
    data: {
      title: "Design System v2 Rollout",
      description:
        "Walkthrough of the new component library and Figma sync.",
      name: "Carol Williams",
      email: "carol@company.com",
      departmentId: deptByName["Design"],
      minutes: 15,
      workshopId: workshop2.id,
    },
  });

  // Add sample feedback (all default to "New" status)
  await prisma.feedback.createMany({
    data: [
      {
        name: "David Lee",
        text: "Great overview of RSC! Would love a follow-up on streaming patterns.",
        presentationId: pres1.id,
        statusId: statusByName["New"],
      },
      {
        name: "Emma Wilson",
        text: "Very clear explanation. The migration tips were especially useful.",
        presentationId: pres1.id,
        statusId: statusByName["New"],
      },
      {
        name: "Frank Chen",
        text: "Impressive demo. How does this handle rate limiting with the LLM provider?",
        presentationId: pres2.id,
        statusId: statusByName["New"],
      },
      {
        name: "Grace Kim",
        text: "The new component library looks polished. Excited for the Figma sync feature.",
        presentationId: pres3.id,
        statusId: statusByName["New"],
      },
    ],
  });

  console.log(
    `Seeded ${DEPARTMENT_NAMES.length} departments, ${FEEDBACK_STATUSES.length} feedback statuses, 3 workshops, 3 presentations, and 4 feedbacks.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
