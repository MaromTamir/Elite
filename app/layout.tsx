import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EliteMatch — Exclusive Dating for High Net Worth Individuals",
  description: "The world's most exclusive dating platform. Verified wealth, curated matches, absolute discretion.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
