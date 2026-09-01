let currentX=0,targetX=0,dragging=false,lastX=0;
let imageWidth=0,raf=0,started=false,frame=0,frameTimer=0;
const $=id=>document.getElementById(id);

function init(){
 $("speech").textContent=CONFIG.greeting;
 $("buy").onclick=()=>{if(CONFIG.shopUrl&&CONFIG.shopUrl!=="#")location.href=CONFIG.shopUrl;else toast("Isi shopUrl di config.js untuk link pembelian.")};
 setupGesture();
 loadExperience();
}

async function loadExperience(){
 try{
  await loadPanorama();
  await loadFrame(0);
  showFrame();
  $("loading").style.display="none";
  started=true;
  render();
  requestAnimationFrame(()=>{$("pouch").src=CONFIG.pouchUrl});
  await loadFrame(1);
  frameTimer=setInterval(nextFrame,CONFIG.frameDuration);
 }catch(e){
  console.error(e);
  $("loading").textContent="Kebun gagal dimuat. Periksa koneksi internet.";
 }
}

function loadPanorama(){
 return new Promise((resolve,reject)=>{
  const imgA=$("panoA"),imgB=$("panoB"),probe=new Image();
  probe.decoding="async";
  probe.onload=()=>{
   imageWidth=probe.naturalWidth*(innerHeight/probe.naturalHeight);
   imgA.src=CONFIG.panoramaUrl;
   imgB.src=CONFIG.panoramaUrl;
   imgA.style.width=imageWidth+"px";
   imgB.style.width=imageWidth+"px";
   $("panoramaTrack").style.width=(imageWidth*2)+"px";
   // Start centered in the first copy.
   currentX=targetX=0;
   resolve();
  };
  probe.onerror=reject;
  probe.src=CONFIG.panoramaUrl;
 });
}

function render(){
 if(!started)return;

 // Smooth target position.
 currentX+=(targetX-currentX)*CONFIG.smoothness;

 // Keep translation within one panorama width.
 // Track has two identical copies, so no black gap can appear.
 let x=currentX%imageWidth;
 if(x<0)x+=imageWidth;

 // Center viewport around the panorama while keeping duplicated image under it.
 const offset=-x;
 $("panoramaTrack").style.transform=`translate3d(${offset}px,0,0)`;

 raf=requestAnimationFrame(render);
}

function setupGesture(){
 const g=$("gesture");
 g.addEventListener("pointerdown",e=>{
  dragging=true;
  lastX=e.clientX;
  try{g.setPointerCapture(e.pointerId)}catch(_){}
 });
 g.addEventListener("pointermove",e=>{
  if(!dragging)return;
  const dx=e.clientX-lastX;
  lastX=e.clientX;
  targetX-=dx/CONFIG.swipeSensitivity;
  updateDirection();
 });
 const stop=()=>dragging=false;
 g.addEventListener("pointerup",stop);
 g.addEventListener("pointercancel",stop);
}

function updateDirection(){
 const h=((targetX/imageWidth*360)%360+360)%360;
 $("direction").textContent=h<45||h>=315?"DEPAN":h<135?"KANAN":h<225?"BELAKANG":"KIRI";
}

const cache=new Map();
function loadFrame(i){
 if(cache.has(i))return Promise.resolve(cache.get(i));
 return new Promise(resolve=>{
  const img=new Image();img.decoding="async";
  img.onload=()=>{cache.set(i,img);resolve(img)};
  img.onerror=()=>resolve(null);
  img.src=CONFIG.frames[i];
 });
}
function showFrame(){const img=cache.get(frame);if(img)$("farmer").src=img.src}
async function nextFrame(){
 const next=(frame+1)%CONFIG.frames.length;
 const img=await loadFrame(next);
 if(!img)return;
 frame=next;showFrame();
 for(const k of cache.keys())if(k!==frame&&k!==((frame+1)%CONFIG.frames.length))cache.delete(k);
 loadFrame((frame+1)%CONFIG.frames.length);
}
function toast(t){const x=$("toast");x.textContent=t;x.style.display="block";clearTimeout(window.__t);window.__t=setTimeout(()=>x.style.display="none",2600)}

window.addEventListener("resize",()=>{
 if(!started)return;
 loadPanorama().catch(()=>{});
});
window.addEventListener("beforeunload",()=>{cancelAnimationFrame(raf);clearInterval(frameTimer)});
init();
