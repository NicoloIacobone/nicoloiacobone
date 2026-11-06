/* =========================================================
   Dossier dei progetti: router sull'hash + <dialog> nativo.

   Il dialog è un miglioramento: senza JS gli stessi dossier sono sezioni
   della pagina e le card sono normali ancore (vedi css/home.css).

   Tutto passa da sync(), idempotente: guarda l'hash e apre o chiude di
   conseguenza. Così Indietro, Avanti, Esc, i link incrociati e l'apertura
   diretta da un URL con #p-… finiscono nello stesso punto.
   ========================================================= */
(function () {
  'use strict';

  var dialogs = {};
  Array.prototype.forEach.call(document.querySelectorAll('dialog.dossier'), function (d) {
    dialogs[d.id] = d;
  });
  if (!Object.keys(dialogs).length || typeof HTMLDialogElement === 'undefined' ||
      !HTMLDialogElement.prototype.showModal) {
    /* Browser senza <dialog>: restano sezioni della pagina. */
    document.documentElement.classList.remove('js');
    return;
  }

  var current = null;      /* dialog aperto */
  var opener = null;       /* elemento a cui restituire il focus */
  var closing = false;     /* true quando è il router a chiudere: non è un gesto dell'utente */

  function idFromHash() {
    var id = location.hash.slice(1);
    return Object.prototype.hasOwnProperty.call(dialogs, id) ? id : null;
  }

  function cardFor(id) {
    return document.querySelector('.pcard__link[href="#' + id + '"]');
  }

  function shutCurrent() {
    if (!current) return;
    closing = true;
    if (current.open) current.close();
    closing = false;
  }

  function show(id) {
    var d = dialogs[id];
    if (current === d && d.open) return;

    if (current) {
      /* Da un dossier a un altro: stesso scroll della pagina, stesso opener. */
      shutCurrent();
    } else {
      /* Apertura diretta da URL: la card va portata in vista prima, così alla
         chiusura il focus torna su qualcosa di visibile (anche se non ancora rivelato). */
      if (!opener) {
        var card = cardFor(id);
        if (card) {
          card.scrollIntoView({ block: 'center', behavior: 'instant' });
          opener = card;
        }
      }
      /* Blocco lo scroll senza far saltare il layout di fianco alla barra */
      var bar = window.innerWidth - document.documentElement.clientWidth;
      if (bar > 0) document.body.style.paddingRight = bar + 'px';
      document.body.classList.add('has-dossier');
    }

    current = d;
    d.showModal();
    d.scrollTop = 0;
    var title = d.querySelector('.dossier__title');
    if (title) title.focus({ preventScroll: true });
  }

  function hide() {
    if (!current) return;
    shutCurrent();
    current = null;
    document.body.classList.remove('has-dossier');
    document.body.style.paddingRight = '';
    var back = opener;
    opener = null;
    if (back && document.contains(back)) back.focus({ preventScroll: true });
  }

  function sync() {
    var id = idFromHash();
    if (id) show(id); else hide();
  }

  /* L'utente vuole chiudere: se siamo arrivati con un push torniamo indietro nella
     cronologia, così non restano voci morte. Da un deep link non c'è nulla dietro. */
  function requestClose() {
    if (history.state && history.state.dossier) {
      history.back();
    } else {
      history.replaceState(null, '', location.pathname + location.search);
      sync();
    }
  }

  /* Card, link incrociati, collegamenti nella timeline */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest ? e.target.closest('a') : null;
    if (!a) return;

    if (a.hasAttribute('data-dossier-close')) {
      e.preventDefault();
      requestClose();
      return;
    }

    var href = a.getAttribute('href') || '';
    if (href.charAt(0) !== '#') return;
    var id = href.slice(1);
    if (!Object.prototype.hasOwnProperty.call(dialogs, id)) return;

    e.preventDefault();
    if (current) {
      /* Dossier → dossier: non aggiungo voci, Indietro riporta alla pagina. */
      history.replaceState(history.state, '', '#' + id);
    } else {
      opener = a;
      history.pushState({ dossier: 1 }, '', '#' + id);
    }
    sync();
  });

  window.addEventListener('popstate', sync);
  window.addEventListener('hashchange', sync);

  Object.keys(dialogs).forEach(function (id) {
    var d = dialogs[id];

    /* Esc: passa dal router, così la cronologia resta coerente */
    d.addEventListener('cancel', function (e) {
      e.preventDefault();
      requestClose();
    });

    /* Chiusura decisa dal browser (es. secondo Esc senza interazione, che salta "cancel") */
    d.addEventListener('close', function () {
      if (closing || current !== d) return;
      requestClose();
    });

    /* Backdrop: chiude solo se pressione e rilascio sono entrambi fuori dal riquadro,
       altrimenti trascinare una selezione di testo fuori chiuderebbe il dossier. */
    var downOutside = false;
    function outside(e) {
      var r = d.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    }
    d.addEventListener('pointerdown', function (e) { downOutside = e.target === d && outside(e); });
    d.addEventListener('click', function (e) {
      if (downOutside && e.target === d && outside(e)) requestClose();
      downOutside = false;
    });
  });

  sync();
})();
