# Audit kesiapan sebelum coding

Tanggal pemeriksaan: 21 November 2026. Baseline versi 1.3, diperbarui setelah pemilihan mesin sendiri tanpa model. Folder kerja: repositori StyleFit AI, branch `codex/rules-first-foundation`.

**Keputusan: build uji awal telah dibuat tanpa model/API.** Landing, handoff stylist, lemari manual guest, dan mesin aturan tersedia. Instalasi bersih, lint, typecheck, 10 tes konfigurasi, 16 tes domain, serta build production lokal lulus. Bukti browser dan keputusan penyerahan dicatat pada RELEASE_REVIEW.md. GitHub Actions, UAT pemilik, hosting, dan seluruh modul lanjutan belum dianggap lulus.

## Cakupan dan bukti

| Area | Hasil audit |
| --- | --- |
| Acuan produk | PRD F00-F15 tersedia dan mempertahankan seluruh modul konsep |
| Landing interaktif | L01-L06 diimplementasikan; preset, kunci, handoff, dan validasi identifier memiliki tes |
| Pelacakan fitur | TESTING menghubungkan 16 fitur ke tahap, 23 skenario pengguna, dan 17 kriteria PO |
| Dokumen dan skill | Tautan lokal, struktur tabel, whitespace, serta format ketiga skill diperiksa |
| Repo dan branch | `origin` sesuai repo tujuan; branch kerja bukan main; identitas commit tersedia |
| Akses GitHub | Remote HEAD dapat dibaca. Push dry-run pada HEAD yang sama telah berhasil tanpa mengirim perubahan |
| Runtime web | Node.js 24.14.0, npm 11.9.0, macOS arm64 tersedia; `.nvmrc` menyamakan runtime awal |
| Metadata dependensi | Next.js 16.4.6, Vitest 5.1.1, dan Playwright 1.65.1 menerima Node.js yang terpasang sudah diinstal bersama dari lockfile; build dan tes lokal berhasil |
| Auth dan data | Better Auth 1.7.27 beserta adapter Drizzle dipilih; dukungan Next.js/PostgreSQL dikonfirmasi pada dokumentasi dan metadata; integrasi belum diuji |
| Konfigurasi | `.env.example` tersedia tanpa secret; demo tidak membutuhkan layanan eksternal |
| Baseline Rp0 | Mesin rules, provider none, key/endpoint inference kosong; pemeriksaan konfigurasi serta 10 tes lulus |
| Pengabaian berkas sensitif | Pola env, private media, key, dan weights diperiksa melalui `git check-ignore`; contoh konfigurasi tetap dapat di-track |
| Kontras warna awal | Teks/latar 15.57:1; teks pendukung/putih 6.46:1; putih/aksen 7.41:1; batas kontrol/permukaan 4.76:1 |
| Kode aplikasi | Manifest, lockfile, landing, stylist, mesin aturan, unit/browser tests, serta workflow CI tersedia |

Perhitungan warna hanya memeriksa pasangan token yang ditetapkan, bukan keseluruhan aksesibilitas UI. Audit metadata awal telah dilanjutkan dengan instalasi bersih dan build. Passing CI remote dan penerimaan pengguna tetap bukti terpisah.

## Celah yang diperbaiki pada audit ini

1. Instruksi awal README sebelumnya hanya menyebut T00-T01, padahal CTA memerlukan T02. Instruksi sekarang mencakup keseluruhan alur.
2. Aturan bahasa dokumen bertentangan dengan dokumen Bahasa Indonesia yang sudah ada. AGENTS kini membedakan kode/identifier dari dokumen produk dan UI.
3. Auth dan akses database sebelumnya belum konkret. ARCHITECTURE kini menetapkan Better Auth, adapter Drizzle, Drizzle ORM, dan driver `pg`, dengan instalasi pada tahap akun.
4. Perilaku demo, identifier yang dipindahkan, dan konflik item terkunci belum dijabarkan. DESIGN kini memiliki kontrak untuk implementasi serta pengujian.
5. Hubungan fitur, tahap, dan pengujian sebelumnya tersebar. TESTING sekarang memiliki peta lengkap F00-F15.
6. Admin tidak memiliki tugas pengguna serta kriteria role khusus. U22/P16 sekarang memeriksa operasi admin dan penolakan akses akun biasa.
7. Konfigurasi runtime serta env belum memiliki berkas acuan. `.nvmrc` dan `.env.example` sekarang tersedia; baseline 1.3 memakai mesin aturan tanpa endpoint inference dan validasi config dilakukan per fitur.
8. Penyimpanan draft guest belum jelas. PRD dan ARCHITECTURE menetapkan draft awal di memori client, pemberitahuan kehilangan saat reload, dan pemindahan idempoten setelah login.
9. Perbedaan build, lint, tes kosong, dan CI belum cukup tegas. Pemeriksaan terpisah serta larangan lulus karena suite kosong kini ditetapkan pada ARCHITECTURE.
10. Rancangan layanan awal memerlukan API berbayar dan penyimpanan terkelola. COSTS dan ARCHITECTURE kini memakai mesin aturan sendiri, target media privat, serta antrean PostgreSQL bila kelak diperlukan; Vercel bukan dependensi.
11. Label Apache pada model try-on tidak mencakup seluruh dependensi. Pembatasan parser SegFormer ditemukan dan dijadikan syarat sebelum T41, bukan dianggap sudah lolos komersial.

