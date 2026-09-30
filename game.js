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
let state = 'title';
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

const player = {
  x: 60, y: 300, w: 28, h: 36,
  vx: 0, vy: 0,
  onGround: false,
  facing: 1,
  anim: 0
};

const LORE = [
  {
    title: 'Fragment 1 — Origine',
    text: 'Cette pierre n\u2019est pas ordinaire. Les anciens la nommaient \u00ab C\u0153ur de la Terre \u00bb. On dit qu\u2019elle s\u2019est form\u00e9e au moment o\u00f9 le premier \u00e9clair a frapp\u00e9 le sol, fusionnant roche, lumi\u00e8re et m\u00e9moire.'
  },
  {
    title: 'Fragment 2 — Les artistes',
    text: 'Dans les ateliers des sculpteurs, on racontait que quiconque touchait la pierre voyait appara\u00eetre des formes invisibles. Elle inspirait les formes, les couleurs, les r\u00eaves. C\u2019est pour cela qu\u2019on la recherchait tant.'
  },
  {
    title: 'Fragment 3 — Disparition',
    text: 'Il y a des si\u00e8cles, la pierre fut bris\u00e9e en trois. Les fragments furent cach\u00e9s dans des lieux sacr\u00e9s : une grotte, une for\u00eat oubli\u00e9e, et un temple enseveli. Celui qui les r\u00e9unira comprendra enfin son vrai pouvoir\u2026'
  },
  {
    title: 'La Pierre r\u00e9unie',
    text: 'Les trois fragments se rejoignent. La pierre pulse d\u2019une lueur douce. Elle ne donne pas de pouvoir magique\u2026 elle rappelle simplement que l\u2019art na\u00eet de la mati\u00e8re, de la patience et du regard. Tu as accompli ton voyage.'
  }
];

