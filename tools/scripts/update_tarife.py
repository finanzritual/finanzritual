#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
update_tarife.py — aktualisiert den Mobilfunk-Tarifvergleich in script.js.

GRUNDPRINZIP: "Fail closed."
Das Skript ändert script.js NUR, wenn ein vollständiger, plausibler
Datensatz geholt UND geparst werden konnte. In jedem anderen Fall
(Seite down, Timeout, HTTP-Fehler, Layout geändert, unplausible Werte)
bleibt die bestehende Tabelle unangetastet. Es gibt keinen Zustand,
in dem die Seite mit halben oder leeren Daten zurückbleibt.

Deine Affiliate-Links stehen in FR_AFF_LINKS und werden nie berührt.

Benutzung:
    python3 tools/scripts/update_tarife.py                 # Update ausführen
    python3 tools/scripts/update_tarife.py --dry-run       # nur zeigen, nichts schreiben
    python3 tools/scripts/update_tarife.py --verbose       # ausführliche Ausgabe

Exit-Codes:
    0 = script.js aktualisiert
    1 = Quelle nicht erreichbar oder Daten unplausibel -> alte Tabelle bleibt
    2 = lokales Problem (script.js fehlt, Marker fehlen, ...)

Abhängigkeiten:  pip install requests beautifulsoup4
"""

from __future__ import annotations

import argparse
import datetime as dt
import re
import shutil
import sys
import unicodedata
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    sys.exit("Fehlende Pakete. Bitte ausführen:  pip install requests beautifulsoup4")

# ---------------------------------------------------------------- Konfiguration

QUELLE = "https://allnet-flat-vergleich-24.de/allnet-flat-vergleich/alle-netze.html"

SCRIPT_JS  = Path(__file__).resolve().parent.parent.parent / "script.js"  # tools/scripts/ -> tools/ -> Projektstamm
BACKUP_DIR = Path(__file__).resolve().parent.parent / "backups"            # tools/backups/

TIMEOUT = 20          # Sekunden pro Versuch
VERSUCHE = 3          # Wiederholungen bei Netzwerkfehlern
PAUSE = 4             # Sekunden zwischen den Versuchen

# Plausibilitätsgrenzen — schützen vor kaputtem Parsing und Fehlpreisen
MIN_TARIFE = 8        # weniger Zeilen => Parsing vermutlich kaputt => Abbruch
MAX_PREIS = 200.0     # € / Monat
MAX_GB = 1000

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"
)

MARKER_START = "/* >>> FR_TARIFE_START"
MARKER_END = "/* >>> FR_TARIFE_END <<< */"

# Netz-Bezeichnungen der Quelle -> unsere Kurzform (muss zu den <select>-Werten
# in index.html und zu den .netz-* CSS-Klassen passen)
NETZ_MAP = {
    "telekom": "Telekom",
    "telefónica": "O2",
    "telefonica": "O2",
    "o2": "O2",
    "vodafone": "Vodafone",
    "1&1": "1&1",
    "1und1": "1&1",
}


# ---------------------------------------------------------------- Hilfsfunktionen

def log(msg: str, *, verbose_only: bool = False, verbose: bool = False) -> None:
    if verbose_only and not verbose:
        return
    print(msg)


def slug(text: str) -> str:
    """Erzeugt eine stabile ID — muss identisch zu den Schlüsseln in FR_AFF_LINKS sein."""
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = text.replace("&", "und").lower()
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", text)).strip("-")


def zahl(text: str) -> float | None:
    """'5,41 €' -> 5.41 ; '1.234,50' -> 1234.5 ; 'kostenlos' -> 0.0"""
    if not text:
        return None
    t = text.strip().lower()
    if any(w in t for w in ("kostenlos", "geschenkt", "gratis", "frei")):
        return 0.0
    m = re.search(r"(\d{1,3}(?:\.\d{3})*|\d+)(?:,(\d{1,2}))?", t)
    if not m:
        return None
    ganz = m.group(1).replace(".", "")
    nach = m.group(2) or "0"
    try:
        return float(f"{ganz}.{nach}")
    except ValueError:
        return None


def netz_normalisieren(text: str) -> str | None:
    t = text.strip().lower()
    for key, wert in NETZ_MAP.items():
        if key in t:
            return wert
    return None


def js_escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace('"', '\\"')


# Erlaubte Zeichen in Anbieter-/Tarifnamen. Alles andere fliegt raus.
# Grund: Die Quelle ist fremd. Ein Anbietername wie
#   <img src=x onerror=...>
# würde sonst in script.js landen und dort per innerHTML ausgeführt (Stored XSS).
# Das JS escapt zusätzlich (frEsc) — doppelter Boden, siehe README.
ERLAUBT = re.compile(r"[^A-Za-z0-9äöüÄÖÜßéèêáàâ&+.,()/'’\- ]")


def saeubern(text: str, max_len: int = 60) -> str:
    """Entfernt HTML/Steuerzeichen aus Freitext der Quelle."""
    if not text:
        return ""
    # 1. Alles zwischen spitzen Klammern entfernen (inkl. <script>, <img ...>)
    text = re.sub(r"<[^>]*>", "", text)
    # 2. Verbliebene spitze Klammern und Steuerzeichen killen
    text = re.sub(r"[<>]", "", text)
    text = "".join(c for c in text if c.isprintable())
    # 3. Whitelist anwenden
    text = ERLAUBT.sub("", text)
    # 4. Mehrfach-Leerzeichen glätten, Länge begrenzen
    return re.sub(r"\s+", " ", text).strip()[:max_len]


# ---------------------------------------------------------------- 1. Holen

def seite_holen(verbose: bool = False) -> str | None:
    """Holt die Quelle. Gibt bei jedem Fehlschlag None zurück (-> alte Tabelle bleibt)."""
    import time

    for versuch in range(1, VERSUCHE + 1):
        try:
            log(f"  Versuch {versuch}/{VERSUCHE}: {QUELLE}", verbose_only=True, verbose=verbose)
            antwort = requests.get(
                QUELLE,
                timeout=TIMEOUT,
                headers={"User-Agent": USER_AGENT, "Accept-Language": "de-DE,de;q=0.9"},
            )
            antwort.raise_for_status()
            if len(antwort.text) < 2000:
                log(f"  Antwort verdächtig kurz ({len(antwort.text)} Zeichen) — ignoriert.")
                continue
            antwort.encoding = antwort.apparent_encoding or "utf-8"
            log(f"  OK — HTTP {antwort.status_code}, {len(antwort.text):,} Zeichen.",
                verbose_only=True, verbose=verbose)
            return antwort.text

        except requests.exceptions.Timeout:
            log(f"  Timeout nach {TIMEOUT}s.")
        except requests.exceptions.ConnectionError:
            log("  Keine Verbindung (Seite down oder kein Netz).")
        except requests.exceptions.HTTPError as e:
            log(f"  HTTP-Fehler: {e}")
            if antwort.status_code in (403, 404, 410):
                break          # dauerhaft — Wiederholen sinnlos
        except requests.exceptions.RequestException as e:
            log(f"  Netzwerkfehler: {e}")

        if versuch < VERSUCHE:
            time.sleep(PAUSE)

    return None


# ---------------------------------------------------------------- 2. Parsen

def tarife_parsen(html: str, verbose: bool = False) -> list[dict]:
    """
    Parst die Tariftabelle strukturbasiert (über die Spaltenüberschriften),
    nicht über CSS-Klassen — das überlebt Template-Änderungen deutlich besser.
    Gibt [] zurück, wenn die Struktur nicht wiedererkannt wird.
    """
    suppe = BeautifulSoup(html, "html.parser")

    # Die richtige Tabelle finden: die mit "Netz" + Preis-/Anbieterspalte im Kopf
    tabelle = None
    for kandidat in suppe.find_all("table"):
        kopf = " ".join(th.get_text(" ", strip=True).lower()
                        for th in kandidat.find_all(["th", "td"], limit=12))
        if "netz" in kopf and ("monat" in kopf or "anbieter" in kopf or "tarif" in kopf):
            tabelle = kandidat
            break

    if tabelle is None:
        log("  Keine Tariftabelle gefunden — Layout der Quelle geändert?")
        return []

    # Spaltenpositionen aus dem Kopf ableiten
    kopfzellen = [z.get_text(" ", strip=True).lower()
                  for z in (tabelle.find("tr").find_all(["th", "td"]) if tabelle.find("tr") else [])]

    def spalte(*begriffe: str) -> int | None:
        for i, zelle in enumerate(kopfzellen):
            if any(b in zelle for b in begriffe):
                return i
        return None

    idx = {
        "anbieter": spalte("anbieter"),
        "netz": spalte("netz"),
        "leistung": spalte("leistung"),
        "speed": spalte("down", "upload", "speed"),
        "details": spalte("details"),
        "anschluss": spalte("anschluß", "anschluss"),
        "monat": spalte("je monat", "monat", "preis"),
    }
    log(f"  Spalten erkannt: {idx}", verbose_only=True, verbose=verbose)

    if idx["netz"] is None or idx["monat"] is None:
        log("  Pflichtspalten (Netz/Preis) nicht gefunden — Abbruch.")
        return []

    tarife: list[dict] = []
    gesehen: set[str] = set()

    for zeile in tabelle.find_all("tr")[1:]:
        zellen = zeile.find_all("td")
        if len(zellen) < 4:
            continue

        def text(pos: int | None) -> str:
            return zellen[pos].get_text(" ", strip=True) if pos is not None and pos < len(zellen) else ""

        # Anbieter/Tarif stecken im Logo-Bild: alt = Anbieter, title = Tarifname
        # ACHTUNG: Fremddaten -> immer durch saeubern() schicken.
        anbieter = tarif = ""
        if idx["anbieter"] is not None and idx["anbieter"] < len(zellen):
            bild = zellen[idx["anbieter"]].find("img")
            if bild:
                anbieter = saeubern(bild.get("alt") or "")
                tarif = saeubern(bild.get("title") or "")
            if not anbieter:
                anbieter = saeubern(text(idx["anbieter"]))
        if not tarif:
            tarif = saeubern(text(idx["leistung"]), 40) or "Allnet Flat"
        if not anbieter:
            continue

        netz = netz_normalisieren(text(idx["netz"]))
        if not netz:
            continue

        monat = zahl(text(idx["monat"]))
        if monat is None or not (0 < monat <= MAX_PREIS):
            continue

        anschluss = zahl(text(idx["anschluss"])) or 0.0

        # Datenvolumen aus der Leistungsspalte: "12 GB inkl. Telefon: Flat"
        leistung = text(idx["leistung"])
        gb = 0
        if re.search(r"unlimited|ohne limit|unbegrenzt", leistung, re.I):
            gb = 999
        else:
            m = re.search(r"(\d+(?:[.,]\d+)?)\s*GB", leistung, re.I)
            if m:
                gb = int(float(m.group(1).replace(",", ".")))
            else:
                m = re.search(r"(\d+)\s*MB", leistung, re.I)
                gb = max(1, int(m.group(1)) // 1024) if m else 0
        if not (0 < gb <= MAX_GB):
            continue

        # Speed: "↓ 50,0 MBit/s  ↑ 25,0 MBit/s"
        speeds = re.findall(r"(\d+(?:[.,]\d+)?)\s*MBit", text(idx["speed"]), re.I)
        down = int(float(speeds[0].replace(",", "."))) if len(speeds) > 0 else 0
        up = int(float(speeds[1].replace(",", "."))) if len(speeds) > 1 else 0

        # Laufzeit + Guthaben-Hinweis aus der Details-Spalte
        details = text(idx["details"])
        if re.search(r"\bTage\b", details, re.I):
            laufzeit = "prepaid"
        elif re.search(r"1\s*Monat\b", details, re.I):
            laufzeit = "flex"
        elif re.search(r"(\d+)\s*Monate", details, re.I):
            laufzeit = re.search(r"(\d+)\s*Monate", details, re.I).group(1)
        else:
            laufzeit = "24"

        hinweis = ""
        m = re.search(r"(\d+(?:,\d+)?)\s*€\s*Guthaben", details, re.I)
        if m:
            hinweis = f"{m.group(1).replace(',00', '')} € Guthaben"

        eintrag = {
            "id": slug(f"{anbieter}-{tarif}"),
            "anbieter": anbieter,
            "tarif": tarif,
            "netz": netz,
            "gb": gb,
            "down": down,
            "up": up,
            "laufzeit": laufzeit,
            "anschluss": anschluss,
            "monat": monat,
            "hinweis": hinweis,
        }
        if eintrag["id"] in gesehen:
            continue
        gesehen.add(eintrag["id"])
        tarife.append(eintrag)

    tarife.sort(key=lambda t: (t["monat"], -t["gb"]))
    return tarife


# ---------------------------------------------------------------- 3. Schreiben

def js_block_bauen(tarife: list[dict], stand: str) -> str:
    def q(v: str) -> str:
        return f'"{js_escape(v)}",'

    breite = {k: max(len(q(t[k])) for t in tarife) for k in ("id", "anbieter", "tarif", "netz", "laufzeit")}

    zeilen = []
    for t in tarife:
        zeilen.append(
            "  { "
            + f'id:{q(t["id"]):<{breite["id"] + 1}}'
            + f'anbieter:{q(t["anbieter"]):<{breite["anbieter"] + 1}}'
            + f'tarif:{q(t["tarif"]):<{breite["tarif"] + 1}}'
            + f'netz:{q(t["netz"]):<{breite["netz"] + 1}}'
            + f'gb:{str(t["gb"]) + ",":<5}'
            + f'down:{str(t["down"]) + ",":<6}'
            + f'up:{str(t["up"]) + ",":<5}'
            + f'laufzeit:{q(t["laufzeit"]):<{breite["laufzeit"] + 1}}'
            + f'anschluss:{f"{t["anschluss"]:.2f}" + ",":<8}'
            + f'monat:{f"{t["monat"]:.2f}" + ",":<7}'
            + f'hinweis:"{js_escape(t["hinweis"])}"'
            + " }"
        )

    return (
        f"{MARKER_START} — AUTOMATISCH GENERIERT AM {stand}, NICHT VON HAND EDITIEREN.\n"
        "   Dieser Block wird von tools/scripts/update_tarife.py überschrieben.\n"
        "   Affiliate-Links gehören in FR_AFF_LINKS, nicht hierher. <<< */\n"
        "const FR_TARIFE = [\n"
        + ",\n".join(zeilen)
        + "\n];\n"
        + MARKER_END
    )


def script_js_aktualisieren(tarife: list[dict], dry_run: bool = False) -> bool:
    if not SCRIPT_JS.exists():
        log(f"FEHLER: {SCRIPT_JS} nicht gefunden.")
        sys.exit(2)

    inhalt = SCRIPT_JS.read_text(encoding="utf-8")

    muster = re.compile(re.escape(MARKER_START) + r"[\s\S]*?" + re.escape(MARKER_END))
    if not muster.search(inhalt):
        log("FEHLER: Marker FR_TARIFE_START/END fehlen in script.js.")
        sys.exit(2)

    stand = dt.date.today().isoformat()
    neu = muster.sub(lambda _: js_block_bauen(tarife, stand), inhalt)
    neu = re.sub(r'const FR_TARIFE_STAND = "[^"]*";',
                 f'const FR_TARIFE_STAND = "{stand}";', neu)

    # Sicherheitsnetz: FR_AFF_LINKS muss unverändert erhalten bleiben
    def aff_block(text: str) -> str:
        m = re.search(r"const FR_AFF_LINKS = \{[\s\S]*?\n\};", text)
        return m.group(0) if m else ""

    if aff_block(inhalt) != aff_block(neu):
        log("FEHLER: FR_AFF_LINKS würde verändert — Abbruch, nichts geschrieben.")
        sys.exit(2)

    if dry_run:
        log("\n--- DRY RUN — es wurde nichts geschrieben ---")
        log(js_block_bauen(tarife, stand)[:1200] + "\n  ...")
        return False

    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    sicherung = BACKUP_DIR / f"script.js.{dt.datetime.now():%Y%m%d-%H%M%S}.bak"
    shutil.copy2(SCRIPT_JS, sicherung)

    # Atomar schreiben: erst temporär, dann ersetzen — kein halb geschriebenes File
    temp = SCRIPT_JS.with_suffix(".js.tmp")
    temp.write_text(neu, encoding="utf-8")
    temp.replace(SCRIPT_JS)

    log(f"  Sicherung: {sicherung.name}")
    return True


# ---------------------------------------------------------------- Ablauf

def main() -> int:
    p = argparse.ArgumentParser(description="Aktualisiert die Mobilfunk-Tarife in script.js.")
    p.add_argument("--dry-run", action="store_true", help="nur anzeigen, nichts schreiben")
    p.add_argument("--verbose", "-v", action="store_true", help="ausführliche Ausgabe")
    args = p.parse_args()

    print(f"Tarif-Update — {dt.datetime.now():%d.%m.%Y %H:%M}")
    print("Quelle abrufen ...")

    html = seite_holen(verbose=args.verbose)
    if html is None:
        print("\nQuelle nicht erreichbar.")
        print("-> script.js bleibt unverändert, die bestehende Tabelle wird weiter ausgeliefert.")
        return 1

    print("Daten parsen ...")
    tarife = tarife_parsen(html, verbose=args.verbose)

    if len(tarife) < MIN_TARIFE:
        print(f"\nNur {len(tarife)} Tarife geparst (Minimum {MIN_TARIFE}).")
        print("-> Daten unplausibel. script.js bleibt unverändert, alte Tabelle bleibt aktiv.")
        return 1

    print(f"  {len(tarife)} Tarife geparst, günstigster: "
          f"{tarife[0]['anbieter']} {tarife[0]['tarif']} — {tarife[0]['monat']:.2f} €")

    if args.verbose:
        for t in tarife:
            print(f"    {t['monat']:6.2f} €  {t['gb']:>4} GB  {t['netz']:<9} {t['anbieter']} {t['tarif']}")

    # Hinweis auf Tarife ohne hinterlegten Affiliate-Link
    inhalt = SCRIPT_JS.read_text(encoding="utf-8") if SCRIPT_JS.exists() else ""
    gesetzt = set(re.findall(r'^\s*"([^"]+)"\s*:\s*"https?://',
                             re.search(r"const FR_AFF_LINKS = \{([\s\S]*?)\n\};", inhalt).group(1)
                             if re.search(r"const FR_AFF_LINKS = \{([\s\S]*?)\n\};", inhalt) else "",
                             re.M))
    ohne = [t["id"] for t in tarife if t["id"] not in gesetzt]
    if ohne:
        print(f"\nHinweis: {len(ohne)} von {len(tarife)} Tarifen ohne Affiliate-Link "
              f"(zeigen auf FR_AFF_FALLBACK).")
        if args.verbose:
            for i in ohne:
                print(f'    "{i}": "",')

    print("\nscript.js aktualisieren ...")
    if script_js_aktualisieren(tarife, dry_run=args.dry_run):
        print("Fertig — Tabelle aktualisiert.")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\nAbgebrochen — script.js unverändert.")
        sys.exit(1)
