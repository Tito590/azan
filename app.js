let stream=null, timer=null, frame=0;
let renderer, scene, camera3d, panoMesh;
let orientationEnabled=false, lastHeading=0, smoothedHeading=0;
const $=id=>document.getElementById(id);

async function init(){
  $("speechText").textContent=CONFIG.greeting;
  $("pouchImg").src=CONFIG.pouchUrl;
  $("startBtn").addEventListener("click",startExperience);
  $("buyBtn").addEventListener("click",()=>{
    if(CONFIG.shopUrl && CONFIG.shopUrl!=="#") location.href=CONFIG.shopUrl;
    else toast("Isi shopUrl di config.js untuk link pembelian.");
  });
}

async function startExperience(){
  $("startBtn").disabled=true;
  // Camera permission is still requested to satisfy the AR entry flow.
  try{
    if(navigator.mediaDevices?.getUserMedia){
      stream=await navigator.mediaDevices.getUserMedia({
        video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:720}},
        audio:false
      });
    }
  }catch(e){
    // The 360 garden can still work without the camera stream.
    console.warn("Camera permission:",e);
  }

  $("permission").classList.add("hidden");
  initPanorama();
  await preloadFrames();
  showFrame();
  timer=setInterval(nextFrame,CONFIG.frameDuration);

  await enableOrientation();
}

function initPanorama(){
  scene=new THREE.Scene();
  camera3d=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.1,1100);
  // Camera is inside a large sphere; invert normals so the panorama is visible from inside.
  const geo=new THREE.SphereGeometry(500,64,40);
  geo.scale(-1,1,1);

  const texLoader = new THREE.TextureLoader();
  const tex = texLoader.load(
    CONFIG.panoramaUrl,
    () => {
      panoMesh.material.needsUpdate = true;
      console.log("Panorama 360 loaded");
    },
    undefined,
    () => {
      toast("Panorama kebun gagal dimuat. Periksa URL asset GitHub.");
      console.error("Panorama failed:", CONFIG.panoramaUrl);
    }
  );
  tex.colorSpace=THREE.SRGBColorSpace;

  panoMesh=new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({map:tex,side:THREE.FrontSide,depthWrite:false})
  );
  scene.add(panoMesh);

  renderer=new THREE.WebGLRenderer({canvas:$("panorama"),antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(innerWidth,innerHeight,false);
  renderer.outputColorSpace=THREE.SRGBColorSpace;

  window.addEventListener("resize",onResize);
  renderLoop();
}

function renderLoop(){
  requestAnimationFrame(renderLoop);
  if(!renderer) return;
  renderer.render(scene,camera3d);
}

function onResize(){
  if(!camera3d||!renderer)return;
  camera3d.aspect=innerWidth/innerHeight;
  camera3d.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight,false);
}

async function enableOrientation(){
  // iOS 13+ requires explicit permission from a user gesture.
  if(typeof DeviceOrientationEvent!=="undefined" &&
     typeof DeviceOrientationEvent.requestPermission==="function"){
    try{
      const result=await DeviceOrientationEvent.requestPermission();
      if(result!=="granted"){
        toast("Izin gerakan HP belum diberikan.");
        return;
      }
    }catch(e){
      toast("Izinkan Motion & Orientation untuk mode 360°.");
      return;
    }
  }

  window.addEventListener("deviceorientation",handleOrientation,true);
  orientationEnabled=true;
  toast("Gerakkan HP ke kiri, kanan, atau putar 360°.");
}

function handleOrientation(e){
  // Alpha is the compass heading on most mobile browsers.
  if(e.alpha==null)return;

  let heading=e.alpha;
  if(screen.orientation && typeof screen.orientation.angle==="number"){
    heading=(heading + screen.orientation.angle + 360)%360;
  }

  // Smooth to reduce jitter.
  let delta=((heading-smoothedHeading+540)%360)-180;
  smoothedHeading=(smoothedHeading+delta*.16+360)%360;

  // Horizontal camera rotation.
  panoMesh.rotation.y=THREE.MathUtils.degToRad(smoothedHeading);

  const rounded=Math.round(smoothedHeading)%360;
  $("heading").textContent=rounded+"°";
  updateDirection(rounded);
}

function updateDirection(h){
  let name="DEPAN";
  if(h>=45&&h<135)name="KANAN";
  else if(h>=135&&h<225)name="BELAKANG";
  else if(h>=225&&h<315)name="KIRI";
  $("direction").textContent=name;
  $("motionText").textContent =
    name==="DEPAN" ? "Posisi awal" :
    name==="KANAN" ? "Lihat sisi kanan kebun" :
    name==="BELAKANG" ? "Anda sudah berputar ke belakang" :
    "Lihat sisi kiri kebun";
}

function preloadFrames(){
  return Promise.all(CONFIG.frames.map(src=>new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>resolve(true);
    img.onerror=()=>resolve(false);
    img.src=src;
  })));
}
function showFrame(){$("farmerFrame").src=CONFIG.frames[frame]}
function nextFrame(){frame=(frame+1)%CONFIG.frames.length;showFrame()}
function toast(text){
  const t=$("toast");
  t.textContent=text;t.style.display="block";
  clearTimeout(window.__toast);
  window.__toast=setTimeout(()=>t.style.display="none",2800);
}
window.addEventListener("beforeunload",()=>{
  if(timer)clearInterval(timer);
  if(stream)stream.getTracks().forEach(t=>t.stop());
});
init();
