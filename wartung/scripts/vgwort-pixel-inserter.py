#!/usr/bin/env python3
"""
VG-Wort Pixel-Inserter für Finanzritual (V916, ueberarbeitet)
================================================================
Aenderungen gegenueber der Vorversion (siehe
vgwort-pixel-inserter_ORIGINAL_vor-V916-ueberarbeitung.py):
  - BLOG_DIR korrigiert (zeigte auf einen nicht mehr existierenden Pfad
    'finanzritual_53/finanzritual_53')
  - Vor jeder Aenderung an der CSV wird automatisch eine datierte Sicherung
    angelegt (siehe _einrichtung/pixel-registry-backups/) -- die Datei mit
    den zugewiesenen Pixel-Codes ist die verwundbarste im ganzen Projekt,
    ein Fehler hier ist bei VG Wort nicht nachtraeglich korrigierbar.
  - Erfasst zusaetzlich zwei neue Spalten: registriert_am (Zeitstempel der
    Pixel-Einfuegung) und hash_bei_registrierung (SHA-256 des Artikel-Texts
    zum Zeitpunkt der Registrierung). WICHTIG: dieser Hash beeinflusst NIE
    die Pixel-Zuordnung selbst (die haengt ausschliesslich am Dateinamen/
    der Zeile in der CSV) -- er dient rein der spaeteren Nachpruefbarkeit,
    ob sich ein Artikel seit der VG-Wort-Registrierung inhaltlich veraendert
    hat.

Voraussetzung: vgwort-pixel-codes.csv ausgefuellt mit Pixel-Codes aus METIS.

Verwendung:
  1. In tom.vgwort.de einloggen -> Zaehlpixel -> Neue Pixel anfordern
  2. Codes in vgwort-pixel-codes.csv eintragen (Spalte: pixel_code)
     Format: nur der Code-Teil, z.B. a1b2c3d4e5f6g7h8
     (nicht die ganze URL -- die wird automatisch zusammengesetzt)
  3. Dieses Script ausfuehren:
     python3 vgwort-pixel-inserter.py

Das Script:
  - Sichert die CSV zuerst (Zeitstempel im Dateinamen, ueberschreibt nie)
  - Liest die CSV
  - Fuegt den Pixel-Tag in jede HTML-Datei ein (vor </body>)
  - Fuegt zusaetzlich zwei permanente Freeze-Meta-Tags in <head> ein
    (fr-vgwort-freeze-content-hash, fr-vgwort-freeze-links-hash) --
    der exakte Text-/Verlinkungs-Zustand zum Registrierungszeitpunkt,
    direkt in der Datei selbst, unabhaengig von der externen CSV.
    Werden NUR hier geschrieben, danach von keinem anderen Skript
    (insb. nicht embed_content_hash.py) je wieder angefasst.
  - Ueberspringt Dateien, die bereits einen VG-Wort-Pixel haben
  - Traegt registriert_am und hash_bei_registrierung fuer jede neu
    eingefuegte Zeile in die CSV ein
  - Erstellt ein Log, was eingefuegt wurde
"""

import csv, os, sys, re, hashlib, shutil
from datetime import datetime

# Projekt-Root: eine Ebene ueber _einrichtung/, wo dieses Skript liegt.
# Ersetzt den alten, fest verdrahteten Pfad 'finanzritual_53/finanzritual_53',
# der im Projekt nicht mehr existierte.
# Projekt-Root: zwei Ebenen ueber wartung/scripts/, wo dieses Skript ab
# V1122 liegt (umgezogen aus _einrichtung/Python - Scripte/, damit das
# Skript oeffentlich im Repo sichtbar ist). Die CSV mit den echten
# Pixel-Codes bleibt bewusst PRIVAT in _einrichtung/ (per .gitignore
# ausgeschlossen) -- nur das Skript selbst zieht um, nicht die Daten.
SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
BLOG_DIR    = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..'))
CSV_FILE    = os.path.join(BLOG_DIR, '_einrichtung', 'vgwort-pixel-codes.csv')
BACKUP_DIR  = os.path.join(BLOG_DIR, '_einrichtung', 'pixel-registry-backups')
PIXEL_BASE  = 'https://ssl.vgwort.de/na/'


