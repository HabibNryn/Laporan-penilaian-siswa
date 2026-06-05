"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { FileDown, Printer } from "lucide-react";

type Grade = {
  id: string; subject: string; score: number;
  letterGrade: string; semester: string; year: number;
};
type StudentInfo = {
  nim: string; class: string; major: string; year: number;
  user: { name: string; email: string };
};

export default function StudentReportPage() {
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [grades, setGrades]   = useState<Grade[]>([]);
  const [filter, setFilter]   = useState({ semester: "", year: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/student/profile").then(r => r.json()),
      fetch("/api/student/grades").then(r => r.json()),
    ]).then(([s, g]) => {
      setStudent(s);
      setGrades(g);
      setLoading(false);
    });
  }, []);

  const filtered = grades.filter(g =>
    (!filter.semester || g.semester === filter.semester) &&
    (!filter.year || g.year === parseInt(filter.year))
  );

  const avg = filtered.length
    ? (filtered.reduce((s, g) => s + g.score, 0) / filtered.length).toFixed(2)
    : "0";

  const years = [...new Set(grades.map(g => g.year))].sort((a, b) => b - a);

  const handlePrint = () => window.print();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Laporan Akademik</h1>
            <p className="text-gray-500 text-sm mt-1">Cetak atau unduh laporan nilai Anda</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 text-sm border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              <Printer className="w-4 h-4" /> Cetak
            </button>
            <button className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
              <FileDown className="w-4 h-4" /> Unduh PDF
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Semester</label>
            <select
              value={filter.semester}
              onChange={e => setFilter(f => ({ ...f, semester: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua</option>
              <option value="GANJIL">Ganjil</option>
              <option value="GENAP">Genap</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tahun</label>
            <select
              value={filter.year}
              onChange={e => setFilter(f => ({ ...f, year: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Report Card */}
        <div id="report-card" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-gray-300">
          {/* Header */}
          <div className="bg-blue-600 text-white px-8 py-6 print:bg-blue-600">
            <h2 className="text-xl font-bold text-center">LAPORAN AKADEMIK SISWA</h2>
            <p className="text-blue-200 text-center text-sm mt-1">Sistem Manajemen Nilai — {new Date().getFullYear()}</p>
          </div>

          {/* Student Info */}
          {student && (
            <div className="px-8 py-5 border-b border-gray-100 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <Row label="Nama Lengkap"  value={student.user.name} />
              <Row label="NIM"           value={student.nim} />
              <Row label="Kelas"         value={student.class} />
              <Row label="Jurusan"       value={student.major} />
              <Row label="Tahun Masuk"   value={student.year.toString()} />
              <Row label="Email"         value={student.user.email} />
            </div>
          )}

          {/* Grades */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">No</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Mata Pelajaran</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Semester</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Tahun</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Nilai</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Huruf</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={7} className="text-center text-gray-400 py-10">Memuat...</td></tr>
                ) : !filtered.length ? (
                  <tr><td colSpan={7} className="text-center text-gray-400 py-10">Tidak ada data.</td></tr>
                ) : (
                  filtered.map((g, i) => (
                    <tr key={g.id}>
                      <td className="px-6 py-3 text-gray-500">{i + 1}</td>
                      <td className="px-6 py-3 font-medium text-gray-800">{g.subject}</td>
                      <td className="px-6 py-3 text-gray-600">{g.semester}</td>
                      <td className="px-6 py-3 text-gray-600">{g.year}</td>
                      <td className="px-6 py-3 font-bold text-gray-800">{g.score}</td>
                      <td className="px-6 py-3">
                        <span className={`font-bold text-lg ${g.score >= 75 ? "text-green-600" : g.score >= 55 ? "text-yellow-600" : "text-red-500"}`}>
                          {g.letterGrade}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          g.score >= 75 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                        }`}>
                          {g.score >= 75 ? "Lulus" : "Tidak Lulus"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {filtered.length > 0 && (
                <tfoot>
                  <tr className="bg-blue-50 border-t-2 border-blue-200">
                    <td colSpan={4} className="px-6 py-3 font-semibold text-gray-700 text-right">
                      Rata-rata Nilai:
                    </td>
                    <td className="px-6 py-3 font-bold text-blue-700 text-lg">{avg}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          <div className="px-8 py-4 text-xs text-gray-400 border-t border-gray-100">
            Dicetak pada: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-500 w-32 flex-shrink-0">{label}</span>
      <span className="text-gray-800 font-medium">: {value}</span>
    </div>
  );
}