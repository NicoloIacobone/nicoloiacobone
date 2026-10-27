# nicoloiacobone

Sito web personale di Nicolò Iacobone — Computer Vision & 3D Deep Learning Researcher.

Realizzato in HTML/CSS/JS puro (nessun build step, nessuna dipendenza) e hostato su
[GitHub Pages](https://pages.github.com/) su [www.nicoloiacobone.it](https://www.nicoloiacobone.it).

## Funzionalità

- **Bilingue italiano / inglese.** La lingua iniziale segue `navigator.language`; lo switch
  manuale la sovrascrive e la salva in `localStorage`. Tutti i testi passano da un dizionario
  in `js/main.js`, agganciati al markup con `data-i18n` (e `data-i18n-attr` per gli attributi).
- **Tema chiaro di default, dark mode opzionale.** Al primo caricamento si segue
  `prefers-color-scheme`; lo switch manuale sovrascrive e persiste in `localStorage`.
  Il tema è applicato prima del primo paint per evitare il flash.
- **Single page** con nav sticky, ancore, scrollspy e menu compatto su mobile, più la pagina
  `rubik/` (risolutore del cubo di Rubik con la fotocamera).
- **Responsive**: card che si impilano, immagini fluide, layout verificato da 390px in su.
- Rispetta `prefers-reduced-motion` e resta leggibile anche con JavaScript disattivato.
- **Privacy by design.** Nessun cookie, nessuna analytics, nessuna risorsa da terze parti: i font
  (Fraunces, Inter, JetBrains Mono — SIL OFL 1.1) sono self-hosted in `fonts/`, così l'IP dei
  visitatori non arriva a Google. L'unico storage è `localStorage` per tema e lingua (strumento
  tecnico, niente banner). L'informativa è in `privacy.html`, linkata dal footer: se aggiungi
  analytics, embed (YouTube, Maps…) o risorse esterne, va aggiornata e potrebbe servire un banner.

## Struttura

```
index.html                     markup e contenuti (testi italiani inline come fallback)
privacy.html                   informativa privacy e cookie (IT/EN nel markup)
fonts/                         font self-hosted (woff2, subset latin + latin-ext)
css/style.css                  design token, layout, responsive, tema chiaro/scuro
js/main.js                     dizionario i18n, tema, nav mobile, scrollspy, mappa
js/travels.js                  ← i paesi visitati e quelli in cui hai vissuto
js/world-map-data.js           confini nazionali (generato, non si tocca)
imgs_and_docs/CV.pdf           curriculum scaricabile
imgs_and_docs/foto_profilo.jpeg
imgs_and_docs/campione_grandioso.png
imgs_and_docs/pesce_foto.jpeg
imgs_and_docs/tatuaggio.jpeg
imgs_and_docs/shrek2.jpg       locandina del film preferito
rubik/                         ← copiata da doppelbot (web/rubik, `sh web/publish.sh`): non si modifica qui
rubik/vendor/                  OpenCV.js (Apache-2.0) e cubejs (MIT), con le loro licenze
CNAME                          dominio personalizzato
```

Tutti gli asset (immagini e PDF) stanno in `imgs_and_docs/`.

La pagina `rubik/` usa la fotocamera solo nel browser: le immagini non lasciano il dispositivo
(vedi `privacy.html`, sezione 3). Usa `css/style.css` e i font del sito; i suoi testi IT/EN
stanno in `rubik/js/i18n.js`.

## Sviluppo

Nessuna build richiesta: aprire `index.html` nel browser, oppure servire la cartella con un
server statico (es. `python3 -m http.server` o `npx serve`).

### Aggiornare la mappa dei viaggi

Apri `js/travels.js` e aggiungi il codice ISO 3166-1 alpha-2 del paese (due lettere) nella
lista `lived` o `visited`. Salva, ricarica: nient'altro. Il file contiene già l'elenco dei
codici più comuni come promemoria.

I confini vengono da `js/world-map-data.js`, generato da
[Natural Earth](https://www.naturalearthdata.com/) 1:110m (pubblico dominio) e disegnato in
proiezione di Robinson direttamente in SVG — nessuna libreria, nessuna chiamata di rete.
Quel file non va modificato a mano.

### Modificare i testi

Ogni stringa vive in due posti: il markup italiano in `index.html` (visibile senza JS) e le due
voci corrispondenti nel dizionario `I18N` di `js/main.js`. Aggiungendo o rinominando una chiave
vanno aggiornate entrambe le lingue.
