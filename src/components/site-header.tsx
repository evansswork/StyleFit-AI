import Link from "next/link";

export function SiteHeader() {
  return <header className="site-header shell">
    <Link href="/" className="wordmark" aria-label="StyleFit AI beranda"><span className="brand-mark">sf</span>stylefit<span className="brand-ai">AI</span></Link>
    <nav aria-label="Navigasi utama"><Link href="/#cara-kerja">Cara kerja</Link><Link href="/stylist" className="nav-cta">Coba stylist</Link></nav>
  </header>;
}
