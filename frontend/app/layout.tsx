import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Faculdade IPESSP | Ensino Superior em Saúde",
  description:
    "25 anos formando profissionais de saúde de excelência. Graduação, Pós-Graduação e Cursos Livres em Biomedicina, Estética, Enfermagem, Radiologia e muito mais.",
  keywords:
    "faculdade saúde São Paulo, pós-graduação saúde, biomedicina, estética, enfermagem, IPESSP, Consolação",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Faculdade IPESSP",
    title: "Faculdade IPESSP | Ensino Superior em Saúde",
    description: "25 anos formando profissionais de saúde de excelência em São Paulo.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${sora.variable} ${inter.variable}`}
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ fontFamily: "var(--font-inter, system-ui, sans-serif)" }}>
        {children}
      </body>
    </html>
  );
}
