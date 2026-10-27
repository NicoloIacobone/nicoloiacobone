// Scansione del cubo: colori e stato del cubo (niente OpenCV). Porting di mac_client/rubik/cube_scan.py.
//
// I colori arrivano in Lab (come li dà OpenCV a 8 bit: L 0-255, a e b centrati su 128).
// Ogni adesivo prende la lettera del centro più simile: il riferimento sono i centri del
// cubo stesso, così la classificazione si adatta alla luce della stanza.
//
// Le 6 facce si possono acquisire in qualsiasi ordine e rotazione: la faccia si riconosce dal
// centro, la rotazione di ognuna è l'unica che rende il cubo risolvibile (assembleState).
//
// Il colore di una casella si legge dai suoi pixel più saturi (non dalla mediana di tutti):
// funziona anche con adesivi a bordo colorato e interno nero, e ignora ciò che è grigio
// (plastica, interno in carbonio, muro dietro il cubo). Se nella casella non c'è niente di
// saturo, l'adesivo è bianco e si leggono i pixel più chiari.

import { FACES, checkSolvable } from "./cube.js";

export const CHROMA_MIN = 22.0; // saturazione minima di un pixel colorato
export const SATURATED_FRACTION = 0.13; // casella colorata se almeno il 13% dei pixel è saturo (sotto: bianca)
export const CHROMA_KEEP = 0.7; // pixel tenuti: saturazione almeno al 70% della più alta della casella
export const WHITE_BAND = [85, 98]; // per il bianco: percentili di luminosità tenuti (sopra sono riflessi)
export const L_WEIGHT = 0.5; // la luminosità conta meno della tinta: ombre e riflessi la fanno variare molto
export const DOUBT_RATIO = 0.6; // dubbio se il secondo centro più vicino è quasi vicino quanto il primo

// Colori tipici dei centri del cubo reale (Lab), solo per dire quale faccia è quale: si abbinano tutti
// e 6 insieme, quindi conta che siano nell'ordine giusto tra loro, non i valori esatti con questa luce.
export const CENTER_COLORS = {
  U: [222, 118, 131], // bianco
  R: [130, 193, 163], // rosso
  F: [186, 71, 167], // verde lime
  D: [215, 104, 183], // giallo
  L: [164, 162, 181], // arancione
  B: [132, 130, 81], // blu
};
const CLOCKWISE = [6, 3, 0, 7, 4, 1, 8, 5, 2]; // una faccia girata di un quarto in senso orario, riga per riga

/** Percentile `q` (0-100) di una lista di numeri, interpolazione lineare come np.percentile. */
export function percentile(values, q) {
  const sorted = Float64Array.from(values).sort();
  const index = (sorted.length - 1) * (q / 100);
  const below = Math.floor(index);
  const above = Math.min(below + 1, sorted.length - 1);
  const t = index - below;
  const a = sorted[below];
  const diff = sorted[above] - a;
  // Stessa formula di numpy (_lerp): dall'estremo più vicino, così gli arrotondamenti coincidono.
  return t >= 0.5 ? sorted[above] - diff * (1 - t) : a + diff * t;
}

/** Mediana componente per componente di una lista di vettori, come np.median(..., axis=0). */
export function median(vectors) {
  return vectors[0].map((_, k) => {
    const sorted = Float64Array.from(vectors, (v) => v[k]).sort();
    const mid = sorted.length >> 1;
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  });
}

/**
 * Maschera dei pixel (lista di [L, a, b]) che mostrano il colore dell'adesivo.
 *
 * Adesivo colorato: i pixel più saturi. Adesivo bianco: i pixel più chiari, esclusi i riflessi.
 * `white` null = decide la casella (bianca se ha pochi pixel saturi); true/false = colore noto.
 */
export function colorMask(labPixels, white = null) {
  const chroma = labPixels.map(([, a, b]) => Math.hypot(a - 128, b - 128));
  if (white === null) {
    white = chroma.filter((c) => c >= CHROMA_MIN).length / chroma.length < SATURATED_FRACTION;
  }
  let mask;
  if (!white) {
    const threshold = CHROMA_KEEP * percentile(chroma, 95);
    mask = chroma.map((c) => c >= threshold);
  } else {
    const lightness = labPixels.map(([l]) => l);
    const low = percentile(lightness, WHITE_BAND[0]);
    const high = percentile(lightness, WHITE_BAND[1]);
    mask = lightness.map((l) => l >= low && l <= high);
  }
  return mask.some(Boolean) ? mask : mask.map(() => true);
}

