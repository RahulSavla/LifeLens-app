"use client";

import { useState } from "react";
import {
    Activity,
    AlertCircle,
    Download,
    Heart,
    DollarSign,
    Shield,
    Gauge,
} from "lucide-react";
import { predict, predictAndReport, PatientInput } from "@/lib/api";

const defaultPatient: PatientInput = {
    age: 52,
    gender: "Male",
    bmi: 28.5,
    blood_pressure: 145,
    cholesterol_level: 230,
    glucose_level: 160,
    smoking_habit: true,
    physical_activity_level: "Low",
    family_medical_history: true,
    previous_hospital_visits: 5,
};

export default function PredictionsPage() {
    const [form, setForm] = useState<PatientInput>(defaultPatient);
    const [loading, setLoading] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    const set = (field: string, value: any) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handlePredict = async () => {
        setError("");
        setLoading(true);
        try {
            const res = await predict(form);
            setResult(res);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = async () => {
        setPdfLoading(true);
        try {
            const blob = await predictAndReport(form);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "patient_report.pdf";
            a.click();
            URL.revokeObjectURL(url);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setPdfLoading(false);
        }
    };

    const riskColor = (cat: string) =>
        cat === "High"
            ? "text-red-400"
            : cat === "Medium"
                ? "text-amber-400"
                : "text-emerald-400";

    const riskBg = (cat: string) =>
        cat === "High"
            ? "bg-red-500/10 border-red-500/20"
            : cat === "Medium"
                ? "bg-amber-500/10 border-amber-500/20"
                : "bg-emerald-500/10 border-emerald-500/20";

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">
                    <span className="gradient-text">Patient Predictions</span>
                </h1>
                <p className="text-slate-500">
                    Enter patient vitals to get real-time disease risk, expense forecast,
                    and risk category.
                </p>
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
                {/* Form */}
                <div className="lg:col-span-2 glass-card p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-slate-800 mb-2">
                        Patient Vitals
                    </h2>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Age</label>
                            <input
                                type="number"
                                value={form.age}
                                onChange={(e) => set("age", +e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-sm focus:border-sky-400 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">
                                Gender
                            </label>
                            <select
                                value={form.gender}
                                onChange={(e) => set("gender", e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-sm focus:border-sky-400 focus:outline-none"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">BMI</label>
                            <input
                                type="number"
                                step="0.1"
                                value={form.bmi}
                                onChange={(e) => set("bmi", +e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-sm focus:border-sky-400 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">
                                Blood Pressure
                            </label>
                            <input
                                type="number"
                                value={form.blood_pressure}
                                onChange={(e) => set("blood_pressure", +e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-sm focus:border-sky-400 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">
                                Cholesterol
                            </label>
                            <input
                                type="number"
                                value={form.cholesterol_level}
                                onChange={(e) => set("cholesterol_level", +e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-sm focus:border-sky-400 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">
                                Glucose
                            </label>
                            <input
                                type="number"
                                value={form.glucose_level}
                                onChange={(e) => set("glucose_level", +e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-sm focus:border-sky-400 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-slate-500 block mb-1">
                            Activity Level
                        </label>
                        <select
                            value={form.physical_activity_level}
                            onChange={(e) => set("physical_activity_level", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-sm focus:border-sky-400 focus:outline-none"
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-slate-500 block mb-1">
                            Previous Hospital Visits
                        </label>
                        <input
                            type="number"
                            value={form.previous_hospital_visits}
                            onChange={(e) =>
                                set("previous_hospital_visits", +e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-sm focus:border-sky-400 focus:outline-none"
                        />
                    </div>

                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.smoking_habit}
                                onChange={(e) => set("smoking_habit", e.target.checked)}
                                className="w-4 h-4 rounded accent-sky-500"
                            />
                            Smoker
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.family_medical_history}
                                onChange={(e) =>
                                    set("family_medical_history", e.target.checked)
                                }
                                className="w-4 h-4 rounded accent-sky-500"
                            />
                            Family History
                        </label>
                    </div>

                    <button
                        onClick={handlePredict}
                        disabled={loading}
                        className="glow-btn w-full flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="spinner" /> Predicting...
                            </>
                        ) : (
                            <>
                                <Activity className="w-4 h-4" /> Run Prediction
                            </>
                        )}
                    </button>
                </div>

                {/* Results */}
                <div className="lg:col-span-3 space-y-6">
                    {error && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {result ? (
                        <>
                            {/* KPI Cards */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="stat-card glass-card p-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Heart className="w-5 h-5 text-rose-400" />
                                        <span className="text-sm text-slate-500">
                                            Disease Presence
                                        </span>
                                    </div>
                                    <p
                                        className={`text-2xl font-bold ${result.disease_presence ? "text-red-400" : "text-emerald-400"}`}
                                    >
                                        {result.disease_presence ? "Positive" : "Negative"}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Probability: {(result.disease_probability * 100).toFixed(1)}
                                        %
                                    </p>
                                </div>

                                <div className="stat-card glass-card p-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Shield className="w-5 h-5 text-cyan-400" />
                                        <span className="text-sm text-slate-500">
                                            Risk Category
                                        </span>
                                    </div>
                                    <p
                                        className={`text-2xl font-bold ${riskColor(result.risk_category)}`}
                                    >
                                        {result.risk_category}
                                    </p>
                                    <div className="flex gap-2 mt-1">
                                        {Object.entries(result.risk_probabilities || {}).map(
                                            ([k, v]: any) => (
                                                <span key={k} className="text-xs text-slate-500">
                                                    {k}: {(v * 100).toFixed(0)}%
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>

                                <div className="stat-card glass-card p-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <DollarSign className="w-5 h-5 text-amber-400" />
                                        <span className="text-sm text-slate-500">
                                            Medical Expenses
                                        </span>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-800">
                                        $
                                        {result.predicted_medical_expenses?.toLocaleString(
                                            undefined,
                                            { minimumFractionDigits: 2 }
                                        )}
                                    </p>
                                </div>

                                <div className="stat-card glass-card p-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Gauge className="w-5 h-5 text-violet-400" />
                                        <span className="text-sm text-slate-500">Risk Score</span>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-800">
                                        {result.risk_score?.toFixed(1)}{" "}
                                        <span className="text-sm text-slate-500">/ 100</span>
                                    </p>
                                    {/* Progress bar */}
                                    <div className="w-full h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${result.risk_score > 55
                                                ? "bg-red-500"
                                                : result.risk_score > 38
                                                    ? "bg-amber-500"
                                                    : "bg-emerald-500"
                                                }`}
                                            style={{ width: `${result.risk_score}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Explanation */}
                            <div
                                className={`glass-card p-5 border ${riskBg(result.risk_category)}`}
                            >
                                <h3 className="text-sm font-semibold text-slate-600 mb-2">
                                    Risk Explanation
                                </h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    {result.risk_explanation}
                                </p>
                            </div>

                            {/* Download report */}
                            <button
                                onClick={handleDownloadReport}
                                disabled={pdfLoading}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-sky-300 text-slate-800 text-sm font-medium transition-all"
                            >
                                {pdfLoading ? (
                                    <>
                                        <div className="spinner" /> Generating PDF...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" /> Download Patient Report
                                        (PDF)
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <div className="glass-card p-12 text-center">
                            <Activity className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                            <p className="text-slate-500">
                                Enter patient vitals and click &quot;Run Prediction&quot; to see
                                results.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
