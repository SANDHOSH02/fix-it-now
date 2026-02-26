/**
 * Fix It Now — Prisma seed script
 * Populates: departments, admin user, sample citizen users, and 10 complaints
 * Run: npm run db:seed
 */

import { PrismaClient, ComplaintCategory, ComplaintStatus, Priority, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEPARTMENTS = [
  { name: "Roads Dept.", description: "Road construction, maintenance, and pothole repair" },
  { name: "CMWSSB", description: "Chennai Metropolitan Water Supply and Sewerage Board" },
  { name: "TWAD Board", description: "Tamil Nadu Water Supply and Drainage Board" },
  { name: "Electrical Dept.", description: "Street lighting and electrical infrastructure" },
  { name: "Sanitation", description: "Garbage collection and waste management" },
  { name: "Public Works", description: "Drainage, sewage, and public infrastructure" },
  { name: "Parks & Recreation", description: "Parks, playgrounds, and public spaces" },
  { name: "Urban Development", description: "Urban planning and development" },
];

async function main() {
  console.log("🌱 Seeding Fix It Now database...\n");

  // ── Departments ──────────────────────────────────────────────────────────
  console.log("Creating departments...");
  const deptMap: Record<string, string> = {};
  for (const d of DEPARTMENTS) {
    const dept = await prisma.department.upsert({
      where: { name: d.name },
      update: {},
      create: d,
    });
    deptMap[dept.name] = dept.id;
    console.log(`  ✔ ${dept.name}`);
  }

  // ── Users ────────────────────────────────────────────────────────────────
  console.log("\nCreating users...");
  const passwordHash = await bcrypt.hash("FixItNow@2026", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@fixitnow.gov.in" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@fixitnow.gov.in",
      passwordHash,
      role: Role.ADMIN,
      district: "Chennai",
    },
  });
  console.log(`  ✔ ${admin.email} [ADMIN]`);

  const citizens = await Promise.all([
    prisma.user.upsert({
      where: { email: "arjun@example.com" },
      update: {},
      create: { name: "Arjun Ravi", email: "arjun@example.com", passwordHash, district: "Chennai" },
    }),
    prisma.user.upsert({
      where: { email: "priya@example.com" },
      update: {},
      create: { name: "Priya Suresh", email: "priya@example.com", passwordHash, district: "Chennai" },
    }),
    prisma.user.upsert({
      where: { email: "kavitha@example.com" },
      update: {},
      create: { name: "Kavitha Menon", email: "kavitha@example.com", passwordHash, district: "Chennai" },
    }),
  ]);
  citizens.forEach((c) => console.log(`  ✔ ${c.email} [CITIZEN]`));

  const [arjun, priya] = citizens;

  // ── Complaints ───────────────────────────────────────────────────────────
  console.log("\nCreating complaints...");

  const seedComplaints = [
    {
      refId: "FIX-2026-001",
      title: "Large pothole on Anna Salai near Gemini flyover",
      category: ComplaintCategory.roads,
      description: "A massive pothole has developed near the Gemini flyover on Anna Salai. Several two-wheelers have been damaged.",
      status: ComplaintStatus.in_progress,
      priority: Priority.high,
      lat: 13.0598,
      lng: 80.2478,
      address: "Anna Salai, near Gemini Flyover",
      city: "Chennai",
      district: "Chennai",
      aiConfidence: 97,
      upvotes: 34,
      reporterId: arjun.id,
      departmentId: deptMap["Roads Dept."],
    },
    {
      refId: "FIX-2026-002",
      title: "Water main burst near Nungambakkam High Road",
      category: ComplaintCategory.water,
      description: "A water main has burst near the signal at Nungambakkam High Road. Water is flooding the road.",
      status: ComplaintStatus.assigned,
      priority: Priority.high,
      lat: 13.0611,
      lng: 80.2535,
      address: "Nungambakkam High Road",
      city: "Chennai",
      district: "Chennai",
      aiConfidence: 94,
      upvotes: 22,
      reporterId: priya.id,
      departmentId: deptMap["CMWSSB"],
    },
    {
      refId: "FIX-2026-003",
      title: "Street lights not working in T. Nagar 3rd avenue",
      category: ComplaintCategory.lighting,
      description: "All street lights from 3rd Avenue to 5th Avenue in T. Nagar have been non-functional for 4 days.",
      status: ComplaintStatus.resolved,
      priority: Priority.medium,
      lat: 13.0418,
      lng: 80.2341,
      address: "3rd Avenue, T. Nagar",
      city: "Chennai",
      district: "Chennai",
      aiConfidence: 91,
      upvotes: 18,
      reporterId: citizens[2].id,
      departmentId: deptMap["Electrical Dept."],
    },
  ];

  for (const data of seedComplaints) {
    const { departmentId, ...rest } = data;
    const complaint = await prisma.complaint.upsert({
      where: { refId: data.refId },
      update: {},
      create: {
        ...rest,
        departmentId,
        statusHistory: {
          create: [
            { status: ComplaintStatus.reported, note: "Complaint received" },
            ...(data.status !== ComplaintStatus.reported
              ? [{ status: data.status, note: "Status updated" }]
              : []),
          ],
        },
      },
    });
    console.log(`  ✔ ${complaint.refId} — ${complaint.title.slice(0, 50)}`);
  }

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📋 Login credentials:");
  console.log("   Admin:   admin@fixitnow.gov.in  /  FixItNow@2026");
  console.log("   Citizen: arjun@example.com      /  FixItNow@2026");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
