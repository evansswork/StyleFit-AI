# StyleFit AI

Personal stylist yang menyusun kombinasi dari pakaian yang kamu punya. Rekomendasi memakai mesin aturan sendiri. Guest dapat mencoba tanpa login atau database.

**Status:** the landing, guest stylist, and curated inspiration search are available. PostgreSQL and Mailpit enable local accounts, saved wardrobes, lookbooks, and the inspiration editor. Hosting publik dan pengiriman email sungguhan masih tahap berikutnya. Detail ada di [RELEASE_REVIEW.md](RELEASE_REVIEW.md).

## Menjalankan

Gunakan Node.js dari `.nvmrc` (24.14.0), lalu:

```sh
npm ci
npm run dev
```

Buka `http://127.0.0.1:3000`. Demo and guest wardrobe run without an environment file or additional services. Kontrak konfigurasi ada di `.env.example`; jangan mengisi key provider untuk build ini. Draft lemari berada di memori browser dan bertahan selama navigasi internal. Reload atau menutup tab menghapus draft.

Untuk build production secara lokal:

```sh
npm run build
npm run start
```

Build server Next.js standar tidak memerlukan Vercel. `npm run start` memakai build di `.next` beserta dependensi runtime; hosting dapat menjalankannya dengan Node.js. Bind default ke loopback untuk testing lokal; deployment menentukan reverse proxy, HTTPS, dan bind yang sesuai. Belum ada server online atau domain yang dibeli.

## Mencoba alur utama

1. Pada landing, ganti gaya/cuaca, ganti satu item, lalu kunci item.
2. Tekan **Lanjutkan pilihan ke stylist**. Pilihan valid dan kuncinya terbawa.
3. Tekan **Buat kombinasi** untuk melihat alternatif contoh.
4. Pilih **Gunakan lemari sendiri**, lalu masukkan atasan, bawahan, dan sepatu. Untuk sejuk tambahkan outer.
5. Edit atribut atau kunci item, lalu buat ulang kombinasi. Hasil hanya memakai barang yang kamu masukkan; tidak mengarang kepemilikan atau produk belanja.

Preview awal memakai ilustrasi 2D. Pilih **Avatar 3D** pada outfit hasil atau koleksi contoh untuk memutar model serupa, mengatur zoom dan proporsi, serta melihat lapisan dalam saat ada outer. Pilih **Detail wajah** untuk mendekatkan kamera ke scan kepala. Foto drama tampil sebagai referensi outfit. Mode 3D memerlukan WebGL 2. Model pakaian memakai kategori dan warna sebagai acuan visual. Konteks tropis/sejuk adalah input manual; bukan cuaca live atau panduan winter.

Search by title on `/inspirasi`. Opening a result passes its style and optional top color to the stylist, where it uses the same wardrobe. Change or clear the suggested top color in the stylist to refine the next combination and search links. The source links identify each drama title. The styling notes are editorial adaptations. When a required category has no suitable garment, the optional marketplace searches use the selected style and reference color. The links provide no live prices or stock.

## Local account environment

1. Run a dedicated PostgreSQL database and a separate test database whose name ends in `_test`. Both must be reachable through loopback.
2. Run Mailpit on loopback with SMTP port 1025 and HTTP port 8025.
3. Copy `.env.example` to `.env.local`. Set `AUTH_ENABLED=true`, fill both database URLs, and set `BETTER_AUTH_SECRET` to a fresh random value of at least 32 characters. Keep `BETTER_AUTH_URL` at `http://127.0.0.1:3000` for the default local server.
4. Run `npm run db:migrate` and `npm run dev`. Open `/akun` and register with an address such as `review@example.test`. Open Mailpit at `http://127.0.0.1:8025` for verification or reset.

To edit the inspiration catalog, set `STYLEFIT_ADMIN_EMAIL` to the single verified account allowed to publish or unpublish entries. Keep it empty to disable editing. Open `/admin/inspirasi` when signed in with that account.

Run `npm run test:account` after building. It migrates the dedicated test database and verifies the account flows at desktop and mobile widths. GitHub Actions starts isolated PostgreSQL and Mailpit containers for the same checks.

## Pemeriksaan

```sh
npm run check:budget
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Tes browser memakai build production pada port 3100 yang belum terpakai. Mencakup desktop 1440 px, HP 360/390 px, keyboard, reduced motion, handoff, kunci, input manual, koreksi, navigasi draft, serta reload. Screenshot tersimpan di `test-results` dan diabaikan Git.

Workflow `.github/workflows/ci.yml` menjalankan pemeriksaan dari lockfile tanpa secret provider. Passing lokal tidak berarti GitHub Actions atau UAT pemilik sudah lulus. Tidak ada tes yang sengaja membiarkan suite kosong.

## Acuan produk dan pekerjaan

| Berkas | Kegunaan |
| --- | --- |
| [PRD.md](PRD.md) | Kebutuhan dan batas produk versi 1.3 |
| [DESIGN.md](DESIGN.md) | Desain, interaksi, dan aksesibilitas |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Mesin aturan, state, stack, serta target layanan mendatang |
| [AGENTS.md](AGENTS.md) | Instruksi kerja AI dan GitHub |
| [ROADMAP.md](ROADMAP.md) | Tahap implementasi dan kriteria selesai |
| [TESTING.md](TESTING.md) | Skenario pengguna serta kriteria PO |
| [READINESS.md](READINESS.md) | Audit awal dan pembaruan kesiapan |
| [COSTS.md](COSTS.md) | Baseline biaya Rp0 dan riset domain |
| [RELEASE_REVIEW.md](RELEASE_REVIEW.md) | Bukti build, batas, dan langkah UAT |

Konsep versi 1.0 tetap menjadi arsip [HTML](<StyleFit AI - Konsep dan Panduan Testing.html>) dan [teks](<StyleFit AI - Konsep dan Panduan Testing.txt>). Provider serta status lama di arsip digantikan PRD, ARCHITECTURE, dan COSTS.

Skill repo: [UI](.agents/skills/stylefit-ui/SKILL.md), [AI Integration](.agents/skills/stylefit-ai-integration/SKILL.md), dan [UAT](.agents/skills/stylefit-uat/SKILL.md). Production work continues from the highest-priority ready milestone. The agent runs acceptance checks and reports evidence. Public rollout requires the deployment environment. Fitur tahap lanjut tetap dalam visi tanpa diklaim sudah tersedia.

## GitHub

`origin`: `https://github.com/evansswork/StyleFit-AI.git`. Perubahan memakai branch `codex/rules-first-foundation`; lihat riwayat commit untuk status pengiriman. Merge, pemilihan hosting, dan deployment publik belum dilakukan.
