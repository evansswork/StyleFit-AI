import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { parseDemoQuery } from "@/features/demo/data";
import { Stylist } from "@/features/styling/stylist";
import { accountServices } from "@/server/auth";
import { readAccountWardrobe } from "@/server/wardrobe-actions";
import { readInspiration } from "@/server/inspiration";
import type { Inspiration } from "@/features/inspiration/catalog";

export const metadata: Metadata = { title: "Stylist" };

export default async function StylistPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const params = new URLSearchParams();
  for (const key of ["style", "weather", "top", "bottom", "shoes", "outer", "locked"]) {
    const value = query[key];
    if (typeof value === "string") params.set(key, value);
  }
  const accountsEnabled = Boolean(accountServices());
  let account: Awaited<ReturnType<typeof readAccountWardrobe>> = null;
  let accountUnavailable = false;
  if (accountsEnabled) {
    try {
      account = await readAccountWardrobe();
    } catch {
      accountUnavailable = true;
    }
  }
  const startWithDemo = query.demo === "1";
  const initialDemo = parseDemoQuery(params);
  if (!startWithDemo && account?.preferences) {
    initialDemo.style = account.preferences.style;
    initialDemo.weather = account.preferences.weather;
  }
  const inspirationSlug = !startWithDemo && typeof query.inspiration === "string" ? query.inspiration : "";
  let inspiration: Inspiration | undefined;
  if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(inspirationSlug) && inspirationSlug.length <= 64) {
    try {
      inspiration = (await readInspiration()).find(entry => entry.active && entry.slug === inspirationSlug);
      if (inspiration) initialDemo.style = inspiration.style;
    } catch {
      // The stylist remains usable with the account defaults or guest choices.
    }
  }
  return <><SiteHeader /><main id="main" className="shell stylist-page">
    {inspirationSlug && !inspiration && <p className="privacy-note">Inspirasi ini belum tersedia. <Link href="/inspirasi" className="inline-link">Lihat inspirasi lain</Link></p>}
    <Stylist key={`${account?.id ?? "guest"}:${inspiration?.slug ?? ""}:${startWithDemo}`} initialDemo={initialDemo} startWithDemo={startWithDemo}
      inspiration={inspiration}
      accountsEnabled={accountsEnabled} account={account} accountUnavailable={accountUnavailable} />
  </main></>;
}
