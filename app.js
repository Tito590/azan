let heading=0,targetHeading=0,startAlpha=null;let frame=0,frameTimer=null,dragging=false,lastX=0,panoWidthDisplayed=0;const $=id=>document.getElementById(id);
function init(){
  $("speechText").textContent=CONFIG.greeting;$("pouchImg").src=CONFIG.pouchUrl;
  $("startBtn").addEventListener("click",start);
  $("buyBtn").addEventListener("click",()=>{if(CONFIG.shopUrl&&CONFIG.shopUrl!=="#")location.href=CONFIG.shopUrl;else toast("Isi shopUrl di config.js untuk link pembelian.")});setupTouch();
}
async function start(){
  $("startBtn").disabled=true;
  try{if(navigator.mediaDevices?.getUserMedia){const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});s.getTracks().forEach(t=>t.stop())}}catch(e){console.warn("Camera:",e)}
  await requestOrientation();
  try{await loadPanorama()}catch(e){$("startBtn").disabled=false;toast("Panorama gagal dimuat.");return}
  $("permission").classList.add("hidden");$("experience").classList.remove("hidden");showFrame();frameTimer=setInterval(nextFrame,CONFIG.frameDuration);applyPanorama();
}
async function requestOrientation(){
  if(!(typeof DeviceOrientationEvent!=="undefined")){toast("Sensor gerak tidak tersedia. Geser layar.");return}
  if(typeof DeviceOrientationEvent.requestPermission==="function"){
    try{const r=await DeviceOrientationEvent.requestPermission();if(r!=="granted"){toast("Sensor ditolak. Geser layar dengan jari.");return}}catch(e){toast("Sensor tidak diizinkan. Geser layar dengan jari.");return}
  }
  window.addEventListener("deviceorientation",onOrientation,true);window.addEventListener("deviceorientationabsolute",onOrientation,true);
  setTimeout(()=>{if(startAlpha===null)toast("Sensor belum aktif. Geser layar dengan jari.")},1800);
}
function onOrientation(e){if(e.alpha==null)return;if(startAlpha===null){startAlpha=e.alpha;targetHeading=0;return}targetHeading=((e.alpha-startAlpha+540)%360)-180;updateHud();applyPanorama()}
async function loadPanorama(){
  const garden=$("garden"),image=new Image();
  await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=CONFIG.panoramaUrl});
  const width=image.naturalWidth||4096,height=image.naturalHeight||2048;
  panoWidthDisplayed=Math.max(innerWidth,width*(innerHeight/height));
  garden.style.backgroundImage=`url("${CONFIG.panoramaUrl}")`;garden.style.backgroundRepeat="repeat-x";garden.style.backgroundSize=`${panoWidthDisplayed}px ${innerHeight}px`;garden.style.backgroundPosition="50% 50%";
}
function applyPanorama(){if(!panoWidthDisplayed)return;const x=(targetHeading/360)*panoWidthDisplayed;$("garden").style.backgroundPosition=`calc(50% + ${-x}px) 50%`}
function setupTouch(){const garden=$("garden");garden.addEventListener("pointerdown",e=>{dragging=true;lastX=e.clientX;garden.setPointerCapture?.(e.pointerId)});garden.addEventListener("pointermove",e=>{if(!dragging)return;const dx=e.clientX-lastX;lastX=e.clientX;targetHeading-=dx*(360/Math.max(panoWidthDisplayed,innerWidth));updateHud();applyPanorama()});window.addEventListener("pointerup",()=>dragging=false)}
function updateHud(){const h=((targetHeading%360)+360)%360;$("heading").textContent=Math.round(h)+"°";$("direction").textContent=h<45||h>=315?"DEPAN":h<135?"KANAN":h<225?"BELAKANG":"KIRI"}
function preloadFrames(){return Promise.all(CONFIG.frames.map(src=>new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(1);i.onerror=()=>resolve(0);i.src=src})))}
function showFrame(){$("farmerFrame").src=CONFIG.frames[frame]}function nextFrame(){frame=(frame+1)%CONFIG.frames.length;showFrame()}
function toast(text){const t=$("toast");t.textContent=text;t.style.display="block";clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.style.display="none",3000)}
window.addEventListener("resize",()=>{if($('experience').classList.contains('hidden'))return;loadPanorama().then(applyPanorama).catch(()=>{})});init();
