import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { BookOpen, GraduationCap, FileDown, TrendingUp } from "lucide-react";
import { isPassing, PASSING_SCORE } from "@/lib/grades";

async function getStudentData(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      grades: {
        where: { status: "VALIDATED" },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return student;
}

function getGraduationStatus(avg: number, totalSubjects: number) {
  if (totalSubjects === 0) return { label: "Belum Ada Data", color: "text-gray-500", bg: "bg-gray-100" };
  if (avg >= PASSING_SCORE) return { label: "Lulus", color: "text-green-700", bg: "bg-green-100" };
  if (avg >= 60) return { label: "Dalam Proses", color: "text-yellow-700", bg: "bg-yellow-100" };
  return { label: "Perlu Perhatian", color: "text-red-700", bg: "bg-red-100" };
}

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);
  const student = await getStudentData(session!.user.id);
  const grades = student?.grades ?? [];

  const avg = grades.length
    ? grades.reduce((s, g) => s + g.score, 0) / grades.length
    : 0;

  const passed = grades.filter(g => isPassing(g.score)).length;
  const gradStatus = getGraduationStatus(avg, grades.length);

  const cards = [
    { label: "Mata Pelajaran",    value: grades.length,           icon: BookOpen,      color: "bg-blue-500" },
    { label: "Rata-rata Nilai",   value: avg.toFixed(1),          icon: TrendingUp,    color: "bg-green-500" },
    { label: "Nilai Lulus",       value: passed,                  icon: GraduationCap, color: "bg-purple-500" },
    { label: "Laporan Tersedia",  value: student ? 1 : 0,         icon: FileDown,      color: "bg-orange-500" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Siswa</h1>
            <p className="text-gray-500 text-sm mt-1">
              Selamat datang, <span className="font-medium text-blue-600">{session?.user?.name}</span>
            </p>
          </div>
          {student && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3 text-sm space-y-0.5">
              <p className="text-gray-500">NIS: <strong className="text-gray-800">{student.nim}</strong></p>
              <p className="text-gray-500">Kelas: <strong className="text-gray-800">{student.class}</strong></p>
              <p className="text-gray-500">Jurusan: <strong className="text-gray-800">{student.major}</strong></p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map(card => (
            <div key={card.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mb-4`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Status & Recent Grades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graduation Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Status Akademik</h2>
            <div className="flex items-center gap-4 mb-5">
              <div className={`px-4 py-2 rounded-full font-semibold text-sm ${gradStatus.bg} ${gradStatus.color}`}>
                {gradStatus.label}
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Rata-rata Nilai</span>
                  <span>{avg.toFixed(1)} / 100</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(avg, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Mata Pelajaran Lulus</span>
                  <span>{passed} / {grades.length}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: grades.length ? `${(passed / grades.length) * 100}%` : "0%" }} />
                </div>
              </div>
            </div>
            <a href="/student/graduation"
              className="mt-5 block text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
              Lihat Detail Status Kelulusan →
            </a>
          </div>

          {/* Recent Grades */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Nilai Terbaru</h2>
            {grades.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Belum ada nilai tersedia.</p>
            ) : (
              <div className="space-y-3">
                {grades.slice(0, 5).map(g => (
                  <div key={g.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{g.subject}</p>
                      <p className="text-xs text-gray-400">{g.semester} {g.year}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-700">{g.score}</span>
                      <span className={`font-bold text-lg ${isPassing(g.score) ? "text-green-600" : g.score >= 50 ? "text-yellow-600" : "text-red-500"}`}>
                        {g.letterGrade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <a href="/student/grades"
              className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
              Lihat Semua Nilai →
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
