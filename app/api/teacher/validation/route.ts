import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "TEACHER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { gradeIds, status } = await req.json();
  await prisma.grade.updateMany({ where: { id: { in: gradeIds } }, data: { status } });
  return NextResponse.json({ success: true });
}