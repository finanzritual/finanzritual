#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extrahiert reinen, lesbaren Fliesstext (DE) aus den Artikeln fuer BIG und YOUNG,
ohne Navigation/Header/Footer/Banner-Boilerplate, ohne Emojis, ohne Rechner/Spiele/Tools.
"""
import glob
import re
from bs4 import BeautifulSoup

# Emoji- und Symbol-Bereiche (breite Abdeckung gängiger Unicode-Emoji-Bloecke)
EMOJI_PATTERN = re.compile(
    "["
    "\U0001F300-\U0001FAFF"  # Symbole, Piktogramme, Emoji-Erweiterungen
    "\U00002600-\U000027BF"  # Diverse Symbole & Dingbats
    "\U0001F1E6-\U0001F1FF"  # Flaggen (Regional Indicators)
    "\U00002190-\U000021FF"  # Pfeile (teils dekorativ genutzt, z.B. →)
    "\U00002B00-\U00002BFF"  # Weitere Pfeile/Symbole
    "\U0000FE0F"              # Variation Selector (Emoji-Darstellung)
    "\U0000200D"              # Zero Width Joiner (Emoji-Kombination)
    "]+",
    flags=re.UNICODE
)

# Boilerplate-Klassen, die projektweit als wiederkehrende Navigation/Werbung/Footer auftreten
BOILERPLATE_CLASSES = [
    "info-banner", "breadcrumb", "footer-ticker", "disclaimer-box",
    "y-related", "y-source", "y-teacher", "y-back", "y-header",
    "y-icon-btn", "y-lang", "y-font-stepper", "lang-toggle",
    "simplelang-toggle", "fullscreen-toggle", "skip-link",
    "alert-banner-counter", "alert-banner-close", "alert-banner-right",
]
BOILERPLATE_TAGS = ["script", "style", "header", "footer", "nav"]


def clean_text(raw_soup_text):
    text = EMOJI_PATTERN.sub("", raw_soup_text)
    # Mehrfache Leerzeilen/Leerzeichen einkuerzen
    lines = [ln.strip() for ln in text.splitlines()]
    lines = [ln for ln in lines if ln]
    return "\n".join(lines)


def extract_article_text(filepath):
    with open(filepath, encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")

    # head komplett raus (title/meta/style enthalten oft Duplikate des Textes)
    if soup.head:
        soup.head.decompose()

    for tagname in BOILERPLATE_TAGS:
        for tag in soup.find_all(tagname):
            tag.decompose()

    for cls in BOILERPLATE_CLASSES:
        for tag in soup.find_all(class_=cls):
            tag.decompose()

    # H1 separat holen (liegt oft ausserhalb von <article>)
    h1 = soup.find("h1")
    title = h1.get_text(" ", strip=True) if h1 else filepath

    body_text = soup.get_text("\n", strip=True)
    full_text = clean_text(title + "\n\n" + body_text)
    return title, full_text


def build_corpus(filelist, out_path, label):
    print(f"{label}: {len(filelist)} Dateien")
    with open(out_path, "w", encoding="utf-8") as out:
        for i, fp in enumerate(sorted(filelist), 1):
            title, text = extract_article_text(fp)
            out.write(f"===== {fp} =====\n")
            out.write(text)
            out.write("\n\n")
    print(f"-> geschrieben: {out_path}")


def main():
    all_beitrag = glob.glob("beitrag-*.html")
    big_files = [f for f in all_beitrag if not f.endswith("-einfach.html")]

    exclude_young = set(glob.glob("YOUNG-Games-*.html")) | {
        "YOUNG-quiz-jugend.html",
        "YOUNG-toolbox-qrcodes-jugend.html",
    }
    all_young = glob.glob("YOUNG-*.html")
    young_files = [f for f in all_young if f not in exclude_young]

    build_corpus(big_files, "_export_BIG_Artikel_ohne_Emojis.txt", "BIG")
    build_corpus(young_files, "_export_YOUNG_Artikel_ohne_Emojis.txt", "YOUNG")


if __name__ == "__main__":
    main()
