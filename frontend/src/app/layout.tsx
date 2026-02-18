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
  title: "ItineraryAI — Group Trip Planning Made Effortless",
  description:
    "Stop fighting over group trip plans. ItineraryAI collects everyone's preferences and uses AI to craft the perfect itinerary for the whole group.",
  keywords: [
    "group travel planning",
    "AI trip planner",
    "itinerary generator",
    "group trip organizer",
    "travel AI",
  ],
  openGraph: {
    title: "ItineraryAI — Group Trip Planning Made Effortless",
    description:
      "Let everyone share their travel preferences. AI handles the rest.",
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
        {children}
      </body>
    </html>
  );
}
