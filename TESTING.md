# StyleFit AI Testing

Acuan pengujian aplikasi versi konsep 1.3. Skenario awal dipertahankan; U20-U21/P15 mencakup landing, U22/P16 mencakup admin, dan U23/P17 memeriksa perilaku tanpa layanan berbayar.

**Status saat ini:** landing dan stylist guest sudah tersedia. Tes konfigurasi/domain dan pemeriksaan build lokal sudah dijalankan; bukti browser serta cakupan tepat dicatat pada RELEASE_REVIEW.md. UAT pengguna dan penerimaan pemilik belum dilakukan. Status setiap sesi dicatat terhadap build aktual. Jangan menggunakan passing pemeriksaan dokumen atau konfigurasi sebagai hasil testing aplikasi.

## Pemeriksaan otomatis dan review kode

Script nyata untuk lint, typecheck, test, build, serta browser tersedia; jalankan sesuai petunjuk README. CI harus menjalankan pemeriksaan yang tersedia, tanpa menyamarkan pemeriksaan yang dilewati sebagai lulus.

- Aturan domain: harga tidak diketahui, total tambahan, barang dimiliki, item terkunci, kendala yang mustahil, dan identitas barang packing.
- Integrasi: validasi keluaran provider, akses akun, retry dan duplikasi, koreksi input terbaru, serta penghapusan saat pekerjaan berjalan.
- Alur browser: interaksi demo dan CTA, lemari sampai outfit tersimpan, serta skenario fitur yang diaktifkan.
- UI: HP/desktop, keyboard, reduced motion, loading, kosong, gagal, dan pemulihan.
- Model nyata mendatang: evaluasi terpisah dari fixture dengan endpoint/model, data yang boleh diproses, jumlah percobaan, waktu, memori, dan keterbatasan tercatat. Tidak ada panggilan layanan berbayar.

Pemeriksaan konfigurasi yang sudah dapat dijalankan: `node scripts/check-zero-budget.mjs` dan `node --test scripts/check-zero-budget.test.mjs`. Tes mencakup penolakan konfigurasi cloud/berbayar, kerahasiaan nilai key pada laporan error, serta lokasi media privat. Hasilnya tidak menguji jalur jaringan aplikasi atau inference; itu tetap kewajiban integrasi fitur.

Vitest menguji aturan domain dan Playwright menguji alur browser aktif. Tes akun/admin/packing/provider ditambahkan ketika alurnya tersedia, bukan diberi passing palsu sekarang.

## Status hasil

Gunakan Belum diuji, Lulus, Gagal, Terblokir, atau Belum tersedia. Skenario yang memerlukan fitur tahap lanjut diberi Belum tersedia pada build awal. Review kode memeriksa diff dan kode terkait; tes pengguna menilai manfaat dan pemahaman. Keduanya tidak saling menggantikan.

## Peta fitur tahap dan pengujian

Setiap rilis hanya menuntut skenario untuk bagian fitur yang aktif. Satu fitur yang bertahap tidak dianggap lengkap hanya karena bagian awalnya lulus. Selain skenario di tabel, jalankan pengujian kegagalan serta pemulihan yang relevan.

| Fitur | Tahap | Skenario pengguna | Kriteria PO |
| --- | --- | --- | --- |
| F00 | 0 | U20, U21 | P15 |
| F01 | 1 | U01, U09 | P01 |
| F02 | 1 manual, 4 scan | U01, U11 | P02, P12 |
| F03 | 1 | U02, U03, U19 | P02, P12 |
| F04 | 2 | U05, U06 | P03 |
| F05 | 2 screenshot, 5 video | U06, U07, U15, U23 | P04, P17 |
| F06 | 1, diperluas 2 | U03, U04, U23 | P05, P17 |
| F07 | 1 penjelasan, 3 ukuran | U08, U12 | P06, P07 |
| F08 | 3 | U10 | P08 |
| F09 | 4 | U13, U19, U23 | P09, P12, P17 |
| F10 | 4 | U14 | P09 |
| F11 | 2 | U08, U09 | P06, P13 |
| F12 | 5 | U16, U17 | P10, P11 |
| F13 | 1 | U09, U18 | P01 |
| F14 | Semua tahap yang memproses data pribadi | U01, U09, U19 | P12 |
| F15 | 1 dasar, 2 referensi dan produk | U22 | P03, P13, P16 |