export function colorDistance(a, b) {
  return Math.sqrt((L_WEIGHT * (a[0] - b[0])) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

/**
 * 54 colori Lab (facce in ordine URFDLB, 9 per faccia riga per riga) -> [stato, indici dubbi].
 *
 * Ogni adesivo va al centro più vicino, con al massimo 9 adesivi per centro: si assegnano
 * prima le coppie più vicine. Dubbi: adesivi finiti su un centro diverso dal più vicino,
 * o con due centri quasi alla stessa distanza.
 */
export function classify(samples) {
  if (samples.length !== 54) {
    throw new Error(`servono 54 colori, ricevuti ${samples.length}`);
  }
  const faces = [0, 1, 2, 3, 4, 5];
  const centers = faces.map((f) => samples[9 * f + 4]);
  const distances = samples.map((s) => centers.map((c) => colorDistance(s, c)));

  const assignment = new Array(54).fill(null);
  const counts = new Array(6).fill(0);
  for (const f of faces) {
    assignment[9 * f + 4] = f;
    counts[f] = 1;
  }
  const pairs = [];
  for (let i = 0; i < 54; i++) {
    if (assignment[i] === null) faces.forEach((f) => pairs.push([distances[i][f], i, f]));
  }
  // Come il sorted() di Python sulle tuple: a parità di distanza, prima l'indice più basso.
  pairs.sort((p, q) => p[0] - q[0] || p[1] - q[1] || p[2] - q[2]);
  for (const [, i, f] of pairs) {
    if (assignment[i] === null && counts[f] < 9) {
      assignment[i] = f;
      counts[f] += 1;
    }
  }

  const doubtful = [];
  for (let i = 0; i < 54; i++) {
    if (i % 9 === 4) continue;
    // Ordinamento stabile come in Python: a parità di distanza resta la faccia con indice più basso.
    const [nearest, second] = [...faces].sort((f, g) => distances[i][f] - distances[i][g]);
    if (assignment[i] !== nearest || distances[i][nearest] > DOUBT_RATIO * distances[i][second]) {
      doubtful.push(i);
    }
  }
  return [assignment.map((f) => FACES[f]).join(""), doubtful];
}

/** Disposizioni di `length` elementi di `items`, nello stesso ordine di itertools.permutations. */
function* permutations(items, length) {
  if (length === 0) {
    yield [];
    return;
  }
  for (let i = 0; i < items.length; i++) {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)];
    for (const tail of permutations(rest, length - 1)) yield [items[i], ...tail];
  }
}

/** Colori Lab di centri diversi (fino a 6) -> la faccia di ciascuno (l'abbinamento più vicino nell'insieme). */
export function nameCenters(centers) {
  if (centers.length > 6) {
    throw new Error(`al massimo 6 centri, ricevuti ${centers.length}`);
  }
  let best = null;
  let bestCost = Infinity;
  for (const names of permutations([...FACES], centers.length)) {
    const cost = names.reduce((sum, n, k) => sum + colorDistance(centers[k], CENTER_COLORS[n]), 0);
    if (cost < bestCost) {
      [best, bestCost] = [names, cost];
    }
  }
  return best;
}

/** I 9 elementi di una faccia (riga per riga) dopo quarterTurns quarti di giro in senso orario. */
export function rotateFace(cells, quarterTurns) {
  let result = [...cells];
  for (let t = 0; t < ((quarterTurns % 4) + 4) % 4; t++) {
    result = CLOCKWISE.map((i) => result[i]);
  }
  return result;
}

/**
 * 6 facce acquisite in qualsiasi ordine e rotazione (9 colori Lab ciascuna, riga per riga come
 * le ha viste la camera) -> {state, doubtful, error, faces}.
 *
 * state: 54 lettere URFDLB; con errore, le facce come sono state viste. doubtful: indici dello stato
 * con adesivi incerti. error: null = stato valido e unico. faces: faccia -> indice dell'acquisizione.
 *
 * La faccia si riconosce dal centro. La rotazione di ogni faccia è l'unica, tra le 4^6 possibili,
 * che dà un cubo risolvibile: con un cubo mischiato è sempre una sola.
 */
export function assembleState(captures) {
  const names = nameCenters(captures.map((capture) => capture[4]));
  const faces = Object.fromEntries(names.map((name, k) => [name, k]));
  const [letters, doubtful] = classify([...FACES].flatMap((face) => captures[faces[face]]));
  const seen = [0, 1, 2, 3, 4, 5].map((i) => letters.slice(9 * i, 9 * i + 9));
  const valid = new Map();
  for (let code = 0; code < 4 ** 6; code++) {
    // Stesso ordine di itertools.product(range(4), repeat=6): l'ultima faccia cambia per prima.
    const turns = [5, 4, 3, 2, 1, 0].map((p) => Math.floor(code / 4 ** p) % 4);
    const candidate = seen.map((face, f) => rotateFace(face, turns[f]).join("")).join("");
    if (valid.has(candidate)) continue;
    try {
      checkSolvable(candidate);
    } catch {
      continue;
    }
    valid.set(candidate, turns);
  }
  if (valid.size !== 1) {
    const error = valid.size === 0 ? "nessuna rotazione delle facce dà un cubo possibile" : "più cubi possibili";
    return { state: letters, doubtful, error, faces };
  }
  const [[state, turns]] = valid;
  // Gli adesivi incerti seguono la rotazione della loro faccia.
  const moved = new Map();
  turns.forEach((k, f) => {
    rotateFace([0, 1, 2, 3, 4, 5, 6, 7, 8], k).forEach((source, position) => moved.set(9 * f + source, 9 * f + position));
  });
  return { state, doubtful: doubtful.map((i) => moved.get(i)).sort((a, b) => a - b), error: null, faces };
}
