import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return <><SiteHeader /><main id="main" className="shell empty-page"><p className="eyebrow">HALAMAN BELUM TERSEDIA</p><h1>Kembali ke ruang coba.</h1><p>Fitur ini belum ada pada versi awal StyleFit.</p><Link href="/" className="button primary">Kembali ke beranda</Link></main></>;
}
