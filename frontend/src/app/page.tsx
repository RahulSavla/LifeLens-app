"use client";

import Link from "next/link";
import {
  Activity,
  Database,
  Brain,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  HeartPulse,
  Stethoscope,
  Pill,
  Syringe,
  Cross,
  UserRound,
} from "lucide-react";

const features = [
  {
    icon: Database,
    title: "Synthetic Data Engine",
    desc: "Generate 1500+ realistic patient records with correlated health features — or upload your own CSV.",
    color: "from-sky-500 to-blue-600",
  },
  {
    icon: Brain,
    title: "4 ML Models",
    desc: "Linear Regression, Decision Tree, KNN, and K-Means — trained, evaluated, and compared side by side.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Activity,
    title: "Real-Time Prediction",
    desc: "Enter patient vitals and get instant disease risk, expense forecast, and risk category predictions.",
    color: "from-sky-400 to-indigo-500",
  },
  {
    icon: BarChart3,
    title: "Rich Visualizations",
    desc: "Interactive charts for clusters, feature importance, elbow curves, and model performance metrics.",
    color: "from-teal-500 to-emerald-600",
  },
  {
    icon: Shield,
    title: "SHAP Explainability",
    desc: "Understand why the model made each decision using SHAP feature importance analysis.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "PDF Reports",
    desc: "Download professional patient summary reports with demographics, predictions, and risk assessments.",
    color: "from-cyan-500 to-emerald-500",
  },
];

const team = [
  { name: "Dhruv", avatar: "D", color: "from-sky-500 to-blue-600" },
  { name: "Pramodini", avatar: "P", color: "from-emerald-500 to-teal-600" },
  { name: "Ranjita", avatar: "R", color: "from-cyan-500 to-sky-600" },
  { name: "Rahul", avatar: "R", color: "from-blue-500 to-indigo-600" },
];

