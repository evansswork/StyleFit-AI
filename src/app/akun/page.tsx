import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { accountServices } from "@/server/auth";
import { readProfile } from "@/server/profile-actions";
import { AccountForm } from "./account-form";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Akun" };

export default async function AccountPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const resetToken = typeof query.token === "string" && query.token.length <= 256 ? query.token : undefined;
  const enabled = Boolean(accountServices());
  const editorEmail = process.env.STYLEFIT_ADMIN_EMAIL?.trim().toLowerCase();
  let profile: Awaited<ReturnType<typeof readProfile>> = null;
  let failed = false;
  if (enabled && !resetToken) {
    try {
      profile = await readProfile();
    } catch {
      failed = true;
    }
  }
  return <>
    <SiteHeader />
    <main id="main" className="shell stylist-page account-page">
      <div className="stylist-intro">
        <h1>Akun <em>StyleFit</em></h1>
        <p>{profile ? "Atur nama dan pilihan awal saat membuka stylist." : "Masuk agar lemarimu bisa dibuka lagi."}</p>
      </div>
      {!enabled ? <section className="panel"><h2>Akun belum aktif</h2><p>Stylist tetap tersedia untuk dicoba sebagai guest.</p></section>
        : failed ? <p className="error-message" role="alert">Akun belum bisa dimuat. Muat ulang untuk mencoba lagi.</p>
        : profile ? <>
          <ProfileForm profile={profile} />
          {editorEmail && profile.email.toLowerCase() === editorEmail &&
            <Link href="/admin/inspirasi" className="text-button account-back">Kelola inspirasi</Link>}
        </>
        : <AccountForm resetToken={resetToken} invalidLink={Boolean(query.error)} verified={query.verified === "1"} />}
      <Link href="/stylist" className="text-button account-back">Kembali ke stylist</Link>
    </main>
  </>;
}
