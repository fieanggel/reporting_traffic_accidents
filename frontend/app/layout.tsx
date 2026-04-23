import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ResponCepat | Dashboard Pelaporan Kecelakaan",
  description:
    "Platform pelaporan kecelakaan dan pemantauan area rawan secara real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={publicSans.variable + " h-full antialiased"}>
      <body className="min-h-full bg-background font-sans text-foreground selection:bg-primary-container selection:text-on-primary-container">
        <div className="flex min-h-full flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
