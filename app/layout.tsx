import type { Metadata } from "next";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "./globals.css";
const origin = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://chefjuliananogueira.com.br")
).replace(/\/$/, "");
export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: {
    default:
      "Chef Juliana Nogueira — Chef domiciliar e gastronomia para eventos",
    template: "%s | Chef Juliana Nogueira",
  },
  description:
    "Chef em domicílio, gastronomia para eventos e tábuas para compartilhar. Conheça o trabalho de Juliana Nogueira e planeje seu próximo encontro à mesa.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Chef Juliana Nogueira",
    title: "Chef Juliana Nogueira — Sua celebração começa à mesa",
    description:
      "Gastronomia feita para reunir. Chef em domicílio, tábuas e encontros à mesa.",
    images: [
      {
        url: "/media/hero.webp",
        width: 1280,
        height: 853,
        alt: "Mesa gastronômica com frutas, queijos e flores",
      },
    ],
  },
  twitter: { card: "summary_large_image", images: ["/media/hero.webp"] },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
