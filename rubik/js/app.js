// Pagina del cubo: fotocamera, scansione automatica delle 6 facce, soluzione e guida mossa per mossa.
// Logica come in mac_client/rubik/scan.py e guide.py (conferma delle mosse automatica dalla faccia blu
// o a mano); qui solo DOM e disegni.

import { AutoScan } from "./auto-scan.js";
import { FACES, applyMove, parseMove } from "./cube.js";
import { detectFace, readFace } from "./cube-detect.js";
import { colorList, setupPage, t } from "./i18n.js";
import { MoveConfirmer, VIEW_FACE, classifyStickers } from "./move-check.js";
import { iconGeometry } from "./move-icon.js";
import { Guide, WorkerSolver, inverseMove } from "./solver.js";

const OPENCV_URL = new URL("../vendor/opencv/opencv.js", import.meta.url);
// Fotogramma analizzato come quello dell'app sul Mac: lato corto 480 pixel, lato lungo al massimo 640
// (ritaglio centrale). Le soglie del rilevatore sono relative al lato corto, i filtri no.
const SHORT_SIDE = 480;
const LONG_SIDE = 640;

// Colori di visualizzazione delle facce (come ICON_COLORS di guide.py, in RGB).
const FACE_COLORS = { U: [240, 240, 240], R: [210, 40, 40], F: [40, 180, 60], D: [240, 220, 30], L: [250, 130, 20], B: [20, 90, 200] };
const COLOR_READING = [255, 220, 0]; // giallo: faccia trovata, in lettura
const COLOR_OK = [0, 220, 0]; // verde: acquisita
const COLOR_WARN = "rgb(255, 40, 40)";
// Croce delle facce: [colonna, riga] di ognuna, come NET_LAYOUT di scan.py.
const NET_LAYOUT = { U: [1, 0], L: [0, 1], F: [1, 1], R: [2, 1], B: [3, 1], D: [1, 2] };

const $ = (id) => document.getElementById(id);
const rgb = ([r, g, b]) => `rgb(${r}, ${g}, ${b})`;
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const ui = {
  start: $("startButton"),
  load: $("loadStatus"),
  intro: $("intro"),
  scan: $("scanSection"),
  stage: $("stage"),
  video: $("video"),
  overlay: $("overlay"),
  scanMain: $("scanMain"),
  scanHint: $("scanHint"),
  scanWarn: $("scanWarn"),
  scanEvent: $("scanEvent"),
  net: $("net"),
  restart: $("restartButton"),
  switchCamera: $("switchButton"),
  guide: $("guideSection"),
  guideStage: $("guideStage"),
  guideCamera: $("guideCamera"),
  guideEvent: $("guideEvent"),
  mode: $("modeButton"),
  moveIcon: $("moveIcon"),
  moveName: $("moveName"),
  moveText: $("moveText"),
  moveCount: $("moveCount"),
  moveList: $("moveList"),
  guideStatus: $("guideStatus"),
  solved: $("solved"),
  current: $("currentMove"),
  done: $("doneButton"),
  undo: $("undoButton"),
  rescan: $("rescanButton"),
};

const work = document.createElement("canvas");
const workContext = work.getContext("2d", { willReadFrequently: true });
const overlayContext = ui.overlay.getContext("2d");

let cv = null;
let solver = null;
let stream = null;
let facingMode = "user";
let phase = "intro"; // intro, scan, guide
let lastVideoTime = -1;
let loopId = null; // requestAnimationFrame in attesa
let frameMats = null; // [rgb, lab], riusati a ogni fotogramma
let scan = new AutoScan();
let face = null; // faccia vista nell'ultimo fotogramma
let faceRgbs = [];
let scanEvent = null; // ultimo evento della scansione: {key, params}
let guide = null;
let cubeState = null;
let history = []; // mosse confermate
let guideBusy = false;
let guideError = null;
let autoConfirm = true; // conferma automatica dalla fotocamera (false = solo a mano)
let references = {}; // faccia -> colore Lab del suo centro letto nella scansione
const confirmer = new MoveConfirmer();
let seenFace = ""; // faccia blu letta nell'ultimo fotogramma ("" = nessuna faccia completa)
let guideEvent = null; // ultima conferma: {key, params}

