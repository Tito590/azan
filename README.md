# Kamanika Argopuro Natural — QR WebAR

Alur:
1. User scan QR pouch.
2. URL membuka halaman.
3. Halaman langsung meminta akses kamera.
4. Setelah user memilih Allow/Izinkan, kamera belakang tampil.
5. Lima gambar petani dimainkan berurutan sebagai frame animation:
   1. https://raw.githubusercontent.com/Tito590/azan/main/assets/ChatGPT%20Image%20Sep%201%2C%202026%2C%2001_49_59%20PM.png
   2. https://raw.githubusercontent.com/Tito590/azan/main/assets/ChatGPT%20Image%20Sep%201%2C%202026%2C%2001_56_19%20PM.png
   3. https://raw.githubusercontent.com/Tito590/azan/main/assets/ChatGPT%20Image%20Sep%201%2C%202026%2C%2001_58_15%20PM.png
   4. https://raw.githubusercontent.com/Tito590/azan/main/assets/ChatGPT%20Image%20Sep%201%2C%202026%2C%2002_01_11%20PM.png
   5. https://raw.githubusercontent.com/Tito590/azan/main/assets/ChatGPT%20Image%20Sep%201%2C%202026%2C%2002_06_01%20PM.png
6. Animasi looping membuat tangan terlihat melambai.
7. Pouch Argopuro ditampilkan sebagai overlay AR:
   https://raw.githubusercontent.com/Tito590/azan/main/assets/argopuro-pouch-solid.png
8. Balloon:
   "Terima Kasih sudah membeli kopi dari kami, karenamu kami terus berjuangan demi kopi terbaik Indonesia."
9. TTS Bahasa Indonesia dicoba otomatis; tombol speaker dapat digunakan untuk memutar ulang.
10. Tombol CERITA KOPI membuka detail origin/process/notes.

## Deploy ke GitHub Pages

Repository Anda sudah berada di:
https://github.com/Tito590/azan

File project ini dapat diletakkan di root repository atau dipakai sebagai basis halaman baru.

### Jika ingin mengganti halaman utama
Backup `index.html` lama, lalu copy:
- index.html
- style.css
- app.js
- config.js

ke root repository.

Asset petani dan pouch di-load langsung dari GitHub raw, sehingga tidak perlu meng-copy ulang lima file gambar ke project ini.

## Penting tentang kamera
Kamera hanya dapat dipakai pada HTTPS (GitHub Pages memenuhi syarat). Browser tetap wajib meminta persetujuan kamera; website tidak dapat melewati permission dialog.

## Tentang "AR"
Implementasi ini adalah camera-overlay WebAR: kamera menjadi background, kemudian frame petani + pouch ditampilkan di atasnya. Ini belum menggunakan image-target tracking yang mengunci objek secara matematis ke permukaan pouch.

Jika ingin versi production-grade:
QR -> kamera -> image target pouch dikenali -> petani ditempel pada posisi target -> tetap mengikuti pergerakan pouch/kamera.

## QR
QR yang sebelumnya dibuat untuk:
https://tito590.github.io/azan/

akan membuka halaman ini setelah project di-deploy ke root repository tersebut.
