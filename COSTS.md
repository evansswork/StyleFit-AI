# Baseline biaya layanan Rp0

Versi 1.3, diperiksa 21 November 2026. Pemilik memilih mesin styling sendiri tanpa model lokal. Arahan pemilik adalah memakai alternatif gratis untuk layanan berbayar. Hosting dan domain diputuskan terpisah; tidak ada kewajiban Vercel dan tidak ada pembelian yang dilakukan.

Rp0 berarti tidak ada langganan layanan aplikasi atau biaya per panggilan API yang wajib. Perangkat, listrik, internet, disk, serta waktu membuat aset tetap digunakan. Server yang selalu online dan kapasitas GPU tidak otomatis gratis hanya karena software-nya gratis.

## Penggantian yang diterapkan pada fondasi

| Rancangan sebelumnya | Baseline sekarang | Batas dan kesiapan |
| --- | --- | --- |
| Gemini/Ollama untuk rekomendasi | Mesin aturan TypeScript sendiri | Aktif; tidak memerlukan model, API key, GPU, atau layanan inference |
| FASHN API per gambar | Belum diaktifkan atau dipilih | Try-on bukan fungsi mesin aturan; evaluasi terpisah sebelum tersedia |
| Database terkelola berbayar | PostgreSQL lokal, Drizzle, Better Auth | The dedicated local StyleFit database and test database are configured |
| Object storage SaaS | Volume privat pada komputer/server sendiri | Akses lewat endpoint terotorisasi; perlu backup serta disk persisten |
| Redis SaaS dan BullMQ | pg-boss pada PostgreSQL aplikasi | Menghindari service Redis tambahan; dipasang saat antrean diperlukan |
| Layanan email berlangganan | Mailpit lokal untuk development; SMTP yang sudah tersedia untuk publik | Mailpit bukan layanan pengiriman ke pengguna nyata |
| Paket API cuaca komersial | Input manual; MET Norway untuk otomatisasi | Cache, identifikasi aplikasi, atribusi, dan batas penggunaan wajib dipenuhi |
| Aset/generator 3D berbayar | Blender, aset original atau berizin, rendering browser | Pembuatan aset dan benchmark tetap pekerjaan nyata |
| Hosting khusus Vercel | Node.js pada server yang nanti dipilih | Hosting belum dipilih atau dibeli |

`PAID_SERVICES_ENABLED=false`, `STYLING_ENGINE=rules`, dan `AI_PROVIDER=none`. Tidak ada key atau endpoint inference di contoh konfigurasi. Jalankan `node scripts/check-zero-budget.mjs` serta tesnya. Pemeriksaan konfigurasi tidak menyalakan model, tidak melakukan inference, dan tidak menjamin batas biaya hosting.

## Mesin sendiri dan batasnya

Rekomendasi awal menggunakan kode aturan, bukan model bahasa yang dilatih sendiri. Masukan manual kategori, warna, gaya, cuaca, dan item terkunci menghasilkan maksimal tiga kombinasi. Menjalankan rekomendasi tidak membutuhkan GPU atau panggilan API. Server web tetap memakai resource hosting ketika online.

Analisis screenshot dan judul/karakter drama sembarang tidak tercipta otomatis dari mesin aturan. Referensi drama memerlukan koleksi bersumber; membaca gambar memerlukan evaluasi model terpisah. API free tier berpotensi dipakai nanti, tetapi belum dipilih, dipasang, atau diberi credential. Model lokal bukan lagi prasyarat atau default proyek.

## Screenshot analysis provider review, 22 November 2026

