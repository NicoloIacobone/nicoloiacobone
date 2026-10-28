// Trova una faccia del cubo nel fotogramma, ovunque sia e comunque ruotata (OpenCV.js, niente disegni).
// Porting di mac_client/rubik/cube_detect.py e di read_face in mac_client/rubik/scan.py.
//
// Ogni casella del cubo ha l'interno scuro (carbonio) dentro un bordo chiaro o colorato, bianche
// comprese. Si cercano le macchie scure quasi quadrate a più soglie di luminosità, poi tra queste
// almeno MIN_CELLS di grandezza simile disposte a reticolo 3x3: le caselle mancanti (coperte da un
// dito) si ricostruiscono dal reticolo, che tiene conto anche della prospettiva.
//
// Se così non si trova una faccia, si prova con il cubo classico: adesivi pieni e chiari separati
// dalla plastica nera. Si cercano allora le macchie chiare e piene (senza buchi grandi: esclude i
// bordi colorati del cubo in carbonio, che hanno l'interno scuro), con lo stesso reticolo.
//
// Le caselle escono riga per riga come appaiono nel fotogramma NON specchiato: le colonne vanno
// verso il lato del reticolo più vicino alla destra dell'immagine, le righe verso quello più vicino
// al basso. Una faccia ruotata di 90° esce quindi ruotata di 90°: la rotazione vera si ricava dopo,
// da tutte e 6 le facce.
//
// `cv` è il modulo OpenCV.js già inizializzato; i fotogrammi sono cv.Mat RGB (CV_8UC3).
// Gli arrotondamenti seguono numpy (metà al pari) e LAPACK, così i risultati coincidono col Python.

import { SATURATED_FRACTION, STICKER_SATURATED_FRACTION, colorMask, median } from "./cube-scan.js";

export const DARK_THRESHOLDS = [45, 65, 85, 105, 125]; // soglie sul canale più luminoso di ogni pixel (max di R, G, B)
// Adesivi pieni: anche soglie più alte, dove il bordo nero sottile tra un adesivo e la mano che tiene il
// cubo (sfocato, quindi grigio) conta ancora come scuro e li separa.
export const STICKER_THRESHOLDS = [...DARK_THRESHOLDS, 145, 165];
export const SIDE_RANGE = [0.02, 0.16]; // lato dell'interno di una casella rispetto al lato corto dell'immagine
export const STICKER_SIDE_RANGE = [0.02, 0.24]; // cubo classico: lato dell'adesivo, che occupa quasi tutta la casella
export const MAX_HOLES = 0.15; // adesivo pieno: buchi (scritte del logo, riflessi) al massimo il 15% della sua area
export const MAX_ASPECT = 1.6; // rapporto massimo tra i lati: oltre è una faccia vista troppo di taglio
export const MIN_FILL = 0.7; // area / rettangolo che la contiene: quadrati arrotondati ~0.9, cerchio del centro ~0.79
export const MIN_SOLIDITY = 0.88; // area / inviluppo convesso: scarta forme frastagliate
export const SIZE_RATIO = 1.45; // differenza massima di grandezza tra le caselle di una faccia
export const PITCH_RANGE = [1.1, 2.0]; // distanza tra caselle vicine rispetto al lato dell'interno
export const MAX_SKEW_COS = 0.35; // assi del reticolo quasi perpendicolari (tra 70° e 110°)
export const MAX_PITCH_RATIO = 1.35; // i due passi del reticolo quasi uguali
export const LATTICE_TOLERANCE = 0.25; // scarto massimo di una casella dalla sua posizione nel reticolo (in caselle)
export const NEIGHBORS = 6; // vicini considerati per ogni casella quando si cercano gli assi del reticolo
export const MIN_CELLS = 6; // caselle vere necessarie per accettare una faccia
export const MAX_OUTSIDE = 2; // caselle allineate fuori dal 3x3 oltre le quali la faccia è ambigua
export const OUTSIDE_TOLERANCE = 0.4; // più larga di LATTICE_TOLERANCE: alla piega tra due facce il reticolo si storce
export const SAMPLE_FRACTION = 0.8; // parte di ogni casella da cui leggere il colore (bordo dell'adesivo compreso)

