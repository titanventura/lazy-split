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
  title: "SplitLink - Split bills instantly",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex flex-col min-h-screen">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container max-w-lg mx-auto py-4 px-4 flex items-center justify-between">
              <a href="/" className="font-bold text-xl tracking-tight text-primary">
                Split<span className="text-green-600 italic">Link</span>
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
