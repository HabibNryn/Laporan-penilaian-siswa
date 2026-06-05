import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import DeleteStudentButton from "./DeleteStudentButton";

export const dynamic = "force-dynamic";

async function getStudents() {
  return prisma.student.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminStudentsPage() {
  const students = await getStudents();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manajemen Siswa</h1>
            <p className="text-gray-500 text-sm mt-1">Kelola data siswa terdaftar</p>
          </div>
          <Link
            href="/admin/students/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
          >
            <Plus className="w-4 h-4" /> Tambah Siswa
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Nama</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">NIM</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Kelas</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Jurusan</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Tahun</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-400 py-12">
                      Belum ada data siswa.
                    </td>
                  </tr>
                ) : (
                  students.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-800">{s.user.name}</td>
                      <td className="px-6 py-4 text-gray-600">{s.nim}</td>
                      <td className="px-6 py-4 text-gray-600">{s.class}</td>
                      <td className="px-6 py-4 text-gray-600">{s.major}</td>
                      <td className="px-6 py-4 text-gray-600">{s.year}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/students/${s.id}/edit`}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <DeleteStudentButton id={s.id} />
                        </div>
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
