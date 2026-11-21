"use server";

import { eq } from "drizzle-orm";
import { styleNames, weatherNames, type Style, type Weather } from "@/features/styling/engine";
import { currentAccount } from "./account-session";
import { user } from "./schema";

export async function readProfile() {
  const account = await currentAccount();
  if (!account) return null;
  const [profile] = await account.db.select({
    id: user.id, name: user.name, email: user.email,
    style: user.preferredStyle, weather: user.preferredWeather,
  }).from(user).where(eq(user.id, account.user.id));
  return profile ?? null;
}

export async function updateProfile(expectedAccount: string, name: string, style: Style, weather: Weather) {
  if (typeof name !== "string" || !name.trim() || name.trim().length > 60
    || typeof style !== "string" || !Object.hasOwn(styleNames, style)
    || typeof weather !== "string" || !Object.hasOwn(weatherNames, weather)) {
    return { error: "Periksa nama, gaya, dan cuaca pilihanmu." };
  }
  try {
    const account = await currentAccount();
    if (!account || account.user.id !== expectedAccount) return { error: "Sesi akun berubah. Buka ulang profil." };
    const updated = await account.db.update(user)
      .set({ name: name.trim(), preferredStyle: style, preferredWeather: weather, updatedAt: new Date() })
      .where(eq(user.id, account.user.id)).returning({ id: user.id });
    return updated.length ? { error: null } : { error: "Akun sudah tidak tersedia." };
  } catch {
    return { error: "Profil belum tersimpan. Coba lagi." };
  }
}
