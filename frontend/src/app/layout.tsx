import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/Providers";
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
  title: "ItineraryAI — Stop Letting Group Trips Die in the Group Chat",
  description:
    "ItineraryAI collects anonymous group preferences, detects conflicts, and uses AI to build a realistic itinerary with researched stays, transport, and destination ideas.",
  keywords: [
    "group travel planning",
    "AI trip planner",
    "itinerary generator",
    "group trip organizer",
    "travel AI",
    "group trip planning app",
    "anonymous trip survey",
  ],
  openGraph: {
    title: "ItineraryAI — Stop Letting Group Trips Die in the Group Chat",
    description:
      "Collect honest group preferences, resolve budget and vibe clashes, and get a shareable AI itinerary.",
    type: "website",
  },
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
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
