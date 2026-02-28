"use client";

import { useState, useRef } from "react";
import {
    Database,
    Upload,
    Download,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    FileSpreadsheet,
} from "lucide-react";
import { generateData, uploadCSV, previewData } from "@/lib/api";

export default function DataGeneratorPage() {
    const [numRecords, setNumRecords] = useState(1500);
    const [seed, setSeed] = useState(42);
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");
    const [preview, setPreview] = useState<any>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleGenerate = async () => {
        setError("");
        setResult(null);
        setPreview(null);
        setLoading(true);
        try {
            const res = await generateData(numRecords, seed);
            setResult(res);
            // Preview is best-effort; don't let it overwrite the success
            try {
                const prev = await previewData(10);
                setPreview(prev);
            } catch {
                // silently ignore preview failure
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError("");
        setResult(null);
        setPreview(null);
        setUploadLoading(true);
        try {
            const res = await uploadCSV(file);
            setResult(res);
            try {
                const prev = await previewData(10);
                setPreview(prev);
            } catch {
                // silently ignore preview failure
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploadLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">
                    <span className="gradient-text">Data Generator</span>
                </h1>
                <p className="text-slate-500">
                    Generate a synthetic healthcare dataset or upload your own CSV file.
                </p>
            </div>

            {/* Controls */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Generate card */}
                <div className="glass-card p-6 space-y-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center">
                            <Database className="w-5 h-5 text-slate-800" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-800">
                            Synthetic Generator
                        </h2>
                    </div>

                    <div>
                        <label className="text-sm text-slate-500 mb-1 block">
                            Number of Records
                        </label>
                        <input
                            type="number"
                            min={100}
                            max={10000}
                            value={numRecords}
                            onChange={(e) => setNumRecords(+e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:border-sky-400 focus:outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-slate-500 mb-1 block">
                            Random Seed
                        </label>
                        <input
                            type="number"
                            value={seed}
                            onChange={(e) => setSeed(+e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:border-sky-400 focus:outline-none transition"
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="glow-btn w-full flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="spinner" /> Generating...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4" /> Generate Dataset
                            </>
                        )}
                    </button>
                </div>

                {/* Upload card */}
                <div className="glass-card p-6 space-y-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                            <Upload className="w-5 h-5 text-slate-800" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-800">Upload CSV</h2>
                    </div>

                    <p className="text-sm text-slate-500 leading-relaxed">
                        Upload a CSV with columns: Age, Gender, BMI, Blood_Pressure,
                        Cholesterol_Level, Glucose_Level, Smoking_Habit,
                        Physical_Activity_Level, Family_Medical_History,
                        Previous_Hospital_Visits, Disease_Presence, Risk_Category,
                        Medical_Expenses.
                    </p>

                    <input
                        ref={fileRef}
                        type="file"
                        accept=".csv"
                        onChange={handleUpload}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploadLoading}
                        className="w-full px-6 py-3 rounded-xl border border-dashed border-slate-300 hover:border-sky-300 text-slate-600 hover:text-slate-800 transition-all flex items-center justify-center gap-2"
                    >
                        {uploadLoading ? (
                            <>
                                <div className="spinner" /> Uploading...
                            </>
                        ) : (
                            <>
                                <FileSpreadsheet className="w-4 h-4" /> Choose CSV File
                            </>
                        )}
                    </button>

                    <a
                        href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/data/download`}
                        className="inline-flex items-center gap-2 text-sm text-sky-600 hover:text-teal-300 transition"
                    >
                        <Download className="w-4 h-4" /> Download Current Dataset
                    </a>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Success */}
            {result && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <p className="text-sm">{result.message}</p>
                </div>
            )}

            {/* Data preview table */}
            {preview && (
                <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-800">
                            Data Preview ({preview.total_records} records)
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    {preview.columns.map((col: string) => (
                                        <th
                                            key={col}
                                            className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap"
                                        >
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {preview.data.map((row: any, i: number) => (
                                    <tr
                                        key={i}
                                        className="border-b border-slate-800/50 hover:bg-sky-50/30 transition"
                                    >
                                        {preview.columns.map((col: string) => (
                                            <td
                                                key={col}
                                                className="px-3 py-2 whitespace-nowrap text-slate-600"
                                            >
                                                {typeof row[col] === "number"
                                                    ? row[col].toLocaleString()
                                                    : String(row[col])}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Statistics */}
                    {preview.statistics && (
                        <div className="mt-6">
                            <h4 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                                Dataset Statistics
                            </h4>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {Object.entries(preview.statistics).map(
                                    ([col, stats]: [string, any]) => (
                                        <div
                                            key={col}
                                            className="bg-sky-50/50 rounded-xl p-3 border border-sky-100"
                                        >
                                            <p className="text-xs text-slate-500 mb-1">{col}</p>
                                            <div className="grid grid-cols-2 gap-1 text-xs">
                                                <span className="text-slate-500">
                                                    Mean:{" "}
                                                    <span className="text-sky-600">{stats.mean}</span>
                                                </span>
                                                <span className="text-slate-500">
                                                    Std:{" "}
                                                    <span className="text-cyan-600">{stats.std}</span>
                                                </span>
                                                <span className="text-slate-500">
                                                    Min:{" "}
                                                    <span className="text-slate-600">{stats.min}</span>
                                                </span>
                                                <span className="text-slate-500">
                                                    Max:{" "}
                                                    <span className="text-slate-600">{stats.max}</span>
                                                </span>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
