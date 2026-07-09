import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import "./knock-theme.css";
import { LanguageProvider } from "./lib/LanguageContext";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MediHug",
  description: "MediHug — Compassionate Healthcare",
  icons: {
    icon: '/favicon/favicon-96x96.png',
    shortcut: '/favicon/favicon-96x96.png',
    apple: '/favicon/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mm" className={`${poppins.variable} h-full antialiased`}>
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
