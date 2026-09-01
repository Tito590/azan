let heading=0,targetHeading=0,startAlpha=null;
let frame=0,frameTimer=null,dragging=false,lastX=0;
let panoWidth=0;
let rafPending=false;
const $=id=>document.getElementById(id);

function init(){
  $("speechText").textContent=CONFIG.greeting;
  $("pouchImg").src=CONFIG.pouchUrl;
  $("startBtn").addEventListener("click",start);
  $("buyBtn").addEventListener("click",()=>{
    if(CONFIG.shopUrl&&CONFIG.shopUrl!=="#")location.href=CONFIG.shopUrl;
    else toast("Isi shopUrl di config.js untuk link pembelian.");
  });
}

async function start(){
  $("startBtn").disabled=true;

  try{
    if(navigator.mediaDevices?.getUserMedia){
      const s=await navigator.mediaDevices.getUserMedia({
        video:{facingMode:{ideal:"environment"}},audio:false
      });
      s.getTracks().forEach(t=>t.stop());
    }
  }catch(e){console.warn("Camera:",e)}

  await requestOrientation();

  try{await loadPanorama();}
  catch(e){
    $("startBtn").disabled=false;
    toast("Panorama gagal dimuat.");
    return;
  }

  $("permission").classList.add("hidden");
  $("experience").classList.remove("hidden");

  await preloadFrames();
  showFrame();
  frameTimer=setInterval(nextFrame,CONFIG.frameDuration);
  applyPanorama();
}

async function requestOrientation(){
  if(!("DeviceOrientationEvent"in window)){
    toast("Sensor tidak tersedia. Geser layar.");
    return;
  }

  if(typeof DeviceOrientationEvent.requestPermission==="function"){
    try{
      const result=await DeviceOrientationEvent.requestPermission();
      if(result!=="granted"){
        toast("Sensor ditolak. Geser layar dengan jari.");
        return;
      }
    }catch(e){
      toast("Sensor tidak diizinkan. Geser layar dengan jari.");
      return;
    }
  }

  window.addEventListener("deviceorientation",onOrientation,true);
  window.addEventListener("deviceorientationabsolute",onOrientation,true);

  setTimeout(()=>{
    if(startAlpha===null)toast("Sensor belum mengirim data. Geser layar dengan jari.");
  },1800);
}

function onOrientation(e){
  if(e.alpha==null)return;

  if(startAlpha===null){
    startAlpha=e.alpha;
    targetHeading=0;
    return;
  }

  // Relative yaw, normalized to one complete 360° panorama.
  targetHeading=((e.alpha-startAlpha+540)%360)-180;
  scheduleRender();
  updateHud();
}

async function loadPanorama(){
  const garden=$("garden");
  const image=new Image();

  await new Promise((resolve,reject)=>{
    image.onload=resolve;
    image.onerror=reject;
    image.src=CONFIG.panoramaUrl;
  });

  const width=image.naturalWidth||4096;
  const height=image.naturalHeight||2048;

  // Entire image width is exactly 360°.
  panoWidth=Math.max(innerWidth,width*(innerHeight/height));

  garden.style.backgroundImage=`url("${CONFIG.panoramaUrl}")`;
  garden.style.backgroundRepeat="repeat-x";
  garden.style.backgroundSize=`${panoWidth}px ${innerHeight}px`;
  garden.style.backgroundPosition="50% 50%";
}

function scheduleRender(){
  if(rafPending)return;
  rafPending=true;

  requestAnimationFrame(()=>{
    rafPending=false;
    heading += (targetHeading-heading)*CONFIG.sensorSmoothing;
    applyPanorama();

    // Continue smoothing even when sensor event frequency is low.
    if(Math.abs(targetHeading-heading)>0.02)scheduleRender();
  });
}

function applyPanorama(){
  if(!panoWidth)return;

  const x=(heading/360)*panoWidth;

  // Only one composited CSS property is updated per animation frame.
  $("garden").style.backgroundPosition=`calc(50% + ${-x}px) 50%`;
}

function setupTouch(){
  const garden=$("garden");

  garden.addEventListener("pointerdown",e=>{
    dragging=true;
    lastX=e.clientX;
    if(garden.setPointerCapture){
      try{garden.setPointerCapture(e.pointerId)}catch(_){}
    }
  });

  garden.addEventListener("pointermove",e=>{
    if(!dragging)return;

    const dx=e.clientX-lastX;
    lastX=e.clientX;

    targetHeading-=dx*CONFIG.touchSensitivity;
    heading=targetHeading;

    applyPanorama();
    updateHud();
  });

  window.addEventListener("pointerup",()=>dragging=false);
}

function updateHud(){
  const h=((targetHeading%360)+360)%360;
  $("heading").textContent=Math.round(h)+"°";
  $("direction").textContent=
    h<45||h>=315?"DEPAN":
    h<135?"KANAN":
    h<225?"BELAKANG":"KIRI";
}

function preloadFrames(){
  return Promise.all(CONFIG.frames.map(src=>new Promise(resolve=>{
    const i=new Image();
    i.onload=()=>resolve(true);
    i.onerror=()=>resolve(false);
    i.src=src;
  })));
}

function showFrame(){$("farmerFrame").src=CONFIG.frames[frame]}
function nextFrame(){frame=(frame+1)%CONFIG.frames.length;showFrame()}

function toast(text){
  const t=$("toast");
  t.textContent=text;
  t.style.display="block";
  clearTimeout(window.__toast);
  window.__toast=setTimeout(()=>t.style.display="none",3000);
}

window.addEventListener("resize",()=>{
  if(!$("experience").classList.contains("hidden")){
    loadPanorama().then(()=>{
      applyPanorama();
    }).catch(()=>{});
  }
});

window.addEventListener("beforeunload",()=>{
  if(frameTimer)clearInterval(frameTimer);
});

init();
setupTouch();