/* Simple ECG SVG path for the hero background */
function ECGLine({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 800 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0,50 L150,50 L170,50 L185,20 L200,80 L215,10 L230,90 L245,50 L260,50 L400,50 L420,50 L435,20 L450,80 L465,10 L480,90 L495,50 L510,50 L650,50 L670,50 L685,20 L700,80 L715,10 L730,90 L745,50 L800,50"
        stroke="currentColor"
        strokeWidth="2"
        className="animate-ecg"
      />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-24">
      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section className="text-center py-20 relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 via-transparent to-transparent rounded-3xl" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-[120px]" />

        {/* Floating medical icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <HeartPulse className="absolute top-12 left-[10%] w-8 h-8 text-sky-500/15 animate-float" />
          <Stethoscope className="absolute top-20 right-[12%] w-10 h-10 text-emerald-500/12 animate-float-delayed" />
          <Pill className="absolute bottom-16 left-[18%] w-7 h-7 text-cyan-500/12 animate-float-slow" />
          <Cross className="absolute top-32 left-[30%] w-6 h-6 text-blue-500/10 animate-cross-pulse" />
          <Syringe className="absolute bottom-20 right-[15%] w-8 h-8 text-sky-500/10 animate-float" />
          <Activity className="absolute top-16 right-[32%] w-6 h-6 text-emerald-500/10 animate-float-delayed" />
        </div>

        {/* ECG Lines in background */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 opacity-[0.07] pointer-events-none" aria-hidden="true">
          <ECGLine className="w-full h-20 text-sky-400" />
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium mb-6">
            <HeartPulse className="w-4 h-4 animate-heartbeat" />
            AI-Powered Healthcare Intelligence
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
            <span className="gradient-text">HealthPredict</span>{" "}
            <span className="text-sky-900">AI</span>
          </h1>
          <p className="text-lg sm:text-xl text-sky-700/70 max-w-3xl mx-auto mb-10 leading-relaxed">
            Smart Healthcare Risk Prediction &amp; Patient Segmentation System.
            Train multiple ML models, predict disease risks, segment patients,
            and generate explainable insights — all in one platform.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/data-generator" className="glow-btn inline-flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/metrics"
              className="px-6 py-3 rounded-xl border border-sky-200 text-sky-700 hover:border-sky-400 hover:text-sky-900 transition-all font-medium"
            >
              View Metrics
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats Banner ──────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: "4", label: "ML Models", icon: Brain },
          { value: "1500+", label: "Patient Records", icon: Database },
          { value: "6+", label: "Risk Factors", icon: Activity },
          { value: "Real-Time", label: "Predictions", icon: Zap },
        ].map((s, i) => (
          <div key={i} className="glass-card p-5 text-center group hover:border-sky-400/50 transition-all">
            <s.icon className="w-6 h-6 mx-auto mb-2 text-sky-500 group-hover:scale-110 transition-transform" />
            <div className="text-2xl font-bold text-sky-900">{s.value}</div>
            <div className="text-xs text-sky-600/60 mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ─── Features Grid ─────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-3">
          Powerful <span className="gradient-text">Features</span>
        </h2>
        <p className="text-center text-sky-600/60 mb-12 max-w-2xl mx-auto">
          Everything you need for healthcare risk analysis — from data
          generation to explainable predictions.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="glass-card p-6 group hover:border-sky-400/30">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-sky-500/20 transition-all`}
              >
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-sky-900 mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-sky-700/60 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12">
          How It <span className="gradient-text">Works</span>
        </h2>
        <div className="grid md:grid-cols-4 gap-6 relative">
          {/* Connecting line */}
          <div className="absolute top-10 left-[12%] right-[12%] h-px bg-gradient-to-r from-sky-300/30 via-cyan-300/30 to-sky-300/30 hidden md:block" />
          {[
            { step: "01", title: "Generate Data", desc: "Create synthetic patient records or upload CSV", icon: Database },
            { step: "02", title: "Train Models", desc: "Train 4 ML algorithms on health features", icon: Brain },
            { step: "03", title: "Predict Risk", desc: "Get disease risk, expenses & risk category", icon: HeartPulse },
            { step: "04", title: "Get Insights", desc: "View visualizations & download PDF reports", icon: BarChart3 },
          ].map((s, i) => (
            <div key={i} className="text-center relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-100 to-cyan-100 border border-sky-200/60 flex items-center justify-center mx-auto mb-4 hover:border-sky-400/50 transition-colors">
                <s.icon className="w-8 h-8 text-sky-500" />
              </div>
              <span className="text-xs font-bold text-sky-400/60 mb-1 block">{s.step}</span>
              <h3 className="text-base font-semibold text-sky-900 mb-1">{s.title}</h3>
              <p className="text-sm text-sky-600/60">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Architecture ──────────────────────────────────────────────────── */}
      <section className="glass-card p-8 sm:p-10">
        <h2 className="text-3xl font-bold mb-6">
          System <span className="gradient-text">Architecture</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-sky-400 mb-3 flex items-center gap-2">
              <div className="w-2 h-6 rounded-full bg-sky-500" />
              Backend
            </h3>
            <ul className="space-y-2 text-sky-800/70 text-sm">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> FastAPI with Pydantic validation</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Modular ML service layer</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Linear Regression, Decision Tree, KNN, K-Means</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> SHAP explainability</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Joblib model persistence</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> PDF report generation</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Swagger / ReDoc API docs at /docs</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-emerald-400 mb-3 flex items-center gap-2">
              <div className="w-2 h-6 rounded-full bg-emerald-500" />
              Frontend
            </h3>
            <ul className="space-y-2 text-sky-800/70 text-sm">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Next.js 15 App Router</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Tailwind CSS dark theme</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Recharts interactive charts</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Glassmorphism UI design</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Responsive mobile layout</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Real-time prediction forms</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> CSV upload &amp; download</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── Tech Stack ────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-10">
          Tech <span className="gradient-text">Stack</span>
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            "Python 3.11",
            "FastAPI",
            "scikit-learn",
            "SHAP",
            "Pandas",
            "NumPy",
            "Next.js 15",
            "TypeScript",
            "Tailwind CSS",
            "Recharts",
            "Docker",
            "ReportLab",
          ].map((tech) => (
            <span
              key={tech}
              className="px-5 py-2.5 rounded-xl bg-sky-50 border border-sky-200/60 text-sm font-medium text-sky-700 hover:border-sky-400 hover:text-sky-900 transition-all cursor-default"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* ─── Team ──────────────────────────────────────────────────────────── */}
      <section className="text-center">
        <h2 className="text-3xl font-bold mb-3">
          The <span className="gradient-text">Team</span>
        </h2>
        <p className="text-sky-600/60 text-sm mb-10">
          Developed by our talented team of engineers
        </p>
        <div className="flex justify-center gap-6 flex-wrap">
          {team.map((m, i) => (
            <div key={i} className="glass-card p-6 w-52 text-center group hover:border-sky-500/30 transition-all">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-sky-500/20 transition-all`}>
                {m.avatar}
              </div>
              <h3 className="font-semibold text-sky-900 text-base">{m.name}</h3>
              <p className="text-xs text-sky-600/60 mt-1">Developer</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
