"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
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
} from "lucide-react";

// Animation Variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { stiffness: 80, damping: 15 } }
};

const features = [
  {
    icon: Database,
    title: "Synthetic Data Engine",
    desc: "Generate 1500+ realistic patient records with correlated health features — or upload your own CSV.",
    color: "from-teal-500 to-teal-600",
  },
  {
    icon: Brain,
    title: "4 ML Models",
    desc: "Linear Regression, Decision Tree, KNN, and K-Means — trained, evaluated, and compared side by side.",
    color: "from-blue-600 to-indigo-700",
  },
  {
    icon: Activity,
    title: "Real-Time Prediction",
    desc: "Enter patient vitals and get instant disease risk, expense forecast, and classification.",
    color: "from-sky-500 to-blue-500",
  },
  {
    icon: BarChart3,
    title: "Patient Segmentation",
    desc: "Interactive Plotly and Recharts visualizations for K-Means cluster analysis and feature importance.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Shield,
    title: "SHAP Explainability",
    desc: "Understand exactly why the model made each decision, ensuring trust and clinical safety.",
    color: "from-indigo-400 to-blue-600",
  },
  {
    icon: Zap,
    title: "PDF Reporting",
    desc: "Export professional patient summary reports for EMR integration and patient handoffs.",
    color: "from-teal-400 to-emerald-500",
  },
];

const team = [
  { name: "Rahul" },
  { name: "Pramodini" },
  { name: "Dhruv" },
  { name: "Ranjita" }
];

export default function HomePage() {
  return (
    <div className="space-y-32 pb-20">

      {/* ─── Hero Section with Medical Background ──────────────────────── */}
      <section className="relative min-h-[85vh] flex items-center justify-center rounded-[3rem] overflow-hidden shadow-2xl mt-4">
        {/* Background Image & Overlays */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.pexels.com/photos/5452209/pexels-photo-5452209.jpeg"
            alt="HealthCare"
            fill
            priority
            className="object-cover"
          />
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-sky-900/90 via-sky-800/80 to-teal-900/70 backdrop-blur-[2px]" />
        </div>

        {/* Floating Medical SVGs overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
          <HeartPulse className="absolute top-[10%] left-[10%] w-16 h-16 text-white animate-pulse" />
          <Stethoscope className="absolute bottom-[20%] right-[10%] w-24 h-24 text-teal-300 animate-float" />
          <Cross className="absolute top-[20%] right-[30%] w-12 h-12 text-white animate-float-delayed" />
        </div>

        {/* Hero Content */}
        <motion.div
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold mb-8 backdrop-blur-md shadow-lg">
            <HeartPulse className="w-4 h-4 text-teal-400" />
            Next-Generation Healthcare Intelligence
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight leading-[1.1] mb-8">
            See Health <span className="text-teal-400">Clearly.</span><br /> Predict <span className="text-sky-300">Smarter.</span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-lg sm:text-xl md:text-2xl text-sky-100 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
            LifeLens AI empowers healthcare providers with intelligent risk prediction, automated patient segmentation, and data-driven clinical insights to enable proactive care.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link href="/data-generator" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-lg shadow-[0_0_40px_rgba(20,184,166,0.5)] transition-all flex items-center justify-center gap-2 group">
              Start Predicting <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/visualizations" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-lg backdrop-blur-md transition-all">
              View Analytics
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── KPI Stats ────────────────────────────────────────────────────── */}
      <motion.section
        className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        {[
          { value: "4", label: "Predictive Models", icon: Brain },
          { value: "1.5k+", label: "Patient Profiles", icon: Database },
          { value: "98%", label: "System Accuracy", icon: Activity },
          { value: "< 1s", label: "Inference Time", icon: Zap },
        ].map((s, i) => (
          <motion.div key={i} variants={fadeInUp} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 mx-auto bg-sky-50 text-medical-blue rounded-full flex items-center justify-center mb-4">
              <s.icon className="w-7 h-7 text-sky-600" />
            </div>
            <div className="text-4xl font-black text-slate-800 tracking-tight">{s.value}</div>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mt-2">{s.label}</div>
          </motion.div>
        ))}
      </motion.section>

      {/* ─── Features Grid ───────────────────────────────────────────────── */}
      <section className="px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-800 mb-4 tracking-tight">Enterprise Clinical <span className="gradient-text">Capabilities</span></h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">A comprehensive suite of machine learning tools designed specifically for modern healthcare workflows.</p>
        </div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          {features.map((f, i) => (
            <motion.div key={i} variants={fadeInUp} className="glass-card p-8 group hover:border-teal-300">
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-6 text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
              >
                <f.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                {f.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── How It Works (Workflow) ─────────────────────────────────────── */}
      <section className="bg-[#091E3A] text-white rounded-[3rem] p-12 lg:p-20 relative overflow-hidden shadow-2xl my-32">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" /></pattern></defs><rect width="100%" height="100%" fill="url(#grid)" /></svg>
        </div>

        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 tracking-tight">
            Clinical <span className="text-teal-400">Workflow</span>
          </h2>
          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-teal-500/0 via-teal-500/50 to-teal-500/0 hidden md:block" />
            {[
              { step: "01", title: "Import Data", desc: "Securely input vitals or connect EHR CSV exports", icon: Database },
              { step: "02", title: "AI Analysis", desc: "Ensemble models process clinical parameters", icon: Brain },
              { step: "03", title: "Risk Stratification", desc: "Identify high-risk patients predicting future costs", icon: HeartPulse },
              { step: "04", title: "Actionable Care", desc: "Generate PDF reports & AI health recommendations", icon: BarChart3 },
            ].map((s, i) => (
              <motion.div
                key={i}
                className="text-center relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <div className="w-24 h-24 rounded-3xl bg-[#0F2A4A] border border-sky-800 flex items-center justify-center mx-auto mb-6 relative z-10 shadow-2xl">
                  <s.icon className="w-10 h-10 text-teal-400" />
                </div>
                <span className="text-sm font-bold text-teal-500 mb-2 block tracking-widest">{s.step}</span>
                <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sky-200/70 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Team / Founders ─────────────────────────────────────────────── */}
      <section className="px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-800 mb-4 tracking-tight">The <span className="gradient-text">Creators</span></h2>
          <p className="text-lg text-slate-500">Built by healthcare technology innovators.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((m, i) => (
            <motion.div
              key={i}
              className="glass-card overflow-hidden group flex items-center justify-center p-8"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <h3 className="text-2xl font-bold text-slate-800">{m.name}</h3>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}
