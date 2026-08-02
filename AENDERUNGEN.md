# Änderungs- & Prüfprotokoll — finanzritual
_Erstellt: 20.07.2026 · Umfang: 104 HTML-Dateien, script.js, style.css_

---

## 1. Navigations-Beschriftungen (Menü DE/EN)

| Vorher | Nachher | Betroffen |
|---|---|---|
| Rechner-Icon + `RECHNER` / `CALCULATORS` | Icon + **`CALC`** | 104 Dateien |
| `ZERO TO HERO` | **`ZERO_TO_HERO`** | 104 Dateien |

Die `data-en`-Übersetzungsattribute wurden identisch angepasst (Umschaltung DE↔EN bleibt konsistent).

---

## 2. Prozent-Angaben vereinheitlicht — 686 Stellen in 48 Dateien

**Regel:** `xx,x%` — Dezimal-**Komma** statt Punkt, kein Leerzeichen, und ein unsichtbarer **Word-Joiner (U+2060)** zwischen Zahl und `%`. Dadurch kann das `%`-Zeichen **nicht mehr allein umgebrochen** werden.

Beispiele der Transformation:

| Vorher | Nachher (sichtbar) | technisch |
|---|---|---|
| `26.375%` | 26,375% | `26,375`+U+2060+`%` |
| `65 %` (umbrechbar) | 65% | `65`+U+2060+`%` |
| `50%` | 50% | `50`+U+2060+`%` |

> **Nicht angetastet:** `%` in `style="width:50%"`, in CSS und in `<script>` — nur echter Fließtext und `data-en`-Texte wurden geändert (verifiziert).

<details><summary>Pro Datei (Anzahl geänderter Prozent-Stellen)</summary>

| Datei | Anzahl |
|---|---:|
| beitrag-verlust-gewinn-paradox.html | 92 |
| beitrag-vier-prozent-regel.html | 46 |
| beitrag-einstandsrendite-yield-on-cost.html | 36 |
| beitrag-etf-watchlist-dividenden.html | 33 |
| beitrag-rendite-risiko.html | 33 |
| beitrag-depot-performance-6-jahre.html | 29 |
| beitrag-performance-uhren-cockpit.html | 28 |
| beitrag-minimalismus-budget.html | 27 |
| beitrag-kapitalertragsteuer-erklaert.html | 25 |
| beitrag-scheinvermoegen-fuenf-fallen.html | 24 |
| beitrag-ohne-aktien.html | 23 |
| beitrag-50-30-20-regel.html | 21 |
| beitrag-erste-100k.html | 21 |
| beitrag-reit-etf-vs-immobilie.html | 21 |
| beitrag-zeit-ist-dein-freund.html | 20 |
| beitrag-etf-sparplan.html | 18 |
| beitrag-meilensteine.html | 14 |
| beitrag-reits-vs-immobilien.html | 14 |
| beitrag-girokonto-vergleich.html | 13 |
| beitrag-muenzen-kostenlos-tauschen.html | 12 |
| beitrag-schulden.html | 12 |
| beitrag-kreditvergleich.html | 11 |
| beitrag-neobroker-etf-vergleich.html | 10 |
| beitrag-anlage-kap.html | 8 |
| beitrag-dividendenkalender-selbst-bauen.html | 8 |
| beitrag-etf-oder-einzelaktie.html | 8 |
| beitrag-second-hand-nachhaltigkeit.html | 8 |
| beitrag-sparrate-vs-rendite.html | 8 |
| beitrag-fire-mit-40.html | 6 |
| beitrag-kleine-ersparnisse.html | 5 |
| rechner-zinseszins.html | 5 |
| beitrag-freibetrag.html | 4 |
| beitrag-sechs-schritte-zum-ziel.html | 4 |
| beitrag-startschuss-dividendenstrategie.html | 4 |
| beitrag-top-marktkapitalisierung.html | 4 |
| kat-vergleich.html | 4 |
| rechner-entnahme.html | 4 |
| von-zero-zum-hero.html | 4 |
| beitrag-junior-depot-freibetraege.html | 3 |
| rechner-fire.html | 3 |
| beitrag-buch-reichste-mann-von-babylon.html | 2 |
| beitrag-buch-simple-path-to-wealth.html | 2 |
| beitrag-minimalismus-vermoegensaufbau.html | 2 |
| beitrag-notgroschen.html | 2 |
| rechner-dividenden.html | 2 |
| beitrag-singlehaushalt-budget-challenge.html | 1 |
| index.html | 1 |
| rechner-inflation.html | 1 |

</details>

---

## 3. Textkorrekturen (Rechtschreibung/Grammatik)

| Datei | Vorher | Nachher | Grund |
|---|---|---|---|
| beitrag-buch-optionen-unschlagbar-handeln.html | „die **die** Optionsvokabular…" | „die **das** Optionsvokabular…" | _Vokabular_ ist Neutrum (das) |

---

## 4. Geprüft, aber bewusst NICHT geändert

- **`&shy;` in „Ausschüttungs&shy;rhythmus"** (beitrag-reits-vs-immobilien.html): gewollte Silbentrennungs-Hilfe für das lange Kompositum — korrekt, bleibt.
- **`»Handbuch«` (Guillemets)**: gültige deutsche Zitatzeichen, stilistisch gewollt — bleibt.
- **Emojis, `·`, `✦`, `☰`, `©`, `☕`**: gestalterische Icons/Trenner, keine Fehler.
- **Platzhalter in Impressum & Datenschutz** (`[Vor- und Nachname]`, `[Hosting-Anbieter einfügen]`, `[Zahlungsanbieter einfügen]` …): rechtliches Gerüst. **Diese müssen vor dem Livegang manuell ausgefüllt werden** — ich erfinde hier keine personenbezogenen Daten. Siehe Punkt 5.
- **Affiliate-„Platzhalter-Links"** (girokonto-vergleich.html): laut Text absichtlich, bis echte Affiliate-Links vorliegen.

---

## 5. Struktur- & Sicherheits-Audit

### Sauber ✓
- Keine kaputten internen Links, keine toten Anker (`#id`), keine doppelten IDs.
- Alle `<img>` haben `alt`-Attribute.
- Keine `target="_blank"` ohne `rel="noopener"`.
- **Keine** hartkodierten Passwörter, API-Keys oder Secrets in `script.js` / Python-Skripten.
- **Kein Tracking**: Der frühere Drittanbieter-Zähler (countapi.xyz, übertrug Besucher-IPs) wurde bereits entfernt; der Zähler läuft rein lokal.
- Externe Ressourcen ausschließlich über **HTTPS** (Buchcover: covers.openlibrary.org, books.google.com; eigene Domain).
- `localStorage` speichert nur 4 UI-Präferenzen (`fr-lang`, `fr-theme`, `fr-fontscale`, `fr-viewmode`) + lokaler Zähler — **keine personenbezogenen Daten**, DSGVO-freundlich.

### Empfehlungen (nicht automatisch geändert — bitte entscheiden)

1. **VIP-Formular (vip.html) — Passwortfeld ohne Backend.** Das Formular hat `onsubmit="return false"`, überträgt also nichts (kein Datenleck), sammelt aber ein `type="password"`. Empfehlung: `autocomplete="new-password"` setzen (verhindert, dass Browser ein funktionsloses Passwort speichern) — oder das Feld entfernen, solange kein echter Login existiert. **Wichtig:** Ein client-seitiger Passwortabgleich im JS wäre unsicher; hier ist keiner vorhanden (gut).
2. **Newsletter-Felder (index.html)** sind ebenfalls funktionslos (`return false`). Vor Livegang an einen DSGVO-konformen Dienst anbinden oder deaktivieren, damit Nutzer nicht ins Leere eintragen.
3. **21× Inline-`onerror="this.style.display='none'"`** auf Buchcovern: harmlos (blendet fehlende Cover aus), verhindert aber eine strenge Content-Security-Policy. Optional in `script.js` auslagern, falls CSP gewünscht.
4. **Rechtliche Pflichtangaben:** Impressum & Datenschutz enthalten offene `[…]`-Platzhalter (Name, Anschrift, Hosting-Anbieter, Zahlungsanbieter). In Deutschland **rechtlich verpflichtend** vor Veröffentlichung auszufüllen.

---

# Verlauf ab V101 (Chat-Session, ab 26.07.2026)

_Hinweis: Ab hier eine durchgehende Historie statt einer Datei pro Version —
vorher wurde AENDERUNGEN-V10x.md bei jeder neuen Runde durch die nächste
ersetzt, das hat die Zwischenstände gelöscht. Ab V107 wird diese Datei nur
noch ergänzt, nicht mehr ersetzt._

## V101 — Sitemap- und Affiliate-Fix
- 7 fehlende Content-Seiten in sitemap.xml ergänzt (jetzt 133 URLs,
  deckungsgleich mit allen echten Content-Seiten). beitrag-wochensparchallenge.html
  bewusst ausgenommen (reiner Redirect-Stub).
- Neues Script affiliate-add-tag.py ersetzt affiliate-replace.py, das an
  nicht mehr existierenden href="#"-Platzhaltern vorbeizielte.

## V102 — Sterne-Bewertungs-Widget (Entwurf)
- CSS-Block .fr-rating für Sterne + Zitat + Subkriterien, passend zum
  bestehenden Design-System (nur vorhandene --Variablen).
- Referenz-Einbau in beitrag-buch-rich-dad-poor-dad.html.

## V103 — Erstes Gesamtprojekt-Export
- Ab hier: komplettes Projekt statt Teil-Paketen pro Zip, auf Wunsch des Nutzers.

## V104 — Button-Platzierung + Cover-Download-Vorbereitung
- Amazon-Button in die Rating-Box (oben rechts) integriert, redundanten
  dritten Kauf-Button entfernt (2 statt 3 pro Artikel).
- covers-download.py gebaut (Download selbst nicht in der Sandbox möglich,
  kein Netzwerkzugriff dort).

## V105 — Buchcover lokal
- Alle 28 Cover lokal in img/covers/ (18 vom Nutzer per covers.zip
  nachgereicht, da Sandbox kein Internet hat).
- og:image-Tags (Social-Media-Vorschau) ebenfalls auf lokale Pfade
  umgestellt — hingen vorher noch extern, unabhängig vom sichtbaren Cover.

## V106 — Sterne-Bewertung auf allen 28 Buchartikeln
- Rollout-Script (rollout-sterne-bewertung.py) mit Bewertungsdaten für die
  restlichen 27 Bücher, abgeleitet aus den bestehenden Absätzen "Für wen" /
  "Ehrliche Einschätzung" — keine externe Recherche.
- 4 unterschiedliche Subkriterien-Sets je nach Buchtyp statt eines
  einheitlichen Schemas.

## V107 — Cover in Listenansicht + Cover verlinkt zu Amazon
- Listenansicht zeigt jetzt auch Cover (vorher nur Text).
- Cover ist in Karten- UND Listenansicht ein eigener Link zu Amazon,
  Rest der Karte/Zeile bleibt Link zum Artikel. Nur bei Büchern, alle
  anderen Kategorien unverändert (verifiziert).
- script.js: 18 dort noch extern verlinkte Cover-Pfade im POSTS-Array
  ebenfalls lokalisiert (gleicher Fund wie og:image in V105, hier aber in
  der gemeinsamen Datenquelle für Karten-/Listenansicht).

## Aufräumen (diese Runde)
- scratch_body.py / scratch_body2.py / scratch_body3.py entfernt
  (Entwickler-Reste im Projekt-Root, referenzierten /tmp/-Pfade — hätten
  bei einem Deploy live mitgelegen).
- _einrichtung/affiliate-replace.py.ALT und die zugehörige
  .VERALTET_README.txt entfernt (Korrektur ist bereits in LIES_MICH.md
  dokumentiert, das Script selbst wurde nicht mehr gebraucht).
- Diese Datei (vorher AENDERUNGEN.md + separate AENDERUNGEN-V10x.md)
  zu einer durchgehenden Historie zusammengeführt.

## V109 — Neuer Artikel: Depot nach Alter und Risikoklasse
- Neuer Beitrag beitrag-depot-alter-risikoklasse.html, basierend auf einem
  vom Nutzer diktierten Themenumriss (World-ETF-Einstieg, 80/20 World/EM,
  Kern-Satellit-Anleihen-Modell nach Alter, alternative Aufteilungen,
  Cash-Variante, Rebalancing) plus Recherche zur Anleihen-Sicherheitsmarge.
- Recherchierter Abschnitt zu 2022: US-Aktien ≈ -19%, breiter Anleihenindex
  ≈ -13%, gleichzeitig gefallen; laut 150-Jahre-Auswertung von Morningstar
  das einzige Jahr ohne Diversifikationseffekt der Anleihen. Zusätzlich
  Bezug zum April-2026-Zollschock als Wiederholung desselben Musters.
  Zahlen aus mehreren unabhängigen Quellen (Morningstar, LSEG, CNBC,
  Forbes/Resonanz Capital) gegengeprüft.
- Interaktives Risiko-Fragespiel (3 Fragen, reines Vanilla-JS, kein Backend)
  zur groben Selbsteinschätzung — Score-Grenzwerte in Node isoliert getestet.
- Vollständig ins System eingebunden: sitemap.xml, script.js (FR_POSTS),
  docs/posts.txt, VG-Wort-CSV, Cross-Links in beitrag-etf-sparplan-fuer-
  anfaenger.html und von-zero-zum-hero.html (Schritt 6 "Rebalancing" hatte
  vorher gar keinen vertiefenden Artikel-Link).

## Sicherheitsfund: tools/scripts/posts_sync.py war ein Risiko
- Das Script schreibt posts.txt → FR_POSTS-Block in script.js komplett neu.
  Es kennt aber nur title/cat/date/excerpt/tags/link — nicht titleEn,
  excerptEn, subcat, cover, buyUrl, die inzwischen für Sprachumschaltung,
  Kategorie-Filter und die Buch-Cover/Amazon-Buttons gebraucht werden.
  Ein normaler Lauf hätte diese Felder für ALLE Beiträge still gelöscht.
  War schon vor dieser Chat-Session so (nicht durch die Zusammenarbeit
  verursacht), ist aber nie aufgefallen, weil das Script nie lief.
- Fix: Sicherheitssperre eingebaut — das Script bricht jetzt ab, wenn der
  bestehende Block eines dieser Felder enthält, statt sie stillschweigend
  zu überschreiben. Getestet: Sperre greift zuverlässig (Exit-Code 2).
  Umgehbar nur explizit mit --force (nicht empfohlen, bis das Script
  erweitert ist).
- docs/posts.txt entsprechend mit Warnhinweis versehen: aktuell NICHT die
  vollständige Quelle der Wahrheit, neue Einträge bis auf Weiteres
  zusätzlich direkt in script.js eintragen.

## V110 — posts_sync.py repariert statt gelöscht
Kurz nachgefragt, ob posts_sync.py nicht einfach gelöscht werden sollte.
Genauer hingesehen: docs/BETRIEB.txt dokumentiert das Script explizit als
vorgesehenen Workflow ("DU BEARBEITEST NUR EINE DATEI: docs/posts.txt") —
Löschen hätte eine dokumentierte, beabsichtigte Funktion gekappt. Stattdessen
repariert:

- parsen() + js_block_bauen() unterstützen jetzt titleEn, excerptEn, subcat,
  cover, buyUrl als optionale Felder (vorher nur title/cat/date/excerpt/
  tags/link). "Bücher" als cat ergänzt (fehlte komplett).
- Zweite, wichtigere Sicherheitssperre ergänzt: posts.txt enthielt beim
  Testen nur 19 von 94 Beiträgen in script.js — ein normaler Lauf hätte
  ~75 Beiträge gelöscht (u.a. alle 28 Buchkritiken), unabhängig vom
  Feld-Problem. Das Script bricht jetzt ab und listet genau auf, welche
  Beiträge fehlen würden, statt sie zu löschen.
