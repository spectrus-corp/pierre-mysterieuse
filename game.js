/* =========================================================
   La Pierre Mystérieuse — Platformer Arts Plastiques 5°8
   ========================================================= */

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

// ---------- UI elements ----------
const startScreen = document.getElementById('start-screen');
const loreScreen = document.getElementById('lore-screen');
const winScreen = document.getElementById('win-screen');
const resultsScreen = document.getElementById('results-screen');
const levelLabel = document.getElementById('level-label');
const fragmentsEl = document.getElementById('fragments');
const timerEl = document.getElementById('timer');
const messageEl = document.getElementById('message');
const loreTitle = document.getElementById('lore-title');
const loreText = document.getElementById('lore-text');
const winStats = document.getElementById('win-stats');
const formFeedback = document.getElementById('form-feedback');
const authBox = document.getElementById('auth-box');
const resultsList = document.getElementById('results-list');
const resultsBody = document.getElementById('results-body');
const authError = document.getElementById('auth-error');

// ---------- Game state ----------
let state = 'title'; // title | playing | lore | win | results
let currentLevel = 0;
let keys = {};
let startTime = 0;
let elapsed = 0;
let fragmentsCollected = 0;
let totalFragments = 0;
let cameraX = 0;
let showMessage = '';
let messageTimer = 0;

const CLASS_CODE = '5°8';
const STORAGE_KEY = 'pierre_mysterieuse_scores_5e8';

// ---------- Player ----------
const player = {
  x: 60, y: 300, w: 28, h: 36,
  vx: 0, vy: 0,
  onGround: false,
  facing: 1,
  anim: 0
};

// ---------- Level data ----------
const LORE = [
  {
    title: 'Fragment 1 — Origine',
    text: 'Cette pierre n’est pas ordinaire. Les anciens la nommaient « Cœur de la Terre ». On dit qu’elle s’est formée au moment où le premier éclair a frappé le sol, fusionnant roche, lumière et mémoire.'
  },
  {
    title: 'Fragment 2 — Les artistes',
    text: 'Dans les ateliers des sculpteurs, on racontait que quiconque touchait la pierre voyait apparaître des formes invisibles. Elle inspirait les formes, les couleurs, les rêves. C’est pour cela qu’on la recherchait tant.'
  },
  {
    title: 'Fragment 3 — Disparition',
    text: 'Il y a des siècles, la pierre fut brisée en trois. Les fragments furent cachés dans des lieux sacrés : une grotte, une forêt oubliée, et un temple enseveli. Celui qui les réunira comprendra enfin son vrai pouvoir…'
  },
  {
    title: 'La Pierre réunie',
    text: 'Les trois fragments se rejoignent. La pierre pulse d’une lueur douce. Elle ne donne pas de pouvoir magique… elle rappelle simplement que l’art naît de la matière, de la patience et du regard. Tu as accompli ton voyage.'
  }
];

