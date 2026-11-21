# StyleFit AI Design

## Arah visual

**Sunrise Through the Rain Concept Idea** menjadi acuan visual untuk tahap production berikutnya. Pertahankan palet biru kabut dan kuning madu, judul Georgia dengan aksen Caveat, margin sejajar, dan tata letak responsif yang sudah ditinjau. Gunakan foto yang diberikan pemilik pada area inspirasi yang relevan.

StyleFit memakai tampilan editorial fashion yang menonjolkan pakaian dan keputusan pengguna. Produk terasa personal, jelas, dan ringan untuk HP. Bahasa antarmuka adalah Bahasa Indonesia yang singkat dan tidak menghakimi bentuk tubuh.

Palet terinspirasi suasana hujan dan matahari pada [Sunshine Through the Rain](https://www.netflix.com/id-en/title/83112494). Gunakan biru kabut `#EFF3F7` untuk latar, putih hangat `#FFFDF8` untuk permukaan, dan biru gelap `#2C4B68` untuk kontrol aktif. Kuning madu `#FFDA91` muncul di judul dan tombol utama hero. Jaga kontras teks dan indikator fokus di atas foto.

Judul memakai Georgia dengan aksen Caveat untuk nuansa tulisan tangan. Kontrol dan isi memakai font sistem. Foto bertema Sunrise Through the Rain Concept Idea dari pemilik dipakai pada hero serta keadaan kosong di stylist. Preview outfit pengguna tetap memakai ilustrasi kategori dan warna berlabel.

## Landing interaktif

Hero memakai lebar dan margin yang sama dengan navigasi dan demo. Foto berada di sebelah kanan judul pada desktop, lalu di bawah aksi utama pada HP. Foto tampil secara utuh dengan rasio asli. Bingkai foto bergerak singkat ketika muncul dan tampil diam saat reduced motion aktif. Demo berada tepat setelah hero, dengan preview dan kontrol berdampingan pada desktop dan bertumpuk pada HP.

Contoh pesan: **Gaya yang kamu suka, dari baju yang kamu punya.** CTA utama: **Coba stylist**. Tautan eksplorasi boleh menggulir ke demo, tetapi tidak menggantikan CTA menuju alur yang berfungsi.

Urutan isi:

1. Navigasi, foto editorial, dan ajakan mencoba.
2. Demo berlabel dengan kontrol gaya, cuaca, dan pakaian.
3. Penjelasan singkat cara memakai stylist.

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

- Stylist memakai dua kolom seimbang pada desktop. Foto inspirasi tampil sebelum ada outfit. Setelah kombinasi dibuat, pengguna dapat memilih alternatif yang tampil di preview. Di HP, tautan dari form membawa pengguna langsung ke judul hasil. Hasil lama dibersihkan saat data yang mendasarinya berubah.
- Item pakaian memperlihatkan gambar, kategori, warna, status dimiliki, dan tindakan yang relevan.
- Hasil outfit memperlihatkan kombinasi, alasan, kebutuhan tambahan, serta visual yang tersedia. Harga belum diketahui ditulis apa adanya.
- Form memiliki label, satuan, validasi dekat field, dan data yang tetap ada setelah kegagalan yang dapat dipulihkan.
- Area kosong membantu tindakan berikutnya. Loading nyata menunjukkan proses; error memberi cara mencoba lagi atau memakai jalur manual.
- Gambar gagal memiliki fallback yang informatif. Kegagalan 3D mempertahankan rincian outfit 2D.
- Pilihan yang terkunci memiliki indikator teks atau state aksesibilitas, bukan warna saja.

## Aksesibilitas dan bukti visual

Gunakan elemen semantik, focus terlihat, label yang terhubung, alt text yang menjelaskan item, dan area sentuh minimal 44 px untuk kontrol utama. Uji desktop serta lebar 360 px dan 390 px tanpa isi penting terpotong. Konten dinamis diumumkan seperlunya tanpa memindahkan fokus secara mengejutkan.

Sebelum menyerahkan perubahan UI, coba tugas L01 sampai L06 pada PRD, U20 dan U21 pada TESTING, serta skenario fitur terkait. Simpan bukti screenshot atau rekaman tanpa data pribadi jika alat tersedia. Jangan menyebut aksesibilitas atau performa sudah lulus berdasarkan inspeksi kode saja.
