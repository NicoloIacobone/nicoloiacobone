// Icona della mossa da fare: cubo visto da chi risolve, strato evidenziato e frecce (niente disegni).
// Porting di mac_client/rubik/move_icon.py.
//
// Si vedono le facce F (davanti), U (sopra) e R (destra) in proiezione obliqua. Le frecce non sono
// scritte a mano per ogni mossa: sono la direzione in cui ogni adesivo comincia a muoversi
// (tangente alla rotazione della mossa), ricavata dalla geometria del cubo. Per leggibilità stanno
// solo sulla faccia davanti (per F solo sugli spigoli, a cerchio); per B, che non la tocca, sopra.
// Coordinate 2D in unità di cubetto, y verso l'alto.

import { FACES, parseMove, stickerFrames } from "./cube.js";

const VISIBLE_FACES = ["F", "U", "R"];
const STICKER_HALF = 0.42; // metà lato dell'adesivo disegnato (il cubetto è 1)
const DEPTH = 0.5; // quanto si spostano in alto a destra i punti più lontani (proiezione obliqua)
const ARROW_LENGTH = 0.5; // lunghezza delle frecce, in unità di cubetto

/** Punto 3D del cubo (x=R, y=U, z=F verso chi guarda) -> 2D. */
export function project([x, y, z]) {
  return [x - DEPTH * z, y - DEPTH * z];
}

const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/**
 * Poligoni degli adesivi visibili e frecce della mossa.
 *
 * -> {stickers: [{corners: 4 punti 2D, letter: colore, inLayer: nello strato?}], arrows: [[inizio 2D, fine 2D]]}.
 * Verso della mossa; per le mosse doppie, il verso orario.
 */
export function iconGeometry(state, move) {
  const [face, turns] = parseMove(move);
  const frames = stickerFrames();
  const axis = frames[9 * FACES.indexOf(face) + 4][1];
  const sign = turns === 3 ? -1.0 : 1.0;
  const arrowFace = face === "B" ? "U" : "F";
  const stickers = [];
  const arrows = [];
  for (const visible of VISIBLE_FACES) {
    for (let k = 0; k < 9; k++) {
      const index = 9 * FACES.indexOf(visible) + k;
      const [pos, normal] = frames[index];
      const [uAxis, vAxis] = [0, 1, 2].filter((i) => normal[i] === 0);
      const center = pos.map((p, i) => p + 0.5 * normal[i]);
      const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([du, dv]) => {
        const corner = [...center];
        corner[uAxis] += du * STICKER_HALF;
        corner[vAxis] += dv * STICKER_HALF;
        return project(corner);
      });
      const inLayer = dot(pos, axis) === 1;
      stickers.push({ corners, letter: state[index], inLayer });
      const isCorner = pos.filter((c) => c !== 0).length === 3;
      if (inLayer && visible === arrowFace && !(face === "F" && isCorner)) {
        // Velocità di una rotazione oraria attorno all'asse uscente: -(asse x posizione),
        // tenuta nel piano della faccia: frecce dritte anche sugli adesivi d'angolo.
        let velocity = cross(axis, center).map((c) => -sign * c);
        const offPlane = dot(velocity, normal);
        velocity = velocity.map((v, i) => v - offPlane * normal[i]);
        const start = project(center);
        const tip = project(center.map((c, i) => c + velocity[i]));
        const [dx, dy] = [tip[0] - start[0], tip[1] - start[1]];
        const norm = (dx * dx + dy * dy) ** 0.5;
        if (norm > 1e-9) {
          arrows.push([start, [start[0] + (ARROW_LENGTH * dx) / norm, start[1] + (ARROW_LENGTH * dy) / norm]]);
        }
      }
    }
  }
  return { stickers, arrows };
}
