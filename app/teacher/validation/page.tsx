"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { CheckCircle, XCircle, Filter } from "lucide-react";

type Grade = {
  id: string;
  subject: string;
  score: number;
  letterGrade: string;
  semester: string;
  year: number;
  status: string;
  student: { nim: string; user: { name: string } };
};

export default function TeacherValidationPage() {
  const [grades, setGrades]       = useState<Grade[]>([]);
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [filter, setFilter]       = useState<"SUBMITTED" | "ALL">("SUBMITTED");
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [message, setMessage]     = useState("");

  useEffect(() => {
    fetch("/api/teacher/grades")
      .then(r => r.json())
      .then(data => { setGrades(data); setLoading(false); });
  }, []);

  const displayed = filter === "SUBMITTED"
    ? grades.filter(g => g.status === "SUBMITTED")
    : grades;

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === displayed.length) setSelected(new Set());
    else setSelected(new Set(displayed.map(g => g.id)));
  };

  const handleValidate = async (status: "VALIDATED" | "DRAFT") => {
    if (!selected.size) return;
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/teacher/validation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gradeIds: [...selected], status }),
    });
    setSaving(false);
    if (res.ok) {
      setGrades(prev => prev.map(g => selected.has(g.id) ? { ...g, status } : g));
      setSelected(new Set());
      setMessage(status === "VALIDATED" ? "Nilai berhasil divalidasi!" : "Nilai dikembalikan ke draft.");
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      VALIDATED: "bg-green-100 text-green-700",
      SUBMITTED: "bg-yellow-100 text-yellow-700",
      DRAFT:     "bg-gray-100 text-gray-600",
    };
    const labels: Record<string, string> = {
      VALIDATED: "Tervalidasi", SUBMITTED: "Menunggu", DRAFT: "Draft",
    };
    return (
      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
        {labels[status] ?? status}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Validasi Nilai</h1>
          <p className="text-gray-500 text-sm mt-1">Periksa dan validasi nilai yang telah diinput</p>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filter:</span>
          </div>
          <div className="flex gap-2">
            {(["SUBMITTED", "ALL"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filter === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                {f === "SUBMITTED" ? "Menunggu Validasi" : "Semua"}
              </button>
            ))}
          </div>

          {selected.size > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-gray-500">{selected.size} dipilih</span>
              <button onClick={() => handleValidate("VALIDATED")} disabled={saving}
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-2 rounded-lg transition">
                <CheckCircle className="w-3.5 h-3.5" />
                Validasi
              </button>
              <button onClick={() => handleValidate("DRAFT")} disabled={saving}
                className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-semibold px-3 py-2 rounded-lg transition">
                <XCircle className="w-3.5 h-3.5" />
                Tolak
              </button>
            </div>
          )}

          {message && (
            <p className={`ml-auto text-xs font-medium ${message.includes("berhasil") ? "text-green-600" : "text-orange-500"}`}>
              {message}
            </p>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left">
                    <input type="checkbox"
                      checked={displayed.length > 0 && selected.size === displayed.length}
                      onChange={toggleAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="text-left px-4 py-4 font-semibold text-gray-600">Nama Siswa</th>
                  <th className="text-left px-4 py-4 font-semibold text-gray-600">NIM</th>
                  <th className="text-left px-4 py-4 font-semibold text-gray-600">Mata Pelajaran</th>
                  <th className="text-left px-4 py-4 font-semibold text-gray-600">Semester</th>
                  <th className="text-left px-4 py-4 font-semibold text-gray-600">Nilai</th>
                  <th className="text-left px-4 py-4 font-semibold text-gray-600">Huruf</th>
                  <th className="text-left px-4 py-4 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={8} className="text-center text-gray-400 py-12">Memuat data...</td></tr>
                ) : displayed.length === 0 ? (
                  <tr><td colSpan={8} className="text-center text-gray-400 py-12">Tidak ada nilai yang perlu divalidasi.</td></tr>
                ) : (
                  displayed.map(g => (
                    <tr key={g.id} className={`hover:bg-gray-50 transition ${selected.has(g.id) ? "bg-blue-50" : ""}`}>
                      <td className="px-6 py-3">
                        <input type="checkbox" checked={selected.has(g.id)} onChange={() => toggleSelect(g.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{g.student.user.name}</td>
                      <td className="px-4 py-3 text-gray-600">{g.student.nim}</td>
                      <td className="px-4 py-3 text-gray-600">{g.subject}</td>
                      <td className="px-4 py-3 text-gray-600">{g.semester} {g.year}</td>
                      <td className="px-4 py-3 font-bold text-gray-800">{g.score}</td>
                      <td className="px-4 py-3">
                        <span className={`font-bold text-lg ${g.score >= 75 ? "text-green-600" : g.score >= 55 ? "text-yellow-600" : "text-red-500"}`}>
                          {g.letterGrade}
                        </span>
                      </td>
                      <td className="px-4 py-3">{statusBadge(g.status)}</td>
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