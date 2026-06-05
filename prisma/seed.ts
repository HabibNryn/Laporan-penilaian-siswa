
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Admin
  const adminPass = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@sekolah.id" },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@sekolah.id",
      password: adminPass,
      role: "ADMIN",
    },
  });

  // Create Teacher
  const teacherPass = await bcrypt.hash("guru123", 10);
  await prisma.user.upsert({
    where: { email: "guru@sekolah.id" },
    update: {},
    create: {
      name: "Budi Santoso",
      email: "guru@sekolah.id",
      password: teacherPass,
      role: "TEACHER",
      teacher: {
        create: { nip: "NIP001", subject: "Matematika" },
      },
    },
  });

  // Create Student
  const studentPass = await bcrypt.hash("siswa123", 10);
  await prisma.user.upsert({
    where: { email: "siswa@sekolah.id" },
    update: {},
    create: {
      name: "Andi Pratama",
      email: "siswa@sekolah.id",
      password: studentPass,
      role: "STUDENT",
      student: {
        create: {
          nim: "20240001",
          class: "XII IPA 1",
          major: "IPA",
          year: 2024,
        },
      },
    },
  });

  console.log("✅ Seeding selesai!");
  console.log("👤 Admin:   admin@sekolah.id  / admin123");
  console.log("👤 Guru:    guru@sekolah.id   / guru123");
  console.log("👤 Siswa:   siswa@sekolah.id  / siswa123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