function makeLevel(idx) {
  const levels = [
    {
      name: 'La Grotte oubliée',
      width: 2200,
      groundY: 480,
      platforms: [
        { x: 180, y: 400, w: 120, h: 16 },
        { x: 360, y: 340, w: 100, h: 16 },
        { x: 520, y: 280, w: 140, h: 16 },
        { x: 720, y: 360, w: 80, h: 16 },
        { x: 880, y: 300, w: 160, h: 16 },
        { x: 1100, y: 240, w: 100, h: 16 },
        { x: 1280, y: 320, w: 180, h: 16 },
        { x: 1520, y: 380, w: 120, h: 16 },
        { x: 1700, y: 280, w: 200, h: 16 },
        { x: 1950, y: 360, w: 140, h: 16 }
      ],
      spikes: [
        { x: 300, y: 464, w: 40 },
        { x: 640, y: 464, w: 50 },
        { x: 1000, y: 464, w: 40 },
        { x: 1450, y: 464, w: 60 }
      ],
      fragments: [
        { x: 560, y: 240, collected: false },
        { x: 1140, y: 200, collected: false },
        { x: 1780, y: 240, collected: false }
      ],
      exitX: 2050,
      bg: '#1a1510'
    },
    {
      name: 'La Forêt des murmures',
      width: 2400,
      groundY: 480,
      platforms: [
        { x: 150, y: 390, w: 90, h: 14 },
        { x: 280, y: 320, w: 110, h: 14 },
        { x: 450, y: 260, w: 80, h: 14 },
        { x: 600, y: 340, w: 130, h: 14 },
        { x: 800, y: 280, w: 100, h: 14 },
        { x: 980, y: 200, w: 90, h: 14 },
        { x: 1150, y: 300, w: 160, h: 14 },
        { x: 1400, y: 240, w: 100, h: 14 },
        { x: 1580, y: 360, w: 120, h: 14 },
        { x: 1780, y: 280, w: 140, h: 14 },
        { x: 2000, y: 340, w: 180, h: 14 }
      ],
      spikes: [
        { x: 400, y: 464, w: 45 },
        { x: 750, y: 464, w: 40 },
        { x: 1200, y: 464, w: 55 },
        { x: 1650, y: 464, w: 40 },
        { x: 1900, y: 464, w: 50 }
      ],
      fragments: [
        { x: 480, y: 220, collected: false },
        { x: 1010, y: 160, collected: false },
        { x: 1820, y: 240, collected: false }
      ],
      exitX: 2200,
      bg: '#121a12'
    },
    {
      name: 'Le Temple enseveli',
      width: 2600,
      groundY: 480,
      platforms: [
        { x: 120, y: 400, w: 100, h: 18 },
        { x: 280, y: 340, w: 80, h: 18 },
        { x: 420, y: 280, w: 140, h: 18 },
        { x: 620, y: 360, w: 90, h: 18 },
        { x: 780, y: 240, w: 120, h: 18 },
        { x: 980, y: 320, w: 100, h: 18 },
        { x: 1160, y: 200, w: 80, h: 18 },
        { x: 1320, y: 300, w: 160, h: 18 },
        { x: 1550, y: 240, w: 100, h: 18 },
        { x: 1720, y: 360, w: 130, h: 18 },
        { x: 1920, y: 280, w: 110, h: 18 },
        { x: 2120, y: 200, w: 140, h: 18 },
        { x: 2340, y: 340, w: 160, h: 18 }
      ],
      spikes: [
        { x: 220, y: 464, w: 40 },
        { x: 520, y: 464, w: 50 },
        { x: 900, y: 464, w: 45 },
        { x: 1450, y: 464, w: 60 },
        { x: 1850, y: 464, w: 40 },
        { x: 2250, y: 464, w: 50 }
      ],
      fragments: [
        { x: 460, y: 240, collected: false },
        { x: 1190, y: 160, collected: false },
        { x: 2160, y: 160, collected: false }
      ],
      exitX: 2450,
      bg: '#1a1018'
    }
  ];
  return levels[idx];
}

let level = null;

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m + ':' + String(sec).padStart(2, '0');
}

function showMsg(txt, duration = 2200) {
  showMessage = txt;
  messageTimer = duration;
  messageEl.textContent = txt;
  messageEl.classList.remove('hidden');
}

function resetPlayer() {
  player.x = 50;
  player.y = level.groundY - player.h - 10;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  cameraX = 0;
}

function startLevel(idx) {
  currentLevel = idx;
  level = makeLevel(idx);
  fragmentsCollected = level.fragments.filter(f => f.collected).length;
  totalFragments = level.fragments.length;
  levelLabel.textContent = 'Niveau ' + (idx + 1) + ' — ' + level.name;
  fragmentsEl.textContent = 'Fragments : ' + fragmentsCollected + '/' + totalFragments;
  resetPlayer();
  state = 'playing';
  if (idx === 0) startTime = performance.now();
}

