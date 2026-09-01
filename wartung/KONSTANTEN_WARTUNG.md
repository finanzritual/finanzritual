# Konstanten-Wartungstabelle — FR_CONSTANTS

Liegt unter `_einrichtung/` — taucht nirgendwo auf der Live-Seite auf.

**Zweck:** Eine einzige Tabelle, um `FR_CONSTANTS` in `script.js` jährlich
(vor allem zum 1.1.) systematisch zu prüfen, statt 80 Einträge einzeln im
Code zu suchen. Greift die Prüfung nicht (Wert nicht aktualisiert), bleibt
schlicht der alte Wert im Text stehen — das bestehende
`disclaimer-standard`-Snippet deckt das bereits ab ("eine Haftung für
Richtigkeit oder Aktualität der Inhalte ist ausgeschlossen"). Diese
Tabelle ist also eine **Erleichterung für die Pflege**, keine
sicherheitskritische Komponente.

**Turnus-Legende:**
- **J** = Jährlich zum 1.1. — hohe Priorität für die Jahresprüfung
- **M** = Mehrjährig/unregelmäßig — seltener prüfen, aber im Blick behalten
- **G** = Gestaffelt/Stichtag in der Zukunft — erst ab dem genannten Jahr relevant
- **F** = Fest/ändert sich praktisch nie (feste gesetzliche Frist) — niedrigste Priorität

**Format:** `Key: NEU:____ (Start-Referenz DATUM: Wert) | Turnus | Hinweis`
Beim Update den Wert hinter `NEU:` eintragen, den alten Klammer-Wert als
Vergleichsanker stehen lassen (nicht löschen) — ein Tippfehler wie
„1390" statt „13,90" fällt dann sofort auf, weil er neben dem alten,
plausiblen Wert offensichtlich absurd wirkt. Nach erfolgreicher
Übernahme in `script.js` die Klammer-Referenz auf den neuen Stand
aktualisieren.

**Fly-over-Änderungshinweis (seit 31.08.2026):** `frApplyConstants()` in
`script.js` unterstützt jetzt ein optionales `changed`-Feld pro Konstante,
das denselben Hover-Tooltip-Mechanismus wie das Glossar nutzt (identische
CSS-Klassen, kein neuer Code für Hover/Klick/Escape nötig):
```js
'mindestlohn': { de: '13,90 €', en: '€13.90',
  changed: { from: '13,50 €', fromEn: '€13.50', date: '01.01.2026' } }
```
Zeigt auf der Live-Seite beim Hover/Klick: „Geändert von 13,50 € auf
13,90 € zum 01.01.2026." Das Feld ist **rein optional** — beim jährlichen
Update in `script.js` nur ergänzen, wenn der alte Wert wirklich noch
bekannt ist; ohne das Feld verhält sich die Konstante wie bisher (nur
der reine Wert, kein Tooltip). Ergänzend beim nächsten Update in
`script.js` einbauen, sobald der jeweils alte Wert zur Hand ist — für
die aktuell in dieser Wartungstabelle stehenden 80 Werte gibt es noch
keine dokumentierte Änderungshistorie.

---

## J — Jährlich zum 1.1. prüfen (höchste Priorität, 21 Stück)

```
mindestlohn: NEU:____ (Start-Referenz 31.08.2026: 13,90 €) | J | Mindestlohnkommission, i. d. R. zum 1.1.
minijob-grenze: NEU:____ (Start-Referenz 31.08.2026: 603 €) | J | dynamisch an Mindestlohn gekoppelt
grundfreibetrag-single: NEU:____ (Start-Referenz 31.08.2026: 12.348 €) | J | § 32a EStG
werbungskosten-pauschbetrag: NEU:____ (Start-Referenz 31.08.2026: 1.230 €) | J | Arbeitnehmer-Pauschbetrag
bezugsgroesse-sv: NEU:____ (Start-Referenz 31.08.2026: 3.955 €) | J | § 18 SGB IV, Sozialversicherungsrecnengröße
kindergeld: NEU:____ (Start-Referenz 31.08.2026: 259 €) | J
familienversicherung-einkommensgrenze: NEU:____ (Start-Referenz 31.08.2026: 565 €) | J
homeoffice-pauschale-tagessatz: NEU:____ (Start-Referenz 31.08.2026: 6 €) | J
homeoffice-pauschale-jahresmax: NEU:____ (Start-Referenz 31.08.2026: 1.260 €) | J
verpflegungspauschale-8std: NEU:____ (Start-Referenz 31.08.2026: 14 €) | J
verpflegungspauschale-24std: NEU:____ (Start-Referenz 31.08.2026: 28 €) | J
entfernungspauschale-ab-1km: NEU:____ (Start-Referenz 31.08.2026: 38 Cent) | J | Pendlerpauschale
dienstreise-kilometersatz: NEU:____ (Start-Referenz 31.08.2026: 30 Cent) | J
deutschlandticket-standard: NEU:____ (Start-Referenz 31.08.2026: 63,00 €) | J | ändert sich unregelmäßig, aber politisch beobachtet
rundfunkbeitrag: NEU:____ (Start-Referenz 31.08.2026: 18,36 €) | J | ändert sich selten, aber jährlich zu pruefen
bafoeg-hoechstsatz-auswaerts: NEU:____ (Start-Referenz 31.08.2026: 992 €) | J | siehe Konflikt-Hinweis unten
bafoeg-satz-bei-eltern: NEU:____ (Start-Referenz 31.08.2026: 630 €) | J
ausbildungsverguetung-lehrjahr-1: NEU:____ (Start-Referenz 31.08.2026: 724 €) | J
ausbildungsverguetung-lehrjahr-2: NEU:____ (Start-Referenz 31.08.2026: 854 €) | J
ausbildungsverguetung-lehrjahr-3: NEU:____ (Start-Referenz 31.08.2026: 977 €) | J
ausbildungsverguetung-lehrjahr-4: NEU:____ (Start-Referenz 31.08.2026: 1.014 €) | J
gkv-zusatzbeitrag-durchschnitt: NEU:____ (Start-Referenz 31.08.2026: 2,90 %) | J
```

**Bekannter offener Punkt:** `bafoeg-hoechstsatz-auswaerts` (992 €) stand
im Nutzer-Dokument aus V1106 als „990 € Pauschalbedarf" zur Diskussion —
könnten zwei unterschiedliche Teilbeträge sein oder derselbe Wert zu
verschiedenen Zeitpunkten. Bei der nächsten Jahresprüfung mit erledigen.

## J — Jährlich, geringere Priorität (Sozialversicherungs-Prozentsätze, 8 Stück)

```
rentenversicherung-minijob-eigenanteil: NEU:____ (Start-Referenz 31.08.2026: 3,60 %) | J
rentenversicherungsbeitrag-arbeitnehmeranteil: NEU:____ (Start-Referenz 31.08.2026: 9,30 %) | J
kvdr-eigenanteil-rentner: NEU:____ (Start-Referenz 31.08.2026: 8,75 %) | J
pflegeversicherung-rentner-mit-kindern: NEU:____ (Start-Referenz 31.08.2026: 3,6 %) | J
pflegeversicherung-rentner-kinderlos: NEU:____ (Start-Referenz 31.08.2026: 4,2 %) | J
arbeitnehmer-sparzulage-satz: NEU:____ (Start-Referenz 31.08.2026: 20 %) | J | selten geaendert
arbeitnehmer-sparzulage-max-monatlich: NEU:____ (Start-Referenz 31.08.2026: 40 €) | J
arbeitnehmer-sparzulage-einkommensgrenze: NEU:____ (Start-Referenz 31.08.2026: 40.000 €) | J
```

## M — Mehrjährig/unregelmäßig (17 Stück)

```
gmbh-stammkapital: NEU:____ (Start-Referenz 31.08.2026: 25.000 €) | M | aendert sich sehr selten
gmbh-mindesteinzahlung: NEU:____ (Start-Referenz 31.08.2026: 12.500 €) | M
koerperschaftsteuersatz: NEU:____ (Start-Referenz 31.08.2026: 15 %) | M
gewerbesteuer-freibetrag-einzelunternehmen: NEU:____ (Start-Referenz 31.08.2026: 24.500 €) | M
gewerbesteuer-freibetrag-verein: NEU:____ (Start-Referenz 31.08.2026: 5.000 €) | M
gewerbesteuer-mindesthebesatz: NEU:____ (Start-Referenz 31.08.2026: 200 %) | M
fahrgastrechte-bagatellgrenze: NEU:____ (Start-Referenz 31.08.2026: 4 €) | M
ehrenamtspauschale: NEU:____ (Start-Referenz 31.08.2026: 960 €) | M
uebungsleiterpauschale: NEU:____ (Start-Referenz 31.08.2026: 3.300 €) | M
umzugskostenpauschale-beruflich: NEU:____ (Start-Referenz 31.08.2026: 964 €) | M | steigt haeufiger als andere Pauschalen
bafoeg-standard-rueckzahlungsrate: NEU:____ (Start-Referenz 31.08.2026: 130 €) | M
bafoeg-hoechstrueckzahlung: NEU:____ (Start-Referenz 31.08.2026: 10.010 €) | M
bafoeg-nachlass-einmalzahlung: NEU:____ (Start-Referenz 31.08.2026: 26 %) | M
bafoeg-vermoegensfreibetrag-unter-30: NEU:____ (Start-Referenz 31.08.2026: 15.000 €) | M
bafoeg-vermoegensfreibetrag-ab-30: NEU:____ (Start-Referenz 31.08.2026: 45.000 €) | M
dax-kappungsgrenze-einzelwert: NEU:____ (Start-Referenz 31.08.2026: 10 %) | M | Index-Regelwerk, selten geaendert
rentenniveau-haltelinie: NEU:____ (Start-Referenz 31.08.2026: 48 %) | M | politisch verhandelt
```

## M — Erbschaft-/Schenkungsteuer, Meldeschwellen (7 Stück)

```
erbschaftsteuer-freibetrag-kinder: NEU:____ (Start-Referenz 31.08.2026: 400.000 €) | M
erbschaftsteuer-freibetrag-ehepartner: NEU:____ (Start-Referenz 31.08.2026: 500.000 €) | M
erbschaftsteuer-freibetrag-nichteheliche-partner: NEU:____ (Start-Referenz 31.08.2026: 20.000 €) | M
schenkungsteuer-freibetrag-grosseltern-enkel: NEU:____ (Start-Referenz 31.08.2026: 200.000 €) | M
schenkungsteuer-freibetrag-grosseltern-kombiniert: NEU:____ (Start-Referenz 31.08.2026: 400.000 €) | M
betriebsvermoegen-verschonung-obergrenze: NEU:____ (Start-Referenz 31.08.2026: 26 Mio. €) | M
directors-dealings-meldeschwelle: NEU:____ (Start-Referenz 31.08.2026: 50.000 €) | M | seit 1.1.2026 angehoben, naechste Aenderung unklar
```

## M — Riester (6 Stück, System laeuft aus zugunsten Altersvorsorgedepot ab 2027)

```
riester-grundzulage: NEU:____ (Start-Referenz 31.08.2026: 175 €) | M
riester-kinderzulage-ab-2008: NEU:____ (Start-Referenz 31.08.2026: 300 €) | M
riester-kinderzulage-vor-2008: NEU:____ (Start-Referenz 31.08.2026: 185 €) | M
riester-berufseinsteiger-bonus: NEU:____ (Start-Referenz 31.08.2026: 200 €) | M
riester-sonderausgabenabzug-max: NEU:____ (Start-Referenz 31.08.2026: 2.100 €) | M
riester-pflichteinzahlung-prozent: NEU:____ (Start-Referenz 31.08.2026: 4 %) | M
```

## G — Gestaffelt/zukünftiger Stichtag (12 Stück)

```
rentenbesteuerungsanteil-neurentner-2026: NEU:____ (Start-Referenz 31.08.2026: 84 %) | G | Jahrgang 2026
rentenbesteuerungsanteil-2031: NEU:____ (Start-Referenz 31.08.2026: 86,5 %) | G | Jahrgang 2031, erst 2031 pruefen
rentenbesteuerungsanteil-2058: NEU:____ (Start-Referenz 31.08.2026: 100 %) | G | Jahrgang 2058, sehr weit in Zukunft
altersvorsorgedepot-grundzulage: NEU:____ (Start-Referenz 31.08.2026: 540 €) | G | erst ab 2027 gueltig
altersvorsorgedepot-hoechstbeitrag: NEU:____ (Start-Referenz 31.08.2026: 1.800 €) | G | erst ab 2027 gueltig
altersvorsorgedepot-sonderausgaben-max: NEU:____ (Start-Referenz 31.08.2026: 6.840 €) | G | erst ab 2027 gueltig
altersvorsorgedepot-kinderzulage: NEU:____ (Start-Referenz 31.08.2026: 300 €) | G | erst ab 2027 gueltig
altersvorsorgedepot-berufseinsteigerbonus: NEU:____ (Start-Referenz 31.08.2026: 200 €) | G | erst ab 2027 gueltig
fruehstart-rente-monatlicher-zuschuss: NEU:____ (Start-Referenz 31.08.2026: 10 €) | G | erst ab 2027 gueltig
fruehstart-rente-endwert-18: NEU:____ (Start-Referenz 31.08.2026: 1.440 €) | G | erst ab 2027 gueltig, Rechenwert
fruehstart-rente-endwert-67: NEU:____ (Start-Referenz 31.08.2026: 28.800 €) | G | erst ab 2027 gueltig, Rechenwert
elterlicher-selbstbehalt-studierende-kinder: NEU:____ (Start-Referenz 31.08.2026: 1.750 €) | G | jaehrlich, aber neuere Rechtsprechung im Blick behalten
```

## M — Rentenpunkte (aktualisiert sich faktisch jährlich mit dem Durchschnittsentgelt, 2 Stück)

```
rentenpunkt-anschaffungskosten: NEU:____ (Start-Referenz 31.08.2026: 9.661,58 €) | J | aendert sich jaehrlich mit dem Durchschnittsentgelt
rentenpunkt-monatsrente-lebenslang: NEU:____ (Start-Referenz 31.08.2026: 42,52 €) | J | direkt abhaengig vom obigen Wert
```

## F — Feste gesetzliche Fristen, ändern sich praktisch nie (5 Stück)

```
kuendigungsschutzklage-frist: NEU:____ (Start-Referenz 31.08.2026: 3 Wochen) | F | § 4 KSchG, seit Jahrzehnten unveraendert
arbeitsagentur-meldefrist-regulaer: NEU:____ (Start-Referenz 31.08.2026: 3 Monate) | F | § 38 SGB III
arbeitsagentur-meldefrist-kurzfristig: NEU:____ (Start-Referenz 31.08.2026: 3 Tage) | F | § 38 SGB III
sperrzeit-meldeversaeumnis: NEU:____ (Start-Referenz 31.08.2026: 1 Woche) | F
sparerpauschbetrag-single: NEU:____ (Start-Referenz 31.08.2026: 1.000 €) | J | Ausnahme: gilt formal als F, aendert sich aber gelegentlich per Gesetz -- lieber jaehrlich mitpruefen
sparerpauschbetrag-verheiratet: NEU:____ (Start-Referenz 31.08.2026: 2.000 €) | J | siehe oben
```

---

**Gesamtzahl:** 80 Konstanten (Stand 31.08.2026, nach V1106).
**Nächste empfohlene Vollprüfung:** Dezember 2026 / Januar 2027, vor allem
die 21+8 = 29 „J"-Einträge sowie die Freischaltung der 12 „G"-Einträge
zum 1.1.2027.
