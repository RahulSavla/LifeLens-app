"use client";

import { useEffect, useState } from "react";
import DecisionTreeViz from "@/components/DecisionTreeViz";
import {
    BarChart3,
    AlertCircle,
    RefreshCw,
    Layers,
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
    "#14B8A6",
    "#8B5CF6",
    "#F59E0B",
    "#EF4444",
    "#06B6D4",
    "#22C55E",
    "#EC4899",
    "#6366F1",
];

export default function VisualizationsPage() {
    const [loading, setLoading] = useState(false);
    const [trainLoading, setTrainLoading] = useState(false);
    const [error, setError] = useState("");
    const [clusters, setClusters] = useState<any>(null);
    const [metrics, setMetrics] = useState<any>(null);
    const [importance, setImportance] = useState<any>(null);
    const [treeData, setTreeData] = useState<any>(null);

    const loadAll = async () => {
        setLoading(true);
        setError("");
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
            await loadAll();
        } catch (e: any) {
            setError(e.message);
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
        <div className="space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">
                        <span className="gradient-text">Visualizations</span>
                    </h1>
                    <p className="text-slate-500">
                        Interactive charts for clusters, feature importance, and model
                        performance.
                    </p>
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
                                <RefreshCw className="w-4 h-4" /> Train Models
                            </>
                        )}
                    </button>
                    <button
                        onClick={loadAll}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:border-sky-300 hover:text-slate-800 transition-all text-sm"
                    >
                        Refresh
                    </button>
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
                    <span className="ml-3 text-slate-500">Loading visualizations...</span>
                </div>
            ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* PCA Cluster Scatter */}
                    {clusters?.pca_data && (
                        <div className="glass-card p-6 lg:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <Layers className="w-5 h-5 text-sky-600" />
                                <h3 className="text-lg font-semibold text-slate-800">
                                    Patient Clusters (PCA 2D Projection)
                                </h3>
                                <span className="ml-auto text-xs text-slate-500">
                                    {clusters.optimal_clusters} clusters
                                </span>
                            </div>
                            <ResponsiveContainer width="100%" height={400}>
                                <ScatterChart>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                    <XAxis
                                        dataKey="x"
                                        name="PC1"
                                        stroke="#64748B"
                                        tick={{ fill: "#64748B", fontSize: 12 }}
                                    />
                                    <YAxis
                                        dataKey="y"
                                        name="PC2"
                                        stroke="#64748B"
                                        tick={{ fill: "#64748B", fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: "#FFFFFF",
                                            border: "1px solid #E2E8F0",
                                            borderRadius: "12px",
                                            color: "#1E293B",
                                        }}
                                    />
                                    {Array.from(
                                        { length: clusters.optimal_clusters },
                                        (_, i) => i
                                    ).map((cluster) => (
                                        <Scatter
                                            key={cluster}
                                            name={`Cluster ${cluster}`}
                                            data={clusters.pca_data.filter(
                                                (d: any) => d.cluster === cluster
                                            )}
                                            fill={CLUSTER_COLORS[cluster % CLUSTER_COLORS.length]}
                                            opacity={0.7}
                                        />
                                    ))}
                                    <Legend />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Feature Importance */}
                    {featureImportanceData.length > 0 && (
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">
                                Feature Importance (Decision Tree)
                            </h3>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart
                                    data={featureImportanceData}
                                    layout="vertical"
                                    margin={{ left: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                    <XAxis
                                        type="number"
                                        stroke="#64748B"
                                        tick={{ fill: "#64748B", fontSize: 11 }}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        stroke="#64748B"
                                        tick={{ fill: "#64748B", fontSize: 11 }}
                                        width={140}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: "#FFFFFF",
                                            border: "1px solid #E2E8F0",
                                            borderRadius: "12px",
                                            color: "#1E293B",
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                                        {featureImportanceData.map((_: any, i: number) => (
                                            <Cell
                                                key={i}
                                                fill={CLUSTER_COLORS[i % CLUSTER_COLORS.length]}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Elbow Curve */}
                    {elbowData.length > 0 && (
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">
                                Elbow Method (K-Means)
                            </h3>
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={elbowData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                    <XAxis
                                        dataKey="k"
                                        stroke="#64748B"
                                        tick={{ fill: "#64748B", fontSize: 12 }}
                                        label={{
                                            value: "Number of Clusters",
                                            fill: "#64748B",
                                            position: "insideBottomRight",
                                            offset: -5,
                                        }}
                                    />
                                    <YAxis
                                        stroke="#64748B"
                                        tick={{ fill: "#64748B", fontSize: 12 }}
                                        label={{
                                            value: "Inertia",
                                            fill: "#64748B",
                                            angle: -90,
                                            position: "insideLeft",
                                        }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: "#FFFFFF",
                                            border: "1px solid #E2E8F0",
                                            borderRadius: "12px",
                                            color: "#1E293B",
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="inertia"
                                        stroke="#14B8A6"
                                        strokeWidth={2}
                                        dot={{ fill: "#14B8A6", r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Silhouette Scores */}
                    {silhouetteData.length > 0 && (
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">
                                Silhouette Scores
                            </h3>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={silhouetteData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                    <XAxis
                                        dataKey="k"
                                        stroke="#64748B"
                                        tick={{ fill: "#64748B", fontSize: 12 }}
                                    />
                                    <YAxis
                                        stroke="#64748B"
                                        tick={{ fill: "#64748B", fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: "#FFFFFF",
                                            border: "1px solid #E2E8F0",
                                            borderRadius: "12px",
                                            color: "#1E293B",
                                        }}
                                    />
                                    <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                                        {silhouetteData.map((_: any, i: number) => (
                                            <Cell
                                                key={i}
                                                fill={CLUSTER_COLORS[i % CLUSTER_COLORS.length]}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* KNN k-Optimization */}
                    {kScoresData.length > 0 && (
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">
                                KNN: k Optimization
                                <span className="text-sm text-sky-600 ml-2">
                                    (Best k={metrics?.knn?.best_k})
                                </span>
                            </h3>
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={kScoresData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                    <XAxis
                                        dataKey="k"
                                        stroke="#64748B"
                                        tick={{ fill: "#64748B", fontSize: 12 }}
                                        label={{
                                            value: "k",
                                            fill: "#64748B",
                                            position: "insideBottomRight",
                                            offset: -5,
                                        }}
                                    />
                                    <YAxis
                                        stroke="#64748B"
                                        tick={{ fill: "#64748B", fontSize: 12 }}
                                        domain={["auto", "auto"]}
                                        label={{
                                            value: "Accuracy",
                                            fill: "#64748B",
                                            angle: -90,
                                            position: "insideLeft",
                                        }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: "#FFFFFF",
                                            border: "1px solid #E2E8F0",
                                            borderRadius: "12px",
                                            color: "#1E293B",
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="accuracy"
                                        stroke="#8B5CF6"
                                        strokeWidth={2}
                                        dot={{ fill: "#8B5CF6", r: 3 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Cluster Summary Table */}
                    {clusters?.cluster_summary && (
                        <div className="glass-card p-6 lg:col-span-2">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">
                                Cluster Summary
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            {[
                                                "Cluster",
                                                "Size",
                                                "Avg Age",
                                                "Avg BMI",
                                                "Avg BP",
                                                "Avg Chol",
                                                "Avg Glucose",
                                                "Avg Expenses",
                                                "Disease Rate",
                                                "Smoking Rate",
                                            ].map((h) => (
                                                <th
                                                    key={h}
                                                    className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap"
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clusters.cluster_summary.map((row: any) => (
                                            <tr
                                                key={row.cluster}
                                                className="border-b border-slate-800/50 hover:bg-sky-50/30 transition"
                                            >
                                                <td className="px-3 py-2">
                                                    <span
                                                        className="inline-block w-3 h-3 rounded-full mr-2"
                                                        style={{
                                                            backgroundColor:
                                                                CLUSTER_COLORS[
                                                                row.cluster % CLUSTER_COLORS.length
                                                                ],
                                                        }}
                                                    />
                                                    {row.cluster}
                                                </td>
                                                <td className="px-3 py-2 text-slate-600">
                                                    {row.size}
                                                </td>
                                                <td className="px-3 py-2 text-slate-600">
                                                    {row.avg_age}
                                                </td>
                                                <td className="px-3 py-2 text-slate-600">
                                                    {row.avg_bmi}
                                                </td>
                                                <td className="px-3 py-2 text-slate-600">
                                                    {row.avg_bp}
                                                </td>
                                                <td className="px-3 py-2 text-slate-600">
                                                    {row.avg_cholesterol}
                                                </td>
                                                <td className="px-3 py-2 text-slate-600">
                                                    {row.avg_glucose}
                                                </td>
                                                <td className="px-3 py-2 text-sky-600">
                                                    ${row.avg_expenses?.toLocaleString()}
                                                </td>
                                                <td className="px-3 py-2 text-slate-600">
                                                    {(row.disease_rate * 100).toFixed(1)}%
                                                </td>
                                                <td className="px-3 py-2 text-slate-600">
                                                    {(row.smoking_rate * 100).toFixed(1)}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Decision Tree Visualization */}
                    {treeData && (
                        <div className="glass-card p-6 lg:col-span-2">
                            <DecisionTreeViz data={treeData} />
                        </div>
                    )}

                    {/* No data fallback */}
                    {!clusters && !metrics && (
                        <div className="glass-card p-12 text-center lg:col-span-2">
                            <BarChart3 className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                            <p className="text-slate-500 mb-4">
                                No visualization data available. Generate data and train models
                                first.
                            </p>
                            <button onClick={handleTrain} className="glow-btn text-sm">
                                Train Models
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
