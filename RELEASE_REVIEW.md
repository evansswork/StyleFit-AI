# Review rilis uji StyleFit AI 0.1.0

Tanggal: 21 November 2026. Branch: `codex/rules-first-foundation`. Build diuji lokal pada macOS Apple Silicon, Node.js 24.14.0. Laporan ini berlaku pada source perubahan branch ini; tidak mengklaim seluruh visi produk selesai.

## Keputusan produk sebelum implementasi

Pemilik memilih opsi 1: mesin rekomendasi sendiri. Rekomendasi kombinasi tidak memerlukan model bahasa, GPU, Ollama, atau API. Atribut manual serta aturan dapat memecahkan alur awal pengguna dengan pakaian terbatas. Kualitas saran tetap membutuhkan pengujian pengguna; kode yang berjalan tidak membuktikan orang akan menyukai outfit.

| Kemampuan | Layak tanpa layanan berbayar | Implementasi build ini |
| --- | --- | --- |
| Padu padan dari lemari manual | Ya, mesin aturan deterministik | Tersedia untuk guest |
| Kunci item dan ganti konteks | Ya | Tersedia; konflik dijelaskan tanpa membuka kunci diam-diam |
| Bujet dan harga tidak diketahui | Ya, hitungan domain | Aturan teruji; katalog belanja belum ada di UI |
| Inspirasi K-drama | Ya untuk koleksi yang dikurasi dan bersumber | Belum ada koleksi, admin, atau explorer |
| Avatar 3D dari aset | Ya tanpa LLM; tetap memerlukan produksi aset | Belum tersedia; build memakai ilustrasi 2D original |
| Analisis screenshot sembarang | Memerlukan model/provider yang dievaluasi | Tidak tersedia; mesin aturan tidak diklaim membaca gambar |
| Photo try-on realistis | Memerlukan pipeline khusus, lisensi, komputasi, privasi, dan biaya yang sesuai | Tidak tersedia |
| Akun dan simpan lintas perangkat | Bisa memakai software sendiri; hosting/email tetap perlu resource | Tidak tersedia |

**Rekomendasi: lanjut UAT build guest awal; belum go-live penuh.** Tidak ada prasyarat API berbayar untuk alur aktif. Tidak ada pembelian domain, hosting, atau pengaktifan billing. Penyedia hosting belum dipilih.

## Hasil teknis aktual

| Pemeriksaan | Hasil |
| --- | --- |
| `npm ci --no-fund` | Lulus instalasi bersih dari lockfile |
| Audit otomatis npm saat instalasi | 0 vulnerabilities terlapor; bukan jaminan bebas kerentanan |
| `npm run lint` | Lulus tanpa warning lint |
| `npm run typecheck` | Lulus |
| `npm test` | 10 tes konfigurasi + 16 tes domain lulus; 0 gagal, 0 dilewati |
| `npm run build` | Lulus; landing statis dan route stylist berhasil dibangun |
| `npm run test:e2e` | 9 tes Chromium lulus; 0 gagal, 0 dilewati |
| Visual | Screenshot landing dan stylist desktop/360 px diperiksa; tidak ada konten penting terpotong pada gambar yang diperiksa |
| GitHub Actions | Workflow tersedia; hasil remote harus diperiksa setelah push, terpisah dari hasil lokal |
| UAT pemilik/peserta | Belum diuji; belum ada penerimaan produk |

Tes browser menjalankan tiga skenario pada desktop 1440 px, mobile 360 px dengan reduced motion, dan mobile 390 px. Skenario mencakup preview berubah, ganti item, konflik kunci, handoff, tambah/edit pakaian, hasil dari barang milik pengguna, larangan menghapus item terkunci, outer yang belum tersedia, draft selama navigasi internal, penghapusan draft saat reload, query tidak dikenal, serta keyboard. Tes memastikan tidak ada overflow horizontal pada landing dan stylist. Request alur demo sampai hasil diperiksa; tidak ada tujuan eksternal yang teramati. Ini bukan audit seluruh kemungkinan traffic browser atau pengujian jaringan hosting.

Screenshot aktual berada di `test-results/landing-desktop.png`, `landing-mobile-360.png`, `landing-mobile-390.png`, serta padanannya `stylist-*.png`. Artefak ini lokal dan diabaikan Git. Jalankan kembali tes browser untuk membuatnya pada checkout lain. Emulasi Chromium tidak menggantikan uji HP fisik, Safari, atau screen reader.

## Cara UAT pemilik

Jalankan `npm ci` lalu `npm run dev`, dan buka `http://127.0.0.1:3000`.

