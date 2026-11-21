import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { rainInspiration, type Inspiration } from "@/features/inspiration/catalog";
import { styleNames } from "@/features/styling/engine";
import { readInspiration } from "@/server/inspiration";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Inspirasi" };

export default async function InspirationPage({ searchParams }: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const titleQuery = typeof q === "string" ? q.trim().slice(0, 90) : "";
  const titleFilter = titleQuery.toLowerCase();
  let entries: Inspiration[] = [];
  let unavailable = false;
  try {
    entries = (await readInspiration()).filter(entry => entry.active
      && (entry.title.toLowerCase().includes(titleFilter) || entry.drama.toLowerCase().includes(titleFilter)));
  } catch {
    unavailable = true;
  }

  return <>
    <SiteHeader />
    <main id="main" className="shell stylist-page">
      <div className="stylist-intro">
        <h1>Inspirasi <em>outfit</em></h1>
        <p>Ambil satu ide dari drama, lalu padukan dengan pakaian yang kamu punya.</p>
      </div>
      {!unavailable && <Form key={titleQuery} role="search" aria-label="Cari inspirasi" action="/inspirasi" className="panel inspiration-search">
        <label>Judul drama atau inspirasi
          <input name="q" type="search" defaultValue={titleQuery} maxLength={90} />
        </label>
        <button className="button primary" type="submit">Cari</button>
        {titleQuery && <Link href="/inspirasi" className="text-button account-back">Lihat semua</Link>}
      </Form>}
      {unavailable ? <p className="error-message" role="alert">Inspirasi belum bisa dimuat. Kamu masih bisa membuka stylist.</p>
        : !entries.length ? <div className="panel">
          <p>{titleQuery ? <>Belum ada inspirasi untuk “{titleQuery}”.</> : "Belum ada inspirasi yang ditampilkan."}</p>
          <Link href="/stylist" className="text-button account-back">Buat gaya dari lemarimu</Link>
        </div>
        : <div className="inspiration-list">{entries.map(entry => <article className="panel inspiration-card" key={entry.slug}>
          {entry.slug === rainInspiration.slug && <Image src="/demo/sunrise-through-the-rain.png"
            alt="Dua orang berkemeja putih berbagi earphone" width={640} height={360} unoptimized />}
          <div className="inspiration-copy">
            <p className="fine-print">{entry.drama}</p>
            <h2>{entry.title}</h2>
            <p>{entry.stylingNote}</p>
            <div className="form-actions">
              <Link href={`/stylist?inspiration=${encodeURIComponent(entry.slug)}`} className="button primary">Coba gaya {styleNames[entry.style]}</Link>
              <a href={entry.sourceUrl} className="text-button account-back" rel="noreferrer">Sumber judul</a>
            </div>
          </div>
        </article>)}</div>}
      {unavailable && <Link href="/stylist" className="text-button account-back">Buka stylist</Link>}
    </main>
  </>;
}
