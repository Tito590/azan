let gl, program, texture, canvas;
let targetHeading=0, heading=0, startAlpha=null;
let drag=false,lastX=0,frame=0,frameTimer=null;
const $=id=>document.getElementById(id);

const VS=`attribute vec2 p; varying vec2 uv; void main(){uv=p*.5+.5; gl_Position=vec4(p,0.0,1.0);}`;
const FS=`precision mediump float;
uniform sampler2D pano;
uniform float yaw;
uniform float aspect;
uniform float fov;
varying vec2 uv;
const float PI=3.14159265359;
void main(){
  vec2 q=uv*2.0-1.0;
  q.x*=aspect;
  float focal=1.0/tan(fov*0.5);
  vec3 ray=normalize(vec3(q.x,q.y,focal));
  float cy=cos(yaw), sy=sin(yaw);
  vec3 r=vec3(cy*ray.x+sy*ray.z, ray.y, -sy*ray.x+cy*ray.z);
  float lon=atan(r.x,-r.z);
  float lat=asin(clamp(r.y,-1.0,1.0));
  vec2 p=vec2(lon/(2.0*PI)+0.5, lat/PI+0.5);
  p.y=1.0-p.y;
  gl_FragColor=texture2D(pano,p);
}`;

async function init(){
  $("speechText").textContent=CONFIG.greeting;
  $("pouchImg").src=CONFIG.pouchUrl;
  $("startBtn").addEventListener("click",start);
  $("buyBtn").addEventListener("click",()=>{
    if(CONFIG.shopUrl&&CONFIG.shopUrl!=="#") location.href=CONFIG.shopUrl;
    else toast("Isi shopUrl di config.js untuk link pembelian.");
  });
}
async function start(){
  $("startBtn").disabled=true;
  try{
    if(navigator.mediaDevices?.getUserMedia){
      const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});
      s.getTracks().forEach(t=>t.stop());
    }
  }catch(e){console.warn("Camera permission:",e)}
  await requestOrientation();
  try{await initGL();}catch(e){console.error(e);toast("Panorama tidak dapat ditampilkan di browser ini.");return}
  await preloadFrames();
  $("permission").classList.add("hidden");
  $("experience").classList.remove("hidden");
  showFrame();
  frameTimer=setInterval(nextFrame,CONFIG.frameDuration);
  render();
}
async function requestOrientation(){
  if(typeof DeviceOrientationEvent!=="undefined"&&typeof DeviceOrientationEvent.requestPermission==="function"){
    try{
      const r=await DeviceOrientationEvent.requestPermission();
      if(r==="granted")window.addEventListener("deviceorientation",onOrientation,true);
      else toast("Sensor gerak ditolak. Gunakan geser layar.");
    }catch(e){toast("Sensor gerak tidak tersedia. Gunakan geser layar.")}
  }else if("DeviceOrientationEvent"in window){
    window.addEventListener("deviceorientation",onOrientation,true);
  }
}
function onOrientation(e){
  if(e.alpha==null)return;
  if(startAlpha===null)startAlpha=e.alpha;
  let d=((e.alpha-startAlpha+540)%360)-180;
  targetHeading=d;
  updateHud();
}
function initGL(){
  return new Promise((resolve,reject)=>{
    canvas=$("garden");
    gl=canvas.getContext("webgl",{alpha:false,antialias:true,preserveDrawingBuffer:false});
    if(!gl)return reject(new Error("WebGL unavailable"));
    const compile=(type,src)=>{
      const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);
      if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh));
      return sh;
    };
    const p=gl.createProgram();
    gl.attachShader(p,compile(gl.VERTEX_SHADER,VS));
    gl.attachShader(p,compile(gl.FRAGMENT_SHADER,FS));
    gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
    program=p;gl.useProgram(program);

    const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const loc=gl.getAttribLocation(program,"p");gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);

    texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);

    const image=new Image();image.crossOrigin="anonymous";
    image.onload=()=>{
      gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
      resize();resolve();
    };
    image.onerror=()=>reject(new Error("Panorama image load failed"));
    image.src=CONFIG.panoramaUrl;
    window.addEventListener("resize",resize);
    canvas.addEventListener("pointerdown",e=>{drag=true;lastX=e.clientX});
    canvas.addEventListener("pointermove",e=>{if(!drag)return;targetHeading-=((e.clientX-lastX)*0.22);lastX=e.clientX;updateHud()});
    window.addEventListener("pointerup",()=>drag=false);
  });
}
function resize(){
  if(!gl)return;
  const d=Math.min(devicePixelRatio||1,2);
  canvas.width=innerWidth*d;canvas.height=innerHeight*d;
  gl.viewport(0,0,canvas.width,canvas.height);
}
function render(){
  requestAnimationFrame(render);
  if(!gl)return;
  heading+=(targetHeading-heading)*.12;
  gl.useProgram(program);
  gl.uniform1f(gl.getUniformLocation(program,"yaw"),heading*Math.PI/180);
  gl.uniform1f(gl.getUniformLocation(program,"aspect"),innerWidth/innerHeight);
  gl.uniform1f(gl.getUniformLocation(program,"fov"),75*Math.PI/180);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.uniform1i(gl.getUniformLocation(program,"pano"),0);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
}
function updateHud(){
  const h=((targetHeading%360)+360)%360;
  $("heading").textContent=Math.round(h)+"°";
  $("direction").textContent=h<45||h>=315?"DEPAN":h<135?"KANAN":h<225?"BELAKANG":"KIRI";
}
function preloadFrames(){return Promise.all(CONFIG.frames.map(src=>new Promise(r=>{const i=new Image();i.onload=()=>r(1);i.onerror=()=>r(0);i.src=src;})))}
function showFrame(){$("farmerFrame").src=CONFIG.frames[frame]}
function nextFrame(){frame=(frame+1)%CONFIG.frames.length;showFrame()}
function toast(t){const x=$("toast");x.textContent=t;x.style.display="block";clearTimeout(window.__t);window.__t=setTimeout(()=>x.style.display="none",2800)}
init();
