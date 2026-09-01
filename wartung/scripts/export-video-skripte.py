#!/usr/bin/env python3
"""
export-video-skripte.py
========================

Rollout-Werkzeug fuer die versteckten Video-/TikTok-Kurzskripte, die einzelne
Artikelseiten per fetch() aus video-skripte.json (Projekt-Root, NICHT unter
_einrichtung/, da sonst live per Jekyll ausgeschlossen) nachladen und bis zum
jeweiligen rolloutDatum eingeklappt anzeigen (siehe <details id="fr-video-script-mount">
in den betroffenen Artikeln).

Was dieses Script tut, in dieser Reihenfolge:

1. Liest video-skripte.json im Projekt-Root ein.
2. Schreibt EINE Markdown-Batch-Datei mit allen Skripten (Zeit/Visual/Voiceover
   pro Szene, sauber pro Artikel gruppiert) nach:
       _einrichtung/VIDEO_SKRIPTE_BATCH_EXPORT.md
   Diese Datei ist die "Wiedereinfuegungs-Quelle" -- falls ein Skript nach dem
   Rollout doch nochmal gebraucht wird (z.B. fuer eine spaetere TikTok-Serie),
   steht hier alles in lesbarer, kopierbarer Form. Kann in Word geoeffnet und
   als .docx gespeichert werden, falls eine Word-Datei gewuenscht ist --
   ein automatischer .docx-Export ist hier bewusst nicht eingebaut, um keine
   zusaetzliche Python-Abhaengigkeit (python-docx) vorauszusetzen.
3. Verschiebt JEDEN Eintrag mit status=="pending" UND einem rolloutDatum, das
   heute oder in der Vergangenheit liegt, aus der live geladenen
   video-skripte.json in ein Archiv:
       _einrichtung/video-skripte-archiv.json
   und entfernt ihn aus der live-Datei. Eintraege mit einem rolloutDatum in
   der Zukunft bleiben unangetastet in der live-Datei (das Frontend blendet
   sie ohnehin erst nach dem Datum aus, siehe Artikel-JS).
4. Schreibt ein Protokoll nach _einrichtung/export-video-skripte-log.txt.

Manuell ausfuehren, keine Automatisierung/Cronjob (statische Seite ohne
Server). Gedachter Ablauf: kurz nach dem 1.1.2027 (oder wann auch immer ein
Artikel gehen soll) dieses Script einmal laufen lassen, danach die MD-Datei
pruefen und bei Bedarf den Video-Produktions-Batch daraus bauen.

Aufruf:
    python3 export-video-skripte.py
    (oder aus dem Projekt-Root: python3 _einrichtung/export-video-skripte.py)

Mehrfach ausfuehrbar: bereits archivierte Eintraege bleiben archiviert,
nichts wird doppelt exportiert oder ueberschrieben ohne Log-Eintrag.
"""

import json
import os
import re
import sys
from datetime import date, datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)

LIVE_JSON_PATH = os.path.join(PROJECT_ROOT, "video-skripte.json")
ARCHIV_JSON_PATH = os.path.join(SCRIPT_DIR, "video-skripte-archiv.json")
BATCH_MD_PATH = os.path.join(SCRIPT_DIR, "VIDEO_SKRIPTE_BATCH_EXPORT.md")
LOG_PATH = os.path.join(SCRIPT_DIR, "export-video-skripte-log.txt")


