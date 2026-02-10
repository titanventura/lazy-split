import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LazySplit - Split bills without the effort",
  description: "The easiest way to split bills with friends. No app required, just share a link.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <div className="flex flex-col min-h-screen">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container max-w-lg mx-auto py-4 px-4 flex items-center justify-between">
              <a href="/" className="font-bold text-2xl tracking-tighter text-primary flex items-center gap-1">
                lazy<span className="text-green-600">split</span>
              </a>
            </div>
          </header>
          {children}
        </div>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