def sichere_csv():
    """Legt vor JEDER Aenderung eine datierte Kopie der CSV an. Alte
    Sicherungen werden nie geloescht -- vollstaendige Historie."""
    if not os.path.exists(CSV_FILE):
        return
    os.makedirs(BACKUP_DIR, exist_ok=True)
    basis = datetime.now().strftime("%Y-%m-%d_%H%M%S_%f")
    ziel = os.path.join(BACKUP_DIR, f"vgwort-pixel-codes_{basis}.csv")
    zaehler = 1
    while os.path.exists(ziel):
        ziel = os.path.join(BACKUP_DIR, f"vgwort-pixel-codes_{basis}_{zaehler}.csv")
        zaehler += 1
    shutil.copy2(CSV_FILE, ziel)
    print(f"  Sicherung angelegt: {os.path.relpath(ziel, SCRIPT_DIR)}")


def hash_artikel_text(html):
    """Hash NUR ueber den sichtbaren Artikeltext, nicht ueber die komplette
    Datei -- so bleibt der Hash stabil gegenueber reinen Formatierungs-
    Aenderungen (Whitespace, Attribut-Reihenfolge) und aendert sich nur bei
    echten inhaltlichen Aenderungen. Fallback auf den kompletten Dateiinhalt,
    falls kein Artikel-Container gefunden wird."""
    match = re.search(r'<article[^>]*>(.*?)</article>', html, re.DOTALL)
    basis = match.group(1) if match else html
    text_only = re.sub(r'<[^>]+>', ' ', basis)
    text_only = re.sub(r'\s+', ' ', text_only).strip()
    return hashlib.sha256(text_only.encode('utf-8')).hexdigest()


def make_pixel(code):
    code = code.strip()
    if not code:
        return None
    if 'vgwort.de' in code:
        code = code.rstrip('/').split('/')[-1]
    return f'<script src="{PIXEL_BASE}{code}" media="print" async></script>'


# ---- Nachtrag (01.09.2026): Freeze-Hashes zum Registrierungszeitpunkt ----
# Identische Logik wie in _einrichtung/tools/embed_content_hash.py
# (dortige INTERNAL_HREF_RE/is_internal_link/hash_internal_links), hier
# bewusst dupliziert statt importiert -- dieses Skript soll unabhaengig
# lauffaehig bleiben, auch wenn embed_content_hash.py sich mal aendert.
INTERNAL_HREF_RE = re.compile(r'<a\s[^>]*href="([^"]+)"')


def is_internal_link(href):
    if href.startswith('#'): return False
    if href.startswith('mailto:') or href.startswith('tel:'): return False
    if href.startswith('http://') or href.startswith('https://'):
        return 'finanz-ritual.de' in href
    return True


def hash_internal_links(html):
    match = re.search(r'<article[^>]*>(.*?)</article>', html, re.DOTALL)
    basis = match.group(1) if match else html
    hrefs = [h for h in INTERNAL_HREF_RE.findall(basis) if is_internal_link(h)]
    basis_str = '|'.join(sorted(hrefs))
    return hashlib.sha256(basis_str.encode('utf-8')).hexdigest()


def already_has_pixel(html):
    return 'vgwort.de' in html or 'ssl.vgwort' in html


