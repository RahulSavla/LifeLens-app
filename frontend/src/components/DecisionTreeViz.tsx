"use client";

import React, { useState } from "react";

interface TreeNode {
    type: "decision" | "leaf";
    feature?: string;
    threshold?: number;
    class?: number;
    samples: number;
    class_counts: number[];
    left?: TreeNode;
    right?: TreeNode;
}

interface Props {
    data: TreeNode;
}

function NodeCard({ node, depth }: { node: TreeNode; depth: number }) {
    const [expanded, setExpanded] = useState(depth < 2);
    const hasChildren = node.type === "decision" && node.left && node.right;

    const total = node.class_counts[0] + node.class_counts[1];
    const ratio0 = total > 0 ? node.class_counts[0] / total : 0;
    const ratio1 = total > 0 ? node.class_counts[1] / total : 0;

    if (node.type === "leaf") {
        const isDisease = node.class === 1;
        return (
            <div className="flex flex-col items-center">
                <div
                    className={`rounded-xl px-4 py-3 border text-center min-w-[120px] shadow-lg ${isDisease
                        ? "bg-red-500/15 border-red-500/40 shadow-red-500/10"
                        : "bg-emerald-500/15 border-emerald-500/40 shadow-emerald-500/10"
                        }`}
                >
                    <div
                        className={`text-xs font-semibold mb-1 ${isDisease ? "text-red-400" : "text-emerald-400"
                            }`}
                    >
                        {isDisease ? "⚠ Disease" : "✓ Healthy"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                        {node.samples} samples
                    </div>
                    {/* Mini bar */}
                    <div className="mt-1.5 h-1.5 rounded-full bg-slate-700 overflow-hidden flex">
                        <div
                            className="h-full bg-emerald-500 transition-all"
                            style={{ width: `${ratio0 * 100}%` }}
                        />
                        <div
                            className="h-full bg-red-500 transition-all"
                            style={{ width: `${ratio1 * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center">
            {/* Decision node card */}
            <button
                onClick={() => hasChildren && setExpanded(!expanded)}
                className="rounded-xl px-4 py-3 border border-slate-600/50 bg-slate-800/60 backdrop-blur
                           text-center min-w-[140px] shadow-lg shadow-slate-900/30
                           hover:border-teal-500/40 transition-all cursor-pointer group"
            >
                <div className="text-xs font-bold text-teal-400 mb-0.5 group-hover:text-teal-300 transition-colors">
                    {node.feature?.replace(/_/g, " ")}
                </div>
                <div className="text-[11px] text-slate-300">
                    ≤ {node.threshold}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                    {node.samples} samples
                </div>
                {/* Mini distribution bar */}
                <div className="mt-1.5 h-1.5 rounded-full bg-slate-700 overflow-hidden flex">
                    <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${ratio0 * 100}%` }}
                    />
                    <div
                        className="h-full bg-red-500 transition-all"
                        style={{ width: `${ratio1 * 100}%` }}
                    />
                </div>
                {hasChildren && (
                    <div className="text-[10px] text-slate-600 mt-1.5">
                        {expanded ? "▼ collapse" : "▶ expand"}
                    </div>
                )}
            </button>

            {/* Children */}
            {hasChildren && expanded && (
                <div className="flex flex-col items-center mt-0">
                    {/* Vertical line from parent */}
                    <div className="w-px h-5 bg-slate-600/50" />

                    {/* Horizontal connector + branch labels */}
                    <div className="flex items-start">
                        {/* Left branch */}
                        <div className="flex flex-col items-center">
                            <div className="text-[9px] text-cyan-500/70 font-medium mb-0.5">
                                Yes (≤)
                            </div>
                            <div className="flex items-start">
                                <div className="w-6 border-t border-slate-600/50" />
                                <div className="border-l border-slate-600/50 h-4" />
                            </div>
                            <NodeCard node={node.left!} depth={depth + 1} />
                        </div>

                        {/* Spacer */}
                        <div className="w-6 border-t border-slate-600/50 mt-[18px]" />

                        {/* Right branch */}
                        <div className="flex flex-col items-center">
                            <div className="text-[9px] text-amber-500/70 font-medium mb-0.5">
                                No (&gt;)
                            </div>
                            <div className="flex items-start">
                                <div className="border-r border-slate-600/50 h-4" />
                                <div className="w-6 border-t border-slate-600/50" />
                            </div>
                            <NodeCard node={node.right!} depth={depth + 1} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function DecisionTreeViz({ data }: Props) {
    return (
        <div className="mt-6">
            <h4 className="text-sm font-medium text-slate-400 mb-4">
                Decision Tree Visualization
            </h4>
            <div className="overflow-x-auto pb-4">
                <div className="inline-flex justify-center min-w-full">
                    <NodeCard node={data} depth={0} />
                </div>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-500">
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                    Healthy (class 0)
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
                    Disease (class 1)
                </span>
                <span className="text-slate-600">• Click nodes to expand/collapse</span>
            </div>
        </div>
    );
}
