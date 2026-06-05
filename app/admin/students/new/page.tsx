"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Save } from "lucide-react";

export default function NewStudentPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/admin/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
        nim: String(form.get("nim") ?? ""),
        className: String(form.get("className") ?? ""),
        major: String(form.get("major") ?? ""),
        year: Number(form.get("year") || new Date().getFullYear()),
      }),
    });

    setSaving(false);
    if (res.ok) {
      router.push("/admin/students");
      router.refresh();
      return;
    }

    const data = await res.json().catch(() => null);
    setMessage(data?.error ?? "Gagal menyimpan siswa.");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tambah Siswa</h1>
          <p className="text-gray-500 text-sm mt-1">Tambahkan data siswa dan akun login siswa</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nama Lengkap" name="name" required />
            <Field label="Email" name="email" type="email" required />
            <Field label="Password" name="password" type="password" required />
            <Field label="NIM" name="nim" required />
            <Field label="Kelas" name="className" required />
            <Field label="Jurusan" name="major" required />
            <Field label="Tahun Masuk" name="year" type="number" defaultValue={new Date().getFullYear()} required />
          </div>

          {message && <p className="text-sm font-medium text-red-500">{message}</p>}

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
            <button type="button" onClick={() => router.back()} className="text-sm border border-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition">
              Batal
            </button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition">
              <Save className="w-4 h-4" />
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
