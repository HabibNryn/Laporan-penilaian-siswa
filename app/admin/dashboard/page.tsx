import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Users, GraduationCap, FileText, UserCog } from "lucide-react";

async function getStats() {
  const [totalStudents, totalTeachers, totalGrades, totalReports] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.grade.count(),
    prisma.report.count(),
  ]);
  return { totalStudents, totalTeachers, totalGrades, totalReports };
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const stats = await getStats();

  const cards = [
    { label: "Total Siswa",   value: stats.totalStudents, icon: GraduationCap, color: "bg-blue-500" },
    { label: "Total Guru",    value: stats.totalTeachers, icon: Users,          color: "bg-green-500" },
    { label: "Total Nilai",   value: stats.totalGrades,   icon: FileText,       color: "bg-purple-500" },
    { label: "Total Laporan", value: stats.totalReports,  icon: UserCog,        color: "bg-orange-500" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
          <p className="text-gray-500 text-sm mt-1">
            Selamat datang, <span className="font-medium text-blue-600">{session?.user?.name}</span>
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map(card => (
            <div key={card.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Tambah Siswa Baru",   href: "/admin/students/new",  color: "bg-blue-600" },
              { label: "Tambah Pengguna",      href: "/admin/users/new",     color: "bg-green-600" },
              { label: "Lihat Semua Laporan",  href: "/admin/reports",       color: "bg-purple-600" },
            ].map(action => (
              <a
                key={action.label}
                href={action.href}
                className={`${action.color} text-white text-sm font-medium px-4 py-3 rounded-lg text-center hover:opacity-90 transition`}
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}