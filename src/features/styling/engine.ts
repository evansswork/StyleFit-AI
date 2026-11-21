export const slots = ["top", "bottom", "shoes", "outer"] as const;
export type Slot = typeof slots[number];
export type Style = "casual" | "smart-casual";
export type Weather = "tropical" | "cool";
export type Item = {
  id: string;
  name: string;
  slot: Slot;
  color: string;
  styles: Style[];
  weather: Weather[];
  source: "demo" | "wardrobe" | "catalog";
  price: number | null;
  available: boolean;
};
export type Selection = Partial<Record<Slot, string>>;
export type Outfit = {
  items: Item[];
  knownAdditionalCost: number;
  budgetStatus: "within" | "unknown";
  unknownPrices: string[];
  reasons: string[];
};
export type StylingRequest = {
  items: Item[];
  style: Style;
  weather: Weather;
  budget: number;
  locked?: Selection;
  referenceTopColor?: string;
};
export type StylingResult = { outfits: Outfit[]; error: string | null; missing: Slot[] };

export const slotNames: Record<Slot, string> = {
  top: "Atasan", bottom: "Bawahan", shoes: "Sepatu", outer: "Outer",
};
export const styleNames: Record<Style, string> = { casual: "Casual", "smart-casual": "Smart casual" };
export const weatherNames: Record<Weather, string> = { tropical: "Tropis", cool: "Sejuk" };
export const garmentColors = { putih: "#f3f4f0", hitam: "#303941", biru: "#8cacc9", abu: "#899399", hijau: "#71877a", merah: "#b56d75" };
export const rupiah = (amount: number) => new Intl.NumberFormat("id-ID", {
  style: "currency", currency: "IDR", maximumFractionDigits: 0,
}).format(amount);

export function generateOutfits(request: StylingRequest): StylingResult {
  const { items, style, weather, budget, locked = {}, referenceTopColor } = request;
  const fail = (error: string, missing: Slot[] = []): StylingResult => ({ outfits: [], error, missing });
  if (!Number.isSafeInteger(budget) || budget < 0 || budget > 1_000_000_000) {
    return fail("Bujet harus berupa rupiah utuh antara 0 dan 1 miliar.");
  }
  if (!["casual", "smart-casual"].includes(style) || !["tropical", "cool"].includes(weather)) {
    return fail("Pilih gaya dan konteks yang tersedia.");
  }
  if (items.length > 40 || new Set(items.map(item => item.id)).size !== items.length
    || items.some(item => !item.id || !item.name.trim() || !slots.includes(item.slot)
      || !["wardrobe", "demo", "catalog"].includes(item.source)
      || (item.price !== null && (!Number.isSafeInteger(item.price) || item.price < 0 || item.price > 1_000_000_000)))) {
    return fail("Data pakaian tidak valid. Gunakan maksimal 40 item dengan identitas unik dan harga rupiah yang valid.");
  }

  const required: Slot[] = weather === "cool" ? [...slots] : ["top", "bottom", "shoes"];
  for (const [slot, id] of Object.entries(locked)) {
    const item = items.find(candidate => candidate.id === id && candidate.slot === slot);
    if (!item || !item.available) return fail("Item terkunci sudah tidak tersedia. Lepaskan kuncinya atau perbarui pilihan.");
    if (!required.includes(item.slot) || !item.styles.includes(style) || !item.weather.includes(weather)) {
      return fail(`${item.name} masih terkunci dan tidak sesuai konteks baru. Lepaskan kunci atau pertahankan konteks sebelumnya.`);
    }
  }

  const candidates = required.map(slot => items.filter(item => item.slot === slot && item.available
    && item.styles.includes(style) && item.weather.includes(weather)
    && (!locked[slot] || locked[slot] === item.id)));
  const missing = required.filter((_, index) => !candidates[index].length);
  if (missing.length) return fail(`Belum ada ${missing.map(slot => slotNames[slot].toLowerCase()).join(", ")} yang sesuai. Tambahkan item atau ubah konteks.`, missing);

  const best: { outfit: Outfit; score: number; key: string }[] = [];
  function combine(index: number, chosen: Item[]) {
    if (index < candidates.length) {
      for (const item of candidates[index]) combine(index + 1, [...chosen, item]);
      return;
    }
    const purchases = chosen.filter(item => item.source === "catalog");
    const knownAdditionalCost = purchases.reduce((sum, item) => sum + (item.price ?? 0), 0);
    if (knownAdditionalCost > budget) return;
    const unknownPrices = purchases.filter(item => item.price === null).map(item => item.id);
    const owned = chosen.filter(item => item.source === "wardrobe").length;
    // shortcut: prefer matching/neutral colors; evaluate richer color rules with user feedback.
    const colors = new Set(chosen.map(item => item.color));
    const followsReference = Boolean(referenceTopColor) && chosen.some(item => item.slot === "top" && item.color === referenceTopColor);
    const score = owned * 1000 - purchases.length * 100 - unknownPrices.length * 10 - colors.size + (followsReference ? 5 : 0);
    const outfit: Outfit = {
      items: chosen,
      knownAdditionalCost,
      budgetStatus: unknownPrices.length ? "unknown" : "within",
      unknownPrices,
      reasons: [
        `${styleNames[style]} untuk konteks ${weatherNames[weather].toLowerCase()} berdasarkan atribut yang dimasukkan.`,
        weather === "cool" ? "Outer ditambahkan untuk layering ringan; bukan panduan pakaian winter." : "Tanpa outer agar kombinasi lebih ringan untuk konteks tropis.",
        ...(followsReference ? ["Warna atasan mengikuti preferensimu."] : []),
        owned ? `${owned} item berasal dari lemarimu; harga beli lamanya tidak dihitung sebagai belanja baru.` : "Kombinasi ini tidak memakai barang dari lemarimu.",
        ...(chosen.some(item => item.source === "demo") ? ["Item contoh adalah ilustrasi pilihan, bukan barang yang diklaim kamu miliki."] : []),
        ...(unknownPrices.length ? ["Harga tambahan belum lengkap; outfit belum dapat dinyatakan memenuhi bujet."] : []),
      ],
    };
    best.push({ outfit, score, key: chosen.map(item => item.id).join("|") });
    best.sort((a, b) => b.score - a.score
      || a.outfit.knownAdditionalCost - b.outfit.knownAdditionalCost || a.key.localeCompare(b.key));
    best.splice(3);
  }
  combine(0, []);
  if (!best.length) return fail("Belum ada kombinasi yang memenuhi bujet dan item terkunci. Ubah pilihan atau bujetmu.");
  return { outfits: best.map(entry => entry.outfit), error: null, missing: [] };
}
