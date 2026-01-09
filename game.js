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

/* ===== RECORDS ===== */
function getRecord(mode) {
  return Number(localStorage.getItem("record_" + mode) || 0);
}
function setRecord(mode, val) {
  localStorage.setItem("record_" + mode, val);
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

/* ===== GUARDADO DEL JUEGO ===== */
function saveGame() {
  localStorage.setItem("save_game", JSON.stringify({
    score,
    timeLeft,
    mode: modeSelect.value,
    running: gameRunning
  }));
}

function loadGame() {
  const data = localStorage.getItem("save_game");
  if (!data) return;

  const save = JSON.parse(data);
  score = save.score;
  timeLeft = save.timeLeft;
  modeSelect.value = save.mode;
  gameRunning = save.running;

  scoreText.textContent = score;
  timeInput.value = timeLeft;
  modeText.textContent = modeSelect.options[modeSelect.selectedIndex].text;
  recordText.textContent = getRecord(save.mode);

  if (gameRunning) startGame(true);
}

/* ===== AUDIO SEGURO ===== */
let audioCtx = null;
let musicTimer = null;

function stopMusic() {
  if (musicTimer) clearInterval(musicTimer);
  musicTimer = null;
  if (audioCtx) audioCtx.close();
  audioCtx = null;
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
  } catch { return; }

  let notes, speed, wave;
  if (mode === "easy") { notes=[392,440,392]; speed=600; wave="sine"; }
  else if (mode === "normal") { notes=[440,523,659]; speed=450; wave="sine"; }
  else if (mode === "hard") { notes=[220,247,294]; speed=300; wave="square"; }
  else { notes=[110,98,123]; speed=200; wave="sawtooth"; }

  let i = 0;
  musicTimer = setInterval(() => {
    playTone(notes[i++ % notes.length], 0.25, wave);
  }, speed);
}

/* ===== COLISIONES ===== */
function collides(a,b){
  const ar=a.getBoundingClientRect(), br=b.getBoundingClientRect();
  return !(ar.right<br.left||ar.left>br.right||ar.bottom<br.top||ar.top>br.bottom);
}

function randomPos(el){
  let ok=false;
  while(!ok){
    el.style.left=Math.random()*(gameArea.clientWidth-50)+"px";
    el.style.top=Math.random()*(gameArea.clientHeight-50)+"px";
    ok=true;
    document.querySelectorAll(".square").forEach(o=>{
      if(o!==el && collides(el,o)) ok=false;
    });
  }
}

function moveAll(){
  randomPos(real);
  fakes.forEach(randomPos);
}

/* ===== JUEGO ===== */
function startGame(resume=false){
  gameRunning = true;
  document.querySelectorAll(".square").forEach(s=>s.style.display="block");

  const mode = modeSelect.value;
  recordText.textContent = getRecord(mode);
  modeText.textContent = modeSelect.options[modeSelect.selectedIndex].text;

  let speed = mode==="easy"?1200:mode==="normal"?900:mode==="hard"?500:300;
  if(mode==="nightmare") gameArea.style.background="#7a0000";

  moveInterval = setInterval(moveAll, speed);
  moveAll();

  startMusic(mode);

  timerInterval = setInterval(()=>{
    timeLeft--;
    saveGame();
    if(timeLeft<=0) endGame();
  },1000);
}

function endGame(){
  gameRunning=false;
  clearInterval(moveInterval);
  clearInterval(timerInterval);
  stopMusic();

  const mode = modeSelect.value;
  if(score > getRecord(mode)){
    setRecord(mode, score);
    endMsg.textContent="🔥 Nuevo récord!";
  } else endMsg.textContent="Fin del juego";

  saveGame();
  updateUnlocks();
}

function tapReal(){
  if(!gameRunning) return;
  score++;
  scoreText.textContent=score;
  if(score%10===0) comboMsg.classList.add("show"),
    setTimeout(()=>comboMsg.classList.remove("show"),1000);
  saveGame();
  randomPos(real);
}

function tapFake(){
  if(!gameRunning) return;
  score=Math.max(0,score-1);
  scoreText.textContent=score;
  saveGame();
}

real.onclick=tapReal;
fakes.forEach(f=>f.onclick=tapFake);

startBtn.onclick=()=>{
  score=0;
  timeLeft=Number(timeInput.value);
  scoreText.textContent=score;
  endMsg.textContent="";
  saveGame();
  startGame();
};

updateUnlocks();
loadGame();
