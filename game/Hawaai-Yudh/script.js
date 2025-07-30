// Canvas Setup
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let gameon = false;

// Score Handling
let score = 0;
let bestScore = parseInt(localStorage.getItem("score")) || 0;
document.getElementById("best-score").innerText = bestScore;

// Entities
let bulletArray = [];
let villanArray = [];

// Player
let player = {
  x: 0,
  y: 0,
  s: 20,
  w: 30,
  h: 30,
  l: 1,
};

// Responsive Canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  player.y = canvas.height - 70;
  player.x = canvas.width / 2 - player.w / 2;

  if (canvas.width < 500) {
    player.w = 40;
    player.h = 40;
    player.s = 8;
  } else if (canvas.width < 1024) {
    player.w = 35;
    player.h = 35;
    player.s = 12;
  } else {
    player.w = 30;
    player.h = 30;
    player.s = 20;
  }
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Unified Pointer Controls (Desktop + Touch)
let isDragging = false;
canvas.addEventListener("pointerdown", (e) => {
  isDragging = true;
  const rect = canvas.getBoundingClientRect();
  const pointerX = e.clientX - rect.left;
  player.x = pointerX - player.w / 2;
  if (!gameon) startGame();
});

canvas.addEventListener("pointermove", (e) => {
  if (!isDragging) return;
  const rect = canvas.getBoundingClientRect();
  const pointerX = e.clientX - rect.left;
  player.x = pointerX - player.w / 2;
  e.preventDefault();
}, { passive: false });

canvas.addEventListener("pointerup", () => {
  isDragging = false;
});

// Auto Shooting
setInterval(() => {
  if (gameon) newBullet(player, -1);
}, 300);

// Keyboard Controls (Optional for PC)
document.addEventListener("keydown", e => {
  if (!gameon) return startGame();
});

function movePlayer() {}

function newBullet(shooter, direction) {
  bulletArray.push({
    x: shooter.x + shooter.w / 2 - 5,
    y: shooter.y - 20,
    w: 10,
    h: 20,
    s: 15,
    d: direction
  });
}

function moveBullets() {
  bulletArray = bulletArray.filter(bullet => {
    bullet.y += bullet.s * bullet.d;
    return bullet.y >= 0 && bullet.y <= canvas.height;
  });
}

// Villan Spawning and Difficulty
let villanInt = 124;
let villanIncrement = 0;
let prevVillan = 0;
let maxVillanSpeed = 2;

function makeVillans() {
  if (villanIncrement > prevVillan + villanInt || villanIncrement === 0) {
    const size = Math.floor(Math.random() * 3) + 1;
    villanArray.push({
      x: Math.floor(Math.random() * (canvas.width - 100)),
      y: 0,
      w: 40 * size,
      h: 40 * size,
      speed: maxVillanSpeed - size * 0.2,
      size: size
    });
    prevVillan = villanIncrement;
  }

  villanIncrement++;

  if (score < 100) {
    if (villanIncrement % 300 === 0) maxVillanSpeed += 0.1;
  } else {
    if (villanIncrement % 150 === 0) {
      maxVillanSpeed += 0.3;
      if (villanInt > 30) villanInt -= 5;
    }
  }
}

function moveVillans() {
  for (let i = villanArray.length - 1; i >= 0; i--) {
    const v = villanArray[i];
    v.y += v.speed;
    if (v.y + v.h > canvas.height) {
      villanArray.splice(i, 1);
      lostLife();
    }
  }
}

function checkVillanCollision() {
  for (let i = villanArray.length - 1; i >= 0; i--) {
    const v = villanArray[i];
    for (let j = bulletArray.length - 1; j >= 0; j--) {
      const b = bulletArray[j];
      if (
        b.x < v.x + v.w &&
        b.x + b.w > v.x &&
        b.y < v.y + v.h &&
        b.y + b.h > v.y
      ) {
        bulletArray.splice(j, 1);
        v.size--;
        if (v.size <= 0) {
          villanArray.splice(i, 1);
        } else {
          v.w = v.h = 40 * v.size;
          v.speed = maxVillanSpeed - v.size * 0.2;
          v.x += 10;
        }
        score++;
        document.getElementById("score").innerText = score;
        break;
      }
    }
  }
}

let redFlash = false;
function lostLife() {
  player.l -= 0.1;
  if (player.l <= 0) endGame();
  redFlash = true;
  setTimeout(() => redFlash = false, 100);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (redFlash) {
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  drawGround();
  drawHealth();
  drawPlayer();
  bulletArray.forEach(drawBullet);
  villanArray.forEach(drawVillan);
}

function drawPlayer() {
  ctx.fillStyle = "aqua";
  ctx.shadowColor = "aqua";
  ctx.shadowBlur = 20;
  ctx.fillRect(player.x, player.y, player.w, player.h);
}

function drawGround() {
  ctx.fillStyle = "green";
  ctx.shadowColor = "green";
  ctx.shadowBlur = 20;
  ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
}

function drawHealth() {
  ctx.fillStyle = "red";
  ctx.shadowColor = "red";
  ctx.shadowBlur = 20;
  ctx.fillRect(0, 0, canvas.width * player.l, 5);
}

function drawBullet(b) {
  ctx.fillStyle = "pink";
  ctx.shadowColor = "pink";
  ctx.shadowBlur = 20;
  ctx.fillRect(b.x, b.y, b.w, b.h);
}

function drawVillan(v) {
  if (v.size === 1) {
    ctx.fillStyle = ctx.shadowColor = "#444";
    ctx.shadowBlur = 5;
  } else if (v.size === 2) {
    ctx.fillStyle = ctx.shadowColor = "#800";
    ctx.shadowBlur = 10;
  } else {
    ctx.fillStyle = ctx.shadowColor = "#06f";
    ctx.shadowBlur = 15;
  }
  ctx.fillRect(v.x, v.y, v.w, v.h);
}

function frame() {
  if (!gameon) return;
  movePlayer();
  moveBullets();
  makeVillans();
  moveVillans();
  checkVillanCollision();
  draw();
  requestAnimationFrame(frame);
}

function startGame() {
  document.querySelectorAll(".extra-screen").forEach(el => el.classList.add("hide"));
  document.getElementById("score").innerText = score = 0;
  document.getElementById("new-record").classList.add("hide");

  bulletArray = [];
  villanArray = [];

  player.l = 1;
  player.x = canvas.width / 2 - player.w / 2;

  villanInt = 124;
  villanIncrement = 0;
  prevVillan = 0;
  maxVillanSpeed = 2;

  gameon = true;
  frame();
}

function endGame() {
  gameon = false;
  document.getElementById("lose-title").classList.remove("hide");

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("score", bestScore);
    document.getElementById("best-score").innerText = bestScore;
    document.getElementById("new-record").classList.remove("hide");
  }
}

draw();
