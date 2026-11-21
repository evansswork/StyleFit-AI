import "server-only";
import { headers } from "next/headers";
import { accountServices } from "./auth";

export async function currentAccount() {
  const services = accountServices();
  if (!services) return null;
  const session = await services.auth.api.getSession({ headers: await headers() });
  return session?.user.emailVerified ? { db: services.db, user: session.user } : null;
}