1. Coba ganti gaya/cuaca di landing. Ganti atasan, kunci, lalu coba konteks yang tidak cocok. Preview dan status kunci harus sesuai; konflik tidak diabaikan.
2. Lanjut ke stylist dari demo. Pastikan item dan kunci terbawa; buat kombinasi lalu periksa semua alternatif.
3. Gunakan lemari sendiri. Masukkan minimal satu atasan, bawahan, dan sepatu dengan atribut yang sesuai. Buat kombinasi tanpa API key atau service tambahan.
4. Koreksi nama/gaya item, kunci item, dan buat ulang. Atribut terbaru dipakai; item yang dikunci tetap sama atau kendala dijelaskan.
5. Pindah ke beranda melalui navigasi lalu kembali ke stylist. Item manual masih ada. Reload halaman harus mengosongkan draft sesuai pemberitahuan.
6. Catat apakah ada kombinasi yang ingin benar-benar dipakai, apa yang terasa tidak sesuai, dan berapa lama sampai memilih. Catat hasil U20-U21 dan bagian aktif U01-U04/U19 pada TESTING.

Jangan menguji dengan data atau foto pribadi yang tidak diperlukan. Tidak ada unggahan pada versi ini. Keputusan penerimaan tetap milik pemilik; passing otomatis tidak mengisi hasil sesi manual.

## Batas dan tindak lanjut

- Draft adalah memori browser. Reload/menutup tab menghapus item dan hasil; navigasi internal mempertahankan item, tetapi konteks/kunci/hasil stylist dapat kembali ke awal. Akun dan penyimpanan permanen adalah pekerjaan berikutnya, bukan tombol yang pura-pura berfungsi.
- Mesin memakai atribut yang dimasukkan, penyaringan gaya/cuaca, prioritas kepemilikan, dan preferensi warna sederhana. Tidak ada pelatihan model, penilaian bentuk tubuh, atau klaim setara stylist profesional/model premium. Maksimal 40 item dan tiga alternatif.
- Tidak ada data produk, harga live, afiliasi, scan, katalog drama, avatar 3D, atau try-on. Ilustrasi hanya kategori/warna dan bukan prediksi ukuran.
- ESLint 9.39.5 memberi peringatan dukungan versi berakhir saat instalasi, tetapi cocok dengan peer dependencies konfigurasi Next.js yang dipin. ESLint 10 menimbulkan konflik peer plugin. Pertahankan instalasi tanpa force/legacy-peer-deps; perbarui stack lint saat plugin mendukungnya. Ini keterbatasan tooling development, bukan dependensi runtime.
- Hosting publik, HTTPS/reverse proxy, pengujian beban, monitoring, backup akun/media, serta evaluasi keamanan alur akun perlu dibuktikan ketika bagian tersebut dibangun. Tidak ada server atau database production yang dianggap siap dari build lokal ini.

Urutan berikutnya: UAT guest dan perbaikan yang ditemukan; T10-T13 untuk akun/penyimpanan/lemari lengkap; T20/T22 untuk inspirasi terkurasi; evaluasi analisis gambar secara terpisah. Tidak perlu mengunduh model lokal untuk melanjutkan rekomendasi dasar.

## Account integration follow-up, 22 November 2026

The account sandbox was tested with local PostgreSQL and Mailpit. The guest suite passed all nine browser runs, and the account suite passed all four runs across desktop and a 390 px mobile viewport. The latter covers verification, password reset, explicit import, per-account wardrobe and lookbook isolation, reload persistence, profile preferences, feedback, and handling a deleted garment in a saved outfit. The draft stays in browser memory until the user chooses to save it.

The studio and landing use Sunrise Through the Rain Concept Idea as their visual reference. The label matches the owner's requested title. No owner test session was needed for this milestone. The evidence above comes from automated browser scenarios and does not measure outfit preferences or public SMTP delivery.

## Curated inspiration follow-up, 22 November 2026

Lint, type checking, all 27 configuration and unit checks, database migrations, and the optimized build passed. All 12 guest browser runs passed at 1440, 390, and 360 px. The new scenario verifies the sourced concept title, unknown title recovery, keyboard search, and wardrobe continuity through the stylist handoff. Desktop and 360 px screenshots were visually reviewed.

All four account browser runs passed. Coverage includes an ordinary account denied access to the editor, the allowed account publishing and unpublishing a fixture, and a stale inspiration link recovering to the regular stylist. Tests used disposable addresses and local Mailpit. Only the built-in editorial inspiration ships by default.

## Marketplace search fallback, 22 November 2026

Lint, type checking, 27 configuration and unit checks, the optimized build, 15 guest browser runs, and four account browser runs passed. A collapsed recovery panel appears only after the stylist identifies missing categories. Browser checks cover both outgoing URLs, removal after adding a suitable garment, no outfit or price claim, and no external request before following a link. The open panel was visually reviewed at 360 px.

The Shopee search destination responded with HTTP 200. The Tokopedia URL was generated and validated locally; the destination could not be reached through this environment. Product prices, stock, affiliate links, and a shopping wishlist are outside this slice.

## Editable reference preferences, 22 November 2026

The stylist applies an edited or cleared top-color preference immediately to the next outfit and shopping search. The editorial source entry keeps its original value. The unit suite verifies the corrected ranking and lock priority. The guest browser suite verifies that changing the preference clears old shopping results and the next search uses the selected color. All 27 configuration and unit checks, 15 guest browser runs, and four account browser runs passed on the optimized build.