function makeLevel(idx) {
  const levels = [
    {
      name: 'La Grotte oubli\u00e9e',
      width: 2200,
      groundY: 480,
      platforms: [
        { x: 160, y: 410, w: 130, h: 18 },
        { x: 340, y: 360, w: 120, h: 18 },
        { x: 510, y: 310, w: 140, h: 18 },
        { x: 700, y: 370, w: 100, h: 18 },
        { x: 860, y: 320, w: 150, h: 18 },
        { x: 1080, y: 270, w: 120, h: 18 },
        { x: 1260, y: 340, w: 160, h: 18 },
        { x: 1500, y: 390, w: 130, h: 18 },
        { x: 1680, y: 310, w: 180, h: 18 },
        { x: 1920, y: 370, w: 150, h: 18 }
      ],
      spikes: [
        { x: 300, y: 464, w: 40 },
        { x: 640, y: 464, w: 50 },
        { x: 1000, y: 464, w: 40 },
        { x: 1450, y: 464, w: 60 }
      ],
      fragments: [
        { x: 550, y: 270, collected: false },
        { x: 1120, y: 230, collected: false },
        { x: 1740, y: 270, collected: false }
      ],
      exitX: 2050,
      bg: '#1a1510'
    },
    {
      name: 'La For\u00eat des murmures',
      width: 2400,
      groundY: 480,
      platforms: [
        { x: 140, y: 400, w: 110, h: 16 },
        { x: 290, y: 350, w: 120, h: 16 },
        { x: 460, y: 300, w: 100, h: 16 },
        { x: 610, y: 360, w: 140, h: 16 },
        { x: 810, y: 310, w: 120, h: 16 },
        { x: 990, y: 250, w: 110, h: 16 },
        { x: 1160, y: 320, w: 150, h: 16 },
        { x: 1380, y: 270, w: 120, h: 16 },
        { x: 1570, y: 370, w: 130, h: 16 },
        { x: 1760, y: 310, w: 140, h: 16 },
        { x: 1980, y: 360, w: 170, h: 16 }
      ],
      spikes: [
        { x: 400, y: 464, w: 45 },
        { x: 750, y: 464, w: 40 },
        { x: 1200, y: 464, w: 55 },
        { x: 1650, y: 464, w: 40 },
        { x: 1900, y: 464, w: 50 }
      ],
      fragments: [
        { x: 490, y: 260, collected: false },
        { x: 1020, y: 210, collected: false },
        { x: 1800, y: 270, collected: false }
      ],
      exitX: 2200,
      bg: '#121a12'
    },
    {
      name: 'Le Temple enseveli',
      width: 2600,
      groundY: 480,
      platforms: [
        { x: 120, y: 410, w: 110, h: 18 },
        { x: 270, y: 360, w: 100, h: 18 },
        { x: 420, y: 310, w: 140, h: 18 },
        { x: 610, y: 370, w: 110, h: 18 },
        { x: 780, y: 290, w: 130, h: 18 },
        { x: 970, y: 340, w: 120, h: 18 },
        { x: 1150, y: 260, w: 100, h: 18 },
        { x: 1310, y: 320, w: 150, h: 18 },
        { x: 1530, y: 280, w: 120, h: 18 },
        { x: 1710, y: 370, w: 140, h: 18 },
        { x: 1910, y: 310, w: 120, h: 18 },
        { x: 2100, y: 250, w: 140, h: 18 },
        { x: 2320, y: 360, w: 160, h: 18 }
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
        { x: 460, y: 270, collected: false },
        { x: 1180, y: 220, collected: false },
        { x: 2140, y: 210, collected: false }
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
  levelLabel.textContent = 'Niveau ' + (idx + 1) + ' \u2014 ' + level.name;
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

  const speed = 240;
  if (left) { player.vx = -speed; player.facing = -1; }
  else if (right) { player.vx = speed; player.facing = 1; }
  else player.vx *= 0.7;

  if (jump && player.onGround) {
    player.vy = -580;
    player.onGround = false;
  }

  player.vy += 1100 * dt;
  if (player.vy > 850) player.vy = 850;

  const prevX = player.x;
  const prevY = player.y;
  const prevBottom = prevY + player.h;

  player.x += player.vx * dt;
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > level.width) player.x = level.width - player.w;

  for (const p of level.platforms) {
    if (rectsOverlap(
      { x: player.x, y: prevY + 2, w: player.w, h: player.h - 4 },
      p
    )) {
      if (player.vx > 0) player.x = p.x - player.w;
      else if (player.vx < 0) player.x = p.x + p.w;
      player.vx = 0;
    }
  }

  player.y += player.vy * dt;
  player.onGround = false;

  if (player.y + player.h >= level.groundY) {
    player.y = level.groundY - player.h;
    player.vy = 0;
    player.onGround = true;
  }

  for (const p of level.platforms) {
    const playerRect = { x: player.x, y: player.y, w: player.w, h: player.h };
    if (!rectsOverlap(playerRect, p)) continue;

    if (player.vy >= 0 && prevBottom <= p.y + 8) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.onGround = true;
    }
    else if (player.vy < 0 && prevY >= p.y + p.h - 4) {
      player.y = p.y + p.h;
      player.vy = 0;
    }
  }

  for (const s of level.spikes) {
    const spike = { x: s.x, y: s.y, w: s.w, h: 16 };
    if (rectsOverlap({ x: player.x + 4, y: player.y + 8, w: player.w - 8, h: player.h - 8 }, spike)) {
      showMsg('A\u00efe ! Les pointes\u2026');
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
      showMsg('Fragment r\u00e9cup\u00e9r\u00e9 !');
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
      showMsg('Niveau suivant\u2026');
    } else {
      elapsed = performance.now() - startTime;
      state = 'win';
      winStats.textContent = 'Temps total : ' + formatTime(elapsed) + ' \u2014 Tous les fragments r\u00e9unis !';
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
  ctx.fillText('\u2192', ex + 10, level.groundY - 100);
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
    winStats.textContent = 'Temps total : ' + formatTime(elapsed) + ' \u2014 Tous les fragments r\u00e9unis !';
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

  if (classe !== CLASS_CODE && classe.toLowerCase() !== '5e8' && classe !== '5\u00b08') {
    formFeedback.textContent = 'Classe incorrecte. Seule la 5\u00b08 peut enregistrer un score.';
    formFeedback.classList.add('error');
    return;
  }
  if (!prenom || !nom) {
    formFeedback.textContent = 'Pr\u00e9nom et nom obligatoires.';
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

  formFeedback.textContent = 'Score enregistr\u00e9 ! Merci ' + prenom + ' \u2728';
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
  if (val === CLASS_CODE || val.toLowerCase() === '5e8' || val === '5\u00b08') {
    authBox.classList.add('hidden');
    resultsList.classList.remove('hidden');
    renderResults();
  } else {
    authError.textContent = 'Code incorrect. R\u00e9serv\u00e9 \u00e0 la classe 5\u00b08.';
  }
});

document.getElementById('btn-back').addEventListener('click', () => {
  resultsScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
});

document.getElementById('btn-clear').addEventListener('click', () => {
  if (confirm('Effacer tous les scores enregistr\u00e9s ?')) {
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
