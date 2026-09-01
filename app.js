let angle=0,targetAngle=0,lastX=0,dragging=false;
let panoramaWidth=0,animationStarted=false,frame=0,frameTimer=null;
const $=id=>document.getElementById(id);

async function init(){
  $("speechText").textContent=CONFIG.greeting;
  $("pouchImg").src=CONFIG.pouchUrl;

  $("buyBtn").addEventListener("click",()=>{
    if(CONFIG.shopUrl&&CONFIG.shopUrl!=="#")location.href=CONFIG.shopUrl;
    else toast("Isi shopUrl di config.js untuk link pembelian.");
  });

  setupTouch();

  try{
    await loadPanorama();
    await preloadFrames();
    showFrame();

    $("loading").style.display="none";
    frameTimer=setInterval(nextFrame,CONFIG.frameDuration);
    animationStarted=true;
    render();
  }catch(error){
    console.error(error);
    $("loading").textContent="Kebun gagal dimuat. Periksa koneksi internet.";
  }
}

function loadPanorama(){
  return new Promise((resolve,reject)=>{
    const image=new Image();

    image.onload=()=>{
      const width=image.naturalWidth||4096;
      const height=image.naturalHeight||2048;

      // For an equirectangular 2:1 panorama, one displayed image width
      // corresponds exactly to one full 360° rotation.
      panoramaWidth=Math.max(
        innerWidth,
        width*(innerHeight/height)
      );

      const panorama=$("panorama");
      panorama.style.backgroundImage=`url("${CONFIG.panoramaUrl}")`;
      panorama.style.backgroundRepeat="repeat-x";
      panorama.style.backgroundSize=`${panoramaWidth}px ${innerHeight}px`;
      panorama.style.backgroundPosition="50% 50%";

      resolve();
    };

    image.onerror=reject;
    image.src=CONFIG.panoramaUrl;
  });
}

function render(){
  if(!animationStarted)return;

  // Smooth movement: input changes target only; visual position follows
  // through interpolation at the browser's animation frame rate.
  angle += (targetAngle-angle)*0.11;

  const x=(angle/360)*panoramaWidth;
  $("panorama").style.backgroundPosition=`calc(50% + ${-x}px) 50%`;

  requestAnimationFrame(render);
}

function setupTouch(){
  const panorama=$("panorama");

  panorama.addEventListener("pointerdown",event=>{
    dragging=true;
    lastX=event.clientX;
    try{panorama.setPointerCapture(event.pointerId)}catch(_){}
  });

  panorama.addEventListener("pointermove",event=>{
    if(!dragging)return;

    const dx=event.clientX-lastX;
    lastX=event.clientX;

    // A full panorama width represents 360 degrees.
    targetAngle -= dx*(360/Math.max(panoramaWidth,innerWidth));
    updateHud();
  });

  window.addEventListener("pointerup",()=>dragging=false);
}

function updateHud(){
  const h=((targetAngle%360)+360)%360;

  $("heading").textContent=Math.round(h)+"°";
  $("direction").textContent=
    h<45||h>=315?"DEPAN":
    h<135?"KANAN":
    h<225?"BELAKANG":"KIRI";
}

function preloadFrames(){
  return Promise.all(CONFIG.frames.map(src=>new Promise(resolve=>{
    const image=new Image();
    image.onload=()=>resolve(true);
    image.onerror=()=>resolve(false);
    image.src=src;
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
  window.__toast=setTimeout(()=>t.style.display="none",2800);
}

window.addEventListener("resize",()=>{
  if(!$("loading").style.display||$("loading").style.display==="none"){
    loadPanorama().then(()=>{
      const x=(angle/360)*panoramaWidth;
      $("panorama").style.backgroundPosition=`calc(50% + ${-x}px) 50%`;
    }).catch(()=>{});
  }
});

window.addEventListener("beforeunload",()=>{
  if(frameTimer)clearInterval(frameTimer);
});

init();
