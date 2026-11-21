import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { parseDemoQuery } from "@/features/demo/data";
import { Stylist } from "@/features/styling/stylist";

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
  return <><SiteHeader /><main id="main" className="shell stylist-page"><Stylist initialDemo={parseDemoQuery(params)} startWithDemo={query.demo === "1"} /></main></>;
}
