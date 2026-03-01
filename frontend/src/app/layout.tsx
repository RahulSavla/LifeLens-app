import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "LifeLens AI — See Health Clearly. Predict Smarter.",
  description:
    "LifeLens AI empowers healthcare providers with intelligent risk prediction and patient segmentation tools to enable proactive care.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white text-slate-800 antialiased selection:bg-teal-500/30">
        <Toaster position="top-right" toastOptions={{ className: 'glass-card text-sm', duration: 3000 }} />
        <Navbar />
        <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {children}
        </main>
        {/* Footer */}
        <footer className="border-t border-slate-100 bg-[#F8FAFC] py-12 px-4 mt-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <div>
              <p className="font-semibold text-slate-700 mb-1">LifeLens AI</p>
              <p>© 2026 Developed by Dhruv, Pramodini, Ranjita &amp; Rahul.</p>
            </div>
            <p className="text-slate-400">Powered by Next.js &amp; FastAPI</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
