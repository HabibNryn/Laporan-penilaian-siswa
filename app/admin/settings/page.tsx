import DashboardLayout from "@/components/layouts/DashboardLayout";
import { prisma } from "@/lib/prisma";
import { BookOpen, Database, GraduationCap, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

async function getSettingsData() {
  const [students, teachers, grades, reports] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.grade.count(),
    prisma.report.count(),
  ]);

  return { students, teachers, grades, reports };
}

export default async function AdminSettingsPage() {
  const data = await getSettingsData();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pengaturan Sistem</h1>
          <p className="text-gray-500 text-sm mt-1">Informasi konfigurasi dan kondisi data aplikasi</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: "Siswa", value: data.students, icon: GraduationCap, color: "bg-blue-500" },
            { label: "Guru", value: data.teachers, icon: ShieldCheck, color: "bg-green-500" },
            { label: "Nilai", value: data.grades, icon: BookOpen, color: "bg-purple-500" },
            { label: "Laporan", value: data.reports, icon: Database, color: "bg-orange-500" },
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Aturan Akademik</h2>
            <div className="space-y-3 text-sm">
              <Row label="Nilai minimal lulus" value="75" />
              <Row label="Minimal mata pelajaran" value="5" />
              <Row label="Status nilai siswa" value="Hanya nilai tervalidasi yang tampil" />
              <Row label="Semester aktif" value="Ganjil / Genap" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Status Aplikasi</h2>
            <div className="space-y-3 text-sm">
              <Row label="Autentikasi" value="NextAuth Credentials" />
              <Row label="Database" value="Prisma" />
              <Row label="Role akses" value="Admin, Guru, Siswa" />
              <Row label="Mode laporan" value="Cetak dari halaman siswa" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-800">{value}</span>
    </div>
  );
}
