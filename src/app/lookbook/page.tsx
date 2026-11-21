import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { accountServices } from "@/server/auth";
import { readLookbook } from "@/server/lookbook-actions";
import { LookCard } from "./look-card";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Lookbook" };

export default async function LookbookPage() {
  let data: Awaited<ReturnType<typeof readLookbook>> = null;
  let failed = false;
  try {
    data = await readLookbook();
  } catch {
    failed = true;
  }
  return <>
    <SiteHeader />
    <main id="main" className="shell stylist-page">
      <div className="stylist-intro">
        <h1>Lookbook <em>kamu</em></h1>
        <p>Buka kembali kombinasi yang sudah kamu simpan.</p>
      </div>
      {failed ? <p className="error-message" role="alert">Lookbook belum bisa dimuat. Muat ulang untuk mencoba lagi.</p>
        : !data ? <div className="panel">
          <p>{accountServices() ? "Masuk untuk membuka lookbook." : "Lookbook tersedia saat akun lokal diaktifkan."}</p>
          {accountServices() && <Link href="/akun" className="text-button account-back">Masuk</Link>}
        </div> : !data.looks.length ? <section className="panel">
          <h2>Belum ada outfit tersimpan</h2>
          <p>Buat kombinasi dari lemari lalu simpan pilihan yang kamu suka.</p>
        </section> : <div className="lookbook-grid">
          {data.looks.map(look => <LookCard key={look.id} look={look} accountId={data.accountId} />)}
        </div>}
      <Link href="/stylist" className="text-button account-back">Kembali ke stylist</Link>
    </main>
  </>;
}
