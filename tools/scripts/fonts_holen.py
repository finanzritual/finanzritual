#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fonts_holen.py — laedt die Google Fonts einmalig herunter und hostet sie selbst.

WARUM: Ein @import auf fonts.googleapis.com uebertraegt bei jedem
Seitenaufruf die IP-Adresse deiner Besucher an Google. Das LG Muenchen I
(Az. 3 O 17493/20) hat darin einen DSGVO-Verstoss gesehen. Selbst gehostet
geht keine einzige Anfrage mehr an Google — und die Seite laedt schneller.

Die drei Schriften stehen unter der SIL Open Font License. Selbst hosten
ist ausdruecklich erlaubt.

WAS ES TUT:
  1. Holt die Font-CSS von Google (als moderner Browser -> woff2).
  2. Laedt jede Schriftdatei nach fonts/ herunter.
  3. Schreibt die @font-face-Regeln in style.css zwischen die Marker
     FR_FONTS_START / FR_FONTS_END, mit lokalen Pfaden.

Danach ist das Skript nie wieder noetig — ausser du aenderst die Schriften.

BENUTZUNG (einmalig, im Projektordner):
    python3 tools/scripts/fonts_holen.py
    python3 tools/scripts/fonts_holen.py --dry-run     nur zeigen, nichts schreiben
    python3 tools/scripts/fonts_holen.py --verbose

Exit-Codes:
    0 = Schriften geholt, style.css aktualisiert
    1 = Download fehlgeschlagen -> style.css unveraendert
    2 = lokales Problem (style.css fehlt, Marker fehlen, ...)

