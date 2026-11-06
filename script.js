gsap.registerPlugin(ScrollTrigger);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isDesktop = window.innerWidth > 900;

/* Loader real: acompanha o carregamento dos modelos 3D (mínimo de 1,2s) */
const loadingManager = new THREE.LoadingManager();
const loaderStart = performance.now();
let loaderDone = false;
function setLoaderProgress(pct){
  gsap.to("#loaderBar",{width:pct+"%",duration:.4,ease:"power2.out",overwrite:true});
}
function finishLoader(){
  if(loaderDone) return;
  loaderDone = true;
  setLoaderProgress(100);
  const wait = Math.max(0, 1200 - (performance.now() - loaderStart)) / 1000 + (reduceMotion ? 0 : .4);
  gsap.to("#loader",{
    opacity:0, delay:wait, duration:reduceMotion ? .01 : .8,
    onComplete:()=>{ document.getElementById("loader").style.display="none"; }
  });
  gsap.to(".heroLine",{y:0, stagger:.1, delay:wait*.7, duration:reduceMotion ? .01 : 1.2, ease:"power4.out"});
  gsap.from(".heroBottom",{opacity:0, y:30, delay:wait, duration:reduceMotion ? .01 : 1});
}
loadingManager.onProgress = (url, loaded, total) => setLoaderProgress(loaded / total * 100);
loadingManager.onLoad = finishLoader;
setTimeout(finishLoader, 10000);                  // segurança
if(!isDesktop) setTimeout(finishLoader, 1200);    // mobile: modelos carregam depois, sob demanda
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
if(isDesktop){
  const track = document.getElementById("horizontalTrack");
  const totalScroll = () => track.scrollWidth - window.innerWidth;
  gsap.to(track, {
    x: () => -totalScroll(),
    ease: "none",
    scrollTrigger: {
      trigger: ".horizontal",
      start: "top top",
      end: () => "+=" + totalScroll(),
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    }
  });
}
// ao cruzar o breakpoint desktop/mobile, recarrega para montar o layout certo
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { if ((window.innerWidth > 900) !== isDesktop) location.reload(); }, 250);
});
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
if(!reduceMotion) animateParticles();
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
/* ---------- Modelos 3D: um visualizador por painel ---------- */
const MODELS = [
  { el: "modelViewer",  file: "assets/dispenser.glb",    ambient: 0.5, rim: 0.4, fit: 3.1, camY: 0.3, label: "Modelo 3D interativo do dispenser automático" },
  { el: "modelViewer2", file: "assets/laptopfolder.glb", ambient: 0.6, rim: 0.5, fit: 2.64, label: "Modelo 3D interativo do sistema de pedidos orçamentários" },
  { el: "modelViewer3", file: "assets/laptopcar.glb",    ambient: 0.6, rim: 0.5, fit: 4.4, label: "Modelo 3D interativo do leilão de carros" }
];

function createViewer(cfg) {
  const host = document.getElementById(cfg.el);
  if (!host) return null;

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, cfg.camY ?? 0.5, 8);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(host.clientWidth || 700, host.clientHeight || 700, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputEncoding      = THREE.sRGBEncoding;
  renderer.toneMapping         = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  host.appendChild(renderer.domElement);
  host.setAttribute("role", "img");
  host.setAttribute("aria-label", cfg.label);

  scene.add(new THREE.AmbientLight(0xffffff, cfg.ambient));
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(4, 6, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xaaaaaa, cfg.rim);
  rim.position.set(-4, 2, -4);
  scene.add(rim);

  const state = { model: null, target: 0, current: 0, dragging: false, dragX: 0, dragBase: 0, inView: false };

  new THREE.GLTFLoader(loadingManager).load(cfg.file, (gltf) => {
    const model  = gltf.scene;
    const box    = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());
    model.position.sub(center);
    model.scale.setScalar((cfg.fit || 2.2) / Math.max(size.x, size.y, size.z));
    scene.add(model);
    state.model = model;
    host.classList.add("visible");
  }, undefined, (err) => console.warn("Falha ao carregar " + cfg.file, err));

  // só renderiza quando o painel está na tela (economiza GPU/bateria)
  new IntersectionObserver(([e]) => { state.inView = e.isIntersecting; }).observe(host);

  (function tick() {
    requestAnimationFrame(tick);
    if (!state.model || !state.inView) return;
    state.current += (state.target - state.current) * 0.06;
    state.model.rotation.y = state.current;
    renderer.render(scene, camera);
  })();

  renderer.domElement.addEventListener("mousedown", e => {
    state.dragging = true; state.dragX = e.clientX; state.dragBase = state.target;
  });
  window.addEventListener("mousemove", e => {
    if (!state.dragging) return;
    state.target = state.dragBase + (e.clientX - state.dragX) * 0.008;
  });
  window.addEventListener("mouseup", () => { state.dragging = false; });

  return state;
}

if (window.innerWidth > 900) {
  const viewers = MODELS.map(createViewer);

  ScrollTrigger.create({
    trigger: ".horizontal",
    start: "top top",
    end: () => "+=" + (document.getElementById("horizontalTrack").scrollWidth - window.innerWidth),
    onUpdate(self) {
      const steps = document.querySelectorAll(".panel").length - 1;
      viewers.forEach((v, i) => {
        if (!v || v.dragging) return;
        // 0 quando o painel i está centralizado; gira uma volta ao entrar/sair
        v.target = (self.progress * steps - i) * Math.PI * 2;
      });
    }
  });
} else {
  // mobile: <model-viewer> leve, carregado só quando necessário
  import("https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js").then(() => {
    MODELS.forEach(cfg => {
      const host = document.getElementById(cfg.el);
      if (!host) return;
      const mv = document.createElement("model-viewer");
      mv.setAttribute("src", cfg.file);
      mv.setAttribute("alt", cfg.label);
      mv.setAttribute("camera-controls", "");
      if (!reduceMotion) mv.setAttribute("auto-rotate", "");
      mv.setAttribute("touch-action", "pan-y");
      mv.setAttribute("loading", "lazy");
      mv.setAttribute("environment-image", "neutral");
      mv.setAttribute("exposure", "1.1");
      mv.style.cssText = "width:100%;height:100%;background:transparent;--poster-color:transparent";
      host.appendChild(mv);
      host.classList.add("visible");
    });
  }).catch(err => console.warn("model-viewer indisponível", err));
}
