"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, ZoomIn, ZoomOut } from "lucide-react";

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
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center"
            >
                <div
                    className={`rounded-2xl px-5 py-4 border shadow-sm min-w-[140px] text-center transition-all hover:shadow-md ${isDisease
                        ? "bg-rose-50 border-rose-200 shadow-rose-100"
                        : "bg-emerald-50 border-emerald-200 shadow-emerald-100"
                        }`}
                >
                    <div
                        className={`text-sm font-bold mb-1.5 flex flex-col items-center justify-center ${isDisease ? "text-rose-600" : "text-emerald-600"
                            }`}
                    >
                        {isDisease ? "⚠ Disease Risk" : "✓ Healthy Profile"}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 mb-2">
                        Supporting Evidence: {node.samples}
                    </div>
                    {/* Mini bar */}
                    <div className="mt-2 h-2 rounded-full bg-slate-200 flex shadow-inner overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${ratio0 * 100}%` }}
                            title={`Healthy: ${(ratio0 * 100).toFixed(1)}%`}
                        />
                        <div
                            className="h-full bg-rose-500 transition-all duration-500"
                            style={{ width: `${ratio1 * 100}%` }}
                            title={`Disease: ${(ratio1 * 100).toFixed(1)}%`}
                        />
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="flex flex-col items-center relative z-10">
            {/* Decision node card */}
            <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => hasChildren && setExpanded(!expanded)}
                className="rounded-2xl px-5 py-4 border bg-white border-sky-100 
                           text-center min-w-[170px] shadow-sm shadow-sky-100
                           hover:border-medical-blue hover:shadow-md transition-all cursor-pointer group"
            >
                <div className="text-xs font-bold text-sky-600 mb-1 tracking-wide uppercase group-hover:text-medical-blue transition-colors">
                    {node.feature?.replace(/_/g, " ")}
                </div>
                <div className="text-[14px] font-black text-slate-800 mb-1">
                    ≤ {node.threshold?.toFixed(2) || String(node.threshold)}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                    Evaluated Cases: {node.samples}
                </div>
                {/* Mini distribution bar */}
                <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden flex shadow-inner border border-slate-200/50">
                    <div
                        className="h-full bg-emerald-400 transition-all duration-500"
                        style={{ width: `${ratio0 * 100}%` }}
                    />
                    <div
                        className="h-full bg-rose-400 transition-all duration-500"
                        style={{ width: `${ratio1 * 100}%` }}
                    />
                </div>
                {hasChildren && (
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-3 flex items-center justify-center gap-1 group-hover:text-medical-blue transition-colors">
                        {expanded ? <><ZoomOut className="w-3 h-3" /> Collapse</> : <><ZoomIn className="w-3 h-3" /> Expand</>}
                    </div>
                )}
            </motion.button>

            {/* Children */}
            <AnimatePresence>
                {hasChildren && expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col items-center mt-0 overflow-hidden"
                    >
                        {/* Vertical line from parent */}
                        <div className="w-0.5 h-6 bg-slate-300" />

                        {/* Horizontal connector + branch labels */}
                        <div className="flex items-start">
                            {/* Left branch */}
                            <div className="flex flex-col items-center relative">
                                <div className="absolute -top-3 -left-8 bg-sky-50 px-2 py-0.5 rounded text-[10px] text-sky-700 font-bold border border-sky-100 tracking-wider shadow-sm z-20">
                                    TRUE (≤)
                                </div>
                                <div className="flex items-start">
                                    <div className="w-20 border-t-2 border-slate-300" />
                                    <div className="border-l-2 border-slate-300 h-6" />
                                </div>
                                <NodeCard node={node.left!} depth={depth + 1} />
                            </div>

                            {/* Spacer */}
                            <div className="w-20 border-t-2 border-slate-300 mt-[22px]" />

                            {/* Right branch */}
                            <div className="flex flex-col items-center relative">
                                <div className="absolute -top-3 -right-8 bg-amber-50 px-2 py-0.5 rounded text-[10px] text-amber-700 font-bold border border-amber-100 tracking-wider shadow-sm z-20">
                                    FALSE (&gt;)
                                </div>
                                <div className="flex items-start">
                                    <div className="border-r-2 border-slate-300 h-6" />
                                    <div className="w-20 border-t-2 border-slate-300" />
                                </div>
                                <NodeCard node={node.right!} depth={depth + 1} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function DecisionTreeViz({ data }: Props) {
    return (
        <div className="mt-8 p-6 bg-slate-50/50 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 opacity-[0.03] pointer-events-none group-hover:opacity-5 transition-opacity">
                <Network className="w-64 h-64 text-medical-blue" />
            </div>

            <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
                    <Network className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="text-xl font-bold text-slate-800">
                    Decision Logic Architecture
                </h4>
            </div>

            <div className="overflow-x-auto pb-8 pt-4 custom-scrollbar relative z-10">
                <div className="inline-flex justify-center min-w-full px-10">
                    <NodeCard node={data} depth={0} />
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-slate-200 text-xs font-medium text-slate-600 relative z-10 bg-white p-4 rounded-xl shadow-sm border">
                <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500 shadow-sm" />
                    <span className="font-bold text-slate-700">Healthy Classification</span>
                </span>
                <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-sm bg-rose-500 shadow-sm" />
                    <span className="font-bold text-slate-700">Disease Risk Identification</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100 font-semibold ml-auto flex items-center gap-2">
                    <ZoomIn className="w-3.5 h-3.5" /> Interactive: Click nodes to toggle logic branches
                </span>
            </div>
        </div>
    );
}
