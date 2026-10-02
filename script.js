const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const backBtn = document.getElementById('backBtn');
const gameOverBox = document.getElementById('gameOver');
const scoreEl = document.getElementById('score');
const finalScoreEl = document.getElementById('finalScore');

const GRID = 24;
const CELL = canvas.width / GRID;
let snake, food, direction, nextDirection, score, running, timer, touchStart;

function resetGame() {
  snake = [
    { x: 12, y: 12 },
    { x: 11, y: 12 },
    { x: 10, y: 12 }
  ];
  food = randomFood();
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  scoreEl.textContent = score;
  gameOverBox.classList.add('hidden');
  draw();
}

function randomFood() {
  let f;
  do {
    f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (snake && snake.some(s => s.x === f.x && s.y === f.y));
  return f;
}

function startGame() {
  startScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  resetGame();
  running = true;
  scheduleTick();
}

function scheduleTick() {
  clearTimeout(timer);
  if (!running) return;
  const speed = Math.max(55, 125 - score * 3);
  timer = setTimeout(tick, speed);
}

function tick() {
  if (!running) return;
  direction = nextDirection;
  const head = snake[0];
  const newHead = {
    x: (head.x + direction.x + GRID) % GRID,
    y: (head.y + direction.y + GRID) % GRID
  };

  if (snake.some(part => part.x === newHead.x && part.y === newHead.y)) {
    endGame();
    return;
  }

  snake.unshift(newHead);
  if (newHead.x === food.x && newHead.y === food.y) {
    score++;
    scoreEl.textContent = score;
    food = randomFood();
  } else {
    snake.pop();
  }
  draw();
  scheduleTick();
}

function endGame() {
  running = false;
  clearTimeout(timer);
  finalScoreEl.textContent = score;
  gameOverBox.classList.remove('hidden');
  draw();
}

function setDirection(name) {
  const dirs = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };
  const d = dirs[name];
  if (!d) return;
  if (d.x === -direction.x && d.y === -direction.y) return;
  nextDirection = d;
}

function draw() {
  ctx.fillStyle = '#031026';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(255,255,255,.035)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= GRID; i++) {
    ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(canvas.width, i * CELL); ctx.stroke();
  }

  ctx.fillStyle = '#ff2638';
  ctx.beginPath();
  ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL * .30, 0, Math.PI * 2);
  ctx.fill();

  snake.forEach((part, index) => {
    const gap = 2;
    ctx.fillStyle = index === 0 ? '#ff3b4b' : '#e8172d';
    ctx.fillRect(part.x * CELL + gap, part.y * CELL + gap, CELL - gap * 2, CELL - gap * 2);
  });

  if (snake.length) {
    const head = snake[0];
    ctx.fillStyle = '#06152d';
    const eyeSize = Math.max(2, CELL * .09);
    let ex1 = head.x * CELL + CELL * .32;
    let ey1 = head.y * CELL + CELL * .32;
    let ex2 = head.x * CELL + CELL * .62;
    let ey2 = head.y * CELL + CELL * .32;
    if (direction.x < 0) { ex1 = ex2 = head.x * CELL + CELL * .30; ey1 = head.y * CELL + CELL * .32; ey2 = head.y * CELL + CELL * .62; }
    if (direction.x > 0) { ex1 = ex2 = head.x * CELL + CELL * .70; ey1 = head.y * CELL + CELL * .32; ey2 = head.y * CELL + CELL * .62; }
    if (direction.y > 0) { ex1 = head.x * CELL + CELL * .32; ex2 = head.x * CELL + CELL * .62; ey1 = ey2 = head.y * CELL + CELL * .70; }
    ctx.fillRect(ex1 - eyeSize/2, ey1 - eyeSize/2, eyeSize, eyeSize);
    ctx.fillRect(ex2 - eyeSize/2, ey2 - eyeSize/2, eyeSize, eyeSize);
  }
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
backBtn.addEventListener('click', () => {
  running = false;
  clearTimeout(timer);
  gameScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
});

document.querySelectorAll('[data-dir]').forEach(btn => {
  btn.addEventListener('click', () => setDirection(btn.dataset.dir));
});

document.addEventListener('keydown', e => {
  const keys = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', W: 'up', s: 'down', S: 'down', a: 'left', A: 'left', d: 'right', D: 'right'
  };
  if (keys[e.key]) {
    e.preventDefault();
    setDirection(keys[e.key]);
  }
});

canvas.addEventListener('touchstart', e => {
  const t = e.changedTouches[0];
  touchStart = { x: t.clientX, y: t.clientY };
}, { passive: true });

canvas.addEventListener('touchend', e => {
  if (!touchStart) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStart.x;
  const dy = t.clientY - touchStart.y;
  touchStart = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
  if (Math.abs(dx) > Math.abs(dy)) setDirection(dx > 0 ? 'right' : 'left');
  else setDirection(dy > 0 ? 'down' : 'up');
}, { passive: true });

resetGame();
