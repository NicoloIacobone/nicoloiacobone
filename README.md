# nicoloiacobone

Sito web personale di Nicolò Iacobone — Computer Vision & 3D Deep Learning Researcher.

Realizzato in HTML/CSS/JS puro (nessun build step, nessuna dipendenza) e hostato su
[GitHub Pages](https://pages.github.com/) su [www.nicoloiacobone.it](https://www.nicoloiacobone.it).

## Funzionalità

- **Portfolio a card.** Ogni progetto è una card che si apre su un dossier con contesto, metodo,
  contributo, risultati, limiti e collegamenti. Ogni dossier ha un indirizzo diretto, per esempio
  `#p-vggt`.
- **Bilingue italiano / inglese.** La lingua iniziale segue `navigator.language`; lo switch
  manuale la sovrascrive e la salva in `localStorage`.
- **Tema chiaro di default, dark mode opzionale.** Al primo caricamento si segue
  `prefers-color-scheme`; lo switch manuale sovrascrive e persiste in `localStorage`.
  Il tema è applicato prima del primo paint per evitare il flash.
- **Single page** con nav sticky, ancore, scrollspy e menu compatto su mobile, più la pagina
  `rubik/` (risolutore del cubo di Rubik con la fotocamera).
- **Responsive**: layout verificato da 320px in su.
- Rispetta `prefers-reduced-motion` e resta usabile con JavaScript disattivato: i dossier diventano
  sezioni della pagina e le card restano ancore.
- **Privacy by design.** Nessun cookie, nessuna analytics, nessuna risorsa da terze parti: i font
  (Fraunces, Inter, JetBrains Mono — SIL OFL 1.1) sono self-hosted in `fonts/`, così l'IP dei
  visitatori non arriva a Google. L'unico storage è `localStorage` per tema e lingua (strumento
  tecnico, niente banner). L'informativa è in `privacy.html`, linkata dal footer: se aggiungi
  analytics, embed (YouTube, Maps…) o risorse esterne, va aggiornata e potrebbe servire un banner.
- **Due easter egg**, solo su richiesta: il mini cubo nel footer e il pesce ricamato nella card
  della pesca.

## Struttura

```
index.html                     markup e contenuti (testi italiani inline come fallback)
privacy.html                   informativa privacy e cookie (IT/EN nel markup)
fonts/                         font self-hosted (woff2, subset latin + latin-ext)
css/style.css                  token, reset, nav, bottoni, footer: condiviso con privacy e rubik/
css/home.css                   tutto il resto, caricato solo da index.html
js/main.js                     dizionario i18n, tema, nav mobile, scrollspy, mappa
js/dossiers.js                 apertura dei dossier: router sull'hash e <dialog> nativo
js/eggs.js                     easter egg
js/travels.js                  ← i paesi visitati e quelli in cui hai vissuto
js/world-map-data.js           confini nazionali (generato, non si tocca)
imgs_and_docs/CV.pdf           curriculum scaricabile
imgs_and_docs/foto_profilo.jpeg
imgs_and_docs/campione_grandioso.png
imgs_and_docs/pesce_foto.jpeg
imgs_and_docs/tatuaggio.jpeg
imgs_and_docs/shrek_2.jpg      locandina del film preferito
imgs_and_docs/projects/        figure dei dossier (WebP)
rubik/                         ← copiata da doppelbot (web/rubik, `sh web/publish.sh`): non si modifica qui
rubik/vendor/                  OpenCV.js (Apache-2.0) e cubejs (MIT), con le loro licenze
CNAME                          dominio personalizzato
```

La pagina `rubik/` usa la fotocamera solo nel browser: le immagini non lasciano il dispositivo
(vedi `privacy.html`, sezione 3). I suoi testi IT/EN stanno in `rubik/js/i18n.js`.

### Vincoli con `rubik/`

`rubik/` viene sovrascritta da `publish.sh` di doppelbot, ma dipende da questo sito. Prima di
cambiare `css/style.css`:

- I **nomi** dei token e delle classi di nav, bottoni, sezioni e footer non si cambiano; i valori sì.
- Niente regole globali su `section`, `canvas`, `video`, `svg`, `li`, niente `transform`, `filter` o
  `contain` su `html`, `body`, `main`, `.wrap`: romperebbero il `position: fixed` della pagina.
- Le regole che dipendono da `html.js` stanno in `css/home.css`: `rubik/` non carica `main.js`.
- `js/eggs.js` importa `rubik/js/cube.js` (`SOLVED`, `applyMove`, `applyMoves`). Se quell'API cambia,
  il mini cubo smette di animarsi; il link al risolutore resta.

## Sviluppo

Nessuna build richiesta: servire la cartella con un server statico, per esempio
`python3 -m http.server`. Da `file://` funziona quasi tutto, ma il browser blocca l'import del modello
del cubo e la mini animazione lascia il posto al link.

### Aggiungere o modificare un progetto

1. In `index.html`, aggiungi la card nell'area giusta: un `<article class="pcard">` con il link
   `<a class="pcard__link" href="#p-nome">`.
2. Sempre in `index.html`, aggiungi il dossier `<dialog class="dossier" id="p-nome" …>` dentro
   `#dossiers`, copiando la struttura di uno esistente.
3. In `js/main.js`, aggiungi `p.nome.title` e `p.nome.cat` in entrambe le lingue.
4. Le figure vanno in `imgs_and_docs/projects/`, con `width`, `height`, `loading="lazy"` e il testo
   alternativo nel dizionario.

**Regola sui contenuti:** numeri e figure solo se verificati nel CV o nelle repository. Un'immagine
di un progetto upstream dichiara autore e licenza; uno schema derivato dalla documentazione porta
l'etichetta «schema illustrativo». Non si confrontano misure di protocolli diversi.

### Aggiornare la mappa dei viaggi

Apri `js/travels.js` e aggiungi il codice ISO 3166-1 alpha-2 del paese (due lettere) nella
lista `lived` o `visited`. Salva, ricarica: nient'altro. Il file contiene già l'elenco dei
codici più comuni come promemoria.

I confini vengono da `js/world-map-data.js`, generato da
[Natural Earth](https://www.naturalearthdata.com/) 1:110m (pubblico dominio) e disegnato in
proiezione di Robinson direttamente in SVG — nessuna libreria, nessuna chiamata di rete.
Quel file non va modificato a mano.

### Modificare i testi

- **Stringhe brevi** (titoli, etichette, attributi): il markup italiano in `index.html` e le due voci
  del dizionario `I18N` in `js/main.js`, agganciate con `data-i18n` (e `data-i18n-attr` per gli
  attributi).
- **Testi lunghi** (riassunti e dossier): due blocchi affiancati nel markup, `.only-it` e `.only-en`,
  con il loro attributo `lang`.
