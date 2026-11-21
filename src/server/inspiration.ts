import "server-only";
import { asc } from "drizzle-orm";
import { rainInspiration } from "@/features/inspiration/catalog";
import { accountServices } from "./auth";
import { currentAccount } from "./account-session";
import { inspiration } from "./schema";

export async function readInspiration() {
  const services = accountServices();
  if (!services) return [rainInspiration];
  const entries = await services.db.select().from(inspiration).orderBy(asc(inspiration.title));
  return entries.some(entry => entry.slug === rainInspiration.slug) ? entries : [rainInspiration, ...entries];
}

export async function currentCatalogAdmin() {
  const email = process.env.STYLEFIT_ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) return null;
  const account = await currentAccount();
  return account?.user.email.toLowerCase() === email ? account : null;
}
