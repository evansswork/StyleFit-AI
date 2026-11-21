# StyleFit AI Design

## Arah visual

StyleFit memakai tampilan editorial fashion yang menonjolkan pakaian dan keputusan pengguna. Produk terasa personal, jelas, dan ringan untuk HP. Bahasa antarmuka adalah Bahasa Indonesia yang singkat dan tidak menghakimi bentuk tubuh.

Fondasi warna: latar `#F8FAFC`, permukaan `#FFFFFF`, teks utama `#17212B`, teks pendukung `#52606D`, aksen `#1746D1`, dan garis `#CBD5E1`. Gunakan satu aksen utama pada seluruh halaman; warna status hanya menyampaikan keadaan nyata. Periksa kontras hasil implementasi, termasuk disabled, error, dan focus.

Gunakan teks putih pada tombol aksen. Garis `#CBD5E1` untuk pemisah dekoratif; batas kontrol yang perlu terlihat memakai `#64748B` atau state aksen yang memenuhi kontras. Focus tidak bergantung pada garis dekoratif yang tipis.

Tipografi awal memakai system sans-serif agar demo tidak menunggu font eksternal. Headline memakai bobot dan ukuran besar yang terukur; rincian pakaian tetap mudah dibaca. Spasi mengikuti kelipatan 4 px, radius kontrol 8 px, dan permukaan besar 16 px. Ini arah awal, bukan klaim desain yang sudah divalidasi.

## Landing interaktif

Hero memadukan pesan singkat dengan ruang mencoba outfit yang dominan. Demo ditempatkan dekat pesan utama, bukan tersembunyi setelah deretan fitur. Pada HP, kontrol dan preview tetap berdekatan.

Contoh pesan: **Gaya yang kamu suka, dari baju yang kamu punya.** CTA utama: **Coba stylist**. Tautan eksplorasi boleh menggulir ke demo, tetapi tidak menggantikan CTA menuju alur yang berfungsi.

Urutan isi:
1. Navigasi, pesan manfaat, dan demo yang langsung dapat dicoba.
2. Penjelasan singkat hubungan inspirasi, lemari, dan outfit.
3. Contoh perubahan satu item dan biaya tambahan dari fixture berlabel.
4. Penjelasan preview serta privasi; FAQ dan footer seperlunya.

Demo menggunakan fixture lokal dan aset dengan hak penggunaan yang jelas. Pilihan gaya, cuaca, dan item mengubah hasil yang dapat dilihat. Jangan membuat simulasi loading AI hanya untuk menampilkan fixture yang sudah tersedia. Pilihan dapat diteruskan melalui parameter yang divalidasi dan hanya berisi identifier demo yang tidak sensitif.

## Kontrak demo dan penerusan pilihan

- Gaya awal: `casual` dan `smart-casual`; konteks awal: `tropical` dan `cool`. Keduanya adalah preset demo, bukan prakiraan cuaca langsung.
- Fixture memiliki identifier tetap untuk look dan item per slot. Gambar, label, dan harga ilustrasi berasal dari fixture yang sama agar tidak saling berbeda.
- Contoh penerusan: `/stylist?demo=1&style=casual&weather=tropical&top=tee-white&bottom=jeans-indigo&shoes=sneakers-white&locked=top`. Semua identifier adalah data contoh; top, bottom, shoes, dan outer hanya diterima jika ada pada fixture.
- Gaya, konteks, identifier item, dan nama slot terkunci diperiksa terhadap daftar yang didukung. Nilai tak dikenal dipulihkan ke default yang valid, tanpa menyalin data mentah ke tampilan.
- Item terkunci tidak boleh terbuka otomatis saat preset berubah. Bila pilihan baru tidak mungkin dipenuhi, pertahankan pilihan dan tampilkan alasan serta tindakan melepas kunci.
- T02 membuat halaman stylist demo yang menampilkan pilihan terbawa, bisa diedit, serta memberi hasil demo yang konsisten. Penyelesaian T01 saja belum memenuhi CTA L04.
- Aset awal memakai pakaian generik dari sumber berizin atau ilustrasi original. Catat asal dan izin tiap aset sebelum dipakai; foto aktor atau merek tidak dianggap bebas digunakan.

## Interaksi wajib

| Kontrol | Perilaku | Keadaan yang terlihat |
| --- | --- | --- |
| Pilihan gaya | Mengubah kombinasi sesuai preset | Pilihan aktif, nama look, dan preview baru |
| Pilihan cuaca | Menyesuaikan item atau cara styling | Konteks baru dan alasan adaptasi singkat |
| Ganti item | Mengganti satu bagian | Item baru; pilihan lain tetap konsisten |
| Pertahankan item | Mempertahankan item saat kombinasi berubah | Tombol dengan status terpilih dan akses keyboard |
| Coba stylist | Membuka alur berikutnya | Pilihan demo dipindahkan atau dijelaskan jika tidak didukung |

Motion berdurasi singkat dipakai untuk transisi keadaan. Hormati `prefers-reduced-motion`; fungsi serta informasi tetap tersedia tanpa animasi. Kontrol tidak hanya bergantung pada hover atau gerakan menyeret.

## Halaman aplikasi

| Rute yang ditargetkan | Tujuan |
| --- | --- |
| `/` | Landing dan demo |
| `/stylist` | Kebutuhan dan rekomendasi |
| `/wardrobe` | Lemari serta edit atribut |
| `/inspiration` | Drama, karakter, dan referensi |
| `/looks` | Outfit tersimpan dan wishlist |
| `/trips` | Rencana perjalanan dan packing |
| `/profile` | Preferensi, parameter tubuh, serta kontrol data |
| `/admin` | Pengelolaan oleh akun yang berwenang |

Rute tahap lanjut hanya diaktifkan ketika alurnya tersedia. Area publik menjelaskan visi produk tanpa memberi kesan fitur yang belum tersedia sudah bisa dipakai.

## Keadaan komponen

- Item pakaian memperlihatkan gambar, kategori, warna, status dimiliki, dan tindakan yang relevan.
- Hasil outfit memperlihatkan kombinasi, alasan, kebutuhan tambahan, serta visual yang tersedia. Harga belum diketahui ditulis apa adanya.
- Form memiliki label, satuan, validasi dekat field, dan data yang tetap ada setelah kegagalan yang dapat dipulihkan.
- Area kosong membantu tindakan berikutnya. Loading nyata menunjukkan proses; error memberi cara mencoba lagi atau memakai jalur manual.
- Gambar gagal memiliki fallback yang informatif. Kegagalan 3D mempertahankan rincian outfit 2D.
- Pilihan yang terkunci memiliki indikator teks atau state aksesibilitas, bukan warna saja.

## Aksesibilitas dan bukti visual

Gunakan elemen semantik, focus terlihat, label yang terhubung, alt text yang menjelaskan item, dan area sentuh minimal 44 px untuk kontrol utama. Uji desktop serta lebar 360 px dan 390 px tanpa isi penting terpotong. Konten dinamis diumumkan seperlunya tanpa memindahkan fokus secara mengejutkan.

Sebelum menyerahkan perubahan UI, coba tugas L01 sampai L06 pada PRD, U20 dan U21 pada TESTING, serta skenario fitur terkait. Simpan bukti screenshot atau rekaman tanpa data pribadi jika alat tersedia. Jangan menyebut aksesibilitas atau performa sudah lulus berdasarkan inspeksi kode saja.
