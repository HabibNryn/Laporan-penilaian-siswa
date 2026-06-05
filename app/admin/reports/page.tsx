import DashboardLayout from "@/components/layouts/DashboardLayout";
import { prisma } from "@/lib/prisma";
import { FileText, GraduationCap, TrendingUp, Users } from "lucide-react";

export const dynamic = "force-dynamic";

async function getReportData() {
  const [students, grades, reports] = await Promise.all([
    prisma.student.findMany({
      include: {
        user: true,
        grades: { where: { status: "VALIDATED" } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.grade.findMany({ where: { status: "VALIDATED" } }),
    prisma.report.findMany({
      include: { student: { include: { user: true } } },
      orderBy: { generatedAt: "desc" },
    }),
  ]);

  return { students, grades, reports };
}

export default async function AdminReportsPage() {
  const { students, grades, reports } = await getReportData();
  const average = grades.length ? grades.reduce((sum, grade) => sum + grade.score, 0) / grades.length : 0;
  const passed = grades.filter((grade) => grade.score >= 75).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Laporan</h1>
          <p className="text-gray-500 text-sm mt-1">Ringkasan laporan akademik dan nilai tervalidasi</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: "Total Siswa", value: students.length, icon: Users, color: "bg-blue-500" },
            { label: "Nilai Tervalidasi", value: grades.length, icon: FileText, color: "bg-green-500" },
            { label: "Rata-rata Nilai", value: average.toFixed(1), icon: TrendingUp, color: "bg-purple-500" },
            { label: "Nilai Lulus", value: passed, icon: GraduationCap, color: "bg-orange-500" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className={`w-11 h-11 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Rekap Akademik Siswa</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Nama</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">NIM</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Kelas</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Mapel</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Rata-rata</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-gray-400 py-12">Belum ada data siswa.</td></tr>
                ) : (
                  students.map((student) => {
                    const avg = student.grades.length
                      ? student.grades.reduce((sum, grade) => sum + grade.score, 0) / student.grades.length
                      : 0;
                    const passCount = student.grades.filter((grade) => grade.score >= 75).length;
                    const status = student.grades.length === 0
                      ? "Belum Ada Data"
                      : avg >= 75 && passCount === student.grades.length
                      ? "Baik"
                      : "Perlu Perhatian";

                    return (
                      <tr key={student.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-800">{student.user.name}</td>
                        <td className="px-6 py-4 text-gray-600">{student.nim}</td>
                        <td className="px-6 py-4 text-gray-600">{student.class}</td>
                        <td className="px-6 py-4 text-gray-600">{student.grades.length}</td>
                        <td className="px-6 py-4 font-bold text-gray-800">{avg.toFixed(1)}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            status === "Baik"
                              ? "bg-green-100 text-green-700"
                              : status === "Belum Ada Data"
                              ? "bg-gray-100 text-gray-600"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Riwayat Laporan Tersimpan</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Siswa</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Semester</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Tahun</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Tanggal</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reports.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-gray-400 py-12">Belum ada laporan tersimpan.</td></tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-800">{report.student.user.name}</td>
                      <td className="px-6 py-4 text-gray-600">{report.semester}</td>
                      <td className="px-6 py-4 text-gray-600">{report.year}</td>
                      <td className="px-6 py-4 text-gray-600">{report.generatedAt.toLocaleDateString("id-ID")}</td>
                      <td className="px-6 py-4 text-gray-600">{report.fileUrl ? "Tersedia" : "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
