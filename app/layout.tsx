import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://receiptiq-topaz.vercel.app"),
  title: "ReceiptIQ — AI Expense Intelligence",
  description:
    "Turn messy receipt images and text into structured, actionable expense data with GPT-4o Vision — merchant, tax, line items, and instant spending insights.",
  applicationName: "ReceiptIQ",
  keywords: ["receipt scanner", "expense tracking", "GPT-4o Vision", "AI OCR", "finance dashboard"],
  authors: [{ name: "Ruthwik Arepelly" }],
  openGraph: {
    title: "ReceiptIQ — AI Expense Intelligence",
    description:
      "Upload a receipt, get clean expense data + instant insights. Powered by GPT-4o Vision.",
    url: "https://receiptiq-topaz.vercel.app",
    siteName: "ReceiptIQ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ReceiptIQ — AI Expense Intelligence",
    description: "Upload a receipt, get clean expense data + instant insights. Powered by GPT-4o Vision.",
  },
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
        {children}
      </body>
    </html>
  );
}
