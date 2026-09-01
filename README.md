# Kamanika Argopuro 360° v12 FIXED

Perbaikan utama:
- Tidak lagi mentransform elemen background tunggal yang bisa keluar viewport dan menjadi hitam.
- Panorama dibuat sebagai TRACK dengan dua salinan gambar identik.
- Track digeser dengan translate3d.
- Saat melewati ujung gambar, salinan kedua langsung mengisi viewport sehingga tidak ada black gap.
- Swipe layer berada paling atas dan selalu menerima gesture.
- Tidak ada kamera, sensor, WebGL, Three.js, Canvas, atau permission.
- Panorama WebP digunakan.
- Petani hanya 4 frame dan dimuat bertahap.
- Pouch dimuat setelah first paint.

Upload:
index.html
style.css
app.js
config.js

ke root Tito590/azan.