P14 berlaku pada seluruh UI yang aktif. P12 juga berlaku pada endpoint admin dan pekerjaan guest ketika fitur tersebut tersedia. P17 berlaku pada seluruh integrasi layanan; melewati skrip konfigurasi saja belum memenuhi P17.

## Skenario pengujian pengguna

### Persiapan sesi

Catat build, URL, perangkat, browser, tanggal, tahap tersedia, dan kode peserta. Pakai akun khusus testing serta foto yang memang boleh diproses. Untuk analisis tubuh, rambut, dan photo try-on, peserta dapat menolak unggahan dan menguji jalur manual.

Data latihan dapat memakai kemeja putih, kaus polos, celana hitam, dan sneakers. Bujet serta harga fixture hanya untuk testing dan diberi label. Gunakan referensi berkualitas jelas, referensi buram, dan judul drama yang tidak ada di koleksi.

Jelaskan tujuan tugas, lalu biarkan peserta mencoba tanpa petunjuk tombol. Catat bagian yang memerlukan bantuan. Bila perlu bantuan untuk menyelesaikan tugas, hasil teknis bisa diperiksa tetapi hambatan penggunaan tetap dicatat.

### Tugas pengguna

| Kode | Tugas | Hasil yang diperiksa |
| --- | --- | --- |
| U01 | Coba rekomendasi tanpa akun dan tanpa foto tubuh | Ada jalur guest dan manual yang bisa diselesaikan |
| U02 | Tambahkan beberapa pakaian lalu koreksi warna atau kategori yang salah | Data berubah dan tampil kembali dengan benar |
| U03 | Buat outfit untuk satu kegiatan memakai barang sendiri | Status dimiliki tepat; barang yang belum ada tidak diklaim tersedia |
| U04 | Pertahankan satu item lalu ganti item lain | Pilihan yang dipertahankan tetap sama |
| U05 | Pilih drama atau karakter terkurasi dan adaptasikan gayanya | Ciri gaya, asal referensi, dan adaptasi dapat dipahami |
| U06 | Cari drama yang tidak dikenal dan unggah screenshot buram | Tidak ada sumber yang dikarang; tersedia langkah koreksi |
| U07 | Periksa screenshot, pilih orang yang dimaksud, dan perbaiki rincian | Koreksi memengaruhi rekomendasi berikutnya |
| U08 | Tetapkan bujet tambahan dan periksa produk pelengkap | Tambahan belanja terpisah dari barang sendiri; harga tak diketahui terlihat |
| U09 | Simpan look, masuk ke akun, lalu buka ulang | Penyimpanan dan perpindahan data sesuai penjelasan |
| U10 | Atur avatar, putar, bandingkan pakaian, dan ubah layering | Kontrol bekerja; model serupa dapat dibedakan dari model spesifik |
| U11 | Lewati scan, lalu coba scan bila bersedia dan koreksi hasil | Scan opsional; perubahan parameter tersimpan sesuai pilihan |
| U12 | Minta panduan ukuran untuk produk dengan dan tanpa size chart | Panduan hanya muncul ketika data cukup |
| U13 | Buat photo try-on lalu hapus hasil tersimpan | Pemrosesan dijelaskan; hasil bisa dibandingkan dan dihapus sesuai cakupan |
| U14 | Pilih rambut dan warna berdasarkan preferensi | Preview dan kebutuhan penataan dipahami tanpa klaim hasil pasti |
| U15 | Unggah klip pendek lalu pilih frame untuk analisis | Frame yang dipilih menjadi input; batas file dan kegagalan terbaca |
| U16 | Susun perjalanan dengan outfit yang memakai ulang barang | Packing menghitung barang unik dan jumlah bawaan |
| U17 | Pilih perjalanan di luar jangkauan prakiraan | Informasi musiman dibedakan dari prakiraan |
| U18 | Tandai outfit dipakai atau ditolak dan berikan alasan | Umpan balik tercatat; pengguna dapat mengubah preferensi |
| U19 | Hapus item atau foto tersimpan dan periksa penjelasan penghapusan | Data yang dimaksud hilang dari tampilan dan status proses sesuai kebijakan |
| U22 | Sebagai admin tambah, ubah, dan nonaktifkan konten; ulangi akses dan permintaan perubahan sebagai akun biasa | Perubahan admin diterapkan; data yang dinonaktifkan tidak menjadi rekomendasi baru; akses serta perubahan akun biasa ditolak server |
| U23 | Jalankan rekomendasi dasar tanpa service model atau API key; untuk integrasi vision mendatang simulasikan provider gagal | Mesin aturan tetap menghasilkan kombinasi dari data manual; vision yang gagal memiliki status jujur tanpa fallback berbayar atau fixture yang diklaim inference |

