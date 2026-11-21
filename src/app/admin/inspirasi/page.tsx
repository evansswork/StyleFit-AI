import Link from "next/link";
import type { Metadata } from "next";
import type { Inspiration } from "@/features/inspiration/catalog";
import { SiteHeader } from "@/components/site-header";
import { currentCatalogAdmin, readInspiration } from "@/server/inspiration";
import { InspirationForm } from "./inspiration-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Kelola inspirasi" };

export default async function AdminInspirationPage() {
  let editor: string | undefined;
  let entries: Inspiration[] = [];
  let unavailable = false;
  try {
    const admin = await currentCatalogAdmin();
    if (admin) {
      editor = admin.user.id;
      entries = await readInspiration();
    }
  } catch {
    unavailable = true;
  }
  return <>
    <SiteHeader />
    <main id="main" className="shell stylist-page admin-page">
      <div className="stylist-intro"><h1>Kelola <em>inspirasi</em></h1></div>
      {unavailable ? <p className="error-message" role="alert">Katalog belum bisa dimuat. Muat ulang untuk mencoba lagi.</p>
        : editor ? <>
          <InspirationForm editor={editor} />
          {entries.map(entry => <InspirationForm editor={editor} entry={entry} key={entry.slug} />)}
        </> : <section className="panel"><h2>Akses admin diperlukan</h2><Link href="/akun" className="text-button account-back">Buka akun</Link></section>}
    </main>
  </>;
}
