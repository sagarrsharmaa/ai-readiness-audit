import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Readiness Audit — Check How AI-Ready Your Website Is",
  description:
    "Enter any URL and get an instant AI Readiness Score with actionable insights on structured data, content hierarchy, FAQs, and semantic HTML.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
