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
      'meta.description': 'Portfolio di Nicolò Iacobone, ricercatore in Computer Vision e 3D Deep Learning: feed-forward 3D reconstruction e semantic scene understanding. Cerca ruoli di ricerca o ML engineering, oppure un dottorato.',

      'a11y.skip': 'Vai al contenuto',
      'a11y.langGroup': 'Lingua',
      'a11y.theme': 'Cambia tema',
      'a11y.menu': 'Apri il menu',

      'nav.about': 'Profilo',
      'nav.projects': 'Progetti',
      'nav.path': 'Percorso',
      'nav.beyond': 'Oltre la ricerca',
      'nav.contact': 'Contatti',
      'nav.rubik': 'Cubo di Rubik',

      'hero.kicker': 'Dossier di ricerca · 3D computer vision',
      'hero.kickerR': 'Aperto a nuove posizioni',
      'hero.role': 'Computer Vision & 3D Deep Learning Researcher',
      'hero.lead': 'Lavoro tra feed-forward 3D reconstruction e semantic scene understanding: modelli che da poche immagini ricavano la geometria di una scena e ne distinguono gli oggetti.',
      'hero.cvBtn': 'Scarica il CV',
      'hero.projectsBtn': 'Vedi i progetti',
      'hero.figNote': 'Illustrazione decorativa generata per questo sito: non sono dati di ricerca.',
      'hero.f1t': 'Cerco',
      'hero.f1': 'Ruoli di ricerca o ML engineering in industria, oppure un dottorato in 3D perception e representation learning',
      'hero.f2t': 'Ultimo ruolo',
      'hero.f2': 'Research Collaborator, ETH Zürich, mar–set 2026 (concluso)',
      'hero.f3t': 'Formazione',
      'hero.f3': 'MSc in Computer Engineering, Politecnico di Torino, 108/110',
      'hero.f4t': 'Base',
      'hero.f4': 'Bari, Italia. Disponibile a trasferirmi ovunque. Cittadino UE',

      'about.kicker': '01 — Profilo',
      'about.title': 'Un ricercatore con la valigia pronta',
      'about.photoAlt': 'Nicolò Iacobone in un atrio, davanti alle bandiere dei paesi europei',
      'about.p1': 'Sono un ricercatore in computer vision. In pratica, provo a far sì che un modello guardi una manciata di immagini e ne ricavi una scena tridimensionale coerente, con gli oggetti al posto giusto e riconosciuti come tali.',
      'about.p2': 'Ho concluso la magistrale in Ingegneria Informatica (Artificial Intelligence and Data Analytics) al Politecnico di Torino con 108/110, con la tesi svolta all’ETH di Zurigo. La collaborazione è proseguita da marzo a settembre 2026 come Research Collaborator nel gruppo Photogrammetry & Remote Sensing.',
      'about.p3': 'Fuori dall’ingegneria costruisco cose con Arduino, faccio il giocoliere, pesco e risolvo cubi di Rubik. Se ti incuriosisce, è tutto più sotto.',
      'about.stat1': 'Laurea magistrale, Politecnico di Torino',
      'about.stat2': 'Zürich: tesi e collaborazione di ricerca, 2025–2026',
      'about.stat3': 'Paesi in cui ho studiato: Italia, Romania, Svizzera',

      'proj.kicker': '02 — Progetti',
      'proj.title': 'Ricerca e progetti',
      'proj.lead': 'Ogni card si apre sul dossier del progetto: contesto, metodo, contributo, risultati e limiti. I numeri compaiono solo se verificati nel CV o nelle repository.',
      'proj.r1t': 'Tesi',
      'proj.r1': 'Un modello geometrico impara a imitare le feature di SAM 2.',
      'proj.r2t': 'Limite',
      'proj.r2': 'Un modello geometry-focused esaurisce la capacità sulla semantica fine-grained.',
      'proj.r3t': 'Progetto successivo',
      'proj.r3': 'Backbone frozen e decoder dedicato, addestrato solo su annotazioni 2D.',
      'proj.dossiers': 'I dossier dei progetti',

      'area.a': '3D perception',
      'area.aNote': 'ETH Zürich · 2025–2026',
      'area.b': 'Dati e annotazione',
      'area.bNote': 'Lavoro indipendente su modelli open-source',
      'area.c': 'Computer vision applicata e robotica',
      'area.cNote': 'Progetti personali · 2026',
      'area.d': 'Progetti accademici',

      'ui.open': 'Apri il dossier',
      'ui.openHidden': ': apri il dossier',
      'ui.close': 'Chiudi',
      'ui.context': 'Contesto',
      'ui.method': 'Metodo',
      'ui.contribution': 'Contributo',
      'ui.results': 'Risultati',
      'ui.limits': 'Limiti',
      'ui.links': 'Collegamenti',
      'ui.setting': 'Dove',
      'ui.stack': 'Tecnologie',
      'ui.status': 'Stato',
      'ui.schema': 'Schema illustrativo',
      'ui.code': 'Codice su GitHub',
      'ui.private': 'Repository privata',
      'ui.report': 'Report finale',
      'ui.results2': 'Tutti i risultati',
      'ui.keyMine': 'Contributo mio',
      'ui.keyUp': 'Upstream',
      'ui.keyFrozen': 'Frozen',
      'ui.keyPlan': 'Previsto, non ancora fatto',
      'ui.keyDone': 'Fatto e verificato',

      'p.vggt.short': 'Progetto VGGT',
      'p.mapanything.short': 'Tesi: MapAnything',
      'p.sam2.short': 'SAM 2 teacher',
      'p.maskdino.short': 'Toolchain MaskDINO',
      'p.kubric.short': 'Kubric synthetic data',
      'p.spatracker.short': 'Tracking SpaTrackerV2',
      'p.rubik.short': 'Risolutore Rubik',
      'p.doppelbot.short': 'DoppelBot',
      'ui.demo': 'Apri la demo',
      'ui.slides': 'Codice e slide',
      'ui.reportDoc': 'Report del progetto',
      'p.vggt.title': '3D-Consistent Instance Segmentation on Frozen Feed-Forward Backbones',
      'p.vggt.cat': 'Ricerca · ETH Zürich · mar–set 2026',
      'p.mapanything.title': 'Towards Multi-View 3D Instance Segmentation via Semantic Distillation',
      'p.mapanything.cat': 'Tesi magistrale · ETH Zürich · lug 2025–mar 2026',
      'p.sam2.title': 'SAM 2 come teacher: feature e confronto',
      'p.sam2.cat': 'Tesi · tooling per il teacher',
      'p.maskdino.title': 'Toolchain di MaskDINO su cluster HPC',
      'p.maskdino.cat': 'Tooling · ambiente HPC · 2026',
      'p.maskdino.metric': 'Lavoro di ambiente: nessuna metrica del modello',
      'p.sam3.title': 'Annotazione automatica di ScanNet con SAM 3',
      'p.sam3.cat': 'Pipeline di annotazione · mag–giu 2026',
      'p.kubric.title': 'Synthetic 3D data controllati con Kubric',
      'p.kubric.cat': 'Synthetic data',
      'p.spatracker.title': '3D point tracking in batch con SpaTrackerV2',
      'p.spatracker.cat': '3D point tracking',
      'p.rubik.title': 'Scanner e risolutore del cubo di Rubik nel browser',
      'p.rubik.cat': 'Progetto personale · ott 2026 · demo dal vivo',
      'p.doppelbot.title': 'DoppelBot: un digital twin in ROS 2',
      'p.doppelbot.cat': 'Progetto personale · ott 2026',
      'p.openfactory.title': 'OpenFactory AI: una cella robotica in simulazione',
      'p.openfactory.cat': 'Progetto personale · in corso',
      'p.anomaly.title': 'Real-Time Anomaly Detection for Road Scenes',
      'p.anomaly.cat': 'Progetto accademico · giu 2024',
      'p.arol.title': 'Synthetic Data Generation for AROL Closure Systems',
      'p.arol.cat': 'Progetto accademico · mar 2024',
      'p.hololens.title': 'App di mixed reality per HoloLens 2',
      'p.hololens.cat': 'Progetto accademico · giu 2022',

      'fig.ma1': 'Figura del progetto MapAnything: sei configurazioni di input a sinistra e, a destra, la metric point cloud di un edificio con le camere stimate',
      'fig.ma2': 'A sinistra, la PCA delle feature di SAM 2 che lascia riconoscere la sagoma di una statuina; a destra, i cluster HDBSCAN frammentati, che non seguono gli oggetti',
      'fig.ku1': 'Figura di Kubric: una scena sintetica con oggetti su un tappeto e, accanto, segmentation, depth, optical flow, normals e object coordinates',
      'fig.ku2': 'Tabella scorrevole delle nove configurazioni del batch',
      'fig.hl1': 'Vista dall’editor Unity: una mano simulata davanti all’hand menu con cinque pulsanti di solver, il pannello informativo, il profiler e il modello di una pizza',
      'fig.hl2': 'Una sfera blu tenuta da un solver davanti all’utente, con la mano simulata, il profiler e la pizza',
      'fig.hl3': 'Frecce colorate in alto nell’inquadratura che indicano una direzione, con la mano simulata e la pizza al centro',

      'path.kicker': '03 — Percorso',
      'path.title': 'Esperienza, formazione, competenze',
      'path.expTitle': 'Esperienza di ricerca',
      'path.e1Date': 'Mar 2026 — Set 2026',
      'path.e1': 'Ho insegnato a un modello di 3D reconstruction frozen (VGGT) a distinguere anche i singoli oggetti, mantenendoli coerenti tra le viste e addestrando solo su annotazioni 2D. Ho costruito la pipeline dal data loading alla valutazione sul benchmark ufficiale ScanNet.',
      'path.e2Date': 'Lug 2025 — Mar 2026',
      'path.e2Role': 'Tesi magistrale — ETH Zürich',
      'path.e2Org': 'Per la laurea magistrale al Politecnico di Torino',
      'path.e2': 'Ho insegnato a un modello di 3D reconstruction (MapAnything) a imitare le feature di un modello di segmentation (SAM 2), restando coerente tra le viste. Ho trovato che un modello geometry-focused esaurisce la capacità sulla semantica fine-grained: da qui il lavoro successivo.',
      'path.eduTitle': 'Formazione',
      'path.ed1Date': 'Ott 2022 — Mar 2026',
      'path.ed1': 'MSc in Computer Engineering — Artificial Intelligence and Data Analytics',
      'path.ed1Org': 'Politecnico di Torino · 108/110 · Tesi svolta all’ETH Zürich (lug 2025 – mar 2026)',
      'path.ed2Date': 'Ott 2019 — Ott 2022',
      'path.ed2': 'BSc in Computer Science and Automation Engineering',
      'path.ed2Org': 'Politecnico di Bari · Erasmus alla Universitatea Tehnică din Cluj-Napoca, Romania (ott 2021 – lug 2022)',
      'path.skillsTitle': 'Competenze',
      'path.sk1': '3D Computer Vision',
      'path.sk1a': '3D reconstruction e scene understanding',
      'path.sk1b': 'Multi-view perception',
      'path.sk1c': '2D/3D instance segmentation',
      'path.sk1d': '3D point tracking',
      'path.sk2b': 'Object detection e segmentation',
      'path.sk2d': 'Synthetic data generation',
      'path.sk3': 'Programmazione',
      'path.sk3a': 'Python (avanzato)',
      'path.sk4': 'Lingue',
      'path.sk4a': 'Italiano (madrelingua)',
      'path.sk4b': 'Inglese (avanzato)',

      'beyond.kicker': '04 — Oltre la ricerca',
      'beyond.title': 'Quando il cluster sta ancora girando',
      'beyond.lead': 'Un training serio dura ore. Nel frattempo, bisogna pur fare qualcosa.',
      'beyond.c1Title': 'Social Media Manager dello Shakhtar Palese',
      'beyond.c1Body': 'Squadra amatoriale, ambizioni da Champions League. Ho creato e gestisco da zero tutta la presenza online: pagina Instagram, sito ufficiale e TikTok. Curo contenuti, grafiche e cronache delle partite: il mio unico progetto in cui le metriche di valutazione sono le visualizzazioni e non la mAP.',
      'beyond.c2Title': 'Campione Grandioso su Clash Royale',
      'beyond.c2Body': 'Ogni stagione arrivo a Campione Grandioso, cosa che mi mette tra il 2 e il 4% dei giocatori attivi al mondo: anni di hyperparameter tuning del mazzo e una tolleranza al rumore statistico costruita partita dopo partita. Se volete verificare, il tag è pubblico.',
      'beyond.c2Alt': 'Stemma Campione Grandioso di Clash Royale',
      'beyond.c2Stats': 'Statistiche su RoyaleAPI',
      'beyond.c2Open': 'Apri in Clash Royale',
      'beyond.c3Title': 'So fare il giocoliere',
      'beyond.c3Body': 'Sì, davvero: tre palline in aria contemporaneamente. È l’unica forma di multitasking in cui riesco davvero bene, ed è sorprendentemente utile per spiegare cosa succede quando devi tenere traccia di più oggetti che si muovono nello spazio. Su richiesta, dimostrazione dal vivo.',
      'beyond.c4Title': 'Film preferito: Shrek 2',
      'beyond.c4Body': 'Non il primo: il secondo. Ci sono discussioni che non sono disposto ad avere. Il sequel migliora tutto quello che c’era prima, regala al mondo il Gatto con gli Stivali e ha una colonna sonora che regge dopo vent’anni. Se serve un argomento per rompere il ghiaccio, questo funziona sempre.',
      'beyond.c4Alt': 'Locandina del film Shrek 2',
      'beyond.c5Title': 'Pesca (con conseguenze permanenti)',
      'beyond.c5Body': 'Alzarsi prima dell’alba per stare fermo su uno scoglio ad aspettare: dopo mesi passati a fissare curve di training, è terapia. Pesco a bolognese e a fondo e sono completamente autonomo, dalla scelta dell’esca a tutti i nodi che servono. Il mio primo pesce mi è piaciuto al punto che me lo sono fatto tatuare sull’avambraccio. Mia nonna ha commentato che «sembra un ricamo», e da allora non riesco più a vederlo diversamente.',
      'beyond.c5Alt1': 'Il mio primo pesce, tenuto in mano davanti al mare al tramonto',
      'beyond.c5Alt2': 'Tatuaggio a linee sottili dello stesso pesce, sull’avambraccio',
      'beyond.c5Cap1': 'Il primo.',
      'beyond.c5Cap2': 'E la sua versione permanente.',
      'beyond.c6Title': 'Montaggio: video, foto e musica',
      'beyond.c6Body': 'Monto ed edito video, foto e musica: tagli, ritmo, ritocco e audio. È una pipeline di post-processing anche questa, solo che qui il ground truth è il gusto.',
      'beyond.c7Title': 'Arduino, anche dalla cattedra',
      'beyond.c7Body': 'Microcontrollori, sensori e breadboard: l’hardware è il posto in cui un bug si vede a occhio nudo, di solito perché qualcosa ha smesso di lampeggiare. Durante l’ultimo anno di magistrale a Torino ho anche tenuto un corso di orientamento su Arduino per i ragazzi delle superiori alle prese con la scelta dell’università.',
      'beyond.c8Title': 'So risolvere il cubo di Rubik',
      'beyond.c8Body': 'Sei facce, 43 miliardi di miliardi di configurazioni possibili e un solo stato corretto. Lo risolvo con una sequenza di algoritmi imparati a memoria: la prova tascabile che anche un search space enorme si doma, se applichi le mosse giuste nell’ordine giusto.',
      'beyond.c8Link': 'Prova il risolutore con la fotocamera',

      'egg.fish.alt': 'Il pesce del tatuaggio disegnato a punti di ricamo, in un telaio da ricamo',
      'egg.fish.cap': 'Secondo mia nonna.',
      'egg.fish.btn': 'Ricamalo',
      'egg.cube.label': 'Risolvi il mini cubo',
      'egg.cube.link': 'Risolutore completo →',

      'map.subhead': 'Dove sono stato',
      'map.lived': 'Ci ho vissuto',
      'map.visited': 'Visitati',
      'map.note': 'Passa sopra un paese, o toccalo, per vederne il nome. Pizzica per ingrandire.',
      'map.source': 'Confini: Natural Earth (pubblico dominio).',
      'map.fallback': 'La mappa richiede JavaScript per essere disegnata.',
      'map.zoomIn': 'Ingrandisci',
      'map.zoomOut': 'Riduci',
      'map.zoomReset': 'Reimposta la vista',
      'map.tipLived': 'ci ho vissuto',
      'map.tipVisited': 'visitato',

      'contact.kicker': '05 — Contatti',
      'contact.title': 'Parliamone',
      'contact.lead': 'Posizioni di ricerca o di ML engineering in industria, dottorati, collaborazioni o semplicemente due parole sulla visione 3D: scrivetemi pure.',
      'contact.email': 'Email',
      'contact.phone': 'Telefono',
      'contact.cv': 'Curriculum',
      'contact.cvValue': 'Scarica il CV (PDF)',

      'footer.note': 'Costruito a mano in HTML, CSS e JavaScript. Nessun framework è stato maltrattato.',
      'footer.top': 'Torna su ↑',
      'footer.privacy': 'Privacy e cookie',

      'privacy.metaTitle': 'Privacy e cookie — Nicolò Iacobone',
      'privacy.metaDescription': 'Informativa sulla privacy e sui cookie del sito www.nicoloiacobone.it.',
      'privacy.backHome': '← Torna al sito'
    },

    en: {
      'meta.title': 'Nicolò Iacobone — Computer Vision & 3D Deep Learning Researcher',
      'meta.description': 'Portfolio of Nicolò Iacobone, a Computer Vision and 3D Deep Learning researcher working on feed-forward 3D reconstruction and semantic scene understanding. Looking for research or ML engineering roles, or a PhD.',

      'a11y.skip': 'Skip to content',
      'a11y.langGroup': 'Language',
      'a11y.theme': 'Toggle theme',
      'a11y.menu': 'Open menu',

      'nav.about': 'Profile',
      'nav.projects': 'Projects',
      'nav.path': 'Background',
      'nav.beyond': 'Beyond research',
      'nav.contact': 'Contact',
      'nav.rubik': 'Rubik’s cube',

      'hero.kicker': 'Research dossier · 3D computer vision',
      'hero.kickerR': 'Open to new roles',
      'hero.role': 'Computer Vision & 3D Deep Learning Researcher',
      'hero.lead': 'I work across feed-forward 3D reconstruction and semantic scene understanding: models that recover a scene’s geometry from a few images and tell its objects apart.',
      'hero.cvBtn': 'Download CV',
      'hero.projectsBtn': 'See the projects',
      'hero.figNote': 'Decorative illustration generated for this site: not research data.',
      'hero.f1t': 'Looking for',
      'hero.f1': 'Research or ML engineering roles in industry, or a PhD in 3D perception and representation learning',
      'hero.f2t': 'Latest role',
      'hero.f2': 'Research Collaborator, ETH Zürich, Mar–Sep 2026 (ended)',
      'hero.f3t': 'Education',
      'hero.f3': 'MSc in Computer Engineering, Politecnico di Torino, 108/110',
      'hero.f4t': 'Based in',
      'hero.f4': 'Bari, Italy. Open to relocation worldwide. EU citizen',

      'about.kicker': '01 — Profile',
      'about.title': 'A researcher with a packed suitcase',
      'about.photoAlt': 'Nicolò Iacobone in a lobby, in front of the flags of European countries',
      'about.p1': 'I am a computer vision researcher. In practice, I try to make a model look at a handful of images and recover a coherent three-dimensional scene, with objects in the right place and recognised for what they are.',
      'about.p2': 'I completed an MSc in Computer Engineering (Artificial Intelligence and Data Analytics) at Politecnico di Torino with 108/110, carrying out my thesis at ETH Zürich. The collaboration continued from March to September 2026 as a Research Collaborator with the Photogrammetry & Remote Sensing group.',
      'about.p3': 'Outside engineering, I build things with Arduino, I juggle, fish and solve Rubik’s cubes. If you are curious, it is all further down.',
      'about.stat1': 'Master’s degree, Politecnico di Torino',
      'about.stat2': 'Zürich: thesis and research collaboration, 2025–2026',
      'about.stat3': 'Countries I have studied in: Italy, Romania, Switzerland',

      'proj.kicker': '02 — Projects',
      'proj.title': 'Research and projects',
      'proj.lead': 'Each card opens the project’s dossier: context, method, contribution, results and limits. Numbers appear only if verified in the CV or the repositories.',
      'proj.r1t': 'Thesis',
      'proj.r1': 'A geometric model learns to imitate SAM 2’s features.',
      'proj.r2t': 'Limit',
      'proj.r2': 'A geometry-focused model runs out of capacity for fine-grained semantics.',
      'proj.r3t': 'Follow-up',
      'proj.r3': 'A frozen backbone and a dedicated decoder, trained only on 2D annotations.',
      'proj.dossiers': 'Project dossiers',

      'area.a': '3D perception',
      'area.aNote': 'ETH Zürich · 2025–2026',
      'area.b': 'Data and annotation',
      'area.bNote': 'Independent work on open-source models',
      'area.c': 'Applied vision and robotics',
      'area.cNote': 'Personal projects · 2026',
      'area.d': 'Academic projects',

      'ui.open': 'Open the dossier',
      'ui.openHidden': ': open the dossier',
      'ui.close': 'Close',
      'ui.context': 'Context',
      'ui.method': 'Method',
      'ui.contribution': 'Contribution',
      'ui.results': 'Results',
      'ui.limits': 'Limits',
      'ui.links': 'Links',
      'ui.setting': 'Where',
      'ui.stack': 'Technologies',
      'ui.status': 'Status',
      'ui.schema': 'Illustrative schematic',
      'ui.code': 'Code on GitHub',
      'ui.private': 'Private repository',
      'ui.report': 'Final report',
      'ui.results2': 'All results',
      'ui.keyMine': 'My contribution',
      'ui.keyUp': 'Upstream',
      'ui.keyFrozen': 'Frozen',
      'ui.keyPlan': 'Planned, not done yet',
      'ui.keyDone': 'Done and verified',

      'p.vggt.short': 'VGGT project',
      'p.mapanything.short': 'Thesis: MapAnything',
      'p.sam2.short': 'SAM 2 teacher',
      'p.maskdino.short': 'MaskDINO toolchain',
      'p.kubric.short': 'Kubric synthetic data',
      'p.spatracker.short': 'SpaTrackerV2 tracking',
      'p.rubik.short': 'Rubik solver',
      'p.doppelbot.short': 'DoppelBot',
      'ui.demo': 'Open the demo',
      'ui.slides': 'Code and slides',
      'ui.reportDoc': 'Project report',
      'p.vggt.title': '3D-Consistent Instance Segmentation on Frozen Feed-Forward Backbones',
      'p.vggt.cat': 'Research · ETH Zürich · Mar–Sep 2026',
      'p.mapanything.title': 'Towards Multi-View 3D Instance Segmentation via Semantic Distillation',
      'p.mapanything.cat': 'Master’s thesis · ETH Zürich · Jul 2025–Mar 2026',
      'p.sam2.title': 'SAM 2 as the teacher: features and comparison',
      'p.sam2.cat': 'Thesis · teacher tooling',
      'p.maskdino.title': 'MaskDINO toolchain on an HPC cluster',
      'p.maskdino.cat': 'Tooling · HPC environment · 2026',
      'p.maskdino.metric': 'Environment work: no model metric',
      'p.sam3.title': 'Automatic 2D instance annotation of ScanNet with SAM 3',
      'p.sam3.cat': 'Annotation pipeline · May–Jun 2026',
      'p.kubric.title': 'Controlled synthetic 3D data with Kubric',
      'p.kubric.cat': 'Synthetic data',
      'p.spatracker.title': 'Batch 3D point tracking with SpaTrackerV2',
      'p.spatracker.cat': '3D point tracking',
      'p.rubik.title': 'Rubik’s cube scanner and solver in the browser',
      'p.rubik.cat': 'Personal project · Oct 2026 · live demo',
      'p.doppelbot.title': 'DoppelBot: a digital twin in ROS 2',
      'p.doppelbot.cat': 'Personal project · Oct 2026',
      'p.openfactory.title': 'OpenFactory AI: a robotic cell in simulation',
      'p.openfactory.cat': 'Personal project · in progress',
      'p.anomaly.title': 'Real-Time Anomaly Detection for Road Scenes',
      'p.anomaly.cat': 'Academic project · Jun 2024',
      'p.arol.title': 'Synthetic Data Generation for AROL Closure Systems',
      'p.arol.cat': 'Academic project · Mar 2024',
      'p.hololens.title': 'HoloLens 2 mixed-reality app',
      'p.hololens.cat': 'Academic project · Jun 2022',

      'fig.ma1': 'Figure from the MapAnything project: six input configurations on the left and, on the right, the metric point cloud of a building with the estimated cameras',
      'fig.ma2': 'On the left, a PCA of SAM 2 features where the outline of a figurine can be recognised; on the right, fragmented HDBSCAN clusters that do not follow the objects',
      'fig.ku1': 'Figure from Kubric: a synthetic scene with objects on a rug and, next to it, its segmentation, depth, optical flow, normals and object coordinates',
      'fig.ku2': 'Scrollable table of the nine batch configurations',
      'fig.hl1': 'View from the Unity editor: a simulated hand in front of the hand menu with five solver buttons, the info panel, the profiler and a pizza model',
      'fig.hl2': 'A blue sphere held by a solver in front of the user, with the simulated hand, the profiler and the pizza',
      'fig.hl3': 'Coloured arrows at the top of the frame pointing in a direction, with the simulated hand and the pizza in the centre',

      'path.kicker': '03 — Background',
      'path.title': 'Experience, education, skills',
      'path.expTitle': 'Research experience',
      'path.e1Date': 'Mar 2026 — Sep 2026',
      'path.e1': 'Taught a frozen 3D reconstruction model (VGGT) to also pick out the individual objects in a scene, keeping each object consistent across every view, while training only on ordinary 2D annotations. Built the pipeline from data loading to evaluation on the official ScanNet benchmark.',
      'path.e2Date': 'Jul 2025 — Mar 2026',
      'path.e2Role': 'Master’s Thesis — ETH Zürich',
      'path.e2Org': 'For the MSc at Politecnico di Torino',
      'path.e2': 'Taught a 3D reconstruction model (MapAnything) to imitate the features of a segmentation model (SAM 2) while staying consistent across views. Found that a geometry-focused model runs out of capacity for fine-grained semantics, which led to the follow-up work.',
      'path.eduTitle': 'Education',
      'path.ed1Date': 'Oct 2022 — Mar 2026',
      'path.ed1': 'MSc in Computer Engineering — Artificial Intelligence and Data Analytics',
      'path.ed1Org': 'Politecnico di Torino · 108/110 · Thesis carried out at ETH Zürich (Jul 2025 – Mar 2026)',
      'path.ed2Date': 'Oct 2019 — Oct 2022',
      'path.ed2': 'BSc in Computer Science and Automation Engineering',
      'path.ed2Org': 'Politecnico di Bari · Erasmus exchange at Universitatea Tehnică din Cluj-Napoca, Romania (Oct 2021 – Jul 2022)',
      'path.skillsTitle': 'Skills',
      'path.sk1': '3D Computer Vision',
      'path.sk1a': '3D reconstruction and scene understanding',
      'path.sk1b': 'Multi-view perception',
      'path.sk1c': '2D/3D instance segmentation',
      'path.sk1d': '3D point tracking',
      'path.sk2b': 'Object detection and segmentation',
      'path.sk2d': 'Synthetic data generation',
      'path.sk3': 'Programming',
      'path.sk3a': 'Python (advanced)',
      'path.sk4': 'Languages',
      'path.sk4a': 'Italian (native)',
      'path.sk4b': 'English (proficient)',

      'beyond.kicker': '04 — Beyond research',
      'beyond.title': 'While the cluster is still running',
      'beyond.lead': 'A serious training run takes hours. In the meantime, one has to do something.',
      'beyond.c1Title': 'Social Media Manager of Shakhtar Palese',
      'beyond.c1Body': 'An amateur football team with Champions League ambitions. I created and still run their entire online presence from scratch: Instagram page, official website and TikTok. I handle content, graphics and match reports: the one project of mine where the evaluation metric is views rather than mAP.',
      'beyond.c2Title': 'Grand Champion on Clash Royale',
      'beyond.c2Body': 'Every season I reach Grand Champion, which puts me among the top 2–4% of active players worldwide: years of deck hyperparameter tuning and a tolerance to statistical noise built one match at a time. If you want to check, the tag is public.',
      'beyond.c2Alt': 'Clash Royale Grand Champion badge',
      'beyond.c2Stats': 'Stats on RoyaleAPI',
      'beyond.c2Open': 'Open in Clash Royale',
      'beyond.c3Title': 'I can juggle',
      'beyond.c3Body': 'Yes, really: three balls in the air at once. It is the only kind of multitasking I am genuinely good at, and it is surprisingly handy for explaining what happens when you have to keep track of several objects moving through space. Live demo available on request.',
      'beyond.c4Title': 'Favourite film: Shrek 2',
      'beyond.c4Body': 'Not the first one: the second. There are arguments I am simply not willing to have. The sequel improves on everything that came before it, gives the world Puss in Boots and has a soundtrack that still holds up twenty years later. As an icebreaker, it never fails.',
      'beyond.c4Alt': 'Poster of the film Shrek 2',
      'beyond.c5Title': 'Fishing (with permanent consequences)',
      'beyond.c5Body': 'Getting up before dawn to sit still on a rock and wait: after months spent staring at training curves, it is therapy. I fish with both bolognese (float) and bottom rigs, and I am fully self-sufficient, from picking the bait to tying every knot I need. I liked my first fish enough to have it tattooed on my forearm. My grandmother’s verdict was that it “looks like embroidery”, and I have not been able to see it any other way since.',
      'beyond.c5Alt1': 'My first fish, held up against the sea at sunset',
      'beyond.c5Alt2': 'Fine-line tattoo of the same fish, on the forearm',
      'beyond.c5Cap1': 'The first one.',
      'beyond.c5Cap2': 'And its permanent version.',
      'beyond.c6Title': 'Editing: video, photo and music',
      'beyond.c6Body': 'I cut and edit video, photos and music: cuts, pacing, retouching and audio. It is a post-processing pipeline too, except that here the ground truth is taste.',
      'beyond.c7Title': 'Arduino, from the teaching side too',
      'beyond.c7Body': 'Microcontrollers, sensors and breadboards: hardware is where a bug is visible to the naked eye, usually because something has stopped blinking. During the final year of my MSc in Turin I also taught an Arduino orientation course for high-school students choosing their university.',
      'beyond.c8Title': 'I can solve a Rubik’s cube',
      'beyond.c8Body': 'Six faces, 43 quintillion possible configurations and only one correct state. I solve it with a sequence of memorised algorithms: pocket-sized proof that even a huge search space can be tamed if you apply the right moves in the right order.',
      'beyond.c8Link': 'Try the camera solver',

      'egg.fish.alt': 'The tattooed fish drawn in embroidery stitches, in an embroidery hoop',
      'egg.fish.cap': 'According to my grandmother.',
      'egg.fish.btn': 'Stitch it',
      'egg.cube.label': 'Solve the mini cube',
      'egg.cube.link': 'Full solver →',

      'map.subhead': 'Where I have been',
      'map.lived': 'Lived in',
      'map.visited': 'Visited',
      'map.note': 'Hover over a country, or tap it, to see its name. Pinch to zoom in.',
      'map.source': 'Borders: Natural Earth (public domain).',
      'map.fallback': 'The map needs JavaScript in order to be drawn.',
      'map.zoomIn': 'Zoom in',
      'map.zoomOut': 'Zoom out',
      'map.zoomReset': 'Reset the view',
      'map.tipLived': 'lived here',
      'map.tipVisited': 'visited',

      'contact.kicker': '05 — Contact',
      'contact.title': 'Let’s talk',
      'contact.lead': 'Research or ML engineering roles in industry, PhDs, collaborations, or just a chat about 3D vision: feel free to write.',
      'contact.email': 'Email',
      'contact.phone': 'Phone',
      'contact.cv': 'Résumé',
      'contact.cvValue': 'Download CV (PDF)',

      'footer.note': 'Hand-built with HTML, CSS and JavaScript. No framework was harmed.',
      'footer.top': 'Back to top ↑',
      'footer.privacy': 'Privacy & cookies',

      'privacy.metaTitle': 'Privacy & cookies — Nicolò Iacobone',
      'privacy.metaDescription': 'Privacy and cookie policy of the website www.nicoloiacobone.it.',
      'privacy.backHome': '← Back to the website'
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
    if (typeof relabelMap === 'function') relabelMap();
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

  /* =======================================================
     MAPPA DEI VIAGGI
     Disegna un SVG dai confini in world-map-data.js e li colora
     secondo le liste in travels.js. Proiezione di Robinson.
     ======================================================= */
  var mapEl = document.getElementById('worldMap');

  /* Tabelle standard di Robinson, latitudine da 0° a 90° a passi di 5° */
  var ROB_X = [1, 0.9986, 0.9954, 0.99, 0.9822, 0.973, 0.96, 0.9427, 0.9216,
               0.8962, 0.8679, 0.835, 0.7986, 0.7597, 0.7186, 0.6732, 0.6213, 0.5722, 0.5322];
  var ROB_Y = [0, 0.062, 0.124, 0.186, 0.248, 0.31, 0.372, 0.434, 0.4958,
               0.5571, 0.6176, 0.6769, 0.7346, 0.7903, 0.8435, 0.8936, 0.9394, 0.9761, 1];

  function robinson(lon, lat) {
    var a = Math.min(Math.abs(lat), 90);
    var i = Math.min(Math.floor(a / 5), 17);
    var t = (a - i * 5) / 5;
    var kx = ROB_X[i] + (ROB_X[i + 1] - ROB_X[i]) * t;
    var ky = ROB_Y[i] + (ROB_Y[i + 1] - ROB_Y[i]) * t;
    return [0.8487 * kx * lon * Math.PI / 180,
            1.3523 * ky * (lat < 0 ? -1 : 1)];
  }

  function buildMap() {
    if (!mapEl || !window.WORLD_GEO) return null;

    var travels = window.TRAVELS || { lived: [], visited: [] };
    var lived = {}, visited = {};
    (travels.lived || []).forEach(function (c) { lived[String(c).toUpperCase()] = true; });
    (travels.visited || []).forEach(function (c) { visited[String(c).toUpperCase()] = true; });

    /* Proietto tutto una volta sola e tengo i limiti reali per il viewBox */
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    var projected = {};

    Object.keys(WORLD_GEO).forEach(function (code) {
      projected[code] = WORLD_GEO[code].g.map(function (poly) {
        return poly.map(function (flat) {
          var pts = [];
          for (var i = 0; i < flat.length; i += 2) {
            var p = robinson(flat[i], flat[i + 1]);
            if (p[0] < minX) minX = p[0];
            if (p[0] > maxX) maxX = p[0];
            if (p[1] < minY) minY = p[1];
            if (p[1] > maxY) maxY = p[1];
            pts.push(p);
          }
          return pts;
        });
      });
    });

    /* y va invertita: in SVG cresce verso il basso */
    var pad = 0.02 * (maxX - minX);
    var vw = (maxX - minX) + pad * 2;
    var vh = (maxY - minY) + pad * 2;
    var K = 1000 / vw;

    function d(polys) {
      var out = [];
      polys.forEach(function (poly) {
        poly.forEach(function (ring) {
          var seg = [];
          ring.forEach(function (p) {
            seg.push(((p[0] - minX + pad) * K).toFixed(1) + ',' +
                     ((maxY - p[1] + pad) * K).toFixed(1));
          });
          out.push('M' + seg.join('L') + 'Z');
        });
      });
      return out.join('');
    }

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 1000 ' + (vh * K).toFixed(1));
    svg.setAttribute('class', 'worldmap');
    svg.setAttribute('role', 'img');

    var titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    svg.appendChild(titleEl);

    var nLived = 0, nVisited = 0;
    var paths = [];
    var POINTS = window.WORLD_POINTS || {};

    Object.keys(projected).sort().forEach(function (code) {
      var state = lived[code] ? 'lived' : (visited[code] ? 'visited' : 'none');
      if (state === 'lived') nLived++;
      else if (state === 'visited') nVisited++;

      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d(projected[code]));
      path.setAttribute('fill-rule', 'evenodd');
      path.setAttribute('class', 'country country--' + state);
      path.setAttribute('data-code', code);
      /* <title> nativo: accessibile e utile anche senza il tooltip custom */
      var t = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      path.appendChild(t);
      paths.push(path);
      svg.appendChild(path);
    });

    /* Microstati: alla scala mondiale non hanno una forma visibile, quindi
       li disegno come pallino — ma solo se sono stati visitati o ci ho vissuto,
       altrimenti la mappa si riempirebbe di puntini inutili. */
    Object.keys(POINTS).forEach(function (code) {
      var state = lived[code] ? 'lived' : (visited[code] ? 'visited' : null);
      if (!state) return;
      if (state === 'lived') nLived++; else nVisited++;

      var xy = robinson(POINTS[code].p[0], POINTS[code].p[1]);
      var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', ((xy[0] - minX + pad) * K).toFixed(1));
      c.setAttribute('cy', ((maxY - xy[1] + pad) * K).toFixed(1));
      c.setAttribute('r', '3.4');
      c.setAttribute('class', 'country country--dot country--' + state);
      c.setAttribute('data-code', code);
      var ct = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      c.appendChild(ct);
      paths.push(c);
      svg.appendChild(c);
    });

    /* Un codice che non esiste da nessuna parte è quasi sempre un refuso in
       travels.js: meglio dirlo in console che ignorarlo in silenzio. */
    var unknown = Object.keys(lived).concat(Object.keys(visited)).filter(function (c) {
      return !WORLD_GEO[c] && !POINTS[c];
    });
    if (unknown.length) {
      console.warn('travels.js: codici paese non riconosciuti → ' + unknown.join(', '));
    }

    var fallback = mapEl.querySelector('.map__fallback');
    if (fallback) fallback.remove();
    mapEl.insertBefore(svg, mapEl.firstChild);

    var elLived = document.getElementById('mapCountLived');
    var elVisited = document.getElementById('mapCountVisited');
    if (elLived) elLived.textContent = String(nLived);
    if (elVisited) elVisited.textContent = String(nVisited);

    /* ---- zoom e spostamento ---- */
    var btnIn = document.getElementById('mapZoomIn');
    var btnOut = document.getElementById('mapZoomOut');
    var btnReset = document.getElementById('mapZoomReset');

    var BASE = { x: 0, y: 0, w: 1000, h: +(vh * K).toFixed(1) };
    var view = { x: BASE.x, y: BASE.y, w: BASE.w, h: BASE.h };
    var MAX_ZOOM = 8;

    function zoomLevel() { return BASE.w / view.w; }

    function applyView() {
      svg.setAttribute('viewBox', view.x + ' ' + view.y + ' ' + view.w + ' ' + view.h);
      /* A riposo lascio che il dito scorra la pagina; da ingrandita prendo io
         tutti i gesti, altrimenti non si riesce a spostare la mappa. */
      svg.style.touchAction = zoomLevel() > 1.01 ? 'none' : 'pan-y';
      if (btnOut) btnOut.disabled = zoomLevel() <= 1.01;
      if (btnReset) btnReset.disabled = zoomLevel() <= 1.01;
      if (btnIn) btnIn.disabled = zoomLevel() >= MAX_ZOOM - 0.01;
    }

    function clampView() {
      var z = zoomLevel();
      if (z < 1) { view.w = BASE.w; view.h = BASE.h; }
      else if (z > MAX_ZOOM) { view.w = BASE.w / MAX_ZOOM; view.h = BASE.h / MAX_ZOOM; }
      view.x = Math.max(BASE.x, Math.min(view.x, BASE.x + BASE.w - view.w));
      view.y = Math.max(BASE.y, Math.min(view.y, BASE.y + BASE.h - view.h));
    }

    /* da coordinate schermo a coordinate del viewBox */
    function toView(cx, cy) {
      var r = svg.getBoundingClientRect();
      return { x: view.x + (cx - r.left) / r.width * view.w,
               y: view.y + (cy - r.top) / r.height * view.h };
    }

    /* ingrandisce mantenendo fermo il punto sotto le dita */
    function zoomAt(cx, cy, factor) {
      var p = toView(cx, cy);
      var rx = (p.x - view.x) / view.w, ry = (p.y - view.y) / view.h;
      var w = view.w / factor, h = view.h / factor;
      var z = BASE.w / w;
      if (z < 1) { w = BASE.w; h = BASE.h; }
      else if (z > MAX_ZOOM) { w = BASE.w / MAX_ZOOM; h = BASE.h / MAX_ZOOM; }
      view.x = p.x - rx * w; view.y = p.y - ry * h; view.w = w; view.h = h;
      clampView(); applyView();
    }

    function panBy(dxPx, dyPx) {
      var r = svg.getBoundingClientRect();
      view.x -= dxPx / r.width * view.w;
      view.y -= dyPx / r.height * view.h;
      clampView(); applyView();
    }

    function resetView() {
      view.x = BASE.x; view.y = BASE.y; view.w = BASE.w; view.h = BASE.h;
      applyView();
    }

    /* ---- tooltip ---- */
    var tip = document.getElementById('mapTip');

    function labelFor(code) {
      var geo = WORLD_GEO[code] || POINTS[code];
      if (!geo) return code;
      var lang = root.getAttribute('lang') === 'en' ? 'en' : 'it';
      var dict = I18N[lang];
      var name = geo[lang] || geo.en;
      if (lived[code]) return name + ' · ' + dict['map.tipLived'];
      if (visited[code]) return name + ' · ' + dict['map.tipVisited'];
      return name;
    }

    function showTip(code, ev) {
      if (!tip) return;
      tip.textContent = labelFor(code);
      tip.hidden = false;
      var box = mapEl.getBoundingClientRect();
      var x = ev.clientX - box.left, y = ev.clientY - box.top;
      /* tengo il tooltip dentro i bordi della mappa */
      tip.style.left = Math.max(4, Math.min(x, box.width - tip.offsetWidth - 4)) + 'px';
      tip.style.top = Math.max(4, y - tip.offsetHeight - 12) + 'px';
    }
    function hideTip() { if (tip) tip.hidden = true; }

    /* ---- gesti: pinch per ingrandire, trascinamento, tap per il nome ---- */
    var pts = {};                 /* puntatori attivi, per id */
    var nPts = 0;
    var pinchDist = 0, pinchMid = null;
    var tapFrom = null, tapMoved = false, tapTarget = null;

    function pointerList() {
      var out = [];
      for (var k in pts) if (pts.hasOwnProperty(k)) out.push(pts[k]);
      return out;
    }
    function distance(a, b) {
      return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
    }
    function countryAt(ev) {
      return ev.target && ev.target.closest ? ev.target.closest('.country') : null;
    }

    svg.addEventListener('pointerdown', function (ev) {
      if (!pts[ev.pointerId]) nPts++;
      pts[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
      try { svg.setPointerCapture(ev.pointerId); } catch (e) {}

      if (nPts === 1) {
        tapFrom = { x: ev.clientX, y: ev.clientY };
        tapMoved = false;
        /* Il paese va letto ORA: dopo setPointerCapture gli eventi vengono
           reindirizzati all'SVG e in pointerup ev.target non è più il paese. */
        tapTarget = countryAt(ev);
      } else if (nPts === 2) {
        var a = pointerList();
        pinchDist = distance(a[0], a[1]);
        pinchMid = { x: (a[0].x + a[1].x) / 2, y: (a[0].y + a[1].y) / 2 };
        tapFrom = null; tapTarget = null;   /* due dita non sono mai un tap */
        hideTip();
      }
    });

    svg.addEventListener('pointermove', function (ev) {
      /* Mouse che passa senza premere: è il vecchio hover, mostra il nome. */
      if (!pts[ev.pointerId]) {
        if (ev.pointerType === 'mouse') {
          var hov = countryAt(ev);
          if (hov) showTip(hov.getAttribute('data-code'), ev); else hideTip();
        }
        return;
      }

      var prev = pts[ev.pointerId];
      var dx = ev.clientX - prev.x, dy = ev.clientY - prev.y;
      pts[ev.pointerId] = { x: ev.clientX, y: ev.clientY };

      if (tapFrom && distance(tapFrom, { x: ev.clientX, y: ev.clientY }) > 8) tapMoved = true;

      if (nPts >= 2) {
        var a = pointerList();
        var d = distance(a[0], a[1]);
        var mid = { x: (a[0].x + a[1].x) / 2, y: (a[0].y + a[1].y) / 2 };
        if (pinchDist > 0 && d > 0) zoomAt(mid.x, mid.y, d / pinchDist);
        if (pinchMid) panBy(mid.x - pinchMid.x, mid.y - pinchMid.y);
        pinchDist = d; pinchMid = mid;
        ev.preventDefault();
      } else if (zoomLevel() > 1.01) {
        /* una sola dita/mouse: sposta la mappa, ma solo se è ingrandita */
        panBy(dx, dy);
        hideTip();
        ev.preventDefault();
      }
    });

    function endPointer(ev) {
      var wasTap = tapFrom && !tapMoved && nPts === 1;
      if (pts[ev.pointerId]) { delete pts[ev.pointerId]; nPts = Math.max(0, nPts - 1); }
      try { svg.releasePointerCapture(ev.pointerId); } catch (e) {}
      if (nPts < 2) { pinchDist = 0; pinchMid = null; }

      /* Tap netto su un paese: mostro il nome. Su touch non c'è hover, quindi
         senza questo il tooltip non comparirebbe mai. */
      if (wasTap && ev.type === 'pointerup') {
        if (tapTarget) showTip(tapTarget.getAttribute('data-code'), ev);
        else hideTip();
      }
      if (nPts === 0) { tapFrom = null; tapMoved = false; tapTarget = null; }
    }
    svg.addEventListener('pointerup', endPointer);
    svg.addEventListener('pointercancel', endPointer);

    /* il mouse che esce dalla mappa nasconde il tooltip; il tap no */
    svg.addEventListener('pointerleave', function (ev) {
      if (ev.pointerType === 'mouse') hideTip();
    });
    /* un tocco fuori dalla mappa chiude il tooltip rimasto aperto */
    document.addEventListener('pointerdown', function (ev) {
      if (!mapEl.contains(ev.target)) hideTip();
    });

    if (btnIn) btnIn.addEventListener('click', function () {
      var r = svg.getBoundingClientRect();
      zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1.6);
    });
    if (btnOut) btnOut.addEventListener('click', function () {
      var r = svg.getBoundingClientRect();
      zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1 / 1.6);
    });
    if (btnReset) btnReset.addEventListener('click', function () { resetView(); hideTip(); });

    applyView();

    /* i nomi dei paesi seguono la lingua scelta */
    function relabel() {
      var lang = root.getAttribute('lang') === 'en' ? 'en' : 'it';
      titleEl.textContent = I18N[lang]['map.subhead'];
      paths.forEach(function (p) {
        p.firstChild.textContent = labelFor(p.getAttribute('data-code'));
      });
      hideTip();
    }
    relabel();
    return relabel;
  }

  var relabelMap = buildMap();

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
