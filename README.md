# Kamanika Argopuro 360° AR

Versi ini menambahkan panorama kebun kopi 360° yang dikontrol oleh orientasi HP.

## Alur
1. User scan QR.
2. Halaman meminta izin kamera.
3. Setelah masuk, panorama kebun kopi menjadi lingkungan 360°.
4. User menggerakkan HP ke kiri/kanan atau berputar 360°.
5. Panorama mengikuti orientasi HP.
6. Panel kecil menunjukkan arah dan derajat rotasi.
7. Petani tetap berada di foreground dan frame 1-5 berganti untuk efek melambai.
8. Pouch Argopuro tetap tampil di kanan bawah.
9. Tidak ada suara/TTS.
10. Tombol BELI ROASTBEAN siap diarahkan lewat `shopUrl`.

## Asset panorama
Menggunakan file GitHub:
https://github.com/Tito590/azan/blob/main/assets/ChatGPT%20Image%20Sep%201%2C%202026%2C%2004_23_40%20PM.png

Di script digunakan URL raw GitHub agar browser dapat mengambil gambar langsung.

## Deploy
Copy:
- index.html
- style.css
- app.js
- config.js

ke root GitHub Pages `Tito590/azan`.

QR `https://tito590.github.io/azan/` tetap dapat digunakan.

## Catatan teknis
Ini adalah 360° virtual panorama berbasis device orientation. Kamera dipakai sebagai entry/permission flow, sementara tampilan kebun berasal dari panorama equirectangular.

Pada iPhone, browser dapat meminta izin Motion & Orientation setelah tombol AR ditekan. Pada Android/browser yang mendukung DeviceOrientation, orientasi HP digunakan langsung.

Jika browser tidak memberikan sensor orientation, panorama masih dapat tampil tetapi tidak otomatis mengikuti putaran HP.

Three.js dimuat dari jsDelivr.


## Perbaikan layar hitam
Versi ini memperbaiki konfigurasi material sphere panorama. Sphere sudah dibalik untuk dilihat dari dalam, sehingga material menggunakan `FrontSide` (bukan `BackSide`). Ini mencegah panorama menjadi hitam karena back-face culling.