Setelah tugas, tanyakan: Apakah ada outfit yang ingin kamu pakai? Apa yang masih harus kamu cari sendiri? Apakah visual membantu memilih? Item mana yang ingin kamu ganti dan mengapa? Catat jawaban, bukan hanya penilaian suka atau tidak suka.


### Pengujian landing interaktif

| Kode | Tugas | Hasil yang diperiksa |
| --- | --- | --- |
| U20 | Ubah gaya dan cuaca pada demo, ganti satu item, pertahankan pilihan, lalu lanjutkan ke stylist | Preview benar-benar berubah sesuai fixture; pilihan yang dipertahankan konsisten; label demo terlihat; CTA membuka alur dan membawa pilihan valid |
| U21 | Jalankan demo dengan keyboard dan sentuhan pada lebar 360 px atau 390 px, kemudian aktifkan reduced motion | Semua kontrol tetap bisa dipakai; focus dan pilihan terbaca; tidak ada isi penting terpotong; fungsi tetap tersedia tanpa animasi |

## Kriteria penerimaan Product Owner

Kriteria berlaku pada fitur yang diaktifkan untuk rilis tersebut. Semua hasil memerlukan bukti pada build yang diuji.

| Kode | Cakupan | Kriteria penerimaan |
| --- | --- | --- |
| P01 | F01 dan F13 | Guest dapat mencoba; login dan simpan tidak menghilangkan pilihan yang dipindahkan atau mencampur akun |
| P02 | F02 dan F03 | Data profil dan atribut item dapat dikoreksi; scan tidak menjadi syarat rekomendasi dasar |
| P03 | F04 dan F15 | Referensi terverifikasi punya sumber; judul tidak dikenal tidak menghasilkan episode atau merek fiktif |
| P04 | F05 | Orang atau frame yang dianalisis sesuai pilihan; detail tak terlihat tidak dinyatakan pasti |
| P05 | F06 | Batas wajib dipatuhi atau ketidakmampuan dijelaskan; item yang dipertahankan tidak berubah |
| P06 | F07 dan F11 | Total memakai harga yang tersedia dengan hitungan benar; harga tak diketahui tidak dianggap nol |
| P07 | F07 | Panduan ukuran menyebut data yang dipakai dan tidak muncul sebagai kepastian ketika data kurang |
| P08 | F08 | Model spesifik dan serupa berlabel; aset yang didukung dapat dibandingkan dan tidak mengalami tembus atau hilang yang menghalangi penilaian |
| P09 | F09 dan F10 | Preview berfungsi pada cakupan yang diumumkan; perbedaan visual dan kegagalan dapat dilaporkan |
| P10 | F12 | Satu barang yang dipakai pada beberapa hari tidak dihitung sebagai beberapa barang berbeda; jumlah yang sengaja ditambah tetap dihitung |
| P11 | F12 | Prakiraan dan informasi musiman dibedakan; layering dikaitkan dengan konteks yang dimasukkan |
| P12 | F14 | Media, parameter, dan catatan proses mengikuti tujuan serta retensi yang dijelaskan; akses antar akun ditolak |
| P13 | F11 dan F15 | Tautan produk dan pencarian dibedakan; affiliate ditandai; produk rusak dapat dinonaktifkan |
| P14 | Semua fitur aktif | Alur utama dapat digunakan di HP; tombol, label, pesan gagal, dan akses keyboard dapat dipahami serta dioperasikan |
| P15 | F00 | L01-L06 pada PRD terpenuhi; demo tidak memanggil provider berbayar dan tidak mengklaim fixture sebagai inferensi atau harga live |
| P16 | F15 | Admin dapat mengelola konten yang aktif pada tahap tersebut; pengguna biasa tidak dapat mengambil role atau mengubah konten melalui endpoint langsung |
| P17 | Seluruh integrasi layanan | Baseline tidak membutuhkan akun billing/API berbayar; inti tidak membutuhkan model/API dan tidak beralih ke layanan berbayar; verifikasi dilakukan pada jalur aplikasi yang sebenarnya |

### Pengujian kegagalan dan pemulihan

- Masukkan file salah format, terlalu besar, buram, dan berisi beberapa orang. Sistem menolak atau meminta pilihan tanpa kehilangan data yang sudah diisi.

