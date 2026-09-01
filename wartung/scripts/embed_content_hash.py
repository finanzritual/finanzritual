#!/usr/bin/env python3
"""
Bettet einen Nutztext-Hash direkt in jeden Artikel-Header ein
(<meta name="fr-content-hash" content="...">), analog zum bereits
bestehenden fr-video-id-Muster.

Warum im Header statt nur extern in der CSV: die urspruengliche Idee,
zwischen einem "Rahmen"-Hash (soll konstant bleiben) und einem
Nutztext-Hash (darf sich aendern) zu trennen, wurde verworfen -- der
Header selbst entwickelt sich im Projektverlauf weiter (z.B. kam
fr-video-id erst in V907 dazu), "Rahmen bleibt konstant" ist also keine
verlaessliche Grundannahme. Stattdessen: EIN Hash-Wert, direkt selbst-
dokumentierend im Artikel gespeichert -- robust auch dann, wenn die
externe CSV-Registry mal verloren ginge, da sich der Hash aus der Datei
selbst jederzeit neu nachrechnen und mit dem gespeicherten Wert
vergleichen laesst.

Gehasht wird bewusst nur der sichtbare Nutztext innerhalb von <article>
(Tags entfernt, Whitespace normalisiert) -- identische Methode wie in
_einrichtung/vgwort-pixel-inserter.py (hash_artikel_text), damit beide
Systeme immer denselben Wert fuer denselben Inhalt berechnen.

Idempotent: bereits vorhandene fr-content-hash-Werte werden bei jedem
Lauf neu berechnet und aktualisiert, falls sich der Nutztext seitdem
veraendert hat -- unveraenderte Artikel bleiben unangetastet (kein
Schreibzugriff, keine Aenderung am Datei-Zeitstempel).

---- Nachtrag (01.09.2026): zweiter, unabhaengiger fr-links-hash ----
Der reine Text-Hash uebersieht Aenderungen an internen Verlinkungen
vollstaendig: <a href="beitrag-a.html">Text</a> und
<a href="beitrag-b.html">Text</a> ergeben denselben Hash, weil alle
Tags vor dem Hashen entfernt werden (empirisch bestaetigt). Bewusst
NICHT den bestehenden, in Dutzenden Log-Eintraegen referenzierten
fr-content-hash-Algorithmus veraendert (haette ueber Nacht alle ~500
bestehenden Werte ungueltig gemacht) -- stattdessen ein zweiter,
unabhaengiger Hash nur ueber die Menge der internen Linkziele
innerhalb von <article>. Sortiert (nicht Reihenfolge-sensitiv), damit
harmloses Umsortieren keinen falschen "geaendert"-Alarm ausloest --
nur echte Hinzufuegungen, Entfernungen oder Ziel-Aenderungen schlagen
sich nieder.
"""
import glob
import re
import hashlib

META_RE = re.compile(r'<meta\s+name="fr-content-hash"\s+content="[0-9a-f]+"\s*/?>')
LINKS_META_RE = re.compile(r'<meta\s+name="fr-links-hash"\s+content="[0-9a-f]+"\s*/?>')
CANONICAL_RE = re.compile(r'<link[^>]*rel="canonical"[^>]*>')

# Interne Links: relative .html-Pfade oder mit der eigenen Domain --
# externe Links, mailto:, reine Anker (#foo) und Datei-Downloads bleiben
# aussen vor, da sie fuer die interne Verlinkungsstruktur nicht relevant sind.
INTERNAL_HREF_RE = re.compile(r'<a\s[^>]*href="([^"]+)"')


def hash_artikel_text(html):
    """Identisch zu hash_artikel_text() in vgwort-pixel-inserter.py --
    bewusst dieselbe Methode, damit beide Systeme konsistent bleiben."""
    match = re.search(r'<article[^>]*>(.*?)</article>', html, re.DOTALL)
    basis = match.group(1) if match else html
    text_only = re.sub(r'<[^>]+>', ' ', basis)
    text_only = re.sub(r'\s+', ' ', text_only).strip()
    return hashlib.sha256(text_only.encode('utf-8')).hexdigest()