- Gemini Developer API lists no-charge image input for some models. Google’s unpaid-service terms allow improvement use and human review and instruct customers to exclude sensitive, confidential, and personal data. Keep it out of the public upload flow. [Pricing](https://ai.google.dev/gemini-api/docs/pricing) · [Unpaid data terms](https://ai.google.dev/gemini-api/terms#unpaid-services)
- Cloudflare Workers AI Gemma 4 26B is the first candidate for a screenshot-only benchmark. The hosted model advertises vision and an Apache 2.0 model license. Workers Free allocates 10,000 neurons per day and requests fail when the plan limit is reached. Stateless inference has a no-training and zero-retention policy subject to documented exceptions. The REST API works independently of the application’s eventual hosting provider. [Model](https://developers.cloudflare.com/workers-ai/models/gemma-4-26b-a4b-it/) · [License](https://gemma.ai/resources/apache-2/) · [Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) · [Data usage](https://developers.cloudflare.com/workers-ai/platform/data-usage/)

The review is based on documentation. A live Free-plan test with synthetic or licensed fixtures is still required to verify image payload support, usable category and color outputs, actual neuron use, and latency. Check low light, multiple people, covered garments, invalid outputs, and rate-limit recovery. Keep uploads disabled until those checks pass. Do not send profile or biometric media, enable paid fallback, or use stateful uploads for this evaluation.

## Photo try-on belum menjadi fitur gratis yang siap

Model inti [FASHN VTON 1.5](https://huggingface.co/fashn-ai/fashn-vton-1.5) berlisensi Apache 2.0; model card menyebut kebutuhan sekitar 8 GB VRAM dan merekomendasikan GPU khusus. Itu bukan bukti kecepatan atau dukungan MPS pada Mac ini.

Pipeline memakai [FASHN Human Parser](https://huggingface.co/fashn-ai/fashn-human-parser), yang mewarisi [lisensi SegFormer](https://github.com/NVlabs/SegFormer/blob/master/LICENSE). Bagian pembatasan penggunaan lisensi tersebut menyebut penggunaan nonkomersial untuk penelitian/evaluasi. Karena itu, label Apache pada model inti tidak cukup untuk menyatakan seluruh pipeline siap digunakan produk komersial.

T41 kelak harus memilih pipeline yang seluruh komponen serta weights-nya cocok untuk penggunaan yang dituju, lalu membuktikan kualitas dan resource. Bila perlu mengganti parser, itu pekerjaan integrasi dan evaluasi tersendiri. Sampai syarat ini terpenuhi, F09 tetap dalam visi tetapi tidak dinyatakan tersedia. Tidak ada fallback FASHN API berbayar atau janji semua fitur generatif berjalan cepat dengan biaya nol.

## Antrean email dan cuaca

[pg-boss](https://github.com/timgit/pg-boss) menyediakan antrean berbasis PostgreSQL berlisensi MIT. Gunakan worker pada komputer/server yang sama ketika diperlukan; hosting proses worker tetap memakai resource server.

[Mailpit](https://github.com/axllent/mailpit) adalah alat SMTP pengujian lokal berlisensi MIT. Pengujian akun memakai kotak masuk lokal. Akun publik belum diaktifkan sampai pengiriman email, verifikasi, dan pemulihan benar-benar bekerja. Jika hosting menyediakan SMTP tanpa biaya tambahan, verifikasi kuota dan ketentuannya sebelum dipakai.

[MET Norway Locationforecast](https://api.met.no/weatherapi/locationforecast/2.0/documentation) menyediakan prakiraan global sekitar sembilan hari. Ikuti [ketentuan penggunaan](https://api.met.no/doc/TermsOfService) dan [lisensi data](https://api.met.no/doc/License): panggil dari server dengan User-Agent pengenal, cache sesuai freshness, serta atribusi sumber. Data di luar horizon tetap informasi musiman atau input pengguna, bukan prakiraan yang dikarang.

## Domain murah dan hosting

Domain adalah alamat; hosting adalah mesin yang menjalankan aplikasi. Keduanya boleh dari penyedia yang sama atau berbeda. Harga berikut adalah penawaran publik saat diperiksa, belum merupakan checkout, belum membuktikan nama tersedia, dan belum menjamin total termasuk pajak.

| Pilihan | Registrasi yang ditampilkan | Perpanjangan yang ditampilkan | Sumber |
| --- | --- | --- | --- |
| .my.id | Rp9.900 per tahun, promo | Rp25.000 per tahun | Rumahweb |
| .web.id | Rp50.000 per tahun | Rp50.000 per tahun | Rumahweb |
| .com | Rp137.000 per tahun, promo | Rp219.000 per tahun | Rumahweb |

[Daftar resmi Rumahweb](https://www.rumahweb.com/domain-murah/) memuat registrasi dan renewal tersebut. Untuk target paling hemat, .my.id menjadi pilihan awal. Nama seperti `stylefitai.my.id` hanya contoh kandidat; ketersediaan dan harga final belum diperiksa pada checkout.

Sebagai pembanding registrasi, [Jagoan Hosting](https://www.jagoanhosting.com/domain-murah/) menampilkan .my.id Rp35.000 dan .com Rp145.000. Kolom transfer bukan bukti biaya renewal; renewal harus dicek terpisah. Jangan memilih ekstensi hanya dari promo tahun pertama, terutama bila renewal jauh lebih mahal.

Sebelum memilih hosting, pastikan paket mendukung Node.js LTS, proses server dan worker, PostgreSQL, volume privat persisten, HTTPS, serta backup. Paket khusus PHP/WordPress belum tentu mendukung aplikasi ini. VPS murah untuk web/database belum tentu mampu menjalankan model gambar berat; jangan membeli paket dengan asumsi CPU/RAM kecil cukup untuk semua inference.

Untuk build guest 0.1.0, kebutuhan aktif hanya server Node.js untuk web; database, worker, media privat, dan GPU belum digunakan. Persyaratan layanan tambahan di atas berlaku ketika fitur pemiliknya diaktifkan, bukan alasan membeli semuanya sekarang.

The guest build requires only Node.js. Account tests use local PostgreSQL and Mailpit. Marketplace search links require neither an API key nor an affiliate account. Untuk online, hosting serta domain menunggu keputusan pemilik. Tidak ada deploy, pendaftaran domain, auto-top-up, atau aktivasi billing pada perubahan ini.
