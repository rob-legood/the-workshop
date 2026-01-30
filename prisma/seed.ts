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
  // Clear existing data
  await prisma.presentation.deleteMany();
  await prisma.workshop.deleteMany();
  await prisma.department.deleteMany();

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
  await prisma.presentation.createMany({
    data: [
      {
        title: "React Server Components Deep Dive",
        description:
          "An in-depth look at RSC architecture, streaming, and migration.",
        name: "Alice Johnson",
        email: "alice@company.com",
        departmentId: deptByName["Codebusters"],
        minutes: 10,
        workshopId: workshop1.id,
      },
      {
        title: "Building with AI Agents",
        description:
          "Demo of integrating LLM-powered agents into internal tooling.",
        name: "Bob Smith",
        email: "bob@company.com",
        departmentId: deptByName["Product"],
        minutes: 5,
        workshopId: workshop1.id,
      },
      {
        title: "Design System v2 Rollout",
        description:
          "Walkthrough of the new component library and Figma sync.",
        name: "Carol Williams",
        email: "carol@company.com",
        departmentId: deptByName["Design"],
        minutes: 15,
        workshopId: workshop2.id,
      },
    ],
  });

  console.log(
    `Seeded ${DEPARTMENT_NAMES.length} departments, 3 workshops, and 3 presentations.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
