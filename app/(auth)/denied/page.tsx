"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getDashboardByRole } from "@/lib/rbac";
import { Role } from "@prisma/client";

export default function AccessDeniedPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleBack = () => {
    if (session?.user?.role) {
      router.push(getDashboardByRole(session.user.role as Role));
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Akses Ditolak</h1>
        <p className="text-gray-500 mb-8">
          Anda tidak memiliki izin untuk mengakses halaman ini.
          Silakan kembali ke dashboard Anda.
        </p>
        <button
          onClick={handleBack}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition"
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
}