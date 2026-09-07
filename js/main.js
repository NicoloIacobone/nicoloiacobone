/* =========================================================
   Nicolò Iacobone — sito personale
   Vanilla JS: i18n IT/EN, tema chiaro/scuro, nav mobile,
   scrollspy e reveal on scroll. Nessuna dipendenza.
   ========================================================= */
(function () {
  'use strict';

  var STORE_THEME = 'theme';
  var STORE_LANG  = 'lang';
  var root = document.documentElement;

  /* localStorage può lanciare in modalità privata: incapsuliamolo */
  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { /* storage non disponibile: si continua senza persistenza */ }
    return null;
  }

  /* =======================================================
     DIZIONARIO
     ======================================================= */
  var I18N = {
    it: {
      'meta.title': 'Nicolò Iacobone — Computer Vision & 3D Deep Learning Researcher',
      'meta.description': "Sito personale di Nicolò Iacobone, ricercatore in Computer Vision e 3D Deep Learning presso il gruppo Photogrammetry & Remote Sensing dell'ETH di Zurigo.",

      'a11y.skip': 'Vai al contenuto',
      'a11y.langGroup': 'Lingua',
      'a11y.theme': 'Cambia tema',
      'a11y.menu': 'Apri il menu',

      'nav.about': 'Chi sono',
      'nav.research': 'Ricerca',
      'nav.beyond': 'Oltre la ricerca',
      'nav.contact': 'Contatti',

      'hero.badge': 'ETH Zürich · Photogrammetry & Remote Sensing',
      'hero.role': 'Computer Vision & 3D Deep Learning Researcher',
      'hero.tagline': 'Insegno alle macchine a capire lo spazio: ricostruzione 3D feed-forward e segmentazione delle scene, senza etichette 3D.',
      'hero.fact1': 'Bari, Italia · disponibile a trasferirsi',
      'hero.fact2': 'Cittadino UE',
      'hero.cvBtn': 'Scarica il CV',
      'hero.contactBtn': 'Contattami',
      'hero.photoAlt': 'Ritratto di Nicolò Iacobone',

      'about.kicker': '01 — Chi sono',
      'about.title': 'Un ricercatore con la valigia pronta',
      'about.p1': 'Lavoro sulla ricostruzione 3D feed-forward e sulla comprensione semantica delle scene: in pratica, provo a far sì che un modello guardi una manciata di immagini e ne ricavi una scena tridimensionale coerente, con gli oggetti al posto giusto e riconosciuti come tali.',
      'about.p2': 'Ho conseguito la laurea magistrale in Ingegneria Informatica (Artificial Intelligence and Data Analytics) al Politecnico di Torino con 108/110, svolgendo la tesi all’ETH di Zurigo. Da lì la collaborazione è continuata: oggi sono Research Collaborator nel gruppo di Photogrammetry & Remote Sensing dell’ETH.',
      'about.p3': 'Vivo a Bari, sono cittadino UE e sono disponibile a trasferirmi ovunque. Cerco posizioni orientate alla ricerca o un dottorato finanziato dall’industria nel campo della percezione 3D e del representation learning.',
      'about.stat1': 'Laurea magistrale al Politecnico di Torino',
      'about.stat2': 'Zürich — tesi e ricerca attuale',
      'about.stat3': 'Paesi in cui ho studiato: Italia, Romania, Svizzera',

      'research.kicker': '02 — Ricerca',
      'research.title': 'Percorso, progetti e strumenti',
      'research.lead': 'Dalla ricostruzione geometrica alla semantica: percorso accademico, progetti e competenze tecniche.',

      'research.expTitle': 'Esperienza',
      'research.exp1Date': 'Mar 2026 — oggi',
      'research.exp1Role': 'Research Collaborator — ETH Zürich',
      'research.exp1Org': 'Photogrammetry & Remote Sensing (D-BAUG) · da remoto',
      'research.exp1Topic': '3D-Consistent Instance Segmentation on Frozen Feed-Forward Backbones',
      'research.exp1b1': 'Decoder transformer in stile MaskDINO addestrato su un backbone VGGT-1B completamente congelato, per segmentazione di istanze 3D coerente tra viste: solo annotazioni 2D di ScanNet v2, nessuna etichetta 3D.',
      'research.exp1b2': 'Set di query condiviso tra i bundle di viste: per costruzione una query segue una singola istanza attraverso tutti i frame, con identità garantita da cross-frame attention e parametrizzazione 3D opzionale.',
      'research.exp1b3': 'Stack PyTorch completo — pixel decoder con deformable attention, selezione delle query a due stadi con denoising, matcher ungherese, caching delle feature per scena (da ore a minuti), orchestrazione SLURM — e il bridge di valutazione 2D→3D completamente unposed.',
      'research.exp1b4': 'Programma sperimentale sistematico (curve di data scaling, ablazioni, transfer zero-shot su ScanNet200, ScanNet++ e Replica): nel setting class-agnostic unposed il metodo regge il confronto con le baseline feed-forward pubblicate, con backbone congelato e circa un terzo delle viste per scena.',
      'research.codeLink': 'Codice',

      'research.exp2Date': 'Lug 2025 — Mar 2026',
      'research.exp2Role': 'Tesi magistrale — ETH Zürich',
      'research.exp2Org': 'In collaborazione con il Politecnico di Torino',
      'research.exp2Topic': 'Towards Multi-View 3D Instance Segmentation via Semantic Distillation',
      'research.exp2b1': 'Framework student–teacher di distillazione semantica che collega ricostruzione 3D feed-forward e foundation model 2D: un backbone geometrico (MapAnything) regredisce lo spazio latente di un teacher SAM2 congelato, sotto una loss di consistenza multi-vista.',
      'research.exp2b2': 'Individuato un collo di bottiglia di capacità degli encoder geometrici nella regressione semantica fine-grained: il vincolo da cui è nato il progetto successivo.',

      'research.eduTitle': 'Formazione',
      'research.edu1Date': 'Ott 2022 — Mar 2026',
      'research.edu1Title': 'MSc in Ingegneria Informatica',
      'research.edu1Sub': 'Artificial Intelligence and Data Analytics · Politecnico di Torino',
      'research.edu1Body': 'Votazione 108/110. Tesi svolta all’ETH di Zurigo (lug 2025 – mar 2026).',
      'research.edu2Date': 'Ott 2019 — Ott 2022',
      'research.edu2Title': 'BSc in Ingegneria Informatica e dell’Automazione',
      'research.edu2Sub': 'Politecnico di Bari',
      'research.edu2Body': 'Scambio Erasmus alla Universitatea Tehnică din Cluj-Napoca, Romania (ott 2021 – lug 2022).',

      'research.projTitle': 'Progetti accademici',
      'research.proj1Date': 'Giu 2024',
      'research.proj1Title': 'Real-Time Anomaly Detection for Road Scenes',
      'research.proj1Body': 'Ottimizzazione di modelli di anomaly detection per inferenza in tempo reale su dispositivi embedded a bassa potenza, in ottica di guida autonoma.',
      'research.reportLink': 'Report del progetto',
      'research.proj2Date': 'Mar 2024',
      'research.proj2Title': 'Synthetic Data Generation Tool — AROL Closure Systems',
      'research.proj2Body': 'CVAE per la generazione di serie temporali sintetiche per singola macchina e singolo sensore, sviluppato con un partner industriale e integrato nel loro framework.',
      'research.slidesLink': 'Codice e slide',

      'research.skillsTitle': 'Competenze',
      'research.sk1': 'Computer Vision 3D',
      'research.sk1t2': 'Segmentazione di istanze e semantica 2D/3D',
      'research.sk1t4': 'Modelli geometrici feed-forward (VGGT, MapAnything)',
      'research.sk1t5': 'Lifting 2D→3D unposed',
      'research.sk2': 'Deep Learning',
      'research.sk2t4': 'Knowledge distillation',
      'research.sk2t5': 'Adattamento di foundation model congelati (SAM2)',
      'research.sk2t6': 'Modelli generativi (CVAE)',
      'research.sk2t7': 'Ottimizzazione real-time / edge',
      'research.sk3': 'Research Engineering',
      'research.sk3t3': 'Design sperimentale riproducibile, ablazioni e data-scaling',
      'research.sk3t5': 'Regression testing di codice di ricerca',
      'research.sk4': 'Linguaggi',
      'research.sk4t1': 'Python (avanzato)',
      'research.sk4t3': 'Italiano (madrelingua)',
      'research.sk4t4': 'Inglese (fluente)',

      'beyond.kicker': '03 — Oltre la ricerca',
      'beyond.title': 'Quando il cluster sta ancora girando',
      'beyond.lead': 'Un training serio dura ore. Nel frattempo, bisogna pur fare qualcosa.',
      'beyond.c1Title': 'Social Media Manager dello Shakhtar Palese',
      'beyond.c1Body': 'Squadra amatoriale, ambizioni da Champions League. Ho creato e gestisco da zero tutta la presenza online: pagina Instagram, sito ufficiale e TikTok. Curo contenuti, grafiche e cronache delle partite — il mio unico progetto in cui le metriche di valutazione sono le visualizzazioni e non la mAP.',
      'beyond.c2Title': 'Campione Grandioso su Clash Royale',
      'beyond.c2Body': 'Record personale: Campione Grandioso. Anni di ottimizzazione degli iperparametri del mazzo, valutazione rigorosa in condizioni avverse e una tolleranza al rumore statistico costruita partita dopo partita. Se volete verificare, il tag è pubblico.',
      'beyond.c2Alt': 'Stemma Campione Grandioso di Clash Royale',
      'beyond.c3Title': 'So fare il giocoliere',
      'beyond.c3Body': 'Sì, davvero: tre palline in aria contemporaneamente. È l’unica forma di multitasking in cui riesco davvero bene, ed è sorprendentemente utile per spiegare cosa succede quando devi tenere traccia di più oggetti che si muovono nello spazio. Su richiesta, dimostrazione dal vivo.',

      'contact.kicker': '04 — Contatti',
      'contact.title': 'Parliamone',
      'contact.lead': 'Posizioni di ricerca, dottorati finanziati dall’industria, collaborazioni o semplicemente due parole sulla visione 3D: scrivetemi pure.',
      'contact.email': 'Email',
      'contact.phone': 'Telefono',
      'contact.cv': 'Curriculum',
      'contact.cvValue': 'Scarica il CV (PDF)',

      'footer.note': 'Costruito a mano in HTML, CSS e JavaScript. Nessun framework è stato maltrattato.',
      'footer.top': 'Torna su ↑'
    },

    en: {
      'meta.title': 'Nicolò Iacobone — Computer Vision & 3D Deep Learning Researcher',
      'meta.description': 'Personal website of Nicolò Iacobone, a Computer Vision and 3D Deep Learning researcher with the Photogrammetry & Remote Sensing group at ETH Zürich.',

      'a11y.skip': 'Skip to content',
      'a11y.langGroup': 'Language',
      'a11y.theme': 'Toggle theme',
      'a11y.menu': 'Open menu',

      'nav.about': 'About',
      'nav.research': 'Research',
      'nav.beyond': 'Beyond research',
      'nav.contact': 'Contact',

      'hero.badge': 'ETH Zürich · Photogrammetry & Remote Sensing',
      'hero.role': 'Computer Vision & 3D Deep Learning Researcher',
      'hero.tagline': 'Teaching machines to understand space: feed-forward 3D reconstruction and scene segmentation, without a single 3D label.',
      'hero.fact1': 'Bari, Italy · open to relocation worldwide',
      'hero.fact2': 'EU citizen',
      'hero.cvBtn': 'Download CV',
      'hero.contactBtn': 'Get in touch',
      'hero.photoAlt': 'Portrait of Nicolò Iacobone',

      'about.kicker': '01 — About',
      'about.title': 'A researcher with a packed suitcase',
      'about.p1': 'I work on feed-forward 3D reconstruction and semantic scene understanding: in practice, I try to make a model look at a handful of images and recover a coherent three-dimensional scene, with objects in the right place and recognised for what they are.',
      'about.p2': 'I hold an MSc in Computer Engineering (Artificial Intelligence and Data Analytics) from Politecnico di Torino, graduating with 108/110 and carrying out my thesis at ETH Zürich. The collaboration continued from there: I am now a Research Collaborator with the Photogrammetry & Remote Sensing group at ETH.',
      'about.p3': 'I am based in Bari, I am an EU citizen and I am open to relocating anywhere. I am looking for research-oriented positions or an industry-funded PhD in 3D perception and representation learning.',
      'about.stat1': "Master's degree at Politecnico di Torino",
      'about.stat2': 'Zürich — thesis and current research',
      'about.stat3': 'Countries I have studied in: Italy, Romania, Switzerland',

      'research.kicker': '02 — Research',
      'research.title': 'Path, projects and tooling',
      'research.lead': 'From geometric reconstruction to semantics: academic path, projects and technical skills.',

      'research.expTitle': 'Experience',
      'research.exp1Date': 'Mar 2026 — present',
      'research.exp1Role': 'Research Collaborator — ETH Zürich',
      'research.exp1Org': 'Photogrammetry & Remote Sensing (D-BAUG) · remote',
      'research.exp1Topic': '3D-Consistent Instance Segmentation on Frozen Feed-Forward Backbones',
      'research.exp1b1': 'Trained a MaskDINO-style transformer decoder on a strictly frozen VGGT-1B backbone for multi-view-consistent 3D instance segmentation, supervised only by 2D ScanNet v2 annotations: no 3D labels, no backbone adaptation.',
      'research.exp1b2': 'Designed a query set shared across view bundles, so one query tracks one object instance across all frames by construction, with identity enforced through cross-frame attention and an optional 3D anchor parameterisation.',
      'research.exp1b3': 'Built the full PyTorch stack — deformable-attention pixel decoder, two-stage query selection with denoising, Hungarian matcher, per-scene feature caching (training from hours to minutes), SLURM orchestration — and the fully unposed 2D→3D evaluation bridge.',
      'research.exp1b4': 'Ran a systematic empirical programme (data-scaling curves, ablations, zero-shot transfer to ScanNet200, ScanNet++ and Replica): in the class-agnostic unposed setting the method is competitive with published feed-forward baselines, with a frozen backbone and roughly one third of their per-scene view budget.',
      'research.codeLink': 'Code',

      'research.exp2Date': 'Jul 2025 — Mar 2026',
      'research.exp2Role': "Master's Thesis — ETH Zürich",
      'research.exp2Org': 'In collaboration with Politecnico di Torino',
      'research.exp2Topic': 'Towards Multi-View 3D Instance Segmentation via Semantic Distillation',
      'research.exp2b1': 'Designed a student–teacher semantic distillation framework bridging feed-forward 3D reconstruction and 2D foundation models: a geometric backbone (MapAnything) regresses the latent space of a frozen SAM2 teacher under a multi-view consistency loss.',
      'research.exp2b2': 'Identified a capacity bottleneck of geometric encoders under fine-grained semantic regression — the constraint that motivated the project above.',

      'research.eduTitle': 'Education',
      'research.edu1Date': 'Oct 2022 — Mar 2026',
      'research.edu1Title': 'MSc in Computer Engineering',
      'research.edu1Sub': 'Artificial Intelligence and Data Analytics · Politecnico di Torino',
      'research.edu1Body': 'Final grade 108/110. Thesis carried out at ETH Zürich (Jul 2025 – Mar 2026).',
      'research.edu2Date': 'Oct 2019 — Oct 2022',
      'research.edu2Title': 'BSc in Computer Science and Automation Engineering',
      'research.edu2Sub': 'Politecnico di Bari',
      'research.edu2Body': 'Erasmus exchange at Universitatea Tehnică din Cluj-Napoca, Romania (Oct 2021 – Jul 2022).',

      'research.projTitle': 'Academic projects',
      'research.proj1Date': 'Jun 2024',
      'research.proj1Title': 'Real-Time Anomaly Detection for Road Scenes',
      'research.proj1Body': 'Optimisation of anomaly-detection models for real-time inference on low-compute embedded devices for autonomous driving.',
      'research.reportLink': 'Project report',
      'research.proj2Date': 'Mar 2024',
      'research.proj2Title': 'Synthetic Data Generation Tool — AROL Closure Systems',
      'research.proj2Body': 'CVAE for per-machine, per-sensor synthetic time series, developed with an industrial partner and integrated into their framework.',
      'research.slidesLink': 'Code & slides',

      'research.skillsTitle': 'Skills',
      'research.sk1': '3D Computer Vision',
      'research.sk1t2': '2D/3D instance & semantic segmentation',
      'research.sk1t4': 'Feed-forward geometry models (VGGT, MapAnything)',
      'research.sk1t5': 'Unposed 2D→3D lifting',
      'research.sk2': 'Deep Learning',
      'research.sk2t4': 'Knowledge distillation',
      'research.sk2t5': 'Frozen-foundation-model adaptation (SAM2)',
      'research.sk2t6': 'Generative models (CVAE)',
      'research.sk2t7': 'Real-time / edge optimisation',
      'research.sk3': 'Research Engineering',
      'research.sk3t3': 'Reproducible experiment design, ablations & data-scaling',
      'research.sk3t5': 'Regression testing of research code',
      'research.sk4': 'Languages',
      'research.sk4t1': 'Python (advanced)',
      'research.sk4t3': 'Italian (native)',
      'research.sk4t4': 'English (proficient)',

      'beyond.kicker': '03 — Beyond research',
      'beyond.title': 'While the cluster is still running',
      'beyond.lead': 'A serious training run takes hours. In the meantime, one has to do something.',
      'beyond.c1Title': 'Social Media Manager of Shakhtar Palese',
      'beyond.c1Body': 'An amateur football team with Champions League ambitions. I created and still run their entire online presence from scratch: Instagram page, official website and TikTok. I handle content, graphics and match reports — the one project of mine where the evaluation metric is views rather than mAP.',
      'beyond.c2Title': 'Grand Champion on Clash Royale',
      'beyond.c2Body': 'Personal record: Grand Champion. Years of deck hyperparameter tuning, rigorous evaluation under adversarial conditions and a tolerance to statistical noise built one match at a time. If you want to check, the tag is public.',
      'beyond.c2Alt': 'Clash Royale Grand Champion badge',
      'beyond.c3Title': 'I can juggle',
      'beyond.c3Body': 'Yes, really: three balls in the air at once. It is the only kind of multitasking I am genuinely good at, and it is surprisingly handy for explaining what happens when you have to keep track of several objects moving through space. Live demo available on request.',

      'contact.kicker': '04 — Contact',
      'contact.title': "Let's talk",
      'contact.lead': 'Research positions, industry-funded PhDs, collaborations, or just a chat about 3D vision: feel free to write.',
      'contact.email': 'Email',
      'contact.phone': 'Phone',
      'contact.cv': 'Résumé',
      'contact.cvValue': 'Download CV (PDF)',

      'footer.note': 'Hand-built with HTML, CSS and JavaScript. No framework was harmed.',
      'footer.top': 'Back to top ↑'
    }
  };

  /* =======================================================
     LINGUA
     ======================================================= */
  var langButtons = Array.prototype.slice.call(document.querySelectorAll('.langswitch__btn'));

  function detectLang() {
    var saved = store(STORE_LANG);
    if (saved && I18N[saved]) return saved;
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'it';
    return nav.toLowerCase().indexOf('it') === 0 ? 'it' : 'en';
  }

  function applyLang(lang) {
    var dict = I18N[lang] || I18N.it;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var value = dict[el.getAttribute('data-i18n')];
      if (value === undefined) return;

      var attrs = el.getAttribute('data-i18n-attr');
      if (attrs) {
        attrs.split(',').forEach(function (a) { el.setAttribute(a.trim(), value); });
      } else {
        el.textContent = value;
      }
    });

    root.setAttribute('lang', lang);
    langButtons.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang));
    });
  }

  langButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var lang = btn.getAttribute('data-lang');
      store(STORE_LANG, lang);
      applyLang(lang);
    });
  });

  applyLang(detectLang());

  /* Se l'utente non ha mai scelto, seguiamo la lingua di sistema che cambia */
  /* (nessun evento standard per navigator.language: si applica al reload) */

  /* =======================================================
     TEMA
     ======================================================= */
  var themeToggle = document.getElementById('themeToggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#0e1118' : '#ffffff');
  }

  applyTheme(store(STORE_THEME) || (darkQuery.matches ? 'dark' : 'light'));

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      store(STORE_THEME, next);
      applyTheme(next);
    });
  }

  /* Finché non c'è una scelta manuale, seguiamo il sistema in tempo reale */
  function onSystemThemeChange(e) {
    if (!store(STORE_THEME)) applyTheme(e.matches ? 'dark' : 'light');
  }
  if (darkQuery.addEventListener) darkQuery.addEventListener('change', onSystemThemeChange);
  else if (darkQuery.addListener) darkQuery.addListener(onSystemThemeChange);

  /* =======================================================
     NAVBAR MOBILE
     ======================================================= */
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  function closeMenu() {
    if (!navLinks) return;
    navLinks.classList.remove('is-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });

    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 760) closeMenu();
    });
  }

  /* =======================================================
     OMBRA NAV + SCROLLSPY
     ======================================================= */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var linkFor = {};
  document.querySelectorAll('.nav__links a[href^="#"]').forEach(function (a) {
    linkFor[a.getAttribute('href').slice(1)] = a;
  });

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      if (nav) nav.classList.toggle('is-stuck', window.scrollY > 8);

      var current = null;
      var line = window.scrollY + 140;
      sections.forEach(function (s) { if (s.offsetTop <= line) current = s.id; });

      /* in fondo alla pagina evidenziamo comunque l'ultima sezione */
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
        current = sections.length ? sections[sections.length - 1].id : current;
      }

      Object.keys(linkFor).forEach(function (id) {
        linkFor[id].classList.toggle('is-active', id === current);
      });
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* =======================================================
     REVEAL ON SCROLL
     ======================================================= */
  var revealables = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* =======================================================
     ANNO NEL FOOTER
     ======================================================= */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
