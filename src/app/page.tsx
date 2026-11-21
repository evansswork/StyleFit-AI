import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { DemoStudio } from "@/features/demo/demo-studio";

export default function Home() {
  return <>
    <SiteHeader />
    <main id="main">
      <section className="hero shell" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title">Gaya yang kamu suka. <em>Dari baju yang kamu punya.</em></h1>
          <p className="hero-description">Padu padankan isi lemarimu sesuai gaya dan cuaca. Mulai tanpa akun.</p>
          <div className="hero-actions">
            <Link href="/stylist" className="button primary">Coba stylist</Link>
            <a href="#demo" className="button secondary">Mainkan demo</a>
          </div>
        </div>
        <figure className="hero-media photo-entrance">
          <Image
            src="/demo/zheng-yu-chen-yanzhou.png"
            alt="Zheng Yu dan Chen Yanzhou mengenakan kemeja putih dan berbagi earphone"
            width={640}
            height={360}
            preload
            unoptimized
          />
          <figcaption>Zheng Yu dan Chen Yanzhou</figcaption>
        </figure>
      </section>
      <div className="shell">
        <DemoStudio />
      </div>
      <section className="how-section shell" id="cara-kerja" aria-labelledby="how-title">
        <h2 id="how-title">Dari lemari ke outfit</h2>
        <div className="how-steps">
          <article><h3>Isi lemari</h3><p>Masukkan nama, kategori, dan warna pakaianmu.</p></article>
          <article><h3>Pilih konteks</h3><p>Atur gaya dan cuaca, lalu kunci item yang ingin kamu pakai.</p></article>
          <article><h3>Bandingkan kombinasi</h3><p>Lihat hingga tiga pilihan beserta alasan setiap rekomendasi.</p></article>
        </div>
      </section>
    </main>
    <footer className="site-footer shell"><span>stylefit AI</span><Link href="/stylist">Buka stylist</Link></footer>
  </>;
}
