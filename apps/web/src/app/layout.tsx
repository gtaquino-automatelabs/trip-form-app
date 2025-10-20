import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../index.css";
import Providers from "@/components/providers";
import Header from "@/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "trip-form-app",
  description: "trip-form-app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {/* Fixed background - matching CEIA theme */}
          <div className="fixed inset-0 z-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
            {/* Subtle pattern overlay with cyan accents */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/10 via-transparent to-cyan-800/10" />
          </div>
          
          <div className="relative z-10 grid grid-rows-[auto_1fr] h-svh">
            <Header />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
