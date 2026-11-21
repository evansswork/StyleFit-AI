import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { DemoStudio } from "@/features/demo/demo-studio";

export default function Home() {
  return <>
    <SiteHeader />
    <main id="main">
      <div className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">PAKAI ULANG. TEMUKAN GAYA BARU.</p>
          <h1>Gaya yang kamu suka.<br /><span>Dari baju yang<br className="desktop-break" /> kamu punya.</span></h1>
          <p className="hero-description">Lemari sedikit, kemungkinan tetap banyak. Temukan padu padan untuk harimu, tanpa harus mulai dari belanja.</p>
          <div className="hero-actions"><Link href="/stylist" className="button primary">Coba stylist</Link><a href="#demo" className="button secondary">Mainkan demo</a></div>
          <p className="hero-note">Tanpa akun. Tanpa foto tubuh. Mulai dari yang ada.</p>
          <div className="editorial-note"><span className="note-line" /><p>Terinspirasi gayanya.<br /><strong>Tetap jadi diri sendiri.</strong></p></div>
          <div className="hero-bottom"><span>YOUR WARDROBE, REIMAGINED</span><span>STYLEFIT / EARLY EDITION</span></div>
        </div>
        <DemoStudio />
      </div>
      <section className="how-section shell" id="cara-kerja" aria-labelledby="how-title">
        <div><p className="eyebrow">LEBIH DEKAT DENGAN LEMARIMU</p><h2 id="how-title">Bukan selalu baju baru.<br />Kadang, kombinasi baru.</h2></div>
        <div className="how-steps">
          <article><h3>Mulai dari yang kamu punya</h3><p>Masukkan pakaian secara manual. Kamu yang menentukan atribut dan barang yang tersedia.</p></article>
          <article><h3>Sesuaikan dengan harimu</h3><p>Pilih casual atau smart casual, tropis atau sejuk. Pertahankan item favorit dan lihat alternatifnya.</p></article>
          <article><h3>Pilih yang ingin kamu pakai</h3><p>Bandingkan hingga tiga kombinasi beserta alasannya. Rekomendasi awal bekerja tanpa model AI.</p></article>
        </div>
      </section>
      <section className="honesty-section shell" aria-labelledby="preview-title">
        <p className="eyebrow">TENTANG VERSI INI</p><h2 id="preview-title">Keputusan outfit dulu.<br />Visual canggih menyusul.</h2>
        <p>Yang bisa kamu coba sekarang: demo interaktif dan stylist berbasis aturan. Inspirasi K-drama terkurasi, avatar 3D, analisis screenshot, serta photo try-on masih dalam pengembangan. Ilustrasi yang tampil tidak menjamin ukuran pakaian.</p>
        <Link href="/stylist" className="button primary">Mulai dari lemariku</Link>
      </section>
    </main>
    <footer className="site-footer shell"><span>stylefit AI</span><p>Lebih banyak cara memakai yang sudah ada.</p><a href="/stylist">Buka stylist</a></footer>
  </>;
}
