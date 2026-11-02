// Personaliza con la URL: ?para=Nombre&fecha=Sábado 8 de noviembre
const q = new URLSearchParams(location.search);
if (q.get('para')) document.getElementById('who').textContent = ' ' + q.get('para');
if (q.get('fecha')) {
  document.getElementById('dateTxt').textContent = q.get('fecha');
  document.getElementById('dateChip').hidden = false;
}

// luciérnagas
const ff = document.getElementById('fireflies');
for (let i = 0; i < 25; i++) {
  const f = document.createElement('i');
  f.style.left = Math.random() * 100 + '%';
  f.style.top = Math.random() * 100 + '%';
  f.style.setProperty('--d', 5 + Math.random() * 6 + 's');
  f.style.animationDelay = (-Math.random() * 6) + 's';
  ff.appendChild(f);
}

// botón "No" que huye
const no = document.getElementById('no');
function run() {
  no.classList.add('run');
  const m = 12, w = innerWidth - no.offsetWidth - m, h = innerHeight - no.offsetHeight - m;
  no.style.left = Math.max(m, Math.random() * w) + 'px';
  no.style.top = Math.max(m, Math.random() * h) + 'px';
}
no.addEventListener('mouseenter', run);
no.addEventListener('touchstart', e => { e.preventDefault(); run(); }, { passive: false });
no.addEventListener('click', run);

// confeti de colores
const cv = document.getElementById('confetti'), cx = cv.getContext('2d');
let parts = [];
const colors = ['#ff3b3b', '#ff9f1c', '#ffe135', '#3bd16f', '#2ea8ff', '#a35cff', '#ff6fb5'];
function size() { cv.width = innerWidth; cv.height = innerHeight; }
addEventListener('resize', size); size();
function loop() {
  cx.clearRect(0, 0, cv.width, cv.height);
  parts.forEach(p => {
    p.vy += .15; p.x += p.vx; p.y += p.vy; p.r += p.vr;
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r);
    cx.fillStyle = p.c; cx.fillRect(-4, -2, 8, 4); cx.restore();
  });
  parts = parts.filter(p => p.y < cv.height + 20);
  if (parts.length) requestAnimationFrame(loop);
}
function burst() {
  for (let i = 0; i < 220; i++) parts.push({
    x: innerWidth / 2, y: innerHeight / 2,
    vx: (Math.random() - .5) * 18, vy: Math.random() * -14 - 2,
    r: Math.random() * 6, vr: (Math.random() - .5) * .4,
    c: colors[i % colors.length]
  });
  loop();
}
document.getElementById('yes').addEventListener('click', () => {
  document.getElementById('buttons').hidden = true;
  no.hidden = true;
  document.querySelector('.ask').hidden = true;
  document.getElementById('done').hidden = false;
  burst(); setTimeout(burst, 600);
});