/* ---------- Avvio: OpenCV, solver, fotocamera ---------- */

function loadOpenCV() {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = OPENCV_URL.href;
    script.async = true;
    // opencv.js mette in window.cv una Promise del modulo pronto.
    script.onload = () => Promise.resolve(window.cv).then(resolve, reject);
    script.onerror = () => reject(new Error(OPENCV_URL.pathname));
    document.head.append(script);
  });
}

function showLoad(key, params, isError = false) {
  ui.load.textContent = key ? t(key, params) : "";
  ui.load.classList.toggle("is-error", isError);
  ui.load.dataset.key = key || "";
  ui.load.dataset.params = JSON.stringify(params || {});
}

function cameraError(exc) {
  if (exc.name === "NotAllowedError" || exc.name === "SecurityError") return ["error.denied", {}];
  if (exc.name === "NotFoundError" || exc.name === "OverconstrainedError") return ["error.nocamera", {}];
  return ["error.camera", { message: exc.message || exc.name }];
}

async function startCamera() {
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    throw Object.assign(new Error("insecure"), { key: "error.insecure" });
  }
  stopCamera();
  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
    audio: false,
  });
  ui.video.srcObject = stream;
  await ui.video.play();
  // Specchiato solo se la fotocamera guarda chi la usa (sui portatili spesso non lo dichiara).
  const settings = stream.getVideoTracks()[0]?.getSettings?.() ?? {};
  ui.stage.classList.toggle("is-mirrored", settings.facingMode !== "environment");
  const devices = await navigator.mediaDevices.enumerateDevices();
  ui.switchCamera.hidden = devices.filter((d) => d.kind === "videoinput").length < 2;
}

function stopCamera() {
  stream?.getTracks().forEach((track) => track.stop());
  stream = null;
  ui.video.srcObject = null;
}

async function start() {
  ui.start.disabled = true;
  try {
    solver ??= new WorkerSolver();
    if (!cv) {
      showLoad("load.opencv");
      try {
        cv = await loadOpenCV();
      } catch (exc) {
        showLoad("error.opencv", { message: exc.message }, true);
        return;
      }
    }
    showLoad("load.camera");
    try {
      await startCamera();
    } catch (exc) {
      const [key, params] = exc.key ? [exc.key, {}] : cameraError(exc);
      showLoad(key, params, true);
      return;
    }
    showLoad(null);
    startScan();
  } finally {
    ui.start.disabled = false;
  }
}

/* ---------- Scansione ---------- */

function startScan() {
  phase = "scan";
  scan = new AutoScan();
  face = null;
  scanEvent = null;
  ui.scan.prepend(ui.stage);
  ui.intro.hidden = true;
  ui.guide.hidden = true;
  ui.scan.hidden = false;
  renderScan(performance.now() / 1000);
  ensureLoop();
}

/** Avvia il ciclo dei fotogrammi, se non sta già girando (un ciclo solo, anche dopo un cambio di fotocamera). */
function ensureLoop() {
  loopId ??= requestAnimationFrame(tick);
}

/** Un fotogramma alla volta, finché la fotocamera è accesa (scansione, o guida con conferma automatica). */
function tick() {
  loopId = null;
  if (!stream || (phase !== "scan" && phase !== "guide")) return;
  const video = ui.video;
  if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    processFrame(video);
  }
  ensureLoop();
}

