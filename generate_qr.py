import sys
import qrcode

if len(sys.argv) != 2:
    print("Usage: python generate_qr.py https://domain-anda.com/")
    raise SystemExit(1)

url = sys.argv[1].strip()
if not url.startswith(("https://", "http://")):
    raise SystemExit("URL harus dimulai dengan https:// atau http://")

img = qrcode.make(url)
out = "qr-kamanika-argopuro.png"
img.save(out)
print(f"QR dibuat: {out}")
