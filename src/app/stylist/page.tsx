import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { parseDemoQuery } from "@/features/demo/data";
import { Stylist } from "@/features/styling/stylist";
import { accountServices } from "@/server/auth";
import { readAccountWardrobe } from "@/server/wardrobe-actions";

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
  return <><SiteHeader /><main id="main" className="shell stylist-page">
    <Stylist key={account?.id ?? "guest"} initialDemo={initialDemo} startWithDemo={startWithDemo}
      accountsEnabled={accountsEnabled} account={account} accountUnavailable={accountUnavailable} />
  </main></>;
}
