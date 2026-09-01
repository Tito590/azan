let stream = null;
let soundOn = true;
let farmerShown = false;

const $ = id => document.getElementById(id);

$("startBtn").addEventListener("click", startAR);
$("soundBtn").addEventListener("click", () => {
  soundOn = !soundOn;
  $("soundBtn").textContent = soundOn ? "🔊" : "🔇";
  if (soundOn && farmerShown) speak(CONFIG.farmerGreeting);
});

$("shopBtn").addEventListener("click", () => {
  if (CONFIG.shopUrl && CONFIG.shopUrl !== "#") location.href = CONFIG.shopUrl;
  else toast("Masukkan shopUrl di config.js");
});

// QR -> halaman -> kamera langsung diminta.
window.addEventListener("load", () => {
  setTimeout(startAR, 350);
});

async function startAR(){
  if (stream) return;

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showCameraError("Browser ini tidak mendukung kamera.");
    return;
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });

    $("camera").srcObject = stream;
    $("camera").style.display = "block";
    document.querySelector(".camera-shade").style.display = "block";
    $("startScreen").classList.add("hidden");
    $("arScreen").classList.remove("hidden");

    // Scan singkat lalu petani langsung muncul.
    requestAnimationFrame(showFarmer);
  } catch(err) {
    console.error(err);
    showCameraError("Izinkan akses kamera agar petani Argopuro bisa muncul.");
  }
}

function showFarmer(){
  if (farmerShown) return;
  farmerShown = true;

  $("farmerLayer").classList.remove("hidden");
  $("greeting").textContent = CONFIG.farmerGreeting;
  $("story").textContent = CONFIG.farmerStory;

  // Hidupkan gesture: wave + breathing + chest greeting.
  $("farmerLayer").classList.add("alive");

  setTimeout(() => $("infoCard").classList.remove("hidden"), 650);
  speak(CONFIG.farmerGreeting);
}

function speak(text){
  if (!soundOn || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = "id-ID";
  u.rate = 0.9;
  u.pitch = 1.0;

  // Browser tertentu hanya mengizinkan TTS setelah interaksi pengguna.
  try { speechSynthesis.speak(u); } catch(e) {}
}

function showCameraError(message){
  $("startScreen").classList.remove("hidden");
  $("arScreen").classList.add("hidden");
  toast(message);
}

function toast(text){
  const t = $("toast");
  t.textContent = text;
  t.style.display = "block";
  clearTimeout(window.__toast);
  window.__toast = setTimeout(() => t.style.display = "none", 3200);
}

// Tap layar untuk mengulang sapaan jika autoplay TTS diblokir browser.
document.addEventListener("click", (e) => {
  if (farmerShown && !e.target.closest("button")) {
    speak(CONFIG.farmerGreeting);
  }
});