export const KIND_DARK = "interno scuro"; // caselle con l'interno scuro (cubo in carbonio)
export const KIND_STICKER = "adesivo pieno"; // adesivi pieni su plastica nera (cubo classico)

/** Arrotondamento di numpy (np.round): a metà va al pari. */
function roundHalfEven(x) {
  const r = Math.round(x);
  return Math.abs(x % 1) === 0.5 && r % 2 !== 0 ? r - 1 : r;
}

/** Somma come numpy (somma a coppie, a blocchi di 8): stessi arrotondamenti di np.mean. */
function numpySum(values) {
  if (values.length < 8) {
    return values.reduce((sum, v) => sum + v, 0);
  }
  const r = values.slice(0, 8);
  let i = 8;
  for (; i < values.length - (values.length % 8); i += 8) {
    for (let k = 0; k < 8; k++) r[k] += values[i + k];
  }
  let sum = r[0] + r[1] + (r[2] + r[3]) + (r[4] + r[5] + (r[6] + r[7]));
  for (; i < values.length; i++) sum += values[i];
  return sum;
}

/** Risolve [u v] x = p come np.linalg.solve (LU con pivot parziale di LAPACK). */
function solve2(u, v, p) {
  let [a, b, c, d] = [u[0], v[0], u[1], v[1]];
  let [p0, p1] = p;
  if (Math.abs(c) > Math.abs(a)) {
    [a, b, c, d] = [c, d, a, b];
    [p0, p1] = [p1, p0];
  }
  const l = c * (1 / a);
  const y1 = p1 - l * p0;
  const x1 = y1 / (d - l * b);
  return [(p0 - b * x1) / a, x1];
}

/** Proiezione di punti con l'omografia (array di 9 numeri), come cv2.perspectiveTransform. */
function projector(m) {
  return (points) =>
    points.map(([x, y]) => {
      let w = x * m[6] + y * m[7] + m[8];
      if (Math.abs(w) <= 1.1920928955078125e-7) return [0, 0];
      w = 1 / w;
      return [(x * m[0] + y * m[1] + m[2]) * w, (x * m[3] + y * m[4] + m[5]) * w];
    });
}

/** Area totale dei buchi di un contorno esterno (i suoi figli in RETR_CCOMP, uno dopo l'altro). */
function holesArea(cv, contours, hierarchy, child) {
  let total = 0;
  while (child !== -1) {
    const hole = contours.get(child);
    total += cv.contourArea(hole);
    hole.delete();
    child = hierarchy.data32S[4 * child];
  }
  return total;
}

/**
 * Macchie quasi quadrate della grandezza di una casella, a tutte le soglie (senza doppioni).
 *
 * sticker false: macchie scure (interni delle caselle). sticker true: macchie chiare e piene (adesivi).
 */
