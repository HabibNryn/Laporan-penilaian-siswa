import { Role } from "@prisma/client";

export type NavItem = {
  label: string;
  href: string;
  icon: string;
};

export const ROLE_NAV: Record<Role, NavItem[]> = {
  ADMIN: [
    { label: "Dashboard",          href: "/admin/dashboard",  icon: "LayoutDashboard" },
    { label: "Manajemen Siswa",    href: "/admin/students",   icon: "Users" },
    { label: "Manajemen Laporan",  href: "/admin/reports",    icon: "FileText" },
    { label: "Manajemen Pengguna", href: "/admin/users",      icon: "UserCog" },
    { label: "Pengaturan Sistem",  href: "/admin/settings",   icon: "Settings" },
  ],
  TEACHER: [
    { label: "Dashboard",          href: "/teacher/dashboard",   icon: "LayoutDashboard" },
    { label: "Input Nilai",        href: "/teacher/grades",      icon: "PenLine" },
    { label: "Validasi Nilai",     href: "/teacher/validation",  icon: "CheckCircle" },
    { label: "Rekap Nilai",        href: "/teacher/recap",       icon: "BarChart2" },
  ],
  STUDENT: [
    { label: "Dashboard",          href: "/student/dashboard",   icon: "LayoutDashboard" },
    { label: "Nilai Saya",         href: "/student/grades",      icon: "BookOpen" },
    { label: "Status Kelulusan",   href: "/student/graduation",  icon: "GraduationCap" },
    { label: "Laporan Akademik",   href: "/student/report",      icon: "FileDown" },
  ],
};

export const ROLE_DASHBOARD: Record<Role, string> = {
  ADMIN:   "/admin/dashboard",
  TEACHER: "/teacher/dashboard",
  STUDENT: "/student/dashboard",
};

export function getDashboardByRole(role: Role) {
  return ROLE_DASHBOARD[role];
}