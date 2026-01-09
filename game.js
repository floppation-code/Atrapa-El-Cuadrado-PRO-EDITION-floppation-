let score = 0;
let timeLeft = 30;
let moveInterval, timerInterval;
let gameRunning = false;

const real = document.querySelector(".real");
const fakes = document.querySelectorAll(".fake");
const gameArea = document.getElementById("gameArea");
const scoreText = document.getElementById("score");
const recordText = document.getElementById("record");
const timeInput = document.getElementById("timeInput");
const modeSelect = document.getElementById("mode");
const startBtn = document.getElementById("startBtn");
const endMsg = document.getElementById("endMsg");
const comboMsg = document.getElementById("comboMsg");

let record = localStorage.getItem("record") || 0;
recordText.textContent = record;

/* ---------- UTILIDADES ---------- */

function randomPos(el) {
  let safe = false;

  while (!safe) {
    const maxX = gameArea.clientWidth - el.clientWidth;
    const maxY = gameArea.clientHeight - el.clientHeight;

    el.style.left = Math.random() * maxX + "px";
    el.style.top = Math.random() * maxY + "px";

    safe = true;
    document.querySelectorAll(".square").forEach(other => {
      if (other !== el && isColliding(el, other)) {
        safe = false;
      }
    });
  }
}

function isColliding(a, b) {
  const ar = a.getBoundingClientRect();
  const br = b.getBoundingClientRect();

  return !(
    ar.right < br.left ||
    ar.left > br.right ||
    ar.bottom < br.top ||
    ar.top > br.bottom
  );
}

function moveAll() {
  randomPos(real);
  fakes.forEach(f => randomPos(f));
}

function showCombo(points) {
  if (points > 1000) return;

  comboMsg.textContent = `🎉 Wow, conseguiste ${points} puntos ¡felicidades!`;
  comboMsg.classList.add("show");

  setTimeout(() => {
    comboMsg.classList.remove("show");
  }, 1200);
}

/* ---------- JUEGO ---------- */

function endGame() {
  gameRunning = false;
  clearInterval(moveInterval);
  clearInterval(timerInterval);

  document.querySelectorAll(".square").forEach(s => s.style.display = "none");

  if (score > record) {
    record = score;
    localStorage.setItem("record", record);
    recordText.textContent = record;
    endMsg.textContent = "🔥 ¡Nuevo récord! " + score;
  } else {
    endMsg.textContent = "Fin del juego | Puntos: " + score;
  }

  gameArea.style.backgroundColor = "#f2f2f2";
}

function tapReal(e) {
  e.preventDefault();
  if (!gameRunning) return;

  score++;
  scoreText.textContent = score;

  if (score % 10 === 0) {
    showCombo(score);
  }

  randomPos(real);
}

function tapFake(e) {
  e.preventDefault();
  if (!gameRunning) return;

  score = Math.max(0, score - 1);
  scoreText.textContent = score;
}

real.addEventListener("touchstart", tapReal);
real.addEventListener("click", tapReal);

fakes.forEach(f => {
  f.addEventListener("touchstart", tapFake);
  f.addEventListener("click", tapFake);
});

/* ---------- INICIO ---------- */

startBtn.onclick = () => {
  score = 0;
  scoreText.textContent = score;
  endMsg.textContent = "";

  timeLeft = Number(timeInput.value);
  gameRunning = true;

  document.querySelectorAll(".square").forEach(s => s.style.display = "block");

  const mode = modeSelect.value;

  if (mode === "hard") {
    real.style.backgroundColor = "#8B0000";
    fakes.forEach(f => f.style.backgroundColor = "#7A0000");
    gameArea.style.backgroundColor = "#f2f2f2";
    moveInterval = setInterval(moveAll, 500);
  } else if (mode === "nightmare") {
    real.style.backgroundColor = "#A50000";
    fakes.forEach(f => f.style.backgroundColor = "#A50000");
    gameArea.style.backgroundColor = "#B30000";
    moveInterval = setInterval(moveAll, 300);
  } else {
    real.style.backgroundColor = "red";
    fakes.forEach(f => f.style.backgroundColor = "blue");
    gameArea.style.backgroundColor = "#f2f2f2";
    moveInterval = setInterval(moveAll, 900);
  }

  moveAll();

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) endGame();
  }, 1000);
};
