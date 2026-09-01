# Kamanika Argopuro 360° — Equirectangular

Panorama sudah diarahkan ke asset baru:
`ChatGPT Image Sep 1, 2026, 04_47_41 PM.png`

Asset tersebut digunakan sebagai panorama equirectangular 2:1.

## Implementasi
- WebGL shader melakukan proyeksi equirectangular -> perspektif.
- DeviceOrientation mengontrol yaw ketika HP diputar.
- iPhone meminta Motion & Orientation permission setelah tombol AR.
- Desktop/HP tanpa sensor tetap dapat menggeser panorama dengan jari/mouse.
- Tidak menggunakan Three.js.
- Petani 5 frame tetap berjalan.
- Pouch tetap tampil.
- Tidak ada suara.
- Tombol BELI ROASTBEAN tetap tersedia.

## Deploy
Copy `index.html`, `style.css`, `app.js`, dan `config.js` ke root `Tito590/azan`.

QR:
https://tito590.github.io/azan/

Catatan: panorama equirectangular yang benar sebaiknya 4096x2048 (2:1). Script tidak mengubah ukuran asset; GitHub raw menyajikan file sesuai ukuran yang tersimpan.
