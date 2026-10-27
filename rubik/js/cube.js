// Modello puro del cubo 3x3: porting di ros2_ws/src/features/rubik_cube/rubik_cube/cube.py.
//
// Stato: stringa di 54 caratteri, facce nell'ordine U R F D L B, 9 facelet per faccia
// riga per riga (convenzione Kociemba). Ogni faccia si legge guardandola da fuori:
// U con B in alto, D con F in alto, R F L B con U in alto.
//
// Mosse: lettera = 90° in senso orario guardando quella faccia, `'` = antiorario, `2` = 180°.
// Le permutazioni sono ricavate dalla geometria (posizione e normale di ogni adesivo),
// non scritte a mano.

export const FACES = "URFDLB";
export const SOLVED = [...FACES].map((face) => face.repeat(9)).join("");
export const CENTER_INDICES = [0, 1, 2, 3, 4, 5].map((i) => 9 * i + 4);

// Sistema di riferimento: x verso R, y verso U, z verso F.
// Per ogni faccia: normale uscente, direzione delle colonne (sinistra -> destra)
// e direzione delle righe (alto -> basso), viste da fuori.
const FACE_FRAMES = {
  U: [[0, 1, 0], [1, 0, 0], [0, 0, 1]],
  R: [[1, 0, 0], [0, 0, -1], [0, -1, 0]],
  F: [[0, 0, 1], [1, 0, 0], [0, -1, 0]],
  D: [[0, -1, 0], [1, 0, 0], [0, 0, -1]],
  L: [[-1, 0, 0], [0, 0, 1], [0, -1, 0]],
  B: [[0, 0, -1], [-1, 0, 0], [0, -1, 0]],
};

const SUFFIX_TURNS = { "": 1, "'": 3, "2": 2 };

const add = (...vectors) => [0, 1, 2].map((k) => vectors.reduce((sum, v) => sum + v[k], 0));
const scale = (k, v) => v.map((c) => k * c);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const key = (...vectors) => vectors.map((v) => v.join(",")).join("|");

/**
 * [posizione, normale] di ognuno dei 54 adesivi, nell'ordine della stringa di stato.
 *
 * Coordinate intere in unità di cubetto: x verso R, y verso U, z verso F, centro del cubo nell'origine.
 */
export function stickerFrames() {
  const stickers = [];
  for (const face of FACES) {
    const [normal, colDir, rowDir] = FACE_FRAMES[face];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        stickers.push([add(normal, scale(col - 1, colDir), scale(row - 1, rowDir)), normal]);
      }
    }
  }
  return stickers;
}

/** Rotazione di 90° oraria guardando dalla punta di `axis` (cioè -90° attorno all'asse). */
function rotateClockwise(v, axis) {
  return add(scale(-1, cross(axis, v)), scale(dot(axis, v), axis));
}

/** perm[i] = indice dove finisce l'adesivo i dopo un quarto di giro orario di `face`. */
function quarterTurnPermutation(face) {
  const stickers = stickerFrames();
  const indexOf = new Map(stickers.map(([pos, normal], i) => [key(pos, normal), i]));
  const axis = FACE_FRAMES[face][0];
  return stickers.map(([pos, normal], i) =>
    dot(pos, axis) === 1 ? indexOf.get(key(rotateClockwise(pos, axis), rotateClockwise(normal, axis))) : i,
  );
}

const QUARTER_TURNS = Object.fromEntries([...FACES].map((face) => [face, quarterTurnPermutation(face)]));

/** 'R' -> ['R', 1], "U'" -> ['U', 3], 'F2' -> ['F', 2]. */
export function parseMove(move) {
  if (typeof move !== "string" || !move || !FACES.includes(move[0]) || !(move.slice(1) in SUFFIX_TURNS)) {
    throw new Error(`mossa non valida: ${JSON.stringify(move)}`);
  }
  return [move[0], SUFFIX_TURNS[move.slice(1)]];
}

/** Sequenza separata da spazi, es. "R U R' U'"; ogni mossa viene validata. */
export function parseMoves(sequence) {
  const moves = sequence.split(/\s+/).filter(Boolean);
  moves.forEach(parseMove);
  return moves;
}

/** Indici degli adesivi che una mossa sposta: la faccia (centro escluso) e una fila di 3 su ognuna delle 4 facce vicine. */
export function affectedIndices(move) {
  const [face] = parseMove(move);
  const perm = QUARTER_TURNS[face];
  return new Set(perm.flatMap((target, i) => (target !== i ? [i] : [])));
}

const count = (state, face) => [...state].filter((c) => c === face).length;

/** Controlli di base: 54 caratteri, solo lettere URFDLB, 9 per colore, centri al loro posto. */
export function validateState(state) {
  if (state.length !== 54) {
    throw new Error(`lo stato deve avere 54 caratteri, ne ha ${state.length}`);
  }
  const unknown = [...new Set(state)].filter((c) => !FACES.includes(c)).sort();
  if (unknown.length) {
    throw new Error(`caratteri non validi: ${unknown.join("")}`);
  }
  for (const face of FACES) {
    if (count(state, face) !== 9) {
      throw new Error(`il colore ${face} compare ${count(state, face)} volte invece di 9`);
    }
  }
  [...FACES].forEach((face, i) => {
    if (state[CENTER_INDICES[i]] !== face) {
      throw new Error(`il centro della faccia ${face} è ${state[CENTER_INDICES[i]]}`);
    }
  });
}

