import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PresenZ — Absensi Digital Magang",
  description:
    "Sistem absensi digital modern untuk mahasiswa magang di Badan Kesatuan Bangsa dan Politik Kota Banjarmasin.",
  keywords: ["absensi", "magang", "kesbangpol", "banjarmasin", "presenz"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
