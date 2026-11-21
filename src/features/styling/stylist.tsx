"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { OutfitArt } from "@/components/outfit-art";
import { changeDemoContext, demoItems, type DemoState } from "../demo/data";
import { useGuestWardrobe } from "../wardrobe/guest-wardrobe";
import { generateOutfits, rupiah, slotNames, slots, type Item, type Outfit, type Selection, type Slot, type Style, type Weather } from "./engine";

const colors = { putih: "#f3f4f0", hitam: "#303941", biru: "#8cacc9", abu: "#899399", hijau: "#71877a", merah: "#b56d75" };
type Draft = { name: string; slot: Slot; color: string; style: "both" | Style; weather: "both" | Weather };
const emptyDraft: Draft = { name: "", slot: "top", color: colors.putih, style: "both", weather: "both" };

export function Stylist({ initialDemo, startWithDemo }: { initialDemo: DemoState; startWithDemo: boolean }) {
  const [isDemo, setIsDemo] = useState(startWithDemo);
  const { items: wardrobe, setItems: setWardrobe } = useGuestWardrobe();
  const [selected, setSelected] = useState(initialDemo.selected);
  const [locked, setLocked] = useState<Selection>(startWithDemo
    ? Object.fromEntries(initialDemo.locked.map(slot => [slot, initialDemo.selected[slot]])) : {});
  const [style, setStyle] = useState<Style>(initialDemo.style);
  const [weather, setWeather] = useState<Weather>(initialDemo.weather);
  const [budget, setBudget] = useState("0");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [message, setMessage] = useState(startWithDemo ? "Pilihan demo dibawa dari landing. Kamu bisa mengeditnya di sini." : "Mulai dengan atasan, bawahan, dan sepatu yang kamu punya.");
  const [error, setError] = useState("");
  const items = isDemo ? demoItems : wardrobe;
  const visibleItems = isDemo ? demoItems.filter(item => Object.values(selected).includes(item.id)) : wardrobe;
  const preview = outfits[previewIndex]?.items ?? (isDemo ? visibleItems : []);

  function invalidate() {
    setOutfits([]);
    setPreviewIndex(0);
    setError("");
  }
  function updateContext(nextStyle: Style, nextWeather: Weather) {
    if (isDemo) {
      const result = changeDemoContext({ style, weather, selected, locked: Object.keys(locked) as Slot[] }, nextStyle, nextWeather);
      if (result.error) { setError(result.error); return; }
      setSelected(result.state.selected);
    }
    setStyle(nextStyle); setWeather(nextWeather); invalidate();
  }
  function switchCollection() {
    setIsDemo(!isDemo); setLocked({}); invalidate(); setEditingId(null); setDraft(emptyDraft);
    setMessage("Koleksi berganti; kunci item dilepas. Isi lemari manualmu tetap ada selama halaman ini terbuka.");
  }
  function toggleLock(item: Item) {
    if (locked[item.slot] && locked[item.slot] !== item.id) {
      setError(`Lepaskan kunci ${slotNames[item.slot].toLowerCase()} sebelumnya dahulu.`); return;
    }
    const next = { ...locked };
    if (next[item.slot]) delete next[item.slot]; else next[item.slot] = item.id;
    setLocked(next); invalidate(); setMessage(next[item.slot] ? `${item.name} dipertahankan.` : `Kunci ${item.name} dilepas.`);
  }
  function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = draft.name.trim();
    if (!name || name.length > 60) { setError("Nama pakaian harus berisi 1–60 karakter."); return; }
    if (!editingId && wardrobe.length >= 40) { setError("Versi awal mendukung maksimal 40 item."); return; }
    const existing = wardrobe.find(item => item.id === editingId);
    if (existing && locked[existing.slot] === editingId && draft.slot !== existing.slot) {
      setError("Lepaskan kunci item sebelum mengubah kategorinya."); return;
    }
    const item: Item = {
      id: editingId || crypto.randomUUID(), name, slot: draft.slot, color: draft.color,
      styles: draft.style === "both" ? ["casual", "smart-casual"] : [draft.style],
      weather: draft.weather === "both" ? ["tropical", "cool"] : [draft.weather],
      source: "wardrobe", price: null, available: true,
    };
    setWardrobe(editingId ? wardrobe.map(old => old.id === editingId ? item : old) : [...wardrobe, item]);
    setDraft(emptyDraft); setEditingId(null); invalidate();
    setMessage(`${item.name} ${editingId ? "diperbarui" : "ditambahkan"}. Buat ulang kombinasi untuk memakai atribut terbaru.`);
  }
  function recommend() {
    setPreviewIndex(0);
    if (!/^\d+$/.test(budget)) { setError("Isi bujet dengan rupiah utuh, minimal 0."); setOutfits([]); return; }
    const result = generateOutfits({ items, style, weather, budget: Number(budget), locked });
    setOutfits(result.outfits); setError(result.error || "");
    if (result.outfits.length) setMessage(`${result.outfits.length} kombinasi tersedia dari ${isDemo ? "koleksi contoh" : "lemarimu"}.`);
  }

  return <>
    <div className="stylist-intro">
      <h1>Hari ini, <em>pakai apa?</em></h1>
      <p>Pilih gaya dan cuaca, lalu susun outfit dari isi lemarimu.</p>
    </div>
    <div className="stylist-grid">
      <div className="stylist-input">
        <section className="panel" aria-labelledby="context-title"><h2 id="context-title">Rencana harimu</h2>
          <div className="form-grid"><label>Gaya<select value={style} onChange={event => updateContext(event.target.value as Style, weather)}><option value="casual">Casual</option><option value="smart-casual">Smart casual</option></select></label>
            <label>Konteks cuaca<select value={weather} onChange={event => updateContext(style, event.target.value as Weather)}><option value="tropical">Tropis</option><option value="cool">Sejuk</option></select></label></div>
          <details className="budget-details">
            <summary>Bujet tambahan</summary>
            <label>Bujet tambahan (Rp)<input inputMode="numeric" value={budget} maxLength={10} onChange={event => { setBudget(event.target.value); invalidate(); }} aria-describedby="budget-help" /></label>
            <p id="budget-help" className="fine-print">Kombinasi dari isi lemarimu memiliki tambahan belanja Rp0. Katalog belanja belum tersedia.</p>
          </details>
        </section>
        <section className="panel" aria-labelledby="wardrobe-title">
          <div className="panel-title"><h2 id="wardrobe-title">{isDemo ? "Pilihan demo" : "Lemari di tab ini"}</h2><span className="pill">{isDemo ? "Demo contoh" : `${wardrobe.length}/40 item`}</span></div>
          <button type="button" className="text-button collection-toggle" onClick={switchCollection}>{isDemo ? "Gunakan lemari sendiri" : "Coba koleksi contoh"}</button>
          {!isDemo && <p className="privacy-note"><strong>Draft sementara di tab ini.</strong> Lemari dan hasil hilang saat tab dimuat ulang atau ditutup.</p>}
          {!visibleItems.length && <div className="empty-state"><strong>Lemari masih kosong.</strong><p>Tambahkan minimal satu atasan, bawahan, dan sepatu. Konteks sejuk juga memerlukan outer.</p></div>}
          <ul className="wardrobe-list">{visibleItems.map(item => <li key={item.id}>
            <div className="item-description"><span className="color-swatch" style={{ backgroundColor: item.color }} /><span><strong>{item.name}</strong><small>{slotNames[item.slot]} · {isDemo ? "Contoh" : "Milikmu"}</small></span></div>
            <div className="item-actions">
              {isDemo ? <label className="sr-only-label">Ganti {slotNames[item.slot].toLowerCase()}<select disabled={Boolean(locked[item.slot])} value={selected[item.slot]} onChange={event => { setSelected({ ...selected, [item.slot]: event.target.value }); invalidate(); setMessage(`${slotNames[item.slot]} diganti; bagian lain tetap.`); }}>{demoItems.filter(option => option.slot === item.slot && option.styles.includes(style) && option.weather.includes(weather)).map(option => <option value={option.id} key={option.id}>{option.name}</option>)}</select></label> : <button type="button" className="text-button" aria-label={`Edit ${item.name}`} onClick={() => {
                setDraft({ name: item.name, slot: item.slot, color: item.color, style: item.styles.length === 2 ? "both" : item.styles[0], weather: item.weather.length === 2 ? "both" : item.weather[0] }); setEditingId(item.id); setError("");
              }}>Edit</button>}
              <button type="button" className="lock-button" aria-label={`Pertahankan ${item.name}`} aria-pressed={locked[item.slot] === item.id} onClick={() => toggleLock(item)}>{locked[item.slot] === item.id ? "Terkunci" : "Kunci"}</button>
              {!isDemo && <button type="button" className="text-button" aria-label={`Hapus ${item.name}`} onClick={() => {
                if (locked[item.slot] === item.id) { setError("Lepaskan kunci item sebelum menghapusnya."); return; }
                setWardrobe(wardrobe.filter(old => old.id !== item.id)); invalidate(); setMessage(`${item.name} dihapus.`);
                if (editingId === item.id) { setEditingId(null); setDraft(emptyDraft); }
              }}>Hapus</button>}
            </div>
          </li>)}</ul>
          {!isDemo && <form className="item-form" onSubmit={saveItem} aria-label="Form pakaian">
            <h3>{editingId ? "Edit pakaian" : "Tambah pakaian"}</h3>
            <label>Nama pakaian<input name="name" value={draft.name} maxLength={60} required placeholder="Misalnya, kemeja putih favorit" onChange={event => setDraft({ ...draft, name: event.target.value })} /></label>
            <div className="form-grid"><label>Kategori<select value={draft.slot} onChange={event => setDraft({ ...draft, slot: event.target.value as Slot })}>{slots.map(slot => <option value={slot} key={slot}>{slotNames[slot]}</option>)}</select></label>
              <label>Warna<select value={draft.color} onChange={event => setDraft({ ...draft, color: event.target.value })}>{Object.entries(colors).map(([name, color]) => <option value={color} key={name}>{name}</option>)}</select></label>
              <label>Gaya yang cocok<select value={draft.style} onChange={event => setDraft({ ...draft, style: event.target.value as Draft["style"] })}><option value="both">Keduanya</option><option value="casual">Casual</option><option value="smart-casual">Smart casual</option></select></label>
              <label>Cuaca yang cocok<select value={draft.weather} onChange={event => setDraft({ ...draft, weather: event.target.value as Draft["weather"] })}><option value="both">Keduanya</option><option value="tropical">Tropis</option><option value="cool">Sejuk</option></select></label></div>
            <div className="form-actions"><button className="button secondary" type="submit">{editingId ? "Simpan perubahan" : "Tambahkan pakaian"}</button>{editingId && <button type="button" className="text-button" onClick={() => { setEditingId(null); setDraft(emptyDraft); }}>Batal edit</button>}</div>
          </form>}
        </section>
        <button type="button" className="button primary full" onClick={recommend}>Buat kombinasi</button>
        {error && <p className="error-message" role="alert">{error}</p>}
        <p className="feedback" role="status">{message}</p>
        {outfits.length > 0 && <a className="text-button jump-to-outfits" href="#result-title">Lihat hasil outfit</a>}
      </div>
      <section className="stylist-output" aria-labelledby="result-title">
        <div className="stylist-stage">
          <div className="panel-title"><h2 id="result-title" tabIndex={-1}>{outfits.length ? "Kombinasi untukmu" : "Ruang padu padan"}</h2></div>
          {outfits.length > 1 && <div className="preview-options" role="group" aria-label="Pilih kombinasi untuk preview">
            {outfits.map((outfit, index) => <button
              className="lock-button"
              key={outfit.items.map(item => item.id).join("|")}
              type="button"
              aria-pressed={previewIndex === index}
              aria-controls="outfit-preview"
              onClick={() => setPreviewIndex(index)}
            >Lihat kombinasi {index + 1}</button>)}
          </div>}
          <div id="outfit-preview" aria-live="polite">
            {preview.length ? <OutfitArt items={preview} /> : <figure className="empty-preview photo-entrance">
              <Image src="/demo/zheng-yu-chen-yanzhou.png" alt="Zheng Yu dan Chen Yanzhou mengenakan kemeja putih dan berbagi earphone" width={640} height={360} unoptimized />
              <figcaption>Inspirasi gaya</figcaption>
            </figure>}
          </div>
          {!preview.length && <p className="stage-hint">Tambahkan pakaian, lalu buat kombinasi untuk melihat preview di sini.</p>}
          {isDemo && !outfits.length && <p className="stage-hint">Buat kombinasi untuk melihat alternatif dengan item terkunci.</p>}
        </div>
        <div className="outfit-results">{outfits.map((outfit, index) => <article className="result-card" data-preview={previewIndex === index} key={outfit.items.map(item => item.id).join("|")} aria-label={`Kombinasi ${index + 1}`}>
          <div className="panel-title"><h3>Kombinasi {index + 1}</h3><span className="pill">{isDemo ? "Contoh" : "Dari lemariku"}</span></div>
          <ul>{outfit.items.map(item => <li key={item.id}><span className="color-swatch" style={{ backgroundColor: item.color }} />{item.name}{locked[item.slot] === item.id && <small> · dipertahankan</small>}</li>)}</ul>
          {outfit.reasons.map(reason => <p key={reason}>{reason}</p>)}
          <p className="result-cost">{isDemo ? "Harga contoh tidak dinilai; belum ada produk belanja." : `Tambahan belanja: ${rupiah(outfit.knownAdditionalCost)}`}</p>
        </article>)}</div>
      </section>
    </div>
  </>;
}
