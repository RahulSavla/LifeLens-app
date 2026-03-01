"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
    Activity,
    AlertCircle,
    RefreshCw,
    TrendingUp,
    Target,
    Layers,
    Crosshair,
    Download,
    ChevronRight,
    BrainCircuit,
} from "lucide-react";
import { getMetrics, trainModels, getTreeVisualization } from "@/lib/api";
import DecisionTreeViz from "@/components/DecisionTreeViz";

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

const metricColor = (v: number, thresholds = [0.6, 0.8]) =>
    v >= thresholds[1]
        ? "text-emerald-500"
        : v >= thresholds[0]
            ? "text-amber-500"
            : "text-rose-500";

const metricBg = (v: number, thresholds = [0.6, 0.8]) =>
    v >= thresholds[1]
        ? "bg-emerald-50 border-emerald-100"
        : v >= thresholds[0]
            ? "bg-amber-50 border-amber-100"
            : "bg-rose-50 border-rose-100";

export default function MetricsPage() {
    const [metrics, setMetrics] = useState<any>(null);
    const [treeData, setTreeData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [trainLoading, setTrainLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const m = await getMetrics();
            setMetrics(m);
            try {
                const t = await getTreeVisualization();
                setTreeData(t.tree_structure);
            } catch { /* tree viz optional */ }
        } catch (e: any) {
            toast.error(e.message || "Failed to load model metrics");
        } finally {
            setLoading(false);
        }
    };

    const handleTrain = async () => {
        setTrainLoading(true);
        const toastId = toast.loading("Executing Model Training Pipeline...");
        try {
            await trainModels();
            toast.success("All models trained and evaluated successfully!", { id: toastId });
            await load();
        } catch (e: any) {
            toast.error(e.message || "Model training sequence failed.", { id: toastId });
        } finally {
            setTrainLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const lr = metrics?.linear_regression;
    const dt = metrics?.decision_tree;
    const knn = metrics?.knn;
    const km = metrics?.kmeans;

    return (
        <div className="space-y-10 max-w-7xl mx-auto">
            {/* Header section with image */}
            <motion.div
                className="relative rounded-3xl overflow-hidden shadow-xl"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="absolute inset-0 z-0 h-[250px] sm:h-[300px]">
                    <Image
                        src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop"
                        alt="Machine Learning Models"
                        fill
                        className="object-cover object-center opacity-70 mix-blend-overlay"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-medical-blue/95 via-sky-900/90 to-teal-900/90 backdrop-blur-[1px]" />
                </div>

                <div className="relative z-10 px-6 sm:px-10 py-12 sm:py-16 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
                    <div className="text-white max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sky-200 text-sm font-semibold mb-6 backdrop-blur-md">
                            <BrainCircuit className="w-4 h-4" /> Predictive Engine Performance
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                            Model <span className="text-sky-300">Metrics & Evaluation</span>
                        </h1>
                        <p className="text-sky-100/90 text-lg leading-relaxed mb-6">
                            Comprehensive performance evaluation across Regression, Classification, and Clustering algorithms powering the LifeLens Intelligence platform.
                        </p>
                        {metrics?.training_timestamp && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-black/20 text-sky-100 text-xs font-medium">
                                <Activity className="w-3 h-3" /> Last Trained: <span className="font-mono">{metrics.training_timestamp}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 min-w-max">
                        <button
                            onClick={handleTrain}
                            disabled={trainLoading}
                            className="px-6 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-sky-500/30 disabled:opacity-70"
                        >
                            {trainLoading ? (
                                <><div className="spinner border-t-white border-2 w-5 h-5" /> Retraining...</>
                            ) : (
                                <><RefreshCw className="w-5 h-5" /> Update Models</>
                            )}
                        </button>
                        <a
                            href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/download-model`}
                            className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all backdrop-blur-md border border-white/20 hover:border-white/40 flex items-center justify-center gap-2"
                        >
                            <Download className="w-5 h-5" /> Export Artifacts
                        </a>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-32 space-y-4"
                    >
                        <div className="spinner border-t-medical-blue border-4 w-12 h-12" />
                        <span className="text-slate-500 font-medium animate-pulse">Evaluating model architectures...</span>
                    </motion.div>
                ) : !metrics || (!lr && !dt && !knn && !km) ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="glass-card p-16 text-center border-dashed border-2 border-slate-200 mt-4"
                    >
                        <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                            <BrainCircuit className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-700 mb-3">No Evaluation Data</h3>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto text-lg">
                            The machine learning models must be trained before performance metrics can be generated.
                        </p>
                        <button
                            onClick={handleTrain}
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-medical-gradient hover:shadow-lg text-white font-bold transition-all hover:-translate-y-0.5"
                        >
                            <RefreshCw className="w-5 h-5" /> Initialize Model Training
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                        className="space-y-10"
                    >
                        {/* ─── Decision Tree ───────────────────────────────────────── */}
                        {dt && (
                            <motion.div variants={fadeInUp} className="glass-card p-6 sm:p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-5 transition-opacity">
                                    <Target className="w-48 h-48 text-medical-blue transform translate-x-8 -translate-y-8" />
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 shadow-sm">
                                            <Target className="w-6 h-6 text-sky-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                                                Decision Tree Classifier
                                            </h2>
                                            <p className="text-sm font-medium text-slate-500 mt-1">
                                                Task: Disease Presence Classification
                                            </p>
                                        </div>
                                    </div>
                                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-100 text-slate-600 font-semibold text-sm border border-slate-200 self-start sm:self-auto">
                                        Primary Algorithm
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                    {[
                                        { label: "Accuracy", value: dt.accuracy },
                                        { label: "Precision", value: dt.precision },
                                        { label: "Recall", value: dt.recall },
                                        { label: "F1-Score", value: dt.f1_score },
                                    ].map((m) => (
                                        <div
                                            key={m.label}
                                            className={`rounded-2xl p-5 border shadow-sm transition-all hover:shadow-md ${metricBg(m.value)}`}
                                        >
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{m.label}</p>
                                            <p className={`text-3xl font-black ${metricColor(m.value)} flex items-baseline gap-1`}>
                                                {(m.value * 100).toFixed(1)}<span className="text-lg font-bold opacity-50">%</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Confusion Matrix */}
                                {dt.confusion_matrix && (
                                    <div className="mt-8 pt-8 border-t border-slate-100">
                                        <h4 className="flex items-center gap-2 text-base font-bold text-slate-800 mb-5">
                                            <Layers className="w-4 h-4 text-sky-500" /> Confusion Matrix (Binary)
                                        </h4>
                                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 inline-block">
                                            <table className="w-full text-sm text-center">
                                                <thead>
                                                    <tr>
                                                        <th className="px-4 py-3 bg-slate-50 border-r border-b border-white mix-blend-multiply rounded-tl-xl text-slate-500 font-semibold uppercase text-xs tracking-wider">Actual \ Predicted</th>
                                                        <th className="px-4 py-3 bg-slate-50 border-b border-white mix-blend-multiply font-bold text-slate-700">Pred: Negative (0)</th>
                                                        <th className="px-4 py-3 bg-slate-50 border-b border-white mix-blend-multiply rounded-tr-xl font-bold text-slate-700">Pred: Positive (1)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {dt.confusion_matrix.map(
                                                        (row: number[], i: number) => (
                                                            <tr key={i}>
                                                                <td className="px-4 py-3 bg-slate-50 border-r border-white mix-blend-multiply font-bold text-slate-700 text-left pl-6">
                                                                    Actual: {i === 0 ? "Negative (0)" : "Positive (1)"}
                                                                </td>
                                                                {row.map((val: number, j: number) => (
                                                                    <td
                                                                        key={j}
                                                                        className={`px-4 py-4 font-black text-lg ${i === j
                                                                            ? "text-emerald-600 bg-emerald-50"
                                                                            : "text-rose-600 bg-rose-50"
                                                                            }`}
                                                                    >
                                                                        {val}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ─── Decision Tree Visual (If Data Available) ─── */}
                        {treeData && (
                            <motion.div variants={fadeInUp} className="glass-card overflow-hidden border-l-4 border-l-medical-blue">
                                <DecisionTreeViz data={treeData} />
                            </motion.div>
                        )}

                        <div className="grid lg:grid-cols-2 gap-10">
                            {/* ─── K-Nearest Neighbors ─────────────────────────────────────────────────── */}
                            {knn && (
                                <motion.div variants={fadeInUp} className="glass-card p-6 sm:p-8 flex flex-col group">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3.5 rounded-2xl bg-violet-50 border border-violet-100 shadow-sm">
                                            <Crosshair className="w-6 h-6 text-violet-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                                                K-Nearest Neighbors
                                            </h2>
                                            <p className="text-sm font-medium text-slate-500 mt-1">
                                                Task: Multiclass Risk Categorization
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        {[
                                            { label: "Accuracy", value: knn.accuracy },
                                            { label: "Precision (Macro)", value: knn.precision_macro },
                                            { label: "Recall (Macro)", value: knn.recall_macro },
                                            { label: "F1 (Macro)", value: knn.f1_macro },
                                        ].map((m) => (
                                            <div
                                                key={m.label}
                                                className={`rounded-2xl p-4 border shadow-sm transition-all hover:shadow-md ${metricBg(m.value)}`}
                                            >
                                                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 line-clamp-1">{m.label}</p>
                                                <p className={`text-2xl sm:text-3xl font-black ${metricColor(m.value)} flex items-baseline gap-1`}>
                                                    {(m.value * 100).toFixed(1)}<span className="text-sm sm:text-lg font-bold opacity-50">%</span>
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Confusion Matrix */}
                                    {knn.confusion_matrix && (
                                        <div className="mt-auto pt-6 border-t border-slate-100">
                                            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4">
                                                <Layers className="w-4 h-4 text-violet-500" /> Confusion Matrix (Multiclass)
                                            </h4>
                                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 overflow-x-auto w-full">
                                                <table className="w-full text-xs text-center min-w-[300px]">
                                                    <thead>
                                                        <tr>
                                                            <th className="px-2 py-2 bg-slate-50 border-r border-b border-white mix-blend-multiply rounded-tl-xl text-slate-500 font-semibold">True / Pred</th>
                                                            {["Low", "Medium", "High"].map((l) => (
                                                                <th key={l} className="px-2 py-2 bg-slate-50 border-b border-white mix-blend-multiply font-bold text-slate-700">
                                                                    {l}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {knn.confusion_matrix.map((row: number[], i: number) => (
                                                            <tr key={i}>
                                                                <td className="px-2 py-2 bg-slate-50 border-r border-white mix-blend-multiply font-bold text-slate-700 text-left pl-3">
                                                                    {["Low", "Med", "High"][i]}
                                                                </td>
                                                                {row.map((val: number, j: number) => (
                                                                    <td
                                                                        key={j}
                                                                        className={`px-2 py-3 font-bold text-sm ${i === j
                                                                            ? "text-emerald-600 bg-emerald-50"
                                                                            : val > 0
                                                                                ? "text-rose-500 bg-rose-50"
                                                                                : "text-slate-400 bg-slate-50/50"
                                                                            }`}
                                                                    >
                                                                        {val}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            <div className="space-y-10">
                                {/* ─── Linear Regression ────────────────────────────────────── */}
                                {lr && (
                                    <motion.div variants={fadeInUp} className="glass-card p-6 sm:p-8">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100 shadow-sm">
                                                <TrendingUp className="w-6 h-6 text-amber-500" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                                                    Linear Regression
                                                </h2>
                                                <p className="text-sm font-medium text-slate-500 mt-1">
                                                    Task: Continuous Expense Forecasting
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className={`rounded-xl p-4 border shadow-sm ${metricBg(lr.r2_score)} col-span-2 sm:col-span-1`}>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">R² Variance Score</p>
                                                <p className={`text-3xl font-black ${metricColor(lr.r2_score)}`}>{lr.r2_score}</p>
                                            </div>
                                            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm col-span-1">
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mean Abs. Error</p>
                                                <p className="text-xl font-bold text-slate-800">${lr.mae?.toLocaleString()}</p>
                                            </div>
                                            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm col-span-1">
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Root Mean Sq. Error</p>
                                                <p className="text-xl font-bold text-slate-800">${lr.rmse?.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {lr.coefficients && (
                                            <details className="text-sm group mt-4">
                                                <summary className="text-slate-600 font-bold cursor-pointer hover:text-medical-blue transition flex items-center gap-1 list-none select-none">
                                                    <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" /> Learn Equation Coefficients
                                                </summary>
                                                <div className="grid grid-cols-2 gap-3 mt-4 animate-in slide-in-from-top-2 fade-in duration-200">
                                                    {Object.entries(lr.coefficients).map(([k, v]: any) => (
                                                        <div key={k} className="bg-slate-50 rounded-xl p-3 border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all">
                                                            <p className="text-xs font-bold text-slate-500 capitalize line-clamp-1" title={k}>{k.replace(/_/g, " ")}</p>
                                                            <p className={`text-sm font-bold mt-1 tabular-nums ${v >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                                                {v > 0 ? "+" : ""}{typeof v === 'number' ? v.toFixed(2) : v}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </details>
                                        )}
                                    </motion.div>
                                )}

                                {/* ─── K-Means ─────────────────────────────────────────────── */}
                                {km && (
                                    <motion.div variants={fadeInUp} className="glass-card p-6 sm:p-8">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-sm">
                                                <Layers className="w-6 h-6 text-emerald-500" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                                                    K-Means Clustering
                                                </h2>
                                                <p className="text-sm font-medium text-slate-500 mt-1">
                                                    Task: Unsupervised Segmentation
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
                                                <div className="absolute -right-4 -bottom-4 opacity-5">
                                                    <Layers className="w-24 h-24 text-slate-800" />
                                                </div>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 relative z-10">Optimal Clusters</p>
                                                <p className="text-4xl font-black text-slate-800 relative z-10">{km.optimal_clusters}</p>
                                            </div>
                                            <div className={`rounded-xl p-4 border shadow-sm ${metricBg(km.silhouette_scores?.[km.optimal_clusters] || 0.5, [0.3, 0.5])}`}>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 line-clamp-1">Best Silhouette Score</p>
                                                <p className={`text-3xl font-black ${metricColor(km.silhouette_scores?.[km.optimal_clusters] || 0.5, [0.3, 0.5])}`}>
                                                    {km.silhouette_scores?.[km.optimal_clusters]?.toFixed(3) || "N/A"}
                                                </p>
                                            </div>
                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 col-span-2">
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Segment Population Sizes</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.entries(km.cluster_sizes || {}).map(([k, v]: any) => (
                                                        <span key={k} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm font-bold text-slate-600 shadow-sm hover:border-emerald-300 transition-colors">
                                                            <span className="text-emerald-500 mr-1 opacity-70">#</span>{k}: <span className="text-slate-800 ml-1">{v}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
