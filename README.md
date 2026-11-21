# StyleFit AI

Personal stylist yang menyusun kombinasi dari pakaian yang kamu punya. Versi awal memakai mesin aturan sendiri tanpa model lokal, API key, login, atau database.

**Status:** landing interaktif dan stylist guest telah diimplementasikan pada branch `codex/rules-first-foundation`. Akun, penyimpanan permanen, katalog drama/produk, analisis screenshot, avatar 3D, dan photo try-on belum tersedia. Hosting/domain belum dipilih. Bukti pemeriksaan dan batas rilis ada di [RELEASE_REVIEW.md](RELEASE_REVIEW.md).

## Menjalankan

Gunakan Node.js dari `.nvmrc` (24.14.0), lalu:

```sh
npm ci
npm run dev
```

Buka `http://127.0.0.1:3000`. Demo dan lemari manual tidak memerlukan `.env` atau service tambahan. Kontrak konfigurasi ada di `.env.example`; jangan mengisi key provider untuk build ini. Draft lemari berada di memori browser dan bertahan selama navigasi internal. Reload atau menutup tab menghapus draft.

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

Preview adalah ilustrasi kategori dan warna 2D. Bukan model pakaian spesifik, simulasi ukuran, atau photo try-on. Konteks tropis/sejuk adalah input manual; bukan cuaca live atau panduan winter.

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

Skill repo: [UI](.agents/skills/stylefit-ui/SKILL.md), [AI Integration](.agents/skills/stylefit-ai-integration/SKILL.md), dan [UAT](.agents/skills/stylefit-uat/SKILL.md). Kerjakan milestone aktif, jalankan checks, laporkan bukti, kemudian pemilik menguji serta menerima hasil. Fitur tahap lanjut tetap dalam visi tanpa diklaim sudah tersedia.

## GitHub

`origin`: `https://github.com/evansswork/StyleFit-AI.git`. Perubahan memakai branch `codex/rules-first-foundation`; status pengiriman dicatat di laporan akhir. Merge, pemilihan hosting, dan deployment publik belum dilakukan.
