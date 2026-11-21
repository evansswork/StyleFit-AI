"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Inspiration } from "@/features/inspiration/catalog";
import { garmentColors, type Style } from "@/features/styling/engine";
import { saveInspiration } from "@/server/inspiration-actions";

export function InspirationForm({ editor, entry }: { editor: string; entry?: Inspiration }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const value = (name: string) => String(values.get(name) ?? "");
    setPending(true);
    setError("");
    setNotice("");
    try {
      const result = await saveInspiration(editor, {
        slug: entry?.slug ?? value("slug").trim(),
        title: value("title"), drama: value("drama"), stylingNote: value("note"), sourceUrl: value("source"),
        style: value("style") as Style, active: value("active") === "on", topColor: value("topColor") || null,
      }, !entry);
      if (result.error) setError(result.error);
      else {
        if (!entry) form.reset();
        setNotice("Inspirasi tersimpan.");
        router.refresh();
      }
    } catch {
      setError("Inspirasi belum tersimpan. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  const title = entry ? `Edit ${entry.title}` : "Tambah inspirasi";
  return <section className="panel">
    <h2>{title}</h2>
    <form onSubmit={submit} aria-label={title}>
      {!entry && <label>Slug<input name="slug" required maxLength={64} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="contoh-gaya-kampus" /></label>}
      <label>Judul inspirasi<input name="title" required maxLength={90} defaultValue={entry?.title} /></label>
      <label>Nama drama<input name="drama" required maxLength={90} defaultValue={entry?.drama} /></label>
      <label>Ide padu padan<textarea name="note" required maxLength={280} defaultValue={entry?.stylingNote} /></label>
      <label>Tautan sumber<input name="source" type="url" required maxLength={350} defaultValue={entry?.sourceUrl} /></label>
      <label>Gaya<select name="style" defaultValue={entry?.style ?? "casual"}><option value="casual">Casual</option><option value="smart-casual">Smart casual</option></select></label>
      <label>Warna atasan pilihan<select name="topColor" defaultValue={entry?.topColor ?? ""}>
        <option value="">Bebas</option>
        {Object.entries(garmentColors).map(([label, color]) => <option key={color} value={color}>{label}</option>)}
      </select></label>
      <label className="checkbox-label"><input type="checkbox" name="active" defaultChecked={entry?.active ?? false} /> Tampilkan di inspirasi</label>
      {error && <p className="error-message" role="alert">{error}</p>}
      {notice && <p className="feedback" role="status">{notice}</p>}
      <button className="button primary" type="submit" disabled={pending}>{pending ? "Menyimpan…" : "Simpan inspirasi"}</button>
    </form>
  </section>;
}
