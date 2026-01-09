// ===== ELEMENTOS =====
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
let moveInterval = null;
let musicInterval = null;

// ===== AUDIO =====
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(freq, duration=0.15) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

// ===== UTIL =====
function randomPos(el) {
  el.style.left = Math.random() * (gameArea.clientWidth - 50) + "px";
  el.style.top = Math.random() * (gameArea.clientHeight - 50) + "px";
}

function clearGame() {
  clearInterval(timer);
  clearInterval(moveInterval);
  clearInterval(musicInterval);
  moveInterval = null;
  musicInterval = null;
  timer = null;
  gameRunning = false;
  msg.textContent = "";
  squares.forEach(s => s.remove());
  squares = [];
}

// ===== RECORD =====
const getRecord = mode => Number(localStorage.getItem("record_" + mode) || 0);
const setRecord = (mode, val) => localStorage.setItem("record_" + mode, val);

// ===== CREAR CUADRADOS =====
function createSquares(count, onClick) {
  for (let i = 0; i < count; i++) {
    const s = document.createElement("div");
    s.className = "square";
    s.addEventListener("pointerdown", () => onClick(s));
    gameArea.appendChild(s);
    randomPos(s);
    squares.push(s);
  }
}

// ===== MOVER CUADRADOS =====
function startMoving(speed=1000) {
  if (moveInterval) clearInterval(moveInterval);
  moveInterval = setInterval(() => {
    squares.forEach(s => randomPos(s));
  }, speed);
}

// ===== MODO NORMAL (TODOS LOS MODOS) =====
function startNormal() {
  clearGame();

  panelNormal.hidden = false;
  panelHide.hidden = true;
  exitBtn.hidden = true;

  score = 0;
  scoreText.textContent = 0;
  timeLeft = Number(timeInput.value);
  const mode = modeSelect.value;
  recordText.textContent = getRecord(mode);

  createSquares(3, s => {
    if (!gameRunning) return;
    if (s === realSquare) {
      score++;
      scoreText.textContent = score;
      navigator.vibrate?.(30);
      // Tono según modo
      const freq = mode === "easy" ? 440 : mode === "normal" ? 550 : mode === "hard" ? 660 : 880;
      playTone(freq);
    } else {
      score = Math.max(0, score - 1);
      scoreText.textContent = score;
    }
  });

  realSquare = squares[0];
  const fakes = squares.slice(1);

  // Colores
  if (mode === "easy") {
    realSquare.style.background = "red";
    fakes.forEach(f => f.style.background = "blue");
  } else if (mode === "normal") {
    realSquare.style.background = "green";
    fakes.forEach(f => f.style.background = "#0a8a0a");
  } else if (mode === "hard") {
    realSquare.style.background = "#8b0000";
    fakes.forEach(f => f.style.background = "#7a0000");
  } else if (mode === "nightmare") {
    realSquare.style.background = "#7a0000";
    fakes.forEach(f => f.style.background = "#7a0000");
    gameArea.style.background = "#5c0000";
  }

  squares.forEach(s => s.style.display = "block");
  gameRunning = true;

  // Movimiento según modo
  let speed = mode === "easy" ? 1300 : mode === "normal" ? 900 : mode === "hard" ? 500 : 300;
  startMoving(speed);

  // Música de fondo por modo
  const freqs = mode === "easy" ? [261, 329, 392] :
                mode === "normal" ? [293, 349, 440] :
                mode === "hard" ? [329, 415, 493] :
                [392, 523, 659];
  let idx = 0;
  musicInterval = setInterval(() => {
    if (!gameRunning) { clearInterval(musicInterval); return; }
    playTone(freqs[idx % freqs.length], 0.3);
    idx++;
  }, 600);

  // Timer
  timer = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      gameRunning = false;
      clearGame();
      if (score > getRecord(mode)) {
        setRecord(mode, score);
        msg.textContent = "🔥 Nuevo récord";
      } else {
        msg.textContent = "Fin del juego";
      }
    }
  }, 1000);
}

// ===== MODO ESCONDIDAS =====
function startHide() {
  clearGame();
  panelNormal.hidden = true;
  panelHide.hidden = false;
  exitBtn.hidden = false;
  phaseText.textContent = hidePhase;
  msg.textContent = "";

  const count = 12 + hidePhase * 2;
  createSquares(count, s => {
    if (!gameRunning) return;
    if (s === realSquare) {
      hidePhase++;
      startHide();
    }
  });

  const realIndex = Math.floor(Math.random() * count);
  realSquare = squares[realIndex];

  squares.forEach(s => s.style.background = "#9c0000");
  realSquare.style.background = "#b00000";

  squares.forEach(randomPos);

  gameRunning = true;

  // Música Escondidas (suave y misteriosa)
  const frequencies = [261, 329, 392, 523]; // C4, E4, G4, C5
  let idx = 0;
  musicInterval = setInterval(() => {
    if (!gameRunning) { clearInterval(musicInterval); return; }
    playTone(frequencies[idx % frequencies.length], 0.3);
    idx++;
  }, 600);
}

// ===== BOTONES =====
startBtn.onclick = () => {
  if (extraModeSelect.value !== "none") {
    startHide();
  } else {
    startNormal();
  }
};

exitBtn.onclick = () => {
  clearGame();
  panelHide.hidden = true;
  panelNormal.hidden = false;
  exitBtn.hidden = true;
  msg.textContent = "Modo cancelado";
};