/** Dimensioni del fotogramma analizzato e ritaglio centrale del video da cui prenderlo. */
function frameGeometry(videoWidth, videoHeight) {
  const scale = Math.min(videoWidth, videoHeight) / SHORT_SIDE; // pixel del video per pixel analizzato
  const landscape = videoWidth >= videoHeight;
  const width = landscape ? Math.min(LONG_SIDE, Math.round(videoWidth / scale)) : SHORT_SIDE;
  const height = landscape ? SHORT_SIDE : Math.min(LONG_SIDE, Math.round(videoHeight / scale));
  const [sw, sh] = [width * scale, height * scale];
  return { width, height, sx: (videoWidth - sw) / 2, sy: (videoHeight - sh) / 2, sw, sh };
}

function processFrame(video) {
  const g = frameGeometry(video.videoWidth, video.videoHeight);
  if (work.width !== g.width || work.height !== g.height) {
    [work.width, work.height] = [g.width, g.height];
    [ui.overlay.width, ui.overlay.height] = [g.width, g.height];
    ui.stage.style.aspectRatio = `${g.width} / ${g.height}`;
  }
  workContext.drawImage(video, g.sx, g.sy, g.sw, g.sh, 0, 0, g.width, g.height);
  const rgba = cv.matFromImageData(workContext.getImageData(0, 0, g.width, g.height));
  frameMats ??= [new cv.Mat(), new cv.Mat()];
  const [frame, lab] = frameMats;
  cv.cvtColor(rgba, frame, cv.COLOR_RGBA2RGB);
  cv.cvtColor(frame, lab, cv.COLOR_RGB2Lab);
  rgba.delete();

  if (phase === "guide") {
    checkMove(frame, lab);
    return;
  }
  const now = performance.now() / 1000;
  face = detectFace(cv, frame);
  let reading = null;
  if (face !== null) {
    reading = readFace(cv, frame, lab, face);
    faceRgbs = reading.rgbs;
  }
  const code = scan.observe(face !== null && face.complete ? reading : null, now);
  if (code) onScanEvent(code);
  drawOverlay(scan.stability(now));
  renderScan(now);
  if (scan.sendDue(now)) startGuide(scan.result.state);
}

/** Guida: la faccia blu vista dalla fotocamera conferma la mossa quando è quella attesa (come GuideSession.update). */
function checkMove(frame, lab) {
  face = null;
  seenFace = "";
  if (!autoConfirm || guideBusy || !guide?.nextMove || !confirmer.visible) {
    drawOverlay(0);
    renderGuideCamera();
    return;
  }
  face = detectFace(cv, frame);
  if (face !== null) {
    const reading = readFace(cv, frame, lab, face);
    faceRgbs = reading.rgbs;
    if (face.complete) seenFace = classifyStickers(reading.labs, references);
  }
  // Senza faccia completa in vista si legge "": i fotogrammi con la faccia attesa devono essere di fila.
  const move = guide.nextMove;
  if (confirmer.observe(seenFace)) {
    guideEvent = { key: "guide.confirmed", params: { move } };
    confirmMove();
  }
  drawOverlay(face !== null && face.complete ? confirmer.progress : 0);
  renderGuideCamera();
}

function onScanEvent(code) {
  if (code === "unknown-center") {
    scanEvent = { key: "scan.unknown", params: {}, warn: true };
    return;
  }
  const letter = scan.names[scan.lastIndex];
  scanEvent = { key: code === "captured" ? "scan.captured" : "scan.updated", params: { letter, n: scan.captures.length } };
}

