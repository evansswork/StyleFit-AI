"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createAuthClient } from "better-auth/react";
import { useRef, useState, type FormEvent } from "react";
import { OutfitPreview } from "../avatar/outfit-preview";
import { FootwearSizeGuide } from "../sizing/footwear-size-guide";
import { changeDemoContext, demoItems, preset, type DemoState } from "../demo/data";
import { useGuestWardrobe } from "../wardrobe/guest-wardrobe";
import { changeAccountWardrobe } from "@/server/wardrobe-actions";
import { saveOutfit } from "@/server/lookbook-actions";
import { ShoppingLinks } from "./shopping-links";
import type { Inspiration } from "../inspiration/catalog";
import { garmentColors as colors, fitsContext, generateOutfits, requiredSlots, rupiah, slotNames, slots, type Item, type Outfit, type Selection, type Slot, type Style, type Weather } from "./engine";

type Draft = { name: string; slot: Slot | null; color: string; style: "both" | Style; weather: "both" | Weather };
const emptyDraft: Draft = { name: "", slot: null, color: colors.putih, style: "both", weather: "both" };
const auth = createAuthClient();
type SavedWardrobe = { id: string; name: string; items: Item[] };

export function Stylist({ initialDemo, startWithDemo, openStudio, accountsEnabled, account, accountUnavailable, inspiration }: {
  initialDemo: DemoState;
  startWithDemo: boolean;
  openStudio: boolean;
  accountsEnabled: boolean;
  account: SavedWardrobe | null;
  accountUnavailable: boolean;
  inspiration?: Inspiration;
}) {
  const [isDemo, setIsDemo] = useState(startWithDemo);
  const { items: guestItems, setItems: setGuestItems } = useGuestWardrobe();
  const [savedItems, setSavedItems] = useState(account?.items ?? []);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const wardrobe = account ? savedItems : guestItems;
  const [selected, setSelected] = useState(initialDemo.selected);
  const [locked, setLocked] = useState<Selection>(startWithDemo
    ? Object.fromEntries(initialDemo.locked.map(slot => [slot, initialDemo.selected[slot]])) : {});
  const [style, setStyle] = useState<Style>(initialDemo.style);
  const [weather, setWeather] = useState<Weather>(initialDemo.weather);
  const [budget, setBudget] = useState("0");
  const [referenceTopColor, setReferenceTopColor] = useState(inspiration?.topColor ?? "");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const itemName = useRef<HTMLInputElement>(null);
  const itemDetails = useRef<HTMLDetailsElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [savedSelection, setSavedSelection] = useState<string | null>(null);
  const [message, setMessage] = useState(startWithDemo ? "Pilihan demo dibawa dari landing. Kamu bisa mengeditnya di sini." : "");
  const [error, setError] = useState("");
  const [missing, setMissing] = useState<Slot[]>([]);
  const items = isDemo ? demoItems : wardrobe;
  const visibleItems = isDemo ? demoItems.filter(item => Object.values(selected).includes(item.id)) : wardrobe;
  const preview = outfits[previewIndex]?.items ?? (isDemo ? visibleItems : []);
  const required = requiredSlots(weather);
  const readySlots = new Set(wardrobe.filter(item => fitsContext(item, style, weather)).map(item => item.slot));
  const missingSlot = required.find(slot => !readySlots.has(slot));
  const draftSlot = draft.slot ?? missingSlot ?? "top";

  async function persist(change: Parameters<typeof changeAccountWardrobe>[1]) {
    if (!account || pending) return false;
    setPending(true);
    try {
      const result = await changeAccountWardrobe(account.id, change);
      if ("error" in result) {
        setError(result.error);
        return false;
      }
      setSavedItems(result.items);
      return true;
    } catch {
      setError("Perubahan belum disimpan. Coba lagi tanpa menutup tab.");
      return false;
    } finally {
      setPending(false);
    }
  }

  async function importDraft() {
    if (await persist({ kind: "import", items: guestItems })) {
      setGuestItems([]);
      invalidate();
      setMessage("Draft guest sudah disimpan ke lemarimu.");
    }
  }

  async function signOut() {
    if (pending) return;
    setPending(true);
    try {
      const result = await auth.signOut();
      if (result.error) throw new Error("sign-out failed");
      setSavedItems([]);
      invalidate();
      router.refresh();
    } catch {
      setError("Belum bisa keluar. Coba lagi.");
      setPending(false);
    }
  }

  function invalidate() {
    setOutfits([]);
    setMissing([]);
    setMessage("");
    setPreviewIndex(0);
    setSavedSelection(null);
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
  function tryDemoItem(item: Item, base: Item[]) {
    if (locked[item.slot] || !fitsContext(item, style, weather)) return;
    const next: Selection = Object.fromEntries(base.map(current => [current.slot, current.id]));
    setSelected({ ...next, [item.slot]: item.id });
    invalidate();
    setMessage(`${item.name} dipakai pada preview.`);
  }
  function switchCollection() {
    if (!isDemo) setSelected(preset(style, weather));
    setIsDemo(!isDemo); setLocked({}); invalidate(); resetDraft();
    setMessage("Koleksi berganti dan kunci item dilepas.");
  }
  function toggleLock(item: Item) {
    if (locked[item.slot] && locked[item.slot] !== item.id) {
      setError(`Lepaskan kunci ${slotNames[item.slot].toLowerCase()} sebelumnya dahulu.`); return;
    }
    const next = { ...locked };
    if (next[item.slot]) delete next[item.slot]; else next[item.slot] = item.id;
    setLocked(next); invalidate(); setMessage(next[item.slot] ? `${item.name} dipertahankan.` : `Kunci ${item.name} dilepas.`);
  }
  async function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const name = draft.name.trim();
    if (!name || name.length > 60) { setError("Nama pakaian harus berisi 1–60 karakter."); return; }
    if (!editingId && wardrobe.length >= 40) { setError("Versi awal mendukung maksimal 40 item."); return; }
    const existing = wardrobe.find(item => item.id === editingId);
    if (existing && locked[existing.slot] === editingId && draftSlot !== existing.slot) {
      setError("Lepaskan kunci item sebelum mengubah kategorinya."); return;
    }
    const item: Item = {
      id: editingId || crypto.randomUUID(), name, slot: draftSlot, color: draft.color,
      styles: draft.style === "both" ? ["casual", "smart-casual"] : [draft.style],
      weather: draft.weather === "both" ? ["tropical", "cool"] : [draft.weather],
      source: "wardrobe", price: null, available: true,
    };
    if (account) {
      if (!await persist({ kind: editingId ? "edit" : "add", item })) return;
    } else {
      setGuestItems(old => editingId ? old.map(existing => existing.id === editingId ? item : existing) : [...old, item]);
    }
    resetDraft();
    invalidate();
    setMessage(`${item.name} ${editingId ? "diperbarui" : "ditambahkan"}.`);
  }
  function resetDraft() {
    setDraft(emptyDraft);
    setEditingId(null);
    if (itemDetails.current) itemDetails.current.open = false;
  }

  function editItem(item: Item) {
    setDraft({
      name: item.name, slot: item.slot, color: item.color,
      style: item.styles.length === 2 ? "both" : item.styles[0],
      weather: item.weather.length === 2 ? "both" : item.weather[0],
    });
    setEditingId(item.id);
    if (itemDetails.current) itemDetails.current.open = item.styles.length !== 2 || item.weather.length !== 2;
    setError("");
    itemName.current?.focus();
  }

  async function removeItem(item: Item) {
    if (pending) return;
    if (locked[item.slot] === item.id) {
      setError("Lepaskan kunci item sebelum menghapusnya.");
      return;
    }
    if (account) {
      if (!await persist({ kind: "remove", id: item.id })) return;
    } else {
      setGuestItems(old => old.filter(existing => existing.id !== item.id));
    }
    invalidate();
    setMessage(`${item.name} dihapus.`);
    if (editingId === item.id) resetDraft();
  }
  function recommend() {
    invalidate();
    if (!/^\d+$/.test(budget)) { setError("Isi bujet dengan rupiah utuh, minimal 0."); return; }
    const result = generateOutfits({ items, style, weather, budget: Number(budget), locked,
      referenceTopColor: isDemo ? undefined : referenceTopColor });
    setOutfits(result.outfits); setError(result.error || "");
    setMissing(result.missing);
    if (result.outfits.length) setMessage(`${result.outfits.length} kombinasi tersedia dari ${isDemo ? "koleksi contoh" : "lemarimu"}.`);
  }

  async function saveLook(outfit: Outfit) {
    if (!account || isDemo || pending) return;
    const ids = outfit.items.map(item => item.id);
    setPending(true);
    setError("");
    try {
      const result = await saveOutfit(account.id, ids, style, weather);
      if ("error" in result) setError(result.error);
      else {
        setSavedSelection(ids.join("|"));
        setMessage("Kombinasi disimpan ke lookbook.");
      }
    } catch {
      setError("Kombinasi belum tersimpan. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  const actions = <>
    <div className="stylist-actions">
      <button type="button" className="button primary" onClick={recommend}>Buat kombinasi</button>
      {outfits.length > 0 && <a className="text-button account-back" href="#result-title">Lihat hasil outfit</a>}
    </div>
    {error && <p className="error-message" role="alert">{error}</p>}
    {!isDemo && missing.length > 0 && <ShoppingLinks missing={missing} style={style} topColor={referenceTopColor} />}
    <p className="feedback" role="status">{message}</p>
  </>;

  return <>
    <div className="stylist-intro stylist-heading">
      <h1>Hari ini, <em>pakai apa?</em></h1>
      <p>Pilih gaya dan cuaca, lalu susun outfit dari isi lemarimu.</p>
      {inspiration && <p><strong>Ide awal · {inspiration.title}.</strong> {inspiration.stylingNote}</p>}
    </div>
    <div className="stylist-grid">
      <div className="stylist-input">
        <section className="panel" aria-labelledby="context-title"><h2 id="context-title">Gaya dan cuaca</h2>
          <div className="form-grid"><label>Gaya<select value={style} onChange={event => updateContext(event.target.value as Style, weather)}><option value="casual">Casual</option><option value="smart-casual">Smart casual</option></select></label>
            <label>Konteks cuaca<select value={weather} onChange={event => updateContext(style, event.target.value as Weather)}><option value="tropical">Tropis</option><option value="cool">Sejuk</option></select></label></div>
          {!isDemo && inspiration && <label>Warna atasan dari inspirasi
            <select value={referenceTopColor} onChange={event => { setReferenceTopColor(event.target.value); invalidate(); }}>
              <option value="">Bebas</option>
              {Object.entries(colors).map(([name, color]) => <option value={color} key={color}>{name}</option>)}
            </select>
          </label>}
          <details className="budget-details">
            <summary>Bujet tambahan</summary>
            <label>Bujet tambahan (Rp)<input inputMode="numeric" value={budget} maxLength={10} onChange={event => { setBudget(event.target.value); invalidate(); }} aria-describedby="budget-help" /></label>
            <p id="budget-help" className="fine-print">Kombinasi dari isi lemarimu memiliki tambahan belanja Rp0. Katalog belanja belum tersedia.</p>
          </details>
        </section>
        <section className="panel" aria-labelledby="wardrobe-title">
          <div className="panel-title"><h2 id="wardrobe-title" tabIndex={-1}>{isDemo ? "Pilihan demo" : account ? "Lemariku" : "Lemari di tab ini"}</h2><span className="pill">{isDemo ? "Demo contoh" : `${wardrobe.length}/40 item`}</span></div>
          <button type="button" className="text-button collection-toggle" onClick={switchCollection}>{isDemo ? "Gunakan lemari sendiri" : "Coba koleksi contoh"}</button>
          {accountUnavailable && <p className="error-message">Akun sementara tidak bisa diakses. Isian baru tetap menjadi draft guest.</p>}
          {!isDemo && (account
            ? <div className="account-bar">
                <p><strong>{account.name}</strong><br />Perubahan lemari disimpan ke akun.</p>
                <div className="form-actions">
                  <Link href="/akun" className="text-button account-back">Profil</Link>
                  <Link href="/lookbook" className="text-button account-back">Lookbook</Link>
                  <button type="button" className="text-button" onClick={signOut} disabled={pending}>Keluar</button>
                </div>
                {guestItems.length > 0 && <button type="button" className="button secondary full" disabled={pending} onClick={importDraft}>Simpan {guestItems.length} item dari draft guest</button>}
              </div>
            : <>
                <p className="privacy-note"><strong>Draft sementara di tab ini.</strong> Lemari dan hasil hilang saat tab dimuat ulang atau ditutup.</p>
                {accountsEnabled && <Link href="/akun" className="text-button account-back">Masuk untuk menyimpan lemari</Link>}
              </>)}
          {!isDemo && <div className="wardrobe-readiness">
            {!wardrobe.length && <p>Lemari masih kosong.</p>}
            <ul aria-label="Kategori yang sesuai gaya dan cuaca">
              {required.map(slot => <li key={slot} data-ready={readySlots.has(slot)}>
                <strong>{slotNames[slot]}</strong>
                <span>{readySlots.has(slot) ? "Siap" : "Belum siap"}</span>
              </li>)}
            </ul>
          </div>}
          {(isDemo || !missingSlot) && actions}
          {!isDemo && <form className="item-form" onSubmit={saveItem} aria-label="Form pakaian">
            <h3>{editingId ? "Edit pakaian" : "Tambah pakaian"}</h3>
            <label>Nama pakaian<input ref={itemName} name="name" value={draft.name} maxLength={60} required placeholder="Misalnya, kemeja putih favorit" onChange={event => setDraft({ ...draft, name: event.target.value, slot: draftSlot })} /></label>
            <div className="form-grid">
              <label>Kategori<select value={draftSlot} onChange={event => setDraft({ ...draft, slot: event.target.value as Slot })}>{slots.map(slot => <option value={slot} key={slot}>{slotNames[slot]}</option>)}</select></label>
              <label>Warna<select value={draft.color} onChange={event => setDraft({ ...draft, color: event.target.value, slot: draftSlot })}>{Object.entries(colors).map(([name, color]) => <option value={color} key={color}>{name}</option>)}</select></label>
            </div>
            <details ref={itemDetails} className="item-details">
              <summary>Detail gaya dan cuaca</summary>
              <div className="form-grid">
                <label>Gaya yang cocok<select value={draft.style} onChange={event => setDraft({ ...draft, style: event.target.value as Draft["style"], slot: draftSlot })}><option value="both">Keduanya</option><option value="casual">Casual</option><option value="smart-casual">Smart casual</option></select></label>
                <label>Cuaca yang cocok<select value={draft.weather} onChange={event => setDraft({ ...draft, weather: event.target.value as Draft["weather"], slot: draftSlot })}><option value="both">Keduanya</option><option value="tropical">Tropis</option><option value="cool">Sejuk</option></select></label>
              </div>
            </details>
            <div className="form-actions"><button className="button secondary" type="submit" disabled={pending}>{pending ? "Menyimpan…" : editingId ? "Simpan perubahan" : "Tambahkan pakaian"}</button>{editingId && <button type="button" className="text-button" disabled={pending} onClick={resetDraft}>Batal edit</button>}</div>
          </form>}
          {!isDemo && missingSlot && actions}
          <ul className="wardrobe-list" aria-label={isDemo ? "Pakaian contoh" : "Pakaian di lemari"}>{visibleItems.map(item => <li key={item.id}>
            <div className="item-description"><span className="color-swatch" style={{ backgroundColor: item.color }} /><span><strong>{item.name}</strong><small>{slotNames[item.slot]} · {isDemo ? "Contoh" : "Milikmu"}</small></span></div>
            <div className="item-actions">
              {isDemo ? <label className="sr-only-label">Ganti {slotNames[item.slot].toLowerCase()}<select disabled={Boolean(locked[item.slot])} value={selected[item.slot]} onChange={event => { const choice = demoItems.find(option => option.id === event.target.value); if (choice) tryDemoItem(choice, visibleItems); }}>{demoItems.filter(option => option.slot === item.slot && option.styles.includes(style) && option.weather.includes(weather)).map(option => <option value={option.id} key={option.id}>{option.name}</option>)}</select></label> : <button type="button" className="text-button" disabled={pending} aria-label={`Edit ${item.name}`} onClick={() => editItem(item)}>Edit</button>}
              <button type="button" className="lock-button" aria-label={`Pertahankan ${item.name}`} aria-pressed={locked[item.slot] === item.id} onClick={() => toggleLock(item)}>{locked[item.slot] === item.id ? "Terkunci" : "Kunci"}</button>
              {!isDemo && <button type="button" className="text-button" disabled={pending} aria-label={`Hapus ${item.name}`} onClick={() => removeItem(item)}>Hapus</button>}
            </div>
          </li>)}</ul>
        </section>
      </div>
      <section className="stylist-output" aria-labelledby="result-title">
        <div className="stylist-stage">
          <div className="panel-title">
            <h2 id="result-title" tabIndex={-1}>{outfits.length ? "Kombinasi untukmu" : "Ruang padu padan"}</h2>
            {outfits.length > 0 && <a href="#wardrobe-title" className="text-button account-back">Ubah pilihan</a>}
          </div>
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
            {preview.length ? <OutfitPreview items={preview} startIn3D={openStudio && isDemo} demo={isDemo} shoesLocked={Boolean(locked.shoes)}>
              {isDemo && <details className="studio-picker"><summary>Coba pakaian contoh</summary>
                {required.map(slot => <fieldset key={slot} disabled={Boolean(locked[slot])}>
                  <legend>{slotNames[slot]}{locked[slot] ? " · Terkunci" : ""}</legend>
                  {demoItems.filter(item => item.slot === slot && fitsContext(item, style, weather)).map(item =>
                    <button key={item.id} type="button" className="lock-button"
                      aria-pressed={preview.some(current => current.id === item.id)} onClick={() => tryDemoItem(item, preview)}>
                      {item.name}
                    </button>)}
                </fieldset>)}
              </details>}
            </OutfitPreview> : <figure className="empty-preview photo-entrance">
              <Image src="/demo/sunrise-through-the-rain.png" alt="Dua orang berkemeja putih berbagi earphone" width={640} height={360} unoptimized />
              <figcaption>Sunrise Through the Rain Concept Idea</figcaption>
            </figure>}
          </div>
          {isDemo && <FootwearSizeGuide />}
          {!preview.length && <p className="stage-hint">Tambahkan pakaian, lalu buat kombinasi untuk melihat preview di sini.</p>}
          {isDemo && !outfits.length && <p className="stage-hint">Buat kombinasi untuk melihat alternatif dengan item terkunci.</p>}
        </div>
        <div className="outfit-results">{outfits.map((outfit, index) => <article className="result-card" data-preview={previewIndex === index} key={outfit.items.map(item => item.id).join("|")} aria-label={`Kombinasi ${index + 1}`}>
          <div className="panel-title"><h3>Kombinasi {index + 1}</h3><span className="pill">{isDemo ? "Contoh" : "Dari lemariku"}</span></div>
          <ul>{outfit.items.map(item => <li key={item.id}><span className="color-swatch" style={{ backgroundColor: item.color }} />{item.name}{locked[item.slot] === item.id && <small> · dipertahankan</small>}</li>)}</ul>
          {outfit.reasons.map(reason => <p key={reason}>{reason}</p>)}
          <p className="result-cost">{isDemo ? "Harga contoh tidak dinilai; belum ada produk belanja." : `Tambahan belanja: ${rupiah(outfit.knownAdditionalCost)}`}</p>
          {account && !isDemo && <div className="form-actions">
            <button className="button secondary" type="button" disabled={pending || savedSelection === outfit.items.map(item => item.id).join("|")} onClick={() => saveLook(outfit)}>
              {savedSelection === outfit.items.map(item => item.id).join("|") ? "Tersimpan" : "Simpan ke lookbook"}
            </button>
            {savedSelection === outfit.items.map(item => item.id).join("|") && <Link href="/lookbook" className="text-button account-back">Buka lookbook</Link>}
          </div>}
        </article>)}</div>
      </section>
    </div>
  </>;
}
