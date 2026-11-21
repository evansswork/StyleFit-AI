import type { Item, Style, Weather, Slot, Selection } from "../styling/engine";

const bothStyles: Style[] = ["casual", "smart-casual"];
const bothWeather: Weather[] = ["tropical", "cool"];
export const demoItems: Item[] = [
  { id: "tee-white", name: "Kaus putih", slot: "top", color: "#f3f4f0", styles: ["casual"], weather: bothWeather, source: "demo", price: null, available: true },
  { id: "tee-blue", name: "Kaus biru", slot: "top", color: "#8cacc9", styles: ["casual"], weather: bothWeather, source: "demo", price: null, available: true },
  { id: "shirt-blue", name: "Kemeja biru", slot: "top", color: "#a9c4d8", styles: bothStyles, weather: bothWeather, source: "demo", price: null, available: true },
  { id: "shirt-white", name: "Kemeja putih", slot: "top", color: "#f6f6f0", styles: bothStyles, weather: bothWeather, source: "demo", price: null, available: true },
  { id: "jeans-indigo", name: "Jeans indigo", slot: "bottom", color: "#344b70", styles: ["casual"], weather: bothWeather, source: "demo", price: null, available: true },
  { id: "trousers-black", name: "Celana hitam", slot: "bottom", color: "#303941", styles: bothStyles, weather: bothWeather, source: "demo", price: null, available: true },
  { id: "trousers-sand", name: "Celana abu muda", slot: "bottom", color: "#b1b5b4", styles: bothStyles, weather: bothWeather, source: "demo", price: null, available: true },
  { id: "sneakers-white", name: "Sneakers putih", slot: "shoes", color: "#f2f3ee", styles: bothStyles, weather: bothWeather, source: "demo", price: null, available: true },
  { id: "loafers-black", name: "Loafers hitam", slot: "shoes", color: "#333c43", styles: bothStyles, weather: bothWeather, source: "demo", price: null, available: true },
  { id: "jacket-navy", name: "Jaket navy", slot: "outer", color: "#253c58", styles: ["casual"], weather: ["cool"], source: "demo", price: null, available: true },
  { id: "cardigan-grey", name: "Cardigan abu", slot: "outer", color: "#7c858b", styles: bothStyles, weather: ["cool"], source: "demo", price: null, available: true },
];

export type DemoState = { style: Style; weather: Weather; selected: Selection; locked: Slot[] };
export function preset(style: Style, weather: Weather): Selection {
  return {
    top: style === "casual" ? "tee-white" : "shirt-blue",
    bottom: style === "casual" ? "jeans-indigo" : "trousers-black",
    shoes: style === "casual" ? "sneakers-white" : "loafers-black",
    ...(weather === "cool" ? { outer: style === "casual" ? "jacket-navy" : "cardigan-grey" } : {}),
  };
}

export function parseDemoQuery(params: URLSearchParams): DemoState {
  const style: Style = params.get("style") === "smart-casual" ? "smart-casual" : "casual";
  const weather: Weather = params.get("weather") === "cool" ? "cool" : "tropical";
  const selected = preset(style, weather);
  for (const slot of Object.keys(selected) as Slot[]) {
    const item = demoItems.find(item => item.id === params.get(slot) && item.slot === slot
      && item.styles.includes(style) && item.weather.includes(weather));
    if (item) selected[slot] = item.id;
  }
  const locked = [...new Set((params.get("locked") || "").split(","))]
    .filter((slot): slot is Slot => Object.hasOwn(selected, slot));
  return { style, weather, selected, locked };
}

export function demoHref(state: DemoState): string {
  const params = new URLSearchParams({ demo: "1", style: state.style, weather: state.weather });
  for (const [slot, id] of Object.entries(state.selected)) if (id) params.set(slot, id);
  if (state.locked.length) params.set("locked", state.locked.join(","));
  return `/stylist?${params}`;
}

export function changeDemoContext(state: DemoState, style: Style, weather: Weather): { state: DemoState; error: string | null } {
  for (const slot of state.locked) {
    const item = demoItems.find(item => item.id === state.selected[slot]);
    if (!item || !item.styles.includes(style) || !item.weather.includes(weather) || (slot === "outer" && weather === "tropical")) {
      return { state, error: `${item?.name || "Item"} masih terkunci. Lepaskan kunci untuk mengganti konteks ini.` };
    }
  }
  const selected = preset(style, weather);
  for (const slot of state.locked) selected[slot] = state.selected[slot];
  return { state: { ...state, style, weather, selected }, error: null };
}
