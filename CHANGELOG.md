# Jurnal de modificări — ACORDAJ

## 3.1.3 — 2026-11-19

- Ortografie: „Curăţarea Aurei” (cu sedilă) → „Curățarea Aurei” (cu virgulă dedesubt) în numele „Aura Sweep Attunement (Curățarea Aurei)” din atlas și în pachetul de chei de traducere; căutarea și traducerile nu depind de variantă (cheile de căutare sunt normalizate), iar favoritele/bifările sunt indexate după poziție, deci nu se pierd
- Pachetele de limbă `i18n/*.js` poartă acum versiunea aplicației și se re-ștampilează singure la fiecare release (`fff.config.json` → `versionFiles`), ca ridicarea versiunii să nu le mai invalideze

## 3.1.2 — 2026-11-17

- Compatibilitate cu browsere mai vechi (Chrome/Edge 55+, Firefox 52+, Safari 10.1+/iOS 10.3+): kitul 1.8.0 aduce stratul de compatibilitate (rezerve pentru API-urile care lipsesc în motoarele vechi), iar sintaxa JavaScript mai nouă decât ES2017 a fost înlocuită cu forme echivalente acolo unde exista; expresiile regulate noi și `import()` trec prin rezerve. Fără modificări de funcționalitate intenționate. Verificat cu parser ES2017 și într-un motor vechi simulat, nu pe dispozitive reale.
- Corectat: pachetele de limbă din `i18n/` purtau build-ul 3.0.9, iar pagina le respinge dacă build-ul nu coincide cu al ei, așa că la schimbarea limbii interfața rămânea în română (defecțiune prezentă și în 3.1.0 și 3.1.1). Pachetele au fost re-ștampilate cu build-ul paginii; testele de traducere (`lazy`, `r10-audit`) trec din nou.
- Corectat: suma de integritate încorporată (`EMBED_SHA`) nu mai corespundea scriptului principal; a fost recalculată, iar autotestul din panoul de diagnostic trece din nou.

## 3.1.1 — 2026-11-15

- Nou: butoane de distribuire pe rețele sociale (vertical, pe marginea din stânga; fără scripturi externe, doar linkuri deschise la clic); bara de zoom cu lupă și „potrivire ecran” revine pe marginea din dreapta, centrată pe verticală; corectat afișarea suprapusă la zoom mare (panourile cu înălțimi în vh/vw nu mai ies din ecran).

## 3.1.0 — 2026-11-15

- Nou: accesibilitate pe toate ecranele — butonul „Aa” (mărimea textului, contrast ridicat, fără animații, text lizibil, linkuri subliniate, citire cu voce), săgeata „Înapoi sus” și „Sari la conținut”; fereastra se potrivește mereu ecranului; zoom-ul cu lupă și „potrivire ecran” stau acum pe marginea din stânga (fff-kit 1.6.0).

## 3.0.9 — 2026-11-15

- Nou: texturi fractale hiper-detaliate (fff-texturi 1.1.2) — fundalul și suprafețele mari (carduri, panouri, antete, butoane; filele și dialogurile ascunse la încărcare, când se deschid) primesc un material generat local (WebGL2, fără rețea și fără imagini), care se repetă fără cusătură; culorile aplicației rămân ale ei. Se oprește din dialogul „Transparență” sau cu `?notex=1`.

## 3.0.1 — 2026-11-02 (reîmprospătare kit)

- Nou (kit): **Sincronizare între dispozitive** (`FFF.sync`) — în dialogul «Transparență» (clic pe versiune → Copie de siguranță): conectezi două dispozitive direct (WebRTC, cod/QR, fără server și fără cont) și își schimbă datele aplicației; cea mai recentă valoare câștigă, secretele (chei API, parole) nu se trimit, ștergerile nu se propagă. Aplicarea trece prin importul kitului (confirmare, chei permise, rollback).
- Nou (kit): **Istoric local — «mașina timpului»** (`FFF.history`) — instantanee automate ale datelor (IndexedDB, fără secrete), diferență față de starea curentă și restaurare reversibilă; «Șterge datele aplicației» șterge și istoricul.
- Module adăugate: `qr`, `p2p`, `sync`, `history` (+~140 KB). Versiunea aplicației nu se schimbă.

## 3.0.1 — 2026-10-27 (anterior: 2.0.0)

Doar texte, fără funcții noi.

- Verificare linkuri (2 noiembrie 2026, eșantion de ~37 din 482 de URL-uri unice, 28 confirmate, restul neconcludente; shell fără rețea, verificare prin WebFetch/WebSearch): 3 linkuri mutate au fost actualizate la adresa nouă a aceleiași pagini — NHS (SAD, `/mental-health/conditions/...`), Britannica «Samson» (`/biography/Samson`, în loc de `/EBchecked/topic/520746/`) și Human Givens Institute «Rewind technique» (`/discover/mental-health/the-rewind-detraumatisation-technique/`). Niciun link nu a fost șters; restul eșantionului s-a deschis sau apare în rezultatele de căutare la aceeași adresă.

- Bandă vizibilă sub antet (ro + en): lista celor 1134 de titluri este preluată de pe cursurispirituale.webnode.ro; „acordul autorului nu a fost confirmat — de clarificat”; aplicația este neafiliată cu site-ul sursă.
- README: „Stare” și „Offline” (8 limbi) și secțiunea despre proveniența listei.

Nu implementat:

- Retragerea sau eliminarea listei: NU s-a făcut (regulă: nu se retrage nimic); decizia și clarificarea acordului aparțin autorului.
- Discernământ critic: secțiunea există deja în aplicație (fila „Discernământ”); nu s-a modificat.

Istoricul anterior (1.x–2.0.0) este în secțiunea „History” din README.md.
