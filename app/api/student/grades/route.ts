import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "STUDENT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: { grades: { where: { status: "VALIDATED" } } },
  });
  return NextResponse.json(student?.grades ?? []);
}