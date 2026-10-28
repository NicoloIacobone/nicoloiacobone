// Testi IT/EN della pagina, tema e lingua: stesse chiavi di localStorage e stesso markup del sito
// (js/main.js), così la scelta fatta in una pagina vale anche nell'altra.

const STORE_THEME = "theme";
const STORE_LANG = "lang";
const root = document.documentElement;

const I18N = {
  it: {
    "meta.title": "Cubo di Rubik con la fotocamera — Nicolò Iacobone",
    "meta.description": "Scansiona un cubo di Rubik con la fotocamera e risolvilo mossa per mossa, tutto nel browser.",
    "a11y.langGroup": "Lingua",
    "a11y.theme": "Cambia tema",
    "nav.back": "Torna al sito",
    "intro.kicker": "Progetto personale · doppelbot",
    "intro.title": "Risolvi il cubo di Rubik con la fotocamera",
    "intro.lead":
      "Mostra alla fotocamera le sei facce del cubo, in qualsiasi ordine: la pagina le riconosce, ricostruisce il cubo e ti guida alla soluzione una mossa alla volta.",
    "intro.step1": "Avvia la fotocamera e tieni il cubo ben illuminato.",
    "intro.step2": "Mostra una faccia alla volta e tienila ferma finché il riquadro diventa verde.",
    "intro.step3": "Dopo la sesta faccia segui le mosse, dal tuo punto di vista.",
    "intro.note":
      "Funziona con i cubi con gli adesivi su plastica nera, come il Rubik's originale, e con quelli come il mio, con l'interno delle caselle scuro. I cubi senza adesivi (stickerless) per ora non vengono riconosciuti.",
    "intro.privacy": "Le immagini restano sul tuo dispositivo: niente viene inviato né salvato.",
    "intro.start": "Avvia la fotocamera",
    "load.opencv": "Caricamento di OpenCV (circa 4 MB)…",
    "load.camera": "Accensione della fotocamera…",
    "error.insecure": "La fotocamera funziona solo da una pagina sicura (https).",
    "error.denied": "Accesso alla fotocamera negato: consentilo nelle impostazioni del browser e riprova.",
    "error.nocamera": "Nessuna fotocamera trovata.",
    "error.camera": "Impossibile avviare la fotocamera: {message}",
    "error.opencv": "Impossibile caricare OpenCV: {message}",
    "scan.title": "Scansione",
    "scan.prompt": "Mostra le 6 facce, una alla volta, in qualsiasi ordine ({n}/6)",
    "scan.hold": "Tieni ferma ogni faccia finché il riquadro diventa verde.",
    "scan.covered": "Caselle coperte (X rosse): sposta le dita.",
    "scan.captured": "Faccia {color} acquisita ({n}/6)",
    "scan.updated": "Faccia {color} aggiornata ({n}/6)",
    "scan.unknown": "Centro non riconosciuto: ricomincia la scansione.",
    "scan.invalid": "Il cubo letto non è possibile: mostra di nuovo la faccia {faces}.",
    "scan.replace": "Una faccia mostrata di nuovo sostituisce quella di prima.",
    "scan.valid": "Cubo letto! Soluzione tra {seconds} s",
    "scan.doubtful": "{n} adesivi incerti (X): controllali sul cubo.",
    "scan.solving": "Calcolo della soluzione…",
    "scan.restart": "Ricomincia",
    "scan.switch": "Cambia fotocamera",
    "scan.net": "Facce acquisite",
    "app.exit": "Esci",
    "guide.title": "Soluzione",
    "guide.hold": "Tieni il cubo con il verde verso di te e il bianco in alto: la fotocamera vede la faccia blu.",
    "guide.next": "Prossima mossa",
    "guide.count": "Mossa {k} di {n}",
    "guide.done": "Fatto",
    "guide.undo": "Annulla l'ultima",
    "guide.rescan": "Nuova scansione",
    "guide.keys": "Tasti: Spazio = fatto, Z = annulla, M = conferma automatica o a mano",
    "guide.watching": "Conferma automatica: fai la mossa, la fotocamera la riconosce dalla faccia blu.",
    "guide.notVisible": "La mossa {move} non si vede dalla faccia blu: premi Fatto (o Spazio) quando l'hai fatta.",
    "guide.showBlue": "Alla fotocamera deve esserci la faccia blu.",
    "guide.confirmed": "Mossa {move} riconosciuta dalla fotocamera",
    "guide.toManual": "Conferma a mano",
    "guide.toAuto": "Conferma automatica",
    "guide.solved": "Cubo risolto!",
    "guide.solvedText": "Ottimo lavoro. Puoi mischiarlo e ricominciare con una nuova scansione.",
    "guide.error": "Errore del solver: {message}",
    "guide.look": "(guardando quella faccia)",
    "face.U": "sopra",
    "face.D": "sotto",
    "face.F": "davanti",
    "face.B": "dietro",
    "face.R": "destra",
    "face.L": "sinistra",
    "turn.1": "senso orario",
    "turn.3": "senso antiorario",
    "turn.2": "mezzo giro",
    "move.text": "Faccia {face}, {turn}",
    "color.U": "bianca",
    "color.R": "rossa",
    "color.F": "verde",
    "color.D": "gialla",
    "color.L": "arancione",
    "color.B": "blu",
    "list.and": "e",
    "about.title": "Come funziona",
    "about.vision":
      "Visione: la pagina cerca macchie quasi quadrate disposte a griglia 3×3: gli interni scuri delle caselle o, nel cubo classico, gli adesivi chiari separati dal nero. Il colore di ogni casella si legge dai suoi pixel; il riferimento sono i centri del cubo stesso, così si adatta alla luce della stanza.",
    "about.state":
      "Stato: le facce si riconoscono dal centro; la rotazione di ognuna è l'unica che rende il cubo risolvibile.",
    "about.solver": "Soluzione: algoritmo two-phase di Kociemba, al massimo 22 mosse, calcolato nel browser.",
    "about.origin":
      "È una funzione di doppelbot, il mio gemello digitale: un robot Unitree G1 simulato in ROS 2 che imita i movimenti visti dalla webcam.",
    "about.credits": "Librerie: OpenCV.js (Apache-2.0) e cubejs (MIT), servite da questo sito.",
    "footer.back": "Torna al sito",
    "footer.privacy": "Privacy",
  },
  en: {
    "meta.title": "Rubik's cube with your camera — Nicolò Iacobone",
    "meta.description": "Scan a Rubik's cube with your camera and solve it move by move, all in the browser.",
    "a11y.langGroup": "Language",
    "a11y.theme": "Toggle theme",
    "nav.back": "Back to the site",
    "intro.kicker": "Personal project · doppelbot",
    "intro.title": "Solve a Rubik's cube with your camera",
    "intro.lead":
      "Show the six faces of the cube to the camera, in any order: the page recognises them, rebuilds the cube and guides you to the solution one move at a time.",
    "intro.step1": "Start the camera and keep the cube well lit.",
    "intro.step2": "Show one face at a time and hold it still until the frame turns green.",
    "intro.step3": "After the sixth face, follow the moves from your own point of view.",
    "intro.note":
      "It works with cubes that have stickers on black plastic, like the original Rubik's, and with cubes like mine, whose squares have a dark centre. Stickerless cubes are not recognised yet.",
    "intro.privacy": "Images stay on your device: nothing is sent or stored.",
    "intro.start": "Start the camera",
    "load.opencv": "Loading OpenCV (about 4 MB)…",
    "load.camera": "Starting the camera…",
    "error.insecure": "The camera only works from a secure page (https).",
    "error.denied": "Camera access denied: allow it in your browser settings and try again.",
    "error.nocamera": "No camera found.",
    "error.camera": "Cannot start the camera: {message}",
    "error.opencv": "Cannot load OpenCV: {message}",
    "scan.title": "Scan",
    "scan.prompt": "Show the 6 faces, one at a time, in any order ({n}/6)",
    "scan.hold": "Hold each face still until the frame turns green.",
    "scan.covered": "Covered stickers (red X): move your fingers.",
    "scan.captured": "{color} face captured ({n}/6)",
    "scan.updated": "{color} face updated ({n}/6)",
    "scan.unknown": "Centre not recognised: restart the scan.",
    "scan.invalid": "The cube read is impossible: show the {faces} face again.",
    "scan.replace": "A face shown again replaces the previous one.",
    "scan.valid": "Cube read! Solution in {seconds} s",
    "scan.doubtful": "{n} uncertain stickers (X): check them on the cube.",
    "scan.solving": "Computing the solution…",
    "scan.restart": "Restart",
    "scan.switch": "Switch camera",
    "scan.net": "Captured faces",
    "app.exit": "Exit",
    "guide.title": "Solution",
    "guide.hold": "Hold the cube with green facing you and white on top: the camera sees the blue face.",
    "guide.next": "Next move",
    "guide.count": "Move {k} of {n}",
    "guide.done": "Done",
    "guide.undo": "Undo last",
    "guide.rescan": "New scan",
    "guide.keys": "Keys: Space = done, Z = undo, M = automatic or manual confirmation",
    "guide.watching": "Automatic confirmation: make the move, the camera recognises it from the blue face.",
    "guide.notVisible": "Move {move} cannot be seen from the blue face: press Done (or Space) once you have made it.",
    "guide.showBlue": "The blue face must face the camera.",
    "guide.confirmed": "Move {move} recognised by the camera",
    "guide.toManual": "Confirm manually",
    "guide.toAuto": "Confirm automatically",
    "guide.solved": "Cube solved!",
    "guide.solvedText": "Well done. Scramble it and start again with a new scan.",
    "guide.error": "Solver error: {message}",
    "guide.look": "(looking at that face)",
    "face.U": "top",
    "face.D": "bottom",
    "face.F": "front",
    "face.B": "back",
    "face.R": "right",
    "face.L": "left",
    "turn.1": "clockwise",
    "turn.3": "counter-clockwise",
    "turn.2": "half turn",
    "move.text": "{face} face, {turn}",
    "color.U": "White",
    "color.R": "Red",
    "color.F": "Green",
    "color.D": "Yellow",
    "color.L": "Orange",
    "color.B": "Blue",
    "list.and": "and",
    "about.title": "How it works",
    "about.vision":
      "Vision: the page looks for nearly square blobs arranged in a 3×3 grid: the dark centres of the squares or, on a classic cube, the bright stickers separated by black. Each colour is read from the square's own pixels; the reference is the cube's own centres, so it adapts to the room's light.",
    "about.state": "State: faces are recognised by their centre; each face's rotation is the only one that makes the cube solvable.",
    "about.solver": "Solution: Kociemba's two-phase algorithm, at most 22 moves, computed in the browser.",
    "about.origin":
      "It is a feature of doppelbot, my digital twin: a Unitree G1 robot simulated in ROS 2 that mimics the movements seen by the webcam.",
    "about.credits": "Libraries: OpenCV.js (Apache-2.0) and cubejs (MIT), served by this site.",
    "footer.back": "Back to the site",
    "footer.privacy": "Privacy",
  },
};

