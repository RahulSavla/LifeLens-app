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

const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/data-generator", label: "Data Generator", icon: Database },
    { href: "/predictions", label: "Predictions", icon: Activity },
    { href: "/visualizations", label: "Visualizations", icon: BarChart3 },
    { href: "/metrics", label: "Model Metrics", icon: LineChart },
];

export default function Navbar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-t-0 border-x-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-sky-500/30 transition-all">
                            <HeartPulse className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold gradient-text hidden sm:inline">
                            HealthPredict AI
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
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${active
                                            ? "bg-sky-100 text-sky-600"
                                            : "text-sky-700/60 hover:text-sky-900 hover:bg-sky-50"
                                        }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile toggle */}
                    <button
                        onClick={() => setOpen(!open)}
                        className="md:hidden p-2 text-sky-700/60 hover:text-sky-900"
                    >
                        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className="md:hidden border-t border-sky-200/50 px-4 pb-4">
                    {navItems.map((item) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                  ${active
                                        ? "bg-sky-100 text-sky-600"
                                        : "text-sky-700/60 hover:text-sky-900 hover:bg-sky-50"
                                    }`}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            )}
        </nav>
    );
}
