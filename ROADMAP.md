# StyleFit AI Roadmap

Status 21 November 2026: landing dan stylist guest berbasis aturan telah diimplementasikan; bukti pengujian dicatat pada RELEASE_REVIEW.md. Checklist selesai berarti ada implementasi dan bukti, bukan hanya rancangan.

Baseline versi 1.3 memakai mesin rekomendasi sendiri tanpa model/API, mengikuti COSTS.md. Pemeriksaan konfigurasi Rp0 sudah tersedia di `scripts/check-zero-budget.mjs`; pemeriksaan konfigurasi saja tidak membuktikan aplikasi bekerja. Tidak ada paket hosting yang dipilih atau kewajiban menggunakan Vercel.

## Tahap 0 Fondasi dan landing interaktif

- [x] T00 Bootstrap Next.js, TypeScript, Tailwind, Node.js dari `.nvmrc`, npm lockfile, konfigurasi per fitur, serta script pada ARCHITECTURE yang benar-benar bekerja. Jalankan dan masukkan pemeriksaan Rp0 ke CI tanpa secret provider; lengkapi suite serta browser tests bersama T01-T02 dan petunjuk menjalankan di README. Jangan menimpa AGENTS.md dengan boilerplate generator.
- [x] T01 Bangun landing F00 dengan fixture dan aset demo, pilihan gaya/cuaca/item, keyboard, reduced motion, dan transisi yang jelas.
- [x] T02 Sambungkan CTA demo ke alur stylist awal. Bawa pilihan valid dan tampilkan ringkasan yang bisa diedit; tidak ada tujuan CTA kosong.

Selesai tahap: landing dapat dicoba tanpa akun/provider, L01-L06 dan U20-U21 diperiksa, build lulus, serta tidak ada fixture yang diklaim sebagai hasil AI.

T00-T02 telah diimplementasikan dan diverifikasi secara teknis. Bukti aktual: RELEASE_REVIEW.md. Penerimaan pemilik dan sesi pengguna tetap belum diuji; checklist implementasi bukan persetujuan go-live.

## Tahap 1 Lemari dan outfit

- [ ] T10 Siapkan PostgreSQL khusus StyleFit, Drizzle, Better Auth, serta konfigurasi akun. Implementasikan profil manual, session, isolasi akun, kontrak draft guest, dan pemindahan data yang idempoten. Siapkan pengiriman email sandbox; verifikasi dan pemulihan akun harus teruji sebelum akun dibuka ke publik.
- [ ] T11 Buat tambah/edit/hapus item lemari, penyimpanan privat pada volume lokal bila unggahan diaktifkan, dan keadaan kosong/gagal. Jangan mewajibkan bucket atau layanan penyimpanan berbayar.
- [ ] T12 Implementasikan rekomendasi berbasis atribut serta aturan F06-F07, biaya tambahan, item terkunci, dan penjelasan batas.
- [ ] T13 Simpan/buka ulang outfit, lookbook, serta umpan balik. Tambahkan admin atribut/katalog dasar.

Implementasi parsial yang sudah ada: lemari manual guest di memori, tambah/edit/hapus, rekomendasi serta penjelasan, dan item terkunci. T10-T13 tetap belum selesai karena akun, penyimpanan, admin, serta kriteria tahap lengkap belum tersedia.

Selesai tahap: alur lemari sampai outfit tersimpan bekerja; aturan domain punya tes; skenario pengguna terkait, akses antar akun, dan role admin U22/P16 diperiksa.

## Tahap 2 Inspirasi dan belanja

- [ ] T20 Tambahkan drama, karakter, look, sumber, dan label verifikasi melalui admin serta explorer.
- [ ] T21 Evaluasi API cloud gratis untuk analisis gambar setelah cakupan, kuota, privasi, kualitas, dan biaya lulus. Bangun analisis screenshot, pilihan subjek, koreksi atribut, status pekerjaan, serta pemulihan hanya setelah evaluasi. Mesin styling tetap berjalan mandiri tanpa model lokal atau API; tidak ada fallback berbayar.
- [ ] T22 Cocokkan referensi dengan lemari dan katalog; terapkan koreksi terbaru sebelum rekomendasi.
- [ ] T23 Tambahkan produk, harga/waktu pemeriksaan, wishlist, tautan pencarian, serta affiliate berlabel. Checkout tetap di marketplace.

Selesai tahap: sumber dan biaya dapat diperiksa, referensi tidak dikenal tertangani, serta provider gagal tidak merusak alur yang sudah berhasil. Setelah tahap 0-2 lulus kriteria fitur aktif, siapkan rilis awal.

## Tahap 3 Avatar dan layering

- [ ] T30 Siapkan avatar manual dan aset pakaian berizin; dokumentasikan kategori serta rentang parameter yang didukung.
- [ ] T31 Implementasikan rotasi/zoom, pergantian pakaian, layering, perbandingan, serta label spesifik/serupa.
- [ ] T32 Tambahkan panduan ukuran hanya untuk produk dan parameter yang datanya cukup; pertahankan fallback 2D.

Selesai tahap: U10 dan U12 serta kriteria terkait lulus pada aset yang diumumkan; kegagalan muat dan batas tubuh/pakaian tercatat.

## Tahap 4 Personalisasi visual

- [ ] T40 Tambahkan scan opsional, landmark wajah/tubuh, koreksi manual, serta perkiraan warna berlabel.
- [ ] T41 Pilih jalur photo try-on setelah provider, seluruh lisensi, biaya, privasi, kualitas, dan resource lulus. Model lokal tidak menjadi prasyarat inti. Integrasikan pilihan penyimpanan, penghapusan, serta status pekerjaan. Kandidat FASHN VTON 1.5 belum lolos karena komponen parser dan hardware; fitur tetap nonaktif sampai ada jalur yang layak tanpa API berbayar.
- [ ] T42 Tambahkan referensi serta aset rambut, warna, dan kebutuhan perawatan.

Selesai tahap: U11, U13, U14, U19 serta kriteria terkait lulus; data yang dihapus tidak muncul kembali dari pekerjaan tertunda.

## Tahap 5 Perjalanan dan video

- [ ] T50 Bangun perjalanan, rencana kegiatan, konteks cuaca manual atau MET Norway dengan cache dan atribusi, serta informasi musiman ketika prakiraan belum tersedia.
- [ ] T51 Bangun outfit per kegiatan dan packing barang unik dengan jumlah, pengulangan, serta status dikemas.
- [ ] T52 Tambahkan batas video, ekstraksi/pilihan frame, dan gunakan kembali alur analisis screenshot.

Selesai tahap: U15-U17 serta kriteria terkait lulus; hitungan packing, pilihan frame, dan konteks cuaca benar pada data uji.

## Jalur riset F08

Rekonstruksi otomatis pakaian dari sembarang gambar diuji terpisah. Catat cakupan input, aset, akurasi, biaya, dan batas sebelum menjadikannya janji fitur. Template serupa tetap berlabel serupa sepanjang riset berjalan.

## Penyerahan setiap pekerjaan

Laporkan tugas dan fitur yang berubah, hasil pemeriksaan aktual, langkah mencoba, serta batas yang belum diuji. Push branch bila termasuk penugasan dan remote telah tersedia. Pemilik melakukan review serta UAT sebelum keputusan merge/rilis. Fitur lain tetap di roadmap dan tidak dihapus hanya karena belum dikerjakan.
