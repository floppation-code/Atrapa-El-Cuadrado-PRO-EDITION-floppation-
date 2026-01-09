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

let record = localStorage.getItem("record") || 0;
recordText.textContent = record;

function randomPos(el) {
  const maxX = gameArea.clientWidth - el.clientWidth;
  const maxY = gameArea.clientHeight - el.clientHeight;
  el.style.left = Math.random() * maxX + "px";
  el.style.top = Math.random() * maxY + "px";
}

function moveAll() {
  randomPos(real);
  fakes.forEach(f => randomPos(f));
}

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
}

function tapReal(e) {
  e.preventDefault();
  if (!gameRunning) return;
  score++;
  scoreText.textContent = score;
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

startBtn.onclick = () => {
  score = 0;
  scoreText.textContent = score;
  endMsg.textContent = "";

  timeLeft = Number(timeInput.value);
  gameRunning = true;

  // Mostrar cuadrados
  document.querySelectorAll(".square").forEach(s => s.style.display = "block");

  const mode = modeSelect.value;

  if (mode === "hard") {
    real.style.backgroundColor = "#8B0000"; // rojo oscuro
    fakes.forEach(f => f.style.backgroundColor = "#7a0000"); // casi rojo
    moveInterval = setInterval(moveAll, 500);
  } else {
    real.style.backgroundColor = "red";
    fakes.forEach(f => f.style.backgroundColor = "blue");
    moveInterval = setInterval(moveAll, 900);
  }

  moveAll();

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) endGame();
  }, 1000);
};