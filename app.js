let current=0,target=0,lastX=0,dragging=false,panoWidth=0,started=false,raf=0,frame=0,frameTimer=0;
const $=id=>document.getElementById(id);

async function init(){
 $("speech").textContent=CONFIG.greeting;
 $("buy").onclick=()=>{if(CONFIG.shopUrl&&CONFIG.shopUrl!=="#")location.href=CONFIG.shopUrl;else toast("Isi shopUrl di config.js untuk link pembelian.")};
 try{
   await loadPanorama();
   await loadFrame(0);
   showFrame();
   $("loading").style.display="none";
   started=true;
   render();
   // Pouch after first paint.
   requestAnimationFrame(()=>{$("pouch").src=CONFIG.pouchUrl});
   // Load one next frame only.
   loadFrame(1);
   frameTimer=setInterval(nextFrame,CONFIG.frameDuration);
 }catch(e){
   console.error(e);
   $("loading").textContent="Gagal memuat. Periksa koneksi internet.";
 }
}

function loadPanorama(){
 return new Promise((resolve,reject)=>{
  const img=new Image();
  img.decoding="async";
  img.onload=()=>{
   const w=img.naturalWidth||2048,h=img.naturalHeight||1024;
   panoWidth=Math.max(innerWidth,w*(innerHeight/h));
   const p=$("panorama");
   p.style.backgroundImage=`url("${CONFIG.panoramaUrl}")`;
   p.style.backgroundSize=`${panoWidth}px ${innerHeight}px`;
   p.style.backgroundRepeat="repeat-x";
   p.style.backgroundPosition="50% 50%";
   resolve();
  };
  img.onerror=reject;img.src=CONFIG.panoramaUrl;
 });
}

function render(){
 if(!started)return;
 current+=(target-current)*CONFIG.smoothness;
 const x=(current/360)*panoWidth;
 $("panorama").style.transform=`translate3d(${-x}px,0,0)`;
 raf=requestAnimationFrame(render);
}

function setupGesture(){
 const g=$("gesture");
 g.addEventListener("pointerdown",e=>{dragging=true;lastX=e.clientX;try{g.setPointerCapture(e.pointerId)}catch(_){}});
 g.addEventListener("pointermove",e=>{
   if(!dragging)return;
   const dx=e.clientX-lastX;lastX=e.clientX;
   target-=dx*CONFIG.swipeSensitivity;
   updateDirection();
 });
 const stop=()=>dragging=false;
 g.addEventListener("pointerup",stop);g.addEventListener("pointercancel",stop);
}

function updateDirection(){
 const h=((target%360)+360)%360;
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
window.addEventListener("resize",()=>{if(!started)return;loadPanorama()});
window.addEventListener("beforeunload",()=>{clearInterval(frameTimer);cancelAnimationFrame(raf)});
setupGesture();init();
