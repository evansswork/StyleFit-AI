import { describe, expect, it } from "vitest";
import { garmentColors, generateOutfits, type Item, type StylingRequest } from "../../src/features/styling/engine";
import { changeDemoContext, demoHref, demoItems, parseDemoQuery, preset } from "../../src/features/demo/data";

const owned = demoItems.map(item => ({ ...item, source: "wardrobe" as const }));
const base: StylingRequest = { items: owned, style: "casual", weather: "tropical", budget: 0 };

describe("styling engine", () => {
  it("creates up to three distinct outfits from available owned items without a purchase", () => {
    const result = generateOutfits(base);
    expect(result.error).toBeNull();
    expect(result.outfits).toHaveLength(3);
    expect(new Set(result.outfits.map(outfit => outfit.items.map(item => item.id).join("|"))).size).toBe(3);
    for (const outfit of result.outfits) {
      expect(outfit.items).toHaveLength(3);
      expect(outfit.items.every(item => item.source === "wardrobe")).toBe(true);
      expect(outfit.knownAdditionalCost).toBe(0);
      expect(outfit.budgetStatus).toBe("within");
    }
  });
  it("never replaces a locked item in any alternative", () => {
    const result = generateOutfits({ ...base, locked: { top: "tee-blue" } });
    expect(result.outfits).not.toHaveLength(0);
    expect(result.outfits.every(outfit => outfit.items.some(item => item.id === "tee-blue"))).toBe(true);
  });
  it("prefers a curated reference color after enforcing wardrobe locks", () => {
    const request = { ...base, referenceTopColor: garmentColors.putih };
    expect(generateOutfits(request).outfits[0].items.find(item => item.slot === "top")?.id).toBe("tee-white");
    expect(generateOutfits(request).outfits[0].reasons).toContain("Warna atasan mengikuti ide awal yang kamu pilih.");
    expect(generateOutfits({ ...request, locked: { top: "tee-blue" } }).outfits[0].items.find(item => item.slot === "top")?.id).toBe("tee-blue");
  });
  it("does not silently unlock a conflicting item", () => {
    const result = generateOutfits({ ...base, style: "smart-casual", locked: { top: "tee-blue" } });
    expect(result.outfits).toEqual([]);
    expect(result.error).toMatch(/terkunci/);
  });
  it("rejects unavailable, deleted, or wrong-slot locked items", () => {
    for (const locked of [{ top: "deleted" }, { top: "jeans-indigo" }, { top: "tee-blue" }]) {
      expect(generateOutfits({ ...base, items: owned.filter(item => item.id !== "tee-blue"), locked }).error).toMatch(/tidak tersedia/);
    }
  });
  it("explains missing categories and never invents a garment", () => {
    const result = generateOutfits({ ...base, items: owned.filter(item => item.slot === "top") });
    expect(result.outfits).toEqual([]);
    expect(result.error).toMatch(/bawahan, sepatu/);
  });
  it("requires a suitable outer for cool weather and excludes it in tropical weather", () => {
    const cool = generateOutfits({ ...base, weather: "cool" });
    expect(cool.outfits.every(outfit => outfit.items.some(item => item.slot === "outer"))).toBe(true);
    expect(generateOutfits({ ...base, weather: "cool", items: owned.filter(item => item.slot !== "outer") }).error).toMatch(/outer/);
    expect(generateOutfits({ ...base, locked: { outer: "jacket-navy" } }).error).toMatch(/terkunci/);
  });
  it("calculates additional purchases only and applies the exact budget boundary", () => {
    const items: Item[] = [
      { ...owned[0], price: 800_000 },
      { ...owned.find(item => item.id === "jeans-indigo")!, source: "catalog", price: 150_000 },
      owned.find(item => item.id === "sneakers-white")!,
    ];
    expect(generateOutfits({ ...base, items, budget: 149_999 }).outfits).toEqual([]);
    const result = generateOutfits({ ...base, items, budget: 150_000 });
    expect(result.outfits[0].knownAdditionalCost).toBe(150_000);
    expect(result.outfits[0].budgetStatus).toBe("within");
  });
  it("keeps unknown required purchase prices unknown rather than claiming budget compliance", () => {
    const items = [owned[0], { ...owned.find(item => item.id === "jeans-indigo")!, source: "catalog" as const, price: null }, owned.find(item => item.id === "sneakers-white")!];
    const result = generateOutfits({ ...base, items });
    expect(result.outfits[0].budgetStatus).toBe("unknown");
    expect(result.outfits[0].unknownPrices).toEqual(["jeans-indigo"]);
    expect(result.outfits[0].reasons.join(" ")).toMatch(/belum dapat dinyatakan memenuhi bujet/);
  });
  it("prioritizes owned items over catalog alternatives", () => {
    const items = [...owned, { ...owned[0], id: "free-catalog-tee", source: "catalog" as const, price: 0 }];
    expect(generateOutfits({ ...base, items }).outfits.every(outfit => outfit.items.every(item => item.source === "wardrobe"))).toBe(true);
  });
  it("uses corrections instead of old style attributes", () => {
    const items = owned.map(item => item.id === "tee-blue" ? { ...item, styles: ["smart-casual" as const] } : item);
    expect(generateOutfits({ ...base, items, locked: { top: "tee-blue" } }).error).toMatch(/terkunci/);
    expect(generateOutfits({ ...base, style: "smart-casual", items, locked: { top: "tee-blue" } }).outfits.length).toBeGreaterThan(0);
  });
  it("rejects malformed budgets, prices, duplicate identities, and oversized collections", () => {
    for (const budget of [-1, 1.5, NaN, Infinity, 1_000_000_001]) expect(generateOutfits({ ...base, budget }).error).toBeTruthy();
    for (const price of [-1, 0.1, NaN, Infinity]) expect(generateOutfits({ ...base, items: [{ ...owned[0], price }] }).error).toBeTruthy();
    expect(generateOutfits({ ...base, items: [owned[0], owned[0]] }).error).toMatch(/unik/);
    expect(generateOutfits({ ...base, items: Array.from({ length: 41 }, (_, i) => ({ ...owned[0], id: String(i) })) }).error).toMatch(/40/);
  });
  it("leaves input objects unchanged", () => {
    const before = JSON.stringify(base);
    generateOutfits(base);
    expect(JSON.stringify(base)).toBe(before);
  });
});

