import { slotNames, slots, type Item } from "@/features/styling/engine";

// Original vector garment illustrations; these are not scans, 3D models, or fit predictions.
function GarmentArt({ item }: { item: Item }) {
  const stroke = "#344451";
  return <svg viewBox="0 0 200 200" role="img" aria-label={`Ilustrasi ${item.name}`}>
    <g fill={item.color} stroke={stroke} strokeWidth="1.8" strokeLinejoin="round">
      {item.slot === "top" && <>
        <path d="M66 26 36 38 12 78 44 94 59 72 56 170 144 170 141 72 156 94 188 78 164 38 134 26C125 46 75 46 66 26Z" />
        <path d="M66 26C78 55 122 55 134 26M61 154H139M17 70 46 84M154 84 183 70" fill="none" opacity=".45" />
        {item.name.toLowerCase().includes("kemeja") && <>
          <path d="m68 26 20 34 12-16 12 16 20-34M100 45V169M115 76h17v23h-17z" fill="none" />
          {[70, 91, 112, 133, 153].map(y => <circle key={y} cx="104" cy={y} r="1.3" fill={stroke} />)}
        </>}
      </>}
      {item.slot === "bottom" && <>
        <path d="M57 17H143L157 177H109L100 77 91 177H43Z" />
        <path d="M57 31h86M100 31v46M66 35c0 17-5 24-13 26M134 35c0 17 5 24 13 26M46 166h45M109 166h45M83 18v12M117 18v12" fill="none" opacity=".55" />
        <circle cx="105" cy="24" r="2" fill={stroke} />
      </>}
      {item.slot === "shoes" && <>
        <path d="M38 61 76 58 92 113 146 127Q166 133 165 153H28Q20 142 27 126L32 94Z" />
        <path d="M34 90 72 89 87 120 113 131M27 142H163M68 98l19-5M72 109l19-5M79 120l19-5" fill="none" />
        <path d="m95 49 32-8 17 40 30 16q14 9 10 23l-20 5-20-10-25-26Z" />
        <path d="m146 107 35 6M125 66l13-4M129 76l13-4" fill="none" opacity=".65" />
      </>}
      {item.slot === "outer" && <>
        <path d="m66 24-32 19-18 95 28 8 18-67-7 97h90l-7-97 18 67 28-8-18-95-32-19-34 22Z" />
        <path d="m66 24 34 67 34-67M100 91v85M66 127h20v25H65ZM114 127h20l1 25h-21Z" fill="none" />
        {[102, 122, 142, 161].map(y => <circle key={y} cx="104" cy={y} r="1.6" fill={stroke} />)}
      </>}
    </g>
  </svg>;
}

export function OutfitArt({ items }: { items: Item[] }) {
  return <figure className="outfit-art">
    <ul className="art-layout">
      {slots.map(slot => {
        const item = items.find(candidate => candidate.slot === slot);
        if (!item) return null;
        return <li className={`garment garment-${slot}`} key={slot}>
          <div className="garment-image" key={item.id}><GarmentArt item={item} /></div>
          <span className="garment-label">{slotNames[slot]}</span>
        </li>;
      })}
    </ul>
    <figcaption>Ilustrasi 2D kategori dan warna pakaian</figcaption>
  </figure>;
}
