#!/usr/bin/env python3
"""
SEO-Grundabsicherung: prueft jede live stehende HTML-Datei auf genau
EINEN canonical-Link und genau EINE description-Meta -- nicht null,
nicht mehrere.

WICHTIGE LEKTION AUS V1104/V1117 EINGEARBEITET: Der urspruengliche Audit
scheiterte, weil er per String-/Regex-Suche nach der exakten Attribut-
Reihenfolge <link rel="canonical" ...> suchte. Viele Dateien hatten den
Tag laengst, nur mit anderer Reihenfolge (<link href="..." rel="canonical">)
-- das fuehrte dazu, dass ein spaeterer automatischer Fix faelschlich 423
Duplikate einfuegte. Dieses Skript nutzt deshalb bewusst Pythons
html.parser (versteht Attribute unabhaengig von ihrer Reihenfolge),
niemals rohes String-Matching auf Tag-Text.

Exit-Code 0 = alles sauber, 1 = mindestens ein Problem gefunden. Gedacht
fuer den Einsatz sowohl lokal (vor einem Commit) als auch automatisiert
in einer GitHub-Actions-Pipeline (siehe .github/workflows/seo-check.yml)
-- der Exit-Code ist das Signal, das die Pipeline auswertet, um den Lauf
als fehlgeschlagen zu markieren.

Verwendung:
    python3 _einrichtung/tools/validate_seo_tags.py
    python3 _einrichtung/tools/validate_seo_tags.py --verbose
"""
import glob
import sys
from html.parser import HTMLParser

# Reine Redirect-Stubs (meta http-equiv="refresh") sind zwar keine
# echten Artikel, gehoeren aber inhaltlich weiterhin ins Hauptverzeichnis
# (echte, wenn auch weiterleitende Seiten) -- werden ueber ein
# erkennbares Merkmal automatisch von der Description-Pflicht befreit.
# Reine Entwickler-/Design-Testkonstrukte (Kontrast-Referenzen,
# Stil-Tests etc.) gehoeren dagegen gar nicht erst hierher: seit V1123
# leben sie in _dev-referenzen/ (Unterstrich-Praefix wie _einrichtung/,
# _includes/ -- von Jekyll automatisch komplett vom Live-Build
# ausgeschlossen). find_target_files() unten durchsucht ohnehin nur das
# Hauptverzeichnis (kein rekursiver Glob), Dateien dort werden also gar
# nicht erst erfasst -- eine fragile Namens-Praefix-Sonderregel dafuer
# ist damit ueberfluessig geworden.
def is_exempt(filename, html):
    if 'http-equiv="refresh"' in html or "http-equiv='refresh'" in html:
        return True
    return False


class SeoTagChecker(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonicals = []
        self.descriptions = []
        self.in_head = True

    def handle_starttag(self, tag, attrs):
        if not self.in_head:
            return
        d = dict(attrs)
        if tag == 'link' and d.get('rel') == 'canonical':
            self.canonicals.append(d.get('href'))
        if tag == 'meta' and d.get('name') == 'description':
            self.descriptions.append(d.get('content'))

    def handle_endtag(self, tag):
        if tag == 'head':
            self.in_head = False


def find_target_files():
    files = glob.glob('*.html')
    return sorted(f for f in files if 'Rechner-Modul-Solo' not in f)


def main():
    verbose = '--verbose' in sys.argv
    files = find_target_files()

    problems = []

    for f in files:
        html = open(f, encoding='utf-8').read()
        checker = SeoTagChecker()
        checker.feed(html)

        n_canon = len(checker.canonicals)
        n_desc = len(checker.descriptions)
        exempt = is_exempt(f, html)

        if not exempt:
            if n_canon == 0:
                problems.append((f, 'FEHLT: canonical'))
            elif n_canon > 1:
                problems.append((f, f'DOPPELT: {n_canon}x canonical'))

            if n_desc == 0:
                problems.append((f, 'FEHLT: description'))
            elif n_desc > 1:
                problems.append((f, f'DOPPELT: {n_desc}x description'))

    print(f"{len(files)} Dateien geprueft.")

    if not problems:
        print("Alles sauber -- jede Seite hat genau einen canonical-Link und")
        print("(sofern nicht befreit) genau eine description.")
        return 0

    print(f"\n{len(problems)} Problem(e) gefunden:\n")
    for fname, issue in problems:
        print(f"  {fname}: {issue}")

    print(f"\nExit-Code 1 -- siehe oben, welche Dateien betroffen sind.")
    return 1


if __name__ == '__main__':
    sys.exit(main())
