import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "FuelMap PT — Preços de Combustíveis em Portugal",
    template: "%s | FuelMap PT",
  },
  description:
    "Encontra os postos de combustível mais baratos e postos de carregamento elétrico perto de ti. Preços atualizados diariamente de todos os postos de Portugal.",
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
    "carregamento elétrico",
    "postos EV",
    "MOBI.E",
    "veículos elétricos",
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
  themeColor: "#09090b",
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
      className={`${inter.variable} h-full antialiased`}
      style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
    >
      <body className="h-full overflow-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