def insert_pixel(html, pixel_tag, content_hash, links_hash):
    """Fuegt Pixel-Tag UND zwei permanente Freeze-Hashes ein -- den
    Text-Zustand und den internen-Verlinkungs-Zustand exakt zum
    Registrierungszeitpunkt bei VG Wort. WICHTIG, Abgrenzung zu
    fr-content-hash/fr-links-hash (embed_content_hash.py): jene werden
    bei jeder Textaenderung laufend AKTUALISIERT (Zweck: Drift ueber Zeit
    erkennen). fr-vgwort-freeze-* werden dagegen genau EINMAL hier
    geschrieben und danach von KEINEM anderen Skript je wieder angefasst
    -- sie sind der permanente, unveraenderliche Beleg dessen, was VG
    Wort tatsaechlich gemeldet bekam. embed_content_hash.py darf diese
    beiden Meta-Tags niemals lesen oder ueberschreiben.
    """
    freeze_tags = (
        f'<meta name="fr-vgwort-freeze-content-hash" content="{content_hash}">\n'
        f'<meta name="fr-vgwort-freeze-links-hash" content="{links_hash}">\n'
    )
    if '</head>' in html:
        html = html.replace('</head>', freeze_tags + '</head>', 1)
    if '</body>' in html:
        return html.replace('</body>', f'\n{pixel_tag}\n</body>', 1)
    return html + f'\n{pixel_tag}\n'


def main():
    if not os.path.exists(CSV_FILE):
        print(f"✗ {CSV_FILE} nicht gefunden.")
        sys.exit(1)
    if not os.path.exists(BLOG_DIR):
        print(f"✗ Projekt-Verzeichnis '{BLOG_DIR}' nicht gefunden.")
        sys.exit(1)

    sichere_csv()

    with open(CSV_FILE, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter=';')
        rows = list(reader)
        fieldnames = reader.fieldnames

    inserted, skipped_no_code, skipped_already, not_found = [], [], [], []

    for row in rows:
        fname = row.get('datei', '').strip()
        code = row.get('pixel_code', '').strip()
        title = row.get('titel', '').strip()

        if not fname:
            continue

        filepath = os.path.join(BLOG_DIR, fname)

        if not os.path.exists(filepath):
            not_found.append(fname)
            continue

        if not code:
            skipped_no_code.append(fname)
            continue

        html = open(filepath, encoding='utf-8').read()

        if already_has_pixel(html):
            skipped_already.append(fname)
            continue

        pixel_tag = make_pixel(code)
        if not pixel_tag:
            skipped_no_code.append(fname)
            continue

        # Hash VOR der Aenderung erfassen -- Zustand zum Zeitpunkt der
        # Registrierung, nicht danach. Zwei Hashes: Text UND interne
        # Verlinkung, beide werden gleich als permanente Freeze-Meta-Tags
        # mit eingebettet.
        content_hash = hash_artikel_text(html)
        links_hash = hash_internal_links(html)

        new_html = insert_pixel(html, pixel_tag, content_hash, links_hash)
        open(filepath, 'w', encoding='utf-8').write(new_html)

        row['registriert_am'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        row['hash_bei_registrierung'] = content_hash

        inserted.append((fname, code, title))
        print(f"  ✓ {fname}  (Hash: {content_hash[:12]}...)")

    if inserted:
        with open(CSV_FILE, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=';')
            writer.writeheader()
            writer.writerows(rows)

    print(f"\n{'='*55}")
    print(f"  Pixel eingefügt:          {len(inserted):>3}")
    print(f"  Kein Code in CSV:         {len(skipped_no_code):>3}")
    print(f"  Bereits Pixel vorhanden:  {len(skipped_already):>3}")
    print(f"  Datei nicht gefunden:     {len(not_found):>3}")
    print(f"{'='*55}")

    if not_found:
        print(f"\n⚠️  Nicht gefundene Dateien ({len(not_found)}) -- Dateiname in der CSV pruefen:")
        for f in not_found:
            print(f"  {f}")

    log_path = os.path.join(SCRIPT_DIR, 'vgwort-insert-log.txt')
    with open(log_path, 'a', encoding='utf-8') as log:
        log.write(f"\n--- Lauf {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ---\n")
        for fname, code, title in inserted:
            log.write(f"{fname}\n  Code: {code}\n  Titel: {title}\n")
        log.write(f"Gesamt eingefügt in diesem Lauf: {len(inserted)}\n")

    print(f"\nLog ergaenzt: {os.path.relpath(log_path, SCRIPT_DIR)}")


if __name__ == '__main__':
    main()
