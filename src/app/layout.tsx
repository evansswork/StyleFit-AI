import type { Metadata } from "next";
import { GuestWardrobeProvider } from "@/features/wardrobe/guest-wardrobe";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "StyleFit AI — Gaya dari lemarimu", template: "%s | StyleFit AI" },
  description: "Temukan kombinasi baru dari pakaian yang kamu punya. Coba stylist tanpa akun, scan, atau API berbayar.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body><a href="#main" className="skip-link">Lewati ke isi utama</a><GuestWardrobeProvider>{children}</GuestWardrobeProvider></body></html>;
}
