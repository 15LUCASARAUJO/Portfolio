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
// about animations
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

// horizontal scroll
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

// particles
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
