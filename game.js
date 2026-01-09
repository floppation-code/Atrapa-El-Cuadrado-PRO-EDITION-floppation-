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

/* ===== MÚSICA ===== */
let audioCtx;
let musicInterval;

function stopMusic() {
  if (musicInterval) clearInterval(musicInterval);
  if (audioCtx) audioCtx.close();
}

function playTone(freq, duration, type = "sine") {
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
  stopMusic();
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  if (mode === "normal") {
    const notes = [440, 523, 659, 523];
    let i = 0;
    musicInterval = setInterval(() => {
      playTone(notes[i % notes.length
