// Utils
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

// INTRO WALK IN
const intro = $('#intro');
const introDude = $('#introDude');
const enterBtn = $('#enterBtn');
const site = $('#site');

function animateIntroWalk(){
  // start off-screen
  const roadY = window.innerHeight * 0.10;
  introDude.style.left = `-40vw`;
  let x = -window.innerWidth * 0.4;
  const target = (window.innerWidth/2) - (introDude.getBoundingClientRect().width/2);
  const step = () => {
    x += Math.max(3, window.innerWidth * 0.006); // speed scales with width
    introDude.style.transform = 'scaleX(1)';
    introDude.style.left = x + 'px';
    if (x >= target){
      
      // >>> Freeze animated GIF when the character reaches the bin (intro button shows)
      // Swap GIF to a static PNG so he becomes fully static.
      (function freezeIntroDude(){
        try{
          const src = introDude.getAttribute('src') || '';
          // only swap once
          if (!introDude.dataset.frozen){
            // Choose a static PNG that matches the intro character
            // If you prefer a different frame, just change the filename below.
            const staticSrc = 'assets/simphson2.png';
            // Only swap if current is a GIF
            if (/\.gif(\?|$)/i.test(src)){
              introDude.setAttribute('src', staticSrc);
            }
            // Prevent any residual CSS animations or transforms
            introDude.style.animation = 'none';
            introDude.style.transform = 'none';
            introDude.dataset.frozen = '1';
          }
        }catch(e){ /* no-op */ }
      })();
      // <<< end freeze
enterBtn.classList.remove('hidden');
      setTimeout(()=>enterBtn.classList.add('show'), 30);
      return;
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

window.addEventListener('load', animateIntroWalk);

enterBtn.addEventListener('click', () => {
  intro.classList.add('hidden');
  site.classList.remove('hidden');
  startRunner();
});

// SLIDE 1: Runner across screen + EAT swap + copy
const runner = $('#runner');
let runnerRAF=null, dir=1, vx=2.8;

function startRunner(){
  let x = 20;
  let t0 = performance.now();
  const loop = () => {
    const rect = runner.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - 20;
    x += dir * Math.max(vx, window.innerWidth * 0.0038);

    // Flip direction at edges (do NOT set transform here; we do it below including bounce)
    if (x <= 10){ dir = 1; }
    if (x >= maxX){ dir = -1; }

    // Horizontal position
    runner.style.left = x + 'px';

    // Add a subtle hop while "walking"
    const t = performance.now() - t0;
    const hop = Math.sin(t * 0.025) * 8; // amplitude ~8px, tweak as needed
    runner.style.transform = `scaleX(${dir}) translateY(${hop.toFixed(2)}px)`;

    runnerRAF = requestAnimationFrame(loop);
  };
  cancelAnimationFrame(runnerRAF);
  runnerRAF = requestAnimationFrame(loop);
}

$('#eatBtn').addEventListener('click', ()=>{
  // swap sprite
  if (runner.dataset.alt === '3'){
    runner.src = 'assets/simphs2.gif';
    runner.dataset.alt = '2';
  } else {
    runner.src = 'assets/simphs3.gif';
    runner.dataset.alt = '3';
  }
});

$('#copyBtn').addEventListener('click', async ()=>{
  const text = $('#contractText').textContent.trim();
  try{
    await navigator.clipboard.writeText(text);
    $('#copyBtn').textContent = 'COPIED!';
    setTimeout(()=>$('#copyBtn').textContent='COPY', 1200);
  }catch(e){
    alert('Copy failed. Try manually.');
  }
});

// SLIDE 2: Bananas spawn on click
const slide2 = $('.slide-2');
const bananaField = $('#bananaField');
slide2.addEventListener('click', (e)=>{
  // Don't spawn when clicking buttons
  if (e.target.closest('.btn')) return;
  const span = document.createElement('span');
  span.textContent = '🍌';
  span.style.left = e.clientX + 'px';
  span.style.top = e.clientY + 'px';
  bananaField.appendChild(span);
  setTimeout(()=>span.remove(), 2300);
});

// SLIDE 3: Snore + lights + donuts
const slide3 = $('.slide-3');
const fxLayer = $('#fxLayer');
$('#snoreBtn').addEventListener('click', ()=>{
  const audio = $('#snoreAudio');
  if (!audio) return;
  // Toggle playback
  if (audio.paused){
    audio.currentTime = 0;
    audio.play().catch(()=>{});
    // visual feedback
    $('#snoreBtn').style.filter = 'brightness(1.08)';
  } else {
    audio.pause();
    $('#snoreBtn').style.filter = '';
  }
});

$('#lightsBtn').addEventListener('click', ()=>{
  slide3.classList.toggle('night');
});

$('#donutBtn').addEventListener('click', ()=>{
  const d = document.createElement('div');
  d.className = 'donut';
  d.textContent = '🍩';
  const x = window.innerWidth * (.60 + Math.random()*.2);
  d.style.left = x + 'px';
  d.style.top = (slide3.getBoundingClientRect().top - 280) + 'px';
  fxLayer.appendChild(d);
  setTimeout(()=>d.remove(), 1600);
});

// Accessibility niceties
$$('.btn').forEach(b=>b.addEventListener('keydown', (e)=>{
  if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); b.click(); }
}));


// === SLIDE 2: Water shower & bubbles ===
const waterBtn = $('#waterBtn');
const bubblesBtn = $('#bubblesBtn');

let waterOn = false, waterTimer = null;
let bubblesOn = false, bubblesTimer = null;

function inViewOf(el){
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight;
}

function spawnWaterBatch(){
  const r = slide2.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0 || !inViewOf(slide2)) return;
  const count = 8 + Math.floor(Math.random()*4); // 8..11
  for (let i=0;i<count;i++){
    const d = document.createElement('i');
    d.className = 'water-drop';
    // random X across the section + slight jitter
    const x = r.left + Math.random()*r.width;
    const y = r.top - 24 - Math.random()*30; // slightly above
    const h = 14 + Math.random()*18;
    const w = 1 + Math.random()*2;
    d.style.left = x + 'px';
    d.style.top = y + 'px';
    d.style.height = h + 'px';
    d.style.width = w + 'px';
    // distance to fall through the section (+overshoot)
    const fall = r.height + 60 + Math.random()*60;
    const dur = 0.85 + Math.random()*0.7; // 0.85..1.55s
    d.style.setProperty('--fall', fall + 'px');
    d.style.setProperty('--dur', dur + 's');
    document.body.appendChild(d);
    d.addEventListener('animationend', ()=> d.remove(), {once:true});
  }
}

