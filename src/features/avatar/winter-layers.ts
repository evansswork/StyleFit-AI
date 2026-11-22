export const winterLayers = [
  { id: "base", label: "Dasar", garment: "Kemeja lengan panjang", color: "#ced5dd" },
  { id: "mid", label: "Tengah", garment: "Rompi rajut", color: "#a58655" },
  { id: "outer", label: "Luar", garment: "Jaket", color: "#304655" },
] as const;

export type WinterLayer = (typeof winterLayers)[number]["id"];
