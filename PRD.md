# StyleFit AI Product Requirements

Versi 1.3, 21 November 2026. Visi fitur dipertahankan; pemilik memilih mesin rekomendasi buatan sendiri tanpa model lokal atau API. Landing dan stylist guest awal telah diimplementasikan. Hosting/domain serta penerimaan pengguna diputuskan terpisah.

## Tujuan produk

Membantu orang menentukan outfit yang ingin dipakai dengan menghubungkan inspirasi, isi lemari, aktivitas, cuaca, proporsi tubuh, dan bujet tambahan. Pengguna dapat memulai dari kebutuhan harian atau gaya karakter K-drama. Keberhasilan utama adalah outfit yang dipilih dan benar-benar dipakai, bukan jumlah gambar yang dihasilkan.

Pengguna utama memiliki pakaian terbatas, kesulitan memadukannya, dan tertarik pada inspirasi visual. Pengguna perjalanan ingin mengurangi kebingungan serta jumlah barang bawaan. Guest harus dapat mengenali manfaat sebelum login atau scan.

## Scope yang dikunci

Target Rp0 berarti tidak ada langganan layanan aplikasi atau API berbayar yang wajib. Rekomendasi inti memakai mesin aturan TypeScript buatan sendiri. Tidak ada inference lokal, cloud, atau API key yang dibutuhkan. Analisis screenshot dan photo try-on tetap fitur lanjutan yang belum tersedia; pilihan model harus dievaluasi terpisah sebelum integrasi. Penggunaan perangkat sendiri tetap memakai listrik, internet, ruang disk, dan waktu pengerjaan. Fitur penuh, terutama photo try-on, memerlukan pembuktian hardware, kualitas, dan lisensi; target biaya tidak menjadi klaim semua fitur sudah siap.

Identifier F01 sampai F15 mempertahankan konsep versi 1.0. F00 adalah kebutuhan baru dari pemilik.

| ID | Modul | Perilaku inti |
| --- | --- | --- |
| F00 | Landing interaktif | Pengunjung mencoba kombinasi dari data demo dan meneruskannya ke stylist |
| F01 | Guest dan akun | Eksplorasi tanpa login; simpan lintas perangkat melalui akun dengan pemindahan data guest yang jelas |
| F02 | Profil dan scan opsional | Preferensi, kegiatan, ukuran yang diberikan, landmark serta perkiraan yang bisa dikoreksi; jalur manual tetap tersedia |
| F03 | Lemari digital | Foto atau input manual; koreksi atribut; status tersedia; ubah dan hapus item |
| F04 | K-Drama Explorer | Drama/karakter terkurasi, sumber, interpretasi gaya, adaptasi; referensi tidak dikenal memiliki jalur lanjut |
| F05 | Screenshot dan video | Pilih orang/frame, analisis atribut terlihat, koreksi hasil, tandai detail tidak diketahui |
| F06 | Auto-style | Sampai tiga alternatif, prioritaskan lemari, ganti bagian tertentu sambil mempertahankan item terkunci |
| F07 | Penilaian dan ukuran | Penjelasan per aspek; panduan ukuran hanya dengan data tubuh dan produk yang cukup |
| F08 | Avatar 3D | Parameter manual, rotasi, zoom, perbandingan, layering; model spesifik dan serupa dibedakan |
| F09 | Photo try-on | Preview foto dengan penjelasan pemrosesan; bandingkan, simpan, hapus |
| F10 | Rambut | Referensi dan aset rambut, warna, preferensi serta kebutuhan perawatan |
| F11 | Belanja dan wishlist | Produk terkurasi, harga dan waktu pemeriksaan, tambahan biaya, tautan produk/pencarian dan affiliate berlabel |
| F12 | Perjalanan dan packing | Outfit per kegiatan, penggunaan ulang, hitungan barang unik, layering, cuaca atau informasi musiman berlabel |
| F13 | Lookbook dan umpan balik | Simpan koleksi, tandai dipakai/ditolak, alasan serta perubahan preferensi |
| F14 | Privasi | Tujuan dan retensi per jenis media, kontrol data, otorisasi, serta penghapusan yang dijelaskan |
| F15 | Admin konten | Kelola referensi, sumber, atribut, produk, harga, tautan, dan aset; nonaktifkan konten bermasalah |

Draft guest pada tahap awal disimpan di memori browser selama navigasi aplikasi, tanpa penyimpanan permanen foto atau profil. UI menjelaskan bahwa muat ulang atau menutup tab dapat menghilangkan draft dan menjelaskan apakah akun untuk menyimpan sudah tersedia. Pada build guest awal, akun belum tersedia; jangan menampilkan tombol login yang tidak berfungsi. Pemindahan ke akun dilakukan setelah pilihan pengguna dan tidak menggandakan item saat diulang.

Rekonstruksi otomatis pakaian 3D dari sembarang gambar tetap berada pada jalur riset F08. Pemetaan gambar ke template tidak diklaim sebagai rekonstruksi persis. Fitur tahap lanjut tetap masuk visi walaupun belum tersedia pada rilis awal.

## F00 Landing page yang dapat dicoba

Pengunjung harus dapat memahami manfaat melalui tindakan nyata. Pengalaman inti adalah memilih gaya serta konteks, melihat outfit contoh berubah, lalu melanjutkan pilihan itu ke alur stylist.

