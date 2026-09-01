#!/usr/bin/env python3
"""
Generiert sitemap.xml fuer Finanz-Ritual -- rein lokales Werkzeug,
KEIN Bestandteil einer CI/CD-Automatisierung (bewusste Entscheidung,
siehe AENDERUNGS_LOG.md). Bei Bedarf manuell ausfuehren:

    python3 generate_sitemap.py
"""
import os
import glob
import re
import subprocess
from datetime import datetime
import xml.etree.ElementTree as ET
from xml.dom import minidom

# --- CONFIGURATION ---
# Korrigiert: die tatsaechlich ueberall genutzte kanonische Domain ist
# https://www.finanz-ritual.de (MIT www) -- bestaetigt gegen die
# bestehende sitemap.xml, index.html und deren canonical-Tag.
DOMAIN = "https://www.finanz-ritual.de"
ROOT_DIR = "."
SITEMAP_PATH = os.path.join(ROOT_DIR, "sitemap.xml")
SCRIPT_JS_PATH = os.path.join(ROOT_DIR, "script.js")

# Korrigiert: der offizielle Sitemap-Namespace lautet
# http://www.sitemaps.org/schemas/sitemap/0.9 -- der urspruengliche
# Vorschlag ("http://sitemaps.org") war ungueltig und haette dazu
# gefuehrt, dass Google die Datei vermutlich gar nicht als Sitemap
# erkennt.
SITEMAP_NAMESPACE = "http://www.sitemaps.org/schemas/sitemap/0.9"


def get_last_modified_date(file_path):
    """Ermittelt das Aenderungsdatum einer Datei fuer die Sitemap.

    Versucht zuerst das echte letzte Commit-Datum ueber 'git log' zu
    lesen (verlaesslich, unabhaengig vom Zeitpunkt eines Checkouts).
    Faellt zurueck auf das Dateisystem-Datum, falls kein Git-Repo
    vorhanden ist oder die Datei (noch) nicht versioniert ist -- das
    war im urspruenglichen Vorschlag der einzige Mechanismus, was in
    einer CI-Umgebung mit frischem Checkout fast immer ein falsches,
    einheitliches Datum fuer alle Dateien liefert.
    """
    try:
        result = subprocess.run(
            ["git", "log", "-1", "--format=%ai", "--", file_path],
            cwd=ROOT_DIR, capture_output=True, text=True, timeout=5
        )
        output = result.stdout.strip()
        if result.returncode == 0 and output:
            # Format von 'git log --format=%ai': "2026-08-21 10:15:00 +0200"
            return output.split(" ")[0]
    except (subprocess.SubprocessError, FileNotFoundError, OSError):
        pass

    try:
        timestamp = os.path.getmtime(file_path)
        return datetime.fromtimestamp(timestamp).strftime("%Y-%m-%d")
    except OSError:
        return datetime.today().strftime("%Y-%m-%d")


def scan_js_for_young_articles():
    """Scannt script.js nach registrierten YOUNG-Links (FR_POSTS)."""
    found_links = set()
    if not os.path.exists(SCRIPT_JS_PATH):
        return found_links

    print("Analysiere script.js auf registrierte Jugend-Inhalte...")
    with open(SCRIPT_JS_PATH, "r", encoding="utf-8") as f:
        content = f.read()
        matches = re.findall(r'link:\s*["\'](YOUNG-.*?\.html)["\']', content)
        for match in matches:
            found_links.add(match)

    print(f"{len(found_links)} Jugend-Links im FR_POSTS-Register der script.js gefunden.")
    return found_links


