"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { styleNames, weatherNames, type Style, type Weather } from "@/features/styling/engine";
import { updateProfile, type readProfile } from "@/server/profile-actions";

type Profile = NonNullable<Awaited<ReturnType<typeof readProfile>>>;

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    setSaved(false);
    try {
      const result = await updateProfile(profile.id, String(values.get("name") ?? ""),
        values.get("style") as Style, values.get("weather") as Weather);
      if (result.error) setError(result.error);
      else {
        setSaved(true);
        router.refresh();
      }
    } catch {
      setError("Profil belum tersimpan. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  return <section className="panel" aria-labelledby="profile-title">
    <h2 id="profile-title">Preferensi stylist</h2>
    <p className="privacy-note">{profile.email}</p>
    <form onSubmit={submit}>
      <label>Nama<input name="name" defaultValue={profile.name} maxLength={60} required disabled={pending} /></label>
      <label>Gaya awal<select name="style" defaultValue={profile.style} disabled={pending}>
        {Object.entries(styleNames).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
      </select></label>
      <label>Cuaca awal<select name="weather" defaultValue={profile.weather} disabled={pending}>
        {Object.entries(weatherNames).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
      </select></label>
      {error && <p className="error-message" role="alert">{error}</p>}
      {saved && <p className="feedback" role="status">Preferensi tersimpan.</p>}
      <button type="submit" className="button primary full" disabled={pending}>{pending ? "Menyimpan…" : "Simpan preferensi"}</button>
    </form>
  </section>;
}
