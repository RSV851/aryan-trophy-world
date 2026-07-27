import type { Metadata } from "next";
import { Inter, Playfair_Display, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

/* ==============================================================================
   🔤 GLOBAL TYPOGRAPHY CONFIGURATION (EASY TO CHANGE ANYWHERE BY CODE)
   ==============================================================================
   To change fonts across the entire website & Admin CMS manually:
   1. Import your preferred Google font above (e.g., Montserrat, Poppins, Outfit, Cinzel).
   2. Swap the variable assignments below:
      - `--font-body` controls standard sans-serif text (navigation, tables, buttons, inputs).
      - `--font-heading` controls luxury titles & headers (Trophy Atelier, card titles, stats).
      - `--font-mono` controls SKUs, product IDs, numbers, and technical specifications.
   ============================================================================== */

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const headingFont = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const monoFont = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aryan Trophy World | Premium Trophies & Awards Catalog",
  description: "Explore exquisite customized trophies, medals, plaques, and awards crafted with unmatched quality. Request custom quote inquiries directly from our showroom catalog.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${headingFont.variable} ${monoFont.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
        <Toaster position="top-right" richColors theme="system" />
      </body>
    </html>
  );
}
