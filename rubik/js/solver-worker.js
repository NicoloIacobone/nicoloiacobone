// Web Worker del solver (script classico, non modulo): cubejs, two-phase di Kociemba, fuori dal thread della pagina.
//
// Messaggi: {id, state} -> {id, moves} oppure {id, error}; {ready: true} quando le tabelle sono pronte.
// Le tabelle si calcolano all'avvio (qualche secondo): le richieste arrivate nel frattempo restano in coda.

importScripts("../vendor/cubejs/cube.js", "../vendor/cubejs/solve.js");
Cube.initSolver();
self.postMessage({ ready: true });

self.onmessage = ({ data: { id, state } }) => {
  try {
    self.postMessage({ id, moves: Cube.fromString(state).solve() });
  } catch (exc) {
    self.postMessage({ id, error: String(exc && exc.message ? exc.message : exc) });
  }
};
