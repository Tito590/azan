let stream = null;
let frameTimer = null;
let currentFrame = 0;
let speechStarted = false;

const $ = (id) => document.getElementById(id);

const frameUrls = CONFIG.frames;

// Preload all five frames before showing the animation.
function preloadFrames() {
  return Promise.all(frameUrls.map((url) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  })));
}

async function init() {
  $("speechText").textContent = CONFIG.greeting;
  $("pouchImg").src = CONFIG.pouchUrl;

  // The browser may show the permission prompt immediately here.
  // If the browser blocks it until a gesture, the fallback button remains visible.
  await startCamera();

  $("allowBtn").addEventListener("click", startCamera);
  $("soundBtn").addEventListener("click", () => {
    if (speechStarted) speak(CONFIG.greeting);
    else {
      speechStarted = true;
      speak(CONFIG.greeting);
    }
  });
  $("storyBtn").addEventListener("click", () => $("story").classList.remove("hidden"));
  $("closeStory").addEventListener("click", () => $("story").classList.add("hidden"));
  $("shopBtn").addEventListener("click", () => {
    if (CONFIG.shopUrl && CONFIG.shopUrl !== "#") location.href = CONFIG.shopUrl;
    else toast("Isi shopUrl di config.js untuk tombol pembelian.");
  });
}

async function startCamera() {
  if (stream) return;

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    toast("Kamera tidak tersedia di browser ini.");
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
    $("permission").classList.add("hidden");
    $("ar").classList.remove("hidden");

    const loaded = await preloadFrames();
    const usable = loaded.filter(Boolean);
    if (!usable.length) {
      toast("Asset petani gagal dimuat. Periksa file di GitHub.");
      return;
    }

    currentFrame = 0;
    showFrame();
    frameTimer = setInterval(nextFrame, CONFIG.frameDuration);

    // Balloon appears immediately with the first frame.
    $("speech").classList.remove("hidden");

    // TTS can be blocked by browsers until a user gesture.
    // We attempt it once; the sound button can replay it.
    setTimeout(() => {
      speak(CONFIG.greeting);
      speechStarted = true;
    }, 350);
  } catch (err) {
    console.error(err);
    toast("Tekan AKTIFKAN KAMERA lalu pilih Allow/Izinkan.");
  }
}

function showFrame() {
  $("farmerFrame").src = frameUrls[currentFrame];
}

function nextFrame() {
  currentFrame = (currentFrame + 1) % frameUrls.length;
  showFrame();
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = CONFIG.speechLang || "id-ID";
    u.rate = 0.92;
    u.pitch = 1.0;
    speechSynthesis.speak(u);
  } catch (e) {
    console.warn("TTS tidak tersedia", e);
  }
}

function toast(text) {
  const t = $("toast");
  t.textContent = text;
  t.style.display = "block";
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    t.style.display = "none";
  }, 2800);
}

window.addEventListener("beforeunload", () => {
  if (frameTimer) clearInterval(frameTimer);
  if (stream) stream.getTracks().forEach((track) => track.stop());
});

init();
