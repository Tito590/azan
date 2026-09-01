# Kamanika Argopuro Natural — WebAR Prototype

## Yang dilakukan prototype
QR code mengarah ke `index.html`. Saat halaman dibuka:
1. Pengunjung menekan AKTIFKAN AR.
2. Kamera belakang HP aktif.
3. Tampilan scan muncul.
4. Setelah 2,2 detik, karakter petani muncul sebagai overlay AR.
5. Petani menyapa dengan teks dan suara browser.
6. Informasi origin, process, tasting notes, dan tombol beli muncul.

> Catatan: versi ini adalah prototype WebAR berbasis kamera/overlay. Ia belum melakukan image tracking terhadap pouch secara otomatis. Untuk produksi, tahap berikutnya bisa memakai image-target tracking sehingga petani mengikuti posisi pouch.

## Struktur
- `index.html` — halaman utama
- `style.css` — tampilan
- `app.js` — kamera, animasi, suara
- `config.js` — data produk + URL publik
- `assets/argopuro-pouch.png` — foto produk
- `assets/farmer.png` — karakter petani
- `generate_qr.py` — pembuat QR dari URL publik

## Cara membuat QR yang benar

### Opsi paling mudah: GitHub Pages
1. Buat repository GitHub baru, misalnya `kamanika-argopuro-ar`.
2. Upload seluruh isi folder ini.
3. Di repository buka **Settings → Pages**.
4. Pilih **Deploy from a branch**.
5. Pilih branch `main`, folder `/ (root)`, lalu Save.
6. Tunggu sampai GitHub memberikan URL Pages, misalnya:
   `https://USERNAME.github.io/kamanika-argopuro-ar/`
7. Buka `config.js` dan ubah:
   `publicUrl: "PASTE_PUBLIC_URL_HERE"`
   menjadi URL tersebut.
8. Upload ulang `config.js`.
9. Buat QR:
   `python generate_qr.py "https://USERNAME.github.io/kamanika-argopuro-ar/"`
10. File `qr-kamanika-argopuro.png` akan dibuat.
11. Cetak QR tersebut pada pouch/stiker.

### Jika tidak ingin install Python
Gunakan generator QR apa pun yang bisa membuat QR dari URL, lalu masukkan URL GitHub Pages Anda.

## Penting
Jangan membuat QR dari URL `sandbox:/...` atau `file:///...`; HP pelanggan tidak bisa mengaksesnya.

Untuk kamera HP, gunakan URL HTTPS seperti GitHub Pages, Netlify, Vercel, atau hosting HTTPS lain.

## Pengujian
Setelah online:
- Scan QR dengan HP.
- Browser membuka halaman.
- Tekan AKTIFKAN AR.
- Pilih Allow/Izinkan kamera.
- Arahkan ke pouch.
- Tunggu animasi petani muncul.

## Personalisasi
Semua teks utama dapat diubah di `config.js`, termasuk:
- nama produk
- origin
- tasting notes
- sapaan petani
- cerita
- link pembelian
