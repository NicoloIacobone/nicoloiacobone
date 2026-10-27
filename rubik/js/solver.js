// Soluzione del cubo e guida mossa per mossa: porting di ros2_ws/src/features/rubik_cube/rubik_cube/solver.py.
//
// La ricerca (cubejs, two-phase di Kociemba, MIT) gira in un Web Worker (solver-worker.js);
// qui restano i controlli sullo stato e sulla soluzione, uguali a quelli del codice Python.

import { SOLVED, applyMove, applyMoves, checkSolvable, parseMove, parseMoves } from "./cube.js";

/**
 * Mosse che portano `state` al cubo risolto; lista vuota se è già risolto.
 *
 * `search(state)` restituisce (anche come Promise) la soluzione come stringa, es. "R U2 F'".
 * Lancia un Error se lo stato non è valido o non è risolvibile (es. un angolo ruotato sul posto).
 */
export async function solve(state, search) {
  checkSolvable(state);
  if (state === SOLVED) {
    // Come kociemba, cubejs restituisce comunque una sequenza che non cambia il cubo.
    return [];
  }
  const moves = parseMoves(await search(state));
  if (applyMoves(state, moves.join(" ")) !== SOLVED) {
    throw new Error("la soluzione trovata non risolve il cubo");
  }
  return moves;
}

/** La mossa che annulla `move`: R -> R', R' -> R, R2 -> R2. */
export function inverseMove(move) {
  const [face, turns] = parseMove(move);
  return face + { 1: "'", 3: "", 2: "2" }[turns];
}

/** Il solver nel Web Worker. `worker` si passa solo nei test. */
export class WorkerSolver {
  constructor(worker = new Worker(new URL("./solver-worker.js", import.meta.url))) {
    this._worker = worker;
    this._pending = new Map();
    this._nextId = 0;
    /** Si risolve quando le tabelle del solver sono pronte. */
    this.ready = new Promise((resolve) => {
      this._resolveReady = resolve;
    });
    worker.onmessage = ({ data }) => {
      if (data.ready) {
        this._resolveReady();
        return;
      }
      const request = this._pending.get(data.id);
      this._pending.delete(data.id);
      if (data.error !== undefined) {
        request.reject(new Error(`errore del solver: ${data.error}`));
      } else {
        request.resolve(data.moves);
      }
    };
    worker.onerror = (event) => {
      const error = new Error(`il solver si è fermato: ${event.message}`);
      for (const request of this._pending.values()) request.reject(error);
      this._pending.clear();
    };
  }

  /** Soluzione grezza di cubejs, senza controlli. */
  search(state) {
    return new Promise((resolve, reject) => {
      const id = this._nextId++;
      this._pending.set(id, { resolve, reject });
      this._worker.postMessage({ id, state });
    });
  }

  solve(state) {
    return solve(state, (s) => this.search(s));
  }
}

/**
 * Segue una soluzione mossa per mossa.
 *
 * Se il nuovo stato è quello atteso dopo la mossa suggerita, avanza nel piano;
 * altrimenti (mossa diversa, stato reimpostato) ricalcola la soluzione dal nuovo stato.
 */
export class Guide {
  /** `solver(state)` -> lista di mosse (anche come Promise). */
  constructor(solver) {
    this._solver = solver;
    this._state = null;
    this.plan = [];
  }

  get nextMove() {
    return this.plan.length ? this.plan[0] : null;
  }

  /** Nuovo stato del cubo -> prossima mossa suggerita (null = cubo risolto). */
  async update(state) {
    if (state === this._state) {
      return this.nextMove;
    }
    if (this.plan.length && this._state !== null && applyMove(this._state, this.plan[0]) === state) {
      this.plan = this.plan.slice(1);
    } else {
      this.plan = await this._solver(state);
    }
    this._state = state;
    return this.nextMove;
  }
}