/** Faccia trovata: contorno da giallo (in lettura) a verde (`progress` 1), pallini col colore letto, X sulle coperte. */
function drawOverlay(progress) {
  const context = overlayContext;
  context.clearRect(0, 0, ui.overlay.width, ui.overlay.height);
  if (face === null) return;
  const mix = COLOR_OK.map((c, i) => Math.round(c * progress + COLOR_READING[i] * (1 - progress)));
  context.lineJoin = "round";
  context.lineWidth = 3;
  context.strokeStyle = rgb(mix);
  context.beginPath();
  face.outline.forEach(([x, y], k) => (k ? context.lineTo(x, y) : context.moveTo(x, y)));
  context.closePath();
  context.stroke();
  face.cells.forEach((cell, k) => {
    const [x, y] = face.centers[k];
    const radius = Math.max(3, Math.hypot(cell[0][0] - cell[2][0], cell[0][1] - cell[2][1]) / 8);
    if (face.seen[k]) {
      context.fillStyle = "#000";
      context.beginPath();
      context.arc(x, y, radius + 1, 0, 2 * Math.PI);
      context.fill();
      context.fillStyle = rgb(faceRgbs[k] ?? [0, 0, 0]);
      context.beginPath();
      context.arc(x, y, radius, 0, 2 * Math.PI);
      context.fill();
    } else {
      context.strokeStyle = COLOR_WARN;
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(x - radius, y - radius);
      context.lineTo(x + radius, y + radius);
      context.moveTo(x - radius, y + radius);
      context.lineTo(x + radius, y - radius);
      context.stroke();
    }
  });
}

function setText(element, text, warn = false) {
  if (element.textContent !== text) element.textContent = text;
  element.classList.toggle("is-warn", warn);
  element.hidden = !text;
}

function renderScan(now) {
  const result = scan.result;
  let main;
  let hint = "";
  let mainWarn = false;
  let mainOk = false;
  if (result === null) {
    main = t("scan.prompt", { n: scan.captures.length });
    hint = t("scan.hold");
  } else if (result.error) {
    main = t("scan.invalid", { faces: colorList(scan.suspects) });
    hint = t("scan.replace");
    mainWarn = true;
  } else {
    const countdown = scan.countdown(now);
    main = countdown === null ? t("scan.solving") : t("scan.valid", { seconds: countdown.toFixed(1) });
    mainOk = true;
    if (result.doubtful.length) hint = t("scan.doubtful", { n: result.doubtful.length });
  }
  setText(ui.scanMain, main, mainWarn);
  ui.scanMain.classList.toggle("is-ok", mainOk);
  setText(ui.scanHint, hint);
  setText(ui.scanWarn, face !== null && !face.complete ? t("scan.covered") : "", true);
  if (scanEvent) {
    const params = { ...scanEvent.params };
    if (params.letter) params.color = capitalize(t(`color.${params.letter}`));
    setText(ui.scanEvent, t(scanEvent.key, params), scanEvent.warn);
  } else {
    setText(ui.scanEvent, "");
  }
  renderNet();
}

function buildNet() {
  for (const [letter, [col, row]] of Object.entries(NET_LAYOUT)) {
    for (let k = 0; k < 9; k++) {
      const cell = document.createElement("span");
      cell.className = "net__cell";
      cell.style.gridColumn = String(3 * col + (k % 3) + 1);
      cell.style.gridRow = String(3 * row + Math.floor(k / 3) + 1);
      cell.dataset.index = String(9 * FACES.indexOf(letter) + k);
      ui.net.append(cell);
    }
  }
}

/** Croce delle 6 facce: prima colori letti e nomi provvisori, con lo stato i colori dei centri e gli incerti. */
function renderNet() {
  const colors = new Array(54).fill(null);
  const doubtful = new Set();
  const result = scan.result;
  const names = scan.names;
  if (result === null) {
    scan.captures.forEach((capture, k) => {
      const f = FACES.indexOf(names[k]);
      capture.rgbs.forEach((color, i) => (colors[9 * f + i] = color));
    });
  } else {
    const centerColor = Object.fromEntries(scan.captures.map((capture, k) => [names[k], capture.rgbs[4]]));
    [...result.state].forEach((letter, i) => (colors[i] = centerColor[letter]));
    result.doubtful.forEach((i) => doubtful.add(i));
  }
  for (const cell of ui.net.children) {
    const index = Number(cell.dataset.index);
    const color = colors[index];
    cell.style.background = color ? rgb(color) : "";
    cell.classList.toggle("is-empty", !color);
    cell.classList.toggle("is-doubtful", doubtful.has(index));
  }
}

