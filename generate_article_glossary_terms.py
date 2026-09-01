#!/usr/bin/env python3
"""
generate_article_glossary_terms.py

Berechnet fuer jeden Artikel (beitrag-*.html und YOUNG-*.html), welche
Glossarbegriffe aus FR_GLOSSARY in seinem Text vorkommen -- und schreibt
das Ergebnis als FR_ARTICLE_TERMS-Objekt in script.js.

Wird von frInitRelatedArticles() genutzt, um neben Tags/Subkategorie ein
drittes, inhaltsbasiertes Signal fuer Themen-Naehe zu haben: teilen zwei
Artikel mehrere SPEZIFISCHE Glossarbegriffe, ist das ein starkes Zeichen
fuer echte Verwandtschaft (Idee: Nutzer-Vorschlag, 22.08.2026, V866).

WICHTIG: Sehr haeufige Begriffe (>10 Artikel) werden bewusst ausgeschlossen
-- Woerter wie "Rendite" oder "ETF" kommen in >20% aller Artikel vor und
sind als Aehnlichkeits-Signal wertlos (verwaessern nur echte Themennaehe).
Nur die SPEZIFISCHEN, selteneren Begriffe zaehlen.

Wiederholbar: bei jedem neuen Artikel oder Glossar-Update einfach erneut
ausfuehren (wie generate_sitemap.py), aktualisiert FR_ARTICLE_TERMS
automatisch ohne manuelle Pflege.
"""
import re
import glob
import json

MAX_DOC_FREQ = 10  # Begriffe in mehr als X Artikeln gelten als zu generisch
MIN_TERM_LENGTH = 3  # sehr kurze Begriffe (z.B. Abkuerzungen mit 1-2 Zeichen) ausschliessen


def extract_glossary_terms():
    """Alle Begriffe aus FR_GLOSSARY extrahieren (Begriff -> Kategorie)."""
    content = open('script.js', encoding='utf-8').read()
    start = content.find('const FR_GLOSSARY = {')
    end = content.find('\n};\n', start)
    block = content[start:end]
    pattern = re.compile(r"'([^']+)':\s*\{\s*id:\s*'[^']*',\s*cat:\s*'([^']+)'")
    return dict(pattern.findall(block))


def get_article_text(html):
    """Reinen Text aus dem <article>-Bereich extrahieren (Tags entfernt)."""
    m = re.search(r'<article[^>]*>(.*?)</article>', html, re.DOTALL)
    if not m:
        return ''
    inner = m.group(1)
    return re.sub(r'<[^>]+>', ' ', inner)


def find_terms_in_articles(glossary):
    """Fuer jeden Artikel die vorkommenden Glossarbegriffe finden."""
    terms_sorted = sorted(glossary.keys(), key=len, reverse=True)
    escaped = [re.escape(t) for t in terms_sorted]
    combined_pattern = re.compile(r'\b(' + '|'.join(escaped) + r')\b')

    results = {}
    files = glob.glob('beitrag-*.html') + glob.glob('YOUNG-*.html')
    for fp in files:
        html = open(fp, encoding='utf-8', errors='replace').read()
        text = get_article_text(html)
        if not text:
            continue
        found = set(combined_pattern.findall(text))
        if found:
            results[fp] = sorted(found)
    return results


def filter_specific_terms(results):
    """Zu haeufige (generische) Begriffe je Artikel herausfiltern."""
    from collections import Counter
    doc_freq = Counter()
    for terms in results.values():
        for t in terms:
            doc_freq[t] += 1

    filtered = {}
    for fp, terms in results.items():
        specific = [t for t in terms if doc_freq[t] <= MAX_DOC_FREQ and len(t) >= MIN_TERM_LENGTH]
        if specific:
            filtered[fp] = sorted(specific)
    return filtered, doc_freq


def write_to_script_js(filtered_terms, glossary):
    """FR_ARTICLE_TERMS als neues Objekt in script.js einfuegen/aktualisieren."""
    content = open('script.js', encoding='utf-8').read()

    # Begriff -> Kategorie-Mapping mitschreiben, damit frInitRelatedArticles()
    # auch die Glossar-Kategorie als Zusatzsignal nutzen kann, ohne FR_GLOSSARY
    # selbst durchsuchen zu muessen.
    term_cats = {t: glossary[t] for terms in filtered_terms.values() for t in terms}

    lines = ["/* Automatisch generiert von generate_article_glossary_terms.py --",
             "   NICHT von Hand pflegen, bei Bedarf das Skript erneut ausfuehren.",
             "   Enthaelt pro Artikel die darin vorkommenden SPEZIFISCHEN",
             "   Glossarbegriffe (haeufige, generische Begriffe wie 'Rendite'",
             "   sind bewusst ausgeschlossen -- siehe MAX_DOC_FREQ im Skript).",
             "   Wird von frInitRelatedArticles() als drittes Aehnlichkeits-",
             "   Signal neben Tags/Subkategorie genutzt (V866). */",
             "const FR_ARTICLE_TERMS = " + json.dumps(filtered_terms, ensure_ascii=False, indent=2) + ";",
             "const FR_TERM_CATEGORIES = " + json.dumps(term_cats, ensure_ascii=False, indent=2) + ";",
             ""]
    block = "\n".join(lines)

    marker_start = "/* Automatisch generiert von generate_article_glossary_terms.py"
    marker_end_search = "const FR_TERM_CATEGORIES = "
    start_idx = content.find(marker_start)
    if start_idx != -1:
        # Bestehenden Block ersetzen (Ende: naechstes "};\n" nach FR_TERM_CATEGORIES)
        cat_start = content.find(marker_end_search, start_idx)
        end_idx = content.find("};\n", cat_start) + 3
        content = content[:start_idx] + block + content[end_idx:]
    else:
        # Neuen Block direkt vor FR_GLOSSARY einfuegen
        glossary_idx = content.find("const FR_GLOSSARY = {")
        content = content[:glossary_idx] + block + "\n" + content[glossary_idx:]

    open('script.js', 'w', encoding='utf-8').write(content)


if __name__ == '__main__':
    print("Analysiere FR_GLOSSARY...")
    glossary = extract_glossary_terms()
    print(f"  {len(glossary)} Glossarbegriffe gefunden")

    print("Durchsuche Artikel nach Glossarbegriffen...")
    results = find_terms_in_articles(glossary)
    print(f"  {len(results)} Artikel mit Treffern")

    print("Filtere zu generische Begriffe heraus...")
    filtered, doc_freq = filter_specific_terms(results)
    total_terms = sum(len(v) for v in filtered.values())
    print(f"  {len(filtered)} Artikel mit spezifischen Begriffen, {total_terms} Zuordnungen insgesamt")

    print("Schreibe FR_ARTICLE_TERMS nach script.js...")
    write_to_script_js(filtered, glossary)
    print("Fertig.")
