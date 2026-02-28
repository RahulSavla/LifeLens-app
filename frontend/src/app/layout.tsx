import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "HealthPredict AI — Smart Healthcare Risk Prediction",
  description:
    "Production-grade Smart Healthcare Risk Prediction & Patient Segmentation System powered by Machine Learning.",
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
      <body className="min-h-screen bg-[#F0F9FF] text-sky-900 antialiased">
        <Navbar />
        <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {children}
        </main>
        {/* Footer */}
        <footer className="border-t border-sky-200/50 py-8 px-4 text-center text-sm text-sky-500/60">
          <p>
            © 2026 HealthPredict AI — Smart Healthcare Risk Prediction System.
            Developed by Dhruv, Pramodini, Ranjita &amp; Rahul.
          </p>
        </footer>
      </body>
    </html>
  );
}