def is_internal_link(href):
    if href.startswith('#'): return False
    if href.startswith('mailto:') or href.startswith('tel:'): return False
    if href.startswith('http://') or href.startswith('https://'):
        return 'finanz-ritual.de' in href
    return True  # relativer Pfad, z.B. "beitrag-x.html" oder "kat-y.html"


def hash_internal_links(html):
    match = re.search(r'<article[^>]*>(.*?)</article>', html, re.DOTALL)
    basis = match.group(1) if match else html
    hrefs = [h for h in INTERNAL_HREF_RE.findall(basis) if is_internal_link(h)]
    # Sortiert, damit reine Reihenfolge-Aenderungen (z.B. Cross-Link-Liste
    # umsortiert) keinen falschen Alarm ausloesen -- nur echte Mengen-
    # Aenderungen (neuer/entfernter/geaenderter Link) schlagen sich nieder.
    basis_str = '|'.join(sorted(hrefs))
    return hashlib.sha256(basis_str.encode('utf-8')).hexdigest()


def find_articles():
    all_beitrag = glob.glob('beitrag-*.html')
    all_young = glob.glob('YOUNG-*.html')
    return sorted(set(all_beitrag + all_young))


def main():
    files = find_articles()
    print(f"{len(files)} Artikel-Dateien gefunden.")

    neu_gesetzt = aktualisiert = unveraendert = fehler = 0
    links_neu = links_aktualisiert = links_unveraendert = 0

    for f in files:
        content = open(f, encoding='utf-8').read()
        neuer_hash = hash_artikel_text(content)
        neuer_links_hash = hash_internal_links(content)

        bestehend = META_RE.search(content)
        bestehend_links = LINKS_META_RE.search(content)

        content_changed = False

        if bestehend:
            alter_hash = re.search(r'content="([0-9a-f]+)"', bestehend.group(0)).group(1)
            if alter_hash != neuer_hash:
                neue_zeile = f'<meta name="fr-content-hash" content="{neuer_hash}">'
                content = META_RE.sub(neue_zeile, content)
                aktualisiert += 1
                content_changed = True
            else:
                unveraendert += 1
        else:
            video_id_re = re.compile(r'<meta name="fr-video-id" content="\d+">')
            anker = video_id_re.search(content)
            if not anker:
                anker = CANONICAL_RE.search(content)
            if not anker:
                print(f"FEHLER: kein Ankerpunkt in {f}, uebersprungen.")
                fehler += 1
                continue
            einfuegung = anker.group(0) + f'\n<meta name="fr-content-hash" content="{neuer_hash}">'
            content = content[:anker.start()] + einfuegung + content[anker.end():]
            neu_gesetzt += 1
            content_changed = True

        # fr-links-hash unabhaengig vom Content-Hash pflegen -- eigener
        # Ankerpunkt (direkt nach fr-content-hash), eigener Zaehler.
        content_hash_tag = META_RE.search(content)
        if bestehend_links:
            alter_links_hash = re.search(r'content="([0-9a-f]+)"', bestehend_links.group(0)).group(1)
            if alter_links_hash != neuer_links_hash:
                neue_links_zeile = f'<meta name="fr-links-hash" content="{neuer_links_hash}">'
                content = LINKS_META_RE.sub(neue_links_zeile, content)
                links_aktualisiert += 1
                content_changed = True
            else:
                links_unveraendert += 1
        elif content_hash_tag:
            einfuegung = content_hash_tag.group(0) + f'\n<meta name="fr-links-hash" content="{neuer_links_hash}">'
            content = content[:content_hash_tag.start()] + einfuegung + content[content_hash_tag.end():]
            links_neu += 1
            content_changed = True

        if content_changed:
            open(f, 'w', encoding='utf-8').write(content)

    print(f"\nContent-Hash:  {neu_gesetzt} neu, {aktualisiert} aktualisiert, {unveraendert} unveraendert, {fehler} Fehler")
    print(f"Links-Hash:    {links_neu} neu, {links_aktualisiert} aktualisiert, {links_unveraendert} unveraendert")


if __name__ == '__main__':
    main()

