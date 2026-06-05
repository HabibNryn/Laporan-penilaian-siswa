import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { BookOpen, CheckCircle, GraduationCap, LogIn, ShieldCheck, Users } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getDashboardByRole } from "@/lib/rbac";
import type { Role } from "@prisma/client";

const features = [
  {
    title: "Admin",
    description: "Kelola data siswa, pengguna, laporan, dan pengaturan sistem.",
    href: "/admin/dashboard",
    icon: Users,
  },
  {
    title: "Guru",
    description: "Input nilai, validasi data akademik, dan lihat rekap penilaian.",
    href: "/teacher/dashboard",
    icon: CheckCircle,
  },
  {
    title: "Siswa",
    description: "Pantau nilai, status kelulusan, dan laporan akademik pribadi.",
    href: "/student/dashboard",
    icon: BookOpen,
  },
];

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role as Role | undefined;

  if (role) {
    redirect(getDashboardByRole(role));
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-12">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1 text-sm font-medium text-blue-700 shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              Sistem Manajemen Nilai
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight tracking-normal text-gray-950 sm:text-5xl">
                Laporan Penilaian Akademik
              </h1>
              <p className="max-w-2xl text-base leading-7 text-gray-600">
                Aplikasi ini menampilkan halaman admin, guru, dan siswa yang sudah dibuat dalam project.
                Masuk dengan akun sesuai role untuk membuka dashboard dan fitur masing-masing.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <LogIn className="h-4 w-4" />
                Masuk ke Aplikasi
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Menu Utama</h2>
                <p className="text-sm text-gray-500">Akses semua halaman yang sudah tersedia.</p>
              </div>
            </div>

            <div className="space-y-3">
              {features.map((feature) => (
                <Link
                  key={feature.href}
                  href={feature.href}
                  className="flex items-start gap-4 rounded-lg border border-gray-100 p-4 transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-blue-600">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">{feature.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
