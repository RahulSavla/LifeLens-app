"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import DecisionTreeViz from "@/components/DecisionTreeViz";
import {
    Activity,
    AlertCircle,
    RefreshCw,
    Layers,
    Network,
    TrendingUp,
    ListFilter,
    TableProperties
} from "lucide-react";
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    LineChart,
    Line,
    Legend,
} from "recharts";
import {
    getClusters,
    getMetrics,
    getFeatureImportance,
    trainModels,
    getTreeVisualization,
} from "@/lib/api";

const CLUSTER_COLORS = [
    "#0E6BA8", // Medical Blue
    "#14B8A6", // Soft Teal
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#8B5CF6", // Violet
    "#22C55E", // Green
    "#EC4899", // Pink
    "#06B6D4", // Cyan
];

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

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-slate-100 text-sm">
                <p className="font-bold text-slate-800 mb-1">{label !== undefined ? label : "Data Point"}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-slate-600">
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color || entry.fill }}
                        />
                        <span className="font-medium">{entry.name}:</span>
                        <span className="font-bold text-slate-800">
                            {typeof entry.value === 'number' ? entry.value.toFixed(4) : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function VisualizationsPage() {
    const [loading, setLoading] = useState(true);
    const [trainLoading, setTrainLoading] = useState(false);
    const [clusters, setClusters] = useState<any>(null);
    const [metrics, setMetrics] = useState<any>(null);
    const [importance, setImportance] = useState<any>(null);
    const [treeData, setTreeData] = useState<any>(null);

    const loadAll = async () => {
        setLoading(true);
        try {
            const [c, m, fi] = await Promise.all([
                getClusters().catch(() => null),
                getMetrics().catch(() => null),
                getFeatureImportance().catch(() => null),
            ]);
            setClusters(c);
            setMetrics(m);
            setImportance(fi);
            try {
                const t = await getTreeVisualization();
                setTreeData(t.tree_structure);
            } catch {
                setTreeData(null);
            }
        } catch (e: any) {
            toast.error(e.message || "Failed to load visualization data");
        } finally {
            setLoading(false);
        }
    };

    const handleTrain = async () => {
        setTrainLoading(true);
        const toastId = toast.loading("Training Machine Learning Models...");
        try {
            await trainModels();
            toast.success("Models trained successfully!", { id: toastId });
            await loadAll();
        } catch (e: any) {
            toast.error(e.message || "Model training failed.", { id: toastId });
        } finally {
            setTrainLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
    }, []);

    // Prepare chart data
    const featureImportanceData = importance?.decision_tree
        ? Object.entries(importance.decision_tree)
            .map(([name, value]: any) => ({ name, value: +value }))
            .sort((a: any, b: any) => b.value - a.value)
        : [];

    const elbowData = metrics?.kmeans?.inertias
        ? Object.entries(metrics.kmeans.inertias).map(([k, v]: any) => ({
            k: +k,
            inertia: +v,
        }))
        : [];

    const silhouetteData = metrics?.kmeans?.silhouette_scores
        ? Object.entries(metrics.kmeans.silhouette_scores).map(([k, v]: any) => ({
            k: +k,
            score: +v,
        }))
        : [];

    const kScoresData = metrics?.knn?.k_scores
        ? Object.entries(metrics.knn.k_scores).map(([k, v]: any) => ({
            k: +k,
            accuracy: +v,
        }))
        : [];

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
                        src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop"
                        alt="Medical Data Intelligence"
                        fill
                        className="object-cover object-center opacity-70"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-900/95 via-medical-blue/90 to-sky-900/90 backdrop-blur-[1px]" />
                </div>

                <div className="relative z-10 px-6 sm:px-10 py-12 sm:py-16 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
                    <div className="text-white max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-teal-300 text-sm font-semibold mb-6 backdrop-blur-md">
                            <Network className="w-4 h-4" /> AI Data Intelligence
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                            Patient <span className="text-teal-400">Segmentation & Insights</span>
                        </h1>
                        <p className="text-sky-100/90 text-lg leading-relaxed">
                            Interactive visual analytics exploring demographic clusters, machine learning feature importance, and model performance metrics.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 min-w-max">
                        <button
                            onClick={handleTrain}
                            disabled={trainLoading}
                            className="px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-teal-500/30 disabled:opacity-70"
                        >
                            {trainLoading ? (
                                <><div className="spinner border-t-white border-2 w-5 h-5" /> Training Models...</>
                            ) : (
                                <><RefreshCw className="w-5 h-5" /> Retrain Models</>
                            )}
                        </button>
                        <button
                            onClick={loadAll}
                            disabled={loading}
                            className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all backdrop-blur-md border border-white/20 hover:border-white/40 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><div className="spinner w-5 h-5" /> Loading...</>
                            ) : (
                                <><Activity className="w-5 h-5" /> Refresh Data</>
                            )}
                        </button>
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
                        <span className="text-slate-500 font-medium animate-pulse">Processing demographic segments & generating charts...</span>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                        className="grid lg:grid-cols-2 gap-8"
                    >
                        {/* PCA Cluster Scatter */}
                        {clusters?.pca_data && (
                            <motion.div variants={fadeInUp} className="glass-card p-4 sm:p-8 lg:col-span-2 group">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 shadow-sm shrink-0">
                                            <Layers className="w-6 h-6 text-medical-blue" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Population Clustering (PCA 2D Projection)</h3>
                                            <p className="text-sm text-slate-500 mt-1 font-medium">Visual representation of distinct patient segments identified by K-Means</p>
                                        </div>
                                    </div>
                                    <div className="sm:ml-auto inline-flex items-center px-4 py-2 rounded-full bg-teal-50 text-teal-700 text-sm font-bold border border-teal-200 shrink-0 self-start sm:self-auto">
                                        <span className="w-2 h-2 rounded-full bg-teal-500 mr-2 animate-pulse" />
                                        {clusters.optimal_clusters} Derived Clusters
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm transition-all group-hover:border-sky-200 group-hover:shadow-md">
                                    <ResponsiveContainer width="100%" height={500}>
                                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                            <XAxis
                                                dataKey="x"
                                                name="Principal Component 1"
                                                stroke="#94A3B8"
                                                tick={{ fill: "#64748B", fontSize: 13, fontWeight: 500 }}
                                                tickLine={false}
                                                axisLine={{ stroke: '#E2E8F0', strokeWidth: 2 }}
                                            />
                                            <YAxis
                                                dataKey="y"
                                                name="Principal Component 2"
                                                stroke="#94A3B8"
                                                tick={{ fill: "#64748B", fontSize: 13, fontWeight: 500 }}
                                                tickLine={false}
                                                axisLine={{ stroke: '#E2E8F0', strokeWidth: 2 }}
                                            />
                                            <Tooltip cursor={{ strokeDasharray: '3 3', stroke: '#CBD5E1' }} content={<CustomTooltip />} />
                                            {Array.from(
                                                { length: clusters.optimal_clusters },
                                                (_, i) => i
                                            ).map((cluster) => (
                                                <Scatter
                                                    key={cluster}
                                                    name={`Segment ${cluster}`}
                                                    data={clusters.pca_data.filter((d: any) => d.cluster === cluster)}
                                                    fill={CLUSTER_COLORS[cluster % CLUSTER_COLORS.length]}
                                                    fillOpacity={0.7}
                                                    stroke={CLUSTER_COLORS[cluster % CLUSTER_COLORS.length]}
                                                    strokeWidth={1.5}
                                                />
                                            ))}
                                            <Legend
                                                wrapperStyle={{ paddingTop: '20px' }}
                                                iconType="circle"
                                            />
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        )}

                        {/* Cluster Summary Table */}
                        {clusters?.cluster_summary && (
                            <motion.div variants={fadeInUp} className="glass-card p-4 sm:p-8 lg:col-span-2 overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-5 transition-opacity">
                                    <TableProperties className="w-48 h-48 text-medical-blue transform translate-x-8 -translate-y-8" />
                                </div>

                                <div className="flex items-center gap-4 mb-8 relative z-10">
                                    <div className="p-3 bg-teal-50 rounded-2xl border border-teal-100 shadow-sm">
                                        <ListFilter className="w-6 h-6 text-teal-600" />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                                        Demographic Segment Analysis
                                    </h3>
                                </div>

                                <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white relative z-10">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                {["Segment", "Size", "Avg Age", "Avg BMI", "Avg BP", "Avg Chol", "Avg Glu", "Avg Est. Expenses", "Disease Rate", "Smoker Rate"].map((h) => (
                                                    <th key={h} className="px-5 py-4 font-bold text-slate-600 uppercase tracking-wider text-[11px] whitespace-nowrap">
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {clusters.cluster_summary.map((row: any) => (
                                                <tr
                                                    key={row.cluster}
                                                    className="hover:bg-sky-50/50 transition-colors"
                                                >
                                                    <td className="px-5 py-4 font-bold text-slate-800 flex items-center gap-3">
                                                        <span
                                                            className="inline-block w-3 h-3 rounded-full shadow-sm"
                                                            style={{ backgroundColor: CLUSTER_COLORS[row.cluster % CLUSTER_COLORS.length] }}
                                                        />
                                                        S-{row.cluster}
                                                    </td>
                                                    <td className="px-5 py-4 text-slate-600 font-semibold">{row.size}</td>
                                                    <td className="px-5 py-4 text-slate-600">{row.avg_age}</td>
                                                    <td className="px-5 py-4 text-slate-600">{row.avg_bmi}</td>
                                                    <td className="px-5 py-4 text-slate-600">{row.avg_bp}</td>
                                                    <td className="px-5 py-4 text-slate-600">{row.avg_cholesterol}</td>
                                                    <td className="px-5 py-4 text-slate-600">{row.avg_glucose}</td>
                                                    <td className="px-5 py-4 font-bold text-teal-600">
                                                        ${row.avg_expenses?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                    </td>
                                                    <td className="px-5 py-4 text-slate-600">
                                                        <span className={`px-2.5 py-1 rounded-md border text-xs font-bold ${row.disease_rate > 0.5 ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
                                                            {(row.disease_rate * 100).toFixed(1)}%
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-slate-600 font-medium">
                                                        {(row.smoking_rate * 100).toFixed(1)}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {/* Feature Importance */}
                        {featureImportanceData.length > 0 && (
                            <motion.div variants={fadeInUp} className="glass-card p-6 sm:p-8 h-[550px] flex flex-col group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 shadow-sm shrink-0">
                                        <TrendingUp className="w-6 h-6 text-amber-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">
                                        Diagnostic Feature Impact
                                    </h3>
                                </div>
                                <div className="flex-1 min-h-0 bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm transition-all group-hover:border-amber-200 group-hover:shadow-md">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={featureImportanceData}
                                            layout="vertical"
                                            margin={{ left: 10, right: 30 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={true} vertical={false} />
                                            <XAxis
                                                type="number"
                                                stroke="#94A3B8"
                                                tick={{ fill: "#64748B", fontSize: 13, fontWeight: 500 }}
                                                tickLine={false}
                                                axisLine={{ stroke: '#E2E8F0', strokeWidth: 2 }}
                                            />
                                            <YAxis
                                                type="category"
                                                dataKey="name"
                                                stroke="#94A3B8"
                                                tick={{ fill: "#475569", fontSize: 12, fontWeight: 600 }}
                                                tickLine={false}
                                                axisLine={{ stroke: '#E2E8F0', strokeWidth: 2 }}
                                                width={110}
                                            />
                                            <Tooltip cursor={{ fill: '#F8FAFC' }} content={<CustomTooltip />} />
                                            <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
                                                {featureImportanceData.map((_: any, i: number) => (
                                                    <Cell key={i} fill={CLUSTER_COLORS[i % CLUSTER_COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        )}

                        {/* Elbow Curve */}
                        {elbowData.length > 0 && (
                            <motion.div variants={fadeInUp} className="glass-card p-6 sm:p-8 h-[550px] flex flex-col group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 shadow-sm shrink-0">
                                        <Network className="w-6 h-6 text-sky-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">
                                        Optimal Clusters (Elbow Method)
                                    </h3>
                                </div>
                                <div className="flex-1 min-h-0 bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm transition-all group-hover:border-sky-200 group-hover:shadow-md">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={elbowData} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                            <XAxis
                                                dataKey="k"
                                                stroke="#94A3B8"
                                                tick={{ fill: "#64748B", fontSize: 13, fontWeight: 500 }}
                                                tickLine={false}
                                                axisLine={{ stroke: '#E2E8F0', strokeWidth: 2 }}
                                                label={{ value: "Number of Clusters (k)", fill: "#64748B", position: "bottom", offset: -5, fontSize: 13, fontWeight: 600 }}
                                            />
                                            <YAxis
                                                stroke="#94A3B8"
                                                tick={{ fill: "#64748B", fontSize: 13, fontWeight: 500 }}
                                                tickLine={false}
                                                axisLine={{ stroke: '#E2E8F0', strokeWidth: 2 }}
                                                label={{ value: "Inertia (WCSS)", fill: "#64748B", angle: -90, position: "insideLeft", fontSize: 13, fontWeight: 600 }}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Line
                                                type="monotone"
                                                dataKey="inertia"
                                                stroke="#0E6BA8"
                                                strokeWidth={4}
                                                dot={{ fill: "#0E6BA8", r: 5, strokeWidth: 2, stroke: "#fff" }}
                                                activeDot={{ r: 8, strokeWidth: 0 }}
                                                animationDuration={1500}
                                                animationEasing="ease-out"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        )}

                        {/* Silhouette Scores */}
                        {silhouetteData.length > 0 && (
                            <motion.div variants={fadeInUp} className="glass-card p-6 sm:p-8 h-[550px] flex flex-col group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm shrink-0">
                                        <Layers className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">
                                        Cluster Cohesion (Silhouette)
                                    </h3>
                                </div>
                                <div className="flex-1 min-h-0 bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm transition-all group-hover:border-emerald-200 group-hover:shadow-md">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={silhouetteData} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                            <XAxis
                                                dataKey="k"
                                                stroke="#94A3B8"
                                                tick={{ fill: "#64748B", fontSize: 13, fontWeight: 500 }}
                                                tickLine={false}
                                                axisLine={{ stroke: '#E2E8F0', strokeWidth: 2 }}
                                                label={{ value: "Number of Clusters (k)", fill: "#64748B", position: "bottom", offset: -5, fontSize: 13, fontWeight: 600 }}
                                            />
                                            <YAxis
                                                stroke="#94A3B8"
                                                tick={{ fill: "#64748B", fontSize: 13, fontWeight: 500 }}
                                                tickLine={false}
                                                axisLine={{ stroke: '#E2E8F0', strokeWidth: 2 }}
                                                label={{ value: "Silhouette Score", fill: "#64748B", angle: -90, position: "insideLeft", fontSize: 13, fontWeight: 600 }}
                                            />
                                            <Tooltip cursor={{ fill: '#F8FAFC' }} content={<CustomTooltip />} />
                                            <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={36}>
                                                {silhouetteData.map((_: any, i: number) => (
                                                    <Cell key={i} fill={CLUSTER_COLORS[i % CLUSTER_COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        )}

                        {/* KNN k-Optimization */}
                        {kScoresData.length > 0 && (
                            <motion.div variants={fadeInUp} className="glass-card p-6 sm:p-8 h-[550px] flex flex-col group">
                                <div className="flex flex-wrap items-center gap-4 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-violet-50 rounded-2xl border border-violet-100 shadow-sm shrink-0">
                                            <Network className="w-6 h-6 text-violet-500" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">
                                            KNN Parameter Tuning
                                        </h3>
                                    </div>
                                    <span className="sm:ml-auto inline-flex items-center px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-bold border border-violet-200">
                                        Optimal k = {metrics?.knn?.best_k}
                                    </span>
                                </div>
                                <div className="flex-1 min-h-0 bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm transition-all group-hover:border-violet-200 group-hover:shadow-md">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={kScoresData} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                            <XAxis
                                                dataKey="k"
                                                stroke="#94A3B8"
                                                tick={{ fill: "#64748B", fontSize: 13, fontWeight: 500 }}
                                                tickLine={false}
                                                axisLine={{ stroke: '#E2E8F0', strokeWidth: 2 }}
                                                label={{ value: "Neighbors (k)", fill: "#64748B", position: "bottom", offset: -5, fontSize: 13, fontWeight: 600 }}
                                            />
                                            <YAxis
                                                stroke="#94A3B8"
                                                tick={{ fill: "#64748B", fontSize: 13, fontWeight: 500 }}
                                                tickLine={false}
                                                axisLine={{ stroke: '#E2E8F0', strokeWidth: 2 }}
                                                domain={['auto', 'auto']}
                                                label={{ value: "Accuracy", fill: "#64748B", angle: -90, position: "insideLeft", fontSize: 13, fontWeight: 600 }}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Line
                                                type="monotone"
                                                dataKey="accuracy"
                                                stroke="#8B5CF6"
                                                strokeWidth={4}
                                                dot={{ fill: "#8B5CF6", r: 5, strokeWidth: 2, stroke: "#fff" }}
                                                activeDot={{ r: 8, strokeWidth: 0, fill: "#6D28D9" }}
                                                animationDuration={1500}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        )}

                        {/* Decision Tree Visualization Component */}
                        {treeData && (
                            <motion.div variants={fadeInUp} className="glass-card lg:col-span-2 overflow-hidden border-t-8 border-t-medical-blue mt-4">
                                <DecisionTreeViz data={treeData} />
                            </motion.div>
                        )}

                        {/* No data fallback */}
                        {(!clusters || Object.keys(clusters).length === 0) && (!metrics || Object.keys(metrics).length === 0) && (
                            <motion.div variants={fadeInUp} className="glass-card p-16 text-center lg:col-span-2 border-dashed border-2 border-slate-200 mt-4">
                                <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                                    <Network className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-700 mb-3">No Analytics Data Available</h3>
                                <p className="text-slate-500 mb-8 max-w-md mx-auto text-lg">
                                    Initialize the analytics engine by training the machine learning models on your dataset.
                                </p>
                                <button
                                    onClick={handleTrain}
                                    className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-medical-gradient hover:shadow-lg text-white font-bold transition-all hover:-translate-y-0.5"
                                >
                                    <RefreshCw className="w-5 h-5" /> Initialize Model Training
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
