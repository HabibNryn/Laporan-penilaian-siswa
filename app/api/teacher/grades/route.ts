import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateFinalScore,
  getLetterGrade,
  isValidScore,
} from "@/lib/grades";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "TEACHER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
  });
  if (!teacher)
    return NextResponse.json(
      { error: "Data guru tidak ditemukan." },
      { status: 404 },
    );
  const grades = await prisma.grade.findMany({
    where: { teacherId: teacher!.id },
    include: { student: { include: { user: true } } },
  });
  return NextResponse.json(grades);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "TEACHER")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    });
    if (!teacher)
      return NextResponse.json(
        { error: "Data guru tidak ditemukan." },
        { status: 404 },
      );

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Request body tidak valid." },
        { status: 400 },
      );
    }

    const { grades } = body;
    if (!Array.isArray(grades) || grades.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada nilai untuk disimpan." },
        { status: 400 },
      );
    }

    const data = [];
    for (const g of grades) {
      const assignmentScore = Number(g.assignmentScore);
      const midtermScore = Number(g.midtermScore);
      const finalExamScore = Number(g.finalExamScore);

      if (
        !isValidScore(assignmentScore) ||
        !isValidScore(midtermScore) ||
        !isValidScore(finalExamScore)
      ) {
        return NextResponse.json(
          {
            error: "Nilai Tugas, UTS, dan UAS harus berada pada rentang 0-100.",
          },
          { status: 400 },
        );
      }

      if (!g.studentId || !g.subject || !g.semester || !g.year) {
        return NextResponse.json(
          {
            error:
              "Data siswa, mata pelajaran, semester, dan tahun tidak boleh kosong.",
          },
          { status: 400 },
        );
      }

      const score = calculateFinalScore(
        assignmentScore,
        midtermScore,
        finalExamScore,
      );

      data.push({
        studentId: g.studentId,
        subject: g.subject,
        assignmentScore,
        midtermScore,
        finalExamScore,
        score,
        letterGrade: getLetterGrade(score),
        semester: g.semester,
        year: Number(g.year),
        teacherId: teacher.id,
        status: "SUBMITTED" as const,
      });
    }

    const created = await prisma.grade.createMany({
      data,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error saving grades:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            error:
              "Nilai untuk siswa/mata pelajaran/semester/tahun ini sudah ada. Perbarui data yang sudah ada jika ingin mengubahnya.",
          },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat menyimpan nilai.",
      },
      { status: 500 },
    );
  }
}
