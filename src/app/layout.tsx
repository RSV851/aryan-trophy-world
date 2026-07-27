import type { Metadata } from "next";
import { Inter, Libre_Caslon_Text, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const headingFont = Libre_Caslon_Text({
  variable: "--font-heading",
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const monoFont = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Atelier Première | Aryan Trophy World - Premium Trophy Showroom",
  description: "Explore exquisite customized trophies, medals, plaques, and corporate awards crafted with unmatched luxury. Request custom quote inquiries directly from our atelier catalog.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${headingFont.variable} ${monoFont.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-black text-[#e5e2e1] font-sans selection:bg-[#f2ca50]/30 selection:text-[#f2ca50]">
        {children}
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  );
}

