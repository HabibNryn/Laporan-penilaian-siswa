// ============================================================
// src/app/api/admin/students/route.ts
// ============================================================
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const students = await prisma.student.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(students);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, email, password, nim, className, major, year } = await req.json();

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name, email, password: hashed, role: "STUDENT",
      student: { create: { nim, class: className, major, year } },
    },
    include: { student: true },
  });
  return NextResponse.json(user, { status: 201 });
}
