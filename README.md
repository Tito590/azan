# Kamanika Argopuro AR 360° v6

Versi ini fokus pada kompatibilitas Chrome Android.

## Perubahan utama
- WebGL dihapus.
- Three.js dihapus.
- Canvas dihapus.
- Panorama digunakan sebagai CSS `background-image`, sehingga browser hanya perlu merender gambar biasa.
- DeviceOrientation mengubah `background-position`.
- Jika sensor tidak bekerja, panorama tetap bisa digerakkan dengan drag/touch.
- Asset panorama menggunakan file GitHub yang diberikan:
  `ChatGPT Image Sep 1, 2026, 04_47_41 PM.png`
- Petani 5 frame dan pouch tetap dipertahankan.
- Tidak ada suara.

## Deploy
Copy `index.html`, `style.css`, `app.js`, `config.js` ke root repository `Tito590/azan`.

QR tetap:
https://tito590.github.io/azan/

Jika panorama tampil tetapi tidak bergerak:
- tekan tombol AR,
- izinkan Motion/Orientation,
- atau geser layar dengan jari.

Versi ini sengaja tidak menggunakan WebGL agar background tidak kembali hitam di HP.
