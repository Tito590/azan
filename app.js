let heading=0,targetHeading=0,startAlpha=null;
let dragging=false,lastX=0,frame=0,frameTimer=null;
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

  // Request camera permission as part of the AR entry flow.
  try{
    if(navigator.mediaDevices?.getUserMedia){
      const s=await navigator.mediaDevices.getUserMedia({
        video:{facingMode:{ideal:"environment"}},audio:false
      });
      s.getTracks().forEach(t=>t.stop());
    }
  }catch(e){console.warn("Camera permission:",e)}

  await requestOrientation();

  // CSS background image avoids WebGL/Canvas texture failures on mobile.
  const garden=$("garden");
  garden.style.backgroundImage=`url("${CONFIG.panoramaUrl}")`;

  $("permission").classList.add("hidden");
  $("experience").classList.remove("hidden");

  preloadFrames().then(()=>{
    showFrame();
    frameTimer=setInterval(nextFrame,CONFIG.frameDuration);
  });
}

async function requestOrientation(){
  if(typeof DeviceOrientationEvent!=="undefined"&&
     typeof DeviceOrientationEvent.requestPermission==="function"){
    try{
      const r=await DeviceOrientationEvent.requestPermission();
      if(r==="granted"){
        window.addEventListener("deviceorientation",onOrientation,true);
        toast("Gerakkan HP ke kiri atau kanan.");
      }else toast("Sensor ditolak. Geser layar dengan jari.");
    }catch(e){toast("Sensor tidak tersedia. Geser layar com o dedo.")}
  }else if("DeviceOrientationEvent"in window){
    window.addEventListener("deviceorientation",onOrientation,true);
  }
}

function onOrientation(e){
  if(e.alpha==null)return;
  if(startAlpha===null)startAlpha=e.alpha;
  let delta=((e.alpha-startAlpha+540)%360)-180;
  targetHeading=delta;
  applyPanorama();
  updateHud();
}

function applyPanorama(){
  const normalized=((targetHeading%360)+360)%360;
  // The panorama repeats horizontally. Convert degrees to viewport movement.
  const px=normalized*(innerWidth/360)*CONFIG.panoramaSpeed;
  $("garden").style.backgroundPosition=`${-px}px 50%`;
}

function setupTouch(){
  $("garden").addEventListener("pointerdown",e=>{
    dragging=true;lastX=e.clientX;
  });
  $("garden").addEventListener("pointermove",e=>{
    if(!dragging)return;
    targetHeading-=((e.clientX-lastX)*0.45);
    lastX=e.clientX;
    applyPanorama();
    updateHud();
  });
  window.addEventListener("pointerup",()=>dragging=false);
}

function updateHud(){
  const h=((targetHeading%360)+360)%360;
  $("heading").textContent=Math.round(h)+"°";
  $("direction").textContent=h<45||h>=315?"DEPAN":h<135?"KANAN":h<225?"BELAKANG":"KIRI";
}

function preloadFrames(){
  return Promise.all(CONFIG.frames.map(src=>new Promise(r=>{
    const i=new Image();i.onload=()=>r(1);i.onerror=()=>r(0);i.src=src;
  })));
}
function showFrame(){$("farmerFrame").src=CONFIG.frames[frame]}
function nextFrame(){frame=(frame+1)%CONFIG.frames.length;showFrame()}
function toast(t){const x=$("toast");x.textContent=t;x.style.display="block";clearTimeout(window.__t);window.__t=setTimeout(()=>x.style.display="none",2800)}

window.addEventListener("resize",applyPanorama);
init();
setupTouch();
