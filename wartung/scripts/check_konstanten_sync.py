#!/usr/bin/env python3
"""
Prueft, ob KONSTANTEN_WARTUNG.md seit dem letzten dokumentierten Sync mit
FR_CONSTANTS in script.js von Hand bearbeitet wurde.

Repo-lokales Werkzeug, KEIN Live-Browser-Mechanismus -- Ausgeschlossen aus dem
Jekyll-Build ist hier bewusst NICHT relevant: Dieses Skript UND
KONSTANTEN_WARTUNG.md liegen ab V1122 bewusst im oeffentlichen Root-Bereich
(wartung/), waehrend AENDERUNGS_LOG.md/STATISTIK weiterhin privat unter
_einrichtung/ bleiben (siehe .gitignore). Gedacht als erster Schritt am
Anfang einer kuenftigen Sitzung: sofort sichtbar machen, ob die Tabelle
seit dem letzten Abgleich angefasst wurde, statt es manuell zu vermuten.

Benutzung:
    python3 wartung/scripts/check_konstanten_sync.py
    python3 wartung/scripts/check_konstanten_sync.py --update-hash
"""
import hashlib
import json
import sys
from pathlib import Path
from datetime import datetime, timezone

# wartung/scripts/check_konstanten_sync.py -> zwei Ebenen hoch = Projekt-Root
ROOT = Path(__file__).resolve().parent.parent.parent
MD_FILE = ROOT / "wartung" / "KONSTANTEN_WARTUNG.md"
HASH_FILE = ROOT / "wartung" / "KONSTANTEN_SYNC_HASH.json"


def current_hash():
    return hashlib.sha256(MD_FILE.read_bytes()).hexdigest()


def load_stored():
    if not HASH_FILE.exists():
        return None
    return json.loads(HASH_FILE.read_text(encoding="utf-8"))


def save_stored(h):
    data = {
        "sha256": h,
        "gespeichert_am": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "hinweis": "Hash von KONSTANTEN_WARTUNG.md zum Zeitpunkt des letzten "
                   "bestaetigten Abgleichs mit FR_CONSTANTS in script.js.",
    }
    HASH_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main():
    if not MD_FILE.exists():
        print(f"FEHLER: {MD_FILE} nicht gefunden.")
        sys.exit(1)

    h = current_hash()
    stored = load_stored()

    if "--update-hash" in sys.argv:
        save_stored(h)
        print(f"Hash gespeichert: {h[:16]}...")
        return

    if stored is None:
        print("Kein gespeicherter Hash gefunden -- vermutlich erster Lauf.")
        print(f"Aktueller Hash: {h[:16]}...")
        print("Mit --update-hash aufrufen, um diesen Stand als Referenz zu setzen.")
        return

    if stored["sha256"] == h:
        print(f"UNVERAENDERT seit letztem Sync ({stored['gespeichert_am']}).")
        print("KONSTANTEN_WARTUNG.md und FR_CONSTANTS gelten als abgeglichen.")
    else:
        print(f"GEAENDERT seit letztem Sync ({stored['gespeichert_am']})!")
        print("Die Wartungstabelle wurde von Hand bearbeitet -- vor der naechsten")
        print("Aenderung an FR_CONSTANTS in script.js pruefen, ob neue 'NEU:'-Werte")
        print("eingetragen wurden, die noch uebernommen werden muessen.")
        print(f"Alter Hash:     {stored['sha256'][:16]}...")
        print(f"Aktueller Hash: {h[:16]}...")


if __name__ == "__main__":
    main()
