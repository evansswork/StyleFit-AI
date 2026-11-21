"use server";

import { and, asc, eq } from "drizzle-orm";
import { slots, type Item, type Slot, type Style, type Weather } from "@/features/styling/engine";
import { currentAccount } from "./account-session";
import { user, wardrobe } from "./schema";

const fields = {
  id: wardrobe.id, name: wardrobe.name, slot: wardrobe.slot,
  color: wardrobe.color, styles: wardrobe.styles, weather: wardrobe.weather,
};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type SavedItem = Pick<Item, keyof typeof fields>;
type Changes =
  | { kind: "add"; item: unknown }
  | { kind: "edit"; item: unknown }
  | { kind: "remove"; id: unknown }
  | { kind: "import"; items: unknown };
type Result = { items: Item[] } | { error: string };

function choiceList<T extends string>(value: unknown, allowed: T[]): value is T[] {
  return Array.isArray(value) && value.length >= 1 && value.length <= allowed.length
    && value.every(option => allowed.includes(option)) && new Set(value).size === value.length;
}

function itemFromInput(input: unknown): SavedItem | null {
  if (!input || typeof input !== "object") return null;
  const { id, name, slot, color, styles, weather } = input as Record<string, unknown>;
  if (typeof id !== "string" || !uuid.test(id)
    || typeof name !== "string" || !name.trim() || name.trim().length > 60
    || !slots.includes(slot as Slot) || typeof color !== "string" || !/^#[a-f0-9]{6}$/i.test(color)
    || !choiceList<Style>(styles, ["casual", "smart-casual"])
    || !choiceList<Weather>(weather, ["tropical", "cool"])) return null;
  return { id: id.toLowerCase(), name: name.trim(), slot: slot as Slot, color, styles, weather };
}

function toItems(rows: SavedItem[]): Item[] {
  return rows.map(row => ({ ...row, source: "wardrobe", price: null, available: true }));
}

export async function readAccountWardrobe() {
  const account = await currentAccount();
  if (!account) return null;
  const [rows, [profile]] = await Promise.all([
    account.db.select(fields).from(wardrobe)
      .where(eq(wardrobe.userId, account.user.id)).orderBy(asc(wardrobe.createdAt), asc(wardrobe.id)),
    account.db.select({ style: user.preferredStyle, weather: user.preferredWeather })
      .from(user).where(eq(user.id, account.user.id)),
  ]);
  return { id: account.user.id, name: account.user.name, items: toItems(rows), preferences: profile };
}

export async function changeAccountWardrobe(expectedAccount: string, change: Changes): Promise<Result> {
  if (!change || typeof change !== "object") return { error: "Perubahan pakaian tidak valid." };
  try {
    const account = await currentAccount();
    if (!account || account.user.id !== expectedAccount) {
      return { error: "Sesi akun berubah. Buka ulang stylist sebelum menyimpan." };
    }
    const userId = account.user.id;
    return await account.db.transaction(async tx => {
      // Serialize writes to keep the 40-item limit intact across tabs.
      await tx.select({ id: user.id }).from(user).where(eq(user.id, userId)).for("update");
      const matchItem = (id: string) => and(eq(wardrobe.userId, userId), eq(wardrobe.id, id));
      if (change.kind === "remove") {
        if (typeof change.id !== "string" || !uuid.test(change.id)) return { error: "Item tidak valid." };
        await tx.delete(wardrobe).where(matchItem(change.id));
      } else if (change.kind === "add" || change.kind === "import") {
        const input = change.kind === "add" ? [change.item] : change.items;
        if (!Array.isArray(input) || input.length < 1 || input.length > 40) return { error: "Data pakaian tidak valid." };
        const incoming = new Map<string, SavedItem>();
        for (const candidate of input) {
          const item = itemFromInput(candidate);
          if (!item || incoming.has(item.id)) return { error: "Data pakaian tidak valid atau duplikat." };
          incoming.set(item.id, item);
        }
        const existing = await tx.select({ id: wardrobe.id }).from(wardrobe).where(eq(wardrobe.userId, userId));
        for (const { id } of existing) incoming.delete(id);
        if (existing.length + incoming.size > 40) return { error: "Lemari mendukung maksimal 40 item. Draft belum dipindahkan." };
        if (incoming.size) await tx.insert(wardrobe).values([...incoming.values()].map(item => ({ ...item, userId })));
      } else if (change.kind === "edit") {
        const item = itemFromInput(change.item);
        if (!item) return { error: "Data pakaian tidak valid." };
        const { id, ...updates } = item;
        const updated = await tx.update(wardrobe).set(updates).where(matchItem(id)).returning({ id: wardrobe.id });
        if (!updated.length) return { error: "Item sudah tidak tersedia di lemarimu." };
      } else {
        return { error: "Perubahan pakaian tidak valid." };
      }
      const rows = await tx.select(fields).from(wardrobe).where(eq(wardrobe.userId, userId))
        .orderBy(asc(wardrobe.createdAt), asc(wardrobe.id));
      return { items: toItems(rows) };
    });
  } catch {
    return { error: "Lemari akun belum bisa disimpan. Coba lagi tanpa menutup tab." };
  }
}