describe("demo choices", () => {
  it("carries only valid demo identifiers and locks through the CTA", () => {
    const state = { style: "casual" as const, weather: "tropical" as const, selected: { ...preset("casual", "tropical"), top: "tee-blue" }, locked: ["top" as const] };
    expect(parseDemoQuery(new URL(demoHref(state), "http://localhost").searchParams)).toEqual(state);
  });
  it("recovers unknown identifiers and wrong-slot values without echoing raw input", () => {
    const state = parseDemoQuery(new URLSearchParams("style=unknown&weather=arctic&top=<script>&bottom=tee-white&locked=top,role,top"));
    expect(state).toEqual({ style: "casual", weather: "tropical", selected: preset("casual", "tropical"), locked: ["top"] });
    expect(JSON.stringify(state)).not.toContain("script");
  });
  it("preserves all locks when a changed context is impossible", () => {
    const state = { style: "casual" as const, weather: "tropical" as const, selected: preset("casual", "tropical"), locked: ["top", "bottom", "shoes"] as const };
    const result = changeDemoContext({ ...state, locked: [...state.locked] }, "smart-casual", "tropical");
    expect(result.error).toMatch(/terkunci/);
    expect(result.state).toEqual(state);
  });
  it("changes compatible presets while preserving locked identity", () => {
    const state = { style: "casual" as const, weather: "tropical" as const, selected: preset("casual", "tropical"), locked: ["shoes" as const] };
    const result = changeDemoContext(state, "smart-casual", "cool");
    expect(result.error).toBeNull();
    expect(result.state.selected.shoes).toBe("sneakers-white");
    expect(result.state.selected.outer).toBe("cardigan-grey");
  });
});
