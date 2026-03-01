"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
    Database,
    Upload,
    Download,
    RefreshCw,
    FileSpreadsheet,
    Activity,
} from "lucide-react";
import { generateData, uploadCSV, previewData } from "@/lib/api";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

export default function DataGeneratorPage() {
    const [numRecords, setNumRecords] = useState(1500);
    const [seed, setSeed] = useState(42);
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [preview, setPreview] = useState<any>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleGenerate = async () => {
        setPreview(null);
        setLoading(true);
        const toastId = toast.loading("Synthesizing clinical data...");
        try {
            const res = await generateData(numRecords, seed) as { message?: string };
            toast.success(res.message || "Data generated successfully!", { id: toastId });
            try {
                const prev = await previewData(10);
                setPreview(prev);
            } catch {
                // silently ignore preview failure
            }
        } catch (e: any) {
            toast.error(e.message || "Failed to generate data.", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPreview(null);
        setUploadLoading(true);
        const toastId = toast.loading("Processing clinical dataset...");
        try {
            const res = await uploadCSV(file);
            toast.success(res.message || "Dataset uploaded successfully!", { id: toastId });
            try {
                const prev = await previewData(10);
                setPreview(prev);
            } catch {
                // silently ignore preview failure
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to upload dataset.", { id: toastId });
        } finally {
            setUploadLoading(false);
            if (fileRef.current) fileRef.current.value = ''; // Reset file input
        }
    };

    return (
        <motion.div
            className="space-y-10 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
        >
            {/* Header */}
            <motion.div variants={fadeInUp} className="text-center space-y-4 mb-12 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-teal-400/10 blur-[50px] rounded-full pointer-events-none" />
                <div className="inline-flex items-center justify-center p-3 bg-medical-gradient rounded-2xl shadow-lg shadow-teal-500/20 mb-4">
                    <Database className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">
                    Clinical Data <span className="text-teal-500">Engine</span>
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                    Generate highly realistic synthetic patient cohorts or securely import your own clinical datasets for predictive modeling.
                </p>
            </motion.div>

            {/* Controls */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Generate card */}
                <motion.div variants={fadeInUp} className="glass-card p-8 relative overflow-hidden group h-full flex flex-col">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                        <Activity className="w-32 h-32 text-teal-600" />
                    </div>

                    <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center border border-teal-100">
                            <RefreshCw className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">
                                Synthetic Generation
                            </h2>
                            <p className="text-sm text-slate-500">Create AI-driven synthetic patient profiles</p>
                        </div>
                    </div>

                    <div className="space-y-5 relative z-10 flex flex-col flex-grow mt-6">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                Cohort Size (Records)
                            </label>
                            <input
                                type="number"
                                min={100}
                                max={10000}
                                value={numRecords}
                                onChange={(e) => setNumRecords(+e.target.value)}
                                className="w-full px-5 py-3 rounded-xl bg-slate-50/50 border border-slate-200 text-slate-800 focus:border-teal-400 focus:ring-4 focus:ring-teal-400/10 focus:outline-none transition-all font-medium"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                Randomization Seed
                            </label>
                            <input
                                type="number"
                                value={seed}
                                onChange={(e) => setSeed(+e.target.value)}
                                className="w-full px-5 py-3 rounded-xl bg-slate-50/50 border border-slate-200 text-slate-800 focus:border-teal-400 focus:ring-4 focus:ring-teal-400/10 focus:outline-none transition-all font-medium"
                            />
                        </div>

                        <div className="mt-auto pt-4">
                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="w-full py-4 rounded-xl bg-medical-gradient text-white font-bold text-lg shadow-lg hover:shadow-teal-500/30 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner border-t-white border-2 w-5 h-5" /> <span>Synthesizing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Database className="w-5 h-5" /> <span>Generate Dataset</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Upload card */}
                <motion.div variants={fadeInUp} className="glass-card p-8 relative overflow-hidden group h-full flex flex-col">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                        <Upload className="w-32 h-32 text-sky-600" />
                    </div>

                    <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                        <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center border border-sky-100">
                            <FileSpreadsheet className="w-6 h-6 text-sky-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Dataset Import</h2>
                            <p className="text-sm text-slate-500">Upload existing clinical CSV records</p>
                        </div>
                    </div>

                    <div className="space-y-6 relative z-10 flex flex-col flex-grow mt-6">
                        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                            Required fields: Age, Gender, BMI, Blood_Pressure,
                            Cholesterol, Glucose, Smoking_Habit,
                            Physical_Activity, Family_History,
                            Previous_Visits, Disease_Presence, Risk_Category,
                            Expenses.
                        </p>

                        <input
                            ref={fileRef}
                            type="file"
                            accept=".csv"
                            onChange={handleUpload}
                            className="hidden"
                        />

                        <div className="mt-auto pt-4 space-y-4">
                            <button
                                onClick={() => fileRef.current?.click()}
                                disabled={uploadLoading}
                                className="w-full py-4 rounded-xl border-2 border-dashed border-sky-200 bg-sky-50/50 hover:bg-sky-50 hover:border-sky-400 text-sky-700 font-bold text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {uploadLoading ? (
                                    <>
                                        <div className="spinner border-t-sky-600 border-2 w-5 h-5" /> <span>Importing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5" /> <span>Select CSV File</span>
                                    </>
                                )}
                            </button>

                            <a
                                href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/data/download`}
                                className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-teal-600 transition-colors py-2"
                            >
                                <Download className="w-4 h-4" /> Download Active Dataset
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Data preview table */}
            {preview && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="glass-card p-8 border-t-4 border-t-teal-500 rounded-2xl mt-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800">
                                Cohort Preview
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">First {preview.data.length} of {preview.total_records.toLocaleString()} total records loaded</p>
                        </div>
                        <div className="bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-teal-100">
                            <Database className="w-4 h-4" /> Active Dataset
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    {preview.columns.map((col: string) => (
                                        <th
                                            key={col}
                                            className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap"
                                        >
                                            {col.replace(/_/g, ' ')}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {preview.data.map((row: any, i: number) => (
                                    <tr
                                        key={i}
                                        className="hover:bg-sky-50/50 transition-colors"
                                    >
                                        {preview.columns.map((col: string) => (
                                            <td
                                                key={col}
                                                className="px-4 py-3 whitespace-nowrap text-slate-600 font-medium"
                                            >
                                                {typeof row[col] === "number"
                                                    ? (col.toLowerCase().includes('expense') ? `$${row[col].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : row[col].toLocaleString())
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
                        <div className="mt-10 pt-8 border-t border-slate-100">
                            <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-teal-500" />
                                Clinical Population Metrics
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {Object.entries(preview.statistics).map(
                                    ([col, stats]: [string, any]) => (
                                        <div
                                            key={col}
                                            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <p className="text-sm font-bold text-slate-700 mb-3 truncate" title={col.replace(/_/g, ' ')}>{col.replace(/_/g, ' ')}</p>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between items-center bg-slate-50 px-3 py-1.5 rounded-lg">
                                                    <span className="text-slate-500 font-medium">Mean</span>
                                                    <span className="text-slate-800 font-bold">{stats.mean}</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-slate-50 px-3 py-1.5 rounded-lg">
                                                    <span className="text-slate-500 font-medium">Std Dev</span>
                                                    <span className="text-slate-800 font-bold">{stats.std}</span>
                                                </div>
                                                <div className="flex justify-between items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                                                    <div className="text-xs">
                                                        <span className="text-slate-400 block mb-0.5">Min</span>
                                                        <span className="text-slate-600 font-semibold">{stats.min}</span>
                                                    </div>
                                                    <div className="text-xs text-right">
                                                        <span className="text-slate-400 block mb-0.5">Max</span>
                                                        <span className="text-slate-600 font-semibold">{stats.max}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
}
