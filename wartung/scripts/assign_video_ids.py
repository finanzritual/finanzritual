#!/usr/bin/env python3
"""
Vergibt eine fortlaufende, eindeutige fr-video-id an jeden Artikel
(beitrag-*.html und YOUNG-*.html, inklusive -einfach.html-Varianten).

Idempotent: Dateien, die bereits eine fr-video-id im Header haben,
werden uebersprungen (Wert bleibt erhalten). Die naechste freie ID
wird automatisch aus dem bereits vergebenen Hoechstwert ermittelt.

Die Wahrheit lebt in den Dateien selbst (meta-Tag) - dieses Skript
kann jederzeit erneut laufen, um eine aktuelle Uebersichtsliste zu
exportieren, ohne dass irgendetwas manuell gepflegt werden muss.
"""
import glob
import re
import sys

ID_START = 1000
META_RE = re.compile(r'<meta\s+name="fr-video-id"\s+content="(\d+)"\s*/?>')
CANONICAL_RE = re.compile(r'<link[^>]*rel="canonical"[^>]*>')

def find_articles():
    files = sorted(set(glob.glob('beitrag-*.html') + glob.glob('YOUNG-*.html')))
    return files

def get_existing_id(content):
    m = META_RE.search(content)
    return int(m.group(1)) if m else None

def main():
    files = find_articles()
    print(f"{len(files)} Artikel-Dateien gefunden.")

    # Bestandsaufnahme: welche IDs sind schon vergeben?
    existing = {}
    missing = []
    for f in files:
        content = open(f, encoding='utf-8').read()
        eid = get_existing_id(content)
        if eid is not None:
            existing[f] = eid
        else:
            missing.append(f)

    used_ids = set(existing.values())
    if len(used_ids) != len(existing):
        print("WARNUNG: doppelt vergebene IDs gefunden!", file=sys.stderr)

    next_id = ID_START
    while next_id in used_ids:
        next_id += 1

    print(f"Bereits vergeben: {len(existing)} | Neu zu vergeben: {len(missing)}")

    assigned = []
    for f in missing:
        content = open(f, encoding='utf-8').read()
        m = CANONICAL_RE.search(content)
        if not m:
            print(f"FEHLER: keine canonical-Zeile in {f}, uebersprungen.", file=sys.stderr)
            continue
        insertion = m.group(0) + f'\n<meta name="fr-video-id" content="{next_id}">'
        new_content = content[:m.start()] + insertion + content[m.end():]
        open(f, 'w', encoding='utf-8').write(new_content)
        assigned.append((next_id, f))
        used_ids.add(next_id)
        while next_id in used_ids:
            next_id += 1

    print(f"{len(assigned)} neue IDs vergeben.")

    # Uebersichtsliste exportieren (rein abgeleitet, keine manuelle Pflege noetig)
    all_entries = list(existing.items()) + [(f, i) for i, f in assigned]
    all_entries_norm = []
    for f in files:
        content = open(f, encoding='utf-8').read()
        eid = get_existing_id(content)
        all_entries_norm.append((eid, f))
    all_entries_norm.sort()

    with open('_einrichtung/VIDEO_ID_UEBERSICHT.md', 'w', encoding='utf-8') as out:
        out.write("# Video-ID-Uebersicht (automatisch generiert, nicht manuell pflegen)\n\n")
        out.write(f"Erzeugt aus {len(files)} Artikel-Dateien durch `assign_video_ids.py`.\n")
        out.write("Diese Datei ist eine reine Momentaufnahme - Wahrheit steckt im `fr-video-id`-Meta-Tag jeder HTML-Datei.\n")
        out.write("Bei Bedarf einfach das Skript erneut laufen lassen, um diese Liste zu aktualisieren.\n\n")
        out.write("| ID | Artikel-Datei |\n|---|---|\n")
        for eid, f in all_entries_norm:
            out.write(f"| {eid} | {f} |\n")

    print("Uebersicht geschrieben: _einrichtung/VIDEO_ID_UEBERSICHT.md")

if __name__ == '__main__':
    main()
