import DashboardLayout from "@/components/layouts/DashboardLayout";
import { prisma } from "@/lib/prisma";
import { Plus, UserCog, Users, GraduationCap } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      student: { select: { nim: true, class: true } },
      teacher: { select: { nip: true, subject: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

const ROLE_LABELS = {
  ADMIN: "Admin",
  TEACHER: "Guru",
  STUDENT: "Siswa",
};

const ROLE_BADGES = {
  ADMIN: "bg-purple-100 text-purple-700",
  TEACHER: "bg-green-100 text-green-700",
  STUDENT: "bg-blue-100 text-blue-700",
};

export default async function AdminUsersPage() {
  const users = await getUsers();
  const totalAdmin = users.filter((user) => user.role === "ADMIN").length;
  const totalTeacher = users.filter((user) => user.role === "TEACHER").length;
  const totalStudent = users.filter((user) => user.role === "STUDENT").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
            <p className="text-gray-500 text-sm mt-1">Kelola akun admin, guru, dan siswa</p>
          </div>
          <Link
            href="/admin/users/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
          >
            <Plus className="w-4 h-4" /> Tambah Pengguna
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { label: "Administrator", value: totalAdmin, icon: UserCog, color: "bg-purple-500" },
            { label: "Guru", value: totalTeacher, icon: Users, color: "bg-green-500" },
            { label: "Siswa", value: totalStudent, icon: GraduationCap, color: "bg-blue-500" },
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Nama</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Email</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Role</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Detail</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Dibuat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 py-12">
                      Belum ada pengguna.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-800">{user.name}</td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_BADGES[user.role]}`}>
                          {ROLE_LABELS[user.role]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {user.role === "STUDENT" && user.student
                          ? `${user.student.nim} - ${user.student.class}`
                          : user.role === "TEACHER" && user.teacher
                          ? `${user.teacher.nip} - ${user.teacher.subject}`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {user.createdAt.toLocaleDateString("id-ID")}
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