function update(dt) {
  if (state !== 'playing') return;

  const left = keys['ArrowLeft'] || keys['a'] || keys['A'];
  const right = keys['ArrowRight'] || keys['d'] || keys['D'];
  const jump = keys[' '] || keys['ArrowUp'] || keys['w'] || keys['W'];

  const speed = 220;
  if (left) { player.vx = -speed; player.facing = -1; }
  else if (right) { player.vx = speed; player.facing = 1; }
  else player.vx *= 0.75;

  if (jump && player.onGround) {
    player.vy = -420;
    player.onGround = false;
  }

  player.vy += 1400 * dt;
  if (player.vy > 900) player.vy = 900;

  player.x += player.vx * dt;
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > level.width) player.x = level.width - player.w;

  player.y += player.vy * dt;
  player.onGround = false;

  if (player.y + player.h >= level.groundY) {
    player.y = level.groundY - player.h;
    player.vy = 0;
    player.onGround = true;
  }

  for (const p of level.platforms) {
    const pl = { x: player.x, y: player.y, w: player.w, h: player.h };
    if (rectsOverlap(pl, p)) {
      if (player.vy >= 0 && player.y + player.h - player.vy * dt <= p.y + 6) {
        player.y = p.y - player.h;
        player.vy = 0;
        player.onGround = true;
      }
    }
  }

  for (const s of level.spikes) {
    const spike = { x: s.x, y: s.y, w: s.w, h: 16 };
    if (rectsOverlap({ x: player.x + 4, y: player.y + 8, w: player.w - 8, h: player.h - 8 }, spike)) {
      showMsg('Aïe ! Les pointes…');
      resetPlayer();
      return;
    }
  }

  for (const f of level.fragments) {
    if (f.collected) continue;
    const fr = { x: f.x, y: f.y, w: 22, h: 22 };
    if (rectsOverlap({ x: player.x, y: player.y, w: player.w, h: player.h }, fr)) {
      f.collected = true;
      fragmentsCollected++;
      fragmentsEl.textContent = 'Fragments : ' + fragmentsCollected + '/' + totalFragments;
      showMsg('Fragment récupéré !');
      if (fragmentsCollected === totalFragments) {
        setTimeout(() => {
          state = 'lore';
          loreTitle.textContent = LORE[currentLevel].title;
          loreText.textContent = LORE[currentLevel].text;
          loreScreen.classList.remove('hidden');
        }, 600);
      }
    }
  }

  if (fragmentsCollected >= totalFragments && player.x > level.exitX) {
    if (currentLevel < 2) {
      startLevel(currentLevel + 1);
      showMsg('Niveau suivant…');
    } else {
      elapsed = performance.now() - startTime;
      state = 'win';
      winStats.textContent = 'Temps total : ' + formatTime(elapsed) + ' — Tous les fragments réunis !';
      winScreen.classList.remove('hidden');
    }
  }

  cameraX = player.x - W * 0.35;
  if (cameraX < 0) cameraX = 0;
  if (cameraX > level.width - W) cameraX = level.width - W;

  if (messageTimer > 0) {
    messageTimer -= dt * 1000;
    if (messageTimer <= 0) messageEl.classList.add('hidden');
  }

  if (startTime) {
    timerEl.textContent = 'Temps : ' + formatTime(performance.now() - startTime);
  }

  player.anim += dt * 8;
}

function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  if (currentLevel === 0) {
    g.addColorStop(0, '#1e1810');
    g.addColorStop(1, '#0d0a08');
  } else if (currentLevel === 1) {
    g.addColorStop(0, '#101a12');
    g.addColorStop(1, '#080e0a');
  } else {
    g.addColorStop(0, '#1a1018');
    g.addColorStop(1, '#0c080c');
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(60,45,30,0.35)';
  for (let i = 0; i < 8; i++) {
    const bx = ((i * 280) - cameraX * 0.2) % (W + 200) - 50;
    const bh = 80 + (i % 3) * 40;
    ctx.fillRect(bx, H - bh - 40, 60 + (i % 4) * 20, bh);
  }
}

