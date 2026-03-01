"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
    Activity,
    AlertCircle,
    Download,
    HeartPulse,
    DollarSign,
    ShieldAlert,
    Gauge,
    CheckCircle2,
    ArrowLeft,
    Stethoscope,
    BriefcaseMedical,
    ChevronRight
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

export default function PredictionsPage() {
    const [form, setForm] = useState<PatientInput>(defaultPatient);
    const [loading, setLoading] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [showRecommendations, setShowRecommendations] = useState(false);

    const set = (field: string, value: any) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handlePredict = async () => {
        setLoading(true);
        const toastId = toast.loading("Analyzing patient vitals...");
        try {
            const res = await predict(form);
            setResult(res);
            toast.success("Risk analysis complete.", { id: toastId });
        } catch (e: any) {
            toast.error(e.message || "Failed to run prediction model.", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = async () => {
        setPdfLoading(true);
        const toastId = toast.loading("Generating clinical report PDF...");
        try {
            const blob = await predictAndReport(form);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `patient_report_${Date.now()}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Report downloaded successfully.", { id: toastId });
        } catch (e: any) {
            toast.error(e.message || "Failed to generate report.", { id: toastId });
        } finally {
            setPdfLoading(false);
        }
    };

    const riskColor = (cat: string) =>
        cat === "High"
            ? "text-rose-500"
            : cat === "Medium"
                ? "text-amber-500"
                : "text-emerald-500";

    const riskBg = (cat: string) =>
        cat === "High"
            ? "bg-rose-50 border-rose-200 shadow-rose-500/10"
            : cat === "Medium"
                ? "bg-amber-50 border-amber-200 shadow-amber-500/10"
                : "bg-emerald-50 border-emerald-200 shadow-emerald-500/10";

    const riskFill = (cat: string) =>
        cat === "High"
            ? "bg-rose-500"
            : cat === "Medium"
                ? "bg-amber-500"
                : "bg-emerald-500";


    return (
        <div className="space-y-10 max-w-7xl mx-auto">
            {/* Header with consultation image */}
            <motion.div
                className="relative rounded-3xl overflow-hidden shadow-xl"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="absolute inset-0 z-0 h-[250px]">
                    <Image
                        src="https://images.unsplash.com/photo-1551076805-e18690c5e53b?q=80&w=2070&auto=format&fit=crop"
                        alt="Clinical Assessment"
                        fill
                        className="object-cover object-center opacity-80"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-900/90 via-medical-blue/80 to-sky-900/90 backdrop-blur-[2px]" />
                </div>

                <div className="relative z-10 px-8 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-white max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-teal-300 text-sm font-semibold mb-4 backdrop-blur-md">
                            <Activity className="w-4 h-4" /> Real-time Inference Engine
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
                            Patient <span className="text-teal-400">Risk Assessment</span>
                        </h1>
                        <p className="text-sky-100/90 text-lg leading-relaxed">
                            Input demographic and clinical parameters to instantly predict disease probability, forecast medical expenses, and generate actionable health plans.
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="grid lg:grid-cols-5 gap-8">
                {/* Form Section */}
                <motion.div
                    className="lg:col-span-2 space-y-6"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="glass-card p-8 border-t-4 border-t-medical-blue relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <BriefcaseMedical className="w-24 h-24 text-medical-blue" />
                        </div>

                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center border border-sky-100">
                                <Stethoscope className="w-4 h-4 text-sky-600" />
                            </div>
                            Clinical Parameters
                        </h2>

                        <div className="grid grid-cols-2 gap-5 mb-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Age</label>
                                <input
                                    type="number"
                                    value={form.age}
                                    onChange={(e) => set("age", +e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Gender</label>
                                <select
                                    value={form.gender}
                                    onChange={(e) => set("gender", e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">BMI</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={form.bmi}
                                    onChange={(e) => set("bmi", +e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Systolic BP</label>
                                <input
                                    type="number"
                                    value={form.blood_pressure}
                                    onChange={(e) => set("blood_pressure", +e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Cholesterol</label>
                                <input
                                    type="number"
                                    value={form.cholesterol_level}
                                    onChange={(e) => set("cholesterol_level", +e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Glucose</label>
                                <input
                                    type="number"
                                    value={form.glucose_level}
                                    onChange={(e) => set("glucose_level", +e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-5 mb-8">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Physical Activity</label>
                                <select
                                    value={form.physical_activity_level}
                                    onChange={(e) => set("physical_activity_level", e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Previous Hospitalizations</label>
                                <input
                                    type="number"
                                    value={form.previous_hospital_visits}
                                    onChange={(e) => set("previous_hospital_visits", +e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={form.smoking_habit}
                                        onChange={(e) => set("smoking_habit", e.target.checked)}
                                        className="w-5 h-5 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700">Active Smoker</span>
                                </label>
                                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={form.family_medical_history}
                                        onChange={(e) => set("family_medical_history", e.target.checked)}
                                        className="w-5 h-5 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700">Family History of Disease</span>
                                </label>
                            </div>
                        </div>

                        <button
                            onClick={handlePredict}
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-medical-gradient text-white font-bold text-lg shadow-lg hover:shadow-teal-500/30 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="spinner border-t-white border-2 w-5 h-5" /> <span>Analyzing Profile...</span>
                                </>
                            ) : (
                                <>
                                    <Activity className="w-5 h-5" /> <span>Generate Risk Profile</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Results Section */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        {!result ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full min-h-[500px] glass-card flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-slate-200"
                            >
                                <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6 shadow-inner">
                                    <HeartPulse className="w-12 h-12 text-slate-300" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-700 mb-2">Awaiting Parameters</h3>
                                <p className="text-slate-500 max-w-md">
                                    Input the patient's vitals and demographic data in the side panel, then generate the risk profile to see AI-driven insights.
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="results"
                                className="space-y-6"
                                variants={staggerContainer}
                                initial="hidden"
                                animate="show"
                            >
                                {/* KPI Cards */}
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <motion.div variants={fadeInUp} className="glass-card p-6 border-l-4 border-l-rose-400 group hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-rose-50 rounded-lg text-rose-500"><HeartPulse className="w-5 h-5" /></div>
                                            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Disease Presence</span>
                                        </div>
                                        <p className={`text-3xl font-black tracking-tight ${result.disease_presence ? "text-rose-500" : "text-emerald-500"}`}>
                                            {result.disease_presence ? "Positive" : "Negative"}
                                        </p>
                                        <div className="mt-3 flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${result.disease_probability * 100}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className={`h-full ${result.disease_presence ? 'bg-rose-400' : 'bg-emerald-400'}`}
                                                />
                                            </div>
                                            <span className="text-xs font-semibold text-slate-500">
                                                {(result.disease_probability * 100).toFixed(1)}% Prob
                                            </span>
                                        </div>
                                    </motion.div>

                                    <motion.div variants={fadeInUp} className={`glass-card p-6 border-l-4 ${result.risk_category === 'High' ? 'border-l-rose-500' : result.risk_category === 'Medium' ? 'border-l-amber-500' : 'border-l-emerald-500'} group hover:shadow-md transition-shadow`}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`p-2 rounded-lg ${result.risk_category === 'High' ? 'bg-rose-50 text-rose-500' : result.risk_category === 'Medium' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                                <ShieldAlert className="w-5 h-5" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Risk Category</span>
                                        </div>
                                        <p className={`text-3xl font-black tracking-tight ${riskColor(result.risk_category)}`}>
                                            {result.risk_category} Risk
                                        </p>
                                        <div className="flex gap-3 mt-3">
                                            {Object.entries(result.risk_probabilities || {}).map(([k, v]: any) => (
                                                <div key={k} className="flexflex-col">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{k}</span>
                                                    <span className="block text-xs font-semibold text-slate-600">{(v * 100).toFixed(0)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>

                                    <motion.div variants={fadeInUp} className="glass-card p-6 border-l-4 border-l-sky-500 group hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-sky-50 rounded-lg text-sky-600"><DollarSign className="w-5 h-5" /></div>
                                            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Forecasted Expenses</span>
                                        </div>
                                        <p className="text-3xl font-black text-slate-800 tracking-tight">
                                            ${result.predicted_medical_expenses?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                        <p className="text-xs font-medium text-slate-500 mt-3">Estimated annual cost based on risk profile</p>
                                    </motion.div>

                                    <motion.div variants={fadeInUp} className="glass-card p-6 border-l-4 border-l-violet-500 group hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-violet-50 rounded-lg text-violet-600"><Gauge className="w-5 h-5" /></div>
                                                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Risk Score</span>
                                            </div>
                                            <span className="text-xl font-bold text-slate-800">{result.risk_score?.toFixed(1)}<span className="text-sm text-slate-400">/100</span></span>
                                        </div>

                                        <div className="relative pt-2">
                                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${result.risk_score}%` }}
                                                    transition={{ duration: 1.5, type: "spring", bounce: 0.4 }}
                                                    className={`h-full rounded-full ${riskFill(result.risk_category)}`}
                                                />
                                            </div>
                                            {/* Score markers */}
                                            <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 px-1">
                                                <span>0</span>
                                                <span>Low</span>
                                                <span>Med</span>
                                                <span>High</span>
                                                <span>100</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Detailed Explanation Component */}
                                <motion.div variants={fadeInUp} className={`rounded-2xl p-6 shadow-lg ${riskBg(result.risk_category)} relative overflow-hidden`}>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-16 translate-x-16" />
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10">
                                        <Activity className="w-4 h-4" /> Clinical Explanation
                                    </h3>
                                    <p className="text-slate-700 leading-relaxed font-medium relative z-10">
                                        {result.risk_explanation}
                                    </p>
                                </motion.div>

                                {/* Action Buttons */}
                                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 pt-4">
                                    {result.recommendations && result.recommendations.length > 0 && (
                                        <button
                                            onClick={() => setShowRecommendations(true)}
                                            className="flex-1 py-4 px-6 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-sm group"
                                        >
                                            <BriefcaseMedical className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            View Action Plan
                                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    )}
                                    <button
                                        onClick={handleDownloadReport}
                                        disabled={pdfLoading}
                                        className="sm:w-auto py-4 px-6 rounded-xl bg-white border border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-sky-700 font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {pdfLoading ? (
                                            <><div className="spinner border-t-sky-600 border-2 w-5 h-5" /> PDF...</>
                                        ) : (
                                            <><Download className="w-5 h-5" /> Export PDF</>
                                        )}
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Recommendations Full Screen Modal Overlay */}
            <AnimatePresence>
                {showRecommendations && result && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm overflow-y-auto pt-16 pb-20 px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white max-w-4xl mx-auto rounded-[2.5rem] shadow-2xl overflow-hidden relative"
                        >
                            {/* Decorative Top Banner */}
                            <div className="h-32 bg-medical-gradient absolute top-0 left-0 right-0 z-0" />

                            <div className="relative z-10 px-6 sm:px-12 py-10">
                                <button
                                    onClick={() => setShowRecommendations(false)}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white text-white hover:text-sky-900 backdrop-blur-md transition-all font-semibold shadow-sm mb-10"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Return to Dashboard
                                </button>

                                <div className="text-center mb-12">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white text-teal-500 shadow-xl mb-6 border-4 border-slate-50/50">
                                        <Stethoscope className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">AI-Generated Care Plan</h2>
                                    <p className="text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                                        Personalized, evidence-based interventions generated by the LifeLens AI engine tailored specifically to this patient's risk profile.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {result.recommendations.map((rec: string, i: number) => {
                                        const [title, ...descArr] = rec.split(": ");
                                        const desc = descArr.join(": ");

                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="p-6 rounded-2xl border border-slate-100 bg-slate-50 flex gap-5 items-start hover:shadow-md hover:bg-white transition-all group"
                                            >
                                                <div className="shrink-0 mt-1 bg-white p-2 rounded-full shadow-sm group-hover:bg-teal-50 transition-colors">
                                                    <CheckCircle2 className="w-6 h-6 text-teal-500" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-bold text-slate-800 mb-2">{title}</h4>
                                                    <p className="text-slate-600 leading-relaxed font-medium">{desc || rec}</p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                <div className="mt-14 pt-8 border-t border-slate-100 flex flex-col items-center">
                                    <button
                                        onClick={handleDownloadReport}
                                        className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors font-bold shadow-lg"
                                    >
                                        <Download className="w-5 h-5" /> Export Full Patient Report
                                    </button>
                                    <p className="text-xs text-slate-400 mt-6 max-w-xl text-center font-medium">
                                        <strong>Disclaimer:</strong> This action plan relies on predictive machine learning models and synthetic inference. It is intended for clinical decision support and does not replace professional medical judgment.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
