// Conferma automatica delle mosse dalla fotocamera (niente OpenCV). Porting di mac_client/rubik/move_check.py.
//
// Durante la guida il cubo si tiene nell'orientamento standard di chi risolve: F (verde) verso
// di sé e U (bianco) in alto, così le mosse a schermo sono quelle del proprio punto di vista.
// La fotocamera, di fronte, vede quindi la faccia B (blu), che si confronta con quella attesa dopo
// la mossa suggerita. Le mosse di F non cambiano B: non si possono verificare dalla fotocamera.

import { FACES, applyMove } from "./cube.js";
import { colorDistance } from "./cube-scan.js";

export const VIEW_FACE = "B"; // la faccia rivolta alla fotocamera durante la guida
export const FRAMES_TO_CONFIRM = 6; // fotogrammi consecutivi con la faccia attesa prima di confermare

/** I 9 adesivi di una faccia, riga per riga come la vede la fotocamera. */
export function faceOf(state, face = VIEW_FACE) {
  const start = 9 * FACES.indexOf(face);
  return state.slice(start, start + 9);
}

/** Colori Lab letti -> lettera del colore di riferimento più vicino (es. i centri della scansione). */
export function classifyStickers(samples, references) {
  const entries = Object.entries(references);
  return samples
    .map((sample) => entries.reduce((best, entry) => (colorDistance(sample, entry[1]) < colorDistance(sample, best[1]) ? entry : best))[0])
    .join("");
}

/**
 * Conferma una mossa quando la faccia vista è quella attesa per FRAMES_TO_CONFIRM fotogrammi di fila.
 *
 * Se la mossa non cambia la faccia vista (es. F vista da B) non è verificabile: `visible` è false.
 */
export class MoveConfirmer {
  constructor(framesRequired = FRAMES_TO_CONFIRM, viewFace = VIEW_FACE) {
    this._framesRequired = framesRequired;
    this._viewFace = viewFace;
    this.clear();
  }

  setTarget(state, move) {
    const before = faceOf(state, this._viewFace);
    this.expected = faceOf(applyMove(state, move), this._viewFace);
    this.visible = this.expected !== before;
    this._streak = 0;
  }

  clear() {
    this.expected = null;
    this.visible = false;
    this._streak = 0;
  }

  /** Da 0 a 1: fotogrammi di fila con la faccia attesa, rispetto a quelli necessari. */
  get progress() {
    return Math.min(1.0, this._streak / this._framesRequired);
  }

  /** Faccia vista in un fotogramma ("" = nessuna faccia completa) -> true quando la mossa è confermata (una volta sola). */
  observe(seen) {
    if (!this.visible || this.expected === null) return false;
    this._streak = seen === this.expected ? this._streak + 1 : 0;
    if (this._streak >= this._framesRequired) {
      this.clear();
      return true;
    }
    return false;
  }
}
