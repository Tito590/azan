let current=0,target=0,lastX=0,dragging=false;
let panoWidth=0,started=false,raf=0,frame=0,frameTimer=null;
const $=id=>document.getElementById(id);

async function init(){
  $("speechText").textContent=CONFIG.greeting;
  $("pouchImg").src=CONFIG.pouchUrl;
  $("buyBtn").addEventListener("click",()=>{
    if(CONFIG.shopUrl&&CONFIG.shopUrl!=="#")location.href=CONFIG.shopUrl;
    else toast("Isi shopUrl di config.js untuk link pembelian.");
  });

  try{
    await loadPanorama();
    await preloadFrames();
    showFrame();
    $("loading").style.display="none";
    started=true;
    render();
    frameTimer=setInterval(nextFrame,CONFIG.frameDuration);
  }catch(e){
    console.error(e);
    $("loading").textContent="Kebun gagal dimuat. Periksa koneksi internet.";
  }
}

function loadPanorama(){
  return new Promise((resolve,reject)=>{
    const image=new Image();
    image.onload=()=>{
      const w=image.naturalWidth||4096;
      const h=image.naturalHeight||2048;

      // For a true 2:1 equirectangular image, the complete displayed width
      // represents exactly 360 degrees.
      panoWidth=Math.max(innerWidth,w*(innerHeight/h));

      const el=$("panorama");
      el.style.backgroundImage=`url("${CONFIG.panoramaUrl}")`;
      el.style.backgroundRepeat="repeat-x";
      el.style.backgroundSize=`${panoWidth}px ${innerHeight}px`;
      el.style.backgroundPosition="50% 50%";
      resolve();
    };
    image.onerror=reject;
    image.src=CONFIG.panoramaUrl;
  });
}

function render(){
  if(!started)return;

  // Smooth interpolation, independent of touch event frequency.
  current += (target-current)*CONFIG.smoothness;

  const x=(current/360)*panoWidth;
  $("panorama").style.backgroundPosition=`calc(50% + ${-x}px) 50%`;

  raf=requestAnimationFrame(render);
}

function setupPointer(){
  const el=$("panorama");

  el.addEventListener("pointerdown",e=>{
    dragging=true;
    lastX=e.clientX;
    try{el.setPointerCapture(e.pointerId)}catch(_){}
  });

  el.addEventListener("pointermove",e=>{
    if(!dragging)return;

    const dx=e.clientX-lastX;
    lastX=e.clientX;

    // A full panorama width is 360 degrees.
    target -= dx*CONFIG.swipeSensitivity;
    updateHud();
  });

  window.addEventListener("pointerup",()=>dragging=false);
  window.addEventListener("pointercancel",()=>dragging=false);
}

function updateHud(){
  const h=((target%360)+360)%360;
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
  t.textContent=text;t.style.display="block";
  clearTimeout(window.__toast);
  window.__toast=setTimeout(()=>t.style.display="none",2600);
}

window.addEventListener("resize",()=>{
  if(!started)return;
  loadPanorama().then(()=>{}).catch(()=>{});
});
window.addEventListener("beforeunload",()=>{if(frameTimer)clearInterval(frameTimer)});

setupPointer();
init();