function spawnBubbleBatch(){
  const r = slide2.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0 || !inViewOf(slide2)) return;
  const count = 2 + Math.floor(Math.random()*3); // 2..4
  for (let i=0;i<count;i++){
    const b = document.createElement('i');
    b.className = 'bubble';
    const size = 14 + Math.random()*28; // 14..42px
    const x = r.left + Math.random() * (r.width - size);
    const y = r.bottom - size - Math.random()*40; // near bottom
    b.style.width = size + 'px';
    b.style.height = size + 'px';
    b.style.left = x + 'px';
    b.style.top = y + 'px';
    const rise = r.height * (0.7 + Math.random()*0.5); // up 70-120% height
    const drift = (Math.random() < .5 ? -1 : 1) * (30 + Math.random()*90);
    const dur = 2.2 + Math.random()*2.4;
    b.style.setProperty('--rise', rise + 'px');
    b.style.setProperty('--drift', drift + 'px');
    b.style.setProperty('--dur', dur + 's');
    document.body.appendChild(b);
    b.addEventListener('animationend', ()=> b.remove(), {once:true});
  }
}

if (waterBtn){
  waterBtn.addEventListener('click', ()=>{
    waterOn = !waterOn;
    if (waterOn){
      if (waterTimer) clearInterval(waterTimer);
      spawnWaterBatch();
      waterTimer = setInterval(spawnWaterBatch, 180);
      // subtle button feedback
      waterBtn.style.filter = 'brightness(1.08)';
    } else {
      if (waterTimer) clearInterval(waterTimer);
      waterTimer = null;
      waterBtn.style.filter = '';
    }
  });
}

