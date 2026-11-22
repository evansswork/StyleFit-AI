import { scannedShoe } from "../avatar/scanned-shoe";

type SizeRow = readonly [lengthMm: number, eu: string, uk: number];
type SizeChart = { source: string; rows: readonly SizeRow[] };

// Use the heel-to-toe row, not the JP size row or the exterior length of the scan.
const adidasFootwear = {
  source: "https://support.dtb.adidas.com/static-content/size-charts/en_GB/footwear/size-shoes.html",
  rows: [
    [221, "36", 3.5], [225, "36 2/3", 4], [229, "37 1/3", 4.5], [233, "38", 5],
    [238, "38 2/3", 5.5], [242, "39 1/3", 6], [246, "40", 6.5], [250, "40 2/3", 7],
    [255, "41 1/3", 7.5], [259, "42", 8], [263, "42 2/3", 8.5], [267, "43 1/3", 9],
    [271, "44", 9.5], [276, "44 2/3", 10], [280, "45 1/3", 10.5], [284, "46", 11],
    [288, "46 2/3", 11.5], [293, "47 1/3", 12], [297, "48", 12.5], [301, "48 2/3", 13],
    [305, "49 1/3", 13.5], [310, "50", 14], [314, "50 2/3", 14.5], [318, "51 1/3", 15],
    [326, "52 2/3", 16], [335, "53 1/3", 17], [343, "54 2/3", 18], [352, "55 2/3", 19],
  ],
} as const satisfies SizeChart;

export const footwearReferences: readonly { sku: string; name: string; source: string; chart: SizeChart | null }[] = [
  {
    sku: "ID8812",
    name: "Adidas Ultraboost 5",
    source: "https://www.adidas.co.id/id/sepatu-ultraboost-5/ID8812.html",
    chart: adidasFootwear,
  },
  { sku: scannedShoe.sku, name: scannedShoe.name, source: scannedShoe.source, chart: null },
];

export type SizeLookup =
  | { kind: "unavailable" }
  | { kind: "invalid" }
  | { kind: "outside"; minMm: number; maxMm: number }
  | { kind: "match"; lengthMm: number; sizes: readonly SizeRow[] };

export function lookupFootwearSize(sku: string, inputCm: string): SizeLookup {
  const chart = footwearReferences.find(product => product.sku === sku)?.chart;
  if (!chart) return { kind: "unavailable" };

  const length = inputCm.trim();
  if (!/^\d{1,2}(?:[.,]\d)?$/.test(length)) return { kind: "invalid" };
  const lengthMm = Math.round(Number(length.replace(",", ".")) * 10);
  if (lengthMm <= 0) return { kind: "invalid" };

  const minMm = chart.rows[0][0];
  const maxMm = chart.rows[chart.rows.length - 1][0];
  if (lengthMm < minMm || lengthMm > maxMm) return { kind: "outside", minMm, maxMm };

  const upperIndex = chart.rows.findIndex(([thresholdMm]) => thresholdMm >= lengthMm);
  const upper = chart.rows[upperIndex];
  const sizes = upper[0] === lengthMm ? [upper] : [chart.rows[upperIndex - 1], upper];
  return { kind: "match", lengthMm, sizes };
}
