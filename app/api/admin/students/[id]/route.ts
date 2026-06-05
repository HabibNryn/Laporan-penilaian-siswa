import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!student) return NextResponse.json({ error: "Siswa tidak ditemukan." }, { status: 404 });
  return NextResponse.json(student);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { nim, className, major, year } = await req.json();
  const updated = await prisma.student.update({
    where: { id: params.id },
    data: { nim, class: className, major, year },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await prisma.student.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
