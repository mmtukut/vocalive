import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "VocaLive — AI Skills Coach",
  description:
    "Point your camera. Learn any trade. Real-time AI coaching in Hausa & English for welding, wiring, solar, mechanics, carpentry, and farming.",
  keywords: "vocational training, AI coach, welding, electrical, solar, Hausa, Nigeria",
  openGraph: {
    title: "VocaLive — AI Skills Coach",
    description: "Your phone is now a master craftsman. Real-time AI vocational coaching.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#030712",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
