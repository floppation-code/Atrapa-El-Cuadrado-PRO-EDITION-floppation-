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

/* ===== AUDIO SEGURO ===== */
let audioCtx = null;
let musicInterval = null;

function stopMusic() {
  if (musicInterval) clearInterval(musicInterval);
  musicInterval = null;
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
}

function playTone(freq, duration, type) {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = 0.05;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function startMusic(mode) {
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    return; // si el audio falla, el juego sigue
  }

  let notes, speed, wave;

  if (mode === "normal") {
    notes = [440, 523, 659, 523];
    speed = 400;
    wave = "sine";
  } else if (mode === "hard") {
    notes = [220, 247, 262, 294];
    speed = 250;
    wave = "square";
  } else {
    notes = [110, 123, 98, 130];
    speed = 180;
    wave = "sawtooth";
  }

  let i = 0;
  musicInterval = setInterval(() => {
    playTone(notes[i % notes.length], 0.25, wave);
    i++;
  }, speed);
}

/* ===== COLISIONES ===== */
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

function randomPos(el) {
  let ok = false;
  while (!ok) {
    const maxX = gameArea.clientWidth - el.clientWidth;
    const maxY = gameArea.clientHeight - el.clientHeight;
    el.style.left = Math.random() * maxX + "px";
    el.style.top = Math.random() * maxY + "px";
    ok = true;
    document.querySelectorAll(".square").forEach(o => {
      if (o !== el && isColliding(el, o)) ok = false;
    });
  }
}

function moveAll() {
  randomPos(real);
  fakes.forEach(f => randomPos(f));
}

/* ===== MENSAJES ===== */
function showCombo(points) {
  comboMsg.textContent = `🎉 Wow conseguiste ${points} puntos ¡felicidades!`;
  comboMsg.classList.add("show");
  setTimeout(() => comboMsg.classList.remove("show"), 1200);
}

/* ===== JUEGO ===== */
function endGame() {
  gameRunning = false;
  clearInterval(moveInterval);
  clearInterval(timerInterval);
  stopMusic();

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
  if (score % 10 === 0 && score <= 1000) showCombo(score);
  randomPos(real);
}

function tapFake(e) {
  e.preventDefault();
  if (!gameRunning) return;
  score = Math.max(0, score - 1);
  scoreText.textContent = score;
}

real.addEventListener("click", tapReal);
real.addEventListener("touchstart", tapReal);
fakes.forEach(f => {
  f.addEventListener("click", tapFake);
  f.addEventListener("touchstart", tapFake);
});

/* ===== START ===== */
startBtn.onclick = () => {
  score = 0;
  scoreText.textContent = score;
  endMsg.textContent = "";
  timeLeft = Number(timeInput.value);
  gameRunning = true;

  document.querySelectorAll(".square").forEach(s => s.style.display = "block");

  const mode = modeSelect.value;

  if (mode === "hard") {
    moveInterval = setInterval(moveAll, 500);
  } else if (mode === "nightmare") {
    gameArea.style.backgroundColor = "#7a0000";
    moveInterval = setInterval(moveAll, 300);
  } else {
    moveInterval = setInterval(moveAll, 900);
  }

  moveAll();
  startMusic(mode);

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) endGame();
  }, 1000);
};
