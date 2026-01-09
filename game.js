const gameArea = document.getElementById("gameArea");
const scoreText = document.getElementById("score");
const recordText = document.getElementById("record");
const timeInput = document.getElementById("timeInput");
const modeSelect = document.getElementById("mode");
const extraModeSelect = document.getElementById("extraMode");
const startBtn = document.getElementById("startBtn");
const exitBtn = document.getElementById("exitBtn");
const msg = document.getElementById("msg");

const panelNormal = document.getElementById("panelNormal");
const panelHide = document.getElementById("panelHide");
const phaseText = document.getElementById("phase");

let squares = [];
let realSquare = null;

let score = 0;
let timeLeft = 0;
let timer = null;
let gameRunning = false;
let hidePhase = 1;

/* ===== UTIL ===== */
function clearGame() {
  clearInterval(timer);
  timer = null;
  gameRunning = false;
  gameArea.innerHTML = "";
}

function randomPos(el) {
  el.style.left = Math.random() * (gameArea.clientWidth - 50) + "px";
  el.style.top = Math.random() * (gameArea.clientHeight - 50) + "px";
}

/* ===== RECORD ===== */
function getRecord(mode) {
  return Number(localStorage.getItem("record_" + mode) || 0);
}
function setRecord(mode, val) {
  localStorage.setItem("record_" + mode, val);
}

/* ===== MODO NORMAL ===== */
function startNormal() {
  clearGame();

  panelNormal.style.display = "block";
  panelHide.style.display = "none";
  exitBtn.style.display = "none";

  score = 0;
  scoreText.textContent = 0;
  timeLeft = Number(timeInput.value);
  msg.textContent = "";

  const mode = modeSelect.value;
  recordText.textContent = getRecord(mode);

  squares = [];

  for (let i = 0; i < 3; i++) {
    const d = document.createElement("div");
    d.className = "square";
    gameArea.appendChild(d);
    squares.push(d);
  }

  realSquare = squares[0];
  const fakes = squares.slice(1);

  realSquare.addEventListener("pointerdown", () => {
    if (!gameRunning) return;
    score++;
    scoreText.textContent = score;
    randomPos(realSquare);
  });

  fakes.forEach(f =>
    f.addEventListener("pointerdown", () => {
      if (!gameRunning) return;
      score = Math.max(0, score - 1);
      scoreText.textContent = score;
    })
  );

  let speed = 900;

  if (mode === "easy") {
    speed = 1300;
    realSquare.style.background = "red";
    fakes.forEach(f => f.style.background = "blue");
  }
  if (mode === "hard") {
    speed = 500;
    realSquare.style.background = "#8b0000";
    fakes.forEach(f => f.style.background = "#7a0000");
  }
  if (mode === "nightmare") {
    speed = 300;
    realSquare.style.background = "#7a0000";
    fakes.forEach(f => f.style.background = "#7a0000");
    gameArea.style.background = "#5c0000";
  }

  squares.forEach(s => {
    s.style.display = "block";
    randomPos(s);
  });

  gameRunning = true;

  timer = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      gameRunning = false;
      clearInterval(timer);
      if (score > getRecord(mode)) {
        setRecord(mode, score);
        msg.textContent = "🔥 Nuevo récord";
      } else {
        msg.textContent = "Fin del juego";
      }
    }
  }, 1000);
}

/* ===== MODO ESCONDIDAS ===== */
function startHide() {
  clearGame();

  panelNormal.style.display = "none";
  panelHide.style.display = "block";
  exitBtn.style.display = "inline-block";

  msg.textContent = "";
  phaseText.textContent = hidePhase;

  const count = 12 + hidePhase * 2;
  squares = [];

  for (let i = 0; i < count; i++) {
    const d = document.createElement("div");
    d.className = "square";
    d.style.background = "#9c0000";
    gameArea.appendChild(d);
    squares.push(d);
  }

  const realIndex = Math.floor(Math.random() * count);
  realSquare = squares[realIndex];
  realSquare.style.background = "#b00000";

  squares.forEach(s => {
    s.style.display = "block";
    randomPos(s);
    s.addEventListener("pointerdown", () => {
      if (!gameRunning) return;
      if (s === realSquare) {
        hidePhase++;
        startHide();
      }
    });
  });

  gameRunning = true;
}

/* ===== BOTONES ===== */
startBtn.onclick = () => {
  hidePhase = 1;
  if (extraModeSelect.value === "hide") {
    startHide();
  } else {
    startNormal();
  }
};

exitBtn.onclick = () => {
  clearGame();
  panelHide.style.display = "none";
  panelNormal.style.display = "block";
  exitBtn.style.display = "none";
  msg.textContent = "Modo cancelado";
};
