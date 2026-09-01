let stream=null, timer=null, frame=0;
const $=id=>document.getElementById(id);

async function init(){
  $("speechText").textContent=CONFIG.greeting;
  $("pouchImg").src=CONFIG.pouchUrl;
  $("allowBtn").addEventListener("click",startCamera);
  $("buyBtn").addEventListener("click",()=>{
    if(CONFIG.shopUrl && CONFIG.shopUrl!=="#") location.href=CONFIG.shopUrl;
    else toast("Isi shopUrl di config.js untuk link pembelian.");
  });
  // Meminta kamera segera setelah halaman QR terbuka.
  await startCamera();
}

async function startCamera(){
  if(stream) return;
  if(!navigator.mediaDevices?.getUserMedia){
    toast("Browser tidak mendukung kamera.");
    return;
  }
  try{
    stream=await navigator.mediaDevices.getUserMedia({
      video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:720}},
      audio:false
    });
    $("camera").srcObject=stream;
    $("permission").classList.add("hidden");
    $("ar").classList.remove("hidden");
    await preload();
    frame=0;
    showFrame();
    timer=setInterval(nextFrame,CONFIG.frameDuration);
  }catch(e){
    console.error(e);
    toast("Izinkan kamera untuk bertemu petani.");
  }
}

function preload(){
  return Promise.all(CONFIG.frames.map(src=>new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>resolve(true);
    img.onerror=()=>resolve(false);
    img.src=src;
  })));
}

function showFrame(){
  $("farmerFrame").src=CONFIG.frames[frame];
}
function nextFrame(){
  frame=(frame+1)%CONFIG.frames.length;
  showFrame();
}
function toast(text){
  const t=$("toast");
  t.textContent=text;
  t.style.display="block";
  clearTimeout(window.__toast);
  window.__toast=setTimeout(()=>t.style.display="none",2600);
}
window.addEventListener("beforeunload",()=>{
  if(timer) clearInterval(timer);
  if(stream) stream.getTracks().forEach(t=>t.stop());
});
init();