Abhaengigkeit:  pip install requests
"""

from __future__ import annotations

import argparse
import re
import shutil
import sys
from pathlib import Path

try:
    import requests
except ImportError:
    sys.exit("Fehlendes Paket. Bitte ausfuehren:  pip install requests")

# ---------------------------------------------------------------- Konfiguration

# Genau die Schnitte, die style.css tatsaechlich verwendet.
# Weniger Schnitte = kleinere Downloads. Pruefe mit:
#   grep -o "font-weight:[0-9]*" style.css | sort -u
FAMILIEN = {
    "Space Grotesk": [500, 600, 700],
    "Inter":         [400, 500, 600],
    "JetBrains Mono": [400, 500, 600],
}

# Nur diese Zeichensatz-Bloecke behalten. "latin" deckt Deutsch inkl.
# aeoeuess ab, "latin-ext" zusaetzliche europaeische Zeichen.
# Google liefert sonst auch kyrillisch/griechisch mit — unnoetiger Ballast.
SUBSETS = {"latin", "latin-ext"}

PROJEKT   = Path(__file__).resolve().parent.parent.parent  # tools/scripts/ -> tools/ -> Projektstamm
STYLE_CSS = PROJEKT / "style.css"
FONT_DIR  = PROJEKT / "fonts"

TIMEOUT = 30
VERSUCHE = 3

MARKER_START = "/* >>> FR_FONTS_START"
MARKER_END = "/* >>> FR_FONTS_END <<< */"

# Wichtig: Ein moderner Browser-UA. Mit einem alten UA liefert Google
# statt woff2 die deutlich groesseren ttf/eot-Formate aus.
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
)


# ---------------------------------------------------------------- Hilfsfunktionen

def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def css_url_bauen() -> str:
    """Baut die css2-URL fuer alle Familien und Schnitte."""
    teile = []
    for familie, gewichte in FAMILIEN.items():
        name = familie.replace(" ", "+")
        w = ";".join(str(g) for g in sorted(gewichte))
        teile.append(f"family={name}:wght@{w}")
    return "https://fonts.googleapis.com/css2?" + "&".join(teile) + "&display=swap"


def holen(url: str, *, binaer: bool = False, verbose: bool = False):
    """Holt eine URL mit Wiederholungen. Gibt bei Misserfolg None zurueck."""
    import time

    for versuch in range(1, VERSUCHE + 1):
        try:
            antwort = requests.get(
                url, timeout=TIMEOUT,
                headers={"User-Agent": USER_AGENT},
            )
            antwort.raise_for_status()
            return antwort.content if binaer else antwort.text
        except requests.exceptions.RequestException as e:
            print(f"    Versuch {versuch}/{VERSUCHE} fehlgeschlagen: {type(e).__name__}")
            if versuch < VERSUCHE:
                time.sleep(2)
    return None


# ---------------------------------------------------------------- Parsen

def font_faces_parsen(css: str, verbose: bool = False) -> list[dict]:
    """
    Zerlegt Googles CSS in einzelne @font-face-Bloecke.
    Google stellt jedem Block einen Kommentar mit dem Subset voran:
        /* latin */
        @font-face { ... }
    """
    faces = []
    # Kommentar (Subset-Name) + zugehoeriger @font-face-Block
    muster = re.compile(r"/\*\s*([a-z0-9\-\[\]]+)\s*\*/\s*(@font-face\s*\{[^}]*\})",
                        re.IGNORECASE)

    for subset, block in muster.findall(css):
        if subset.lower() not in SUBSETS:
            continue

        def feld(name: str) -> str | None:
            m = re.search(rf"{name}\s*:\s*([^;]+);", block, re.IGNORECASE)
            return m.group(1).strip() if m else None

        familie = (feld("font-family") or "").strip("'\"")
        url_m = re.search(r"url\((https://[^)]+\.woff2)\)", block)
        if not familie or not url_m:
            continue

        faces.append({
            "familie": familie,
            "gewicht": feld("font-weight") or "400",
            "stil": feld("font-style") or "normal",
            "unicode_range": feld("unicode-range"),
            "url": url_m.group(1),
            "subset": subset.lower(),
        })

    return faces


# ---------------------------------------------------------------- CSS bauen

def css_block_bauen(faces: list[dict]) -> str:
    zeilen = [
        MARKER_START + " — AUTOMATISCH GENERIERT von tools/scripts/fonts_holen.py.",
        "   Selbst gehostete Schriften: es geht KEINE Anfrage mehr an Google.",
        "   Space Grotesk, Inter, JetBrains Mono — alle SIL Open Font License.",
        "   Neu erzeugen:  python3 tools/scripts/fonts_holen.py <<< */",
        "",
    ]
    for f in faces:
        zeilen.append("@font-face{")
        zeilen.append(f"  font-family:'{f['familie']}';")
        zeilen.append(f"  font-style:{f['stil']};")
        zeilen.append(f"  font-weight:{f['gewicht']};")
        zeilen.append("  font-display:swap;")
        zeilen.append(f"  src:url('fonts/{f['datei']}') format('woff2');")
        if f.get("unicode_range"):
            zeilen.append(f"  unicode-range:{f['unicode_range']};")
        zeilen.append("}")
    zeilen.append(MARKER_END)
    return "\n".join(zeilen)


def style_css_aktualisieren(faces: list[dict], dry_run: bool = False) -> bool:
    if not STYLE_CSS.exists():
        print(f"FEHLER: {STYLE_CSS} nicht gefunden.")
        sys.exit(2)

    inhalt = STYLE_CSS.read_text(encoding="utf-8")
    muster = re.compile(re.escape(MARKER_START) + r"[\s\S]*?" + re.escape(MARKER_END))
    if not muster.search(inhalt):
        print("FEHLER: Marker FR_FONTS_START/END fehlen in style.css.")
        sys.exit(2)

    neu = muster.sub(lambda _: css_block_bauen(faces), inhalt)

    if dry_run:
        print("\n--- DRY RUN — es wurde nichts geschrieben ---")
        print(css_block_bauen(faces)[:1500])
        return False

    sicherung = STYLE_CSS.with_suffix(".css.bak")
    shutil.copy2(STYLE_CSS, sicherung)
    temp = STYLE_CSS.with_suffix(".css.tmp")
    temp.write_text(neu, encoding="utf-8")
    temp.replace(STYLE_CSS)
    print(f"  Sicherung: {sicherung.name}")
    return True


# ---------------------------------------------------------------- Ablauf

def main() -> int:
    p = argparse.ArgumentParser(description="Laedt die Google Fonts und hostet sie selbst.")
    p.add_argument("--dry-run", action="store_true", help="nur anzeigen, nichts schreiben")
    p.add_argument("--verbose", "-v", action="store_true")
    args = p.parse_args()

    print("Schriften selbst hosten — einmalige Einrichtung\n")

    url = css_url_bauen()
    print("1. Font-CSS von Google holen ...")
    if args.verbose:
        print(f"   {url}")
    css = holen(url, verbose=args.verbose)
    if css is None:
        print("\n   Google nicht erreichbar. style.css bleibt unveraendert.")
        return 1

    print("2. CSS zerlegen ...")
    faces = font_faces_parsen(css, verbose=args.verbose)
    if not faces:
        print("\n   Keine passenden @font-face-Bloecke gefunden.")
        print("   Hat Google das Format geaendert? style.css bleibt unveraendert.")
        return 1

    gefunden = {}
    for f in faces:
        gefunden.setdefault(f["familie"], set()).add(f["gewicht"])
    for fam, gew in gefunden.items():
        print(f"   {fam}: Schnitte {', '.join(sorted(gew))}")

    # Vollstaendigkeit pruefen: fehlt ein angeforderter Schnitt -> Abbruch
    fehlend = []
    for fam, gewichte in FAMILIEN.items():
        for g in gewichte:
            if str(g) not in gefunden.get(fam, set()):
                fehlend.append(f"{fam} {g}")
    if fehlend:
        print(f"\n   Fehlende Schnitte: {', '.join(fehlend)}")
        print("   Unvollstaendig -> style.css bleibt unveraendert.")
        return 1

    print(f"\n3. {len(faces)} Schriftdateien herunterladen ...")
    FONT_DIR.mkdir(parents=True, exist_ok=True)
    gesamt = 0
    for f in faces:
        f["datei"] = f"{slug(f['familie'])}-{f['gewicht']}-{f['subset']}.woff2"
        ziel = FONT_DIR / f["datei"]
        daten = holen(f["url"], binaer=True, verbose=args.verbose)
        if daten is None or len(daten) < 1000:
            print(f"\n   Download fehlgeschlagen: {f['datei']}")
            print("   Abbruch -> style.css bleibt unveraendert.")
            return 1
        ziel.write_bytes(daten)
        gesamt += len(daten)
        print(f"   {f['datei']:<44} {len(daten)/1024:6.1f} KB")

    print(f"\n   Gesamt: {gesamt/1024:.1f} KB in {FONT_DIR.relative_to(PROJEKT)}/")

    print("\n4. style.css aktualisieren ...")
    if style_css_aktualisieren(faces, dry_run=args.dry_run):
        print("\nFertig. Es geht jetzt KEINE Anfrage mehr an Google.")
        print("\nBitte nicht vergessen:")
        print("  - Den Ordner fonts/ mit auf den Server hochladen.")
        print("  - Im Browser mit Strg+F5 hart neu laden und pruefen,")
        print("    ob die Schriften korrekt aussehen.")
        print("  - Datenschutzerklaerung Abschnitt 8 ist bereits angepasst.")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\nAbgebrochen — style.css unveraendert.")
        sys.exit(1)
