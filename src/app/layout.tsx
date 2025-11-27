import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3, Instrument_Sans } from "next/font/google";
import "./globals.css";

// Luxury theme fonts - Scholarly Elegance
const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "YDS Hazırlık Platformu",
  description: "YDS sınavına hazırlık için interaktif platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${cormorant.variable} ${sourceSans.variable} ${instrumentSans.variable} antialiased`}
      >
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