export function findBlobs(cv, frame, sticker = false) {
  const { rows: height, cols: width } = frame;
  const short = Math.min(width, height);
  const sideRange = sticker ? STICKER_SIDE_RANGE : SIDE_RANGE;
  const [minArea, maxArea] = [(sideRange[0] * short) ** 2, (sideRange[1] * short) ** 2];
  const maxChannel = new cv.Mat(height, width, cv.CV_8UC1);
  const rgb = frame.data;
  for (let i = 0, n = width * height; i < n; i++) {
    maxChannel.data[i] = Math.max(rgb[3 * i], rgb[3 * i + 1], rgb[3 * i + 2]);
  }
  const brightness = new cv.Mat();
  cv.GaussianBlur(maxChannel, brightness, new cv.Size(3, 3), 0);
  const kernel = cv.Mat.ones(3, 3, cv.CV_8U);
  const dark = new cv.Mat();
  const mask = new cv.Mat();
  const blobs = [];
  for (const threshold of sticker ? STICKER_THRESHOLDS : DARK_THRESHOLDS) {
    // brightness < threshold (valori interi): 1 dove è più scuro della soglia.
    cv.threshold(brightness, dark, threshold - 1, 1, cv.THRESH_BINARY_INV);
    cv.morphologyEx(dark, mask, cv.MORPH_CLOSE, kernel);
    if (sticker) {
      // Il chiaro: gli adesivi, separati dalla plastica nera (1 - maschera, valori 0/1).
      cv.threshold(mask, mask, 0, 1, cv.THRESH_BINARY_INV);
    }
    // Solo i contorni esterni delle macchie (anche se stanno dentro il buco di un'altra,
    // come l'interno di una casella davanti ai capelli), non i bordi dei buchi.
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(mask, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    for (let n = 0; n < contours.size(); n++) {
      if (hierarchy.data32S[4 * n + 3] !== -1) continue;
      const contour = contours.get(n);
      const holes = sticker ? (area) => holesArea(cv, contours, hierarchy, hierarchy.data32S[4 * n + 2]) > MAX_HOLES * area : null;
      const blob = shapeOf(cv, contour, minArea, maxArea, holes);
      contour.delete();
      if (blob) blobs.push(blob);
    }
    contours.delete();
    hierarchy.delete();
  }
  [maxChannel, brightness, kernel, dark, mask].forEach((m) => m.delete());
  // La stessa casella a soglie diverse: si tiene la forma più regolare.
  blobs.sort((p, q) => q[0] - p[0]);
  const kept = [];
  for (const [, blob] of blobs) {
    if (kept.every((k) => Math.hypot(blob.center[0] - k.center[0], blob.center[1] - k.center[1]) > 0.5 * k.side)) {
      kept.push(blob);
    }
  }
  return kept;
}

/**
 * [punteggio, {center, side}] se il contorno ha la forma di una casella, altrimenti null.
 * `tooHoley(area)`, per gli adesivi pieni, dice se i buchi del contorno sono troppi.
 */
function shapeOf(cv, contour, minArea, maxArea, tooHoley = null) {
  const area = cv.contourArea(contour);
  if (!(minArea <= area && area <= maxArea)) return null;
  if (tooHoley?.(area)) return null;
  const { center, size } = cv.minAreaRect(contour);
  const [rw, rh] = [size.width, size.height];
  if (Math.max(rw, rh) > MAX_ASPECT * Math.min(rw, rh) || area < MIN_FILL * rw * rh) return null;
  const hull = new cv.Mat();
  cv.convexHull(contour, hull, false, true);
  const solidity = area / cv.contourArea(hull);
  hull.delete();
  if (solidity < MIN_SOLIDITY) return null;
  return [(solidity * area) / (rw * rh), { center: [center.x, center.y], side: area ** 0.5 }];
}

/** Assi [u, v] del reticolo proposti da una casella e due sue vicine quasi perpendicolari. */
function* latticeHypotheses(centers, sides) {
  for (let i = 0; i < centers.length; i++) {
    const offsets = centers.map(([x, y]) => [x - centers[i][0], y - centers[i][1]]);
    const distances = offsets.map(([x, y]) => Math.hypot(x, y));
    const near = sides.map(
      (s, j) =>
        distances[j] >= PITCH_RANGE[0] * sides[i] &&
        distances[j] <= PITCH_RANGE[1] * sides[i] &&
        Math.max(s, sides[i]) <= SIZE_RATIO * Math.min(s, sides[i]),
    );
    const candidates = [...distances.keys()]
      .sort((j, k) => distances[j] - distances[k])
      .filter((j) => near[j])
      .slice(0, NEIGHBORS);
    for (let a = 0; a < candidates.length; a++) {
      for (let b = a + 1; b < candidates.length; b++) {
        const [j, k] = [candidates[a], candidates[b]];
        const [u, v] = [offsets[j], offsets[k]];
        const [lu, lv] = [distances[j], distances[k]];
        if (Math.abs(u[0] * v[0] + u[1] * v[1]) > MAX_SKEW_COS * lu * lv || Math.max(lu, lv) > MAX_PITCH_RATIO * Math.min(lu, lv)) {
          continue;
        }
        yield [i, u, v];
      }
    }
  }
}

/** Il miglior reticolo 3x3: [posizioni 0-2 delle caselle trovate, centri nell'immagine] o null. */
export function fitLattice(blobs) {
  if (blobs.length < MIN_CELLS) return null;
  const centers = blobs.map((b) => b.center);
  const sides = blobs.map((b) => b.side);
  let bestKey = null;
  let best = null;
  for (const [i, u, v] of latticeHypotheses(centers, sides)) {
    const coords = centers.map(([x, y]) => solve2(u, v, [x - centers[i][0], y - centers[i][1]]));
    const rounded = coords.map(([a, b]) => [roundHalfEven(a), roundHalfEven(b)]);
    const error = coords.map(([a, b], n) => Math.hypot(a - rounded[n][0], b - rounded[n][1]));
    const similar = sides.map((s) => Math.max(s, sides[i]) <= SIZE_RATIO * Math.min(s, sides[i]));
    const good = error.map((e, n) => e < LATTICE_TOLERANCE && similar[n]);
    for (const a0 of [-2, -1, 0]) {
      for (const b0 of [-2, -1, 0]) {
        const inside = rounded.map(([a, b], n) => good[n] && a >= a0 && a <= a0 + 2 && b >= b0 && b <= b0 + 2);
        // Una casella per posizione: la più vicina al reticolo.
        const chosen = new Map();
        inside.forEach((isInside, n) => {
          if (!isInside) return;
          const key = `${rounded[n][0] - a0},${rounded[n][1] - b0}`;
          if (!chosen.has(key) || error[n] < error[chosen.get(key)]) chosen.set(key, n);
        });
        if (chosen.size < MIN_CELLS) continue;
        // Altre caselle allineate appena fuori dal 3x3: è un pezzo di due facce viste insieme.
        const around = rounded.filter(
          ([a, b], n) =>
            similar[n] && error[n] < OUTSIDE_TOLERANCE && !inside[n] && Math.abs(a - a0 - 1) <= 2 && Math.abs(b - b0 - 1) <= 2,
        ).length;
        if (around >= MAX_OUTSIDE) continue;
        const score = [chosen.size, -(numpySum([...chosen.values()].map((n) => error[n])) / chosen.size)];
        if (bestKey === null || score[0] > bestKey[0] || (score[0] === bestKey[0] && score[1] > bestKey[1])) {
          bestKey = score;
          best = [[...chosen.keys()].map((key) => key.split(",").map(Number)), [...chosen.values()].map((n) => centers[n])];
        }
      }
    }
  }
  return best;
}

/** [[asse, verso] delle colonne (verso destra), [asse, verso] delle righe (verso il basso)]. */
function imageOrder(project) {
  const [middle, right, down] = project([[1, 1], [2, 1], [1, 2]]);
  const axes = [[right[0] - middle[0], right[1] - middle[1]], [down[0] - middle[0], down[1] - middle[1]]];
  const options = [[0, 1], [0, -1], [1, 1], [1, -1]];
  const argmax = (list, value) => list.reduce((best, o) => (value(o) > value(best) ? o : best));
  const column = argmax(options, ([axis, sign]) => sign * axes[axis][0]);
  const row = argmax(options.filter(([axis]) => axis !== column[0]), ([axis, sign]) => sign * axes[axis][1]);
  return [column, row];
}

/**
 * La faccia del cubo più evidente nel fotogramma (RGB, non specchiato), o null.
 *
 * {centers: 9 [x, y] riga per riga, cells: 9 poligoni di 4 punti da cui leggere il colore,
 *  outline: 4 punti del contorno, seen: per ogni casella se è vista davvero (false = ricostruita,
 *  es. coperta da un dito), complete: tutte viste, kind: KIND_DARK o KIND_STICKER}.
 */
export function detectFace(cv, frame) {
  // Prima le caselle a interno scuro, poi, se non c'è una faccia, gli adesivi pieni del cubo classico.
  let fitted = null;
  let kind = null;
  for (kind of [KIND_DARK, KIND_STICKER]) {
    fitted = fitLattice(findBlobs(cv, frame, kind === KIND_STICKER));
    if (fitted !== null) break;
  }
  if (fitted === null) return null;
  const [lattice, imagePoints] = fitted;
  const source = cv.matFromArray(lattice.length, 1, cv.CV_64FC2, lattice.flat());
  const target = cv.matFromArray(imagePoints.length, 1, cv.CV_64FC2, imagePoints.flat());
  const homography = cv.findHomography(source, target, 0);
  const m = homography.empty() ? null : Array.from(homography.data64F);
  [source, target, homography].forEach((mat) => mat.delete());
  if (m === null) return null;
  const project = projector(m);

  const [[colAxis, colSign], [rowAxis, rowSign]] = imageOrder(project);
  const half = SAMPLE_FRACTION / 2;
  const found = new Set(lattice.map(([a, b]) => `${a},${b}`));
  const centers = [];
  const cells = [];
  const seen = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const position = [0, 0];
      position[colAxis] = colSign > 0 ? col : 2 - col;
      position[rowAxis] = rowSign > 0 ? row : 2 - row;
      const [a, b] = position;
      seen.push(found.has(`${a},${b}`));
      centers.push(project([[a, b]])[0]);
      cells.push(project([[a - half, b - half], [a + half, b - half], [a + half, b + half], [a - half, b + half]]));
    }
  }
  const outline = project([[-0.5, -0.5], [2.5, -0.5], [2.5, 2.5], [-0.5, 2.5]]);
  return { centers, cells, outline, seen, complete: seen.every(Boolean), kind };
}

