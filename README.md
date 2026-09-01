# Kamanika Argopuro AR 360° v8 — Smooth Mobile

Versi ini dibuat khusus untuk mengurangi patah-patah pada Android.

Perubahan:
- Sensor tidak langsung mengubah background setiap event.
- Target sudut sensor disimpan terlebih dahulu.
- Gerakan visual menggunakan requestAnimationFrame + interpolation.
- Background dipertahankan sebagai satu composited layer.
- `will-change`, `translate3d`, dan `contain` digunakan untuk membantu browser melakukan compositing.
- Animasi petani diperlambat menjadi 220 ms/frame.
- Tidak ada WebGL, Three.js, atau Canvas.
- Panorama tetap 360° dengan repeat-x.
- Drag jari tetap menjadi fallback.

File:
- index.html
- style.css
- app.js
- config.js
- README.md

Upload index.html, style.css, app.js, config.js ke root repository Tito590/azan.
