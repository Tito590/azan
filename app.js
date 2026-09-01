let stream = null;
let soundOn = true;
const $ = id => document.getElementById(id);

$("startBtn").addEventListener("click", startAR);
$("soundBtn").addEventListener("click", () => {
  soundOn = !soundOn;
  $("soundBtn").textContent = soundOn ? "🔊" : "🔇";
});

$("shopBtn").addEventListener("click", () => {
  if (CONFIG.shopUrl && CONFIG.shopUrl !== "#") location.href = CONFIG.shopUrl;
  else toast("Masukkan shopUrl di config.js");
});

async function startAR(){
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    toast("Browser ini tidak mendukung kamera.");
    return;
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" }, width:{ideal:1280}, height:{ideal:720} },
      audio: false
    });
    $("camera").srcObject = stream;
    $("camera").style.display = "block";
    document.querySelector(".camera-shade").style.display = "block";
    $("startScreen").classList.add("hidden");
    $("arScreen").classList.remove("hidden");

    // Prototype behavior: after a short scan animation,
    // reveal the farmer AR character.
    setTimeout(showFarmer, 2200);
  } catch(err) {
    toast("Kamera ditolak. Izinkan kamera lalu coba lagi.");
    console.error(err);
  }
}

function showFarmer(){
  $("farmerLayer").classList.remove("hidden");
  $("greeting").textContent = CONFIG.farmerGreeting;
  $("story").textContent = CONFIG.farmerStory;
  setTimeout(() => $("infoCard").classList.remove("hidden"), 900);
  speak(CONFIG.farmerGreeting);
}

function speak(text){
  if (!soundOn || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "id-ID";
  u.rate = .92;
  u.pitch = 1.0;
  speechSynthesis.speak(u);
}

function toast(text){
  const t = $("toast");
  t.textContent = text;
  t.style.display = "block";
  clearTimeout(window.__toast);
  window.__toast = setTimeout(() => t.style.display = "none", 2500);
}
