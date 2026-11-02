# Jurnal de modificări — ACORDAJ

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
