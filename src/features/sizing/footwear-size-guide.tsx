"use client";

import { useState } from "react";
import { footwearReferences, lookupFootwearSize, type SizeLookup } from "./footwear-size";

const decimal = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });

export function FootwearSizeGuide() {
  const [sku, setSku] = useState(footwearReferences[0].sku);
  const [length, setLength] = useState("");
  const [result, setResult] = useState<SizeLookup | null>(null);
  const product = footwearReferences.find(reference => reference.sku === sku) ?? footwearReferences[0];
  const error = result?.kind === "invalid" || result?.kind === "outside";

  return <details className="studio-picker size-guide" id="panduan-ukuran">
    <summary>Panduan ukuran sepatu</summary>
    <label>Produk
      <select value={sku} onChange={event => { setSku(event.target.value); setResult(null); }}>
        {footwearReferences.map(({ sku, name }) => <option key={sku} value={sku}>{name} · {sku}</option>)}
      </select>
    </label>
    {product.chart ? <form noValidate onSubmit={event => {
      event.preventDefault();
      setResult(lookupFootwearSize(sku, length));
    }}>
      <p id="foot-length-help" className="fine-print">Ukur kedua kaki dari tumit hingga ujung jari terpanjang saat berdiri. Masukkan panjang kaki yang lebih panjang.</p>
      <div className="size-fields">
        <label>Panjang kaki (cm)
          <input type="text" inputMode="decimal" placeholder="25,9" value={length} required
            onChange={event => { setLength(event.target.value); setResult(null); }}
            aria-invalid={error} aria-describedby={error ? "foot-length-help size-result" : "foot-length-help"} />
        </label>
        <button className="button secondary" type="submit">Cek ukuran</button>
      </div>
      <div id="size-result" role="status">
        {result?.kind === "invalid" && <p className="error-message">Masukkan panjang kaki dalam cm, misalnya 25,9.</p>}
        {result?.kind === "outside" && <p className="error-message">
          Panjang kaki di luar rentang tabel ({decimal.format(result.minMm / 10)}–{decimal.format(result.maxMm / 10)} cm). Periksa pengukuranmu.
        </p>}
        {result?.kind === "match" && <div className="size-match">
          <p className="fine-print">{result.sizes.length > 1 ? "Di antara dua ukuran" : "Ukuran menurut tabel"} · {decimal.format(result.lengthMm / 10)} cm</p>
          <ul>{result.sizes.map(([, eu, uk]) => <li key={eu}><strong>EU {eu}</strong> <span>UK {decimal.format(uk)}</span></li>)}</ul>
          <p className="fine-print">{result.sizes.length > 1 ? "Pertimbangkan ukuran yang lebih besar jika kamu suka ruang ekstra. " : ""}Lebar kaki dan kenyamanan perlu diperiksa saat mencoba sepatu.</p>
        </div>}
      </div>
      <p className="fine-print">Perhitungan memakai tabel panjang kaki Adidas. Ukuran yang ditampilkan adalah acuan untuk dicoba.</p>
      <p className="size-sources fine-print"><a href={product.chart.source}>Tabel ukuran Adidas</a> · <a href={product.source}>Halaman produk</a></p>
    </form> : <div role="status">
      <p className="privacy-note">Panduan ukuran belum tersedia untuk {product.name}. Data yang tersedia adalah dimensi luar sampel hasil scan.</p>
      <p className="size-sources fine-print"><a href={product.source}>Sumber scan produk</a></p>
    </div>}
  </details>;
}
