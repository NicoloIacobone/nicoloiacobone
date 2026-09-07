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
- **Single page** con nav sticky, ancore, scrollspy e menu compatto su mobile.
- **Responsive**: card che si impilano, immagini fluide, layout verificato da 390px in su.
- Rispetta `prefers-reduced-motion` e resta leggibile anche con JavaScript disattivato.

## Struttura

```
index.html              markup e contenuti (testi italiani inline come fallback)
css/style.css           design token, layout, responsive, tema chiaro/scuro
js/main.js              dizionario i18n, tema, nav mobile, scrollspy, reveal
CV.pdf                  curriculum scaricabile
foto_profilo.jpeg       foto della sezione hero
campione_grandioso.png  stemma Clash Royale
CNAME                   dominio personalizzato
```

## Sviluppo

Nessuna build richiesta: aprire `index.html` nel browser, oppure servire la cartella con un
server statico (es. `python3 -m http.server` o `npx serve`).

### Modificare i testi

Ogni stringa vive in due posti: il markup italiano in `index.html` (visibile senza JS) e le due
voci corrispondenti nel dizionario `I18N` di `js/main.js`. Aggiungendo o rinominando una chiave
vanno aggiornate entrambe le lingue.
