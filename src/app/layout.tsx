import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sudip Manna | Creative 3D Software Engineer Portfolio",
  description: "A peaceful cinematic digital world where technology and nature coexist. Exploring App Development, Smart Web Dev, and AI Tools.",
  keywords: ["Sudip Manna", "Portfolio", "3D Portfolio", "Three.js", "Next.js", "React", "AI Engineer", "Software Developer"],
  authors: [{ name: "Sudip Manna" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f5f2eb] text-[#2c2b29] dark:bg-[#0c0d12] dark:text-[#e2e4e9] font-sans transition-colors duration-500 overflow-x-hidden selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}
