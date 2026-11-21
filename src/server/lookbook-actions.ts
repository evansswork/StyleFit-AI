"use server";

import { and, desc, eq, inArray } from "drizzle-orm";
import { generateOutfits, type Item, type Style, type Weather } from "@/features/styling/engine";
import { currentAccount } from "./account-session";
import { savedOutfit, user, wardrobe } from "./schema";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Result = { ok: true } | { error: string };
type RecordItem = Pick<Item, "id" | "name" | "slot" | "color" | "styles" | "weather">;

function wardrobeItem(row: RecordItem): Item {
  return { id: row.id, name: row.name, slot: row.slot, color: row.color, styles: row.styles, weather: row.weather,
    source: "wardrobe", price: null, available: true };
}

export async function readLookbook() {
  const account = await currentAccount();
  if (!account) return null;
  const userId = account.user.id;
  const looks = await account.db.select().from(savedOutfit)
    .where(eq(savedOutfit.userId, userId)).orderBy(desc(savedOutfit.createdAt), desc(savedOutfit.id));
  const rows = await account.db.select().from(wardrobe).where(eq(wardrobe.userId, userId));
  const items = new Map(rows.map(row => [row.id, wardrobeItem(row)]));
  return {
    accountId: userId,
    looks: looks.map(look => ({
      id: look.id, style: look.style, weather: look.weather, feedback: look.feedback, note: look.note,
      items: look.itemIds.flatMap(id => items.get(id) ?? []),
      missingCount: look.itemIds.filter(id => !items.has(id)).length,
    })),
  };
}

export async function saveOutfit(expectedAccount: string, itemIds: string[], style: Style, weather: Weather): Promise<Result> {
  if (!Array.isArray(itemIds) || ![3, 4].includes(itemIds.length)
    || new Set(itemIds).size !== itemIds.length || itemIds.some(id => typeof id !== "string" || !uuid.test(id))) {
    return { error: "Kombinasi pakaian tidak valid." };
  }
  try {
    const account = await currentAccount();
    if (!account || account.user.id !== expectedAccount) return { error: "Sesi akun berubah. Buka ulang stylist." };
    const userId = account.user.id;
    return await account.db.transaction(async tx => {
      await tx.select({ id: user.id }).from(user).where(eq(user.id, userId)).for("update");
      const rows = await tx.select().from(wardrobe).where(and(eq(wardrobe.userId, userId), inArray(wardrobe.id, itemIds)));
      const result = generateOutfits({ items: rows.map(wardrobeItem), style, weather, budget: 0 });
      const outfit = result.outfits[0];
      if (!outfit || outfit.items.length !== itemIds.length) {
        return { error: "Isi lemari sudah berubah. Buat ulang kombinasi sebelum menyimpan." };
      }
      const selection = outfit.items.map(item => item.id);
      const existing = await tx.select({ id: savedOutfit.id }).from(savedOutfit).where(eq(savedOutfit.userId, userId));
      if (existing.length >= 50) {
        const [duplicate] = await tx.select({ id: savedOutfit.id }).from(savedOutfit).where(and(
          eq(savedOutfit.userId, userId), eq(savedOutfit.style, style), eq(savedOutfit.weather, weather), eq(savedOutfit.itemIds, selection),
        )).limit(1);
        return duplicate ? { ok: true } : { error: "Lookbook penuh. Hapus satu kombinasi sebelum menyimpan." };
      }
      await tx.insert(savedOutfit).values({ userId, itemIds: selection, style, weather }).onConflictDoNothing();
      return { ok: true };
    });
  } catch {
    return { error: "Kombinasi belum tersimpan. Coba lagi." };
  }
}

export async function updateOutfit(expectedAccount: string, id: string, change:
  { kind: "delete" } | { kind: "feedback"; status: "worn" | "skipped" | null; note: string }): Promise<Result> {
  if (typeof id !== "string" || !uuid.test(id) || !change || typeof change !== "object") {
    return { error: "Kombinasi tidak valid." };
  }
  try {
    const account = await currentAccount();
    if (!account || account.user.id !== expectedAccount) return { error: "Sesi akun berubah. Buka ulang lookbook." };
    const match = and(eq(savedOutfit.userId, account.user.id), eq(savedOutfit.id, id));
    if (change.kind === "delete") {
      await account.db.delete(savedOutfit).where(match);
      return { ok: true };
    }
    if (change.kind !== "feedback" || !["worn", "skipped", null].includes(change.status)
      || typeof change.note !== "string" || change.note.trim().length > 160) return { error: "Umpan balik tidak valid." };
    const updated = await account.db.update(savedOutfit).set({ feedback: change.status, note: change.note.trim() })
      .where(match).returning({ id: savedOutfit.id });
    return updated.length ? { ok: true } : { error: "Kombinasi sudah tidak tersedia." };
  } catch {
    return { error: "Perubahan belum tersimpan. Coba lagi." };
  }
}
