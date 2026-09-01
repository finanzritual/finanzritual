# Anleitung: Finanzritual auf dem echten Handy testen

Kurzanleitung, um die Website lokal auf dem eigenen Handy im echten
Browser zu testen — zuverlässiger als Emulation im Laptop-Browser,
da dort teils andere Render-Engines simuliert werden (z. B. bei
CSS-Grid-Layouts können Unterschiede auftreten).

## Voraussetzung

Handy und Laptop müssen im **gleichen WLAN** hängen (nicht Mobilfunk-
Daten auf dem Handy).

## Schritt 1: Lokale IP-Adresse des Laptops rausfinden

- **Mac**: Systemeinstellungen → WLAN → auf das verbundene Netzwerk
  klicken, dort steht die IP (z. B. `192.168.1.42`)
- **Windows**: Eingabeaufforderung öffnen, `ipconfig` eintippen,
  „IPv4-Adresse" suchen
- **Linux**: Terminal, `ip addr` oder `hostname -I`

## Schritt 2: Lokalen Testserver starten

Python ist auf den meisten Rechnern schon installiert. Im
Projektordner (dort, wo `index.html` liegt):

```bash
cd /pfad/zu/deinem/finanzritual-projekt
python3 -m http.server 8000
```

Unter Windows ggf. `python` statt `python3` verwenden.

## Schritt 3: Auf dem Handy öffnen

Im Handy-Browser die IP-Adresse aus Schritt 1 eingeben, mit Port
`8000`:

```
http://192.168.1.42:8000/index.html
```

(eigene IP-Adresse einsetzen, Port bleibt `8000`)

Fertig — die Seite läuft jetzt live im echten Handy-Browser, inklusive
korrektem CSS-Grid-Rendering und aller sonstigen Layout-Details, die
in emulierten Ansichten manchmal abweichen.

## Zum Debuggen (nicht nur Anschauen, sondern Inspizieren)

**Android + Chrome:**
1. Handy per USB an den Laptop anschließen
2. USB-Debugging auf dem Handy aktivieren (Entwickleroptionen)
3. Am Laptop `chrome://inspect` öffnen
4. Komplette Chrome-DevTools-Ansicht des Handys verfügbar, inklusive
   Element-Inspektor

**iPhone + Safari:**
1. Auf dem iPhone: Einstellungen → Safari → Erweiterungen →
   Web-Inspector aktivieren
2. Am Mac in Safari unter „Entwickler" das iPhone auswählen

## Server beenden

Im Terminal `Strg+C` drücken. Der Server läuft nur lokal im eigenen
WLAN, nichts geht ins Internet.

---
*Erstellt: 12.08.2026*
