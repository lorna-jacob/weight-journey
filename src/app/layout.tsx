import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Weight Journey", description: "Track your meals, fasting, and weight loss journey" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