- Coba lemari kosong dan batas bujet yang tidak mungkin dipenuhi. Sistem menjelaskan kendala serta menawarkan langkah lanjut.

- Simulasikan harga atau tautan yang sudah tidak berlaku. Hasil tidak mengklaim informasi itu masih pasti.

- Simulasikan layanan AI lokal gagal, timeout, koneksi putus, dan permintaan berulang. Status pekerjaan dapat diperiksa; simpan tidak menggandakan outfit, resource terkendali, dan tidak ada fallback layanan berbayar.

- Simulasikan aset 3D tidak tersedia atau gagal dimuat. Rincian outfit tetap terbaca.

- Periksa akses objek milik akun uji lain. Foto, profil, lemari, dan outfit pribadi tidak dapat dibaca atau diubah.

- Jalankan penghapusan data sesuai alur dan periksa penyimpanan serta pekerjaan yang masih tertunda.

- Coba pemulihan cadangan di lingkungan uji sebelum mengandalkannya untuk data production.

- Ulangi impor draft guest yang sama dan perpindahan akun. Tidak ada item ganda atau data akun sebelumnya terbuka. Coba reload sebelum login; batas kehilangan draft sudah dijelaskan, dan tidak ada foto pribadi tersisa di penyimpanan browser permanen.

- Pada landing, masukkan identifier query yang tidak dikenal dan buat semua item terkunci sebelum mengganti preset. Nilai salah kembali ke keadaan valid; item terkunci tidak dibuka otomatis dan kendala dijelaskan.

## Pencatatan hasil dan keputusan rilis

Satu catatan hasil memuat kode skenario, build, kode peserta atau penguji, perangkat, langkah, hasil aktual, status, bukti, dan tindak lanjut. Gunakan kode peserta agar lembar hasil tidak memuat data tubuh atau foto pribadi yang tidak diperlukan.

| Skenario dan build | Hasil aktual dan bukti | Status | Tindak lanjut |
| --- | --- | --- | --- |
| Diisi saat sesi | Catat tindakan, hambatan, dan bukti yang relevan | Belum diuji | Catat perbaikan atau pengujian ulang |

### Ukuran manfaat

Indikator utama adalah peserta yang memilih dan kemudian benar-benar memakai setidaknya satu outfit rekomendasi. Pemilihan dapat dicatat saat sesi; pemakaian dicatat melalui tindak lanjut setelah pengguna memiliki kesempatan memakai outfit.

Indikator pendukung mencakup waktu sampai memilih, tugas yang selesai tanpa bantuan, alasan penolakan, penggunaan ulang lemari, dan apakah visualisasi membantu keputusan. Product Owner juga mencatat tingkat keberhasilan proses, latensi, dan biaya per hasil yang berhasil beserta pengulangan. Ambang kinerja dan batas biaya ditetapkan setelah pengukuran awal dan sebelum keputusan rilis.

### Keputusan rilis

Rilis tahap tertentu dapat dilanjutkan ketika semua skenario wajib untuk fitur aktif telah diuji, kriteria kritis lulus, dan temuan yang tersisa dicatat. Masalah akses data, kehilangan data, hitungan belanja keliru, atau alur inti yang tidak dapat diselesaikan menghalangi rilis. Temuan kecil dapat diterima oleh pemilik proyek dengan alasan dan tindak lanjut yang tercatat.

Pengembang menjalankan pemeriksaan teknis; pengguna menilai keterpakaian hasil; Product Owner memutuskan penerimaan. Pada solo project, pengembang dan PO dapat orang yang sama, tetapi bukti penggunaan tetap berasal dari sesi pengguna.

Keputusan dicatat sebagai Lanjut rilis, Perbaiki lalu uji ulang, atau Tunda fitur tertentu. Persetujuan konsep versi 1.0 tidak berarti aplikasi sudah lolos pengujian atau siap go-live.


## Build guest berbasis aturan

Cakupan aktif adalah F00 penuh, serta bagian guest/manual F01/F03/F06/F07/F14. U20-U21 dapat diuji lengkap pada build ini. U01-U04 dan U19 hanya bagian tanpa akun/media. U09 lintas akun, U05 drama, U08 produk, dan modul model/3D/admin/perjalanan belum tersedia. Hasil otomatis dicatat di RELEASE_REVIEW; status sesi pengguna tetap Belum diuji sampai pemilik atau peserta benar-benar mencoba.