if (bubblesBtn){
  bubblesBtn.addEventListener('click', ()=>{
    bubblesOn = !bubblesOn;
    if (bubblesOn){
      if (bubblesTimer) clearInterval(bubblesTimer);
      spawnBubbleBatch();
      bubblesTimer = setInterval(spawnBubbleBatch, 320);
      bubblesBtn.style.filter = 'brightness(1.08)';
    } else {
      if (bubblesTimer) clearInterval(bubblesTimer);
      bubblesTimer = null;
      bubblesBtn.style.filter = '';
    }
  });
}

// Keep things aligned while scrolling/resizing: old elements auto-remove, and batches use fresh rects.
window.addEventListener('resize', ()=>{
  if (waterOn) spawnWaterBatch();
  if (bubblesOn) spawnBubbleBatch();
});


// === SLIDE 2: Music button ===
const musicBtn = $('#musicBtn');
const musicEl = $('#slide2Music');
if (musicBtn && musicEl){
  musicBtn.addEventListener('click', ()=>{
    if (musicEl.paused){
      musicEl.currentTime = 0;
      musicEl.play().catch(()=>{});
      musicBtn.style.filter = 'brightness(1.08)';
    } else {
      musicEl.pause();
      musicBtn.style.filter = '';
    }
  });
}


// Continuous Z while snore audio is playing
(function(){
  const audio = $('#snoreAudio');
  const slide3 = $('.slide-3');
  const fxLayer = $('#fxLayer');
  if (!audio || !slide3 || !fxLayer) return;

  let zTimer = null;
  function spawnZ(){
    // create one Z element at a semi-random position within slide-3 area
    const r = slide3.getBoundingClientRect();
    const z = document.createElement('div');
    z.className = 'zz';
    z.textContent = Math.random() > .6 ? 'Zz' : (Math.random() > .5 ? 'ZZ' : 'ZZZ');
    const x = r.left + r.width * (.52 + Math.random() * .18); // around bed zone
    const y = r.top  + r.height * (.30 + Math.random() * .20);
    z.style.left = x + 'px';
    z.style.top  = y + 'px';
    fxLayer.appendChild(z);
    setTimeout(()=>z.remove(), 2600);
  }

  function startZ(){
    if (zTimer) return;
    spawnZ();
    // randomized cadence between 220–420ms
    const tick = () => {
      if (audio.paused) return;
      spawnZ();
      zTimer = setTimeout(tick, 220 + Math.random()*200);
    };
    zTimer = setTimeout(tick, 260);
  }
  function stopZ(){
    if (zTimer){ clearTimeout(zTimer); zTimer = null; }
  }

  audio.addEventListener('play', startZ);
  audio.addEventListener('pause', stopZ);
  audio.addEventListener('ended', ()=>{
    stopZ();
    $('#snoreBtn') && ($('#snoreBtn').style.filter = '');
  });
})();

$('#donutBtn').addEventListener('click', ()=>{
  const r = slide3.getBoundingClientRect();
  const d = document.createElement('div');
  d.className = 'donut';
  d.textContent = '🍩';
  // random X across the full screen width
  const x = Math.random() * window.innerWidth;
  // start slightly above the slide-3 top edge
  const startOffset = 80 + Math.random()*80; // 80..160px above
  d.style.left = x + 'px';
  d.style.top  = (r.top - startOffset) + 'px';

  // customize per-drop distance & duration via CSS vars + inline animation
  const fall = r.height + startOffset + 100; // travel through slide + small overshoot
  const dur  = 1.6 + Math.random()*1.4; // 1.6..3.0s
  d.style.setProperty('--fall', fall + 'px');
  d.style.animation = `donutDrop ${dur}s ease-in forwards`;

  fxLayer.appendChild(d);
  d.addEventListener('animationend', ()=> d.remove(), {once:true});
});
