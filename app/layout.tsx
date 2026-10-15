import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SITE_URL, contact } from "@/lib/site";
import "./globals.css";

const newsreader = localFont({
  src: [
    { path: "./newsreader.woff2", style: "normal", weight: "200 800" },
    { path: "./newsreader-italic.woff2", style: "italic", weight: "200 800" },
  ],
  variable: "--font-newsreader",
  display: "swap",
});

const hanken = localFont({
  src: [{ path: "./hanken.woff2", style: "normal", weight: "100 900" }],
  variable: "--font-hanken",
  display: "swap",
});

const title = "FM Arquitetura e Interiores · Arquitetura com afeto";
const description =
  "Prévia conceitual de site para a FM Arquitetura e Interiores, da Arq. Fernanda Moraes: projetos personalizados e consultorias online no Rio de Janeiro, com neuroarquitetura aplicada.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  applicationName: "FM Arquitetura e Interiores",
  authors: [{ name: "Prévia conceitual" }],
  // a preview must not compete with the official site in search results
  robots: { index: false, follow: false },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "FM Arquitetura e Interiores",
    title,
    description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Imagem ilustrativa de sala de estar com vista para os morros do Rio ao pôr do sol." }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og.jpg"] },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#f5f1ea",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "FM Arquitetura e Interiores",
  url: contact.officialSite,
  telephone: "+55 21 98145-7770",
  areaServed: "Rio de Janeiro",
  sameAs: [contact.instagramUrl],
  founder: { "@type": "Person", name: "Fernanda Moraes", jobTitle: "Arquiteta e urbanista" },
  slogan: "Arquitetura com afeto",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${newsreader.variable} ${hanken.variable}`}>
      <body>
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-4 focus:py-2">
          Pular para o conteúdo
        </a>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