def load_json(path):
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def write_batch_markdown(all_entries):
    """Schreibt ALLE bekannten Skripte (live + bereits archivierte) in eine
    einzige, lesbare Markdown-Datei -- unabhaengig vom Rollout-Status, damit
    die Datei immer die vollstaendige Wiedereinfuegungs-Quelle ist."""
    lines = ["# Video-/TikTok-Skripte — Batch-Export", "",
             f"Erzeugt am: {datetime.now().strftime('%d.%m.%Y %H:%M')}", "",
             "Diese Datei fasst alle bekannten Kurzvideo-Skripte aus "
             "`video-skripte.json` und `video-skripte-archiv.json` zusammen. "
             "Gedacht als Kopiervorlage fuer Video-KI-Tools (CapCut, Runway, "
             "HeyGen u.ae.) und als Quelle, falls ein Skript spaeter wieder "
             "in eine Artikelseite eingefuegt werden soll.", "", "---", ""]

    for key, entry in all_entries.items():
        if key.startswith("_"):
            continue
        titel = entry.get("titel", key)
        status = entry.get("status", "unbekannt")
        rollout = entry.get("rolloutDatum", "–")
        lines.append(f"## {titel}")
        lines.append("")
        lines.append(f"- **Artikel-Datei:** `{key}`")
        lines.append(f"- **Status:** {status}")
        lines.append(f"- **Rollout-Datum:** {rollout}")
        lines.append(f"- **Erstellt am:** {entry.get('erstelltAm', '–')}")
        lines.append("")
        lines.append("| Zeit | Visual | Voiceover |")
        lines.append("|---|---|---|")
        for szene in entry.get("szenen", []):
            visual = (szene.get("visual", "") or "").replace("|", "\\|")
            voiceover = (szene.get("voiceover", "") or "").replace("|", "\\|")
            lines.append(f"| {szene.get('zeit', '')} | {visual} | {voiceover} |")
        lines.append("")
        lines.append("---")
        lines.append("")

    with open(BATCH_MD_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


def strip_baked_block(key):
    """Entfernt einen von build-video-skripte.py fest ins HTML gebackenen
    Videoskript-Block (erkennbar an den FR_VIDEO_SCRIPT_START/END-Markern)
    beim Archivieren. Falls kein gebackener Block gefunden wird (z.B. weil
    noch nie gebaut wurde), passiert einfach nichts -- kein Fehler."""
    html_path = os.path.join(PROJECT_ROOT, key)
    if not os.path.exists(html_path):
        return False
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()
    pattern = re.compile(
        re.escape(f"<!-- FR_VIDEO_SCRIPT_START:{key} -->") + r".*?" +
        re.escape(f"<!-- FR_VIDEO_SCRIPT_END:{key} -->") + r"\n?",
        re.DOTALL,
    )
    new_html, n = pattern.subn("", html)
    if n:
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(new_html)
        return True
    return False


def main():
    live = load_json(LIVE_JSON_PATH)
    archiv = load_json(ARCHIV_JSON_PATH)
    log_lines = [f"=== Lauf am {datetime.now().strftime('%d.%m.%Y %H:%M')} ==="]

    if not live and not archiv:
        print(f"Weder {LIVE_JSON_PATH} noch ein Archiv gefunden -- nichts zu tun.")
        return

    # Kombinierte Ansicht fuer den Markdown-Export (live + bereits archiviert)
    combined = {}
    combined.update(archiv)
    combined.update(live)
    write_batch_markdown(combined)
    log_lines.append(f"Batch-MD geschrieben: {BATCH_MD_PATH} ({len([k for k in combined if not k.startswith('_')])} Artikel gesamt)")

    today = date.today()
    moved = []
    remaining_live = {}
    for key, entry in live.items():
        if key.startswith("_"):
            remaining_live[key] = entry
            continue
        rollout_str = entry.get("rolloutDatum")
        status = entry.get("status")
        should_archive = False
        if status == "pending" and rollout_str:
            try:
                rollout_date = datetime.strptime(rollout_str, "%Y-%m-%d").date()
                if today >= rollout_date:
                    should_archive = True
            except ValueError:
                log_lines.append(f"WARNUNG: ungueltiges Datumsformat bei {key}: {rollout_str!r} -- uebersprungen, bleibt live.")
        if should_archive:
            entry["status"] = "archiviert"
            entry["archiviertAm"] = today.isoformat()
            archiv[key] = entry
            moved.append(key)
            if strip_baked_block(key):
                log_lines.append(f"  -> gebackenen Video-Skript-Block auch aus {key} entfernt.")
        else:
            remaining_live[key] = entry

    if moved:
        save_json(ARCHIV_JSON_PATH, archiv)
        save_json(LIVE_JSON_PATH, remaining_live)
        log_lines.append(f"Archiviert und aus der live-Datei entfernt ({len(moved)}): " + ", ".join(moved))
    else:
        log_lines.append("Keine Eintraege faellig (kein rolloutDatum <= heute mit status=pending) -- live-Datei unveraendert gelassen.")

    log_lines.append("")
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write("\n".join(log_lines) + "\n\n")

    print("\n".join(log_lines))
    print(f"\nFertig. MD-Batch: {BATCH_MD_PATH}")
    if moved:
        print(f"Archiv aktualisiert: {ARCHIV_JSON_PATH}")
        print(f"Live-JSON bereinigt: {LIVE_JSON_PATH}")


if __name__ == "__main__":
    main()