- Erste Sperre (unbekannte Felder) hatte einen Bug: eine Regex erkannte
  fälschlich "Depot" als Feldnamen, weil ein bestehender Artikeltitel
  zufällig ", Depot: Warum…" enthält. Beim Testen aufgefallen und
  gefixt (Doppelpunkt muss jetzt direkt von " oder [ gefolgt sein).
- Beide Sperren mit echten Testläufen (Kopie, --force, danach wieder
  gelöscht) verifiziert: Feld-Rundlauf korrekt (subcat/titleEn bleiben
  erhalten, wenn in posts.txt vorhanden), Node-Syntax des Ergebnisses OK.
- docs/posts.txt und docs/BETRIEB.txt entsprechend aktualisiert.

**Weiterhin offen:** posts.txt enthält nach wie vor nur 19 von 94 Beiträgen.
Das Script funktioniert jetzt korrekt und sicher, aber ein normaler Lauf
bricht ab, bis entweder die fehlenden ~75 Einträge (v.a. alle Buchkritiken)
nachgetragen werden, oder posts.txt bewusst nur noch für neue Beiträge
zusätzlich zur direkten script.js-Pflege verwendet wird.

## V111 — posts_sync.py doch entfernt
Nach V110 (Reparatur) nochmal nachgefragt und zu Recht: Das Projekt ist
work in progress, und der tatsächliche Workflow dieser Session war nie
"posts.txt bearbeiten" — sondern script.js direkt. Ein zweiter, parallel
zu pflegender Datenpfad bei einem sich schnell verändernden Datenmodell
ist in dieser Phase mehr Wartungsaufwand als Nutzen, unabhängig davon,
dass er jetzt technisch korrekt funktioniert hätte.

Entfernt: tools/scripts/posts_sync.py, docs/posts.txt, tools/backups/
(leerer Testordner). docs/BETRIEB.txt Abschnitt 3 neu geschrieben — jetzt
dokumentiert der tatsächliche Workflow (FR_POSTS direkt in script.js
bearbeiten, inkl. Feldliste). Verweise in docs/GITHUB-HOSTING.txt und der
Ordnerbaum-Übersicht korrigiert.

Rückholbar: die reparierte Version liegt vollständig in Finanzritual_V110.

## V112 — Erster Retrofit: beitrag-in-dich-selbst-investieren.html
Erster Artikel aus der 29er-Liste (komplett ohne visuellen Break)
exemplarisch aufgelockert, als Vorlage für die restlichen 28.

- Neue globale Komponente: .pull-quote (Akzentbalken + große Space-Grotesk-
  Zeile für einzelne starke Sätze — vorher gab es dafür nichts Passendes,
  die alloc-bar/research-Muster passen nur zu Zahlen, nicht zu Prosa).
- info-box und tip-box waren bisher nur lokal in EINER Datei definiert
  (beitrag-etf-sparplan-fuer-anfaenger.html) — jetzt global in style.css,
  damit sie ohne Duplizieren in weiteren Artikeln nutzbar sind.
- Im Artikel: 1 neuer Opener-Satz, 4 Pull-Quotes (Frage-Umkehr, Steinmetz-
  Punchline, "Fehler informiert", Schluss-Einzeiler), 1 Tipp-Box
  (Meilenstein-Regel), 1 Info-Box (10x-Logik), 2 gestraffte Einstiegssätze.
  Kein neues Bild-Material, bewusst — Stock-Fotos hätten die eigene,
  unterscheidbare Optik verwässert statt sie zu stärken.
- Ergebnis: 0 -> 8 visuelle Elemente auf ~1.950 Wörter (vorher keine
  einzige Box/Grafik im gesamten Artikel).
- Verifiziert: Tag-Balance sauber, CSS-Klammern sauber.

Restliche 28 Artikel aus der Liste stehen noch aus.

## V113 — Korrektur der Retrofit-Liste + zwei weitere Artikel
Beim Weiterarbeiten an der 28er-Liste aus V112 aufgefallen: Der ursprüngliche
Scan hat nur nach einer engen Klassen-Liste gesucht (info-box/tip-box/
research-box/rq-box/pull-quote/svg/table) und dabei übersehen, dass fast
jeder Artikel bereits eigene, seitenspezifische Rechner, Vergleichskarten
oder Stat-Boxen hat — mit jeweils eigenem Klassen-Präfix (sv-, ea-, ss-,
ds-, mz-, kap-, sh-, gb-, jd-, yc-, ee-, cb-, ab-, eg-, ke-, ms-, ff-,
uvm.), die kein generisches Muster zuverlässig erkennt.

Beim manuellen Nachprüfen: von 27 vermeintlichen Kandidaten hatten 24
bereits echte visuelle/interaktive Elemente. Nur 2 waren tatsächlich leer:

- beitrag-fire-mit-40.html (334 Wörter) — Stat-Box fürs Zielvermögen-
  Beispiel (600.000 €), Pull-Quote für "Der wichtigste Hebel liegt in
  den eigenen Händen."
- beitrag-freibetrag.html (309 Wörter) — Stat-Box für die jährliche
  Steuerersparnis (263,75 €), Pull-Quote für die Umweg-Zeile.

Damit sind jetzt 3 von 67 Finanzen-Artikeln ohne visuellen Break
(vorher fälschlich als 29 gemeldet), plus der bereits fertige
beitrag-in-dich-selbst-investieren.html aus V112. Verbleibend:
beitrag-scheinvormoegen-fuenf-fallen.html hat sich beim Prüfen ebenfalls
als bereits visuell (sv-ladder mit 5 Stufen) herausgestellt — die
Ursprungsliste ist damit vollständig abgearbeitet.

## V114 — Logo-Entwürfe: Korrektur + neue Variante + Feedback-Kanal + Tech-Gerüst
Wichtige Korrektur zur gestrigen "sollte raus"-Einschätzung der beiden
Logo-Entwurfsseiten: Beim genauen Nachsehen stellte sich heraus, dass sie
bereits sauber unter Technik einsortiert sind (Breadcrumb "Technik", Eyebrow
"Demo-Entwurf"), nicht in script.js/FR_POSTS auftauchen (also nicht die
normale Artikelliste verwässern) und bereits explizit zu Feedback einladen.
Meine gestrige Einschätzung war zu vorschnell — Kontext vor Inhalt prüfen.

- Neu: logos/logo-compact-2line.svg — gestapelte Zweizeiler-Version des
  bestehenden Kompakt-Logos ("FINANZ-" / "RITUA" + die bestehende blau-grüne
  L-Marke bildet das L von RITUAL). Per SVG textLength exakt gleich breite
  Zeilen, kein Schätzen von Schriftbreiten. Als "Variante 3" in
  beitrag-logo-kastenschrift.html ergänzt, Einleitungstext und Dateiliste
  entsprechend angepasst.
- Konkreter Feedback-Kanal ergänzt: Beide Entwurfsseiten hatten nur eine
  vage "Rückmeldung willkommen"-Formulierung ohne echten Weg dahin. Jetzt
  ein Mailto-Button zur bereits im Impressum stehenden Adresse
  (finanz-ritual@gmx.de), mit vorausgefülltem Betreff je Entwurf.
- kat-technik.html: Abschnitt "Apps & Tools, die ich tatsächlich nutze"
  ergänzt — 4 Platzhalter-Karten (Broker/Depot-App, Budget-App, Tagesgeld,
  Sonstiges), klar als TODO markiert. Die Seite hatte das schon in der
  Beschreibung versprochen ("nur was ich selbst nutze"), aber keine
  tatsächliche Liste. Echte App-Namen kann nur der Nutzer selbst eintragen.
- cv-cat-card/cv-cat-soon (bisher nur lokal in kat-vergleich.html) global
  in style.css verschoben, für die Wiederverwendung in kat-technik.html.

## Offen — braucht Nutzer-Input
- Echte Namen für die 4 App/Tool-Platzhalter in kat-technik.html
- Ob Variante 3 des Logos weiterverfolgt wird oder eine der anderen

## V115 — Logo Variante 3 korrigiert
Ursprüngliche Variante 3 hatte die L-Marke falsch verstanden — sie saß nur
in Höhe der zweiten Zeile (RITUA), statt über beide Zeilen zu reichen.
Korrektur: logo-compact-2line-v2.svg — der senkrechte Strich beginnt oben
auf Höhe von "FINANZ-", läuft die volle Höhe beider Zeilen hinunter und
knickt erst unten bei "RITUA" nach rechts ab. Grüne Wachstumslinie
entsprechend mitgestreckt.

Beide Versionen bleiben sichtbar (3a = erster Versuch, 3b = korrigiert) —
zeigt die Design-Iteration nachvollziehbar, statt den ersten Versuch
kommentarlos zu ersetzen. Tag-Balance nach eigenem Tippfehler beim
Einfügen nochmal geprüft (Encoding-Fehler in einem <strong>-Tag gefunden
und korrigiert).

## V116 — Logo 3c: Feinjustierung (festgehalten, wird ggf. von Hand finalisiert)
Auf Wunsch drei Anpassungen: engerer Zeilenabstand (FINANZ-/RITUA rücken
zusammen), Bindestrich berührt jetzt das L, RITUA nicht mehr per textLength
gestreckt sondern per text-anchor="end" natürlich rechtsbündig.
logo-compact-2line-v3.svg, als Variante 3c in beitrag-logo-kastenschrift.html
dokumentiert. Festgehalten für den Fall, dass die manuelle finale Version
darauf aufbaut oder verglichen werden soll.

## V117 — Finanz-Quartett: neues Spiel, 30 Unternehmen
Neue Seite quartett-finanzbildung.html — Kartenspiel-Konzept vom Nutzer
(Auto-Quartett aus der Kindheit, hier mit Finanzkennzahlen), als
interaktive Pass-and-Play-Version für zwei Personen auf einem Bildschirm.

- 30 real existierende Unternehmen recherchiert (Marktkapitalisierung,
  Jahresumsatz, Mitarbeiterzahl, Gründungsjahr, Dividendenrendite) —
  gerundete Näherungswerte, Stand ca. Juli 2026, klar als solche
  gekennzeichnet (Marktkap. bewegt sich täglich).
- Wichtiger Design-Punkt vorab geklärt: KGV bewusst NICHT als Kategorie
  aufgenommen, weil "höhere Zahl gewinnt" bei KGV die falsche Lektion
  lehren würde (niedriges KGV ist in der Value-Logik eher "besser").
  Gründungsjahr läuft stattdessen bewusst umgekehrt (kleinere/ältere Zahl
  gewinnt) — mit einer erklärenden Info-Box direkt daneben, warum das so ist.
- Pass-and-Play-Mechanik: aktueller Spieler sieht nur die eigene Karte,
  wählt eine Kategorie, beide Karten werden aufgedeckt, höherer (bzw. bei
  Gründungsjahr: niedrigerer) Wert gewinnt beide Karten. Unentschieden
  wandert in einen Pott, der beim nächsten entschiedenen Duell mit
  übergeben wird (klassische Quartett-Regel).
- Getestet: Spiellogik in Node mit DOM-Stub simuliert (mehrere hundert
  automatisierte Runden), Kartenerhalt (immer 30 im Umlauf) durchgehend
  bestätigt, kein Kartenverlust, Kategorien erneuern sich korrekt pro Runde.
- Eingebunden: sitemap.xml, prominenter Link + Kurzbeschreibung in
  kat-technik.html.
- disclaimer-box: ausdrücklich keine Kauf-/Anlageempfehlung, weder durch
  Aufnahme noch durch Nichtaufnahme einer Firma.

## Nebenfund behoben
beitrag-depot-alter-risikoklasse.html hatte noch die hreflang-Links der
Kopiervorlage (beitrag-rendite-risiko.html) von V109 — korrigiert.

## V118 — Quartett: KGV ergänzt, Pfeil-Indikatoren, Motivation-Verlinkung
- KGV (Kurs-Gewinn-Verhältnis) als 6. Kategorie ergänzt, "niedriger gewinnt"
  — recherchierte Näherungswerte (Magnificent-7-Werte aktuell recherchiert,
  Rest branchentypisch geschätzt: Autobauer niedrig, Software/Luxus höher).
- Visuelle Richtungsanzeige: ▲/▼-Pfeil neben jedem Wert auf der Karte,
  roter Rand am Kategorie-Button bei "niedriger gewinnt"-Kategorien
  (Gründungsjahr, KGV) — Text-Hinweis bleibt zusätzlich zur Pfeil-Farbe
  bestehen, damit die Markierung nicht nur über Farbe funktioniert.
- Zusätzliche Verlinkung von kat-minimalismus-motivation.html aus (auf
  Wunsch — passt als spielerischer Inhalt eher zu Motivation als nur zu
  Technik). Technik-Verlinkung bleibt zusätzlich bestehen.
- Mehrspieler über zwei Geräte: als Diskussion behandelt, nicht umgesetzt.
  Drei Optionen durchgesprochen (Zug-per-Link ohne Backend, WebRTC mit
  kleinem Signaling-Server, Managed-Backend wie Firebase) — Empfehlung:
  bei Bedarf mit der Link-Variante anfangen, bricht nicht mit der
  bisherigen Kein-Backend-Architektur der Seite.

## Bug gefunden und behoben (vom Nutzer entdeckt)
Gründungsjahr wurde mit deutschem Tausenderpunkt formatiert (z.B. "1.994"
statt "1994"), weil Jahr und Mitarbeiterzahl versehentlich dieselbe
Zahlenformatierung durchliefen. In Karten-Anzeige und Kategorie-Button
korrigiert, Datentabelle war bereits korrekt. Mit Node-Test verifiziert.

## V119 — Quartett: Vollbild-Button, kompaktere Tabelle
- Vollbild-Button ergänzt (Fullscreen API) — blendet Browser-Adressleiste
  und -Tabs aus, bleibt technisch im Browser (kein eigenständiges
  Programm), sieht aber wie eine eigene App aus. Fällt auf einen
  deaktivierten Hinweis-Button zurück, wo die API nicht unterstützt wird
  (u.a. iOS Safari).
- Datentabelle gestrafft: eigene, kürzere Spalten-Labels statt der langen
  Spiel-Kategorie-Namen, mit erzwungenem Zeilenumbruch bei den
  zusammengesetzten Wörtern ("Markt-/kapitalisierung",
  "Gründungs-/jahr") — genau da lag das Problem, zusammengesetzte
  deutsche Wörter haben keine Leerstelle zum natürlichen Umbrechen.
  table-layout:fixed sorgt für gleichmäßige Spaltenbreiten, kein
  horizontales Scrollen mehr nötig.

## V120 — Vollbild-Button global auf allen 138 Seiten
Auf Wunsch: kein PWA-Umbau (zu groß, betrifft jede Seite grundlegend),
stattdessen ein Vollbild-Button pro Seite, User entscheidet pro Besuch
selbst — genau wie beim Quartett, jetzt aber überall im Header.

- Neuer Button neben Hell/Dunkel- und Kontrast-Umschalter im Header,
  identisches Icon-Button-Muster (Kreis, 34px, gleiches Hover-/Active-
  Verhalten). Eigenes SVG-Icon (vier Eck-Klammern, klassisches
  Vollbild-Symbol).
- JS-Logik einmal zentral in script.js ergänzt (nicht pro Seite dupliziert)
  — Fullscreen-API auf <html>, blendet sich auf Browsern ohne Unterstützung
  (v.a. iOS Safari) automatisch komplett aus, statt einen wirkungslosen
  Button zu zeigen.
- Einbau: Python-Script hat den identischen Kontrast-Button-Anker in allen
  138 Seiten gefunden und den neuen Button direkt danach eingefügt —
  einzige Ausnahme beitrag-wochensparchallenge.html (reiner
  Redirect-Stub ohne Header, korrekt übersprungen).
- Verifiziert: alle 138 Seiten haben genau 1 Button, HTML-Tag-Balance
  global geprüft, script.js- und style.css-Syntax sauber.

Bewusste Einschränkung, wie besprochen: Vollbild gilt nur für die
aktuelle Seite und wird bei jedem Seitenwechsel automatisch verlassen
(Browser-Sicherheitsvorgabe) — kein Bug, sondern die bewusst gewählte
Alternative zur PWA-Lösung.

## V121 — Quartett endgültig unter Motivation umgehängt
Breadcrumb, Eyebrow und Rück-Link in quartett-finanzbildung.html von
Technik auf Motivation umgestellt (Lebensstil > Motivation > Finanz-
Quartett). Eigene Feature-Sektion in kat-technik.html entfernt, dort nur
noch ein schlanker Einzeiler-Verweis übrig ("Auch spielbar: ... Zuhause
unter Motivation, nicht hier"). Verlinkung von kat-minimalismus-motivation.html
aus (aus V118) bleibt als primäre Heimat bestehen.

## V122 — ETF-Quartett (Geschwisterspiel) + Footer-Bugfix
Zweites Quartett-Spiel: etf-quartett-finanzbildung.html, 30 echte ETFs
statt Unternehmen. Gleiche Engine wie das Aktien-Quartett, andere
Kategorien: TER, Fondsvolumen, Anzahl Positionen, Auflagejahr,
5-Jahres-Rendite p.a., Volatilität.

- TER, Auflagejahr und Volatilität laufen umgekehrt (niedriger gewinnt) —
  dieselbe Pfeil-/Rot-Rand-Lösung wie beim KGV im Aktien-Quartett.
- Rendite-Kategorie bewusst mit eigener Info-Box direkt über dem Spiel:
  Vergangenheit, keine Prognose, keine Anlageberatung. Volatilität steht
  absichtlich direkt daneben als Kategorie, um Rendite und Risiko als
  zwei getrennte Dinge zu zeigen, nicht als eine Kennzahl.
- Recherchiert: iShares Core MSCI World (TER 0,20 %, 124 Mrd. €, 1.280
  Positionen, 2009) und Vanguard FTSE All-World (TER 0,22 %, ~23 Mrd. €,
  ~3.900 Positionen) als Anker; restliche 28 ETFs branchentypisch
  geschätzt (thematische ETFs teurer, Anleihen-ETFs günstiger, Geldmarkt-
  ETF nahe null Volatilität).
- Getestet: 800 simulierte Runden in Node, Kartenerhalt (immer 30 im
  Umlauf) durchgehend bestätigt, keine Bugs.
- Eingebunden: sitemap.xml, wechselseitige Verlinkung zum Aktien-Quartett,
  Motivation-Callout-Box zeigt jetzt beide Spiele, Technik-Einzeiler
  ebenfalls aktualisiert.

## Bug gefunden und behoben (beim Bauen aufgefallen)
beitrag/quartett-finanzbildung.html (Aktien-Quartett aus V117) hatte seit
der ersten Version einen unvollständigen Footer — beim ursprünglichen
Zusammensetzen wurde nur die schließende </footer>-Zeile kopiert, nicht
der eigentliche Footer-Inhalt (Social-Links, Copyright, Impressum-
Verweise). Jetzt nachgetragen und verifiziert. Kein Fehler in der
Quelldatei, nur in meiner damaligen Extraktion.

## Kategorie "Spiele" — weiterhin zurückgestellt
Mit jetzt 2 Spielen wäre der Punkt für eine eigene Nav-Kategorie näher,
aber noch nicht zwingend nötig — beide sind über Motivation und
gegenseitig verlinkt gut auffindbar. Bei einem dritten Spiel würde sich
eine eigene Kategorie/Hub-Seite lohnen.

## V123 — Konsistente Namensgebung: beide Quartette umbenannt + zweiter Meta-Bug gefunden
Auf Hinweis, dass quartett-finanzbildung.html und etf-quartett-finanzbildung.html
nicht konsistent benannt waren (unterschiedliches erstes Wort):

- quartett-finanzbildung.html → finanzbildung-quartett-aktien.html
- etf-quartett-finanzbildung.html → finanzbildung-quartett-etf.html

Alle Referenzen in sitemap.xml, kat-minimalismus-motivation.html,
kat-technik.html und den Dateien selbst (wechselseitige Verlinkung)
aktualisiert. Per Script ersetzt (ETF-Muster zuerst, damit der kürzere
Name es nicht mittendrin zerschneidet), danach auf verstümmelte Treffer
geprüft — keine gefunden.

## Zweiter, gravierenderer Bug beim Umbenennen entdeckt
Bei der Gelegenheit aufgefallen: Der komplette Meta-Bereich beider
Quartett-Seiten (Title, Description, canonical, og:title, og:description,
og:url, JSON-LD) zeigte seit der jeweils allerersten Version noch
"Depot nach Alter und Risikoklasse" — die Kopiervorlage, aus der beide
Seiten gebaut wurden. Meine damalige Ersetzung ist beide Male
stillschweigend fehlgeschlagen, und ich hatte das Ergebnis nicht
danach verifiziert. Betraf:
  - Titel/Beschreibung in Suchergebnissen
  - canonical-URL (zeigte auf den falschen Artikel)
  - Social-Media-Vorschau (og:title/og:description/og:url)
  - JSON-LD (@type war noch "BlogPosting" statt "WebPage", @id falsch)

Für beide Dateien vollständig korrigiert und diesmal sofort nach jeder
Änderung verifiziert (grep auf Restspuren + korrekte neue Werte geprüft),
statt nur auf die Erfolgsmeldung des Ersetzungs-Scripts zu vertrauen.
Zusätzlich: Tag-Balance, JS-Syntax und JSON-LD-Validität beider Dateien
final bestätigt.

**Lehre daraus für künftige Seiten:** Nach jedem Meta-Block-Ersatz aktiv
grep-verifizieren, dass die alten Werte wirklich weg sind — nicht nur
darauf vertrauen, dass ein Ersetzungsschritt ohne Fehlermeldung durchlief.

## V124 — Meterstock-Rechner: Renteneintritt-Linie ergänzt
Im interaktiven Meterstock-Rechner (beitrag-meterstock-lebenszeit.html)
eine dritte Markierungslinie bei 67 Jahren ergänzt (aktuelles gesetzliches
Renteneintrittsalter), unabhängig von den Schiebereglern für Alter und
Gebrechlichkeitspuffer — gilt für alle Betrachter gleich.

- Bewusst NICHT dieselbe Rot-Nuance wie die bestehende Lebenserwartungs-
  Linie (sonst nicht unterscheidbar): gestrichelt statt durchgezogen,
  eigener Rotton (#E63946), plus kleines "67 (Rente)"-Label über der Linie.
- Legende um den Eintrag "Aktuelles Renteneintrittsalter (67)" ergänzt.
- Erklärender Absatz direkt unter dem Rechner ergänzt: was die Linie zeigt
  und warum die Lücke zwischen ihr und der Lebenserwartungs-Linie die
  Strecke ist, die ohne Gehalt finanziert werden muss.
- Getestet mit Node-DOM-Stub: Linie erscheint korrekt bei exakt 67,00%,
  Label und Legende korrekt befüllt.

## Sonstiges
Nachgefragt wegen einer möglicherweise fehlenden "Pille" bei den
Bücher-Kategorie-Filtern (Alle/Vermögensaufbau/Optionen/Unternehmertum/
Macht & Einfluss) — beim Vergleich mit anderen Kategorieseiten keine
Abweichung gefunden. Nutzer hat bestätigt: war ein Irrtum, nichts zu tun.

Vollbild-Prefetch-Frage (Bücherseite beim Menü-Öffnen vorladen) noch
unbeantwortet/offen für die nächste Runde.

## V125 — Hover-Prefetch für die Bücherseite
Auf Wunsch umgesetzt, wie besprochen: kein Vorladen beim Öffnen des
gesamten Menüs (hätte auf Verdacht sechs Kategorien mitgeladen), sondern
gezielt beim Hover über den "Bücher"-Menüpunkt selbst.

- Einmal zentral in script.js (nicht pro Seite dupliziert), betrifft
  automatisch alle 138 Seiten.
- Nur auf Geräten mit echtem Hover (matchMedia '(hover: hover)') — auf
  Touch-Geräten bricht die Funktion sofort ab, ohne auch nur nach dem
  Button zu suchen.
- Einmalig pro Seitenaufruf: zweiter Hover fügt kein zweites <link
  rel="prefetch"> mehr ein.
- Getestet mit zwei Node-Stubs: (1) Hover-fähiges Gerät — Listener an
  beiden Bücher-Buttons (Desktop- + Mobile-Menü-Kopie), erster Hover
  fügt genau einen Prefetch-Link ein, zweiter Hover verändert nichts
  mehr; (2) Touch-Gerät — Funktion bricht korrekt vor jeder DOM-Abfrage ab.

## V126 — BAföG-Rechner: Regler für tatsächlichen Darlehensanteil + Regelverifikation
Recherchiert direkt bei bafög.de (offizielle Quelle, Stand Juli 2024,
weiterhin gültig): 50/50-Aufteilung Zuschuss/Darlehen, 10.010-€-Deckel,
130-€-Monatsrate, Rückzahlungsbeginn 5 Jahre nach Förderungshöchstdauer —
alles bestätigt, keine Änderung nötig. Die vermutete "2-3 Jahre
Karenzzeit" stimmt für Studierenden-BAföG nicht (das sind 5 Jahre,
stand schon richtig im Artikel) — die kürzere Zahl gehört zu einem
anderen Programm (Aufstiegs-BAföG). Nebenfund: offizielle
Stundungsgrenze liegt bei 1.690 €/Monat netto, bisher nicht im Artikel.

Neuer Regler "Dein tatsächlicher Darlehensanteil" (1.000–10.010 €,
Standard weiterhin 10.010 €) — bisher ging der Rechner starr vom
Höchstsatz aus. Nachlass-Ziel (~26%) und volle Schuld werden jetzt aus
diesem Regler berechnet statt fest verdrahtet zu sein.

- Überschrift und Einleitungstext allgemeiner formuliert (nicht mehr
  "7.407,40 €" fest im Text, sondern "dein Nachlass-Ziel").
- Beide Ergebnis-Label (Ziel A und B) jetzt dynamisch — Label B hatte
  vorher gar keine id und wurde nie aktualisiert, jetzt ergänzt.
- Getestet: Standardwert 10.010 € ergibt weiterhin exakt 7.407,40 € als
  Nachlass-Ziel (Konsistenz-Check gegen den alten festen Wert bestanden);
  Testwert 5.000 € skaliert korrekt auf 3.700 € / 5.000 €.
- Statisches Rechenbeispiel oben im Artikel (Maximalfall, 10.010 € →
  7.407,40 €) bewusst unverändert gelassen als konkretes Referenzbeispiel,
  der Rechner darunter deckt jetzt den allgemeinen Fall ab.

## V127 — Finanz-Quiz (Entwurf, 16 von 40 Fragen) + selbstgeschriebener QR-Encoder
Neue Seite finanzquiz-aktuelle-zahlen.html — erster Entwurf-Batch von 16
der geplanten 40 Quizfragen, wie besprochen als Mix aus zwei Antwort-Stilen
zum direkten Vergleich:
- 9 Fragen mit festem Fakt + Datumsstand (BAföG-Höchstsatz, Renteneintritt,
  Sparerpauschbetrag, Einlagensicherung, Grundfreibetrag 2026, Mindestlohn
  2026, ETF-TER, BAföG-Deckel, BAföG-Karenzzeit)
- 7 Fragen mit Live-Wert (Goldpreis, EZB-Leitzins, Bitcoin, DAX, Ölpreis,
  EUR/USD, Inflationsrate) — statt einer in Tagen veralteten Zahl ein
  QR-Code + Link, der direkt zur aktuellen Google-Antwort führt

## QR-Code-Diskussion — technisch geklärt, selbst umgesetzt
Bestätigt: Ein QR-Code, der eine Google-Such-URL kodiert, öffnet beim
Scannen direkt die aktuelle Google-Trefferseite — keine Live-Anbindung
nötig, Google liefert die Aktualität. Kein Backend, funktioniert auf
GitHub Pages ohne Änderung.

Keine QR-Bibliothek in der Umgebung verfügbar, kein Internetzugriff zum
Nachinstallieren — deshalb einen minimalen QR-Encoder nach ISO/IEC 18004
selbst geschrieben (Byte-Modus, Versionen 1-10, Reed-Solomon-
Fehlerkorrektur, alle 8 Maskierungsmuster, BCH-Format-Info). Verifiziert:
- Generatorpolynom exakt gegen bekannte Referenzwerte geprüft
- Format-Info-Kodierung exakt gegen bekannte Referenzwerte geprüft
- Vollständiger unabhängiger Decoder selbst geschrieben, kompletter
  Encode→Decode-Rundlauf für alle 7 echten Google-Such-URLs fehlerfrei
- Beim ersten Rundlauf-Test einen echten Bug in der Format-Info-
  Rücklese-Logik gefunden (falsche Bit-Position extrahiert) und behoben
- Nicht-ASCII-Zeichen (Umlaute) korrekt Prozent-kodiert statt roher
  UTF-8-Bytes, für maximale Scanner-Kompatibilität
- SVG-Ausgabe von Einzel-Rechtecken auf zusammengefasste Pfade
  umgestellt: ~85% kleinere Dateigröße (230 KB → 35 KB für 7 Codes)

## Zweiter Bug beim Zusammensetzen gefunden und behoben
Beim Bau der neuen Seite denselben Fehlertyp wie bei den Quartett-Seiten
(V123) wiederholt: die Meta-Bereich-Ersetzung hat den alten JSON-LD-Block
und einen kompletten alten <style>-Block (von der Kopiervorlage
beitrag-depot-alter-risikoklasse.html) nicht vollständig entfernt —
sichtbar an einem doppelten <script>-Tag mitten im Dokument. Diesmal
durch die eigene Tag-Balance-Prüfung (script 4/3) sofort aufgefallen,
noch vor dem Ausliefern behoben und mit vollständiger Neuprüfung bestätigt.

## Weiterhin offen
- Nutzer schaut sich den Entwurf an, entscheidet dann zwischen den beiden
  Antwort-Stilen (fest/Live) je Frage bzw. ob beide bleiben
- Bei Bestätigung: Erweiterung auf die vollen 40 Fragen

## V128 — Quiz umbenannt: konsistente Namenskonvention
finanzquiz-aktuelle-zahlen.html → finanzbildung-quiz.html, passend zu
finanzbildung-quartett-aktien.html / finanzbildung-quartett-etf.html.
Alle Referenzen aktualisiert (sitemap.xml, kat-minimalismus-motivation.html,
Selbst-Referenzen canonical/og:url/hreflang in der Datei selbst) und
verifiziert — keine Reste des alten Namens, keine Verstümmelungen.

## Als Nächstes vorbereitet, noch nicht umgesetzt
Reel-Mechanik aus zufall.html / suche.html analysiert (der "einarmige
Bandit" — Drehbutton mit Beschleunigungs-/Abbremsphysik, landet auf
zufälligem Index) als Vorlage für den Umbau der Quiz-Seite von der
langen Kartenliste auf ein kompaktes Reel-System. Umbau selbst steht
noch aus.

## V129 — Quiz umgebaut auf Reel-Mechanik + Erweiterung auf 44 Fragen
Komplett umgebaut, wie besprochen: statt der langen Liste von Karten
jetzt dasselbe Reel-System wie bei zufall.html/suche.html — kompaktes
Scroll-Fenster (Maus hoch/runter bewegen oder Zeile anklicken), plus
"🎲 Zufällige Frage"-Button mit derselben Beschleunigungs-/Abbrems-Physik
("einarmiger Bandit"). Aktuelle Frage + Antwort erscheinen unter dem Reel,
Verlauf der letzten 6 angesehenen Fragen als klickbare Pillen darunter.

- Von 16 auf 44 Fragen erweitert: 23 mit festem Fakt + Datumsstand
  (14 neu: Abgeltungssteuer, TER FTSE All-World, Kinderfreibetrag,
  Kindergeld, Spekulationsfrist-Trickfrage, Pendlerpauschale, Riester-
  Zulage, Minijob-Grenze, Tagesgeld-Kündigungsfrist-Trickfrage,
  historische MSCI-World-Rendite, TER aktiver Fonds, BAföG-Schuldenfrei-
  Frist, BAföG-Stundungsgrenze, Sparerpauschbetrag Verheiratete),
  21 mit Live-Wert + QR-Code (14 neu: Silber, Ethereum, Bauzins, Nasdaq,
  S&P 500, MSCI World Stand, Fed-Leitzins, Gaspreis, Strompreis,
  Immobilienpreis/m², Benzinpreis, Kupferpreis, Arbeitslosenquote,
  SNB-Leitzins).
- Alle 14 neuen QR-Codes mit demselben verifizierten Encoder erzeugt und
  einzeln per Encode→Decode-Rundlauf bestätigt (0 Fehler bei 21 Live-
  Fragen gesamt).
- Getestet mit DOM-Stub: Reel baut korrekt 44 Zeilen, alle 44 Fragen
  einzeln angeklickt + Antwort aufgedeckt + Inhalt gegengeprüft (0 Fehler),
  Spin-Button-Physik bis zur fertigen Landung durchlaufen lassen — landet
  zuverlässig auf einer gültigen Frage, Button-Status wechselt korrekt.
- Nebenbei: Beim Wiederaufbau versehentlich zu viel altes Body-Fragment
  aus der Kopiervorlage übernommen (endete nicht exakt bei </header>) —
  beim eigenen Tag-Balance-Check sofort aufgefallen (56/53 divs) und vor
  dem Ausliefern korrigiert.

## V130 — Quiz auf 100 Fragen erweitert + E-Book/Gesellschaftsspiel-PDF
Von 44 auf 100 Fragen erweitert (51 statisch, 49 live), alle 56 neuen
Fragen recherchiert bzw. mit stabilen/gesetzlichen Fakten belegt (u.a.
Abgeltungssteuer, Erbschaftsteuer-Freibeträge, Übungsleiter-/
Ehrenamtspauschale — dabei die zum 01.01.2026 erhöhten Werte 3.300 €
bzw. 960 € recherchiert und verwendet statt der alten 3.000 €/840 €).
36 neue QR-Codes generiert (14 + 28 in zwei Chargen), alle einzeln
Encode→Decode verifiziert. finanzbildung-quiz.html mit dem kompletten
100er-Datensatz aktualisiert, DOM-Stub-Test für alle 100 Fragen (Klick +
Reveal + Inhaltsprüfung) mit 0 Fehlern bestanden. Motivation-Seite und
Überschrift von "44"/"Entwurf" auf "100" aktualisiert.

### Neues Produkt: Finanzritual_Quiz_Gesellschaftsspiel.pdf
100-seitiges Querformat-PDF fürs Shop-Produkt, gestaltet wie ein
Gesellschaftsspiel-Karton (Deckblatt mit "Spieler/Minuten/Alter/Fragen"-
Boxen im Brettspiel-Stil). Pro Seite eine Frage:
- Fester Fakt: Antwort + Datumsstand steht auf dem Kopf am unteren
  Rand (klassischer Quizbuch-Trick — Buch drehen zum Nachsehen)
- Live-Wert: QR-Code (direkt aus der Bit-Matrix als Vektor-Rechtecke
  gezeichnet, kein SVG-Umweg) + kurzer Hinweistext
- Fragenreihenfolge gemischt (fester Seed), nicht nach Typ sortiert

### QR-Code-Verifikation im PDF — ausführlich
Erste Prüfung mit OpenCVs Basis-QR-Scanner ist fehlgeschlagen (leerer
Rückgabewert). Statt das als Bug zu werten, systematisch nachgegangen:
- Direkte Pixel-Abtastung nach eigener Zeichen-Geometrie: 0 Abweichungen
  auf einem isolierten Test-PDF
- OpenCV konnte die 3 Finder-Ecken trotzdem korrekt lokalisieren; über
  diese Ecken selbst perspektivisch entzerrt und alle Module abgetastet:
  ebenfalls 0 Abweichungen — bestätigt, dass die Bilddaten pixelgenau
  korrekt sind und die Ursache eine Grenze von OpenCVs Basis-Decoder ist,
  nicht ein eigener Fehler
- Bei der Übertragung auf die echte Buchseite zunächst eine falsche
  Seitenzahl in der eigenen Testroutine verwendet (Off-by-One) — dadurch
  eine Frage mit der QR-Matrix einer anderen Frage verglichen, was wie
  ein 52%-Fehler aussah. Nach Korrektur: 0 Abweichungen
- Abschließend alle 49 Live-Seiten im fertigen PDF einzeln geprüft:
  0 Abweichungen über alle 49 QR-Codes

## Weiterhin offen
- E-Book/PDF ist als Produktentwurf für den Shop gedacht — Rückmeldung
  abwarten, ob Layout/Deckblatt/Aufteilung so passt
- Ein echter Scan mit einem physischen Handy vor dem finalen Druck bleibt
  die letzte, stärkste Bestätigung

## V131 — Spiele sichtbarer gemacht (Startseite + Nav + Anker)
Rückmeldung: Quartett und Quiz waren unter Motivation zu versteckt.
Dreiteilige Lösung:

1. Startseite: neuer Spiele-Banner direkt nach dem Hero, noch vor dem
   Rechner — "🎴 Quartett spielen" und "🎲 Quiz starten" als direkte
   Buttons, nicht erst über Lebensstil > Minimalismus > Motivation
   klicken müssen.
2. Lebensstil-Dropdown (sitehweit in der Navigation, 132 Seiten):
   neue "Spiele"-Pille mit Würfel-Icon direkt nach "Motivation" ergänzt,
   springt per Anker (#spiele-bereich) direkt zu den beiden Spiele-Boxen
   auf der Motivation-Seite, ohne erst durch 7 Artikel scrollen zu
   müssen. Icon standardmäßig grün hervorgehoben (nicht erst bei Hover),
   damit die Pille im Dropdown auffällt.
3. kat-minimalismus-motivation.html: Anker-Wrapper mit eigener
   Eyebrow-Überschrift ("Spielen & lernen") um beide Spiele-Boxen gelegt,
   damit der Sprung dorthin auch optisch klar als eigener Bereich zu
   erkennen ist.

Verifiziert: alle 132 sitehweit geänderten Dateien per Stichprobe auf
Tag-Balance geprüft (a/svg-Tags), Startseite komplett neu durchgezählt
(div/p/a/section alle ausgeglichen).

## V132 — Anker-Sprung-Bug behoben (Spiele-Pille landete oben statt am Ziel)
Ursache gefunden: kat-minimalismus-motivation.html rendert die
Artikelliste (#kat-posts) erst per JS in DOMContentLoaded
(frRenderCategoryPosts). Der Browser springt beim Laden mit #spiele-bereich
in der URL aber schon VOR diesem Rendern zur damals noch viel kürzeren
Seite — landet also an einer Position, die kurz danach nicht mehr stimmt,
weil #spiele-bereich durch die nachträglich eingefügten Artikel-Karten
weiter nach unten rutscht. Der Nutzer landet dadurch praktisch oben.

Fix in script.js (sitehweit wirksam, da die Datei überall eingebunden
ist, keine 132-Dateien-Änderung nötig): nach dem 'load'-Event (läuft
garantiert nach allen DOMContentLoaded-Handlern inkl. der
seitenspezifischen render()-Aufrufe) wird bei vorhandenem #hash in der
URL einmal korrigierend zum Ziel-Element gescrollt. Betrifft nicht nur
die neue Spiele-Pille, sondern jeden #anker-Link sitehweit, der auf eine
Seite mit nachträglich gerendertem Inhalt oberhalb des Ziels zeigt (z. B.
auch die Vergleich-Unterkategorien).

Verifiziert: frRenderCategoryPosts liest aus dem bereits im Speicher
befindlichen FR_POSTS-Array (kein Netzwerk-Fetch) und läuft synchron
vor dem load-Event — die Korrektur kommt also zuverlässig rechtzeitig.
Logik isoliert mit simuliertem load-Event getestet: korrekter Sprung bei
vorhandenem Hash+Ziel, kein Fehler bei fehlendem Hash, kein Fehler bei
nicht existierendem Ziel-Element.

## V133 — Neuer Artikel: "Auch ein Milliardär hat's schwer"
Neue Datei beitrag-milliardaer-hat-auch-schwer.html, unter Motivation
(Lebensstil > Minimalismus > Motivation). Ausgangsmaterial war eine vom
Nutzer hochgeladene Word-Datei zu einem Business-Insider-Bericht über
einen durchgesickerten Morgan-Stanley-Portfoliobericht (Epstein-Akten)
mit Milliardär Mortimer Zuckermans privaten Jahresausgaben 2011.

Auf Wunsch gegenrecherchiert statt die Word-Datei nur zu übernehmen:
Kernfakten bestätigt (8,9 Mio. $ Gesamtausgaben 2011, ~2,8 Mrd. $
Nettovermögen laut Forbes, Epstein-Akten-Fund Anfang 2026, Business-
Insider-Erstberichterstattung). Dabei zusätzlichen, im Word-Dokument
nicht enthaltenen Kontext gefunden (weitere 2026er-Berichte zu Epsteins
Druck auf Zuckerman bzgl. Vermögensverwaltung/Berichterstattung) --
bewusst NICHT in den Artikel übernommen, um beim eigentlichen
Finanz-Bildungs-Fokus zu bleiben statt den Skandal-Aspekt auszuweiten.
Auch explizit recherchiert und im Artikel klargestellt: kein öffentlich
bekannter Vorwurf gegen Zuckerman selbst im Epstein-Zusammenhang.

Komplett eigenständig neu geschrieben (nicht die Word-Datei
umformatiert) -- eigene Gliederung, eigene Formulierungen, mit
Quellenangabe (Business Insider/Forbes/DOJ-Akten) am Artikelende statt
wörtlicher Übernahme, aus Urheberrechtsgründen und weil ein eigener
redaktioneller Blickwinkel (Lifestyle-Inflation, Fixkosten skalieren
mit Vermögen, Geldsorgen ändern nur die Form) mehr Mehrwert für die
Zielgruppe bietet als eine Übersetzung.

Aufschlüsselung der 13 Ausgabenkategorien nachgerechnet: Summe ergibt
exakt 8.910.454 $, passend zu den berichteten "8,9 Millionen".

Eingebunden: FR_POSTS (script.js, erscheint automatisch auf
kat-minimalismus-motivation.html), sitemap.xml, Selbst-Referenzen
(canonical/og:url/JSON-LD) geprüft, Tag-Balance und JSON-LD-Validität
bestätigt.

## V134 — Neuer Artikel: Ausgabenstruktur im Vergleich (Prozent-Grafik)
Neue Datei beitrag-ausgabenstruktur-im-vergleich.html, unter Motivation,
bidirektional mit dem Milliardär-Artikel verlinkt. Auf Wunsch eine
Skalierungsgrafik in Prozent statt absoluten Beträgen — Nettovermögen
(2,8 Mrd. $) lässt sich nicht sinnvoll neben einem normalen Haushalt
darstellen, deshalb wie besprochen die Jahresausgaben (8,9 Mio. $) als
Maßstab genommen.

Auf Wunsch um 1 zusätzliche Vergleichsgruppe erweitert (Nutzer schlug
Unternehmer/Großverdiener/Facharbeiter vor, Auswahl mir überlassen):
recherchiert und die offizielle Destatis-Tabelle "Konsumausgaben privater
Haushalte nach der sozialen Stellung der Haupteinkommenspersonen" (EVS
2023) gefunden — deckt Selbstständige UND Arbeitnehmer mit derselben
Methodik ab, dadurch "Unternehmer" sauber mit echten Daten statt Schätzung
abgedeckt. "Großverdiener"/Einkommensdezile bewusst nicht zusätzlich
verwendet, um die Grafik nicht zu überladen.

3 gestapelte Prozent-Balken (Arbeitnehmer, Selbstständige, Milliardär),
alle Kategorien aus den ursprünglich unterschiedlichen Quellen (13
Milliardärs-Posten vs. 12 Destatis-Kategorien) in 6 gemeinsame
Oberkategorien gruppiert, damit ein fairer Vergleich möglich ist. Dabei
methodisch sauber gehalten: Steuern und Spenden aus dem Milliardärs-Total
herausgerechnet (da Destatis-Konsumausgaben beides nicht enthalten),
im Artikel transparent erklärt statt einfach vermischt.

Alle Prozentsätze in Python nachgerechnet und verifiziert: Kontrollsumme
Milliardär (6.946.241 $ ohne Steuern) stimmt exakt mit der Summe der 6
Gruppen überein; alle 3 Balkenzeilen summieren sich auf 99,9–100,1 %
(Rundungstoleranz).

Eingebunden: FR_POSTS (100 Artikel jetzt), sitemap.xml (139 URLs),
Cross-Link im Original-Milliardär-Artikel ergänzt, Tag-Balance und
JSON-LD-Validität in beiden Artikeln geprüft.

## V135 — Fiktive Datumsspanne gestrafft, Sortier-Bug behoben
Problem: FR_POSTS-Daten spannten sich über 96 Tage (14.05.–18.08.2026) —
schon 19 Tage über das reale Gesprächsdatum (30.07.2026) hinaus. Dadurch
sortierten sich die beiden zuletzt erstellten Artikel (Milliardär,
Ausgabenstruktur, mit Datum nahe am echten "heute") unter älteren
Artikeln ein, die fiktiv schon "in der Zukunft" datiert waren.

Alle 98 bestehenden Artikel-Daten proportional gestaucht auf 20.05.–
28.07.2026 (71 Tage), relative Reihenfolge zueinander erhalten. Die 2
tatsächlich zuletzt erstellten Artikel bekommen die neuen spätesten
Daten (29./30.07.2026) und stehen jetzt korrekt oben.

### Eigener Fehler bei der ersten Umsetzung gefunden und korrigiert
Erster Versuch nutzte eine Wörterbuch-Umsortierung mit dem link-Feld als
Schlüssel — 4 sehr alte Einträge haben aber gar kein link-Feld (offenbar
Alt-Platzhalter ohne fertigen Artikel, bereits vor dieser Session so
vorhanden). Alle 4 kollidierten dadurch auf demselben leeren Schlüssel,
3 davon gingen beim Zusammenbau verloren. Beim eigenen Verifikations-
Check (link-Feld-Anzahl vor/nach Vergleich: 96 vs. 96 sollte stimmen,
war aber weniger) sofort aufgefallen, bevor ausgeliefert wurde. Komplett
neu gemacht mit zeilenbasierter In-Place-Aktualisierung ohne jede
Umsortierung oder Schlüssel-Gruppierung — jede Post-Zeile bleibt an
ihrer ursprünglichen Position, nur der date-Wert wird ersetzt.

Verifiziert: alle 100 Posts vorhanden (unverändert, inkl. der 4
linklosen Alt-Einträge), 100 eindeutige Titel, Datumsspanne 20.05.–
30.07.2026, kein Datum nach heute, die beiden neuesten Artikel stehen
bei Sortierung nach Datum korrekt an erster und zweiter Stelle.

### Offen
Die sichtbaren Datumsangaben auf den 100 einzelnen Artikelseiten selbst
(fest eingetragener Text, z.B. "Motivation · 29.07.2026" im Eyebrow)
sind von dieser Korrektur nicht betroffen und weichen jetzt teilweise
von den FR_POSTS-Sortier-Daten ab. Angleichung wäre ein Eingriff in
alle 100 Dateien -- auf Rückmeldung warten, ob das gewünscht ist.

## V136 — T-Shirt-Idee "Mein Viertel" in den Shop aufgenommen + SVG-Bug behoben
Auf Wunsch als Merkzettel für den Shop erstellt: T-Shirt-Mockup
"Mein Blog · meine Straße · mein Viertel" mit dem Kastenschrift-
Crossword-Logo (weiße Variante) darunter, dunkles Shirt. Nach Rückmeldung
Logo verkleinert (62% der Ursprungsgröße) und exakt zentriert (Mitte bei
x=320, per getBBox()-Messung bestätigt).

### Eigener Fehler gefunden und behoben: ungültige XML-Entity
Erste SVG-Version nutzte "&middot;" als Zeichen-Entity — das ist eine
HTML-Entity, in reinem XML/SVG aber nicht deklariert und führt zu einem
Parser-Fehler beim direkten Öffnen im Browser (genau der vom Nutzer
gemeldete Fehler "Entity 'middot' not defined"). Durch das echte
Unicode-Mittepunkt-Zeichen (·) ersetzt, mit ElementTree geprüft: jetzt
gültiges XML. Lehre: bei eigenständigen SVG-Dateien (anders als SVG
eingebettet in eine bereits als HTML geparste Seite) nur numerische
oder in XML gültige Entities verwenden, oder das Zeichen direkt als
UTF-8 schreiben.

### Ins Shop eingebunden
Neue Produktkarte in shop.html, direkt vor dem bestehenden "Ritual"-
T-Shirt eingefügt, klar als "Idee" markiert (nicht als bestellbares
Produkt): Badge "Idee" statt "Merch", Preis-Feld "in Planung" statt
Betrag, Bestellbutton sichtbar deaktiviert ("Noch nicht bestellbar",
ausgegraut, nicht klickbar). Bild: img/produkt-tshirt-viertel.svg.

Verifiziert: Tag-Balance shop.html geprüft, Bilddatei-Referenz bestätigt,
neue Produktkarte im echten Seitenkontext gerendert und angesehen.

## V137 — Neuer Artikel: Kündigungsschutz / einzige Geldquelle schützen
Neue Datei beitrag-kuendigung-einkommen-schuetzen.html, unter Finanzen >
Vermögensaufbau. Ausgangsmaterial war eine vom Nutzer hochgeladene
Word-Datei mit einer Checkliste zu Kündigungsschutz. Vor dem Schreiben
geprüft, ob es sich um eine reale persönliche Situation oder um
Recherche-Material für einen Artikel handelt (unpersönliche "Sie"-
Anrede, Fußnoten-Verweise, Checklisten-Stil -- eindeutig Artikel-
Rohmaterial wie zuvor beim Milliardärs-Bericht, keine Ich-Situation).

Auf Wunsch alle rechtlichen Kernaussagen gegenrecherchiert:
- 3-Wochen-Klagefrist (§4 KSchG), Rechtsfolge bei Fristversäumnis
  (§7 KSchG) bestätigt
- KSchG-Schwelle (>6 Monate Betriebszugehörigkeit, >10 Vollzeitkräfte)
  bestätigt
- Schriftformerfordernis (§623 BGB), Betriebsrat-Anhörungspflicht
  (§102 BetrVG), Sonderkündigungsschutz bestätigt
- Eine Ungenauigkeit im Entwurf korrigiert: die "3-Tage-Regel" für die
  Agentur-für-Arbeit-Meldung gilt nur bei kurzfristiger Kenntnis; bei
  längerem Vorlauf gilt stattdessen "3 Monate vor Vertragsende", und die
  Konsequenz bei Versäumnis ist eine einwöchige Sperrzeit, kein
  Totalverlust -- im Entwurf pauschal als "3 Tage" dargestellt
- Einen wichtigen, im Entwurf fehlenden Fakt ergänzt: §12a ArbGG -- vor
  dem Arbeitsgericht zahlt in erster Instanz JEDE Seite ihre eigenen
  Anwaltskosten, unabhängig vom Ausgang. Das untermauert die im Entwurf
  bereits enthaltene Rechtsschutzversicherung-Empfehlung deutlich
  stärker als der Entwurf selbst es begründet hatte, inkl. dem oft
  übersehenen Detail der Wartezeit neuer Verträge (~3 Monate) für den
  Arbeitsrecht-Baustein

Redaktionell eingebettet in die "Klumpenrisiko einzelnes Einkommen"-
Perspektive des Entwurfs, mit Brücke zum Notgroschen-Konzept (3-6 Monate)
und Cross-Link zum Ausgabenstruktur-Vergleichsartikel. Deutlicher
Nicht-Rechtsberatung-Hinweis am Ende.

Eingebunden: FR_POSTS (101 Artikel, korrektes neuestes Datum 31.07.2026),
sitemap.xml (140 URLs), Tag-Balance und JSON-LD-Validität geprüft.

## V138 — Kündigungsschutz-Artikel: Frühwarnzeichen ergänzt
Neue Sektion "Kündigungen kündigen sich meistens an" direkt nach der
Einleitung eingefügt (vor der 3-Wochen-Frist, da chronologisch davor):
Personalgespräche, Unruhe in der Firma, Insolvenzgerüchte,
Umstrukturierung als typische Vorboten. Verknüpft mit der bereits
bestehenden Kostenregel-Box weiter unten: spätestens bei diesen Anzeichen
eine Rechtsschutzversicherung mit Arbeitsrecht abschließen (ca. 250 €/
Jahr), da Anwaltskosten schnell vierstellig werden und neue Verträge
eine Wartezeit haben -- nach Erhalt des Kündigungsschreibens oft zu spät
für den konkreten Fall.

## V139 — ESG/Greenwashing-Thema in 2 Artikel + Glossar-Eintrag
Auf Rückfrage entschieden, das Thema in zwei verlinkte Artikel statt
einem Mega-Post aufzuteilen (dieselbe Logik wie beim Milliardär/
Ausgabenstruktur-Paar): unterschiedliche Leserabsicht (Erklärstück/
Kritik vs. reine Nachschlage-Liste), unterschiedlicher Inhaltstyp.

### Artikel 1: beitrag-esg-etf-greenwashing.html
"Warum ESG kein Gütesiegel ist" — unter Finanzen > ETF & Sparplan.
Recherchiert und mit echten Fällen belegt:
- ESG- vs. SRI-Unterschied (MSCI World SRI: ~380 von ~1.500 Unternehmen,
  harte Ausschlüsse vor der Bewertung; ESG: weichere Bewertung, ExxonMobil/
  Saudi Aramco dokumentiert enthalten)
- Xtrackers MSCI Europe ESG ETF (DWS): hält RWE (Kohle) und Airbus
  (Rüstung/Luftfahrt), 30%-Umsatzschwelle für Atomkraft/Öl/Gas
- DWS-Greenwashing-Ermittlung: Staatsanwaltschaft Frankfurt ab 2021,
  Mai 2024 Berichten zufolge mit Millionenbuße beendet
- EU-Taxonomie-Kontroverse: Juli 2022 Aufnahme von Atomkraft und Erdgas
  als "nachhaltig" (Bedingungen: Gas <270g CO2/kWh bis 2030, Atomkraft
  bis 2045 mit Entsorgungsplan ab 2050), in Kraft seit 01.01.2023
- ESMA-Namensregeln seit Mai 2025 und die Umgehung durch Begriffe wie
  "Screened"/"Selection"/"Committed" statt "ESG"/"Sustainable"
- Checkliste zum Selbst-Prüfen (Top-10-Vergleich, SFDR Art. 6/8/9,
  Ausschlussschwellen im Factsheet lesen)

### Artikel 2: beitrag-sparten-etf-erneuerbare-energien.html
"Sparten-ETFs für erneuerbare Energien" — kategorisierte Liste als
Ausgangspunkt fürs Recherchieren, im Tabellen-Stil der bestehenden
Dividenden-Aktien-Liste: Solar (Invesco Solar Energy, Global X Solar),
Wind (Invesco Wind Energy, Global X Wind Energy), Wasserstoff (L&G
Hydrogen Economy, VanEck Hydrogen Economy, Amundi Global Hydrogen),
breite Clean Energy (iShares Global Clean Energy Transition, L&G Clean
Energy, Invesco Global Clean Energy), angrenzende Themen (Battery,
Electrification, Water). Mit Kompromiss-Hinweis: höhere TER (0,30-0,65%
vs. 0,15-0,25% bei MSCI World) und höheres Konzentrationsrisiko bei
Sparten-ETFs, plus Warnung vor Verwechslung "Clean Energy" mit
allgemeinem "Energie-Sektor"-ETF (meist Öl-/Gas-/Versorger-dominiert).

Beide Artikel bidirektional verlinkt. Neuer Glossar-Eintrag "ESG"
alphabetisch vor "ETF" eingefügt, mit Link zum Greenwashing-Artikel.

Eingebunden: FR_POSTS (103 Artikel), sitemap.xml (142 URLs), Tag-Balance
und JSON-LD-Validität in beiden Artikeln sowie im Glossar geprüft.

## V140 — ESG-Artikel: Titel geändert, Glossar-Flyover statt Seitenwechsel
Titel von "Warum ESG kein Gütesiegel ist" zu "ESG-ETFs ökologisch
nachhaltig? — Nicht unbedingt" geändert (Title-Tag, H1, Breadcrumb,
og:title, JSON-LD headline, FR_POSTS-Eintrag, Cross-Link vom
Sparten-ETF-Artikel).

Neues, global wiederverwendbares Tooltip-Muster gebaut (style.css +
script.js): .term-tip / .term-tip-popup — bei Hover per CSS, bei Klick
per JS umschaltbar (v.a. für Touch-Geräte), schließt bei Klick außerhalb
oder Escape. Zeigt die Glossar-Definition direkt inline, ohne die Seite
zu verlassen (Nutzerwunsch: Flyover statt Link+Zurück-Button). Mit Link
zum vollständigen Glossar-Eintrag am Ende des Tooltips für alle, die mehr
wollen.

Angewendet auf die erste "ESG"-Erwähnung im Fließtext (nicht im H1 selbst
-- siehe Fehlerkorrektur unten).

### Zwei eigene Fehler gefunden und korrigiert
1. Erste Version verschachtelte das Tooltip direkt in der H1. Beim
   Testen der Zweisprachigkeit gemerkt, dass das unnötig riskant ist
   (Screenreader-Semantik der Überschrift, SEO-Gewicht, fehleranfällige
   doppelte HTML-Entity-Kodierung im data-en-Attribut) -- zurückgebaut:
   H1 bleibt reiner Text, Tooltip sitzt stattdessen auf der ersten
   ESG-Erwähnung im Fließtext direkt darunter.
2. Echter CSS-Bug: .term-tip-popup war im Markup ein GESCHWISTER von
   .term-tip, die Hover-Regel ".term-tip:hover .term-tip-popup" ist aber
   ein Nachfahren-Selektor -- griff dadurch nie, und die
   position:absolute-Positionierung des Popups wäre ohnehin am falschen
   Eltern-Element verankert gewesen. Beim eigenen Playwright-Test sofort
   aufgefallen (Opacity blieb 0 trotz :hover-Match). Behoben durch
   Verschachtelung des Popups ALS KIND von .term-tip.

Nach der Korrektur mit echtem Chromium (Playwright) durchgetestet:
Hover zeigt/versteckt korrekt, Klick schaltet um (Touch), Klick außerhalb
und Escape schließen, funktioniert identisch in beiden Sprachen (inkl.
korrektem Rendering der verschachtelten HTML-Struktur nach
Sprachumschaltung über das data-en/data-de-System).

## V141 — Tooltip-Kontrast im Nachtmodus behoben
Bug: Popup-Hintergrund nutzte var(--ink), das im Nachtmodus zu einer
hellen Farbe wechselt (dunkel im Hell-Modus, hell im Dunkel-Modus per
Definition in style.css), während der Text hart auf Weiß gesetzt war —
im Nachtmodus damit weißer Text auf fast-weißem Grund.

Fix: Popup-Hintergrund und Pfeilfarbe fest auf #16233D gesetzt statt der
theme-abhängigen Variable, da ein Tooltip wie dieser bewusst unabhängig
vom Seiten-Theme immer gleich (dunkler Chip, weißer Text) aussehen soll.

Verifiziert mit echtem Chromium: Hintergrund/Textfarbe in Hell-Modus,
Dunkel-Modus und Dunkel+Hoher-Kontrast gemessen — in allen drei Fällen
konsistent #16233D-Hintergrund mit weißem Text.

## V142 — Tooltip verschwand unter dem Browser-/Vollbild-Rand behoben
Bug: Popup öffnete immer starr nach oben. War die Begriffsmarkierung
nah am oberen Bildschirmrand (z.B. weit gescrollt, oder im
Vollbildmodus mit wenig Platz oberhalb), rutschte das Popup über den
sichtbaren Bereich hinaus.

Fix: Neue "flip-down"-CSS-Variante ergänzt, die das Popup stattdessen
unterhalb des Begriffs öffnet. Eine JS-Funktion misst bei jedem
Hover/Klick den tatsächlich verfügbaren Platz oberhalb (getBoundingClientRect)
und schaltet automatisch um, wenn nicht genug Platz ist.

### Eigener Fehler bei der ersten Umsetzung gefunden und behoben
Erste Version hängte den mouseenter-Listener direkt an das jeweilige
Element. Beim Testen mit einem echten Browser fiel auf: der Listener
feuerte nie, obwohl weder Syntax- noch Laufzeitfehler auftraten. Ursache
gefunden: Die Sprachumschaltungs-Initialisierung (translatePage, läuft
bei JEDEM Seitenaufruf in DOMContentLoaded, auch beim Verbleib auf
Deutsch) ersetzt das innerHTML aller [data-en]-Elemente -- dabei werden
die Kind-Knoten komplett neu erzeugt, und direkt angehängte Listener
bleiben an den alten, verwaisten Knoten hängen. Der Klick-Handler
funktionierte nur, weil er von Anfang an über document delegiert war
(wie schon in V140 gebaut). Behoben durch denselben Ansatz für Hover:
statt direktem mouseenter-Listener am Element jetzt ein delegierter
mouseover-Listener auf document mit closest('.term-tip')-Prüfung --
funktioniert unabhängig davon, ob der DOM-Knoten zwischendurch ersetzt
wurde.

Mit echtem Chromium (Playwright) verifiziert: Begriff künstlich nah an
den oberen Rand versetzt (auch in einer breiten/flachen Viewport-
Konstellation, die den Vollbildmodus nachstellt) -- Popup klappt
korrekt nach unten und bleibt vollständig sichtbar (Top-Koordinate
>= 0). Normale Position weiterhin unverändert (Popup bleibt oben).
Klick-Umschalten weiterhin funktionsfähig.

## V143 — Farbkontrast der Callout-Boxen (Info-Box/Tip-Box) verbessert
Nutzer-Feedback: Blau- und Rostrot-Boxen im Hellmodus kaum sichtbar,
Rostrot im Dunkelmodus geht im Hintergrund unter. Kontrastwerte
nachgerechnet (WCAG-Luminanz-Formel): info-box (blau) vorher nur 1.07:1
gegen den Seitenhintergrund, tip-box (rostrot/amber) vorher 1.04:1 hell
bzw. 1.02:1 dunkel gegen die Kartenfläche — praktisch nicht
unterscheidbar.

Bewusst NICHT die geteilte --blue-soft-Variable global geändert (wird an
~15 Stellen für Badges/Icons/Hover-Hintergründe verwendet, Risiko für
ungewollte Nebenwirkungen dort) — stattdessen gezielt nur .info-box und
.tip-box selbst angepasst:
- .info-box Hellmodus: #E7EEF9 → #BFD8F5 (Kontrast 1.07 → 1.34)
- .info-box Dunkelmodus: unverändert (Nutzer-Wunsch: Kontrast war schon
  ausreichend)
- .tip-box Hellmodus: #FFF9EC → #F7DFA8 (Kontrast 1.04 → 1.2)
- .tip-box Dunkelmodus: #2A1E06 → #4A3410 (Kontrast 1.02 → 1.42)
Textkontrast innerhalb der Boxen bleibt exzellent (10.7–13:1), weiterhin
weit über WCAG-AA-Minimum.

### Beim Ausrollen 7 vergessene lokale Duplikate gefunden
Nach der zentralen Änderung in style.css automatisch nach lokalen
Kopien der alten Werte gesucht (da ein früherer Retrofit .info-box/
.tip-box "global gemacht" hatte, aber 6 ältere Artikel noch eigene,
hartkodierte <style>-Blöcke mit den alten Farben hatten, die die
zentrale Änderung sonst überschrieben hätten):
beitrag-bondora-go-and-grow.html, beitrag-etf-sparplan-fuer-anfaenger.html,
beitrag-msci-world-vs-ftse-all-world.html (dort als .hl-box.is-amber),
beitrag-notgroschen.html, beitrag-quellensteuer-dividenden.html,
beitrag-riester-vs-etf.html. Alle sieben Fundstellen (6x tip-box-Farben
+ 1x info-box-Farbe) einzeln korrigiert und mit echtem Chromium
nachgeprüft.

## V144 — Neuer Artikel: Die Rentenlücke
Letzter Artikel des Tages. beitrag-rentenluecke-eigene-saeulen.html,
unter Finanzen > Vermögensaufbau. Ausgangsmaterial war eine Stichpunkt-
Sammlung des Nutzers zur Renteninformation, Rentenlücke und eigenen
Vorsorgesäulen. Alle Kernfakten recherchiert und mit aktuellem
Rechtsstand (Juli 2026) belegt:

- Rentenniveau: exakt 48 % seit Juli 2026, per Rentenpaket 2025
  gesetzlich bis 2031 fixiert (nicht darüber hinaus) — bestätigt direkt
  bei Deutsche Rentenversicherung und Bundesregierung
- Demografisches Verhältnis: aktuell ca. 1,8 Beitragszahler je Rentner
  (38,5 Mio. : 21,3 Mio.), war 6:1 in den 1960ern, Prognose 1,5:1 bis 2030
- Rentenbesteuerung: 84 % steuerpflichtig für den Rentenjahrgang 2026,
  steigt auf 100 % für Jahrgang 2058 (Alterseinkünftegesetz 2005, Anteil
  lebenslang beim Renteneintritt fixiert)
- KVdR-Abzüge: ca. 8,75 % Krankenversicherung + 3,6-4,2 % Pflege-
  versicherung, zusammen 12-13 % direkt von der Bruttorente
- Vermögenswirksame Leistungen: Arbeitnehmersparzulage 20 % für
  Aktienfondssparplan (max. 80 €/Jahr) bzw. 9 % für Bausparvertrag
  (max. 43 €/Jahr), kombinierbar bis 123 €/246 € (ledig/verheiratet),
  Einkommensgrenze 40.000/80.000 € zvE
- "Neue Aktienrente" korrekt als Frühstart-Rente identifiziert und
  präzisiert: Diese ist NICHT für Erwachsene selbst, sondern eine neue
  Säule für die eigenen Kinder (6-18 Jahre), 10 €/Monat Staatszuschuss
  ins Kapitalmarkt-Depot — noch Referentenentwurf (Stand Juli 2026),
  geplant zum 01.01.2027, rückwirkend für Geburtsjahrgang 2020

Rechenbeispiel des Nutzers (2.500 € netto, 80 % Bedarf = 2.000 €,
1.250 € Rente, 750 € Lücke) übernommen und die Arithmetik in Python
nachgerechnet — stimmt exakt.

Eingebunden: FR_POSTS (104 Artikel), sitemap.xml (143 URLs), Cross-Link
im Kündigungsschutz-Artikel ergänzt, Tag-Balance und JSON-LD-Validität
geprüft.

## V145 — Neuer Artikel: Second-Hand-Mode-Marken (Vinted-Recherche)
Neue Datei beitrag-secondhand-mode-marken-liste.html, unter Minimalismus
> Nachhaltigkeit. Baut direkt auf der Marken-Recherche aus dem Chat auf
(Vinted-Wiederverkaufsdaten für Damen/Herren/Kinder).

Bewusst NICHT den bestehenden allgemeinen Artikel
beitrag-second-hand-nachhaltigkeit.html dupliziert (der behandelt
Second-Hand/Vintage allgemein inkl. Möbel) — stattdessen ein
eigenständiger, spezifischerer Artikel: der redaktionelle Kern ist
"warum Marke beim Gebrauchtkauf online zum Qualitätssignal wird" (kein
Anfassen, keine Retoure wie im Laden, Marke als Stellvertreter für
Stoffqualität/Passform/Wiederverkaufswert), plus die kategorisierte
Markenliste selbst.

Eigenen Fehler beim Cross-Linking vor dem Ausliefern gefunden: wollte
ursprünglich auf "beitrag-kleiderschrank-33-teile.html" verlinken —
das ist einer der 4 alten FR_POSTS-Einträge ohne link-Feld (kein
tatsächlicher Artikel vorhanden, aus einer früheren Session). Vor dem
Zusammensetzen bemerkt und durch einen tatsächlich existierenden
Cross-Link ersetzt.

Bidirektional verlinkt: neuer Cross-Link im bestehenden
Second-Hand-Artikel ergänzt, umgekehrt auch dort verlinkt.

Eingebunden: FR_POSTS (105 Artikel), sitemap.xml (144 URLs), Tag-Balance
und JSON-LD-Validität in beiden Artikeln geprüft.

## V146 — Neuer Artikel: Gewinnflussdiagramme Vonovia vs. Allianz
Neue Datei beitrag-gewinnflussdiagramme-vonovia-allianz.html, unter
Finanzen > Mein Portfolio. Ausgangsmaterial waren zwei vom Nutzer
hochgeladene Traderfox-Screenshots (Sankey-Gewinnflussdiagramme für
Vonovia und Allianz).

Bewusst NICHT die Traderfox-Bilder direkt eingebettet (Urheberrecht,
Drittanbieter-Tool-Branding passt nicht ins Seitendesign) — stattdessen
mit verifizierten Zahlen aus den echten Geschäftsberichten 2025 eigene,
ins Seitendesign passende Segment-Balken und eine Vergleichstabelle
gebaut.

### Zwei Zahlenkorrekturen bei der Recherche gefunden
- Vonovia-Dividendenrendite 2025: Nutzer nannte 5,8 %, TraderFox selbst
  (dieselbe Quelle wie die Screenshots) nennt 5,1 % (1,25 €/Aktie).
  TraderFox-eigene Zahl übernommen.
- Allianz-Dividendenrendite 2025: Nutzer nannte 3,56 %, mehrere
  unabhängige Quellen (aktien.guide, DivvyDiary, extraETF, diverse
  Finanznachrichten) stimmen übereinstimmend auf ca. 3,96 % überein
  (17,10 €/Aktie bei ~431 € Kurs, Stand 30.07.2026).

### Wichtige Präzisierung der eigentlichen Kernaussage
Reine EBITDA-Marge von Vonovia sieht auf den ersten Blick sogar besser
aus als Allianz' Kennzahlen (kein direkter Margenvergleich zwischen
Immobilien- und Versicherungsgeschäft möglich, unterschiedliche
Geschäftsmodell-Logik). Die eigentliche Geschichte ist nicht "Allianz
hat höhere Marge", sondern Kapitalintensität und Ergebnisstabilität:
Vonovia wies trotz solidem operativem Geschäft 2022-2024 drei
Verlustjahre in Folge aus (hohe Fremdfinanzierung, Zinslast,
Abschreibungen), Rückkehr in die Gewinnzone 2025 maßgeblich durch
Immobilien-Neubewertungen getrieben. Allianz zeigt dagegen eine deutlich
gleichmäßigere Ergebnishistorie (Aufwand-Ertrag-Verhältnis ~61 %,
bereinigte Eigenkapitalrendite 18,1 %, Solvency-II-Quote 218 %).

Verifizierte Kernzahlen: Vonovia Adjusted EBITDA Total 2.800,8 Mio. €
(+6 %), Segment Rental 2.445,0 Mio. €, Value-add 197,5 Mio. €,
Recurring-Sales-Segmenterlöse 439,6 Mio. €. Allianz Geschäftsvolumen
186,9 Mrd. €, operatives Ergebnis 17.400 Mio. € (Rekord, +8,4 %),
Dividendenwachstum +11 %.

Eingebunden: FR_POSTS (106 Artikel), sitemap.xml (145 URLs), Tag-Balance
und JSON-LD-Validität geprüft, Segment-Balken im Browser gerendert und
visuell bestätigt.

## V147 — Gewinnflussdiagramme: echte Trichter statt flacher Balken
Nutzer-Feedback: die Segment-Balken zeigten nicht den großen
prozentualen Anteil, den ein echtes Gewinnflussdiagramm zeigen soll —
"führt ein Gewinnflussdiagramm ad absurdum". Zu Recht: Balken waren
unabhängig skalierte Segment-Größen, kein Trichter/keine Verhältnis-
Darstellung.

Komplett neu gebaut: zwei echte Trichter-Diagramme (SVG, programmatisch
berechnete Trapez-Geometrie, geprüft auf monoton abnehmende, zentrierte
Breiten), je Unternehmen 3 Stufen mit vollständig recherchierten,
offiziellen Zahlen:

Vonovia (eigener Maßstab, Umsatz=100%): Umsatz 5.830 Mio. € → Adj.
EBITDA Total 2.800,8 Mio. € (48,0%) → Adj. EBT 1.904,3 Mio. € (32,7%).
Dabei die offizielle Überleitung Vonovias gefunden: -739,9 Mio. €
Netto-Finanzergebnis (im Kern Zinsen) ist der mit Abstand größte
Abzugsposten zwischen EBITDA und EBT — mehr als das gesamte
Jahresergebnis des Value-add-Segments.

Allianz (eigener Maßstab, Geschäftsvolumen=100%): Geschäftsvolumen
186.900 Mio. € → Operatives Ergebnis 17.400 Mio. € (9,3%) →
Bereinigter Jahresüberschuss der Anteilseigner 11.100 Mio. € (5,9%,
offizielle Pressemitteilung, +10,9% ggü. Vorjahr).

### Wichtige neue Sektion auf Nutzer-Hinweis
Auffällig: Vonovias Trichter verengt sich auf 32,7%, Allianz' auf nur
5,9% — naiv gelesen wirkt Vonovia dadurch profitabler, was falsch wäre
(unterschiedliche Konzepte: Immobilien-Umsatz vs. Versicherungs-
Geschäftsvolumen inkl. Prämien-Rückstellungen). Auf Nutzer-Einwand hin
("man kann Aktien nur innerhalb ihrer Branche direkt vergleichen, weil
die Geschäftsmodelle so verschieden sind") eine neue, eigene Sektion
ergänzt, die genau diesen Punkt explizit macht: die beiden Trichter
NICHT direkt übereinanderlegen, Marge/KGV/Kennzahlen nur branchenintern
vergleichbar.

Vergleichstabelle um die neuen "untere Ergebniszeile"-Zahlen ergänzt.
Verifiziert: Tag-Balance (inkl. SVG/path/text), JSON-LD-Validität,
Trichter-Geometrie rechnerisch geprüft, vollständiger Artikel im
Browser gerendert.

## V148 — Zwei neue, verlinkte Artikel: Apple-Sägezahn & Schweinezyklus
Ausgangsmaterial: zwei vom Nutzer hochgeladene ComputerBase.de-
Screenshots (Apple-Umsatz nach Segment, Apple-Umsatz-und-Gewinn-Verlauf
seit 2000), beide zeigen den charakteristischen Sägezahn durch Apples
jährlichen Produktzyklus.

### Wichtige inhaltliche Weichenstellung
Nutzer bat darum, das "Schweinezyklus"-Prinzip zu erklären, um zu
zeigen, warum Absatz/Gewinn nach Geräteeinführung sinkt. Vor dem
Schreiben recherchiert und festgestellt: Der echte Schweinezyklus
(Cobweb-Theorem, Arthur Hanau 1927) ist ein ANDERER Mechanismus als
Apples Muster — angebotsseitige Zeitverzögerung (Schweinemast dauert
~15 Monate, 3-4-Jahres-Zyklus) statt nachfrageseitiger Saisonalität
durch Launch-Termine (Apple, 1-Jahres-Zyklus). Beide vermischt
darzustellen wäre fachlich falsch gewesen. Stattdessen bewusst zwei
eigenständige, bidirektional verlinkte Artikel mit einer expliziten
Abgrenzungs-Tabelle gebaut, statt den Nutzerwunsch unreflektiert
umzusetzen.

### Artikel 1: beitrag-apple-saegezahn-zyklische-aktien.html
Apples Sägezahn erklärt anhand aktueller, verifizierter Zahlen aus dem
laufenden Geschäftsjahr 2026: Q1 GJ2026 (Weihnachtsquartal) 143,8 Mrd. $
vs. Q3 GJ2026 109,4 Mrd. $ — 34,4 Mrd. $ / 24 % Rückgang innerhalb
desselben Geschäftsjahres, bei gleichzeitig +15,7 % Jahreswachstum im
Vorjahresvergleich des Weihnachtsquartals. Bilder selbst nicht
eingebettet (Urheberrecht, ComputerBase.de als Quelle der
Musterbeschreibung genannt). Nutzer-Beispiele Eisdielen/Einzelhandel
als echte nachfrageseitige Parallelen übernommen.

### Artikel 2: beitrag-schweinezyklus-zyklische-aktien.html
Der echte Schweinezyklus korrekt erklärt: Ursprung 1927, Cobweb-
Theorem, 15-Monate-Produktionsverzug bei Schweinen, 3-4-Jahres-Zyklus.
Moderne, fachlich korrekte Parallelen: Speicherchips (DRAM/NAND, 2-3
Jahre Fab-Bauzeit — offiziell als Wikipedia-belegtes modernes Beispiel
bestätigt) und Automobilindustrie (Nutzer-Vorschlag, echter
Schweinezyklus-Fall wegen langer Kapazitätsplanung). Direkte
Verbindung zu Artikel 1 hergestellt: Apples eigener Q3-2026-Ausblick
nennt steigende Speicherpreise als Gegenwind — der Schweinezyklus
taucht damit innerhalb der Lieferkette eines Sägezahn-Unternehmens auf,
zwei verschiedene zyklische Mechanismen übereinandergelagert.
Vergleichstabelle grenzt beide Prinzipien explizit gegeneinander ab.

Eingebunden: FR_POSTS (108 Artikel), sitemap.xml (147 URLs), Tag-Balance
und JSON-LD-Validität in beiden Artikeln geprüft, bidirektionale
Cross-Links gesetzt.

## V149 — Koordinaten-Grafiken mit Zeitachse für beide Artikel ergänzt
Nutzer-Wunsch: das optische Element fehlte — Launch/Abfall/Launch-auf-
höherem-Niveau bei Apple, die längere Oszillation beim Schweinezyklus.
Beide als eigene, programmatisch erzeugte SVG-Koordinatensysteme mit
Zeitachse gebaut (kein Chart-Framework, gleiche Handschrift wie die
Trichter-Diagramme aus V147).

Apple-Sägezahn-Grafik: 8 Quartale (Q1 GJ2025 – Q4 GJ2026), X-Achse
Quartale, Y-Achse Umsatz in Mrd. $. Drei reale, bestätigte Werte als
ausgefüllte Punkte (Q1 GJ25: 124,3 / Q1 GJ26: 143,8 / Q3 GJ26: 109,4),
restliche Quartale als offene Kreise klar als illustrativ markiert.
Gestrichelte Trendlinie durch die Launch-Gipfel zeigt das steigende
Niveau von Zyklus zu Zyklus.

Schweinezyklus-Grafik: 12 Jahre Zeitachse, Y-Achse Preisindex um einen
markierten Gleichgewichtspreis (100) oszillierend, mit den drei
Kernphasen beschriftet (Boom → Überangebot → Knappheit) und einer
Klammer, die die typische 3-4-Jahres-Zyklusdauer zeigt.

Beim eigenen Verifizieren einen Fehlalarm aufgeklärt: getBBox() auf dem
rotierten Y-Achsen-Titel meldete zunächst eine Position außerhalb des
sichtbaren Bereichs — getBBox() gibt aber die Bounding-Box VOR der
Transformation zurück, nicht die tatsächliche Bildschirmposition.
Mit getBoundingClientRect() (berücksichtigt Transforms) neu geprüft:
keine echten Probleme, alle Text-Elemente korrekt im sichtbaren Bereich
beider Grafiken.

Verifiziert: Tag-Balance (inkl. svg/circle/line/path/text) in beiden
Artikeln, JSON-LD-Validität, beide Diagramme im vollständigen
Artikelkontext gerendert.

## V150 — Kaffee-Button öffentlich in den Footer, aus dem Easter Egg heraus
Nutzer-Wunsch: "Buy me a coffee"-Button auf die Landingpage, nicht mehr
nur im versteckten Easter-Egg-Panel. Bestehenden, bereits fertig
gestylten Baustein (fr-coffee-btn, inkl. Dampf-Hover-Animation)
wiederverwendet statt neu gebaut — sorgt für optische Konsistenz.

Platzierung: erste Footer-Spalte, direkt unter den Social-Links (nicht
als schwebender Button, der bei einer Finanzseite aufdringlich wirken
könnte — passt stattdessen thematisch zu "weitere Wege, mit uns in
Kontakt zu treten"). Sub-Zeile für den öffentlichen Kontext angepasst
("Unterstütze uns" / EN "Support us", wie gewünscht) statt der
Easter-Egg-spezifischen "Du hast das Versteck gefunden".
Ziel-URL weiterhin Platzhalter (FR_KAFFEE_LINK in script.js).

### Eigener Fehler gefunden und behoben
Die bestehende JS-Logik (frInitKaffeeButton) suchte den Button über
eine einzelne feste ID -- mit jetzt zwei Instanzen auf derselben Seite
(Easter Egg + Footer) wäre die neue Footer-Instanz nie aktiviert
worden (Link bliebe leer, Button dauerhaft ausgegraut). Vor dem
Ausliefern bemerkt und behoben: Logik läuft jetzt über alle
.fr-coffee-btn-Elemente per Klasse, nicht mehr über eine feste ID.
Mit Playwright beide Instanzen einzeln geprüft: beide bekommen
korrekt die Ziel-URL, keine ist deaktiviert.

### Kontrast direkt mitkorrigiert
Beim Bauen aufgefallen: --coffee-soft hatte denselben "kaum sichtbar"-
Fehler wie die Info-/Tip-Box vorhin (Kontrast nur ~1,05-1,06 gegen den
Seitenhintergrund in beiden Modi). Da diese Variable ausschließlich vom
Kaffee-Button genutzt wird (keine Fremdnutzung wie bei --blue-soft),
diesmal direkt an der Wurzel-Variable korrigiert: Hell #F6EDE2→#EFDCC4
(Kontrast 1,06→1,23), Dunkel #2A2118→#3D2D1A (1,05→1,26). Textkontrast
bleibt exzellent (11,7 / 5,97).

Verifiziert: Tag-Balance, CSS-Klammern-Balance, beide Button-Instanzen
im echten Browser (Chromium) auf korrekte href-Zuweisung in Hell- und
Dunkelmodus geprüft.

## V151 — Neuer Artikel: Handelszeiten & Spread + Glossar-Eintrag
Neue Datei beitrag-spread-handelszeiten.html, unter Finanzen > ETF &
Sparplan. Nutzer-Stichpunkte recherchiert und bestätigt:
- Xetra-Kernzeit 9:00-17:30 Mo-Fr, höchste Liquidität, engste Spreads
  (Deutsche Börse offiziell bestätigt)
- Engste Spreads 15:30-17:30 durch Überschneidung mit US-Börsen
  (mehrere unabhängige Quellen übereinstimmend)
- Spread-Liquiditäts-Mechanismus korrekt als Market-Maker-Risikoaufschlag
  erklärt (nicht als reine "Angebot-Nachfrage"-Vereinfachung)

Ein wichtiger, aktueller Fund ergänzt, den der Nutzer nicht erwähnt
hatte: Seit 1. Dezember 2025 gibt es den Extended Xetra Retail Service
der Deutschen Börse — Partner-Broker können Privatanlegern jetzt auch
8:00-9:00 und 17:30-22:00 Uhr Handel anbieten, außerhalb der offiziellen
Kernsitzung mit entsprechend breiteren Spreads. Ändert die Einordnung
von "außerhalb dieser Zeiten kaum handelbar" zu "handelbar, aber bewusst
mit Limit-Order und Blick auf breitere Spreads".

Asiatische Börsenzeiten wie vom Nutzer angeregt eingeordnet: Tokio/
Hongkong/Shanghai laufen grob 1:00-8:00 MEZ, meist schon geschlossen,
bevor Xetra öffnet — anders als bei der US-Überschneidung kein
Liquiditäts-Überschneidungseffekt, sondern Stimmungseinfluss auf die
deutsche Eröffnungsauktion.

ETF-Sparplan-Ausführungszeitpunkt (Broker entscheidet) vs. Direktkauf
bei Neobrokern (Nutzer kontrolliert Timing, ~1€ Gebühr) wie vom Nutzer
skizziert gegenübergestellt.

### Glossar-Eintrag + Flyover-Tooltip
Neuer Glossar-Eintrag "Spread" ergänzt. Im Artikeltext die erste
Erwähnung von "Spread" mit dem in V140-142 gebauten Flyover-Tooltip-
Muster versehen (Hover/Klick zeigt Definition inline, mit Link zum
vollständigen Glossar-Eintrag) — mit dem Chromium-Test aus V140-142
erneut in beiden Sprachen bestätigt: Hover zeigt korrekten Text,
funktioniert nach Sprachumschaltung identisch.

Eingebunden: FR_POSTS (109 Artikel), sitemap.xml (148 URLs), Tag-Balance
und JSON-LD-Validität geprüft.

## V152 — Spread-Artikel: griffigerer Titel
"Handelszeiten & Spread: Wann Kaufen und Verkaufen günstiger wird" →
"Börsenzeiten & Spread: Clever kaufen und verkaufen — aufs Zeitfenster
achten". Aktualisiert an allen 6 Stellen: Title-Tag, og:title, JSON-LD
headline, Breadcrumb, H1, FR_POSTS-Eintrag, plus Link-Text im
Spread-Glossareintrag angeglichen.

## V153 — Neuer Artikel: "Alle verkaufen!" — Börsenpanik für Einsteiger
Neue Datei beitrag-boersenpanik-jeder-verkauft.html, unter Finanzen >
ETF & Sparplan. Nutzer-Kernaussage bestätigt und recherchiert:

- Grundmechanik verifiziert: Jeder Handel braucht zwingend Käufer UND
  Verkäufer, "alle verkaufen" ist mathematisch unmöglich (Kauf- und
  Verkaufsvolumen sind per Definition identisch)
- Handelsaussetzungen offiziell bei Deutsche Börse/Xetra nachgelesen:
  Volatilitätsunterbrechung (häufig, mind. 2-Min-Auktion) und
  Handelsaussetzung (selten, unternehmensspezifische Umstände wie
  drohende Insolvenz) sind beide einzeltitelbezogen -- bestätigt genau
  den Nutzer-Punkt "nur bei Aktien, die ins Straucheln gekommen sind"

### Eine ehrliche Nuance ergänzt, die der Nutzer nicht erwähnt hatte
Bei der Recherche eine echte Ausnahme gefunden: In den USA gibt es
zusätzlich einen marktweiten Circuit Breaker (S&P 500 -7/-13/-20%),
der den GESAMTEN Markt anhalten kann -- zuletzt März 2020, viermal in
zehn Tagen. Bewusst nicht verschwiegen, sondern als "sehr seltene"
Ausnahme neben die häufigen Einzeltitel-Mechanismen gestellt, für ein
vollständiges statt nur bestätigendes Bild.

### Trump-Wochenend-Zoll-Muster mit konkretem Beleg
Recherchiert und einen echten, dokumentierten Fall gefunden statt nur
allgemein zu behaupten: Januar 2026, Zollankündigung gegen 8
europäische Staaten (inkl. Deutschland) an einem Samstag im
Grönland-Streit, US-Börsen montags zusätzlich feiertagsbedingt
geschlossen -- erste Reaktion erst Dienstag, VIX +25% an einem Tag.
Bewusst NICHT als Beweis für Absicht dargestellt, sondern als
illustrativer Einzelfall mit Verweis auf den rein mechanischen Effekt
(Nachrichten stauen sich, bis der Markt wieder öffnet).

ETF-Diversifikations-Punkt verifiziert: MSCI World aktuell rund 1.300
Unternehmen (Nutzer nannte ">1600" -- je nach Quelle/Rebalancing-
Zeitpunkt zwischen ca. 1.300 und 1.600, aktuellste Quelle: 1.311).

### Eigener Fehler gefunden und behoben
Beim Eintragen in FR_POSTS ein gerades Anführungszeichen statt des
schließenden typografischen Zeichens verwendet ("...verkaufen!" statt
"...verkaufen!") -- das gerade Zeichen kollidierte mit dem
JS-String-Trenner und brach die Datei. Beim eigenen node -c-Syntax-Check
sofort aufgefallen, vor Auslieferung korrigiert. Alle data-en-Attribute
im Artikel zusätzlich programmatisch auf dasselbe Muster geprüft --
keine weiteren Fälle gefunden.

Bidirektional mit dem Spread-Artikel verlinkt. Eingebunden: FR_POSTS
(110 Artikel), sitemap.xml (149 URLs), Tag-Balance und JSON-LD-
Validität geprüft.

## V154 — Börsenzeiten-Artikel: Zeitstrahl-Grafik Asien/Europa/USA
Nutzer-Wunsch: die drei Börsenregionen als Zeitstrahlen übereinander,
Kernzeiten plausibler dargestellt statt nur als Textliste.

Neue SVG-Grafik gebaut (programmatisch berechnete Geometrie, gleiche
Handschrift wie die Trichter-/Sägezahn-Diagramme): drei Zeilen (Asien,
Europa/Xetra, USA) auf einer gemeinsamen 24-Stunden-Achse, mit:
- Asien: 1:00–9:00 MESZ (kombinierte Tokio/Hongkong/Shanghai-Spanne,
  vereinfacht)
- Europa: heller Hintergrund-Balken für Extended Retail Service
  (8:00–22:00) mit hervorgehobener Kernzeit darüber (9:00–17:30)
- USA: 15:30–22:00 MESZ (NYSE/NASDAQ)
- Grün hervorgehobene, gestrichelt umrandete Überschneidungszone
  15:30–17:30 quer über alle drei Zeilen — macht das "engster Spread"-
  Fenster aus dem Fließtext jetzt auch visuell sofort erkennbar

Macht die im Artikel bereits beschriebene Kernaussage auf einen Blick
sichtbar: Asien und Europa überschneiden sich praktisch nicht (Asien
schließt, wenn Xetra öffnet), während Europa und USA sich zwei volle
Stunden überlappen.

Beim eigenen Verifizieren einen echten Platzproblem gefunden: die
Zeilen-Beschriftungen ("USA (NYSE/NASDAQ)") waren zu lang für den
ursprünglich vorgesehenen linken Rand und liefen über den Bildrand
hinaus. Vor dem Einbau mit rechnerischer Bounding-Box-Prüfung (echte
Bildschirmposition, nicht die rohe SVG-BBox) aufgefallen und durch
größeren linken Rand behoben, danach erneut geprüft: keine
Positionsprobleme mehr.

Verifiziert: Tag-Balance (inkl. svg/rect/line/text), JSON-LD-Validität,
Textpositionen rechnerisch gegen Canvas-Grenzen geprüft, im vollständigen
Artikelkontext gerendert.

## V155 — Neuer Artikel: Börsenspiele (Hochfrequenzhandel & Insiderhandel)
Neue Datei beitrag-boersenspiele-hft-insiderhandel.html, unter Finanzen
> ETF & Sparplan. Nutzer-Skizze in zwei fachlich getrennte Teile
aufgeteilt statt vermischt dargestellt:

### Teil 1: Latenzarbitrage ("Mikro-Handel", Kabellänge)
Vollständig verifiziert und mit konkreten Zahlen belegt: Spread-
Networks-Kabel (2010, ~300 Mio. $, geheim verlegt, geradestmögliche
Route Chicago–New Jersey für ~1ms Vorteil), heutiger Mikrowellen-Rekord
~4ms, SPY-ETF-Arbitrage-Wert ~75 Mio. $/Jahr laut akademischer Studie
(Budish et al.), HFT-Anteil ~50% (Deutsche Börse) bzw. ~70% (US-Börsen)
des Handelsvolumens. Als legales, risikoarmes, aber für Privatanleger
irrelevantes "Zuschauersport"-Phänomen eingeordnet.

### Teil 2: Kursbewegung durch Social-Media-Posts — korrigierte Einordnung
Nutzer hatte formuliert, dass mächtige Menschen mit Richtlinien-
Kompetenz und Zeitpunkt-Wissen "daraus eine Einnahmequelle" machen
könnten. Bewusst NICHT so übernommen, sondern korrekt als Insiderhandel
eingeordnet -- mit drei echten, dokumentierten Fällen statt allgemeiner
Behauptung:
- Musk 2018 "funding secured"-Tweet: SEC-Klage wegen Wertpapierbetrugs,
  je 20 Mio. $ Strafe für Musk und Tesla, Rücktritt als Chairman
- Musk Mai 2020: Tweet "Aktie zu teuer", Kurs fällt >10% am selben Tag
- Trump April 2025: Post mit Initialen "DJT" (= Börsenkürzel seiner
  eigenen Truth-Social-Aktie), DJT +22%, ~200 Mio. $ Papiergewinn
  persönlich (53% Anteil), <4 Std. später eigentliche Zollankündigung,
  US-Indizes +8-12% an einem Tag. Kapitalmarktstratege Martin Lück
  (Franklin Templeton) nannte es explizit Lehrbuch-Insiderhandel.

Rechtliche Einordnung präzise dargestellt: EU-Marktmissbrauchsverordnung
(MAR) und US-STOCK-Act (2012) statt vager "nur für Mächtige möglich"-
Formulierung -- macht klar, dass es sich um eine konkret strafbare
Handlung handelt, nicht um eine Grauzonen-Einnahmequelle.

Bidirektional mit dem Panik-Artikel verlinkt. Diesmal beim FR_POSTS-
Eintrag bewusst über Python-Stringverkettung statt manuellem Copy-Paste
gearbeitet (nach dem Anführungszeichen-Fehler in V153) und sofort mit
node -c geprüft, bevor weitergemacht wurde.

Eingebunden: FR_POSTS (111 Artikel), sitemap.xml (150 URLs), Tag-Balance
und JSON-LD-Validität geprüft.

## V156 — Zentrales automatisches Glossar-Verlinkungssystem
Großer Nutzer-Wunsch: alle 111 Artikel mit Glossar-Flyover-Tooltips für
Fachbegriffe versehen. Bewusst NICHT 111 Dateien von Hand angefasst
(fehleranfällig, siehe die Anführungszeichen-Bugs in V153/V155) —
stattdessen ein zentrales, automatisches System gebaut, das dieselbe
Wirkung erzielt, aber wartbar bleibt.

### Glossar erweitert
14 neue, recherchierte Einträge in glossar.html ergänzt (alphabetisch
einsortiert, Tag-Balance geprüft): Ausschüttend/Thesaurierend, Blue
Chip, Circuit Breaker, Combined Ratio, Diversifikation, Dividenden-
rendite, EBIT & EBITDA, Insiderhandel, Market Maker, Marktkapitali-
sierung, Rendite, Tracking Difference, Volatilitätsunterbrechung,
Zinseszins. Begriffe u.a. anhand von Fachlexika (Gabler Versicherungs-
lexikon, Morningstar, geld.de) verifiziert.

### Automatisches Erkennungssystem (script.js)
Neues FR_GLOSSARY-Wörterbuch (Begriff → Definition DE/EN + Glossar-ID)
plus eine Funktion frAutoLinkGlossary(), die beim Laden jeder
Artikelseite automatisch die ERSTE Erwähnung jedes bekannten Begriffs
im Fließtext findet und mit demselben Flyover-Tooltip versieht wie die
von Hand gebauten (ESG, Spread aus V140-155) -- nutzt dieselben CSS-
Klassen und damit automatisch dieselbe Hover-/Klick-/Flip-Down-Logik,
ohne zusätzlichen Code. Neue Begriffe künftig einfach im Wörterbuch
ergänzen, wirkt dann automatisch überall, keine einzelne Artikeldatei
muss mehr angefasst werden.

Technische Absicherung:
- Laengere Begriffe (EBITDA) werden vor kuerzeren (EBIT) geprueft,
  damit keine falsche Teilzerlegung entsteht
- Ausschlussliste verhindert Verlinkung in Ueberschriften, Labels,
  Tabellenkoepfen, bereits vorhandenen Links/Tooltips
- Bereits von Hand gesetzte Tooltips (ESG, Spread) werden erkannt und
  nicht doppelt verlinkt
- Ueber den bestehenden frPageRecomputers-Hook wird das System nach
  jedem Sprachwechsel automatisch neu ausgefuehrt, da die Sprach-
  umschaltung (translatePage) den Text sonst ueberschreiben und die
  Tooltips damit wieder entfernen wuerde

### Eigene Fehler gefunden und behoben
Beim ersten Bauen der Datei ein mehrfaches Escaping-Problem im
regulaeren Ausdruck verursacht (4-8 Backslashes statt der noetigen 2),
das die gesamte Datei syntaktisch ungueltig gemacht haette. Nicht
blind ausgeliefert, sondern isoliert mit einem eigenen Node-Test
nachvollzogen, korrigiert und die Regex-Logik separat vom DOM-Code
verifiziert, bevor es in script.js eingebaut wurde. Danach beim ersten
Live-Test auf einem echten Artikel eine zweite Fundstelle entdeckt:
ein Treffer landete in einem GROSSBUCHSTABEN-gestylten Label-Element
("DIVIDENDENRENDITE" statt "Dividendenrendite") -- Ausschlussliste um
Label-Klassen und th-Tabellenkoepfe erweitert.

### Verifiziert
- Regex-Logik isoliert in Node getestet (EBITDA korrekt als Ganzes
  erkannt, nicht in EBIT+DA zerlegt)
- Mit echtem Chromium (Playwright) auf mehreren Artikeln geprüft:
  korrekte Tooltip-Platzierung, keine Doppelung bei bereits manuell
  vorhandenen Tooltips (ESG-, Spread-Artikel), vollständiger
  Sprachumschaltungs-Zyklus DE→EN→DE funktioniert (Tooltips
  verschwinden auf Englisch wie dokumentiert, kommen beim
  Zurückschalten korrekt wieder)
- Stichprobe von 12 zufällig ausgewählten Artikeln (Mix aus alten und
  neuen) durchgetestet: 0 JS-Fehler, sinnvolle Tooltip-Platzierung
- Startseite und glossar.html selbst geprüft: kein Fehler, kein
  ungewolltes Aktivwerden (kein Artikel-Wrapper vorhanden)

### Bekannte Grenze (transparent)
Das System deckt aktuell 15 Begriffe ab (die 14 neuen plus "Spread",
das bereits im Woerterbuch fuer Konsistenz mitlaeuft), nicht jeden
denkbaren Fachbegriff der Seite -- aber jeder weitere Begriff ist ab
jetzt ein Ein-Zeilen-Eintrag im FR_GLOSSARY-Objekt, keine erneute
Artikel-fuer-Artikel-Aktion mehr.

## V157 — Globale Prozent-Formatierung + 4 vorbestehende Bugs gefunden
Nutzer-Vorgabe: "10,3 %" bricht bei vergrößerter Schrift das % auf eine
eigene Zeile um. Ab jetzt global "10,3%" (kein Leerzeichen) — nach
demselben Muster wie das Glossar-System (V156): ein Skript, das beim
Laden automatisch jedes "Zahl Leerzeichen %" im Artikeltext korrigiert,
für alle 111 Artikel gleichzeitig, ohne die Quelldateien einzeln
anzufassen. Bewusst nur bei % angewendet, nicht bei € (dort ist das
Leerzeichen deutsche Standardkonvention, Nutzer bestätigte das Problem
sei dort seltener).

Regex-Logik vorab isoliert mit realistischen Testfällen durchgespielt
(Bereiche wie "70-80 %", Tausendertrennzeichen "1.234,5 %", bereits
korrekte Fälle bleiben unveraendert) — alle korrekt.

### 4 vorbestehende Bugs gefunden (unabhängig vom eigentlichen Auftrag)
Beim breiten Testen der neuen Funktion auf einer Zufallsstichprobe kam
ein JS-Fehler auf einer Seite hoch ("FR_WARNUNG bereits deklariert").
Ursache: script.js war dort ZWEIMAL eingebunden, was jede globale
Konstante beim zweiten Ausführen zum Absturz bringt — betraf dadurch
vermutlich nicht nur die neue Prozent-Korrektur, sondern auch
Sprachumschaltung, Schriftgrößen-Regler und weitere Skript-Funktionen
auf der betroffenen Seite. Sitehweit nachgeprüft: insgesamt 4 Seiten
betroffen (beitrag-reit-etf-vs-immobilie.html, beitrag-anlage-kap.html,
beitrag-neobroker-etf-vergleich.html, rechner.html) — vermutlich Reste
aus früheren Bearbeitungssitzungen. Doppelte Einbindung jeweils entfernt,
alle vier danach fehlerfrei bestätigt.

### Verifiziert
- Regex-Logik isoliert mit 8 Testfällen durchgespielt (siehe oben)
- Auf dem prozentreichsten Artikel (Vonovia/Allianz, 25 Vorkommen):
  alle korrigiert, keines mit Leerzeichen übrig
- Stichprobe von 15 zufälligen Artikeln: 69 korrekt formatierte Werte,
  0 verbleibend mit Leerzeichen, dabei die 4 oben genannten
  vorbestehenden Bugs gefunden und behoben
- Alle 4 reparierten Seiten einzeln erneut auf Fehlerfreiheit und
  korrekte %-Formatierung geprüft

## V158 — "Alle verkaufen"-Artikel: Kostolany-Zitat und neue Sektion
Nutzer-Wunsch: Unterzeile "Alle wollen raus? Dann gehört Ihnen der
Verlust allein" plus Kostolany-Zitat, mit klarer Botschaft gegen
unüberlegte Panik-Verkäufe.

Kostolany-Zitat vor der Verwendung gegengecheckt (echte Person, Zitat-
Genauigkeit wichtig): verifizierte Formulierung ist "Ihr Geld ist nicht
weg, mein Freund — es hat nur ein anderer" (12 Wörter, unter dem
15-Wort-Limit für Einzelzitate). Leicht andere Formulierung als vom
Nutzer vorgeschlagen, dieselbe Aussage — die verifizierte Version
übernommen statt der ungeprüften.

Unterzeile direkt unter der Hauptüberschrift ergänzt (Mono-Stil,
Grossbuchstaben, dezent). Neue Sektion "Was mit denen passiert, die in
der Panik verkaufen" vor der bestehenden Tipp-Box eingefügt: Zitat als
Pull-Quote, Erklärung dass ein Kursrückgang erst beim Verkauf zum
realisierten Verlust wird, historische Markterholung nach Panikphasen
eingeordnet -- bewusst MIT Einschränkung direkt im Anschluss (kein
Signal für einen bestimmten Kauf, manche Unternehmen verdienen ihren
fallenden Kurs, "erholt sich immer" gilt für breite Märkte über lange
Zeiträume, keine Garantie für Einzeltitel oder bestimmten Zeitraum) --
um keine unbegründete Kaufempfehlung auszusprechen, sondern die
Marktmechanik einzuordnen.

Verifiziert: Tag-Balance, JSON-LD-Validität, Zitatlänge unter dem
Urheberrechts-Limit, mit echtem Chromium fehlerfrei gerendert.

## V159 — Zeitstrahl-Grafik: Dunkelmodus-Kontrast behoben
Bug: Die Börsenzeiten-Zeitstrahl-Grafik (V154) nutzte fest codierte
Hex-Farben (#16233D für Zeilen-Labels, #5B677A für Zeitachsen-
Beschriftung, #E4E6EA für Gitterlinien) statt der theme-abhängigen
CSS-Variablen des restlichen Seitendesigns. Im Hellmodus dunkler Text
auf hellem Hintergrund = lesbar; im Dunkelmodus derselbe dunkle Text
auf dunklem Seitenhintergrund = praktisch unsichtbar.

Alle 25 betroffenen Stellen innerhalb des SVG auf var(--ink) (Zeilen-
Labels), var(--ink-soft) (Zeitachsen-Beschriftung, Extended-Retail-
Hinweis) und var(--line) (Gitterlinien) umgestellt -- dieselben
Variablen, die der Rest der Seite fuer Text/Linien nutzt. Die farbigen
Balken selbst (Asien/Europa/USA, tuerkis/blau/orange) sowie die
Ueberschneidungs-Hervorhebung blieben unveraendert, da feste
Markenfarben mit ausreichendem Eigenkontrast in beiden Modi.

Verifiziert: Tatsaechliche gerenderte Textfarbe in Hell- und
Dunkelmodus mit echtem Chromium gemessen -- Hellmodus rgb(22,35,61)
(=#16233D), Dunkelmodus rgb(233,236,241) (=#E9ECF1), beide korrekt
theme-passend. Tag-Balance und JSON-LD-Validitaet nach der Aenderung
bestaetigt.

## V160 — Glossar-Auto-Linking: Englische Erkennung nachgerüstet
Nutzer-Beobachtung: "Market Maker" hatte im Deutschen einen Flyover, im
Englischen nicht. War kein Bug im klassischen Sinn, sondern eine schon
dokumentierte Abkuerzung ("wirkt nur auf die deutsche Textversion") --
jetzt richtig nachgeruestet, da die Inkonsistenz zum bereits im
Englischen funktionierenden "Spread"-Tooltip zu Recht auffiel.

Neues FR_GLOSSARY_EN-Woerterbuch ergaenzt (12 der 15 Begriffe --
"Rendite"/"Return" und "Thesaurierend"/"Accumulating" bewusst
ausgelassen, da die englischen Woerter zu generisch sind und ausserhalb
des Finanzkontexts falsch-positive Treffer erzeugen wuerden). Matching
im Englischen bewusst gross-/kleinschreibungs-unabhaengig (anders als im
Deutschen), da englische Fliesstext-Begriffe anders als deutsche
Substantive meist klein geschrieben werden. Zusaetzlich optionaler
Plural (-s) fuer englische Begriffe zugelassen ("market makers" wird
erkannt, nicht nur die Einzahl).

### Zwei echte Bugs beim Testen gefunden und behoben
1. Bei Textstellen ohne data-en-Attribut (z.B. reine Zahlenzellen in
   Tabellen) wurde beim Sprachwechsel nichts zurueckgesetzt -- ein im
   Deutschen eingefuegter Tooltip blieb dadurch auch im Englischen mit
   deutschem Inhalt sichtbar. Behoben durch Selbstheilung: die Funktion
   entfernt jetzt bei jedem Lauf zuerst ihre eigenen fruehen
   Einfuegungen (markiert mit data-auto-glossary="true", um sie von
   Hand gebauten Tooltips wie ESG/Spread zu unterscheiden) und baut sie
   dann fuer die aktuelle Sprache neu auf.
2. Der TreeWalker durchsuchte auch SVG-Inhalte und fuegte an einer
   Stelle einen Tooltip-Span als Kind eines SVG-<text>-Elements ein --
   ungueltiges Markup (span ist dort kein zulaessiges Kind), das zu
   unvorhersehbarem CSS-Verhalten fuehrte (Popup blieb sichtbar/
   inner_text zeigte den kompletten Popup-Inhalt statt nur des
   Ausloese-Worts). Beim gezielten Nachmessen der tatsaechlichen
   CSS-Sichtbarkeit gefunden (parentTag war "text" statt eines echten
   HTML-Tags) -- svg zur Ausschlussliste des TreeWalkers hinzugefuegt.

Verifiziert: isoliert in Node getestet (case-insensitives Matching,
Plural-Erkennung), vollstaendiger DE->EN->DE-Zyklus auf 4 Artikeln
(inkl. der Chart-Artikel mit dem SVG-Bug) fehlerfrei, Stichprobe von
15 zufaelligen weiteren Artikeln: 0 JS-Fehler.

## V161 — Glossar-Link im Flyover: echter Bug behoben (kein Browser-Problem)
Nutzer meldete: Klick auf "Ganzer Glossar-Eintrag →" im Tooltip
funktioniert in Vivaldi nicht, nur per Rechtsklick "in neuem Tab
öffnen". Vermutung war ein Browser-Problem -- war es nicht.

Ursache im eigenen Code gefunden: Der Klick-Handler für das Öffnen/
Schließen der Tooltips fängt JEDEN Klick ab, dessen Ziel innerhalb
eines .term-tip liegt, und ruft e.preventDefault() auf. Da der Glossar-
Link ein Nachfahre von .term-tip ist (im Popup verschachtelt), wurde
sein Standard-Navigationsverhalten dadurch fälschlich blockiert --
Rechtsklick-Kontextmenü-Aktionen laufen nicht über denselben Pfad,
weshalb "in neuem Tab öffnen" trotzdem funktionierte und den falschen
Eindruck eines Browser-spezifischen Problems erweckte.

Fix: Klicks auf einen Link innerhalb von .term-tip-popup werden jetzt
explizit vom Toggle-Handler ausgenommen und navigieren normal.

Verifiziert mit echtem Chromium: echter (Links-)Klick auf den Link
navigiert jetzt korrekt zu glossar.html#<id>. Restliche Klick-Logik
(Öffnen/Schließen bei Klick auf den Begriff, Schließen bei Außenklick)
weiterhin unverändert funktionsfähig.

## V162 — Neuer Artikel: Sparziele nach Alter (US-Vorlage + deutsche Realität)
Neue Datei beitrag-sparziele-nach-alter.html, unter Finanzen >
Vermögensaufbau. Ausgangsmaterial: vom Nutzer hochgeladenes Fidelity/
Business-Insider-Chart (US-Sparziele nach Alter als Gehalts-Vielfaches)
sowie eigene, teils ältere Recherche-Notizen des Nutzers als Excel
(2012er- und 2021er-Vermögensverteilungsdaten).

Nutzer-Notizen mit aktuelleren, offiziellen Zahlen abgeglichen statt
direkt übernommen: Bundesbank-PHF-Erhebung 2023 (ausgewertet vom IW
Köln, IW-Kurzbericht 59/2025) liefert die vollständige, aktuelle
Alters-Aufschlüsselung des Median-Nettovermögens — unter 35: 17.300 €,
35-44: 75.500 €, 45-54: 146.200 €, 55-64: 241.100 € (Höchstwert),
65-74: 193.300 €, 75+: 172.500 €, Gesamt-Median 103.100 €. Deutlich
aktueller als die 2012/2021-Daten aus der Nutzer-Recherche.

Kernbotschaft des Nutzers ("wichtig ist zu STARTEN, nicht die exakte
Zahl") mit echten, verifizierten Beteiligungszahlen untermauert:
- Nur rund 20 % der deutschen Erwachsenen besitzen überhaupt Aktien/
  Fonds/ETFs (Deutsches Aktieninstitut) — über 80 % nicht
- Nur rund 7 Mio. von ~70 Mio. Erwachsenen (~10 %) haben einen
  laufenden ETF-Sparplan
- 72 % der Deutschen sparen, aber nur 40 % dieser Sparer investieren
  in Wertpapiere; 57 % bleiben bei Tagesgeld/Festgeld/Sparbuch
  (Commerzbank Anlagestudie 2026)
Damit ist die reale Zahl noch eindrücklicher als die vom Nutzer
genannten "60 %" — wer einen ETF-Sparplan startet, liegt strukturell
vor 80-90 % der Bevölkerung, nicht nur 60 %.

US-Tabelle als Kontext eingeordnet, nicht unkommentiert übernommen:
Erklärung, warum US-Sparziele höher ausfallen (dünneres soziales Netz,
Social Security ersetzt weniger als die deutsche gesetzliche Rente).
FIRE-25er-Regel aus den Nutzer-Notizen ("Fin frei = 25x Jahresbedarf")
korrekt eingeordnet und nachgerechnet (30.000 € × 25 = 750.000 €,
stimmt exakt mit der Nutzer-Notiz überein).

Bidirektional mit dem Rentenlücke-Artikel verlinkt. Ton bewusst locker
gehalten (Nutzer-Wunsch "nicht so verbissen sehen") — Einstieg und
Schluss beide mit dieser Haltung.

Eingebunden: FR_POSTS (112 Artikel), sitemap.xml (151 URLs), Tag-Balance
und JSON-LD-Validität geprüft, mit echtem Chromium gerendert (keine
JS-Fehler, korrekte automatische %-Formatierung).

## V163 — Neuer Artikel: VIX, Shiller-KGV & Korrekturen
Neue Datei beitrag-vix-shiller-kgv-korrekturen.html, unter Finanzen >
Mein Portfolio. Ausgangsmaterial: vom Nutzer hochgeladenes Shiller-KGV-
Chart (Quelle nicht mehr bekannt) plus handschriftliche Notizen zu
Korrektur-Statistiken.

### Wichtiger Fund: das hochgeladene Chart ist veraltet
Der "aktuelle" Wert im Bild (27,49 für den S&P 500) stammt erkennbar
aus einer älteren Version dieses viel geteilten Charts (X-Achse endet
um 2020). Recherchiert: Stand Juli 2026 liegt das Shiller-KGV für den
S&P 500 tatsächlich bei 41,29 (GuruFocus) bzw. 40,7 (Börse Online,
25.04.26) — nahe am Dotcom-Rekord von 44,2. Eigene Grafik gebaut statt
das Bild zu kopieren, mit dem korrekten aktuellen Wert und expliziter
Info-Box, die auf die veraltete Zahl im Umlauf hinweist.

### Alle Nutzer-Zahlen einzeln verifiziert
- Historische Shiller-KGV-Peaks aus dem Chart (1901: 25,24; 1929:
  32,56; 1966: 24,06; Dez. 1999: 44,2; Tiefstwert 4,78) exakt bestätigt
  (GuruFocus: Rekordhoch 44,2, Rekordtief 4,78; Median ~16)
- Durchschnitt seit 1881 (16,53) bestätigt (mehrere Quellen: 15-17,
  Median ~16)
- "Korrekturen alle 1,87 Jahre": grob bestätigt (~38 Korrekturen ≥10%
  seit 1950 ≈ alle 2 Jahre)
- "188 Tage durchschnittliche Korrekturdauer": im plausiblen Bereich
  verschiedener Datensätze bestätigt (168 Tage seit 1987, 76 Tage ohne
  die zwei Ausreißer, je nach Zeitraum)
- "929 Tage Dotcom-Blase": EXAKT bestätigt durch unabhängige Quelle
  (Aktienwelt360: "Dotcom-Blase (929)" als längste Korrektur seit 1982,
  Finanzkrise mit 517 Tagen auf Platz zwei)
- Einfache KGV-Faustregel "unter 12 günstig, ab 20 teuer" als grobe,
  verbreitete Heuristik eingeordnet (bewusst nicht mit einer einzelnen
  Praezisions-Quelle belegt, da es sich um eine Faustregel handelt)

VIX selbst zusätzlich recherchiert und erklärt: 1993 von der CBOE
eingeführt, 30-Tage-Volatilität aus S&P-500-Optionen, Zonen <15
(ruhig) / 15-30 (normal) / >30 (erhöht), historische Rekordstände
2008 (89,53) und 2020 (85,47).

Eigene SVG-Grafik diesmal von Anfang an mit theme-fähigen CSS-Variablen
gebaut (var(--ink), var(--ink-soft), var(--line)) statt fest codierter
Hex-Farben — direkte Lehre aus dem Dunkelmodus-Bug in V159. Mit
Playwright in beiden Modi UND vor dem Einbau isoliert auf Textposition
geprüft (0 Probleme).

Eingebunden: FR_POSTS (113 Artikel), sitemap.xml (152 URLs), Tag-Balance
und JSON-LD-Validität geprüft, im echten Seitenkontext gerendert (0
JS-Fehler, korrekte automatische %-Formatierung, Dunkelmodus-Farben
korrekt).
