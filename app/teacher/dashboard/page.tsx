import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { PenLine, CheckCircle, BarChart2, Clock } from "lucide-react";

async function getTeacherStats(userId: string) {
  const teacher = await prisma.teacher.findUnique({ where: { userId } });
  if (!teacher) return null;

  const [totalGrades, validated, pending, subjects] = await Promise.all([
    prisma.grade.count({ where: { teacherId: teacher.id } }),
    prisma.grade.count({ where: { teacherId: teacher.id, status: "VALIDATED" } }),
    prisma.grade.count({ where: { teacherId: teacher.id, status: "SUBMITTED" } }),
    prisma.grade.findMany({
      where: { teacherId: teacher.id },
      select: { subject: true },
      distinct: ["subject"],
    }),
  ]);

  const recentGrades = await prisma.grade.findMany({
    where: { teacherId: teacher.id },
    include: { student: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return { teacher, totalGrades, validated, pending, subjects: subjects.length, recentGrades };
}

export default async function TeacherDashboard() {
  const session = await getServerSession(authOptions);
  const data = await getTeacherStats(session!.user.id);

  const cards = [
    { label: "Total Nilai Diinput", value: data?.totalGrades ?? 0,  icon: PenLine,     color: "bg-blue-500" },
    { label: "Sudah Divalidasi",    value: data?.validated ?? 0,     icon: CheckCircle, color: "bg-green-500" },
    { label: "Menunggu Validasi",   value: data?.pending ?? 0,       icon: Clock,       color: "bg-yellow-500" },
    { label: "Mata Pelajaran",      value: data?.subjects ?? 0,      icon: BarChart2,   color: "bg-purple-500" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Guru</h1>
          <p className="text-gray-500 text-sm mt-1">
            Selamat datang,{" "}
            <span className="font-medium text-blue-600">{session?.user?.name}</span>
            {data?.teacher && (
              <span className="ml-2 text-gray-400">· {data.teacher.subject}</span>
            )}
          </p>
        </div>

        {/* Stats */}
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Aksi Cepat</h2>
            <div className="space-y-3">
              {[
                { label: "Input Nilai Baru",    href: "/teacher/grades",     color: "bg-blue-600",   desc: "Tambah nilai siswa" },
                { label: "Validasi Nilai",      href: "/teacher/validation", color: "bg-green-600",  desc: "Periksa & validasi nilai" },
                { label: "Lihat Rekap Nilai",   href: "/teacher/recap",      color: "bg-purple-600", desc: "Ringkasan semua nilai" },
              ].map(a => (
                <a key={a.href} href={a.href}
                  className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition group"
                >
                  <div className={`w-9 h-9 ${a.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-xs font-bold">→</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition">{a.label}</p>
                    <p className="text-xs text-gray-400">{a.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Recent Grades */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Input Nilai Terbaru</h2>
            {!data?.recentGrades.length ? (
              <p className="text-gray-400 text-sm text-center py-8">Belum ada nilai diinput.</p>
            ) : (
              <div className="space-y-3">
                {data.recentGrades.map(g => (
                  <div key={g.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{g.student.user.name}</p>
                      <p className="text-xs text-gray-400">{g.subject} · {g.semester} {g.year}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${g.score >= 75 ? "text-green-600" : "text-red-500"}`}>
                        {g.letterGrade}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        g.status === "VALIDATED" ? "bg-green-100 text-green-700" :
                        g.status === "SUBMITTED" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {g.status === "VALIDATED" ? "Tervalidasi" : g.status === "SUBMITTED" ? "Menunggu" : "Draft"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}