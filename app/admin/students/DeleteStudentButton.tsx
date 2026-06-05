"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteStudentButton({ id }: { id: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = window.confirm("Hapus data siswa ini?");
    if (!confirmed) return;

    const res = await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
      aria-label="Hapus siswa"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
