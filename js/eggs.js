/* =========================================================
   Due easter egg discreti. Si attivano solo su richiesta, da mouse, tastiera
   o tocco, senza audio e senza risorse esterne.
   Senza JS o con movimento ridotto il contenuto resta comunque leggibile.
   ========================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  function isReduced() { return !!(reduced && reduced.matches); }
  function isEnglish() { return document.documentElement.getAttribute('lang') === 'en'; }

  /* =======================================================
     MINI CUBO
     Usa il modello vero del risolutore (rubik/js/cube.js): gli adesivi cambiano
     secondo mosse reali, non è un'animazione finta. Se il modulo non si carica
     (es. file://) resta il link al risolutore, sempre visibile.
     ======================================================= */
  var cubeBtn = document.getElementById('eggCube');
  var cubeOut = document.getElementById('eggCubeMoves');
  var SOLUTION = ['F', 'R', 'U', "R'", "U'", "F'"];
  var SCRAMBLE = "F U R U' R' F'"; /* l'inverso: dal cubo risolto allo stato disegnato */
  var cubeRunning = false;

  function paint(stickers, state) {
    stickers.forEach(function (el, i) {
      el.setAttribute('class', 'st st--' + state.charAt(i));
    });
  }

  function movesText(step) {
    return SOLUTION.map(function (m, i) {
      return i === step ? '<b>' + m + '</b>' : m;
    }).join(' ');
  }

  if (cubeBtn && cubeOut) {
    cubeBtn.addEventListener('click', function () {
      if (cubeRunning) return;
      cubeRunning = true;
      var stickers = Array.prototype.slice.call(cubeBtn.querySelectorAll('.st'));

      import('../rubik/js/cube.js').then(function (cube) {
        var state = cube.applyMoves(cube.SOLVED, SCRAMBLE);

        function finish() {
          paint(stickers, cube.SOLVED);
          cubeOut.textContent = SOLUTION.join(' ') + (isEnglish() ? ' · solved' : ' · risolto');
          cubeRunning = false;
        }
        if (isReduced()) { finish(); return; }

        paint(stickers, state);
        var i = 0;
        (function next() {
          if (i >= SOLUTION.length) { finish(); return; }
          state = cube.applyMove(state, SOLUTION[i]);
          paint(stickers, state);
          cubeOut.innerHTML = movesText(i);
          i++;
          window.setTimeout(next, 430);
        })();
      }).catch(function () {
        /* Il link accanto porta comunque al risolutore */
        cubeOut.textContent = isEnglish() ? 'Open the full solver →' : 'Apri il risolutore →';
        cubeRunning = false;
      });
    });
  }

  /* =======================================================
     PESCE RICAMATO
     Il disegno è sempre completo. Al clic viene ricomposto punto per punto,
     misurando i tracciati esistenti: niente markup in più nella pagina.
     ======================================================= */
  var fishBtn = document.getElementById('eggFish');
  var fish = document.getElementById('eggFishArt');
  var fishNote = document.getElementById('eggFishNote');
  var fishTimer = null;

  function fishQuote() {
    return isEnglish() ? '“It looks like embroidery.”' : '«Sembra un ricamo.»';
  }

  function clearStitches() {
    var old = fish.querySelector('.fish__stitches');
    if (old) old.remove();
    fish.classList.remove('is-stitching');
  }

  if (fishBtn && fish && fishNote) {
    fishBtn.addEventListener('click', function () {
      window.clearTimeout(fishTimer);
      clearStitches();
      fishNote.textContent = '';

      if (isReduced()) { fishNote.textContent = fishQuote(); return; }

      var NS = 'http://www.w3.org/2000/svg';
      var group = document.createElementNS(NS, 'g');
      group.setAttribute('class', 'fish__stitches');
      var n = 0;

      Array.prototype.forEach.call(fish.querySelectorAll('path, circle'), function (el) {
        var len = el.getTotalLength();
        for (var d = 0; d < len; d += 5.5) {
          var a = el.getPointAtLength(d);
          var b = el.getPointAtLength(Math.min(d + 3.4, len));
          var line = document.createElementNS(NS, 'line');
          line.setAttribute('x1', a.x.toFixed(1));
          line.setAttribute('y1', a.y.toFixed(1));
          line.setAttribute('x2', b.x.toFixed(1));
          line.setAttribute('y2', b.y.toFixed(1));
          line.setAttribute('class', 'fish__stitch');
          line.style.setProperty('--i', n++);
          group.appendChild(line);
        }
      });

      fish.appendChild(group);
      fish.classList.add('is-stitching');
      fishTimer = window.setTimeout(function () {
        clearStitches();
        fishNote.textContent = fishQuote();
      }, n * 13 + 200);
    });
  }
})();
