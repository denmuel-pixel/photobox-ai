import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppSplash from "@/components/AppSplash";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Photobox AI - Ubah Fotomu dengan Kecerdasan Buatan",
  description:
    "Upload foto, pilih template AI, dan biarkan AI mengubah fotomu menjadi karya seni yang menakjubkan!",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AppSplash>{children}</AppSplash>
      </body>
    </html>
  );
}
