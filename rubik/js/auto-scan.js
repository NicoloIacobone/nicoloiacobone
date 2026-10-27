// Scansione automatica: quando acquisire una faccia, quale faccia è, quando lo stato è pronto (niente OpenCV).
// Porting di mac_client/rubik/auto_scan.py.
//
// A ogni fotogramma arriva la lettura della faccia vista (9 colori Lab e RGB, riga per riga) o null.
// Una faccia si acquisisce quando la lettura resta uguale per STABLE_S secondi: una volta sola finché
// resta in vista. Una faccia con un centro nuovo si aggiunge; una già acquisita si sostituisce (così,
// se lo stato non torna, basta rimostrare la faccia sbagliata). Con 6 facce e uno stato valido parte
// un conto alla rovescia di COUNTDOWN_S secondi, poi lo stato è pronto.
//
// Differenza dal Python: observe() restituisce un codice ("captured", "updated", "unknown-center")
// invece di un testo, così la pagina lo traduce.

import { FACES } from "./cube.js";
import { assembleState, colorDistance, median, nameCenters } from "./cube-scan.js";

export const STABLE_S = 0.5; // tempo con la stessa lettura prima di acquisire
export const STABLE_MIN_FRAMES = 5; // e almeno questi fotogrammi
export const STABLE_DISTANCE = 18.0; // differenza massima di colore di ogni casella dalla lettura media
export const SAME_FACE_DISTANCE = 22.0; // centri più vicini di così sono la stessa faccia (tra facce diverse: ~40 o più)
export const COUNTDOWN_S = 2.0; // attesa prima di dichiarare pronto uno stato valido

/** Lettura di una faccia: `labs` 9 colori Lab, `rgbs` gli stessi in RGB per disegnarli. */
function meanReading(readings) {
  return {
    labs: readings[0].labs.map((_, k) => median(readings.map((r) => r.labs[k]))),
    rgbs: readings[0].rgbs.map((_, k) => median(readings.map((r) => r.rgbs[k])).map(Math.trunc)),
  };
}

/** Stato della scansione automatica; si usa con observe(lettura, ora in secondi) a ogni fotogramma. */
export class AutoScan {
  constructor() {
    this.restart();
  }

  restart() {
    this.captures = [];
    this.result = null;
    this._streak = []; // [ora, lettura]
    this._streakUsed = false;
    this._countdownEnd = null;
    this.sent = false;
    this.lastIndex = null; // acquisizione aggiunta o sostituita per ultima
  }

  /** Faccia di ogni acquisizione (provvisoria finché non sono 6). */
  get names() {
    if (this.result !== null) {
      const byIndex = Object.fromEntries(Object.entries(this.result.faces).map(([face, k]) => [k, face]));
      return this.captures.map((_, k) => byIndex[k]);
    }
    return nameCenters(this.captures.map((c) => c.labs[4]));
  }

  /** Da 0 a 1: quanto manca ad acquisire la faccia in vista (1 = acquisita). */
  stability(now) {
    if (!this._streak.length) return 0.0;
    if (this._streakUsed) return 1.0;
    return Math.min(1.0, (now - this._streak[0][0]) / STABLE_S);
  }

  /** Una lettura (null = nessuna faccia completa in vista) -> codice se è successo qualcosa, altrimenti null. */
  observe(reading, now) {
    if (reading === null) {
      this._streak = [];
      this._streakUsed = false;
      return null;
    }
    if (this._streak.length) {
      const mean = meanReading(this._streak.map(([, r]) => r));
      if (reading.labs.some((lab, k) => colorDistance(lab, mean.labs[k]) > STABLE_DISTANCE)) {
        this._streak = [];
        this._streakUsed = false;
      }
    }
    this._streak.push([now, reading]);
    if (this._streakUsed || now - this._streak[0][0] < STABLE_S || this._streak.length < STABLE_MIN_FRAMES) {
      return null;
    }
    this._streakUsed = true;
    return this._capture(meanReading(this._streak.map(([, r]) => r)), now);
  }

  _capture(reading, now) {
    const same = this.captures.findIndex((c) => colorDistance(c.labs[4], reading.labs[4]) < SAME_FACE_DISTANCE);
    let code;
    if (same >= 0) {
      this.lastIndex = same;
      this.captures[same] = reading;
      code = "updated";
    } else {
      if (this.captures.length === 6) {
        return "unknown-center";
      }
      this.lastIndex = this.captures.length;
      this.captures.push(reading);
      code = "captured";
    }
    this.result = this.captures.length === 6 ? assembleState(this.captures.map((c) => c.labs)) : null;
    this.sent = false;
    const valid = this.result !== null && this.result.error === null;
    this._countdownEnd = valid ? now + COUNTDOWN_S : null;
    return code;
  }

  /** Secondi al momento in cui lo stato è pronto, o null se non c'è uno stato valido in attesa. */
  countdown(now) {
    if (this._countdownEnd === null || this.sent) return null;
    return Math.max(0.0, this._countdownEnd - now);
  }

  /** true una volta, quando il conto alla rovescia arriva a zero. */
  sendDue(now) {
    if (this.countdown(now) === 0.0) {
      this.sent = true;
      return true;
    }
    return false;
  }

  /** Facce da rimostrare se lo stato non torna: quelle con adesivi incerti (o tutte se non ce ne sono). */
  get suspects() {
    if (this.result === null || this.result.error === null) return [];
    const doubtful = [...new Set(this.result.doubtful.map((i) => Math.floor(i / 9)))].sort((a, b) => a - b);
    return doubtful.length ? doubtful.map((f) => FACES[f]) : [...FACES];
  }
}
