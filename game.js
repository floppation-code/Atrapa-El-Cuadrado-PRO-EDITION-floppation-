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
const modeText = document.getElementById("modeText");

/* ===== RECORD POR MODO ===== */
function getRecord(mode) {
  return Number(localStorage.getItem("record_" + mode) || 0);
}

function setRecord(mode, value) {
  localStorage.setItem("record_" + mode, value);
}

/* ===== AUDIO SEGURO ===== */
let audioCtx = null;
let musicTimer = null;

function stopMusic() {
  if (musicTimer) clearInterval(musicTimer);
  musicTimer = null;
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
}

function playTone(freq, dur, type) {
  if (!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = 0.04;
  o.connect(g);
  g.connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + dur);
}

function startMusic(mode) {
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    return;
  }

  let notes, speed, wave;
  if (mode === "normal") {
    notes = [440, 523, 659];
    speed = 450;
    wave = "sine";
  } else if (mode === "hard") {
    notes = [220, 247, 294];
    speed = 300;
    wave = "square";
  } else {
    notes = [110, 98, 123];
    speed = 200;
    wave = "sawtooth";
  }

  let i = 0;
  musicTimer = setInterval(() => {
    playTone(notes[i % notes.length], 0.25, wave);
    i++;
  }, speed);
}

/* ===== COLISIONES ===== */
function collides(a, b) {
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
      if (o !== el && collides(el, o)) ok = false;
    });
  }
}

function moveAll() {
  randomPos(real);
  fakes.forEach(f => randomPos(f));
}

/* ===== MENSAJES ===== */
function showCombo(p) {
  comboMsg.textContent = `🎉 Wow, ${p} puntos!`;
  comboMsg.classList.add("show");
  setTimeout(() => comboMsg.classList.remove("show"), 1200);
}

/* ===== VIBRACIÓN ===== */
function vibrate(ms) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

/* ===== JUEGO ===== */
function endGame() {
  gameRunning = false;
  clearInterval(moveInterval);
  clearInterval(timerInterval);
  stopMusic();

  document.querySelectorAll(".square").forEach(s => s.style.display = "none");

  const mode = modeSelect.value;
  let rec = getRecord(mode);

  if (score > rec) {
    setRecord(mode, score);
    recordText.textContent = score;
    endMsg.textContent = "🔥 Nuevo récord!";
  } else {
    endMsg.textContent = "Fin del juego";
  }

  gameArea.style.backgroundColor = "#f2f2f2";
}

function tapReal() {
  if (!gameRunning) return;
  score++;
  vibrate(40);
  scoreText.textContent = score;
  if (score % 10 === 0 && score <= 1000) showCombo(score);
  randomPos(real);
}

function tapFake() {
  if (!gameRunning) return;
  vibrate(80);
  score = Math.max(0, score - 1);
  scoreText.textContent = score;
}

real.onclick = tapReal;
fakes.forEach(f => f.onclick = tapFake);

/* ===== START ===== */
startBtn.onclick = () => {
  score = 0;
  scoreText.textContent = score;
  endMsg.textContent = "";
  timeLeft = Number(timeInput.value);
  gameRunning = true;

  const mode = modeSelect.value;
  modeText.textContent =
    mode === "normal" ? "Normal" :
    mode === "hard" ? "Difícil" : "Pesadilla";

  recordText.textContent = getRecord(mode);

  document.querySelectorAll(".square").forEach(s => s.style.display = "block");

  if (mode === "normal") {
    moveInterval = setInterval(moveAll, 900);
  } else if (mode === "hard") {
    moveInterval = setInterval(moveAll, 500);
  } else {
    gameArea.style.backgroundColor = "#7a0000";
    moveInterval = setInterval(moveAll, 300);
  }

  moveAll();
  startMusic(mode);

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) endGame();
  }, 1000);
};
