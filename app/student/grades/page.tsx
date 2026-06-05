import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { isPassing, PASSING_SCORE } from "@/lib/grades";

async function getStudentGrades(userId: string) {
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

export default async function StudentGradesPage() {
  const session = await getServerSession(authOptions);
  const student = await getStudentGrades(session!.user.id);

  const avg = student?.grades.length
    ? (student.grades.reduce((sum, g) => sum + g.score, 0) / student.grades.length).toFixed(2)
    : "0";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Nilai Saya</h1>
          <p className="text-gray-500 text-sm mt-1">Daftar nilai yang telah divalidasi guru</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { label: "Total Mata Pelajaran", value: student?.grades.length ?? 0, color: "text-blue-600" },
            { label: "Rata-rata Nilai", value: avg, color: "text-green-600" },
            { label: `Nilai Lulus (>=${PASSING_SCORE})`, value: student?.grades.filter(g => isPassing(g.score)).length ?? 0, color: "text-purple-600" },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Grades Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Mata Pelajaran</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Semester</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Tahun</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Tugas</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">UTS</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">UAS</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Nilai Akhir</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Huruf</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {!student?.grades.length ? (
                  <tr>
                    <td colSpan={9} className="text-center text-gray-400 py-12">
                      Belum ada nilai yang tersedia.
                    </td>
                  </tr>
                ) : (
                  student.grades.map(g => (
                    <tr key={g.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-800">{g.subject}</td>
                      <td className="px-6 py-4 text-gray-600">{g.semester}</td>
                      <td className="px-6 py-4 text-gray-600">{g.year}</td>
                      <td className="px-6 py-4 text-gray-600">{g.assignmentScore}</td>
                      <td className="px-6 py-4 text-gray-600">{g.midtermScore}</td>
                      <td className="px-6 py-4 text-gray-600">{g.finalExamScore}</td>
                      <td className="px-6 py-4 font-bold text-gray-800">{g.score.toFixed(1)}</td>
                      <td className="px-6 py-4">
                        <span className={`font-bold text-lg ${
                          isPassing(g.score) ? "text-green-600" :
                          g.score >= 50 ? "text-yellow-600" : "text-red-500"
                        }`}>
                          {g.letterGrade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          isPassing(g.score) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                        }`}>
                          {isPassing(g.score) ? "Lulus" : "Tidak Lulus"}
                        </span>
                      </td>
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