function drawGround() {
  const gy = level.groundY;
  ctx.fillStyle = '#2a2218';
  ctx.fillRect(0, gy, W, H - gy);

  ctx.fillStyle = '#3a3020';
  for (let x = -((cameraX % 40)); x < W; x += 40) {
    ctx.fillRect(x, gy, 38, 8);
  }

  ctx.fillStyle = '#6a5050';
  for (const s of level.spikes) {
    const sx = s.x - cameraX;
    if (sx + s.w < 0 || sx > W) continue;
    const spikes = Math.max(2, Math.floor(s.w / 12));
    for (let i = 0; i < spikes; i++) {
      const px = sx + i * (s.w / spikes);
      ctx.beginPath();
      ctx.moveTo(px, s.y + 16);
      ctx.lineTo(px + s.w / spikes / 2, s.y);
      ctx.lineTo(px + s.w / spikes, s.y + 16);
      ctx.fill();
    }
  }
}

function drawPlatforms() {
  for (const p of level.platforms) {
    const px = p.x - cameraX;
    if (px + p.w < 0 || px > W) continue;
    ctx.fillStyle = '#4a3c28';
    ctx.fillRect(px, p.y, p.w, p.h);
    ctx.fillStyle = '#6b5430';
    ctx.fillRect(px, p.y, p.w, 4);
    ctx.fillStyle = 'rgba(60,90,40,0.5)';
    ctx.fillRect(px + 2, p.y - 2, p.w - 4, 3);
  }
}

function drawFragments() {
  for (const f of level.fragments) {
    if (f.collected) continue;
    const fx = f.x - cameraX;
    if (fx < -30 || fx > W + 30) continue;
    const pulse = 0.7 + 0.3 * Math.sin(performance.now() / 300);
    ctx.beginPath();
    ctx.arc(fx + 11, f.y + 11, 16 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(232, 197, 71, 0.25)';
    ctx.fill();
    ctx.fillStyle = '#e8c547';
    ctx.beginPath();
    ctx.moveTo(fx + 11, f.y);
    ctx.lineTo(fx + 22, f.y + 11);
    ctx.lineTo(fx + 11, f.y + 22);
    ctx.lineTo(fx, f.y + 11);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fff8c0';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function drawExit() {
  if (fragmentsCollected < totalFragments) return;
  const ex = level.exitX - cameraX;
  if (ex < -40 || ex > W + 40) return;
  const pulse = 0.6 + 0.4 * Math.sin(performance.now() / 250);
  ctx.fillStyle = `rgba(120, 180, 255, ${0.3 * pulse})`;
  ctx.fillRect(ex, level.groundY - 90, 36, 90);
  ctx.strokeStyle = '#88ccff';
  ctx.lineWidth = 3;
  ctx.strokeRect(ex, level.groundY - 90, 36, 90);
  ctx.fillStyle = '#c0e0ff';
  ctx.font = '12px sans-serif';
  ctx.fillText('→', ex + 10, level.groundY - 100);
}

function drawPlayer() {
  const px = player.x - cameraX;
  const py = player.y;

  ctx.fillStyle = '#c9a070';
  ctx.fillRect(px + 4, py + 10, 20, 22);
  ctx.fillStyle = '#e0c090';
  ctx.fillRect(px + 6, py, 16, 14);
  ctx.fillStyle = '#1a120b';
  ctx.fillRect(px + (player.facing > 0 ? 14 : 8), py + 5, 4, 4);
  const leg = Math.sin(player.anim) * 4 * (Math.abs(player.vx) > 20 ? 1 : 0);
  ctx.fillStyle = '#5a4030';
  ctx.fillRect(px + 6, py + 30, 7, 8 + leg);
  ctx.fillRect(px + 15, py + 30, 7, 8 - leg);
  ctx.fillStyle = '#c9a070';
  ctx.fillRect(px + (player.facing > 0 ? 22 : 0), py + 14, 6, 12);
}

function draw() {
  if (!level) return;
  ctx.clearRect(0, 0, W, H);
  drawBackground();
  drawGround();
  drawPlatforms();
  drawFragments();
  drawExit();
  drawPlayer();
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

window.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.key] = false; });

