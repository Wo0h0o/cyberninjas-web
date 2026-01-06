import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CyberNinjas - AI Образование в България",
  description: "Най-голямата промпт библиотека и образователна платформа за Изкуствен Интелект в България. Безплатни ресурси и практична академия за AI автоматизация.",
  keywords: ["AI", "изкуствен интелект", "промпти", "академия", "образование", "България", "ChatGPT"],
  other: {
    charset: "UTF-8",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg">
      <body className={inter.variable}>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
