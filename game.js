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
const comboMsg = document.getElementById("comboMsg");

let squares = [];
let realSquare = null;

let score = 0;
let timeLeft = 0;
let timer = null;
let moveInterval = null;
let gameRunning = false;
let hidePhase = 1;

/* ===== RECORD ===== */
function getRecord(mode) {
  return Number(localStorage.getItem("record_" + mode) || 0);
}
function setRecord(mode, val) {
  localStorage.setItem("record_" + mode, val);
}

/* ===== LIMPIAR JUEGO ===== */
function clearGame() {
  gameRunning = false;
  clearInterval(timer);
  clearInterval(moveInterval);
  timer = null;
  moveInterval = null;
  gameArea.innerHTML = "";
}

/* ===== RANDOM ===== */
function randomPos(el) {
  el.style.left = Math.random() * (gameArea.clientWidth - 50) + "px";
  el.style.top = Math.random() * (gameArea.clientHeight - 50) + "px";
}

/* ===== ANIMACIÓN 10 PUNTOS ===== */
function showCombo() {
  comboMsg.textContent = `🔥 ${score} puntos`;
  setTimeout(() => (comboMsg.textContent = ""), 800);
}

/* ===== MODO NORMAL ===== */
function startNormalMode() {
  clearGame();
  panelNormal.style.display = "block";
  panelHide.style.display = "none";
  exitBtn.style.display = "none";
  msg.textContent = "";
  score = 0;
  scoreText.textContent = 0;

  const mode = modeSelect.value;
  recordText.textContent = getRecord(mode);

  timeLeft = Number(timeInput.value);

  // Crear cubos
  squares = [];
  for (let i = 0; i < 3; i++) {
    const d = document.createElement("div");
    d.className = "square";
    gameArea.appendChild(d);
    squares.push(d);
  }

  realSquare = squares[0];
  const fakes = squares.slice(1);

  // Asignar colores según modo
  if (mode === "easy") {
    realSquare.style.background = "green";
    fakes.forEach(f => (f.style.background = "darkgreen"));
  }
  if (mode === "normal") {
    realSquare.style.background = "red";
    fakes.forEach(f => (f.style.background = "blue"));
  }
  if (mode === "hard") {
    realSquare.style.background = "#8b0000";
    fakes.forEach(f => (f.style.background = "#7a0000"));
  }
  if (mode === "nightmare") {
    realSquare.style.background = "#7a0000";
    fakes.forEach(f => (f.style.background = "#7a0000"));
    gameArea.style.background = "#5c0000";
  } else {
    gameArea.style.background = "#f2f2f2";
  }

  // Eventos
  realSquare.addEventListener("pointerdown", () => {
    if (!gameRunning) return;
    score++;
    scoreText.textContent = score;
    if (score % 10 === 0) showCombo();
    navigator.vibrate?.(40);
    randomPos(realSquare);
  });

  fakes.forEach(f =>
    f.addEventListener("pointerdown", () => {
      if (!gameRunning) return;
      score = Math.max(0, score - 1);
      scoreText.textContent = score;
      navigator.vibrate?.(20);
    })
  );

  squares.forEach(randomPos);
  gameRunning = true;

  moveInterval = setInterval(() => squares.forEach(randomPos), 900);

  timer = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) endGame(mode);
  }, 1000);
}

/* ===== MODO ESCONDIDAS ===== */
function startHideMode() {
  clearGame();
  panelNormal.style.display = "none";
  panelHide.style.display = "block";
  exitBtn.style.display = "inline-block";
  msg.textContent = "";
  phaseText.textContent = hidePhase;

  const count = 12 + hidePhase * 2;
  squares = [];

  // Música propia
  const audio = new Audio();
  audio.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAABCxAgAEABAAZGF0YQAAAAA="; // tono simple
  audio.loop = true;
  audio.play();

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
        audio.pause();
        startHideMode();
      }
    });
  });

  gameRunning = true;
}

/* ===== FIN DEL JUEGO ===== */
function endGame(mode) {
  gameRunning = false;
  clearInterval(timer);
  clearInterval(moveInterval);
  if (score > getRecord(mode)) {
    setRecord(mode, score);
    msg.textContent = "🔥 Nuevo récord!";
  } else {
    msg.textContent = "Fin del juego";
  }
}

/* ===== BOTONES ===== */
startBtn.onclick = () => {
  hidePhase = 1;
  if (extraModeSelect.value === "hide") {
    startHideMode();
  } else {
    startNormalMode();
  }
};

exitBtn.onclick = () => {
  clearGame();
  panelHide.style.display = "none";
  panelNormal.style.display = "block";
  exitBtn.style.display = "none";
  msg.textContent = "Modo cancelado";
};
