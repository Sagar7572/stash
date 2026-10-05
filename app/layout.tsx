import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import BottomTabBar from "@/components/BottomTabBar";
import VisitorCounter from "@/components/VisitorCounter";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stash",
  description: "Save and organize your learning material.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <AuthProvider>
          <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-white shadow-xl">
            <VisitorCounter />
            <main className="flex-1 pb-28">{children}</main>
            <BottomTabBar />
          </div>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}