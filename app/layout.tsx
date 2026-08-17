import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { LanguageProvider } from "./lib/LanguageContext";

const yati = localFont({
  src: "../public/Yati font/Variation/Yati Sans Variation.ttf",
  variable: "--font-poppins",
  weight: "100 900",
  display: "swap",
});

const SITE_URL = "https://www.medihug.org";
const SITE_NAME = "MediHug";
const TITLE = "MediHug — ကျန်းမာရေး စောင့်ရှောက်မှု သင့်လက်တစ်ကမ်းမှာ";
const DESCRIPTION =
  "MediHug မှတစ်ဆင့် အချိန်မရွေး ဆေးရုံဆေးခန်းကြီးများနှင့် တိုက်ရိုက်ဗီဒီယိုကောလ်ပြသပြီး သင့်ကျန်းမာရေးကို စိတ်ချရဆုံး စောင့်ရှောက်လိုက်ပါ။ ဆရာဝန်ချိန်းဆိုမှု၊ ကျန်းမာရေးထုတ်ကုန်များနှင့် Online Consultation တစ်နေရာတည်းတွင်။";
const KEYWORDS = [
  "MediHug", "ကျန်းမာရေး", "ဆေးခန်း", "ဆရာဝန်ချိန်းဆိုမှု", "Online Doctor Myanmar",
  "Telemedicine Myanmar", "Video Consultation", "healthcare Myanmar", "medihug.org",
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: `%s | ${SITE_NAME}` },
  description: DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: SITE_NAME,
  category: "Healthcare",
  alternates: { canonical: "/" },
  icons: {
    icon: '/favicon/favicon-96x96.png',
    shortcut: '/favicon/favicon-96x96.png',
    apple: '/favicon/apple-touch-icon.png',
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    locale: "my_MM",
    alternateLocale: ["en_US"],
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalBusiness",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/medihug-logo.png`,
      image: `${SITE_URL}/og-image.jpg`,
      description: DESCRIPTION,
      areaServed: { "@type": "Country", name: "Myanmar" },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "my-MM",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mm" className={`${yati.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col relative">
        <LanguageProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: { fontFamily: 'var(--font-poppins)', fontSize: '14px' },
              success: { iconTheme: { primary: '#0d2b6e', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