/**
 * Indici degli adesivi di ogni angolo e spigolo, ciascuno con l'adesivo di riferimento per primo.
 *
 * Riferimento: la faccia U/D se il pezzo ne ha una, altrimenti F/B (convenzione di Kociemba).
 * Negli angoli gli altri due adesivi seguono in senso antiorario visti da fuori, uguale per tutti.
 */
function cubieStickers() {
  const frames = stickerFrames();
  const byPosition = new Map();
  frames.forEach(([pos], i) => {
    const k = key(pos);
    if (!byPosition.has(k)) byPosition.set(k, { pos, indices: [] });
    byPosition.get(k).indices.push(i);
  });
  // Stesso ordine del sorted() di Python sulle tuple di posizione.
  const sorted = [...byPosition.values()].sort((a, b) => a.pos[0] - b.pos[0] || a.pos[1] - b.pos[1] || a.pos[2] - b.pos[2]);
  const corners = [];
  const edges = [];
  for (const { indices } of sorted) {
    if (indices.length === 3) {
      const ref = indices.find((i) => frames[i][1][1] !== 0);
      let [a, b] = indices.filter((i) => i !== ref);
      if (dot(frames[ref][1], cross(frames[a][1], frames[b][1])) < 0) {
        [a, b] = [b, a];
      }
      corners.push([ref, a, b]);
    } else if (indices.length === 2) {
      let ref = indices.find((i) => frames[i][1][1] !== 0);
      if (ref === undefined) {
        ref = indices.find((i) => frames[i][1][2] !== 0);
      }
      edges.push([ref, indices.find((i) => i !== ref)]);
    }
  }
  return [corners, edges];
}

const [CORNERS, EDGES] = cubieStickers();

function permutationParity(perm) {
  const seen = new Set();
  let cycles = 0;
  for (let start = 0; start < perm.length; start++) {
    if (!seen.has(start)) {
      cycles += 1;
      for (let i = start; !seen.has(i); i = perm[i]) {
        seen.add(i);
      }
    }
  }
  return (perm.length - cycles) % 2;
}

/**
 * Identità di un pezzo dai suoi colori, indipendente dall'orientamento.
 *
 * Per gli angoli conta l'ordine ciclico: un angolo con due colori scambiati è la sua immagine
 * speculare, che non esiste su un cubo vero.
 */
function pieceKey(colors) {
  if (colors.length === 2) {
    return [...colors].sort().join("");
  }
  return colors.map((_, k) => colors.slice(k).concat(colors.slice(0, k)).join("")).sort()[0];
}

/** Per ogni posizione, l'indice del pezzo (nel cubo risolto) che ci sta sopra, riconosciuto dai colori. */
function identify(state, pieces, kind) {
  const home = new Map(pieces.map((piece, n) => [pieceKey(piece.map((i) => SOLVED[i])), n]));
  const perm = pieces.map((piece) => {
    const colors = pieceKey(piece.map((i) => state[i]));
    if (!home.has(colors)) {
      throw new Error(`${kind} con colori impossibili: ${piece.map((i) => state[i]).join("")}`);
    }
    return home.get(colors);
  });
  if (new Set(perm).size !== perm.length) {
    throw new Error(`${kind} duplicato: due pezzi hanno gli stessi colori`);
  }
  return perm;
}

/**
 * Lancia un Error, con il motivo, se lo stato non è raggiungibile girando le facce.
 *
 * Oltre a validateState controlla: pezzi esistenti e senza doppioni, somma delle torsioni
 * degli angoli multipla di 3, numero di spigoli capovolti pari, stessa parità di angoli e spigoli.
 */
export function checkSolvable(state) {
  validateState(state);
  const cornerPerm = identify(state, CORNERS, "angolo");
  const edgePerm = identify(state, EDGES, "spigolo");
  const twist = CORNERS.reduce((sum, piece) => sum + piece.findIndex((i) => "UD".includes(state[i])), 0);
  if (twist % 3) {
    throw new Error("un angolo è ruotato sul posto (torsione totale non multipla di 3)");
  }
  let flips = 0;
  for (const [ref, other] of EDGES) {
    const primary = "UD".includes(state[ref]) || "UD".includes(state[other]) ? "UD" : "FB";
    flips += primary.includes(state[ref]) ? 0 : 1;
  }
  if (flips % 2) {
    throw new Error("uno spigolo è capovolto sul posto");
  }
  if (permutationParity(cornerPerm) !== permutationParity(edgePerm)) {
    throw new Error("due pezzi sono scambiati (parità diversa tra angoli e spigoli)");
  }
}

export function applyMove(state, move) {
  const [face, turns] = parseMove(move);
  const perm = QUARTER_TURNS[face];
  let cells = [...state];
  for (let t = 0; t < turns; t++) {
    const moved = new Array(54);
    perm.forEach((target, i) => {
      moved[target] = cells[i];
    });
    cells = moved;
  }
  return cells.join("");
}

export function applyMoves(state, sequence) {
  return parseMoves(sequence).reduce(applyMove, state);
}

/** Scramble casuale; due mosse consecutive non girano mai la stessa faccia. `random` come Math.random. */
export function randomScramble(random = Math.random, length = 25) {
  const suffixes = Object.keys(SUFFIX_TURNS);
  const moves = [];
  while (moves.length < length) {
    const move = FACES[Math.floor(random() * 6)] + suffixes[Math.floor(random() * 3)];
    if (!moves.length || moves.at(-1)[0] !== move[0]) {
      moves.push(move);
    }
  }
  return moves;
}
