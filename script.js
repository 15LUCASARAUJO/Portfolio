gsap.registerPlugin(ScrollTrigger);
gsap.to("#loaderBar",{
  width:"100%",
  duration:2.2,
  ease:"power4.inOut"
});
gsap.to("#loader",{
  opacity:0,
  delay:2.4,
  duration:.8,
  onComplete:()=>{
    document.getElementById("loader").style.display="none";
  }
});
gsap.to(".heroLine",{
  y:0,
  stagger:.1,
  delay:1.8,
  duration:1.2,
  ease:"power4.out"
});
gsap.from(".heroBottom",{
  opacity:0,
  y:30,
  delay:2.1,
  duration:1
});
gsap.utils.toArray(".aboutBlock").forEach(block=>{
  gsap.from(block,{
    opacity:0,
    y:60,
    duration:1,
    scrollTrigger:{
      trigger:block,
      start:"top 85%"
    }
  });
});
if(window.innerWidth > 900){
  const track = document.getElementById("horizontalTrack");
  const totalScroll = track.scrollWidth - window.innerWidth;
  document.querySelector(".horizontal").style.height =
    (totalScroll + window.innerHeight) + "px";
  gsap.to(track, {
    x: () => -totalScroll,
    ease: "none",
    scrollTrigger: {
      trigger: ".horizontal",
      start: "top top",
      end: () => "+=" + totalScroll,
      scrub: 1,
      pin: true,
      anticipatePin: 1,
    }
  });
}
const canvas=document.getElementById("heroCanvas");
const ctx=canvas.getContext("2d");
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;
const particles=[];
for(let i=0;i<80;i++){
  particles.push({
    x:Math.random()*canvas.width,
    y:Math.random()*canvas.height,
    radius:Math.random()*2,
    speedX:(Math.random()-.5)*.2,
    speedY:(Math.random()-.5)*.2
  });
}
function animateParticles(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p=>{
    p.x+=p.speedX;
    p.y+=p.speedY;
    if(p.x<0||p.x>canvas.width){
      p.speedX*=-1;
    }
    if(p.y<0||p.y>canvas.height){
      p.speedY*=-1;
    }
    ctx.beginPath();
    ctx.arc(
      p.x,
      p.y,
      p.radius,
      0,
      Math.PI*2
    );
    ctx.fillStyle="rgba(0,0,0,.08)";
    ctx.fill();
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();
window.addEventListener("resize",()=>{
  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight;
});
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});
document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});
gsap.to('#experienceLine', {
  height: '100%',
  ease: 'none',
  scrollTrigger: {
    trigger: '.experienceGrid',
    start: 'top 70%',
    end: 'bottom 60%',
    scrub: 1,
  }
});
if (window.innerWidth > 900) {
  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0.5, 7);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(600, 600);
  renderer.setClearColor(0x000000, 0);
  renderer.outputEncoding    = THREE.sRGBEncoding;
  renderer.toneMapping       = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  const viewerEl = document.getElementById("modelViewer");
  viewerEl.appendChild(renderer.domElement);
  renderer.domElement.style.cursor = 'none';
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(4, 6, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xaaaaaa, 0.4);
  rim.position.set(-4, 2, -4);
  scene.add(rim);
  let model       = null;
  let targetRotY  = 0;
  let currentRotY = 0;
  let dragging    = false;
  let dragX       = 0;
  let dragBase    = 0;
  const loader = new THREE.GLTFLoader();
  loader.load("assets/laptop.glb", (gltf) => {
    model = gltf.scene;
    const box    = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());
    model.position.sub(center);
    model.scale.setScalar(2.2 / Math.max(size.x, size.y, size.z));
    scene.add(model);
    viewerEl.classList.add("visible");
    animate();
  });
  function animate() {
    requestAnimationFrame(animate);
    currentRotY += (targetRotY - currentRotY) * 0.06;
    if (model) model.rotation.y = currentRotY;
    renderer.render(scene, camera);
  }
  renderer.domElement.addEventListener("mousedown", e => {
    dragging = true;
    dragX    = e.clientX;
    dragBase = targetRotY;
  });
  window.addEventListener("mousemove", e => {
    if (!dragging) return;
    targetRotY = dragBase + (e.clientX - dragX) * 0.008;
  });
  window.addEventListener("mouseup", () => { dragging = false; });
  ScrollTrigger.create({
    trigger: ".horizontal",
    start: "top top",
    end: () => {
      const track = document.getElementById("horizontalTrack");
      return "+=" + (track.scrollWidth - window.innerWidth);
    },
    onUpdate(self) {
      if (dragging) return;
      const panels = document.querySelectorAll(".panel");
      const seg    = 1 / (panels.length - 1);       
      const p      = Math.min(self.progress / seg, 1); 
      targetRotY   = p * Math.PI * 2;
    }
  });
}