## Prasyarat berdasarkan tahap

| Sebelum pekerjaan | Prasyarat | Status sekarang |
| --- | --- | --- |
| T00 bootstrap | Runtime web, repo, scope, keputusan struktur | Manifest, lockfile, script, dan workflow CI tersedia |
| Menyelesaikan T01-T02 | Fixture konsisten, aset berizin, alur CTA, suite dan browser Playwright | Sudah diimplementasikan; bukti teknis dan status UAT di RELEASE_REVIEW.md |
| T10 akun dan data | Database khusus StyleFit, migrasi, session secret, auth, perilaku draft, email sandbox | Keputusan library tersedia; koneksi database aplikasi dan alur email belum diuji |
| Akun dibuka ke publik | Verifikasi email, reset password, otorisasi akun/admin, origin dan cookie yang tepat | Belum tersedia; wajib dibuktikan sebelum publik |
| Unggahan tersimpan | Volume privat lokal, batas file, akses, retensi, backup, dan penghapusan | Lokasi target ditetapkan; endpoint media serta backup belum diimplementasikan |
| T21 analisis gambar mendatang | Provider cloud gratis yang sesuai kuota/privasi, evaluasi kualitas, otorisasi job, koreksi, dan retry | Belum dipilih; bukan dependensi rekomendasi inti |
| Avatar dan rambut | Aset berizin, pemetaan, rentang parameter yang didukung | Belum diproduksi atau dipilih |
| Scan opsional | Metode, kebutuhan model, lisensi, dan privasi dievaluasi sebelum integrasi | Belum dipilih atau diinstal; model lokal bukan default |
| Photo try-on | Provider/pipeline, seluruh lisensi, privasi, biaya, resource dan kualitas | Belum siap; kandidat FASHN VTON 1.5 memiliki dependensi parser yang membatasi penggunaan komersial |
| Video | FFmpeg, batas file, ekstraksi frame | CLI FFmpeg 9.0.2 tersedia; pipeline belum dibuat |
| Rilis/staging | Hosting, env terpisah, migrasi, backup/pemulihan, pemantauan | Penyedia/URL belum ditetapkan; belum ada deployment |
| Pembuatan PR otomatis | GitHub CLI atau konektor yang dapat membuat PR | `gh` tidak tersedia di PATH; Git push tidak memerlukan `gh` |

Docker CLI 29.5.3 tersedia, tetapi `docker info` gagal karena daemon tidak berjalan. Tahap 0 tidak membutuhkan Docker. Server di `127.0.0.1:5432` menerima koneksi melalui `pg_isready`; ini tidak membuktikan database atau kredensial StyleFit siap. Jangan memakai atau mereset database yang sudah ada tanpa isolasi dan konteksnya.

Versi Python dan keberadaan wheels pada PyPI tidak membuktikan seluruh stack computer vision kompatibel. Gunakan environment terpisah ketika model lokal diperlukan; jangan mengubah Python sistem hanya untuk landing.

`RTK.md` yang dirujuk instruksi global tidak ditemukan pada lokasi yang diperiksa. Tidak ada isinya yang ditebak atau disalin ke aturan proyek. AGENTS proyek memiliki aturan kerja yang eksplisit dan tidak memiliki tautan wajib ke file yang hilang.

## Pemeriksaan yang digunakan

- Baca seluruh dokumen production, instruksi agen, skill proyek, template PR, serta pola ignore.
- Periksa status/branch/remote Git, identitas commit tanpa mencetak alamat email, dan remote HEAD.
- Jalankan validator Skill Creator pada ketiga folder skill proyek.
- Periksa identifier fitur/skenario/PO, rujukan silang, tautan lokal, code fence, tabel, dan checklist yang belum boleh ditandai selesai.
- Periksa contoh env tanpa mencetak secret; uji pola ignore dan whitelist konfigurasi dengan `git check-ignore --no-index`.
- Periksa versi executable, daemon Docker, respons port PostgreSQL, metadata npm/PyPI, dan kontras token warna.

Audit awal tidak memasang aplikasi atau mengirim perubahan. Implementasi versi 1.3 kemudian memasang dependensi web/testing dari lockfile dan membangun aplikasi. Tidak ada model AI, perubahan database, panggilan provider berbayar, pembelian domain, atau deployment. Status commit/push dan CI dilaporkan sesuai hasil aktual, terpisah dari audit awal.

## Referensi untuk keputusan awal

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation) menjelaskan persyaratan Node.js dan pemisahan lint dari build.
- [Node.js releases](https://nodejs.org/en/about/previous-releases) mencatat Node.js 24 sebagai jalur LTS.
- [Better Auth Next.js](https://better-auth.com/docs/integrations/next), [adapter Drizzle](https://better-auth.com/docs/adapters/drizzle), dan [Drizzle PostgreSQL](https://orm.drizzle.team/docs/get-started-postgresql) mendasari pilihan integrasi akun/data.
- [COSTS.md](COSTS.md) mencatat sumber model lokal, lisensi, pengganti layanan, serta harga domain dan renewal yang diperiksa.

Bukti build aktual serta penyerahan UAT kini dicatat di RELEASE_REVIEW.md. Audit dokumen awal tetap tidak menggantikan tes aplikasi atau penerimaan pemilik.
