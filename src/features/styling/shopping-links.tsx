import { garmentColors, type Slot, type Style } from "./engine";

const searchTerms: Record<Style, Record<Slot, string>> = {
  casual: { top: "kaus polos", bottom: "celana jeans lurus", shoes: "sneakers polos", outer: "jaket ringan" },
  "smart-casual": { top: "kemeja polos", bottom: "celana bahan lurus", shoes: "sneakers minimalis", outer: "cardigan ringan" },
};

export function ShoppingLinks({ missing, style, topColor }: { missing: Slot[]; style: Style; topColor?: string }) {
  const color = Object.entries(garmentColors).find(([, code]) => code === topColor)?.[0];
  return (
    <details className="panel shopping-options">
      <summary>Cari pelengkap di marketplace</summary>
      <p>Ini tautan pencarian. Harga, ongkir, dan stok perlu dicek sebelum menentukan bujet.</p>
      <ul>
        {missing.map(slot => {
          const term = searchTerms[style][slot] + (slot === "top" && color ? ` ${color}` : "");
          const keyword = encodeURIComponent(term);
          return <li key={slot}>
            <strong>{term}</strong>
            <div className="form-actions">
              <a className="text-button" href={`https://shopee.co.id/search?keyword=${keyword}`}
                aria-label={`Cari ${term} di Shopee`} target="_blank" rel="noreferrer">Shopee</a>
              <a className="text-button" href={`https://www.tokopedia.com/search?st=product&q=${keyword}`}
                aria-label={`Cari ${term} di Tokopedia`} target="_blank" rel="noreferrer">Tokopedia</a>
            </div>
          </li>;
        })}
      </ul>
    </details>
  );
}
