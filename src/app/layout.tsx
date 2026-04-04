import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Planavi - Visitez vos proches",
  description: "Organisez et planifiez les visites de vos proches simplement. Planning partagé pour familles, aidants et établissements.",
  icons: {
    icon: [
      { url: '/planavi-favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/planavi-favicon.svg',
    apple: '/planavi-favicon.svg',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://planning-visites.fr'),
  openGraph: {
    siteName: 'Planavi',
    type: 'website',
    locale: 'fr_FR',
    title: 'Planavi - Visitez vos proches, simplement',
    description: 'Organisez les visites de vos proches avec un planning partagé. Gratuit, sans inscription pour les visiteurs.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Planavi - Visitez vos proches' }],
  },
  twitter: {
    card: 'summary',
    title: 'Planavi - Visitez vos proches, simplement',
    description: 'Organisez les visites de vos proches avec un planning partagé. Gratuit, sans inscription.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="flex flex-col min-h-screen">
        {children}
        <Footer />
      </body>
    </html>
  );
}
