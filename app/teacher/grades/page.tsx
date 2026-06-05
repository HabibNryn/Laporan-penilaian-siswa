"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Save } from "lucide-react";
import {
  calculateFinalScore,
  getLetterGrade,
  isValidScore,
} from "@/lib/grades";

type Student = { id: string; nim: string; user: { name: string } };
type ScoreInput = {
  assignmentScore: string;
  midtermScore: string;
  finalExamScore: string;
};

export default function TeacherGradesPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<string, ScoreInput>>({});
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState<"GANJIL" | "GENAP">("GANJIL");
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/teacher/students")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStudents(data);
        } else {
          setStudents([]);
          setMessage(data?.error ?? "Gagal memuat data siswa.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleScoreChange = (
    id: string,
    field: keyof ScoreInput,
    val: string,
  ) => {
    setGrades((prev) => ({
      ...prev,
      [id]: {
        assignmentScore: prev[id]?.assignmentScore ?? "",
        midtermScore: prev[id]?.midtermScore ?? "",
        finalExamScore: prev[id]?.finalExamScore ?? "",
        [field]: val,
      },
    }));
  };

  const handleSubmit = async () => {
    const payload = students
      .filter((s) => {
        const score = grades[s.id];
        return (
          score?.assignmentScore && score?.midtermScore && score?.finalExamScore
        );
      })
      .map((s) => ({
        studentId: s.id,
        subject,
        assignmentScore: parseFloat(grades[s.id].assignmentScore),
        midtermScore: parseFloat(grades[s.id].midtermScore),
        finalExamScore: parseFloat(grades[s.id].finalExamScore),
        semester,
        year,
      }));

    if (!payload.length) {
      setMessage("Masukkan minimal satu nilai siswa.");
      return;
    }

    const hasInvalidScore = payload.some(
      (g) =>
        !isValidScore(g.assignmentScore) ||
        !isValidScore(g.midtermScore) ||
        !isValidScore(g.finalExamScore),
    );

    if (hasInvalidScore) {
      setMessage("Nilai Tugas, UTS, dan UAS harus berada pada rentang 0-100.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/teacher/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grades: payload }),
      });

      setSaving(false);

      if (res.ok) {
        setMessage("Nilai berhasil disimpan!");
        setGrades({});
      } else {
        const errorData = await res.json();
        setMessage(errorData?.error || "Gagal menyimpan nilai.");
      }
    } catch (err) {
      setSaving(false);
      setMessage("Terjadi kesalahan saat mengirim data. Periksa koneksi Anda.");
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Input Nilai</h1>
          <p className="text-gray-500 text-sm mt-1">
            Masukkan nilai siswa per mata pelajaran
          </p>
        </div>

        {/* Form Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mata Pelajaran
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Contoh: Matematika"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GANJIL">Ganjil</option>
                <option value="GENAP">Genap</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tahun Ajaran
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Grade Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">
                    Nama Siswa
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">
                    NIS
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">
                    Tugas
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">
                    UTS
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">
                    UAS
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">
                    Nilai Akhir
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">
                    Huruf
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-400 py-12">
                      Memuat data siswa...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-400 py-12">
                      Belum ada data siswa.
                    </td>
                  </tr>
                ) : (
                  students.map((s) => {
                    const input = grades[s.id];
                    const assignmentScore = parseFloat(
                      input?.assignmentScore || "0",
                    );
                    const midtermScore = parseFloat(input?.midtermScore || "0");
                    const finalExamScore = parseFloat(
                      input?.finalExamScore || "0",
                    );
                    const hasCompleteScore = Boolean(
                      input?.assignmentScore &&
                      input?.midtermScore &&
                      input?.finalExamScore,
                    );
                    const score = hasCompleteScore
                      ? calculateFinalScore(
                          assignmentScore,
                          midtermScore,
                          finalExamScore,
                        )
                      : 0;
                    return (
                      <tr key={s.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-3 font-medium text-gray-800">
                          {s.user.name}
                        </td>
                        <td className="px-6 py-3 text-gray-600">{s.nim}</td>
                        <td className="px-6 py-3">
                          <ScoreField
                            value={input?.assignmentScore ?? ""}
                            onChange={(value) =>
                              handleScoreChange(s.id, "assignmentScore", value)
                            }
                          />
                        </td>
                        <td className="px-6 py-3">
                          <ScoreField
                            value={input?.midtermScore ?? ""}
                            onChange={(value) =>
                              handleScoreChange(s.id, "midtermScore", value)
                            }
                          />
                        </td>
                        <td className="px-6 py-3">
                          <ScoreField
                            value={input?.finalExamScore ?? ""}
                            onChange={(value) =>
                              handleScoreChange(s.id, "finalExamScore", value)
                            }
                          />
                        </td>
                        <td className="px-6 py-3 font-bold text-gray-800">
                          {hasCompleteScore ? score.toFixed(1) : "-"}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`font-bold text-lg ${
                              score >= 70
                                ? "text-green-600"
                                : score >= 50
                                  ? "text-yellow-600"
                                  : "text-red-500"
                            }`}
                          >
                            {hasCompleteScore ? getLetterGrade(score) : "-"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            {message && (
              <p
                className={`text-sm font-medium ${message.includes("berhasil") ? "text-green-600" : "text-red-500"}`}
              >
                {message}
              </p>
            )}
            <button
              onClick={handleSubmit}
              disabled={saving || !subject}
              className="ml-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
            >
              <Save className="w-4 h-4" />
              {saving ? "Menyimpan..." : "Simpan Nilai"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ScoreField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="number"
      min={0}
      max={100}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}