/** localStorage può lanciare in modalità privata: si continua senza ricordare la scelta. */
function store(key, value) {
  try {
    if (value === undefined) return localStorage.getItem(key);
    localStorage.setItem(key, value);
  } catch {
    // storage non disponibile
  }
  return null;
}

export function lang() {
  return root.getAttribute("lang") === "en" ? "en" : "it";
}

/** Testo nella lingua corrente; {nome} si sostituisce con params.nome. */
export function t(key, params = {}) {
  const text = I18N[lang()][key] ?? I18N.it[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? ""));
}

/** Nomi dei colori delle facce come elenco: "rossa e blu", "red and blue". */
export function colorList(faces) {
  const names = faces.map((f) => t(`color.${f}`).toLowerCase());
  return names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} ${t("list.and")} ${names.at(-1)}`;
}

function applyLang(next, onChange) {
  root.setAttribute("lang", next);
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const value = t(el.getAttribute("data-i18n"));
    const attrs = el.getAttribute("data-i18n-attr");
    if (attrs) attrs.split(",").forEach((a) => el.setAttribute(a.trim(), value));
    else el.textContent = value;
  });
  document.title = t("meta.title");
  document.querySelectorAll(".langswitch__btn").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === next)));
  onChange?.();
}

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#0e1118" : "#ffffff");
}

/** Lingua e tema iniziali, pulsanti IT/EN e tema; onLangChange si chiama dopo ogni cambio di lingua. */
export function setupPage(onLangChange) {
  const saved = store(STORE_LANG);
  const browser = (navigator.languages?.[0] || navigator.language || "it").toLowerCase();
  applyLang(saved === "it" || saved === "en" ? saved : browser.startsWith("it") ? "it" : "en");
  document.querySelectorAll(".langswitch__btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      store(STORE_LANG, btn.dataset.lang);
      applyLang(btn.dataset.lang, onLangChange);
    }),
  );

  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  applyTheme(store(STORE_THEME) || (darkQuery.matches ? "dark" : "light"));
  document.getElementById("themeToggle")?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    store(STORE_THEME, next);
    applyTheme(next);
  });
  darkQuery.addEventListener?.("change", (e) => {
    if (!store(STORE_THEME)) applyTheme(e.matches ? "dark" : "light");
  });
}
