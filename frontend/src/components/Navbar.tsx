"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    HeartPulse,
    Database,
    BarChart3,
    LineChart,
    Home,
    Menu,
    X,
    Activity,
} from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/data-generator", label: "Data Generator", icon: Database },
    { href: "/predictions", label: "Predictions", icon: Activity },
    { href: "/visualizations", label: "Segmentation & Insights", icon: BarChart3 },
    { href: "/metrics", label: "Model Metrics", icon: LineChart },
];

export default function Navbar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-medical-gradient flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:shadow-teal-500/30 transition-all duration-300">
                            <HeartPulse className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-xl font-bold text-slate-800 tracking-tight hidden sm:inline">
                            LifeLens <span className="text-teal-600">AI</span>
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const active = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                    ${active
                                            ? "bg-teal-50/80 text-teal-700"
                                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                                        }`}
                                >
                                    <item.icon className={`w-4 h-4 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile toggle */}
                    <button
                        onClick={() => setOpen(!open)}
                        className="md:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-colors"
                    >
                        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {open && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="md:hidden border-t border-slate-100 px-4 pb-4 bg-white/95 backdrop-blur-xl"
                >
                    <div className="pt-2 space-y-1">
                        {navItems.map((item) => {
                            const active = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                    ${active
                                            ? "bg-teal-50 text-teal-700"
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                        }`}
                                >
                                    <item.icon className={`w-5 h-5 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </motion.nav>
    );
}
