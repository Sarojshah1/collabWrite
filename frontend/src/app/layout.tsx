import type { Metadata } from "next";
import { Inter, DM_Serif_Display, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const displaySerif = DM_Serif_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CollabWrite — Stop Fighting Over Group Assignments | AI Merge for Students",
  description:
    "CollabWrite automatically detects conflicts, merges edits, and tracks contributions so student teams produce polished assignments without the chaos. Free for students.",
  metadataBase: new URL("http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CollabWrite — Stop Fighting Over Group Assignments | AI Merge for Students",
    description:
      "CollabWrite automatically detects conflicts, merges edits, and tracks contributions so student teams produce polished assignments without the chaos. Free for students.",
    url: "/",
    siteName: "CollabWrite",
    images: [
      {
        url: "/og-conflict-panel.png",
        width: 1200,
        height: 630,
        alt: "CollabWrite conflict panel showing Version A, Version B, and AI merged version",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${displaySerif.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
