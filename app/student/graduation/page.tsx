import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

const GRADUATION_REQUIREMENTS = {
  minAverage:    75,
  minSubjects:   5,
  minPassRate:   80, // persen
};

async function getGraduationData(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      grades: { where: { status: "VALIDATED" } },
    },
  });
  return student;
}

export default async function StudentGraduationPage() {
  const session = await getServerSession(authOptions);
  const student = await getGraduationData(session!.user.id);
  const grades = student?.grades ?? [];

  const avg = grades.length ? grades.reduce((s, g) => s + g.score, 0) / grades.length : 0;
  const passed = grades.filter(g => g.score >= 75).length;
  const passRate = grades.length ? (passed / grades.length) * 100 : 0;

  const checks = [
    {
      label:     "Rata-rata Nilai ≥ 75",
      achieved:  avg >= GRADUATION_REQUIREMENTS.minAverage,
      value:     avg.toFixed(1),
      target:    "75",
      unit:      "nilai",
    },
    {
      label:     "Minimal 5 Mata Pelajaran",
      achieved:  grades.length >= GRADUATION_REQUIREMENTS.minSubjects,
      value:     grades.length.toString(),
      target:    GRADUATION_REQUIREMENTS.minSubjects.toString(),
      unit:      "mapel",
    },
    {
      label:     "Tingkat Kelulusan ≥ 80%",
      achieved:  passRate >= GRADUATION_REQUIREMENTS.minPassRate,
      value:     passRate.toFixed(0) + "%",
      target:    "80%",
      unit:      "",
    },
  ];

  const allPassed = checks.every(c => c.achieved);
  const somePassed = checks.some(c => c.achieved);

  const overallStatus = allPassed
    ? { label: "LULUS", color: "text-green-700", bg: "bg-green-100", border: "border-green-200", icon: CheckCircle, iconColor: "text-green-600" }
    : somePassed
    ? { label: "BELUM MEMENUHI SYARAT", color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200", icon: AlertCircle, iconColor: "text-yellow-500" }
    : { label: "TIDAK LULUS", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: XCircle, iconColor: "text-red-500" };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Status Kelulusan</h1>
          <p className="text-gray-500 text-sm mt-1">Informasi status kelulusan berdasarkan nilai akademik</p>
        </div>

        {/* Overall Status */}
        <div className={`rounded-xl border-2 ${overallStatus.border} ${overallStatus.bg} p-6 flex items-center gap-5`}>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
            allPassed ? "bg-green-200" : somePassed ? "bg-yellow-200" : "bg-red-200"
          }`}>
            <overallStatus.icon className={`w-7 h-7 ${overallStatus.iconColor}`} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status Kelulusan</p>
            <p className={`text-2xl font-bold ${overallStatus.color}`}>{overallStatus.label}</p>
            <p className="text-sm text-gray-500 mt-0.5">
              {allPassed
                ? "Selamat! Anda telah memenuhi semua syarat kelulusan."
                : "Anda belum memenuhi semua persyaratan kelulusan."}
            </p>
          </div>
        </div>

        {/* Requirements Checklist */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Persyaratan Kelulusan</h2>
          <div className="space-y-4">
            {checks.map(c => (
              <div key={c.label} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  c.achieved ? "bg-green-100" : "bg-red-100"
                }`}>
                  {c.achieved
                    ? <CheckCircle className="w-5 h-5 text-green-600" />
                    : <XCircle className="w-5 h-5 text-red-500" />
                  }
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-800">{c.label}</p>
                    <span className={`text-sm font-bold ${c.achieved ? "text-green-600" : "text-red-500"}`}>
                      {c.value} / {c.target}{c.unit ? ` ${c.unit}` : ""}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${c.achieved ? "bg-green-500" : "bg-red-400"}`}
                      style={{
                        width: c.unit === "nilai"
                          ? `${Math.min((avg / 100) * 100, 100)}%`
                          : c.unit === "mapel"
                          ? `${Math.min((grades.length / GRADUATION_REQUIREMENTS.minSubjects) * 100, 100)}%`
                          : `${Math.min(passRate, 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Per-Subject Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Detail per Mata Pelajaran</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Mata Pelajaran</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Semester</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Nilai</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Huruf</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {grades.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-gray-400 py-10">Belum ada nilai tervalidasi.</td></tr>
                ) : grades.map(g => (
                  <tr key={g.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 font-medium text-gray-800">{g.subject}</td>
                    <td className="px-6 py-3 text-gray-600">{g.semester} {g.year}</td>
                    <td className="px-6 py-3 font-bold text-gray-800">{g.score}</td>
                    <td className="px-6 py-3">
                      <span className={`font-bold text-base ${g.score >= 75 ? "text-green-600" : g.score >= 55 ? "text-yellow-600" : "text-red-500"}`}>
                        {g.letterGrade}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        g.score >= 75 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                      }`}>
                        {g.score >= 75 ? "Lulus" : "Tidak Lulus"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}