/**
 * Colore di ogni casella della faccia trovata, dai soli pixel colorati (vedi colorMask).
 *
 * `rgb` e `lab` sono lo stesso fotogramma (cv.Mat CV_8UC3, Lab come cv.COLOR_RGB2Lab). -> {labs, rgbs}.
 */
export function readFace(cv, rgb, lab, face) {
  const { rows: height, cols: width } = rgb;
  const clip = (x, low, high) => Math.min(Math.max(x, low), high);
  const saturatedFraction = face.kind === KIND_STICKER ? STICKER_SATURATED_FRACTION : SATURATED_FRACTION;
  const labs = [];
  const rgbs = [];
  for (const cell of face.cells) {
    // Solo il rettangolo che contiene la casella, non tutto il fotogramma.
    const points = cell.map(([x, y]) => [roundHalfEven(x), roundHalfEven(y)]);
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    const [x0, y0] = [clip(Math.min(...xs), 0, width - 1), clip(Math.min(...ys), 0, height - 1)];
    const [x1, y1] = [clip(Math.max(...xs) + 1, 1, width), clip(Math.max(...ys) + 1, 1, height)];
    const [w, h] = [Math.max(x1 - x0, 0), Math.max(y1 - y0, 0)];
    const mask = cv.Mat.zeros(h, w, cv.CV_8UC1);
    const polygon = cv.matFromArray(4, 1, cv.CV_32SC2, points.flatMap(([x, y]) => [x - x0, y - y0]));
    cv.fillConvexPoly(mask, polygon, new cv.Scalar(1));
    const labPixels = [];
    const rgbPixels = [];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!mask.data[y * w + x]) continue;
        const k = 3 * ((y0 + y) * width + x0 + x);
        labPixels.push([lab.data[k], lab.data[k + 1], lab.data[k + 2]]);
        rgbPixels.push([rgb.data[k], rgb.data[k + 1], rgb.data[k + 2]]);
      }
    }
    mask.delete();
    polygon.delete();
    if (!labPixels.length) {
      // Casella ricostruita fuori dall'immagine: non si legge.
      labs.push([0, 128, 128]);
      rgbs.push([0, 0, 0]);
      continue;
    }
    const keep = colorMask(labPixels, null, saturatedFraction);
    labs.push(median(labPixels.filter((_, n) => keep[n])));
    rgbs.push(median(rgbPixels.filter((_, n) => keep[n])).map(Math.trunc));
  }
  return { labs, rgbs };
}
