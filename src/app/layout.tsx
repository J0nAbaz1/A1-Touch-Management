import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "A1 TOUCH FC — FC 27 Squad Management & Player Registration",
  description:
    "Official tactical squad management, Starting XI builder, player registration, form rating, and position recommendation system for A1 Touch FC.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