| ID | Kriteria penerimaan |
| --- | --- |
| L01 | Pilih setidaknya dua gaya dan dua konteks cuaca; item atau cara styling pada preview berubah sesuai fixture yang dipilih |
| L02 | Pilih alternatif item; bagian lain yang tetap dipilih tidak berubah tanpa alasan yang ditampilkan |
| L03 | Label Demo contoh terlihat; tidak ada klaim scan, inferensi nyata, harga live, atau stok terverifikasi |
| L04 | CTA Coba stylist membuka alur yang berfungsi dan membawa pilihan demo yang masih valid; tidak berakhir pada tombol mati |
| L05 | Demo bekerja tanpa login, API key, unggahan foto, serta panggilan berbayar; memuat ulang memakai default atau state tersimpan yang valid |
| L06 | Keyboard dan sentuhan dapat menjalankan interaksi; reduced motion menjaga fungsi; tata letak bekerja mulai lebar 360 px |

Animasi dipakai untuk perpindahan pilihan dan umpan balik. Avatar berputar, paralaks, atau animasi scroll boleh ditambahkan ketika mendukung pemahaman dan performa; semuanya tidak menggantikan interaksi L01 sampai L06.

## Alur inti aplikasi

1. Pilih inspirasi atau kegiatan; referensi bersifat opsional.
2. Masukkan preferensi, cuaca, bujet tambahan, dan barang yang ingin digunakan.
3. Periksa atribut pakaian dan koreksi bila perlu.
4. Bandingkan outfit serta rincian dimiliki/perlu ditambahkan.
5. Ganti item atau lihat visualisasi yang didukung.
6. Simpan, tandai dipakai, atau lanjutkan ke produk pelengkap dan perjalanan.

Alternatif hasil: Dari lemariku, Tambahan minimal, dan Dekati inspirasiku ketika referensi ada. Tidak perlu mengeluarkan tiga hasil jika data atau batas pengguna tidak memungkinkan. Pengguna tanpa isi lemari memperoleh inspirasi umum yang diberi konteks, tanpa klaim barang itu sudah dimiliki.

## Aturan produk yang wajib dipertahankan

- Barang dimiliki berasal dari lemari yang tersedia; AI tidak boleh mengarang kepemilikan, produk, sumber drama, atau merek.
- Hitung tambahan belanja, bukan harga seluruh lemari. Harga tidak diketahui adalah nilai kosong, bukan nol; ongkir yang belum diketahui dipisahkan.
- Label memenuhi bujet hanya berlaku jika semua pembelian wajib memiliki harga yang dapat dipakai dan totalnya memenuhi batas.
- Pertahankan item terkunci dan gunakan atribut terbaru setelah koreksi. Bila mustahil, jelaskan kendala sebelum menawarkan pelonggaran.
- Referensi terverifikasi, Terinspirasi karakter, Produk serupa, model pakaian spesifik, dan model pakaian serupa memiliki label yang berbeda.
- Preview visual tidak menjamin ukuran akan pas. Ukuran membutuhkan data tubuh dan produk; bahan, ketebalan, serta detail tertutup perlu konfirmasi.
- Profil tidak memerlukan foto tubuh, berat badan, atau gender yang ditebak dari foto. Preferensi pengguna dapat mengoreksi analisis.
- Prakiraan cuaca dibedakan dari informasi musiman; packing menghitung barang unik berdasarkan identitas item.
- Kehilangan visualisasi tidak menghilangkan rincian outfit yang sudah berhasil. Kegagalan AI memiliki status dan pemulihan.
- Foto sementara, media yang disimpan, parameter avatar, serta hasil memiliki tujuan dan retensi berbeda. Klaim zero storage mengikuti alur nyata, termasuk provider.

## Rilis dan pengukuran

Urutan implementasi ada di ROADMAP. Rilis uji pertama memuat landing, lemari manual guest dalam memori, serta rekomendasi 2D berbasis aturan. Akun, penyimpanan permanen, referensi screenshot, dan belanja menyusul setelah kriteria masing-masing lulus; analisis screenshot bukan prasyarat agar stylist dasar bekerja. Rilis lengkap hanya mengumumkan modul yang benar-benar tersedia dan teruji.

Ukur waktu sampai memilih, penyelesaian tanpa bantuan, alasan penolakan, pemakaian outfit setelah sesi, penggunaan ulang lemari, keberhasilan proses, latensi, dan biaya per hasil termasuk retry. Angka target ditetapkan dari pengukuran awal sebelum keputusan rilis; belum ada hasil atau angka yang diklaim tercapai.

Penerimaan memakai TESTING. Menyukai demo, tes otomatis lulus, dan penerimaan pengguna adalah bukti yang berbeda.

## Cakupan mesin aturan awal

Mesin menerima maksimal 40 item dengan identifier unik, kategori atasan/bawahan/sepatu/outer, warna, gaya, konteks cuaca, ketersediaan, asal, dan harga bila diketahui. Gaya casual/smart casual dan konteks tropis/sejuk adalah pilihan manual. Tropis memakai atasan, bawahan, sepatu; sejuk menambahkan outer ringan, bukan jaminan perlengkapan winter. Konteks tersebut bukan prakiraan cuaca.

Mesin menyaring atribut dan item terkunci, mengutamakan barang lemari, lalu mengurutkan sampai tiga kombinasi berbeda secara deterministik. Aturan warna awal hanya preferensi kesederhanaan warna; ini bukan skor kecocokan tubuh atau model yang telah dilatih. Alasan berasal dari aturan yang benar-benar diterapkan. Koreksi atau penghapusan membuat hasil lama tidak berlaku.

Build awal tidak memiliki produk belanja; seluruh item manual adalah barang yang dinyatakan dimiliki pengguna, sehingga tambahan belanja Rp0. Aturan harga katalog dan harga tidak diketahui memiliki tes domain untuk integrasi berikutnya, tetapi tidak diklaim sebagai katalog yang sudah tersedia. Inspirasi K-drama hanya boleh berasal dari koleksi yang memiliki sumber; belum ada katalog drama pada build ini.
