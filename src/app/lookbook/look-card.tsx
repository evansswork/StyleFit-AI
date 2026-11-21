"use client";

import { useState, type FormEvent } from "react";
import { OutfitArt } from "@/components/outfit-art";
import { styleNames, weatherNames } from "@/features/styling/engine";
import { updateOutfit, type readLookbook } from "@/server/lookbook-actions";

type Look = NonNullable<Awaited<ReturnType<typeof readLookbook>>>["looks"][number];

export function LookCard({ accountId, look }: { accountId: string; look: Look }) {
  const [feedback, setFeedback] = useState<NonNullable<Look["feedback"]> | "">(look.feedback ?? "");
  const [note, setNote] = useState(look.note);
  const [pending, setPending] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function persist(change: Parameters<typeof updateOutfit>[2]) {
    if (pending) return;
    setPending(true);
    setMessage("");
    setError("");
    try {
      const result = await updateOutfit(accountId, look.id, change);
      if ("error" in result) setError(result.error);
      else if (change.kind === "delete") setRemoved(true);
      else setMessage("Umpan balik tersimpan.");
    } catch {
      setError("Perubahan belum tersimpan. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void persist({ kind: "feedback", status: feedback || null, note });
  }

  if (removed) return <p className="panel" role="status">Kombinasi dihapus dari lookbook.</p>;
  return <article className="result-card">
    <h2>{styleNames[look.style]} · {weatherNames[look.weather]}</h2>
    {look.items.length > 0 && <OutfitArt items={look.items} />}
    {look.missingCount > 0 && <p>{look.missingCount} item sudah tidak tersedia di lemari.</p>}
    <ul>{look.items.map(item => <li key={item.id}>{item.name}</li>)}</ul>
    <form onSubmit={submit} aria-label="Umpan balik outfit">
      <label>Status<select value={feedback} disabled={pending}
        onChange={event => {
          const value = event.target.value;
          setFeedback(value === "worn" || value === "skipped" ? value : "");
        }}><option value="">Belum dinilai</option><option value="worn">Dipakai</option><option value="skipped">Tidak dipilih</option></select></label>
      <label>Catatan (opsional)<input value={note} maxLength={160} disabled={pending}
        onChange={event => setNote(event.target.value)} /></label>
      <div className="form-actions">
        <button type="submit" className="button secondary" disabled={pending}>{pending ? "Memproses…" : "Simpan umpan balik"}</button>
        <button type="button" className="text-button" disabled={pending} onClick={() => persist({ kind: "delete" })}>Hapus dari lookbook</button>
      </div>
    </form>
    {error && <p className="error-message" role="alert">{error}</p>}
    {message && <p className="feedback" role="status">{message}</p>}
  </article>;
}
