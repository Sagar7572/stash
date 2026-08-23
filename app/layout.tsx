import type { Metadata } from "next";
import { Geist } from "next/font/google";
import BottomTabBar from "@/components/BottomTabBar";
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
        <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-white shadow-xl">
          <main className="flex-1 pb-28">{children}</main>
          <BottomTabBar />
        </div>
      </body>
    </html>
  );
}
