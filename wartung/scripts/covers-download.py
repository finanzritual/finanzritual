#!/usr/bin/env python3
"""
Buchcover lokal herunterladen — Finanzritual
==============================================
Lädt die noch extern verlinkten Buchcover (covers.openlibrary.org,
books.google.com) herunter, speichert sie unter img/covers/ und schreibt
den <img src="..."> in den jeweiligen Artikeln auf den lokalen Pfad um —
im selben Stil wie die Bücher, die schon lokale Cover haben (kein
onerror-Fallback mehr nötig, weil die Datei dann fest im Projekt liegt).

WICHTIG: Netzwerkzugriff in der Sandbox-Umgebung, in der dieses Script
geschrieben wurde, ist deaktiviert — es konnte dort NICHT gegen echte
Server getestet werden. Bitte lokal bei dir ausführen (wo du die Seiten
ohnehin schon im Browser testest) und den Log danach kurz prüfen.

Verwendung:
  python3 covers-download.py

Braucht nur die Python-Standardbibliothek (urllib) — kein pip install nötig.
Ergebnis-Log: covers-download-log.txt
Bereits heruntergeladene/lokale Bücher werden übersprungen (idempotent —
mehrfaches Ausführen ist ungefährlich).
"""
import os, re, time
import urllib.request

BLOG_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COVERS_DIR = os.path.join(BLOG_DIR, 'img', 'covers')
LOG_FILE = os.path.join(os.path.dirname(__file__), 'covers-download-log.txt')


def slug_from_filename(fn):
    # beitrag-buch-XYZ.html -> XYZ
    return fn[len('beitrag-buch-'):-len('.html')]


def extract_urls(img_tag):
    primary = fallback = None
    m = re.search(r'src="([^"]+)"', img_tag)
    if m:
        primary = m.group(1)
    m2 = re.search(r"this\.src='([^']+)'", img_tag)
    if m2:
        fallback = m2.group(1)
    return primary, fallback


def download(url, dest_path):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = resp.read()
    if len(data) < 500:
        raise ValueError(f'Antwort zu klein ({len(data)} Bytes) — vermutlich kein echtes Bild')
    with open(dest_path, 'wb') as f:
        f.write(data)


def main():
    os.makedirs(COVERS_DIR, exist_ok=True)
    results = []

    for fn in sorted(os.listdir(BLOG_DIR)):
        if not (fn.startswith('beitrag-buch-') and fn.endswith('.html')):
            continue
        fpath = os.path.join(BLOG_DIR, fn)
        html = open(fpath, encoding='utf-8').read()

        img_match = re.search(r'<img class="book-cover-hero"[^>]*>', html)
        if not img_match:
            results.append((fn, 'SKIP', 'kein book-cover-hero-Tag gefunden'))
            continue
        img_tag = img_match.group(0)

        if 'src="img/covers/' in img_tag:
            results.append((fn, 'SKIP', 'bereits lokal'))
            continue

        primary, fallback = extract_urls(img_tag)
        slug = slug_from_filename(fn)
        dest = os.path.join(COVERS_DIR, slug + '.jpg')

        ok, last_err = False, None
        for url in [u for u in (primary, fallback) if u]:
            try:
                download(url, dest)
                ok = True
                break
            except Exception as e:
                last_err = str(e)
                time.sleep(0.5)

        if not ok:
            results.append((fn, 'FEHLER', f'Download fehlgeschlagen: {last_err}'))
            continue

        new_tag = f'<img class="book-cover-hero" src="img/covers/{slug}.jpg" alt="" loading="lazy">'
        html2 = html.replace(img_tag, new_tag)
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(html2)
        results.append((fn, 'OK', f'img/covers/{slug}.jpg'))

    with open(LOG_FILE, 'w', encoding='utf-8') as log:
        for fn, status, info in results:
            line = f'{status:8} {fn:55} {info}'
            print(line)
            log.write(line + '\n')

    n_ok = sum(1 for r in results if r[1] == 'OK')
    n_err = sum(1 for r in results if r[1] == 'FEHLER')
    print(f'\nFertig: {n_ok} heruntergeladen, {n_err} Fehler. Details: {LOG_FILE}')


if __name__ == '__main__':
    main()