/* ---------- Guida ---------- */

async function startGuide(state) {
  phase = "guide";
  // Colori dei centri letti nella scansione: il riferimento per riconoscere la faccia blu con questa luce.
  const names = scan.names;
  references = Object.fromEntries(scan.captures.map((capture, k) => [names[k], capture.labs[4]]));
  face = null;
  overlayContext.clearRect(0, 0, ui.overlay.width, ui.overlay.height);
  ui.guideStage.prepend(ui.stage);
  ui.scan.hidden = true;
  ui.guide.hidden = false;
  if (!autoConfirm) stopCamera();
  cubeState = state;
  history = [];
  guideEvent = null;
  guide = new Guide((s) => solver.solve(s));
  await updateGuide();
  ui.guide.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function updateGuide() {
  guideBusy = true;
  guideError = null;
  confirmer.clear();
  renderGuide();
  try {
    await guide.update(cubeState);
  } catch (exc) {
    guideError = exc.message;
  }
  if (guide.nextMove) confirmer.setTarget(cubeState, guide.nextMove);
  guideBusy = false;
  renderGuide();
}

/** Mossa fatta (dalla fotocamera, dal pulsante o dalla tastiera): il cubo virtuale la applica. */
async function confirmMove() {
  if (phase !== "guide" || guideBusy || !guide?.nextMove) return;
  const move = guide.nextMove;
  history.push(move);
  cubeState = applyMove(cubeState, move);
  await updateGuide();
}

async function undoMove() {
  if (phase !== "guide" || guideBusy || !history.length) return;
  cubeState = applyMove(cubeState, inverseMove(history.pop()));
  guideEvent = null;
  await updateGuide();
}

async function toggleMode() {
  autoConfirm = !autoConfirm;
  guideEvent = null;
  if (!autoConfirm) {
    stopCamera();
  } else if (!stream) {
    try {
      await startCamera();
      ensureLoop();
    } catch (exc) {
      autoConfirm = false;
      const [key, params] = exc.key ? [exc.key, {}] : cameraError(exc);
      guideEvent = { key, params, warn: true };
    }
  }
  renderGuide();
}

/** Messaggi della conferma automatica, sotto il video (aggiornati a ogni fotogramma). */
function renderGuideCamera() {
  const move = guide?.nextMove;
  let text = "";
  let warn = false;
  if (autoConfirm && move && !guideBusy) {
    if (!confirmer.visible) {
      [text, warn] = [t("guide.notVisible", { move }), true];
    } else if (seenFace && seenFace[4] !== VIEW_FACE) {
      [text, warn] = [t("guide.showBlue"), true];
    } else {
      text = t("guide.watching");
    }
  }
  setText(ui.guideCamera, text, warn);
  setText(ui.guideEvent, guideEvent ? t(guideEvent.key, guideEvent.params) : "", guideEvent?.warn);
}

function describeMove(move) {
  const [face, turns] = parseMove(move);
  return capitalize(t("move.text", { face: t(`face.${face}`), turn: t(`turn.${turns}`) }));
}

function renderGuide() {
  if (!guide) return;
  const move = guide.nextMove;
  const solved = !guideBusy && !guideError && move === null;
  ui.solved.hidden = !solved;
  ui.current.hidden = solved || move === null;
  ui.done.disabled = guideBusy || move === null;
  ui.undo.disabled = guideBusy || !history.length;
  ui.mode.textContent = t(autoConfirm ? "guide.toManual" : "guide.toAuto");
  ui.guideStage.hidden = !autoConfirm;
  ui.guide.classList.toggle("is-manual", !autoConfirm);
  renderGuideCamera();
  setText(ui.guideStatus, guideError ? t("guide.error", { message: guideError }) : guideBusy ? t("scan.solving") : "", !!guideError);
  if (move !== null) {
    ui.moveName.textContent = move;
    ui.moveText.textContent = `${describeMove(move)} ${t("guide.look")}`;
    ui.moveCount.textContent = t("guide.count", { k: history.length + 1, n: history.length + guide.plan.length });
    drawMoveIcon(cubeState, move);
  }
  ui.moveList.replaceChildren(
    ...[...history, ...guide.plan].map((m, k) => {
      const item = document.createElement("li");
      item.textContent = m;
      if (k < history.length) item.className = "is-done";
      else if (k === history.length) item.className = "is-current";
      return item;
    }),
  );
}

/** Cubo visto da chi risolve: strato da girare acceso, frecce del movimento (come draw_move_icon). */
function drawMoveIcon(state, move) {
  const svg = "http://www.w3.org/2000/svg";
  const { stickers, arrows } = iconGeometry(state, move);
  const point = ([x, y]) => `${x.toFixed(3)},${(-y).toFixed(3)}`; // y verso l'alto
  const shapes = stickers.map(({ corners, letter, inLayer }) => {
    const polygon = document.createElementNS(svg, "polygon");
    polygon.setAttribute("points", corners.map(point).join(" "));
    const color = inLayer ? FACE_COLORS[letter] : FACE_COLORS[letter].map((c) => Math.round(0.35 * c));
    polygon.setAttribute("fill", rgb(color));
    if (inLayer) polygon.setAttribute("class", "icon__layer");
    return polygon;
  });
  const lines = arrows.map(([from, to]) => {
    const line = document.createElementNS(svg, "line");
    const [[x1, y1], [x2, y2]] = [from, to];
    Object.entries({ x1, y1: -y1, x2, y2: -y2 }).forEach(([k, v]) => line.setAttribute(k, v.toFixed(3)));
    line.setAttribute("class", "icon__arrow");
    line.setAttribute("marker-end", "url(#arrowhead)");
    return line;
  });
  ui.moveIcon.querySelectorAll("polygon, line").forEach((n) => n.remove());
  ui.moveIcon.append(...shapes, ...lines);
}

/* ---------- Eventi ---------- */

ui.start.addEventListener("click", start);
ui.restart.addEventListener("click", () => {
  scan.restart();
  scanEvent = null;
});
ui.switchCamera.addEventListener("click", async () => {
  facingMode = facingMode === "user" ? "environment" : "user";
  try {
    await startCamera();
    scan.restart();
    scanEvent = null;
    ensureLoop();
  } catch (exc) {
    const [key, params] = cameraError(exc);
    scanEvent = { key, params, warn: true };
  }
});
ui.done.addEventListener("click", () => {
  guideEvent = null;
  confirmMove();
});
ui.undo.addEventListener("click", undoMove);
ui.mode.addEventListener("click", toggleMode);
ui.rescan.addEventListener("click", async () => {
  phase = "intro";
  ui.guide.hidden = true;
  ui.start.disabled = true;
  try {
    if (!stream) await startCamera();
    startScan();
    ui.scan.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (exc) {
    ui.intro.hidden = false;
    const [key, params] = exc.key ? [exc.key, {}] : cameraError(exc);
    showLoad(key, params, true);
  } finally {
    ui.start.disabled = false;
  }
});

document.addEventListener("keydown", (event) => {
  if (phase !== "guide" || event.repeat || event.target.closest?.("button, input, a")) return;
  if (event.key === " ") {
    event.preventDefault();
    guideEvent = null;
    confirmMove();
  } else if (event.key === "z" || event.key === "Z") {
    undoMove();
  } else if (event.key === "m" || event.key === "M") {
    toggleMode();
  }
});

window.addEventListener("pagehide", stopCamera);

buildNet();
setupPage(() => {
  if (ui.load.dataset.key) showLoad(ui.load.dataset.key, JSON.parse(ui.load.dataset.params), ui.load.classList.contains("is-error"));
  if (phase === "scan") renderScan(performance.now() / 1000);
  if (phase === "guide") renderGuide();
});
