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
  stopMusic();
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

/* ===== MÚSICA POR MODO ===== */
let audioCtx = null;
let oscillator = null;

function playMusic(freqs) {
  stopMusic();
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  oscillator.connect(gain);
  gain.connect(audioCtx.destination);
  gain.gain.value = 0.05;
  oscillator.type = "sine";

  let index = 0;
  oscillator.frequency.value = freqs[index];
  oscillator.start();

  oscillator.interval = setInterval(() => {
    index = (index + 1) % freqs.length;
    oscillator.frequency.setValueAtTime(freqs[index], audioCtx.currentTime);
  }, 400);

  oscillator.stopTime = setTimeout(() => {}, 0); // placeholder
}

function stopMusic() {
  if (oscillator) {
    clearInterval(oscillator.interval);
    oscillator.stop();
    oscillator.disconnect();
    oscillator = null;
  }
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
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

  // Colores
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

  // ===== MÚSICA SEGÚN MODO =====
  if (mode === "easy") playMusic([261, 329, 392]); // C-E-G
  if (mode === "normal") playMusic([330, 392, 440]); // E-G-A
  if (mode === "hard") playMusic([440, 494, 523]); // A-B-C
  if (mode === "nightmare") playMusic([523, 587, 659]); // C5-D5-E5

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

  // ===== VELOCIDAD SEGÚN MODO =====
  let speed = 900;
  if (mode === "easy") speed = 1200;
  if (mode === "normal") speed = 900;
  if (mode === "hard") speed = 500;
  if (mode === "nightmare") speed = 300;

  moveInterval = setInterval(() => squares.forEach(randomPos), speed);

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

  // Música propia escondidas (tono simple)
  playMusic([150, 200, 250]);

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
  stopMusic();
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
