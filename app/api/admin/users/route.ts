import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import type { Role } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      student: { select: { nim: true, class: true, major: true, year: true } },
      teacher: { select: { nip: true, subject: true } },
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    name,
    email,
    password,
    role,
    nim,
    className,
    major,
    year,
    nip,
    subject,
  } = body as {
    name?: string;
    email?: string;
    password?: string;
    role?: Role;
    nim?: string;
    className?: string;
    major?: string;
    year?: number;
    nip?: string;
    subject?: string;
  };

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "Data pengguna belum lengkap." }, { status: 400 });
  }

  if (role === "STUDENT" && (!nim || !className || !major || !year)) {
    return NextResponse.json({ error: "Data siswa belum lengkap." }, { status: 400 });
  }

  if (role === "TEACHER" && (!nip || !subject)) {
    return NextResponse.json({ error: "Data guru belum lengkap." }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role,
      ...(role === "STUDENT"
        ? {
            student: {
              create: { nim: nim!, class: className!, major: major!, year: Number(year) },
            },
          }
        : {}),
      ...(role === "TEACHER"
        ? {
            teacher: {
              create: { nip: nip!, subject: subject! },
            },
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return NextResponse.json(user, { status: 201 });
}
