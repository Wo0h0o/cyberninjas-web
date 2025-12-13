import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CyberNinjas - AI Образование в България",
  description: "Най-голямата промпт библиотека и образователна платформа за Изкуствен Интелект в България. Безплатни ресурси и практични курсове за AI автоматизация.",
  keywords: ["AI", "изкуствен интелект", "промпти", "курсове", "образование", "България", "ChatGPT"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg">
      <body className={inter.variable}>
        {children}
      </body>
    </html>
  );
}
