import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/layouts/DashboardLayout";

async function getRecap(userId: string) {
  const teacher = await prisma.teacher.findUnique({ where: { userId } });
  if (!teacher) return null;

  const grades = await prisma.grade.findMany({
    where: { teacherId: teacher.id },
    include: { student: { include: { user: true } } },
    orderBy: [{ subject: "asc" }, { score: "desc" }],
  });

  // Group by subject
  const grouped = grades.reduce<Record<string, typeof grades>>((acc, g) => {
    if (!acc[g.subject]) acc[g.subject] = [];
    acc[g.subject].push(g);
    return acc;
  }, {});

  return { teacher, grouped };
}

export default async function TeacherRecapPage() {
  const session = await getServerSession(authOptions);
  const data = await getRecap(session!.user.id);

  const subjectEntries = Object.entries(data?.grouped ?? {});

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Rekap Nilai</h1>
          <p className="text-gray-500 text-sm mt-1">Ringkasan seluruh nilai yang telah diinput</p>
        </div>

        {subjectEntries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
            Belum ada data nilai.
          </div>
        ) : (
          subjectEntries.map(([subject, grades]) => {
            const avg = grades.reduce((s, g) => s + g.score, 0) / grades.length;
            const passed = grades.filter(g => g.score >= 75).length;
            const failed = grades.length - passed;

            return (
              <div key={subject} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Subject Header */}
                <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-blue-50 border-b border-blue-100 gap-3">
                  <h2 className="text-base font-bold text-blue-800">{subject}</h2>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      Rata-rata: <strong className="text-blue-700">{avg.toFixed(1)}</strong>
                    </span>
                    <span className="text-green-600 font-medium">{passed} Lulus</span>
                    <span className="text-red-500 font-medium">{failed} Tidak Lulus</span>
                    <span className="text-gray-500">{grades.length} Siswa</span>
                  </div>
                </div>

                {/* Grade distribution bar */}
                <div className="px-6 pt-3 pb-1">
                  <div className="flex rounded-full overflow-hidden h-2 bg-gray-100">
                    <div className="bg-green-500 transition-all" style={{ width: `${(passed / grades.length) * 100}%` }} />
                    <div className="bg-red-400 transition-all" style={{ width: `${(failed / grades.length) * 100}%` }} />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-6 py-3 font-semibold text-gray-600">#</th>
                        <th className="text-left px-6 py-3 font-semibold text-gray-600">Nama Siswa</th>
                        <th className="text-left px-6 py-3 font-semibold text-gray-600">NIM</th>
                        <th className="text-left px-6 py-3 font-semibold text-gray-600">Kelas</th>
                        <th className="text-left px-6 py-3 font-semibold text-gray-600">Semester</th>
                        <th className="text-left px-6 py-3 font-semibold text-gray-600">Nilai</th>
                        <th className="text-left px-6 py-3 font-semibold text-gray-600">Huruf</th>
                        <th className="text-left px-6 py-3 font-semibold text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {grades.map((g, i) => (
                        <tr key={g.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-3 text-gray-400">{i + 1}</td>
                          <td className="px-6 py-3 font-medium text-gray-800">{g.student.user.name}</td>
                          <td className="px-6 py-3 text-gray-600">{g.student.nim}</td>
                          <td className="px-6 py-3 text-gray-600">{g.student.class}</td>
                          <td className="px-6 py-3 text-gray-600">{g.semester} {g.year}</td>
                          <td className="px-6 py-3 font-bold text-gray-800">{g.score}</td>
                          <td className="px-6 py-3">
                            <span className={`font-bold text-base ${g.score >= 75 ? "text-green-600" : g.score >= 55 ? "text-yellow-600" : "text-red-500"}`}>
                              {g.letterGrade}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              g.status === "VALIDATED" ? "bg-green-100 text-green-700" :
                              g.status === "SUBMITTED" ? "bg-yellow-100 text-yellow-700" :
                              "bg-gray-100 text-gray-600"
                            }`}>
                              {g.status === "VALIDATED" ? "Tervalidasi" : g.status === "SUBMITTED" ? "Menunggu" : "Draft"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
}