def generate_sitemap():
    """Scannt das Verzeichnis und generiert eine sitemap.xml."""
    print("Starte Sitemap-Generierung...")

    js_young_links = scan_js_for_young_articles()

    urlset = ET.Element("urlset", xmlns=SITEMAP_NAMESPACE)

    # 1. Statische Kernseiten (hoechste Prioritaet)
    core_pages = [
        {"path": "index.html", "prio": "1.0", "freq": "daily"},
        {"path": "jugendbasisbildung/index.html", "prio": "1.0", "freq": "daily"},
        {"path": "glossar.html", "prio": "0.9", "freq": "weekly"},
        {"path": "faq.html", "prio": "0.8", "freq": "weekly"},
    ]

    added_urls = set()

    for page in core_pages:
        full_path = os.path.join(ROOT_DIR, page["path"])
        if os.path.exists(full_path):
            url_el = ET.SubElement(urlset, "url")
            ET.SubElement(url_el, "loc").text = f"{DOMAIN}/{page['path']}"
            ET.SubElement(url_el, "lastmod").text = get_last_modified_date(full_path)
            ET.SubElement(url_el, "changefreq").text = page["freq"]
            ET.SubElement(url_el, "priority").text = page["prio"]
            added_urls.add(page["path"])

    # 2. Jugend-Artikel (YOUNG-*.html)
    # Hinweis Prioritaet 0.6: senkt zwar das Sitemap-Signal fuer diese
    # Seiten, loest aber laut Google selbst kein Duplicate-Content-
    # Problem -- priority/changefreq werden von Google inzwischen
    # weitgehend ignoriert. Falls die YOUNG-Artikel inhaltlich zu stark
    # mit den beitrag-*.html ueberlappen, ist eher ein canonical-Tag
    # oder eine klarere inhaltliche Abgrenzung das wirksame Mittel --
    # das ist ein separates Thema, keine Sitemap-Frage.
    young_articles = glob.glob(os.path.join(ROOT_DIR, "**/YOUNG-*.html"), recursive=True)

    for art_path in sorted(young_articles):
        rel_path = os.path.relpath(art_path, ROOT_DIR).replace(os.sep, "/")
        file_name = os.path.basename(art_path)

        if rel_path in added_urls or "index.html" in rel_path:
            continue

        url_el = ET.SubElement(urlset, "url")
        ET.SubElement(url_el, "loc").text = f"{DOMAIN}/{rel_path}"
        ET.SubElement(url_el, "lastmod").text = get_last_modified_date(art_path)
        ET.SubElement(url_el, "changefreq").text = "monthly"
        ET.SubElement(url_el, "priority").text = "0.6"
        added_urls.add(rel_path)

        if file_name in js_young_links:
            js_young_links.remove(file_name)

    for missing_file in sorted(js_young_links):
        print(f"Warnung: '{missing_file}' ist in script.js registriert, fehlt aber auf der Festplatte!")

    # 3. Erwachsenen-Artikel (beitrag-*.html)
    erwachsenen_articles = glob.glob(os.path.join(ROOT_DIR, "**/beitrag-*.html"), recursive=True)

    for art_path in sorted(erwachsenen_articles):
        rel_path = os.path.relpath(art_path, ROOT_DIR).replace(os.sep, "/")
        if rel_path in added_urls:
            continue

        is_simple = "-einfach.html" in rel_path
        prio = "0.4" if is_simple else "0.7"

        url_el = ET.SubElement(urlset, "url")
        ET.SubElement(url_el, "loc").text = f"{DOMAIN}/{rel_path}"
        ET.SubElement(url_el, "lastmod").text = get_last_modified_date(art_path)
        ET.SubElement(url_el, "changefreq").text = "monthly"
        ET.SubElement(url_el, "priority").text = prio
        added_urls.add(rel_path)

    # 4. Rechner-Seiten (rechner-*.html) -- bewusst NICHT rechner.html selbst
    #    (die Hub-Seite steht schon separat in den statischen Seiten oben).
    #    Bis V836 fehlte dieses Muster komplett, wodurch alle 8 bis dahin
    #    bestehenden Einzelrechner-Seiten nie in der Sitemap auftauchten --
    #    mit diesem Block werden sie rueckwirkend mit erfasst, nicht nur
    #    neu hinzukommende.
    rechner_pages = glob.glob(os.path.join(ROOT_DIR, "rechner-*.html"))

    for rechner_path in sorted(rechner_pages):
        rel_path = os.path.relpath(rechner_path, ROOT_DIR).replace(os.sep, "/")
        if rel_path in added_urls:
            continue

        is_simple = "-einfach.html" in rel_path
        prio = "0.4" if is_simple else "0.7"

        url_el = ET.SubElement(urlset, "url")
        ET.SubElement(url_el, "loc").text = f"{DOMAIN}/{rel_path}"
        ET.SubElement(url_el, "lastmod").text = get_last_modified_date(rechner_path)
        ET.SubElement(url_el, "changefreq").text = "monthly"
        ET.SubElement(url_el, "priority").text = prio
        added_urls.add(rel_path)

    # XML formatiert schreiben
    xml_str = ET.tostring(urlset, encoding="utf-8")
    parsed_xml = minidom.parseString(xml_str)
    pretty_xml = parsed_xml.toprettyxml(indent="  ", encoding="UTF-8")

    with open(SITEMAP_PATH, "wb") as f:
        f.write(pretty_xml)

    print(f"sitemap.xml generiert: {len(added_urls)} URLs.")


if __name__ == "__main__":
    generate_sitemap()
