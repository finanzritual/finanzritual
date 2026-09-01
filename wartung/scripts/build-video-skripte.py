#!/usr/bin/env python3
"""
build-video-skripte.py
========================

Backt die Inhalte aus video-skripte.json direkt und fest in die jeweiligen
Artikel-HTML-Dateien ein -- als eingeklapptes <details>-Element, GENAU wie
im urspruenglichen V579-Muster (kein fetch(), kein Server noetig, oeffnet
sich auch bei "Datei doppelklicken" / file://).

Warum dieser Umweg ueber die JSON und nicht einfach wieder von Hand ins
HTML tippen? Die JSON bleibt die zentrale, pflegbare Quelle (fuer
export-video-skripte.py / den Batch-Markdown-Export und fuers spaetere
Archivieren bei Rollout). Dieses Script ist der "Baustein", der aus dieser
Quelle die tatsaechlich im Browser sichtbare, server-unabhaengige Kopie
erzeugt. Bei jeder inhaltlichen Aenderung an einem Skript in
video-skripte.json also: erst JSON anpassen, dann dieses Script laufen
lassen, um die HTML-Kopie zu aktualisieren.

Idempotent: markiert die eingefuegte Stelle mit HTML-Kommentaren
    <!-- FR_VIDEO_SCRIPT_START:<key> --> ... <!-- FR_VIDEO_SCRIPT_END:<key> -->
Beim erneuten Ausfuehren wird ein bereits vorhandener Block anhand dieser
Marker gefunden und ersetzt (nicht dupliziert). Ist noch kein Block
vorhanden, wird nach dem alten fetch()-basierten Mount-Point gesucht
(<div id="fr-video-script-mount" ... data-video-script-key="...">) und
dieser durch den neuen statischen Block ersetzt.

Aufruf:
    python3 build-video-skripte.py
    (aus dem Projekt-Root: python3 _einrichtung/build-video-skripte.py)

Mehrfach ausfuehrbar, ueberspringt Artikel ohne passenden Marker/Mount-Point
mit einer Warnung statt zu raten.
"""

import json
import os
import re
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
LIVE_JSON_PATH = os.path.join(PROJECT_ROOT, "video-skripte.json")


def render_block(key, entry):
    rows = []
    szenen = entry.get("szenen", [])
    for i, s in enumerate(szenen):
        border = "border-bottom:1px solid var(--line);" if i < len(szenen) - 1 else ""
        rows.append(
            f'<tr style="{border}"><td style="padding:6px 8px;white-space:nowrap;">{s.get("zeit","")}</td>'
            f'<td style="padding:6px 8px;">{s.get("visual","")}</td>'
            f'<td style="padding:6px 8px;">{s.get("voiceover","")}</td></tr>'
        )
    rows_html = "\n".join(rows)
    rollout = entry.get("rolloutDatum", "–")
    return f'''<!-- FR_VIDEO_SCRIPT_START:{key} -->
<details class="fr-video-script" style="margin-top:28px;border:1px dashed var(--line);border-radius:10px;padding:12px 16px;background:var(--bg-raised);">
<summary style="cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:.72rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-soft);">🎬 Produktionsnotiz — Videoskript (nicht Teil des Artikels)</summary>
<div style="margin-top:12px;font-size:.85rem;overflow-x:auto;">
<p style="margin:0 0 10px;color:var(--ink-soft);">Skript-Vorschlag für eine Video-KI. Interner Produktionshinweis, für Leser:innen ausgeblendet. Quelle: video-skripte.json (Rollout-Datum: {rollout}).</p>
<table style="width:100%;border-collapse:collapse;font-size:.82rem;">
<thead><tr style="text-align:left;border-bottom:1px solid var(--line);"><th style="padding:6px 8px;">Zeit</th><th style="padding:6px 8px;">Visuelle Anweisung (B-Roll / Prompt)</th><th style="padding:6px 8px;">Voiceover</th></tr></thead>
<tbody>
{rows_html}
</tbody>
</table>
</div>
</details>
<!-- FR_VIDEO_SCRIPT_END:{key} -->'''


def bake_into_html(key, entry):
    html_path = os.path.join(PROJECT_ROOT, key)
    if not os.path.exists(html_path):
        print(f"WARNUNG: {key} nicht gefunden im Projekt-Root -- übersprungen.")
        return False

    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    new_block = render_block(key, entry)

    marker_pattern = re.compile(
        re.escape(f"<!-- FR_VIDEO_SCRIPT_START:{key} -->") + r".*?" +
        re.escape(f"<!-- FR_VIDEO_SCRIPT_END:{key} -->"),
        re.DOTALL,
    )
    if marker_pattern.search(html):
        html = marker_pattern.sub(new_block, html)
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"Aktualisiert (bereits gebacken, Marker gefunden): {key}")
        return True

    mount_pattern = re.compile(
        r'<div id="fr-video-script-mount"[^>]*data-video-script-key="' + re.escape(key) + r'"[^>]*></div>\s*'
        r'<script>.*?</script>',
        re.DOTALL,
    )
    if mount_pattern.search(html):
        html = mount_pattern.sub(new_block, html)
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"Erstmalig gebacken (fetch-Mount ersetzt): {key}")
        return True

    # Fallback: ein "nackter" Mount-Point ohne fetch()-Script dahinter --
    # z.B. wenn der Mount-Point frisch von Hand in ein neues Artikel-HTML
    # gesetzt wurde, um direkt statisch zu backen (kein Zwischenschritt
    # ueber die fetch-Variante noetig).
    bare_mount_pattern = re.compile(
        r'<div id="fr-video-script-mount"[^>]*data-video-script-key="' + re.escape(key) + r'"[^>]*></div>'
    )
    if bare_mount_pattern.search(html):
        html = bare_mount_pattern.sub(new_block, html)
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"Erstmalig gebacken (leerer Mount-Point ersetzt): {key}")
        return True

    print(f"WARNUNG: Weder Marker noch Mount-Point für {key} gefunden -- nichts geändert. "
          f"Block muss ggf. manuell eingefügt werden.")
    return False


def main():
    if not os.path.exists(LIVE_JSON_PATH):
        print(f"{LIVE_JSON_PATH} nicht gefunden -- nichts zu backen.")
        return
    with open(LIVE_JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    count = 0
    for key, entry in data.items():
        if key.startswith("_"):
            continue
        if entry.get("status") != "pending":
            continue
        if bake_into_html(key, entry):
            count += 1

    print(f"\nFertig. {count} Artikel-Seite(n) mit statischem Video-Skript-Block versehen/aktualisiert.")
    print("Diese Seiten funktionieren jetzt auch per Doppelklick (file://), kein Server nötig.")


if __name__ == "__main__":
    main()
