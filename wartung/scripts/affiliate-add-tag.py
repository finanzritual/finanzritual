#!/usr/bin/env python3
"""
Amazon Affiliate — Tag einfügen — Finanzritual
================================================
ERSETZT das alte affiliate-replace.py.

Warum ein neues Script: Alle 28 Buchbeiträge haben bereits echte
Amazon-Links (amazon.de/dp/ASIN bzw. bei einem Buch amazon.com/dp/ASIN) —
es fehlt nur noch der Tracking-Tag (?tag=...). Es gibt keine
href="#"-Platzhalter mehr in den book-cover-link/btn-green-Elementen.
(Das href="#" im HTML gehört zum "Kaffee spendieren"-Button, NICHT zu
Amazon — dieses Script fasst das nicht an.)

Verwendung:
  1. Unten TAG_DE eintragen (dein Tag aus partnernet.amazon.de, Format "name-21")
  2. python3 affiliate-add-tag.py
  3. Log prüfen: affiliate-add-tag-log.txt

Wichtig — EIN Sonderfall:
  beitrag-buch-playbook-to-millions.html verlinkt auf amazon.COM
  (Grant Cardone, "Independently published", nicht auf amazon.de gelistet).
  Das deutsche Partnernet-Tag (TAG_DE) funktioniert dort NICHT — Amazon
  Associates US ist ein separates Partnerprogramm mit eigener Anmeldung
  und eigenem Tag. Solange TAG_COM leer ist, überspringt das Script
  diese Datei und meldet das im Log statt einen wirkungslosen Tag zu setzen.
"""
import os, re, sys

BLOG_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOG_FILE = os.path.join(os.path.dirname(__file__), 'affiliate-add-tag-log.txt')

# ---- HIER EINTRAGEN, SOBALD DAS PARTNERPROGRAMM AKTIV IST ----
TAG_DE  = ''   # z.B. 'finanzritual-21'  (aus partnernet.amazon.de)
TAG_COM = ''   # nur nötig für den Cardone-Sonderfall, separates US-Partnerprogramm
# ----------------------------------------------------------------

LINK_RE = re.compile(
    r'href="(https://www\.amazon\.(de|com)/dp/[A-Za-z0-9]{10})"'
)

def add_tag(url, domain):
    if '?' in url:
        return None  # hat schon Query-Parameter -> nicht automatisch anfassen, manuell prüfen
    tag = TAG_DE if domain == 'de' else TAG_COM
    if not tag:
        return None
    return f'{url}?tag={tag}'

def main():
    if not TAG_DE and not TAG_COM:
        print('Kein Tag gesetzt (TAG_DE/TAG_COM). Bitte im Script eintragen, dann erneut ausführen.')
        sys.exit(0)

    changed, skipped_com = [], []
    for fn in sorted(os.listdir(BLOG_DIR)):
        if not (fn.startswith('beitrag-buch-') and fn.endswith('.html')):
            continue
        fpath = os.path.join(BLOG_DIR, fn)
        s = open(fpath, encoding='utf-8').read()
        s2 = s

        def repl(m):
            full_url, domain = m.group(1), m.group(2)
            new_url = add_tag(full_url, domain)
            if new_url is None:
                if domain == 'com' and not TAG_COM:
                    skipped_com.append(fn)
                return m.group(0)
            return f'href="{new_url}"'

        s2 = LINK_RE.sub(repl, s2)
        if s2 != s:
            open(fpath, 'w', encoding='utf-8').write(s2)
            changed.append(fn)

    print(f'Geändert: {len(changed)} Dateien')
    for fn in changed:
        print(f'  ✓ {fn}')
    if skipped_com:
        print(f'\nÜbersprungen (amazon.com, kein TAG_COM gesetzt): {sorted(set(skipped_com))}')

    with open(LOG_FILE, 'w', encoding='utf-8') as log:
        log.write(f'Geändert: {len(changed)} Dateien\n')
        for fn in changed:
            log.write(f'{fn}\n')
        if skipped_com:
            log.write(f'\nÜbersprungen (amazon.com, kein TAG_COM gesetzt):\n')
            for fn in sorted(set(skipped_com)):
                log.write(f'{fn}\n')

if __name__ == '__main__':
    main()
