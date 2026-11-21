"use client";

import { createAuthClient } from "better-auth/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const auth = createAuthClient();
type Mode = "sign-in" | "sign-up" | "forgot" | "reset";
const titles: Record<Mode, string> = {
  "sign-in": "Masuk", "sign-up": "Buat akun", forgot: "Lupa kata sandi", reset: "Atur ulang kata sandi",
};

export function AccountForm({ resetToken, invalidLink, verified }: {
  resetToken?: string; invalidLink: boolean; verified: boolean;
}) {
  const [mode, setMode] = useState<Mode>(resetToken ? "reset" : "sign-in");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState(verified ? "Email terverifikasi. Kamu bisa masuk." : "");
  const [error, setError] = useState(invalidLink ? "Tautan tidak valid atau kedaluwarsa. Minta tautan baru." : "");
  const router = useRouter();

  function choose(next: Mode) {
    setMode(next);
    setNotice("");
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setPending(true);
    setError("");
    setNotice("");

    try {
      if (mode === "sign-in") {
        const result = await auth.signIn.email({ email, password });
        if (result.error) {
          if (result.error.status === 429) setError("Terlalu banyak percobaan. Tunggu sebentar sebelum masuk lagi.");
          else if (result.error.code === "EMAIL_NOT_VERIFIED") setError("Verifikasi email terlebih dahulu. Cek kotak masuk Mailpit.");
          else setError("Gagal masuk. Periksa email dan kata sandi atau coba lagi.");
          return;
        }
        router.replace("/stylist");
        router.refresh();
      } else if (mode === "sign-up") {
        const name = String(form.get("name") ?? "").trim();
        if (!name || name.length > 60) {
          setError("Isi nama yang terdiri dari 1–60 karakter.");
          return;
        }
        const result = await auth.signUp.email({ name, email, password, callbackURL: "/akun?verified=1" });
        if (result.error) {
          setError("Akun belum bisa dibuat. Periksa isian dan coba lagi.");
          return;
        }
        setMode("sign-in");
        setNotice("Cek tautan verifikasi di kotak masuk Mailpit, lalu masuk.");
      } else if (mode === "forgot") {
        const result = await auth.requestPasswordReset({ email, redirectTo: "/akun" });
        if (result.error) {
          setError("Permintaan belum bisa diproses. Coba lagi.");
          return;
        }
        setNotice("Jika alamat terdaftar, tautan reset akan masuk ke Mailpit.");
      } else if (resetToken) {
        const result = await auth.resetPassword({ token: resetToken, newPassword: password });
        if (result.error) {
          setError("Kata sandi belum bisa diubah. Minta tautan baru jika sudah kedaluwarsa.");
          return;
        }
        setMode("sign-in");
        setNotice("Kata sandi diperbarui. Masuk dengan kata sandi baru.");
        router.replace("/akun");
      }
    } catch {
      setError("Layanan akun belum bisa dijangkau. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  return <section className="panel" aria-labelledby="account-title">
    <h2 id="account-title">{titles[mode]}</h2>
    <p className="privacy-note">Akun uji lokal. Pakai alamat email contoh seperti nama@example.test.</p>
    <form key={mode} onSubmit={submit} aria-label={titles[mode]}>
      {mode === "sign-up" && <label>Nama<input name="name" autoComplete="name" required maxLength={60} /></label>}
      {mode !== "reset" && <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>}
      {mode !== "forgot" && <label>Kata sandi<input name="password" type="password"
        autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
        required minLength={mode === "sign-in" ? undefined : 12} maxLength={128} /></label>}
      {error && <p className="error-message" role="alert">{error}</p>}
      {notice && <p className="feedback" role="status">{notice}</p>}
      <button type="submit" className="button primary full" disabled={pending}>{pending ? "Memproses…" : titles[mode]}</button>
    </form>
    <div className="form-actions">
      {mode === "sign-in"
        ? <><button type="button" className="text-button" disabled={pending} onClick={() => choose("sign-up")}>Buat akun</button>
          <button type="button" className="text-button" disabled={pending} onClick={() => choose("forgot")}>Lupa kata sandi</button></>
        : <button type="button" className="text-button" disabled={pending} onClick={() => choose("sign-in")}>Kembali ke masuk</button>}
    </div>
  </section>;
}
