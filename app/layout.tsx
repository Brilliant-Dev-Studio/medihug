import type { Metadata } from "next";
import { Noto_Sans_Myanmar } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { LanguageProvider } from "./lib/LanguageContext";

const notoSansMyanmar = Noto_Sans_Myanmar({
  variable: "--font-noto-myanmar",
  subsets: ["myanmar"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MediHug",
  description: "MediHug Project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mm" className={`${notoSansMyanmar.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col relative">
        <LanguageProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: { fontFamily: 'var(--font-noto-myanmar)', fontSize: '14px' },
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