document.getElementById('btn-start').addEventListener('click', () => {
  startScreen.classList.add('hidden');
  startLevel(0);
  showMsg('Collecte les 3 fragments de ce niveau !');
});

document.getElementById('btn-continue').addEventListener('click', () => {
  loreScreen.classList.add('hidden');
  if (currentLevel < 2 && fragmentsCollected >= totalFragments) {
    state = 'playing';
  } else if (currentLevel === 2 && fragmentsCollected >= totalFragments) {
    elapsed = performance.now() - startTime;
    state = 'win';
    winStats.textContent = 'Temps total : ' + formatTime(elapsed) + ' — Tous les fragments réunis !';
    winScreen.classList.remove('hidden');
  } else {
    state = 'playing';
  }
});

document.getElementById('btn-replay').addEventListener('click', () => {
  winScreen.classList.add('hidden');
  startLevel(0);
  showMsg('Nouvelle partie !');
});

document.getElementById('score-form').addEventListener('submit', e => {
  e.preventDefault();
  const prenom = document.getElementById('prenom').value.trim();
  const nom = document.getElementById('nom').value.trim();
  const classe = document.getElementById('classe').value.trim();

  if (classe !== CLASS_CODE && classe.toLowerCase() !== '5e8' && classe !== '5°8') {
    formFeedback.textContent = 'Classe incorrecte. Seule la 5°8 peut enregistrer un score.';
    formFeedback.classList.add('error');
    return;
  }
  if (!prenom || !nom) {
    formFeedback.textContent = 'Prénom et nom obligatoires.';
    formFeedback.classList.add('error');
    return;
  }

  const scores = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  scores.push({
    prenom,
    nom,
    classe: CLASS_CODE,
    time: elapsed,
    timeStr: formatTime(elapsed),
    fragments: 9,
    date: new Date().toISOString()
  });
  scores.sort((a, b) => a.time - b.time);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));

  formFeedback.textContent = 'Score enregistré ! Merci ' + prenom + ' ✨';
  formFeedback.classList.remove('error');
  document.getElementById('score-form').reset();
});

document.getElementById('btn-results').addEventListener('click', () => {
  startScreen.classList.add('hidden');
  resultsScreen.classList.remove('hidden');
  authBox.classList.remove('hidden');
  resultsList.classList.add('hidden');
  authError.textContent = '';
  document.getElementById('auth-classe').value = '';
});

document.getElementById('btn-auth').addEventListener('click', () => {
  const val = document.getElementById('auth-classe').value.trim();
  if (val === CLASS_CODE || val.toLowerCase() === '5e8' || val === '5°8') {
    authBox.classList.add('hidden');
    resultsList.classList.remove('hidden');
    renderResults();
  } else {
    authError.textContent = 'Code incorrect. Réservé à la classe 5°8.';
  }
});

document.getElementById('btn-back').addEventListener('click', () => {
  resultsScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
});

document.getElementById('btn-clear').addEventListener('click', () => {
  if (confirm('Effacer tous les scores enregistrés ?')) {
    localStorage.removeItem(STORAGE_KEY);
    renderResults();
  }
});

function renderResults() {
  const scores = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  resultsBody.innerHTML = '';
  if (scores.length === 0) {
    resultsBody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#a89060">Aucun score pour le moment.</td></tr>';
    return;
  }
  scores.forEach((s, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i + 1}</td><td>${escapeHtml(s.prenom)}</td><td>${escapeHtml(s.nom)}</td><td>${s.timeStr}</td><td>${s.fragments}/9</td>`;
    resultsBody.appendChild(tr);
  });
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  const t = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = (t.clientX - rect.left) / rect.width;
  if (x < 0.3) { keys['a'] = true; }
  else if (x > 0.7) { keys['d'] = true; }
  else { keys[' '] = true; }
}, { passive: false });
canvas.addEventListener('touchend', () => {
  keys['a'] = keys['d'] = keys[' '] = false;
});
