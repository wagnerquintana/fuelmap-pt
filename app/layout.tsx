import type { Metadata, Viewport } from "next";
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
  title: {
    default: "FuelMap PT — Preços de Combustíveis em Portugal",
    template: "%s | FuelMap PT",
  },
  description:
    "Encontra os postos de combustível mais baratos perto de ti. Mapa interativo com preços atualizados diariamente de todos os postos de Portugal.",
  keywords: [
    "combustíveis",
    "gasolina",
    "gasóleo",
    "GPL",
    "preços combustíveis",
    "postos de combustível",
    "Portugal",
    "mapa combustíveis",
    "preços gasolina",
    "preços gasóleo",
    "bombas de gasolina",
    "DGEG",
  ],
  authors: [{ name: "FuelMap PT" }],
  creator: "FuelMap PT",
  openGraph: {
    type: "website",
    locale: "pt_PT",
    url: "https://fuelmap-pt.vercel.app",
    siteName: "FuelMap PT",
    title: "FuelMap PT — Preços de Combustíveis em Portugal",
    description:
      "Encontra os postos mais baratos. Mapa interativo com preços atualizados diariamente de +3000 postos.",
  },
  twitter: {
    card: "summary",
    title: "FuelMap PT — Preços de Combustíveis em Portugal",
    description:
      "Encontra os postos mais baratos. Mapa interativo com preços atualizados diariamente.",
  },
  robots: { index: true, follow: true },
  metadataBase: new URL("https://fuelmap-pt.vercel.app"),
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden" suppressHydrationWarning>
        <a href="#main-content" className="skip-to-content">
          Saltar para conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
