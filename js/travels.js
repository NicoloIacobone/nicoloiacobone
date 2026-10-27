/* =========================================================
   MAPPA DEI VIAGGI — questo è l'unico file da aggiornare.

   Aggiungi il codice ISO 3166-1 alpha-2 del paese (due lettere maiuscole)
   nella lista giusta, salva, ricarica la pagina. Fine.

     lived   → paesi in cui hai VISSUTO   (arancione sulla mappa)
     visited → paesi che hai VISITATO     (verde sulla mappa)

   Un paese che compare in entrambe le liste viene disegnato come "vissuto":
   non serve toglierlo da "visited".

   Codici utili — Europa:
     AL Albania · AT Austria · BE Belgio · BG Bulgaria · HR Croazia
     CY Cipro · CZ Cechia · DK Danimarca · EE Estonia · FI Finlandia
     FR Francia · DE Germania · GR Grecia · IE Irlanda · IS Islanda
     IT Italia · LV Lettonia · LT Lituania · LU Lussemburgo · MT Malta
     ME Montenegro · NO Norvegia · NL Paesi Bassi · PL Polonia
     PT Portogallo · GB Regno Unito · RO Romania · RS Serbia · SK Slovacchia
     SI Slovenia · ES Spagna · SE Svezia · CH Svizzera · TR Turchia
     UA Ucraina · HU Ungheria
   Fuori Europa:
     AR Argentina · AU Australia · BR Brasile · CA Canada · CN Cina
     EG Egitto · AE Emirati Arabi Uniti · IN India · ID Indonesia
     JP Giappone · JO Giordania · MA Marocco · MX Messico · NZ Nuova Zelanda
     PE Perù · TH Thailandia · TN Tunisia · US Stati Uniti · ZA Sudafrica

   Lista completa dei codici: https://it.wikipedia.org/wiki/ISO_3166-1_alpha-2
   ========================================================= */

window.TRAVELS = {

  /* Paesi in cui hai vissuto */
  lived: [
    'IT',   // Italia — Bari, Torino
    'CH',   // Svizzera — Zurigo, tesi e ricerca all'ETH
    'RO'    // Romania — Cluj-Napoca, Erasmus
  ],

  /* Paesi visitati */
  visited: [
    'AT',   // Austria
    'BG',   // Bulgaria
    'HR',   // Croazia
    'CZ',   // Repubblica Ceca
    'DK',   // Danimarca
    'FR',   // Francia
    'DE',   // Germania
    'VA',   // Città del Vaticano
    'HU',   // Ungheria
    'IE',   // Irlanda
    'IT',   // Italia
    'LU',   // Lussemburgo
    'MT',   // Malta
    'MA',   // Marocco
    'NL',   // Paesi Bassi
    'NO',   // Norvegia
    'PL',   // Polonia
    'PT',   // Portogallo
    'RO',   // Romania
    'SM',   // San Marino
    'SK',   // Slovacchia
    'ES',   // Spagna
    'SE',   // Svezia
    'CH',   // Svizzera
    'GB'    // Regno Unito
  ]

};
