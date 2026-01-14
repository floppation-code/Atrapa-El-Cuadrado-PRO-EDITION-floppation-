const gameArea = document.getElementById("gameArea");
const scoreText = document.getElementById("score");
const recordText = document.getElementById("record");
const message = document.getElementById("message");

const modeSelect = document.getElementById("mode");
const startBtn = document.getElementById("startBtn");
const exitBtn = document.getElementById("exitBtn");

const nameInput = document.getElementById("playerName");
const musicToggle = document.getElementById("musicToggle");
const vibrationToggle = document.getElementById("vibrationToggle");

const topMode = document.getElementById("topMode");
const topList = document.getElementById("topList");

let score = 0;
let running = false;
let squares = [];
let mode = "normal";
let moveInterval;

const speeds = {
  easy: 1200,
  normal: 900,
  hard: 500,
  nightmare: 350,
  hide: 0
};

const colors = {
  easy: { real: "green", fake: "blue", bg: "#eaffea" },
  normal: { real: "red", fake: "blue", bg: "#ddd" },
  hard: { real: "#8b0000", fake: "#7a0000", bg: "#ccc" },
  nightmare: { real: "#550000", fake: "#550000", bg: "#400000" },
  hide: { real: "#444", fake: "#555", bg: "#222" }
};

function saveName() {
  localStorage.setItem("playerName", nameInput.value || "Jugador");
}
nameInput.value = localStorage.getItem("playerName") || "";

nameInput.oninput = saveName;

function clearGame() {
  gameArea.innerHTML = "";
  squares = [];
  clearInterval(moveInterval);
  running = false;
}

function randomPos(el) {
  el.style.left = Math.random() * (gameArea.clientWidth - 50) + "px";
  el.style.top = Math.random() * (gameArea.clientHeight - 50) + "px";
}

function vibrate(ms) {
  if (vibrationToggle.checked && navigator.vibrate) {
    navigator.vibrate(ms);
  }
}

function loadTop(mode) {
  return JSON.parse(localStorage.getItem("top_" + mode)) || [];
}

function saveTop(mode, value) {
  let list = loadTop(mode);
  list.push({ name: nameInput.value || "Jugador", value });
  list.sort((a, b) => b.value - a.value);
  list = list.slice(0, 10);
  localStorage.setItem("top_" + mode, JSON.stringify(list));
}

function showTop() {
  topList.innerHTML = "";
  loadTop(topMode.value).forEach(e => {
    const li = document.createElement("li");
    li.textContent = `${e.name}: ${e.value}`;
    topList.appendChild(li);
  });
}

["easy","normal","hard","nightmare","hide"].forEach(m=>{
  const o=document.createElement("option");
  o.value=m; o.textContent=m;
  topMode.appendChild(o);
});

topMode.onchange = showTop;
showTop();

function startGame() {
  clearGame();
  score = 0;
  scoreText.textContent = score;
  mode = modeSelect.value;
  running = true;

  gameArea.style.background = colors[mode].bg;

  let count = mode === "hide" ? 30 : 3;
  for (let i = 0; i < count; i++) {
    const d = document.createElement("div");
    d.className = "square " + (i === 0 ? "real" : "fake");
    d.style.background = i === 0 ? colors[mode].real : colors[mode].fake;
    randomPos(d);
    d.onclick = () => {
      if (!running) return;
      if (i === 0) {
        score++;
        vibrate(50);
        scoreText.textContent = score;
        if (mode !== "hide") randomPos(d);
      } else {
        score = Math.max(0, score - 1);
        vibrate(150);
        scoreText.textContent = score;
      }
    };
    gameArea.appendChild(d);
    squares.push(d);
  }

  if (speeds[mode] > 0) {
    moveInterval = setInterval(()=>{
      squares.forEach(s=>randomPos(s));
    }, speeds[mode]);
  }
}

function exitGame() {
  if (score >= 10) {
    saveTop(mode, score);
    message.textContent = "🔥 ¡Wow! Llegaste a 10 — Inscribite en el Top Récords!";
  }
  clearGame();
  showTop();
}

startBtn.onclick = startGame;
exitBtn.onclick = exitGame;
