"use client";

import { useEffect, useState } from "react";
import {
    LineChart as LineChartIcon,
    AlertCircle,
    RefreshCw,
    TrendingUp,
    Target,
    Layers,
    Crosshair,
    Download,
} from "lucide-react";
import { getMetrics, trainModels, getTreeVisualization } from "@/lib/api";
import DecisionTreeViz from "@/components/DecisionTreeViz";

const metricColor = (v: number, thresholds = [0.6, 0.8]) =>
    v >= thresholds[1]
        ? "text-emerald-400"
        : v >= thresholds[0]
            ? "text-amber-400"
            : "text-red-400";

export default function MetricsPage() {
    const [metrics, setMetrics] = useState<any>(null);
    const [treeData, setTreeData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [trainLoading, setTrainLoading] = useState(false);
    const [error, setError] = useState("");

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const m = await getMetrics();
            setMetrics(m);
            try {
                const t = await getTreeVisualization();
                setTreeData(t.tree_structure);
            } catch { /* tree viz optional */ }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTrain = async () => {
        setTrainLoading(true);
        setError("");
        try {
            await trainModels();
            await load();
        } catch (e: any) {
            setError(e.message);
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
        <div className="space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">
                        <span className="gradient-text">Model Metrics</span>
                    </h1>
                    <p className="text-slate-500">
                        Evaluate and compare all trained ML models.
                    </p>
                    {metrics?.training_timestamp && (
                        <p className="text-xs text-slate-500 mt-1">
                            Last trained: {metrics.training_timestamp}
                        </p>
                    )}
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleTrain}
                        disabled={trainLoading}
                        className="glow-btn flex items-center gap-2 text-sm"
                    >
                        {trainLoading ? (
                            <>
                                <div className="spinner" /> Training...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4" /> Retrain Models
                            </>
                        )}
                    </button>
                    <a
                        href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/download-model`}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:border-sky-300 hover:text-slate-800 transition-all text-sm flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" /> Download Model
                    </a>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="spinner" />
                    <span className="ml-3 text-slate-500">Loading metrics...</span>
                </div>
            ) : !metrics || (!lr && !dt && !knn && !km) ? (
                <div className="glass-card p-12 text-center">
                    <LineChartIcon className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-500 mb-4">
                        No metrics available. Generate data and train models first.
                    </p>
                    <button onClick={handleTrain} className="glow-btn text-sm">
                        Train Models
                    </button>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* ─── Linear Regression ────────────────────────────────────── */}
                    {lr && (
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-slate-800" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-800">
                                        Linear Regression
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Predict Medical Expenses
                                    </p>
                                </div>
                            </div>
                            <div className="grid sm:grid-cols-3 gap-4 mb-6">
                                <div className="bg-sky-50/50 rounded-xl p-4 border border-sky-100 text-center">
                                    <p className="text-xs text-slate-500 mb-1">R² Score</p>
                                    <p
                                        className={`text-3xl font-bold ${metricColor(lr.r2_score)}`}
                                    >
                                        {lr.r2_score}
                                    </p>
                                </div>
                                <div className="bg-sky-50/50 rounded-xl p-4 border border-sky-100 text-center">
                                    <p className="text-xs text-slate-500 mb-1">MAE</p>
                                    <p className="text-3xl font-bold text-slate-800">
                                        {lr.mae?.toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-sky-50/50 rounded-xl p-4 border border-sky-100 text-center">
                                    <p className="text-xs text-slate-500 mb-1">RMSE</p>
                                    <p className="text-3xl font-bold text-slate-800">
                                        {lr.rmse?.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            {lr.coefficients && (
                                <details className="text-sm">
                                    <summary className="text-slate-500 cursor-pointer hover:text-slate-800 transition">
                                        View Coefficients
                                    </summary>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                                        {Object.entries(lr.coefficients).map(([k, v]: any) => (
                                            <div
                                                key={k}
                                                className="bg-slate-800/30 rounded-lg p-2 border border-slate-200/20"
                                            >
                                                <p className="text-xs text-slate-500">{k}</p>
                                                <p
                                                    className={`text-sm font-mono ${v >= 0 ? "text-emerald-400" : "text-red-400"}`}
                                                >
                                                    {v > 0 ? "+" : ""}
                                                    {v}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            )}
                            {treeData && <DecisionTreeViz data={treeData} />}
                        </div>
                    )}

                    {/* ─── Decision Tree ───────────────────────────────────────── */}
                    {dt && (
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                                    <Target className="w-5 h-5 text-slate-800" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-800">
                                        Decision Tree
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Classify Disease Presence
                                    </p>
                                </div>
                            </div>
                            <div className="grid sm:grid-cols-4 gap-4 mb-6">
                                {[
                                    { label: "Accuracy", value: dt.accuracy },
                                    { label: "Precision", value: dt.precision },
                                    { label: "Recall", value: dt.recall },
                                    { label: "F1-Score", value: dt.f1_score },
                                ].map((m) => (
                                    <div
                                        key={m.label}
                                        className="bg-sky-50/50 rounded-xl p-4 border border-sky-100 text-center"
                                    >
                                        <p className="text-xs text-slate-500 mb-1">{m.label}</p>
                                        <p
                                            className={`text-2xl font-bold ${metricColor(m.value)}`}
                                        >
                                            {(m.value * 100).toFixed(1)}%
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Confusion Matrix */}
                            {dt.confusion_matrix && (
                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 mb-3">
                                        Confusion Matrix
                                    </h4>
                                    <div className="inline-block">
                                        <table className="text-sm">
                                            <thead>
                                                <tr>
                                                    <th className="px-4 py-2 text-slate-500"></th>
                                                    <th className="px-4 py-2 text-slate-500">
                                                        Pred: 0
                                                    </th>
                                                    <th className="px-4 py-2 text-slate-500">
                                                        Pred: 1
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dt.confusion_matrix.map(
                                                    (row: number[], i: number) => (
                                                        <tr key={i}>
                                                            <td className="px-4 py-2 text-slate-500 font-medium">
                                                                Actual: {i}
                                                            </td>
                                                            {row.map((val: number, j: number) => (
                                                                <td
                                                                    key={j}
                                                                    className={`px-4 py-2 text-center font-bold rounded ${i === j
                                                                        ? "text-emerald-400 bg-emerald-500/10"
                                                                        : "text-red-400 bg-red-500/10"
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
                        </div>
                    )}

                    {/* ─── KNN ─────────────────────────────────────────────────── */}
                    {knn && (
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                                    <Crosshair className="w-5 h-5 text-slate-800" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-800">
                                        K-Nearest Neighbors
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Predict Risk Category (Best k={knn.best_k})
                                    </p>
                                </div>
                            </div>
                            <div className="grid sm:grid-cols-4 gap-4 mb-6">
                                {[
                                    { label: "Accuracy", value: knn.accuracy },
                                    { label: "Precision (Macro)", value: knn.precision_macro },
                                    { label: "Recall (Macro)", value: knn.recall_macro },
                                    { label: "F1 (Macro)", value: knn.f1_macro },
                                ].map((m) => (
                                    <div
                                        key={m.label}
                                        className="bg-sky-50/50 rounded-xl p-4 border border-sky-100 text-center"
                                    >
                                        <p className="text-xs text-slate-500 mb-1">{m.label}</p>
                                        <p
                                            className={`text-2xl font-bold ${metricColor(m.value)}`}
                                        >
                                            {(m.value * 100).toFixed(1)}%
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Confusion Matrix */}
                            {knn.confusion_matrix && (
                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 mb-3">
                                        Confusion Matrix (Low / Medium / High)
                                    </h4>
                                    <div className="inline-block">
                                        <table className="text-sm">
                                            <thead>
                                                <tr>
                                                    <th className="px-3 py-2 text-slate-500"></th>
                                                    {["Low", "Medium", "High"].map((l) => (
                                                        <th
                                                            key={l}
                                                            className="px-3 py-2 text-slate-500 text-xs"
                                                        >
                                                            Pred: {l}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {knn.confusion_matrix.map(
                                                    (row: number[], i: number) => (
                                                        <tr key={i}>
                                                            <td className="px-3 py-2 text-slate-500 font-medium text-xs">
                                                                {["Low", "Medium", "High"][i]}
                                                            </td>
                                                            {row.map((val: number, j: number) => (
                                                                <td
                                                                    key={j}
                                                                    className={`px-3 py-2 text-center font-bold rounded ${i === j
                                                                        ? "text-emerald-400 bg-emerald-500/10"
                                                                        : val > 0
                                                                            ? "text-red-400 bg-red-500/10"
                                                                            : "text-slate-600"
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
                        </div>
                    )}

                    {/* ─── K-Means ─────────────────────────────────────────────── */}
                    {km && (
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                    <Layers className="w-5 h-5 text-slate-800" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-800">
                                        K-Means Clustering
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Optimal Clusters: {km.optimal_clusters}
                                    </p>
                                </div>
                            </div>
                            <div className="grid sm:grid-cols-3 gap-4">
                                <div className="bg-sky-50/50 rounded-xl p-4 border border-sky-100 text-center">
                                    <p className="text-xs text-slate-500 mb-1">
                                        Optimal Clusters
                                    </p>
                                    <p className="text-3xl font-bold text-sky-600">
                                        {km.optimal_clusters}
                                    </p>
                                </div>
                                <div className="bg-sky-50/50 rounded-xl p-4 border border-sky-100 text-center">
                                    <p className="text-xs text-slate-500 mb-1">
                                        Best Silhouette Score
                                    </p>
                                    <p className="text-3xl font-bold text-cyan-400">
                                        {km.silhouette_scores?.[km.optimal_clusters]}
                                    </p>
                                </div>
                                <div className="bg-sky-50/50 rounded-xl p-4 border border-sky-100">
                                    <p className="text-xs text-slate-500 mb-2">Cluster Sizes</p>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(km.cluster_sizes || {}).map(
                                            ([k, v]: any) => (
                                                <span
                                                    key={k}
                                                    className="px-2 py-1 rounded-lg bg-slate-700/50 text-xs text-slate-600"
                                                >
                                                    C{k}: {v}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
