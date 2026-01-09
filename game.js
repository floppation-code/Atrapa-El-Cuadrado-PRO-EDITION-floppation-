let score = 0;
let timeLeft = 30;
let gameRunning = false;
let moveInterval, timerInterval;

let squares = [];
let realSquare = null;

let hidePhase = 1;

const gameArea = document.getElementById("gameArea");
const scoreText = document.getElementById("score");
const recordText = document.getElementById("record");
const timeInput = document.getElementById("timeInput");
const modeSelect = document.getElementById("mode");
const extraModeSelect = document.getElementById("extraMode");
const startBtn = document.getElementById("startBtn");
const exitBtn = document.getElementById("exitBtn");
const endMsg = document.getElementById("endMsg");
const comboMsg = document.getElementById("comboMsg");

const hudNormal = document.getElementById("hudNormal");
const hudHide = document.getElementById("hudHide");
const phaseText = document.getElementById("phase");
const timeBox = document.getElementById("timeBox");

/* ===== RECORDS ===== */
function getRecord(key) {
  return Number(localStorage.getItem("record_" + key) || 0);
}
function setRecord(key, val) {
  localStorage.setItem("record_" + key, val);
}

/* ===== DESBLOQUEOS ===== */
function updateUnlocks() {
  const max = Math.max(
    getRecord("easy"),
    getRecord("normal"),
    getRecord("hard"),
    getRecord("nightmare")
  );
  if (max >= 5) modeSelect.querySelector('[value="hard"]').disabled = false;
  if (max >= 10) modeSelect.querySelector('[value="nightmare"]').disabled = false;
}

/* ===== UTIL ===== */
function collides(a, b) {
  const ar = a.getBoundingClientRect();
  const br = b.getBoundingClientRect();
  return !(ar.right < br.left || ar.left > br.right || ar.bottom < br.top || ar.top > br.bottom);
}

function randomPos(el) {
  let ok = false;
  while (!ok) {
    el.style.left = Math.random() * (gameArea.clientWidth - 50) + "px";
    el.style.top = Math.random() * (gameArea.clientHeight - 50) + "px";
    ok = true;
    squares.forEach(o => {
      if (o !== el && collides(el, o)) ok = false;
    });
  }
}

/* ===== CREAR CUADRADOS ===== */
function createSquares(count) {
  gameArea.innerHTML = "";
  squares = [];

  for (let i = 0; i < count; i++) {
    const d = document.createElement("div");
    d.className = "square";
    gameArea.appendChild(d);
    squares.push(d);
  }
}

/* ===== TOQUES ===== */
function tapReal(e) {
  e.preventDefault();
  if (!gameRunning) return;

  navigator.vibrate?.(40);

  if (extraModeSelect.value === "hide") {
    hidePhase++;
    startHideMode();
    return;
  }

  score++;
  scoreText.textContent = score;

  if (score % 10 === 0) {
    comboMsg.textContent = `🔥 ${score} puntos`;
    setTimeout(() => comboMsg.textContent = "", 800);
  }

  randomPos(realSquare);
}

function tapFake(e) {
  e.preventDefault();
  if (!gameRunning) return;
  navigator.vibrate?.(20);

  if (extraModeSelect.value !== "hide") {
    score = Math.max(0, score - 1);
    scoreText.textContent = score;
  }
}

/* ===== MODO ESCONDIDAS ===== */
function startHideMode() {
  gameRunning = true;
  hudNormal.style.display = "none";
  hudHide.style.display = "block";
  timeBox.style.display = "none";
  exitBtn.style.display = "inline-block";

  phaseText.textContent = hidePhase;
  endMsg.textContent = "";

  const count = 10 + hidePhase * 2;
  createSquares(count);

  const realIndex = Math.floor(Math.random() * count);
  realSquare = squares[realIndex];

  squares.forEach(s => {
    s.style.display = "block";
    s.style.background = "#9c0000";
    s.addEventListener("pointerdown", tapFake);
  });

  realSquare.style.background = "#b00000";
  realSquare.addEventListener("pointerdown", tapReal);

  squares.forEach(randomPos);
}

/* ===== MODOS NORMALES ===== */
function startNormalMode() {
  gameRunning = true;
  score = 0;
  scoreText.textContent = 0;
  timeLeft = Number(timeInput.value);

  hudNormal.style.display = "block";
  hudHide.style.display = "none";
  timeBox.style.display = "block";
  exitBtn.style.display = "none";

  endMsg.textContent = "";

  createSquares(3);
  realSquare = squares[0];
  const fakes = squares.slice(1);

  realSquare.addEventListener("pointerdown", tapReal);
  fakes.forEach(f => f.addEventListener("pointerdown", tapFake));

  let speed = 900;
  gameArea.style.background = "#f2f2f2";

  const mode = modeSelect.value;

  if (mode === "easy") {
    speed = 1300;
    realSquare.style.background = "red";
    fakes.forEach(f => f.style.background = "blue");
  }

  if (mode === "normal") {
    speed = 900;
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

  squares.forEach(s => s.style.display = "block");
  squares.forEach(randomPos);

  moveInterval = setInterval(() => squares.forEach(randomPos), speed);

  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) endGame();
  }, 1000);

  recordText.textContent = getRecord(mode);
}

/* ===== FIN ===== */
function endGame() {
  gameRunning = false;
  clearInterval(moveInterval);
  clearInterval(timerInterval);

  const key = modeSelect.value;
  if (score > getRecord(key)) {
    setRecord(key, score);
    endMsg.textContent = "🔥 Nuevo récord!";
  } else {
    endMsg.textContent = "Fin del juego";
  }

  updateUnlocks();
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
  gameRunning = false;
  hidePhase = 1;
  gameArea.innerHTML = "";
  endMsg.textContent = "Modo cancelado";
  exitBtn.style.display = "none";
  hudHide.style.display = "none";
  hudNormal.style.display = "block";
  timeBox.style.display = "block";
};

updateUnlocks();
