"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ROLE_NAV, NavItem } from "@/lib/rbac";
import { Role } from "@prisma/client";
import {
  LayoutDashboard, Users, FileText, UserCog, Settings,
  PenLine, CheckCircle, BarChart2, BookOpen,
  GraduationCap, FileDown, LogOut, Menu, X,
} from "lucide-react";
import { useState } from "react";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, Users, FileText, UserCog, Settings,
  PenLine, CheckCircle, BarChart2, BookOpen,
  GraduationCap, FileDown,
};

const ROLE_LABELS: Record<Role, string> = {
  ADMIN:   "Administrator",
  TEACHER: "Guru",
  STUDENT: "Siswa",
};

const ROLE_COLORS: Record<Role, string> = {
  ADMIN:   "bg-purple-100 text-purple-700",
  TEACHER: "bg-green-100 text-green-700",
  STUDENT: "bg-blue-100 text-blue-700",
};

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = session?.user?.role as Role | undefined;
  const navItems: NavItem[] = role ? ROLE_NAV[role] : [];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-blue-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Sistem Nilai</p>
            <p className="text-blue-200 text-xs">Manajemen Akademik</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      {session?.user && (
        <div className="px-6 py-4 border-b border-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {session.user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-medium truncate">{session.user.name}</p>
              {role && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[role]}`}>
                  {ROLE_LABELS[role]}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = ICON_MAP[item.icon];
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-blue-100 hover:bg-blue-700 hover:text-white"
              }`}
            >
              {Icon && <Icon className="w-4.5 h-4.5 flex-shrink-0" />}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-blue-700">
        <button
          onClick={() => signOut({ callbackUrl: "/app/(auth)/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-100 hover:bg-red-500 hover:text-white transition-all w-full"
        >
          <LogOut className="w-4.5 h-4.5" />
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-lg shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={`lg:hidden fixed left-0 top-0 h-full w-64 bg-blue-600 z-50 transform transition-transform ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-blue-600 h-screen sticky top-0 flex-shrink-0">
        <SidebarContent />
      </aside>
    </>
  );
}