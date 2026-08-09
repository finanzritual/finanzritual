/* =========================================================
   FINANZRITUAL — script.js
   Theme + Schriftgröße + Tag-Cloud + Rechner + Blog-Feed
   ========================================================= */

/* =========================================================
   WARN-BANNER — HIER SCHARF SCHALTEN
   aktiv: false -> Banner bleibt unsichtbar (kein Bell-Icon, nichts zu sehen)
   aktiv: true  -> Banner erscheint sofort oben, Text unten anpassen
   ========================================================= */
const FR_WARNUNG = {
  aktiv: false,
  text: "Achtung: Aktuell werden E-Mails in meinem Namen verschickt, die ein Betrugsversuch (Scam) sind. Bitte prüfe die Absenderadresse genau und klicke keine Links in verdächtigen Nachrichten."
};

const FR_WARNUNG_VORSCHAU_TEXT = "Vorschau: So sieht der Warnbalken aus, wenn er scharf geschaltet ist. (Testmodus — noch keine echte Warnung aktiv.)";

document.addEventListener('DOMContentLoaded', () => {
  const banner = document.getElementById('alert-banner');
  const textEl = document.getElementById('alert-banner-text');
  const closeBtn = document.getElementById('alert-banner-close');
  const bell = document.getElementById('alert-bell');
  const testBtn = document.getElementById('alert-test-btn');
  if(!banner || !textEl || !closeBtn || !bell) return;

  const DISMISS_KEY = 'fr-alert-dismissed';

  function showBanner(text){
    textEl.textContent = text || FR_WARNUNG.text;
    banner.classList.add('is-visible');
    bell.classList.remove('is-visible');
  }
  function hideBanner(){
    banner.classList.remove('is-visible');
    if(FR_WARNUNG.aktiv){ bell.classList.add('is-visible'); }
  }

  if(FR_WARNUNG.aktiv){
    if(sessionStorage.getItem(DISMISS_KEY) === '1'){
      bell.classList.add('is-visible');
    } else {
      showBanner();
    }
  }

  closeBtn.addEventListener('click', () => {
    hideBanner();
    sessionStorage.setItem(DISMISS_KEY, '1');
  });
  bell.addEventListener('click', () => {
    sessionStorage.removeItem(DISMISS_KEY);
    showBanner();
  });
  if(testBtn){
    testBtn.addEventListener('click', () => showBanner(FR_WARNUNG_VORSCHAU_TEXT));
  }
});

/* ---------- Performance-Zähler (nur für dich sichtbar, wenn markiert) ---------- */
/* ---------- Aufruf-Zähler (rein lokal, DSGVO-freundlich) ----------
   Bewusst OHNE externen Dienst: früher lief hier ein fetch() auf
   api.countapi.xyz. Das übertrug bei jedem Seitenaufruf die IP-Adresse
   der Besucher an einen Drittanbieter — ohne Einwilligung und im
   Widerspruch zur eigenen Datenschutzerklärung. (Der Dienst ist
   inzwischen ohnehin eingestellt.)

   Der Zähler läuft jetzt ausschließlich im Browser des Besuchers:
   der Wert steht in localStorage, es verlässt nichts das Gerät.
   Für echte, geräteübergreifende Zahlen bräuchte es eine
   serverseitige Lösung (Server-Logs oder selbst gehostetes Matomo)
   — dann aber bitte die Datenschutzerklärung entsprechend ergänzen. */
document.addEventListener('DOMContentLoaded', () => {
  const countEl = document.getElementById('perf-count');
  const timeEl = document.getElementById('perf-time');
  if(!countEl || !timeEl) return;

  const now = new Date();
  const dateStr = now.toLocaleDateString('de-DE');
  const timeStr = now.toLocaleTimeString('de-DE', { hour:'2-digit', minute:'2-digit' });
  timeEl.textContent = dateStr + ', ' + timeStr + ' Uhr';

  const LS_KEY = 'fr-perf-views';
  try {
    const n = (parseInt(localStorage.getItem(LS_KEY) || '0', 10) || 0) + 1;
    localStorage.setItem(LS_KEY, String(n));
    countEl.textContent = n + ' (nur dieses Gerät)';
  } catch(e){
    // localStorage kann blockiert sein (Privatmodus, strenge Einstellungen)
    countEl.textContent = '–';
  }
});

/* ---------- Nach-oben-Button + Menüzeile beim Scrollen (Handy) + Logo-Band ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const btn    = document.getElementById('scroll-top-btn');
  const header = document.querySelector('header.site');
  const logoBand = document.getElementById('logo-band');
  let lastY = window.scrollY;

  const onScroll = () => {
    const y = window.scrollY;
    /* Scroll-Top-Button ab 480 px einblenden */
    if(btn){
      btn.classList.toggle('is-visible', y > 480);
    }
    /* Header-Linie: grün solange scrollY === 0, danach grau */
    if(header){
      header.classList.toggle('is-scrolled', y > 0);
    }
    /* Großes Logo-Band: nur ganz oben sichtbar, kollabiert sobald
       überhaupt gescrollt wird -- Desktop UND Handy gleichermaßen. */
    if(logoBand){
      logoBand.classList.toggle('is-collapsed', y > 4);
    }
    /* Menüzeile auf dem Handy beim Runterscrollen ausblenden, damit mehr
       Platz für den Inhalt bleibt -- beim Hochscrollen (auch nur ein
       Stück) taucht sie sofort wieder auf, ebenso ganz oben auf der
       Seite. Nur unterhalb von 900px aktiv, am Desktop bleibt der
       Header wie gewohnt immer sichtbar. */
    if(header && window.innerWidth <= 900){
      const scrollingDown = y > lastY;
      const pastThreshold = y > 90;
      header.classList.toggle('is-hidden', scrollingDown && pastThreshold);
    } else if(header){
      header.classList.remove('is-hidden');
    }
    lastY = y;
  };

  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll(); /* Initialzustand setzen (z. B. nach hartem Neu-Laden mid-page) */

  if(btn){
    btn.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
  }
});

/* ---------- Theme (Dark/Light) ---------- */
(function themeInit(){
  const root = document.documentElement;
  let saved = null;
  try {
    saved = localStorage.getItem('fr-theme');
  } catch(e){
    // localStorage blockiert (z.B. file://-Zugriff mit strengen Browser-
    // Einstellungen, Privatmodus, o.ä.) -> ohne gespeicherten Wert weiter-
    // machen, statt das gesamte Theme-Skript (inkl. Klick-Handler weiter
    // unten) mit einer ungefangenen Exception abzubrechen.
  }
  // Dunkelmodus ist jetzt der generelle Standard, auf allen Geraeten,
  // unabhaengig von der Systemeinstellung -- eine bereits gespeicherte
  // manuelle Wahl des Nutzers hat aber weiterhin immer Vorrang.
  const initial = saved || 'dark';
  root.setAttribute('data-theme', initial);

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('theme-toggle');
    if(!btn) return;
    updateToggleIcon(initial);
    btn.addEventListener('click', () => {
      const now = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', now);
      try { localStorage.setItem('fr-theme', now); } catch(e){ /* s.o. */ }
      updateToggleIcon(now);
    });
  });

  const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/></svg>';

  function updateToggleIcon(mode){
    const btn = document.getElementById('theme-toggle');
    const icon = document.getElementById('theme-toggle-icon');
    if(!btn) return;
    btn.setAttribute('aria-pressed', mode === 'dark');
    btn.title = mode === 'dark' ? 'Zu Tagmodus wechseln' : 'Zu Nachtmodus wechseln';
    if(icon) icon.innerHTML = mode === 'dark' ? MOON : SUN;
  }
})();

/* ---------- Hoher Kontrast ----------
   Unabhängig vom Hell/Dunkel-Umschalter: setzt data-contrast="high" auf
   <html>, was in style.css alle Farb-Tokens auf ein Schwarz/Weiß-Schema
   mit hellen Akzentfarben umstellt (>7:1 Kontrast). Eigener Merker in
   localStorage (fr-contrast), bleibt beim Umschalten von Hell/Dunkel
   unverändert erhalten. */
(function contrastInit(){
  const root = document.documentElement;
  let saved = 'off';
  try {
    saved = localStorage.getItem('fr-contrast') || 'off';
  } catch(e){ /* localStorage blockiert, s.o. */ }
  if(saved === 'high') root.setAttribute('data-contrast', 'high');

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('contrast-toggle');
    if(!btn) return;
    updateBtn(saved);
    btn.addEventListener('click', () => {
      const now = root.getAttribute('data-contrast') === 'high' ? 'off' : 'high';
      if(now === 'high'){ root.setAttribute('data-contrast', 'high'); }
      else { root.removeAttribute('data-contrast'); }
      try { localStorage.setItem('fr-contrast', now); } catch(e){ /* s.o. */ }
      updateBtn(now);
    });
  });

  function updateBtn(mode){
    const btn = document.getElementById('contrast-toggle');
    if(!btn) return;
    const active = mode === 'high';
    btn.setAttribute('aria-pressed', active);
    btn.title = active ? 'Hohen Kontrast ausschalten' : 'Hohen Kontrast einschalten';
  }
})();

/* ---------- Vollbild (Fullscreen-API) ----------
   Zeigt die AKTUELLE Seite ohne Browser-Adressleiste/Tabs. Bewusst kein
   PWA-Ansatz, damit der Nutzer selbst pro Seite entscheidet — Fullscreen
   verlaesst sich beim naechsten Seitenwechsel automatisch (Browser-Vorgabe,
   nicht umgehbar), das ist so gewollt. Button wird auf Browsern ohne
   Fullscreen-Unterstuetzung (z.B. iOS Safari) ausgeblendet statt einen
   wirkungslosen Klick anzubieten. */
(function(){
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('fullscreen-toggle');
    if(!btn) return;
    const root = document.documentElement;
    const supported = root.requestFullscreen || root.webkitRequestFullscreen;
    if(!supported){
      btn.setAttribute('hidden', '');
      return;
    }
    btn.addEventListener('click', () => {
      const isFs = document.fullscreenElement || document.webkitFullscreenElement;
      if(!isFs){
        (root.requestFullscreen || root.webkitRequestFullscreen).call(root);
      } else {
        (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      }
    });
    const onChange = () => {
      const active = !!(document.fullscreenElement || document.webkitFullscreenElement);
      btn.setAttribute('aria-pressed', active);
      btn.title = active ? 'Vollbild verlassen' : 'Vollbildmodus';
    };
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
  });
})();

/* ---------- Hover-Prefetch: Bücherseite ----------
   Laedt kat-buecher.html vor, sobald jemand mit der Maus ueber den
   "Buecher"-Menuepunkt selbst hovert — NICHT beim Oeffnen des gesamten
   Menues (das waere Vorladen fuer alle sechs Kategorien auf Verdacht,
   auch wenn jemand eigentlich zu FIRE oder Vergleich will). Nur auf
   Geraeten mit echtem Hover (matchMedia), auf Touch-Geraeten kein
   Rate-Prefetch. Einmalig pro Seitenaufruf (kein wiederholtes Einfuegen). */
(function(){
  document.addEventListener('DOMContentLoaded', () => {
    if(!window.matchMedia || !window.matchMedia('(hover: hover)').matches) return;
    const buttons = document.querySelectorAll('button.nav-drop-toggle[data-en="Books"]');
    if(!buttons.length) return;
    let done = false;
    function prefetchBuecher(){
      if(done) return;
      done = true;
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = 'kat-buecher.html';
      document.head.appendChild(link);
    }
    buttons.forEach(btn => btn.addEventListener('mouseenter', prefetchBuecher, { once: true }));
  });
})();

/* ---------- Sprache (DE/EN) ----------
   Der Schalter setzt lang="de|en" auf <html> und merkt sich die Wahl in
   localStorage (Schluessel fr-lang). Fuer Inhalte, die schon uebersetzt
   sind, reicht es, dem jeweiligen Element ein data-en="..." (Englischer
   HTML-Inhalt) mitzugeben - das Deutsche bleibt einfach der normale
   Elementinhalt und wird beim ersten Umschalten automatisch in data-de
   gesichert. Elemente ohne data-en bleiben unveraendert auf Deutsch,
   bis sie uebersetzt werden - nichts bricht dadurch. */
(function langInit(){
  const root = document.documentElement;
  // Domain-Vorgabe: .com startet auf Englisch, .de (und alles andere) auf
  // Deutsch -- aber nur als Standard fuer den allerersten Besuch. Hat der
  // Nutzer schon einmal manuell umgeschaltet, gewinnt IMMER die gespeicherte
  // Wahl aus localStorage, unabhaengig von der Domain (z.B. ein deutscher
  // Leser, der ueber die .com-Domain kommt und lieber Deutsch liest).
  const domainDefault = /(^|\.)finanz-ritual\.com$/i.test(location.hostname) ? 'en' : 'de';
  let saved = domainDefault;
  try {
    const stored = localStorage.getItem('fr-lang');
    if(stored) saved = stored;
  } catch(e){ /* localStorage blockiert, s.o. */ }
  root.setAttribute('lang', saved);
  root.classList.toggle('lang-en', saved === 'en');

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('lang-toggle');
    translatePage(saved);
    if(!btn) return;
    updateToggleUI(saved);
    btn.addEventListener('click', () => {
      const now = root.getAttribute('lang') === 'en' ? 'de' : 'en';
      root.setAttribute('lang', now);
      root.classList.toggle('lang-en', now === 'en');
      try { localStorage.setItem('fr-lang', now); } catch(e){ /* s.o. */ }
      translatePage(now);
      updateToggleUI(now);
      if(typeof frInitConstants === 'function') frInitConstants();
      if(typeof frInitRelatedArticles === 'function') frInitRelatedArticles();
      if(typeof frRenderDynamicSections === 'function') frRenderDynamicSections();
      if(typeof window.frDebtCalcRecompute === 'function') window.frDebtCalcRecompute();
      if(Array.isArray(window.frPageRecomputers)){
        window.frPageRecomputers.forEach(fn => { if(typeof fn === 'function') fn(); });
      }
    });
  });

  function updateToggleUI(lang){
    const btn = document.getElementById('lang-toggle');
    const label = document.getElementById('lang-toggle-text');
    if(!btn) return;
    btn.setAttribute('aria-pressed', lang === 'en');
    // aria-label und lang IMMER in der Zielsprache setzen, die der Button
    // anbietet -- nicht in der Sprache der aktuellen Seite. So findet ein
    // Screenreader-Nutzer, der kein Deutsch versteht, den Umschalter
    // trotzdem: die Aussprache folgt dem lang-Attribut des Elements, nicht
    // dem der umgebenden Seite. Sichtbar aendert sich dadurch nichts.
    if(lang === 'en'){
      btn.title = 'Auf Deutsch umschalten';
      btn.setAttribute('aria-label', 'Auf Deutsch umschalten');
      btn.setAttribute('lang', 'de');
    } else {
      btn.title = 'Switch to English';
      btn.setAttribute('aria-label', 'Switch to English');
      btn.setAttribute('lang', 'en');
    }
    if(label) label.textContent = lang === 'en' ? 'DE' : 'EN';
  }

  const ATTR_LIST = ['title', 'aria-label', 'alt', 'placeholder', 'content'];

  function translatePage(lang){
    document.querySelectorAll('[data-en]').forEach(el => {
      if(!el.hasAttribute('data-de')) el.setAttribute('data-de', el.innerHTML);
      const target = lang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-de');
      if(target != null) el.innerHTML = target;
    });
    ATTR_LIST.forEach(attr => {
      document.querySelectorAll('[data-en-' + attr + ']').forEach(el => {
        const deAttr = 'data-de-' + attr;
        if(!el.hasAttribute(deAttr)) el.setAttribute(deAttr, el.getAttribute(attr) || '');
        const target = lang === 'en' ? el.getAttribute('data-en-' + attr) : el.getAttribute(deAttr);
        if(target != null) el.setAttribute(attr, target);
      });
    });
  }
})();

/* ---------- Schriftgröße-Regler ---------- */
(function fontSizeInit(){
  const root = document.documentElement;
  let saved = 1;
  try {
    saved = parseFloat(localStorage.getItem('fr-fontscale')) || 1;
  } catch(e){
    // localStorage blockiert (z.B. Privatmodus, restriktive Browser-Einstellung,
    // oder file://-Zugriff ohne lokalen Server) -> Standardgröße, aber Skript
    // läuft trotzdem weiter statt hier komplett abzubrechen.
  }
  root.style.setProperty('--step-user', saved);

  function bindSlider(){
    const slider = document.getElementById('font-slider');
    if(!slider) return;
    slider.value = saved;

    // Aa-Beschriftung direkt im Schiebeknopf statt als separates Label daneben:
    // ein per JS erzeugtes Overlay, das der Reglerposition folgt. Zentral hier
    // erzeugt, damit keine der über 160 Projektseiten einzeln angefasst werden muss.
    let thumbLabel = slider.parentElement.querySelector('.font-slider-thumb-label');
    if(!thumbLabel){
      thumbLabel = document.createElement('span');
      thumbLabel.className = 'font-slider-thumb-label';
      thumbLabel.setAttribute('aria-hidden', 'true');
      thumbLabel.textContent = 'Aa';
      slider.insertAdjacentElement('afterend', thumbLabel);
    }
    function positionThumbLabel(){
      const min = parseFloat(slider.min), max = parseFloat(slider.max);
      const pct = (parseFloat(slider.value) - min) / (max - min);
      const thumbPx = 22; // Breite des Schiebeknopfs (siehe style.css ::-webkit-slider-thumb)
      const offset = (thumbPx / 2) - pct * thumbPx;
      thumbLabel.style.left = 'calc(' + (pct * 100) + '% + ' + offset + 'px)';
      const pctRound = Math.round(pct * 1000) / 10;
      slider.style.background = 'linear-gradient(to right, var(--green) 0%, var(--green) ' + pctRound + '%, var(--line-strong) ' + pctRound + '%, var(--line-strong) 100%)';
    }
    positionThumbLabel();
    slider.addEventListener('input', (e) => {
      const val = e.target.value;
      root.style.setProperty('--step-user', val);
      try { localStorage.setItem('fr-fontscale', val); } catch(e){ /* s.o. */ }
      positionThumbLabel();
    });
  }
  // script.js steht am Ende von <body>, das Slider-Element existiert also
  // meist schon beim Ausführen. Trotzdem robust bleiben, falls das Skript
  // je an anderer Stelle eingebunden wird (z.B. per defer/async):
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bindSlider);
  } else {
    bindSlider();
  }
})();

/* ---------- Mobiles Menü + Dropdown-Unterkategorien ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('primary-nav');
  if(toggle && nav){
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open);
    });
  }

  const drops = document.querySelectorAll('.nav-drop');
  drops.forEach(drop => {
    const btn = drop.querySelector('.nav-drop-toggle');
    if(!btn) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !drop.classList.contains('is-open');
      drops.forEach(d => { d.classList.remove('is-open'); const b = d.querySelector('.nav-drop-toggle'); if(b) b.setAttribute('aria-expanded','false'); });
      if(willOpen){
        drop.classList.add('is-open');
        btn.setAttribute('aria-expanded','true');
      }
    });
  });
  document.addEventListener('click', (e) => {
    drops.forEach(d => {
      if(!d.contains(e.target)){
        d.classList.remove('is-open');
        const b = d.querySelector('.nav-drop-toggle');
        if(b) b.setAttribute('aria-expanded','false');
      }
    });
  });
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
      drops.forEach(d => {
        d.classList.remove('is-open');
        const b = d.querySelector('.nav-drop-toggle');
        if(b) b.setAttribute('aria-expanded','false');
      });
    }
  });
});

/* =========================================================
   BLOG-DATEN (simuliert eine kleine CMS-Quelle)
   Wird für: Tag-Cloud, Startseiten-Feed, Kategorie-Abschnitte genutzt.
   ========================================================= */
/* FR_POSTS_START */
const FR_POSTS = [
  {   title:"Warum +2% -2% +2% -2%... nie wieder 100 Euro erreicht",   titleEn:"Why +2% -2% +2% -2%... Never Gets You Back to 100 €",   cat:"Finanzen",   subcat:"rendite",   date:"2026-08-06",   excerpt:"Mathematischer Beweis des Volatilitätsverlusts: (1+x)(1-x)=1-x² ist immer kleiner als 1. Mit Vergleichstabelle, Grafik und einer ehrlichen Einordnung, warum das für normale Aktien kaum relevant ist.",   excerptEn:"Volatility drag, proven mathematically: (1+x)(1-x)=1-x² is always less than 1. With comparison table, chart, and an honest reality check on why this barely matters for ordinary stocks.",   tags:["Finanzen","Rendite","Volatilität"],   link:"beitrag-volatilitaetsverlust-mathematischer-beweis.html" },
  {   title:"10.000 Euro in 2,5 Jahren: Der Speed-Run-Beweis, dass Sparen für dich funktioniert",   titleEn:"10,000 Euros in 2.5 Years: The Speed-Run Proof That You Can Save",   cat:"Finanzen",   subcat:"vermoegen",   date:"2026-08-06",   excerpt:"Nicht der langsame Weg zur ersten Million, sondern Geschwindigkeit: die ersten 10.000 Euro in 2,5 bis 3 Jahren. Die vier größten Ausgabenblöcke (Wohnen, Transport, Kleidung, Essen) plus die Einnahmenseite mit Side Hustles.",   excerptEn:"Not the slow path to the first million, but speed: the first €10,000 in 2.5 to 3 years. The four biggest expense blocks plus the income side with side hustles.",   tags:["Finanzen","Vermögensaufbau","Sparquote"],   link:"beitrag-10000-euro-sparen-schnell.html" },
  {   title:"Minimalismus für Einsteiger: Definition, die Wissenschaft dahinter, und wie du wirklich anfängst",   titleEn:"Minimalism for Beginners: Definition, the Science, and How to Actually Start",   cat:"Minimalismus",   subcat:"budget",   date:"2026-08-06",   excerpt:"Was Minimalismus wirklich bedeutet, was Studien über den Zusammenhang zu Wohlbefinden sagen, und ein konkreter 5-Schritte-Einstieg plus die 30-Tage-Challenge zum sofort Loslegen.",   excerptEn:"What minimalism actually means, what research says about its link to wellbeing, and a concrete 5-step start plus the 30-day challenge to begin right away.",   tags:["Minimalismus","Budget","Motivation"],   link:"beitrag-minimalismus-einsteiger-guide.html" },
  {   title:"7 Grundregeln des Vermögensaufbaus — und warum Side Hustles die unterschätzteste ist",   titleEn:"7 Rules for Building Wealth — and Why Side Hustles Are the Most Underrated One",   cat:"Finanzen",   subcat:"learning",   date:"2026-08-06",   excerpt:"Die sieben wissenschaftlich fundierten Grundregeln des Vermögensaufbaus, und ein genauer Blick auf die am meisten übersehene: die eigenen Einnahmen aktiv erhöhen. Sechs Side-Hustle-Kategorien im Realitätscheck.",   excerptEn:"The seven evidence-based rules of building wealth, and a closer look at the most overlooked one: actively increasing your own income. Six side hustle categories, reality-checked.",   tags:["Finanzen","Learning","FIRE"],   link:"beitrag-side-hustle-grundregeln.html" },
  {   title:"Drei-Fonds-Portfolio: S&P 500, World ex-USA, Anleihen",   titleEn:"Three-Fund Portfolio: S&P 500, World ex-USA, Bonds",   cat:"Finanzen",   subcat:"vermoegen",   date:"2026-08-06",   excerpt:"Warum ein einzelner MSCI-World-ETF ein Klumpenrisiko von ~70% US-Gewicht mitbringt, und wie man mit S&P 500, World ex-USA und einem Anleihen-ETF die eigene Gewichtung selbst bestimmt. Mit Alters-Rechner.",   excerptEn:"Why a single MSCI World ETF carries a ~70% US concentration risk, and how splitting into S&P 500, World ex-USA and a bond ETF lets you set your own weighting. With an age calculator.",   tags:["Finanzen","ETF","Vermögensaufbau"],   link:"rechner-drei-fonds-portfolio.html" },
  {   title:"The Bogleheads' Guide to Investing — Larimore, Lindauer, LeBoeuf",   titleEn:"The Bogleheads' Guide to Investing — Larimore, Lindauer, LeBoeuf",   cat:"Bücher",   cover:"img/covers/bogleheads-guide-to-investing.jpg",   buyUrl:"https://www.amazon.de/dp/1118921283",   subcat:"vermoegensaufbau-mindset",   date:"2026-08-06",   excerpt:"Das Standardwerk der Bogleheads-Community: einfache, kostengünstige Drei-Fonds-Portfolios statt Markttiming. Bisher nur auf Englisch erhältlich.",   excerptEn:"The Bogleheads community's standard reference: simple, low-cost three-fund portfolios instead of market timing. English only so far.",   tags:["Bücher","ETF","Vermögensaufbau"],   link:"beitrag-buch-bogleheads-guide-to-investing.html" },
  {   title:"Die ILOG-Matrix: Vor Ort, Lokal, Online, Global",   titleEn:"The ILOG Matrix: Vor Ort, Lokal, Online, Global",   cat:"Finanzen",   subcat:"vermoegen",   date:"2026-08-06",   excerpt:"Vier Kategorien sortieren jede Geschäftsidee nach Geschwindigkeit und Skalierbarkeit — mit Beispielen von Autowäsche über Schinken aus der Region bis zur Microsoft-Ursprungsgeschichte.",   excerptEn:"Four categories sort any business idea by speed and scalability — with examples from car washing to regional ham to the Microsoft origin story.",   tags:["Finanzen","Vermögensaufbau","Unternehmertum"],   link:"beitrag-ilog-matrix.html" },
  {   title:"Die vier Rollen: Arbeiter, Selbstständiger, Unternehmer, Investor",   titleEn:"The Four Roles: Arbeiter, Selbstständiger, Unternehmer, Investor",   cat:"Finanzen",   subcat:"vermoegen",   date:"2026-08-06",   excerpt:"Kiyosakis Cashflow-Quadrant im Detail: die vier Rollen, deutsch zuerst mit Originalbuchstaben in Klammern, und der typische Weg vom Arbeiter zum Investor.",   excerptEn:"Kiyosaki's Cashflow Quadrant in depth: the four roles, German-first with original letters in brackets, and the typical path from Arbeiter to Investor.",   tags:["Finanzen","Vermögensaufbau","FIRE"],   link:"beitrag-cashflow-quadrant-esbi.html" },
  {   title:"Der Cashflow-Quadrant: Vom Hamsterrad zur finanziellen Freiheit",   titleEn:"The Cashflow Quadrant: From the Rat Race to Financial Freedom",   cat:"Finanzen",   subcat:"vermoegen",   date:"2026-08-06",   excerpt:"Kiyosakis Cashflow-Quadrant (E/S/B/I) erklärt: warum die linke Seite das Hamsterrad ist und die rechte die finanzielle Freiheit. Plus eine zweite Matrix — Skalierbarkeit vs. Geld-Geschwindigkeit —, mit der du entscheidest, welche Geschäftsidee sich lohnt.",   excerptEn:"Kiyosaki's Cashflow Quadrant (E/S/B/I) explained: why the left side is the rat race and the right side is financial freedom. Plus a second matrix — scalability vs. speed of money — to help pick which business idea is worth pursuing.",   tags:["Finanzen","Vermögensaufbau","FIRE","Unternehmertum"],   link:"beitrag-cashflow-quadrant.html" },
  {   title:"DAX bei 26.000 Punkten — aber nur ~9.700 ohne Dividenden",   titleEn:"DAX at 26,000 Points — But Only ~9,700 Without Dividends",   cat:"Finanzen",   subcat:"rendite",   date:"2026-08-03",   excerpt:"Der DAX knackt heute die 26.000-Punkte-Marke. Der reine Kursindex läge nur bei rund 9.700 Punkten. Warum das so ist, wie die DAX-Regeln Linde nach New York getrieben haben, und wie viel Dividenden seit 1987 wirklich ausmachen.",   excerptEn:"The DAX breaks 26,000 points today. The pure price index would sit at only around 9,700 points. Why that is, how the DAX's own rules pushed Linde to New York, and how much dividends have really contributed since 1987.",   tags:["Finanzen","DAX","Index","Dividenden"],   link:"beitrag-dax-rekord-kursindex-dividenden.html" },
  {   title:"Die 50-25-15-10-Regel: Eine schärfere Variante der 50/30/20-Regel",   titleEn:"The 50-25-15-10 Rule: A Sharper Variant of 50/30/20",   cat:"Minimalismus",   subcat:"budget",   date:"2026-08-03",   excerpt:"50% Lebenshaltung, 25% ETF-Sparplan, 15% Notgroschen, 10% Freizeit — und warum Immobilienbesitzer eigentlich nicht wegen der Wertsteigerung reicher sind, sondern wegen der Spardisziplin, die ihnen der Kredit auferlegt.",   excerptEn:"50% living costs, 25% ETF savings plan, 15% emergency fund, 10% leisure — and why homeowners aren't really wealthier because of appreciation, but because of the savings discipline their mortgage forces on them.",   tags:["Minimalismus","Budget","Sparquote","Immobilien"],   link:"beitrag-50-25-15-10-regel.html" },
  {   title:"6–10 % pro Jahr? Was S&P 500, Nasdaq, DAX, Nikkei & China wirklich brachten",   titleEn:"6–10 % Per Year? What S&P 500, Nasdaq, DAX, Nikkei & China Actually Delivered",   cat:"Finanzen",   subcat:"rendite",   date:"2026-08-03",   excerpt:"Ist eine Durchschnittsrendite von 6–10 % pro Jahr realistisch? Fünf Indizes im historischen Vergleich — S&P 500, Nasdaq, DAX, Nikkei 225 und China (CSI 300) — mit Dividenden und Inflation eingerechnet, über 5 bis 150 Jahre. Und warum die Regel bei Japan zwei Jahrzehnte lang nicht galt.",   excerptEn:"Is an average return of 6–10 % per year realistic? Five indices compared historically — S&P 500, Nasdaq, DAX, Nikkei 225 and China (CSI 300) — with dividends and inflation accounted for, over 5 to 150 years. And why the rule didn't hold for Japan for two decades.",   tags:["Finanzen","Rendite","Index","Historie"],   link:"beitrag-index-durchschnittsrendite.html" },
  {   title:"VIX, Shiller-KGV & Korrekturen: Marktangst lesen, ohne in Panik zu verfallen",   titleEn:"VIX, Shiller P/E & Corrections: Reading Market Fear Without Panicking",   cat:"Finanzen",   subcat:"portfolio",   date:"2026-08-02",   excerpt:"Der VIX misst Marktangst, das Shiller-KGV misst Bewertung, und Korrekturen gehören zum Aktienmarkt wie das Wetter. Alle drei erklärt, mit einem wichtigen Update: das Shiller-KGV steht Mitte 2026 bei 41,3 — nahe am Dotcom-Rekord von 44,2.",   excerptEn:"The VIX measures market fear, the Shiller P/E measures valuation, and corrections are as normal to markets as weather. All three explained, with an important update: the Shiller P/E stands at 41.3 in mid-2026 — close to the dot-com record of 44.2.",   tags:["Finanzen","Börse","VIX","Marktrisiko"],   link:"beitrag-vix-shiller-kgv-korrekturen.html" },
  {   title:"Sparziele nach Alter: Die US-Faustregel und was in Deutschland wirklich zählt",   titleEn:"Savings Goals by Age: The US Rule and What Actually Matters in Germany",   cat:"Finanzen",   subcat:"vermoegen",   date:"2026-08-02",   excerpt:"Amerikanische Sparziel-Tabellen sagen: 3x Gehalt mit 40, 6x mit 50. Die USA haben aber kaum soziale Absicherung, Deutschland schon. Die echten deutschen Vermögenszahlen nach Alter (Bundesbank 2023) — und warum simpel starten wichtiger ist als jede Zahl treffen.",   excerptEn:"American savings-goal charts say: 3x salary by 40, 6x by 50. But the US has little social safety net, Germany does. The real German net-worth figures by age (Bundesbank 2023) — and why simply starting matters more than hitting any number.",   tags:["Finanzen","Vermögen","Einsteiger","ETF"],   link:"beitrag-sparziele-nach-alter.html" },
  {   title:"Börsenspiele, die man kennen sollte: Hochfrequenzhandel & der Preis eines Tweets",   titleEn:"Stock Market Games You Should Know About: Latency Arbitrage & the Price of a Tweet",   cat:"Finanzen",   subcat:"etf",   date:"2026-08-02",   excerpt:"Warum die Kabellänge zwischen Chicago und New York Millionen wert ist, wie ein einzelner Tweet Milliarden bewegen kann — und warum es kein legitimer Nebenverdienst ist, wenn Mächtige ihr eigenes Ankündigungs-Timing für sich nutzen, sondern klassischer Insiderhandel.",   excerptEn:"Why the cable length between Chicago and New York is worth millions, how a single post can move billions — and why it isn't a legitimate side income when powerful people trade on their own announcement timing, but textbook insider trading.",   tags:["Finanzen","Börse","Einsteiger","Recht"],   link:"beitrag-boersenspiele-hft-insiderhandel.html" },
  {   title:"„Alle verkaufen!“ — Warum das strukturell unmöglich ist",   titleEn:"\u201cEveryone Is Selling!\u201d — Why That's Structurally Impossible",   cat:"Finanzen",   subcat:"etf",   date:"2026-08-02",   excerpt:"Panik-Schlagzeilen an der Börse verunsichern gezielt. Aber jedem Verkauf steht zwingend ein Käufer gegenüber — sonst passiert schlicht kein Handel. Wann Handel wirklich ausgesetzt wird, warum Trump gerne am Wochenende Zölle verkündet, und warum breite ETFs das kaltlässt.",   excerptEn:"Panic headlines at the stock exchange are designed to unsettle. But every sale requires a buyer on the other side — otherwise no trade happens at all. When trading actually gets halted, why Trump likes announcing tariffs on weekends, and why broad ETFs shrug it off.",   tags:["Finanzen","Börse","Einsteiger","Psychologie"],   link:"beitrag-boersenpanik-jeder-verkauft.html" },
  {   title:"Börsenzeiten & Spread: Clever kaufen und verkaufen — aufs Zeitfenster achten",   titleEn:"Exchange Hours & Spread: Buy and Sell Smart — Watch the Time Window",   cat:"Finanzen",   subcat:"etf",   date:"2026-08-02",   excerpt:"Bei jedem Wertpapierkauf zahlst du einen Spread — die Differenz aus Geld- und Briefkurs. Wann er am kleinsten ist, warum das mit Xetra-Öffnungszeiten und der Überschneidung mit den US-Börsen zusammenhängt, und was das für ETF-Sparpläne bedeutet.",   excerptEn:"Every securities trade costs you a spread — the gap between bid and ask price. When it's smallest, why that ties to Xetra's opening hours and the overlap with US markets, and what that means for ETF savings plans.",   tags:["Finanzen","Börse","Spread","Handelszeiten"],   link:"beitrag-spread-handelszeiten.html" },
  {   title:"Der Schweinezyklus: eine ganz andere Art von zyklischer Aktie",   titleEn:"The Pig Cycle: A Completely Different Kind of Cyclical Stock",   cat:"Finanzen",   subcat:"portfolio",   date:"2026-08-02",   excerpt:"Nicht jeder Auf-und-ab-Chart ist dasselbe Phänomen. Der echte Schweinezyklus dauert 3-4 Jahre, entsteht durch verzögerte Angebotsanpassung, und trifft heute Speicherchips und Automobilhersteller genauso wie einst Schweinezüchter — ein anderer Mechanismus als Apples jährlicher Sägezahn.",   excerptEn:"Not every up-and-down chart is the same phenomenon. The real pig cycle takes 3-4 years, arises from delayed supply adjustment, and hits memory chips and carmakers today just as it once hit pig farmers — a different mechanism than Apple's annual sawtooth.",   tags:["Finanzen","Aktien","Zyklische Aktien","Volkswirtschaft"],   link:"beitrag-schweinezyklus-zyklische-aktien.html" },
  {   title:"Apples Sägezahn-Kurve: Warum der Umsatz jedes Jahr auf und ab schwankt",   titleEn:"Apple's Sawtooth Curve: Why Revenue Swings Up and Down Every Year",   cat:"Finanzen",   subcat:"portfolio",   date:"2026-08-02",   excerpt:"143,8 Mrd. Dollar Umsatz im Weihnachtsquartal, 109,4 Mrd. im Quartal danach — derselbe Konzern, zwei Quartale, 34 Mrd. Dollar Unterschied. Warum Apples Umsatzkurve wie ein Sägezahn aussieht, und was das für zyklische Aktien allgemein bedeutet.",   excerptEn:"$143.8B revenue in the holiday quarter, $109.4B the quarter after — same company, two quarters, a $34B swing. Why Apple's revenue curve looks like a sawtooth, and what that means for cyclical stocks in general.",   tags:["Finanzen","Aktien","Apple","Zyklische Aktien"],   link:"beitrag-apple-saegezahn-zyklische-aktien.html" },
  {   title:"Gewinnflussdiagramme: Vonovia vs. Allianz",   titleEn:"Profit Flow Diagrams: Vonovia vs. Allianz",   cat:"Finanzen",   subcat:"portfolio",   date:"2026-08-02",   excerpt:"Die Bilanz grafisch aufgeschlüsselt für zwei bekannte DAX-Werte: Warum Vonovias Immobiliengeschäft trotz starkem operativem Ergebnis kapitalintensiv und schwankungsanfällig ist, während Allianz als Versicherer stabiler Gewinn in Dividende umsetzt.",   excerptEn:"The balance sheet graphically broken down for two well-known DAX stocks: why Vonovia's real estate business is capital-intensive and volatile despite strong operating profit, while Allianz as an insurer converts profit into dividends more stably.",   tags:["Finanzen","Aktien","Dividende","Bilanzanalyse"],   link:"beitrag-gewinnflussdiagramme-vonovia-allianz.html" },
  {   title:"Second-Hand-Mode: Warum bei Vinted & Co. die Marke zählt",   titleEn:"Second-Hand Fashion: Why the Brand Matters So Much on Vinted & Co.",   cat:"Minimalismus",   subcat:"nachhaltigkeit",   date:"2026-08-01",   excerpt:"Second-Hand-Mode boomt, und in diesem Markt heißt es Marke, Marke, Marke — weil sie das einzige verlässliche Qualitätssignal ist, wenn man online kauft, ohne anzufassen. Eine recherchierte Liste guter Wiederverkaufsmarken für Damen, Herren und Kinder.",   excerptEn:"Second-hand fashion is booming, and in this market it's brand, brand, brand — because it's the one reliable quality signal when buying online without touching the item first. A researched list of good resale brands for women, men, and children.",   tags:["Minimalismus","Nachhaltigkeit","Second-Hand","Mode"],   link:"beitrag-secondhand-mode-marken-liste.html" },
  {   title:"Die Rentenlücke: Warum dein Nettogehalt nicht deine Rente wird",   titleEn:"The Pension Gap: Why Your Net Salary Won't Be Your Pension",   cat:"Finanzen",   subcat:"vermoegen",   date:"2026-08-01",   excerpt:"Das Rentenniveau ist gesetzlich nur bis 2031 bei 48 % fixiert, die Rentenbesteuerung steigt jedes Jahr, und ein Rentner braucht trotzdem 70-80 % des früheren Nettos. Wie groß die eigene Rentenlücke wahrscheinlich ist, und welche Säulen sie schließen können.",   excerptEn:"The pension level is legally fixed at 48% only until 2031, pension taxation rises every year, and retirees still need 70-80% of their former net income. How large your own pension gap likely is, and which pillars can close it.",   tags:["Finanzen","Rente","Vermögen","Altersvorsorge"],   link:"beitrag-rentenluecke-eigene-saeulen.html" },
  {   title:"Sparten-ETFs für erneuerbare Energien: Solar, Wind & Wasserstoff im Vergleich",   titleEn:"Sector ETFs for Renewable Energy: Solar, Wind & Hydrogen Compared",   cat:"Finanzen",   subcat:"etf",   date:"2026-08-01",   excerpt:"Wer statt eines breiten ESG-Index gezielt in Windenergie, Solar oder Wasserstoff investieren will: eine kategorisierte Liste konkreter Sparten-ETFs, mit den wichtigsten Kompromissen (Kosten, Konzentrationsrisiko) — als Ausgangspunkt für die eigene Recherche.",   excerptEn:"For anyone who wants to invest specifically in wind, solar, or hydrogen instead of a broad ESG index: a categorized list of specific sector ETFs, with the key trade-offs (cost, concentration risk) — a starting point for your own research.",   tags:["Finanzen","ETF","Nachhaltigkeit","Erneuerbare Energien"],   link:"beitrag-sparten-etf-erneuerbare-energien.html" },
  {   title:"ESG-ETFs ökologisch nachhaltig? — Nicht unbedingt",   titleEn:"ESG ETFs Ecologically Sustainable? — Not Necessarily",   cat:"Finanzen",   subcat:"etf",   date:"2026-08-01",   excerpt:"Anders als beim DAX gibt es bei ESG-Indizes keinen einheitlichen Standard. Echte Fälle: Rüstungskonzerne und Kohlestrom in 'nachhaltigen' ETFs, die EU-Taxonomie-Atomkraft-Kontroverse, und ein Ermittlungsverfahren wegen Greenwashing gegen einen großen Anbieter.",   excerptEn:"Unlike the DAX, there's no single standard for ESG indices. Real cases: weapons makers and coal power in 'sustainable' ETFs, the EU taxonomy nuclear controversy, and a greenwashing investigation against a major provider.",   tags:["Finanzen","ETF","Nachhaltigkeit","Greenwashing"],   link:"beitrag-esg-etf-greenwashing.html" },
  {   title:"Gekündigt? So schützt du deine einzige Geldquelle",   titleEn:"Terminated? How to Protect Your Only Income Source",   cat:"Finanzen",   subcat:"vermoegen",   date:"2026-07-31",   excerpt:"Die 3-Wochen-Frist für die Kündigungsschutzklage, was sofort zu tun ist, häufige Fehler des Arbeitgebers, und warum die Kostenregel vor dem Arbeitsgericht die Rechtsschutzversicherung so wertvoll macht — recherchiert und mit Quellen.",   excerptEn:"The 3-week deadline for challenging a termination, what to do immediately, common employer mistakes, and why German labor court cost rules make legal insurance so valuable — researched, with sources.",   tags:["Finanzen","Recht","Absicherung","Notgroschen"],   link:"beitrag-kuendigung-einkommen-schuetzen.html" },
  {   title:"Arbeitnehmer, Selbstständige, Milliardär: Ausgabenstruktur im Vergleich",   titleEn:"Employee vs. Self-Employed vs. Billionaire: Spending Structure Compared",   cat:"Minimalismus",   subcat:"motivation",   date:"2026-07-30",   excerpt:"Nicht die Höhe der Ausgaben, sondern ihre Struktur im Vergleich: Arbeitnehmer- und Selbstständigen-Haushalt (Destatis EVS 2023) neben Milliardär Mortimer Zuckermans 8,9-Mio.-Dollar-Jahresausgaben — als Prozent-Balken statt unvorstellbarer Zahl.",   excerptEn:"Not the amount, but the structure: employee and self-employed households (Destatis EVS 2023) next to billionaire Mortimer Zuckerman's $8.9M in annual spending — as percentage bars instead of an unimaginable number.",   tags:["Motivation","Budget","Vermögen","Statistik"],   link:"beitrag-ausgabenstruktur-im-vergleich.html" },
  {   title:"Auch ein Milliardär hat's schwer: Was ein Morgan-Stanley-Bericht über Geld verrät",   titleEn:"Even a Billionaire Has It Rough: What a Morgan Stanley Report Reveals About Money",   cat:"Minimalismus",   subcat:"motivation",   date:"2026-07-29",   excerpt:"Ein durchgesickerter Portfoliobericht listet die Jahresausgaben von Milliardär Mortimer Zuckerman bis auf den Dollar auf — 8,9 Mio. $, aufgeschlüsselt bis zum Pferdefutter. Was das über Fixkosten, Lifestyle-Inflation und Geldsorgen auf jeder Vermögensstufe verrät.",   excerptEn:"A leaked portfolio report lists billionaire Mortimer Zuckerman's annual expenses down to the dollar — $8.9M, broken down to horse feed. What that reveals about fixed costs, lifestyle inflation, and money worries at every wealth level.",   tags:["Motivation","Lifestyle-Inflation","Vermögen","Budget"],   link:"beitrag-milliardaer-hat-auch-schwer.html" },
  {   title:"Erfolgreich scheitern: Was Deutschland von der US-Gründerkultur lernen kann",   titleEn:"Failing Successfully: What Germany Can Learn From US Founder Culture",   cat:"Minimalismus",   subcat:"motivation",   date:"2026-07-28",   excerpt:"Warum Scheitern in den USA eine zweite Chance bedeutet und in Deutschland noch oft ein Stigma bleibt — mit echten Zahlen, faktengeprüften Kunst-Beispielen und einem Rechner, wie weit du mit wenig oder geliehenem Geld kommst.",   excerptEn:"Why failure means a second chance in the US and often stays a stigma in Germany — with real data, fact-checked art examples, and a calculator for how far little or borrowed money gets you.",   tags:["Motivation","Scheitern","Gründung","Mindset","Nebeneinkommen"],   link:"beitrag-erfolgreich-scheitern.html" },
  {   title:"Renditedreieck-Rechner: 15 Anlageklassen im Vergleich (1973–2023)",   titleEn:"Return Triangle Calculator: 15 Asset Classes Compared (1973–2023)",   cat:"Finanzen",   subcat:"rendite",   date:"2026-07-27",   excerpt:"Interaktive Renditedreiecke für DAX, S&P 500, NASDAQ 100, Gold und 11 weitere Werte — plus ein Rechner, der zeigt, ob selbst der schlechteste Einstiegszeitpunkt nach 10 Jahren im Plus lag.",   excerptEn:"Interactive return triangles for the DAX, S&P 500, NASDAQ 100, gold, and 11 more assets — plus a calculator that shows whether even the worst entry point was profitable after 10 years.",   tags:["Rendite","ETF","Aktien","Depot"],   link:"beitrag-renditedreieck-rechner.html" },
  {   title:"Aktien, die monatlich Dividenden zahlen: Eine Liste zum Recherchieren",   titleEn:"Stocks That Pay Monthly Dividends: A Research Starting Point",   cat:"Finanzen",   subcat:"portfolio",   date:"2026-07-27",   excerpt:"Realty Income, AGNC, Main Street Capital und Co.: eine Liste von Aktien mit monatlicher Dividende, mit Sektor, Börse und Risiko-Einordnung — als Ausgangspunkt für die eigene Recherche, keine Kaufempfehlung.",   excerptEn:"Realty Income, AGNC, Main Street Capital and more: a list of stocks with monthly dividends, with sector, exchange, and risk notes — a starting point for your own research, not a buy recommendation.",   tags:["Finanzen","Dividenden","REIT","BDC","Portfolio"],   link:"beitrag-monatliche-dividenden-aktien.html" },
  {   title:"Keine Kompromisse — Nicole Wehn",   titleEn:"Keine Kompromisse — Nicole Wehn",   cat:"Bücher",   cover:"img/covers/keine-kompromisse.jpg",   buyUrl:"https://www.amazon.de/dp/398640015X",   subcat:"vermoegensaufbau-mindset",   date:"2026-07-27",   excerpt:"Mit Vorwort von Tobias Beck: sieben Schritte, um aufzuhören, sich selbst für fremde Erwartungen wegzukompromittieren, und eine authentische persönliche Marke aufzubauen.",   excerptEn:"With a foreword by Tobias Beck: seven steps to stop compromising yourself away for other people's expectations and build an authentic personal brand.",   tags:["Bücher","Mindset","Persönlichkeitsentwicklung"],   link:"beitrag-buch-keine-kompromisse.html" },
  {   title:"Aktien ohne Vorkenntnisse — Marian Sommer",   titleEn:"Aktien ohne Vorkenntnisse — Marian Sommer",   cat:"Bücher",   cover:"img/covers/aktien-ohne-vorkenntnisse.jpg",   buyUrl:"https://www.amazon.de/dp/B0FW9YF3G2",   subcat:"vermoegensaufbau-mindset",   date:"2026-07-26",   excerpt:"Wie du als Einsteiger mit Aktien und ETFs besser als die Profis an der Börse investierst — KGV, Dividenden und Marktkapitalisierung ohne Fachjargon, plus Marktpsychologie gegen Angst und Gier.",   excerptEn:"How to invest better than the pros as a beginner in stocks and ETFs — P/E ratio, dividends and market cap without the jargon, plus market psychology against fear and greed.",   tags:["Bücher","ETF","Aktien","Anfänger"],   link:"beitrag-buch-aktien-ohne-vorkenntnisse.html" },
  {   title:"Souverän investieren für Einsteiger — Gerd Kommer",   titleEn:"Souverän investieren für Einsteiger — Gerd Kommer",   cat:"Bücher",   cover:"img/covers/souveraen-investieren-einsteiger.jpg",   buyUrl:"https://www.amazon.de/dp/3593518686",   subcat:"vermoegensaufbau-mindset",   date:"2026-07-26",   excerpt:"Die einsteigerfreundliche Ausgabe des Kommer-Klassikers (3. Auflage): wie man mit ETFs Schritt für Schritt ein Vermögen aufbaut, ohne die Datendichte des großen Nachschlagewerks.",   excerptEn:"The beginner-friendly edition of the Kommer classic (3rd edition): how to build wealth with ETFs step by step, without the data density of the full reference work.",   tags:["Bücher","ETF","Geldanlage","Anfänger"],   link:"beitrag-buch-souveraen-investieren-einsteiger.html" },
  {   title:"Girokonto für Selbstständige: Was wirklich zählt",   titleEn:"Business Checking Account for the Self-Employed: What Actually Matters",   cat:"Finanzen",   subcat:"girokonto",   date:"2026-07-26",   excerpt:"Kein Geschäftskonto-Zwang für Einzelunternehmer und Freiberufler — trotzdem verbieten die meisten Banken die geschäftliche Nutzung eines Privatkontos in ihren AGB. Pflicht, Kosten, Buchungsgebühren und Funktionen im Überblick.",   excerptEn:"No legal requirement for a separate business account for sole proprietors and freelancers — yet most banks' terms forbid business use of a private account. Requirements, costs, per-transaction fees, and features at a glance.",   tags:["Finanzen","Girokonto","Selbstständige","Freiberufler","Steuern"],   link:"beitrag-girokonto-selbststaendige.html" },
  {   title:"Girokonto vs. Geschäftskonto: Brauchen Freelancer wirklich zwei Konten?",   titleEn:"Personal vs. Business Account: Do Freelancers Really Need Two?",   cat:"Finanzen",   subcat:"girokonto",   date:"2026-08-07",   excerpt:"Gesetzlich keine Pflicht, aber Banken-AGB sagen etwas anderes. Warum die Trennung von privat und geschäftlich dein Business rettet, welche Fallstricke lauern, und wie du das richtige Konten-Modell findest.",   excerptEn:"No legal requirement, but bank terms say otherwise. Why separating private and business finances saves your business, what pitfalls to watch for, and how to find the right account model.",   tags:["Finanzen","Girokonto","Geschäftskonto","Freelancer","Selbstständige"],   link:"beitrag-girokonto-oder-geschaeftskonto-freelancer.html" },
  {   title:"Die 4.000-Euro-Grenze: Warum du niemals mehr privat in deine Selbstständigkeit stecken solltest",   titleEn:"The €4,000 Limit: Why You Should Never Put More of Your Own Money Into Your Business",   cat:"Finanzen",   subcat:"girokonto",   date:"2026-08-07",   excerpt:"Rund 20-25 % aller Gründer scheitern im ersten Jahr am Cashflow, nicht an der Idee. Warum eine feste Obergrenze fürs private Startkapital deinen Schufa-Score schützt, und wie das 40/60-Gebot dein Erspartes strategisch aufteilt.",   excerptEn:"Roughly 20-25% of founders fail in year one from cash flow problems, not a bad idea. Why a firm cap on your own starting capital protects your Schufa score, and how the 40/60 rule splits your savings strategically.",   tags:["Finanzen","Startkapital","Schufa","Freelancer","Existenzgründung"],   link:"beitrag-4000-euro-grenze-startkapital.html" },
  {   title:"Das 3-Konten-Modell: Wie du dir als Freelancer fehlerfrei dein „Gehalt“ überweist",   titleEn:"The 3-Account Model: How to Pay Yourself a Freelancer 'Salary' Without Mistakes",   cat:"Finanzen",   subcat:"girokonto",   date:"2026-08-07",   excerpt:"Fast ein Viertel aller Start-ups scheitert im ersten Jahr an Liquidität, nicht an der Idee. Warum das Zwei-Konten-Modell eine optische Täuschung ist, und wie das Drei-Konten-Modell dich vor der Privatentnahme-Falle schützt.",   excerptEn:"Nearly a quarter of all startups fail in year one due to liquidity, not a bad idea. Why the two-account model is an optical illusion, and how the three-account model protects you from the withdrawal trap.",   tags:["Finanzen","Girokonto","Privatentnahme","Freelancer","Liquidität"],   link:"beitrag-3-konten-modell-freelancer.html" },
  {   title:"Das Kreditkarten-Dilemma: Warum du geschäftliche Ausgaben niemals über private Karten zahlen darfst",   titleEn:"The Credit Card Dilemma: Why You Should Never Pay Business Expenses on a Private Card",   cat:"Finanzen",   subcat:"girokonto",   date:"2026-08-08",   excerpt:"Miles & More oder Amex privat für Business-Ausgaben nutzen, um Punkte zu sammeln? Warum das gegen die AGB verstößt, Kontokündigung droht, Meilen steuerpflichtig sind, und wie echte Business-Kreditkarten das sauber lösen.",   excerptEn:"Using a private Miles & More or Amex card for business expenses to collect points? Why that breaks the terms and conditions, risks account closure, miles are taxable, and how real business credit cards solve it cleanly.",   tags:["Finanzen","Kreditkarte","Freelancer","AGB","Meilen"],   link:"beitrag-kreditkarten-dilemma-freelancer.html" },
  {   title:"Depot nach Alter und Risikoklasse: Vom World-ETF zu Anleihen oder Cash",   titleEn:"Portfolio by Age and Risk Class: From World ETF to Bonds or Cash",   cat:"Finanzen",   subcat:"rendite",   date:"2026-07-28",   excerpt:"Wie sich die Depot-Aufteilung vom reinen World-ETF über Kern-Satellit bis zur Cash-Quote verschiebt — plus warum die Anleihen-Sicherheitsmarge 2022 nicht gehalten hat, und ein kurzer Risikoklassen-Check.",   excerptEn:"How allocation shifts from a single World ETF to a core-satellite mix to a cash cushion as you age — plus why the bond safety margin failed in 2022, and a short risk-class self-check.",   tags:["Finanzen","Depot","Risiko","Rebalancing","ETF"],   link:"beitrag-depot-alter-risikoklasse.html" },
  {   title:"Tagesgeldkonto für Studenten: Was das BAföG-Darlehen damit zu tun hat",   titleEn:"Savings Account for Students: What Your BAföG Loan Has to Do With It",   cat:"Finanzen",   subcat:"girokonto",   date:"2026-07-26",   excerpt:"992 € BAföG-Höchstsatz, die Hälfte davon ein zinsloses Staatsdarlehen mit Deckel bei 10.010 € — und bis zu 26 % Nachlass bei vorzeitiger Rückzahlung. Warum das Geld dafür ins Tagesgeld gehört, nicht ins Depot.",   excerptEn:"€992 is the current BAföG maximum rate, half of it an interest-free loan capped at €10,010 — with up to a 26% discount for early repayment. Why that money belongs in a savings account, not a custody account.",   tags:["Finanzen","BAföG","Tagesgeld","Studenten","Kredit"],   link:"beitrag-depot-fuer-studenten.html" },
  {   title:"Riester oder ETF? Wann sich Riester wirklich lohnt — und was 2027 kommt",   titleEn:"Riester or ETF? When Riester Is Actually Worth It — and What Changes in 2027",   cat:"Finanzen",   subcat:"vergleich",   date:"2026-07-09",   excerpt:"2026 ist das letzte Jahr für neue Riester-Verträge. Wann Riester sich lohnt (Kinder, Geringverdiener, Steuer-Arbitrage), wann nicht — und warum das neue Altersvorsorgedepot ab 2027 die Debatte verändert.",   excerptEn:"2026 is the last year for new Riester contracts. When Riester is worth it (kids, low earners, tax arbitrage), when it isn't — and why the new Altersvorsorgedepot starting 2027 changes the debate.",   tags:["Finanzen","Riester","Altersvorsorge","ETF","Vergleich","ZERO_TO_HERO"],   link:"beitrag-riester-vs-etf.html" },
  {   title:"Bondora Go & Grow: Eine Zahl statt 30 Kredite",   titleEn:"Bondora Go & Grow: One Number Instead of 30 Loans",   cat:"Finanzen",   subcat:"vermoegen",   date:"2026-07-09",   excerpt:"Bondora Go & Grow erklärt: ~6% p.a., täglich gutgeschrieben, ohne einzelne Kredite oder Risikoklassen A–D auszusuchen. Funktionsweise, was es NICHT ist (kein Tagesgeld), und wie die Steuer läuft.",   excerptEn:"Bondora Go & Grow explained: ~6% p.a., credited daily, without picking individual loans or risk grades A–D. How it works, what it is NOT (not a savings account), and how the tax side works.",   tags:["Finanzen","P2P","Bondora","Passives Einkommen","Vermögensaufbau","ZERO_TO_HERO"],   link:"beitrag-bondora-go-and-grow.html" },
  {   title:"Die Gehaltsschraube: Was zwischen Berufseinstieg und Bundestrainer liegt",   titleEn:"The Salary Screw: What Lies Between Your First Job and the National Coach",   cat:"Minimalismus",   subcat:"motivation",   date:"2026-07-25",   excerpt:"Die deutsche Akademiker-Gehaltspreizung von 36.400 € bis 57.000 €, dann die andere Liga bis zu Elon Musk — plus Gender Pay Gap und warum turnusmäßiges Verhandeln kein Luxus ist.",   excerptEn:"Germany's academic salary spread from 36,400 € to 57,000 €, then the other league up to Elon Musk — plus the gender pay gap and why negotiating on a schedule isn't optional.",   tags:["Motivation","Gehalt","Gender Pay Gap","Verhandlung"],   link:"beitrag-gehaltsschraube.html" },
  {   title:"Die wichtigste Investition bist du selbst",   titleEn:"The Most Important Investment Is You",   cat:"Minimalismus",   subcat:"motivation",   date:"2026-07-24",   excerpt:"Persönlichkeitsentwicklung als Rendite-Hebel: Warum gezieltes Lernen mehr bringt als YouTube-Destillat, und welche Gewohnheiten wirklich den Unterschied machen — aus eigener Erfahrung.",   excerptEn:"Personal development as a return lever: why deliberate paid learning outperforms distilled YouTube, and which habits actually make the difference — from personal experience.",   tags:["Motivation","Mindset","Persönlichkeitsentwicklung","Unternehmertum"],   link:"beitrag-in-dich-selbst-investieren.html" },
  {   title:"Der Kühlschrank-Test: Bist du ein kreatives Genie oder ein wandelndes Liquiditätsrisiko?",   titleEn:"The Fridge Test: Are You a Creative Genius or a Walking Liquidity Risk?",   cat:"Minimalismus",   subcat:"motivation",   date:"2026-08-08",   excerpt:"Notizzettel statt Magnete am Kühlschrank, kein gemachtes Bett, Kleiderstapel auf dem Stuhl? Warum kreatives Chaos im Business zur Kostenfalle wird — und wieso Auslagern klüger ist als Selbst-Optimierung.",   excerptEn:"Sticky notes instead of magnets on the fridge, unmade bed, clothes piled on the chair? Why creative chaos becomes an expensive trap in business — and why outsourcing beats trying to fix yourself.",   tags:["Motivation","Unternehmertum","Selbstständigkeit","Chaos","Steuerberater"],   link:"beitrag-kuehlschrank-test-gruender.html" },
  {   title:"CASHFLOW schützen: Das eiserne Überlebensgesetz im Business",   titleEn:"Protecting Cash Flow: The Iron Law of Survival in Business",   cat:"Minimalismus",   subcat:"motivation",   date:"2026-08-08",   excerpt:"Bis zu 25 % aller Start-ups scheitern im ersten Jahr am Geldmangel, nicht an der Idee. Drei unumstößliche Regeln ab Tag eins: kurze Zahlungsziele, Meilenstein-Zahlungen statt Vorleistung, und dein rechtliches Schutzschild.",   excerptEn:"Up to 25% of all startups fail in year one from lack of money, not a bad idea. Three non-negotiable rules from day one: short payment terms, milestone payments instead of upfront work, and your legal shield.",   tags:["Motivation","Unternehmertum","Cashflow","Zahlungsziel","Rechtsschutz"],   link:"beitrag-cashflow-ueberlebensgesetz.html" },
  {   title:"Ein Münchner Milliardär, Weißwurst, und acht Lektionen fürs Business",   titleEn:"A Munich Billionaire, Weisswurst, and Eight Business Lessons",   cat:"Minimalismus",   subcat:"motivation",   date:"2026-08-08",   excerpt:"Ich habe 22 Milliardäre angeschrieben, nur einer hat geantwortet. Seine Kernbotschaft beim Weißwurstfrühstück: Kauf ein funktionierendes Unternehmen statt bei Null zu starten — plus sieben weitere unverblümte Lektionen.",   excerptEn:"I contacted 22 billionaires, only one replied. His core message over a Bavarian breakfast: buy an already-working business instead of starting from zero — plus seven more blunt lessons.",   tags:["Motivation","Unternehmertum","Schufa","Cashflow","Bücher"],   link:"beitrag-milliardaer-weisswurst-lektionen.html" },
  {   title:"100 Millionen Dollar Geldmodelle — Alex Hormozi",   titleEn:"$100M Money Models — Alex Hormozi",   cat:"Bücher",   cover:"img/covers/100m-geldmodelle.jpg",   buyUrl:"https://www.amazon.de/dp/1963349911",   subcat:"unternehmertum",   date:"2026-07-24",   excerpt:"Hormazis dritter Band — Guinness-Weltrekord als am schnellsten verkauftes Sachbuch. Wie man Angebote so in Sequenzen aufbaut, dass jeder Kunde systematisch mehr ausgibt und länger bleibt.",   excerptEn:"Hormozi's third volume — Guinness World Record fastest-selling non-fiction. How to sequence offers so every customer systematically spends more and stays longer.",   tags:["Bücher","Unternehmertum","Vertrieb","Hormozi"],   link:"beitrag-buch-100m-geldmodelle.html" },
  {   title:"100 Millionen Dollar Angebote — Alex Hormozi",   titleEn:"$100M Offers — Alex Hormozi",   cat:"Bücher",   cover:"img/covers/100m-angebote.jpg",   buyUrl:"https://www.amazon.de/dp/196334913X",   subcat:"unternehmertum",   date:"2026-07-24",   excerpt:"Über 1 Million verkaufte Exemplare: Wie man ein Angebot so baut, dass der Preis für den Kunden zur Nebensache wird — durch wahrgenommenen Wert, Risikoumkehr und Stacking.",   excerptEn:"Over 1 million copies sold: how to build an offer so that price becomes secondary for the customer — through perceived value, risk reversal and stacking.",   tags:["Bücher","Unternehmertum","Vertrieb","Hormozi"],   link:"beitrag-buch-100m-angebote.html" },
  {   title:"PlayBook to Millions — Grant Cardone",   titleEn:"PlayBook to Millions — Grant Cardone",   cat:"Bücher",   cover:"img/covers/playbook-to-millions.jpg",   buyUrl:"https://www.amazon.com/dp/B09TPHWXT3",   subcat:"unternehmertum",   date:"2026-07-23",   excerpt:"Cardones umfassendstes Werk (400+ Seiten, Englisch): Strategie, Verkauf, Immobilien und Mindset als Nachschlagewerk für Unternehmer mit konkreten Checklisten und Übungen.",   excerptEn:"Cardone's most comprehensive work (400+ pages): strategy, sales, real estate and mindset as a reference guide for entrepreneurs with concrete checklists and exercises.",   tags:["Bücher","Unternehmertum","Cardone"],   link:"beitrag-buch-playbook-to-millions.html" },
  {   title:"Die 10x-Regel — Grant Cardone",   titleEn:"The 10X Rule — Grant Cardone",   cat:"Bücher",   cover:"img/covers/10x-regel.jpg",   buyUrl:"https://www.amazon.de/dp/3527509860",   subcat:"unternehmertum",   date:"2026-07-23",   excerpt:"Zehnfache Ziele, zehnfacher Einsatz — Cardones Kernthese: normaler Aufwand in einem Wettbewerbsmarkt führt zur Unsichtbarkeit. Das Buch ist laut und repetitiv, die Kernbotschaft bleibt.",   excerptEn:"Ten times the targets, ten times the effort — Cardone's core thesis: average effort in a competitive market leads to invisibility. The book is loud and repetitive; the core message sticks.",   tags:["Bücher","Unternehmertum","Mindset","Cardone"],   link:"beitrag-buch-10x-regel.html" },
  {   title:"Quellensteuer auf Dividenden: Die unsichtbare Steuer — und wie ETFs das meiste davon lösen",   titleEn:"Withholding Tax on Dividends: The Invisible Tax — and How ETFs Solve Most of It",   cat:"Finanzen",   subcat:"steuer",   date:"2026-07-24",   excerpt:"Quellensteuer erklärt: Frankreich (30 %, aufwendige Rückforderung), Schweiz (35 %), UK (0 %), USA (15 % mit W-8BEN) — und warum IE-ETFs das Problem für die meisten Anleger automatisch lösen.",   excerptEn:"Withholding tax explained: France (30 %, complex reclaim), Switzerland (35 %), UK (0 %), USA (15 % with W-8BEN) — and why IE-domiciled ETFs solve the problem automatically for most investors.",   tags:["Finanzen","Steuern","Quellensteuer","Dividenden","ETF","Frankreich","ZERO_TO_HERO"],   link:"beitrag-quellensteuer-dividenden.html" },
  {   title:"Welcher ETF? Ein Leitfaden für blutige Anfänger",   titleEn:"Which ETF? A Guide for Complete Beginners",   cat:"Finanzen",   subcat:"etf",   date:"2026-07-24",   excerpt:"Depot eröffnet — und jetzt? Rund 4.500 ETFs sind in Deutschland handelbar. Was wirklich zählt, was man ignorieren kann — physisch vs. synthetisch, TER, MSCI World vs. All-World — und eine konkrete ETF-Liste für Einsteiger.",   excerptEn:"Depot opened — now what? Around 4,500 ETFs are tradeable in Germany. What actually matters, what you can ignore — physical vs. synthetic, TER, MSCI World vs. All-World — plus a concrete ETF list for beginners.",   tags:["Finanzen","ETF","Sparplan","Anfänger","MSCI World","Dividenden","ZERO_TO_HERO"],   link:"beitrag-etf-sparplan-fuer-anfaenger.html" },
  {   title:"Dividendenprojektion: Meine echten Zahlen, Jahr für Jahr",   titleEn:"Dividend Projection: My Real Numbers, Year by Year",   cat:"Finanzen",   subcat:"portfolio",   date:"2026-07-23",   excerpt:"Jahresweise Projektion meiner Dividendenstrategie: Depotwert, Einzahlungen, Dividende brutto/netto und Yield-on-Cost — mit vollständig anpassbarem Tool zum Kopieren, Ausdrucken und Umrechnen auf die eigene Strategie.",   excerptEn:"Year-by-year projection of my dividend strategy: portfolio value, contributions, gross/net dividend, and yield-on-cost — with a fully adjustable tool to copy, print, and adapt to your own strategy.",   tags:["Finanzen","Portfolio","Dividenden","Projektion","Tool","ZERO_TO_HERO"],   link:"beitrag-dividendenprojektion.html" },
  {   title:"Junior-Depot: Wie dein Kind fast steuerfrei ein Vermögen aufbaut",   titleEn:"Junior Custody Account: How Your Child Builds Wealth Almost Tax-Free",   cat:"Finanzen",   subcat:"vermoegen",   date:"2026-07-22",   excerpt:"13.348 € Kapitalerträge im Jahr komplett steuerfrei — durch die Kombination aus Sparerpauschbetrag und Grundfreibetrag im Namen des Kindes. Recherchiert, nachgerechnet, mit Sparrechner.",   excerptEn:"13,348 € in capital income per year completely tax-free — by combining the saver's allowance and the basic tax-free allowance in the child's own name. Researched, recalculated, with a savings calculator.",   tags:["Finanzen","Vermögensaufbau","Steuer","Kinder"],   link:"beitrag-junior-depot-freibetraege.html" },
  {   title:"Wie sich die Dividendenrendite verändert: Buffetts 65-%-Coca-Cola-Trick",   titleEn:"How Dividend Yield Changes Over Time: Buffett's 65% Coca-Cola Trick",   cat:"Finanzen",   subcat:"rendite",   date:"2026-07-22",   excerpt:"Warren Buffetts Coca-Cola-Aktie bringt Berkshire heute rund 65 % Dividendenrendite — bezogen auf den Einstandspreis von 1988. Was Einstandsrendite (Yield on Cost) wirklich bedeutet, nachgerechnet und eingeordnet.",   excerptEn:"Warren Buffett's Coca-Cola stake now pays Berkshire roughly 65% in dividend yield — relative to its 1988 cost basis. What yield on cost actually means, recalculated and put in perspective.",   tags:["Finanzen","Rendite","Dividenden","Buffett"],   link:"beitrag-einstandsrendite-yield-on-cost.html" },
  {   title:"Das große Handbuch der Optionsstrategien",   titleEn:"Das große Handbuch der Optionsstrategien",   cat:"Bücher",   cover:"img/covers/handbuch-optionsstrategien.jpg",   buyUrl:"https://www.amazon.de/dp/3959722893",   subcat:"optionen",   date:"2026-07-19",   excerpt:"Ein Nachschlagewerk mit Bausteinen für planbares Einkommen an der Börse über Optionen — unabhängig von der Marktrichtung.",   excerptEn:"A reference handbook of options building blocks for planned income — regardless of market direction.",   tags:["Bücher","Optionen","Finanzen"],   link:"beitrag-buch-handbuch-optionsstrategien.html" },
  {   title:"Optionsstrategien für die Praxis",   titleEn:"Optionsstrategien für die Praxis",   cat:"Bücher",   cover:"img/covers/optionsstrategien-praxis.jpg",   buyUrl:"https://www.amazon.de/dp/3941493787",   subcat:"optionen",   date:"2026-07-20",   excerpt:"Seit 2011 ein Standardwerk im deutschsprachigen Optionshandel: praxisnahe Strategien für regelmäßiges Einkommen, ohne Versprechen vom schnellen Reichtum.",   excerptEn:"A standard reference in German-language options trading since 2011: practice-oriented strategies for regular income, without promises of quick riches.",   tags:["Bücher","Optionen","Finanzen"],   link:"beitrag-buch-optionsstrategien-praxis.html" },
  {   title:"Strategisch Investieren mit Aktienoptionen",   titleEn:"Strategisch Investieren mit Aktienoptionen",   cat:"Bücher",   cover:"img/covers/strategisch-investieren-aktienoptionen.jpg",   buyUrl:"https://www.amazon.de/dp/1491065850",   subcat:"optionen",   date:"2026-07-20",   excerpt:"Konservativer Vermögenszuwachs mit Stillhaltergeschäften: eines der meistempfohlenen deutschsprachigen Einstiegsbücher zum Optionshandel.",   excerptEn:"Conservative wealth growth through premium-selling: one of the most frequently recommended German-language introductions to options trading.",   tags:["Bücher","Optionen","Finanzen"],   link:"beitrag-buch-strategisch-investieren-aktienoptionen.html" },
  {   title:"Optionen unschlagbar handeln",   titleEn:"Optionen unschlagbar handeln",   cat:"Bücher",   cover:"img/covers/optionen-unschlagbar-handeln.jpg",   buyUrl:"https://www.amazon.de/dp/B09GZPV1NL",   subcat:"optionen",   date:"2026-07-20",   excerpt:"Eine selbst verlegte Rolltechnik-Strategie für den Optionshandel — mit großspurigem Titel, der genauer betrachtet werden sollte, als er klingt.",   excerptEn:"A self-published rolling-technique strategy for options trading — with a bold title that deserves closer scrutiny than it first suggests.",   tags:["Bücher","Optionen","Finanzen"],   link:"beitrag-buch-optionen-unschlagbar-handeln.html" },
  {   title:"Der Schwarze Schwan",   titleEn:"The Black Swan",   cat:"Bücher",   cover:"img/covers/schwarzer-schwan.jpg",   buyUrl:"https://www.amazon.de/dp/3446415688",   subcat:"vermoegensaufbau-mindset",   date:"2026-07-20",   excerpt:"Warum seltene, unvorhersehbare Ereignisse die Geschichte prägen — und weshalb Standard-Statistik das reale Risiko systematisch unterschätzt.",   excerptEn:"Why rare, unpredictable events shape history — and why standard statistics systematically underestimate real-world risk.",   tags:["Bücher","Mindset","Risiko"],   link:"beitrag-buch-schwarzer-schwan.html" },
  {   title:"Dein Finanz-Cockpit: 10 Performance-Uhren zum Ausdrucken und Selbst-Testen",   titleEn:"Your Finance Cockpit: 10 Performance Gauges to Print and Test Yourself",   cat:"Finanzen",   subcat:"vermoegen",   date:"2026-07-19",   excerpt:"Zehn Tacho-Uhren wie beim Auto: linker Anschlag 0%, rechter Anschlag 100% erreichtes Ziel — inklusive Einkommensmix und Arbeitszeit-Reduktion im Job. Eigene Zahlen eintragen, Nadel bewegt sich live, ausdrucken und manuell weiterführen.",   excerptEn:"Ten car-tachometer-style gauges: left stop 0%, right stop 100% goal reached — including income mix and job-hour reduction. Enter your own numbers, watch the needle move live, print it out and keep tracking by hand.",   tags:["Finanzen","Vermögensaufbau","FIRE","Tool"],   link:"beitrag-performance-uhren-cockpit.html" },
  {   title:"5 „Scheinvermögen\u201c, die 99% der Mittelschicht kaufen — eingeordnet",   titleEn:"5 'Fake Assets' 99% of the Middle Class Buys — A Closer Look",   cat:"Finanzen",   subcat:"learning",   date:"2026-07-19",   excerpt:"Ein virales YouTube-Video, im Namen von Charlie Munger erzählt, listet fünf Alltagskäufe, die angeblich Vermögen zerstören. Wir ordnen die Herkunft ein und rechnen die Beispiele nach.",   excerptEn:"A viral YouTube video, narrated in Charlie Munger's name, lists five everyday purchases said to quietly destroy wealth. We check the source and redo the math.",   tags:["Finanzen","Learning","Sparen","Mindset"],   link:"beitrag-scheinvermoegen-fuenf-fallen.html" },
  {   title:"Dramatische Aktien-Steigerungen: US-Tech-Werte gegen fossile Rohstoff-Werte — wie Tech zwischen 1998 und 2025 den Olymp erobert hat",   titleEn:"Dramatic Stock Surges: US Tech Stocks vs. Fossil Fuel Stocks — How Tech Conquered the Summit Between 1998 and 2025",   cat:"Finanzen",   subcat:"learning",   date:"2026-07-19",   excerpt:"Eine selbst gebaute Farbtabelle zeigt, wie sich die 30 wertvollsten Unternehmen der Welt von 1998 bis 2025 verschoben haben — von Öl und Telekom zu sieben grün markierten Tech-Riesen, mit Nokia als mahnendem Gegenbeispiel.",   excerptEn:"A hand-built color chart shows how the world's 30 most valuable companies shifted from 1998 to 2025 — from oil and telecom to seven green-marked tech giants, with Nokia as a cautionary counter-example.",   tags:["Finanzen","Learning","Marktkapitalisierung","Nokia"],   link:"beitrag-marktbewegung-in-farbe.html" },
  {   title:"Aktien nach Marktkapitalisierung auswählen: Die 25 wertvollsten Unternehmen der Welt",   titleEn:"Picking Stocks by Market Cap: The World's 25 Most Valuable Companies",   cat:"Finanzen",   subcat:"etf",   date:"2026-07-19",   excerpt:"Marktkapitalisierung als Auswahlkriterium für Aktien: warum große Unternehmen die Stütze jedes Index und jedes ETFs sind, plus eine aktualisierte Top-25-Liste mit Land und Marktwert.",   excerptEn:"Market capitalization as a stock-selection criterion: why large companies are the backbone of every index and ETF, plus an updated top-25 list with country and market value.",   tags:["Finanzen","ETF","Aktien","Marktkapitalisierung"],   link:"beitrag-top-marktkapitalisierung.html" },
  {   title:"Die sechs Schritte zum Ziel: Aus einem Wunsch einen Plan machen",   titleEn:"The Six Steps to a Goal: Turning a Desire Into a Plan",   cat:"FIRE",   subcat:"allgemein",   date:"2026-07-19",   excerpt:"Napoleon Hills konkrete Methode aus Think and Grow Rich, ein finanzielles Ziel von einer vagen Idee in einen schriftlich fixierten Plan zu verwandeln — mit FIRE-Tipps zu jedem Schritt und einem Generator für die eigene Zieldeklaration.",   excerptEn:"Napoleon Hill's concrete method from Think and Grow Rich for turning a financial goal from a vague idea into a written plan — with FIRE tips for each step and a generator for your own declaration of desire.",   tags:["FIRE","Mindset","Ziele","Napoleon Hill"],   link:"beitrag-sechs-schritte-zum-ziel.html" },
  {   title:"Die 13 Erfolgsgesetze nach Napoleon Hill: Von der Theorie zur FIRE-Praxis",   titleEn:"Napoleon Hill's 13 Success Principles: From Theory to FIRE Practice",   cat:"FIRE",   subcat:"allgemein",   date:"2026-07-19",   excerpt:"Alle 13 Erfolgsgesetze aus Think and Grow Rich einzeln erklärt, mit konkreten Tipps für den eigenen Weg zur finanziellen Unabhängigkeit — plus die sechs Gespenster der Angst und wie man ihnen finanziell begegnet.",   excerptEn:"All 13 success principles from Think and Grow Rich explained one by one, with concrete tips for your own path to financial independence — plus the six ghosts of fear and how to counter them financially.",   tags:["FIRE","Mindset","Erfolg","Napoleon Hill"],   link:"beitrag-13-erfolgsgesetze.html" },
  {   title:"Börsenweisheiten zum Ziehen: Ein Zitate-Quartett für Investoren",   titleEn:"Market Wisdom to Draw: A Quote Deck for Investors",   cat:"Minimalismus",   subcat:"motivation",   date:"2026-07-19",   excerpt:"52 Investoren- und Geld-Zitate von Kostolany bis Buffett, als Slot-Maschinen-Karussell zum Durchscrollen, Ziehen und Sammeln.",   excerptEn:"52 investing and money quotes from Kostolany to Buffett, as a slot-machine carousel to scroll, draw, and collect.",   tags:["Minimalismus","Motivation","Zitate","Mindset"],   link:"beitrag-boersenweisheiten.html" },
  {   title:"Der Startschuss: Wie aus einem Kurssturz meine Dividendenstrategie wurde",   titleEn:"The Starting Signal: How a Crash Turned Into My Dividend Strategy",   cat:"Finanzen",   subcat:"portfolio",   date:"2026-07-17",   excerpt:"Vom ersten Aktienkauf kurz vor 9/11 über Jahre auf dem Tagesgeldkonto bis zum Umbau des Depots im Oktober 2017: wie ein Zeitungsartikel über monatliche Dividenden meine Anlagestrategie verändert hat.",   excerptEn:"From a first stock purchase right before 9/11, through years parked in savings accounts, to rebuilding the portfolio in October 2017: how one magazine article about monthly dividends changed my investing strategy.",   tags:["Finanzen","Portfolio","Dividenden","Persönlich"],   link:"beitrag-startschuss-dividendenstrategie.html" },
  {   title:"ETF-Watchlist: 23 Dividenden- und Themen-ETFs im TER-Vergleich",   titleEn:"ETF Watchlist: 23 Dividend and Theme ETFs Compared by TER",   cat:"Finanzen",   subcat:"etf",   date:"2026-07-17",   excerpt:"23 Dividenden-, Immobilien- und Anleihen-ETFs im Überblick: WKN, TER und Ausschüttungsrhythmus, sortiert nach Typ — als Ausgangspunkt für die eigene Recherche auf justETF.",   excerptEn:"23 dividend, real estate, and bond ETFs at a glance: WKN, TER, and payout frequency, sorted by type — a starting point for your own research on justETF.",   tags:["Finanzen","ETF","Dividenden","TER"],   link:"beitrag-etf-watchlist-dividenden.html" },
  {   title:"Secrets of the Millionaire Mind — T. Harv Eker",   titleEn:"Secrets of the Millionaire Mind — T. Harv Eker",   cat:"Bücher",   cover:"img/covers/secrets-of-the-millionaire-mind.jpg",   buyUrl:"https://www.amazon.de/dp/0060763280",   subcat:"vermoegensaufbau-mindset",   date:"2026-07-18",   excerpt:"Das Konzept des „money blueprint“: unbewusste, in der Kindheit geprägte Geld-Glaubenssätze, die den finanziellen Erfolg begrenzen. Plakativ im Stil, aber ein guter Ausgangspunkt, um die eigene Geld-Prägung zu hinterfragen.",   excerptEn:"The 'money blueprint' concept: unconscious, childhood-shaped beliefs about money that limit financial success. Heavy-handed in style, but a good starting point for questioning your own money conditioning.",   tags:["Bücher","Mindset","Geld-Glaubenssätze"],   link:"beitrag-buch-secrets-of-the-millionaire-mind.html" },
  {   title:"Think and Grow Rich — Napoleon Hill",   titleEn:"Think and Grow Rich — Napoleon Hill",   cat:"Bücher",   cover:"img/covers/think-and-grow-rich.jpg",   buyUrl:"https://www.amazon.de/dp/1585424331",   subcat:"vermoegensaufbau-mindset",   date:"2026-07-18",   excerpt:"Der Klassiker von 1937: brennender Wunsch, klares Ziel und wiederholte Autosuggestion als Erfolgsformel. Stark esoterisch gefärbt, aber die direkte Vorlage für fast die gesamte spätere Mindset- und Selbsthilfe-Literatur.",   excerptEn:"The 1937 classic: burning desire, a clear goal, and repeated autosuggestion as a success formula. Heavily esoteric, but the direct template for nearly all later mindset and self-help literature.",   tags:["Bücher","Mindset","Klassiker"],   link:"beitrag-buch-think-and-grow-rich.html" },
  {   title:"The Simple Path to Wealth — JL Collins",   titleEn:"The Simple Path to Wealth — JL Collins",   cat:"Bücher",   cover:"img/covers/simple-path-to-wealth.jpg",   buyUrl:"https://www.amazon.de/dp/1533667926",   subcat:"vermoegensaufbau-mindset",   date:"2026-07-18",   excerpt:"Eine radikal einfache Anlagestrategie: hohe Sparquote, Schuldenfreiheit und ein einziger breit gestreuter Indexfonds statt Stock-Picking und Market-Timing. Bewusster Gegenentwurf zu einer komplexitätsverliebten Finanzbranche.",   excerptEn:"A radically simple investing strategy: a high savings rate, no debt, and a single broad index fund instead of stock picking and market timing. A deliberate counterpoint to a finance industry in love with complexity.",   tags:["Bücher","ETF","Sparquote"],   link:"beitrag-buch-simple-path-to-wealth.html" },
  {   title:"The Millionaire Next Door — Thomas J. Stanley & William D. Danko",   titleEn:"The Millionaire Next Door — Thomas J. Stanley & William D. Danko",   cat:"Bücher",   cover:"img/covers/millionaire-next-door.jpg",   buyUrl:"https://www.amazon.de/dp/0671015206",   subcat:"vermoegensaufbau-mindset",   date:"2026-07-18",   excerpt:"Eine Datenauswertung echter US-Millionäre widerlegt das Klischee vom protzigen Reichtum: die meisten leben unauffällig und sparen konsequent. Der stärkste gemeinsame Faktor ist die Sparquote, nicht die Gehaltshöhe.",   excerptEn:"A data analysis of real US millionaires debunks the flashy-wealth cliché: most live modestly and save relentlessly. The strongest common factor is the savings rate, not the salary level.",   tags:["Bücher","Sparquote","Studie"],   link:"beitrag-buch-millionaire-next-door.html" },
  {   title:"Zero to One — Peter Thiel",   titleEn:"Zero to One — Peter Thiel",   cat:"Bücher",   cover:"img/covers/zero-to-one.jpg",   buyUrl:"https://www.amazon.de/dp/0804139296",   subcat:"vermoegensaufbau-mindset",   date:"2026-07-17",   excerpt:"Warum echter Fortschritt nicht aus Wettbewerb entsteht, sondern aus dem Aufbau temporärer Monopole. Sieben zentrale Fragen für Gründer — nützlich auch, um Geschäftsmodelle vor einer Einzelaktien-Investition besser einzuschätzen.",   excerptEn:"Why real progress doesn't come from competition, but from building temporary monopolies. Seven key questions for founders — also useful for assessing business models before investing in individual stocks.",   tags:["Bücher","Unternehmertum","Investieren"],   link:"beitrag-buch-zero-to-one.html" },
  {   title:"Psycho-Kybernetik — Maxwell Maltz",   titleEn:"Psycho-Cybernetics — Maxwell Maltz",   cat:"Bücher",   cover:"img/covers/psycho-kybernetik.jpg",   buyUrl:"https://www.amazon.de/dp/0399176136",   subcat:"vermoegensaufbau-mindset",   date:"2026-07-17",   excerpt:"Warum das Selbstbild der eigentliche Steuerungsmechanismus für Erfolg ist und mentale Visualisierung neurologisch wie echtes Training wirkt. Der Ursprungstext hinter fast der gesamten späteren Erfolgsliteratur — inklusive Think and Grow Rich und Secrets of the Millionaire Mind.",   excerptEn:"Why self-image is the real control mechanism for success, and why mental visualization works neurologically like actual practice. The source text behind nearly all later success literature — including Think and Grow Rich and Secrets of the Millionaire Mind.",   tags:["Bücher","Mindset","Psychologie"],   link:"beitrag-buch-psycho-kybernetik.html" },
  {   title:"Weltordnung im Wandel — Ray Dalio",   titleEn:"The Changing World Order — Ray Dalio",   cat:"Bücher",   cover:"img/covers/weltordnung-im-wandel.jpg",   buyUrl:"https://www.amazon.de/dp/1982160276",   subcat:"macht-einfluss",   date:"2026-07-17",   excerpt:"500 Jahre Wirtschaftsgeschichte destilliert zu einem zyklischen Muster aus Verschuldung, Leitwährungsstatus und Machtverschiebung — mit direktem Bezug zu den USA und China. Kein Einsteigerbuch, aber lohnend für Makro-interessierte Anleger.",   excerptEn:"500 years of economic history distilled into a cyclical pattern of debt, reserve-currency status, and shifting power — with direct reference to the US and China. Not a beginner's book, but rewarding for macro-minded investors.",   tags:["Bücher","Makroökonomie","Geopolitik"],   link:"beitrag-buch-weltordnung-im-wandel.html" },
  {   title:"Die 48 Gesetze der Macht — Robert Greene",   titleEn:"The 48 Laws of Power — Robert Greene",   cat:"Bücher",   cover:"img/covers/48-gesetze-der-macht.jpg",   buyUrl:"https://www.amazon.de/dp/0140280197",   subcat:"macht-einfluss",   date:"2026-07-17",   excerpt:"48 in sich geschlossene Machtprinzipien mit historischen Fallbeispielen von Machiavelli bis Mao. Bewusst amoralisch gehalten — eher Nachschlagewerk als Buch zum Durchlesen, nützlich für Verhandlung und Führung.",   excerptEn:"48 self-contained laws of power with historical case studies from Machiavelli to Mao. Deliberately amoral — more a reference work than a cover-to-cover read, useful for negotiation and leadership.",   tags:["Bücher","Strategie","Macht"],   link:"beitrag-buch-48-gesetze-der-macht.html" },
  {   title:"Influence — Robert B. Cialdini",   titleEn:"Influence — Robert B. Cialdini",   cat:"Bücher",   cover:"img/covers/influence.jpg",   buyUrl:"https://www.amazon.de/dp/006124189X",   subcat:"macht-einfluss",   date:"2026-07-17",   excerpt:"Sechs psychologische Hebel, die uns fast automatisch zum Ja bewegen — Reziprozität, Knappheit, soziale Bewährtheit und mehr, belegt mit Experimenten. Nützlich, um zu erkennen, wann Finanzprodukte genau diese Tricks nutzen.",   excerptEn:"Six psychological triggers that push us toward an almost automatic yes — reciprocity, scarcity, social proof and more, backed by experiments. Useful for spotting when financial products lean on exactly these tricks.",   tags:["Bücher","Psychologie","Verhalten"],   link:"beitrag-buch-influence.html" },
  {   title:"Souverän investieren mit Indexfonds und ETFs — Gerd Kommer",   titleEn:"Souverän investieren mit Indexfonds und ETFs — Gerd Kommer",   cat:"Bücher",   cover:"img/covers/souveraen-investieren-etfs-7aufl.jpg",   buyUrl:"https://www.amazon.de/dp/3593520648",   subcat:"vermoegensaufbau-mindset",   date:"2026-07-16",   excerpt:"Das deutschsprachige Standardwerk zum passiven Investieren (7., aktualisierte Auflage): warum aktives Fondsmanagement langfristig meist verliert, wie eine simple Welt-ETF-Strategie aussieht, und was Studien wirklich über Markttiming sagen.",   excerptEn:"The German-language standard reference on passive investing (7th, updated edition): why active fund management tends to lose out long-term, what a simple world-ETF strategy looks like, and what the research really says about market timing.",   tags:["Bücher","ETF","Geldanlage"],   link:"beitrag-buch-souveraen-investieren.html" },
  {   title:"Der Weg zur finanziellen Freiheit — Bodo Schäfer",   titleEn:"Der Weg zur finanziellen Freiheit — Bodo Schäfer",   cat:"Bücher",   cover:"img/covers/weg-zur-finanziellen-freiheit.jpg",   buyUrl:"https://www.amazon.de/dp/3423340002",   subcat:"vermoegensaufbau-mindset",   date:"2026-07-16",   excerpt:"Der deutsche Klassiker zum Thema Vermögensaufbau: das Prinzip der drei Konten, warum Schulden zuerst weg müssen, und wie eine Sparquote zur Gewohnheit statt zur Anstrengung wird.",   excerptEn:"The German classic on building wealth: the three-account principle, why debt needs to go first, and how a savings rate becomes a habit instead of a struggle.",   tags:["Bücher","Vermögensaufbau","Mindset"],   link:"beitrag-buch-weg-zur-finanziellen-freiheit.html" },
  {   title:"Rich Dad Poor Dad — Robert T. Kiyosaki",   titleEn:"Rich Dad Poor Dad — Robert T. Kiyosaki",   cat:"Bücher",   cover:"img/covers/rich-dad-poor-dad.jpg",   buyUrl:"https://www.amazon.de/dp/1612680194",   subcat:"vermoegensaufbau-mindset",   date:"2026-07-16",   excerpt:"Der US-Bestseller, der eine ganze Generation für Finanzbildung sensibilisiert hat: der Unterschied zwischen Vermögenswerten und Verbindlichkeiten, erklärt anhand zweier gegensätzlicher Vater-Figuren.",   excerptEn:"The US bestseller that got an entire generation thinking about financial literacy: the difference between assets and liabilities, told through two contrasting father figures.",   tags:["Bücher","Mindset","Vermögensaufbau"],   link:"beitrag-buch-rich-dad-poor-dad.html" },
  {   title:"Der reichste Mann von Babylon — George S. Clason",   titleEn:"The Richest Man in Babylon — George S. Clason",   cat:"Bücher",   cover:"img/covers/reichste-mann-von-babylon.jpg",   buyUrl:"https://www.amazon.de/dp/3442163838",   subcat:"vermoegensaufbau-mindset",   date:"2026-07-16",   excerpt:"Zeitlose Finanzweisheiten verpackt in Parabeln aus dem alten Babylon: warum ein Zehntel des Einkommens immer zuerst zurückgelegt gehört, und wie einfache Prinzipien auch nach fast 100 Jahren noch tragen.",   excerptEn:"Timeless money wisdom wrapped in parables from ancient Babylon: why a tenth of your income should always be set aside first, and how simple principles still hold up after almost 100 years.",   tags:["Bücher","Klassiker","Sparen"],   link:"beitrag-buch-reichste-mann-von-babylon.html" },
  {   title:"Die Revolution der Geldanlage — Gottfried Heller",   titleEn:"The Revolution in Investing — Gottfried Heller",   cat:"Bücher",   cover:"img/covers/revolution-der-geldanlage.jpg",   buyUrl:"https://www.amazon.de/dp/3959723733",   subcat:"vermoegensaufbau-mindset",   date:"2026-07-25",   excerpt:"Ein langjähriger Weggefährte André Kostolanys erklärt, warum passive Indexfonds für die meisten Privatanleger die bessere Wahl sind als aktiv gemanagte Fonds. 3., aktualisierte Auflage.",   excerptEn:"A longtime associate of André Kostolany explains why passive index funds are the better choice for most private investors than actively managed funds. 3rd, updated edition.",   tags:["Bücher","ETF","Geldanlage"],   link:"beitrag-buch-revolution-geldanlage.html" },
  {   title:"Rente mit 40 — Florian Wagner",   titleEn:"Retiring at 40 — Florian Wagner",   cat:"Bücher",   cover:"img/covers/rente-mit-40.jpg",   buyUrl:"https://www.amazon.de/dp/3430210178",   subcat:"vermoegensaufbau-mindset",   date:"2026-07-25",   excerpt:"Wie ein Ingenieur als Frugalist mit bewusstem Konsum, hoher Sparquote und einfachen ETFs auf dem Weg zur finanziellen Unabhängigkeit mit 40 ist. Mit Vorwort von Oliver Noelting.",   excerptEn:"How an engineer, living as a frugalist, is working toward financial independence at 40 through conscious spending, a high savings rate, and simple ETFs. With a foreword by Oliver Noelting.",   tags:["Bücher","FIRE","Frugalismus","Mindset"],   link:"beitrag-buch-rente-mit-40.html" },
  {   title:"Das Verlust-Paradox: Warum 50% Minus einen Gewinn von 100% braucht",   titleEn:"The Loss Paradox: Why a 50% Drop Needs a 100% Gain",   cat:"Finanzen",   subcat:"rendite",   date:"2026-07-15",   excerpt:"Warum Verluste psychologisch mehr wiegen als gleich große Gewinne, warum ein Minus von 50% einen Gewinn von 100% zum Ausgleich braucht, und was die 72er-Regel über Verdopplungszeiten verrät — mit zwei interaktiven Rechnern.",   excerptEn:"Why losses weigh more psychologically than equal gains, why a 50% drop needs a 100% gain to break even, and what the Rule of 72 reveals about doubling times — with two interactive calculators.",   tags:["Finanzen", "Rendite", "Psychologie", "Verlustaversion"],   link:"beitrag-verlust-gewinn-paradox.html" },
  {   title:"REIT-ETF vs. physische Immobilie als Kapitalanlage",   titleEn:"REIT-ETF vs. Physical Property as an Investment",   cat:"Finanzen",   subcat:"immobilien",   date:"2026-07-15",   excerpt:"Leverage, Steuern, Aufwand und Klumpenrisiko: Was eine fremdfinanzierte Mietimmobilie wirklich von einem bar gekauften REIT-ETF unterscheidet — mit Rechner, der den Hebeleffekt auf dein eigenes Kapital zeigt.",   excerptEn:"Leverage, taxes, effort, and concentration risk: what really separates a financed rental property from a cash-bought REIT-ETF — with a calculator showing the leverage effect on your own capital.",   tags:["Finanzen", "Immobilien", "REIT", "Leverage"],   link:"beitrag-reit-etf-vs-immobilie.html" },
  {   title:"Anlage KAP einfach erklärt: Wann sich die Steuererklärung für Kapitalerträge lohnt",   titleEn:"Anlage KAP Explained: When Filing for Capital Gains Actually Pays Off",   cat:"Finanzen",   subcat:"steuer",   date:"2026-07-15",   excerpt:"Wann die Anlage KAP Pflicht ist, wann sie sich freiwillig lohnt (Günstigerprüfung, Verlustverrechnung über Banken hinweg) — mit Rechner, ab welchem Einkommen sich die Günstigerprüfung auszahlt.",   excerptEn:"When filing the Anlage KAP is mandatory, when it pays off voluntarily (favourable-treatment check, cross-bank loss offsetting) — with a calculator for the income level where it starts paying off.",   tags:["Finanzen", "Steuer", "Anlage KAP", "Günstigerprüfung"],   link:"beitrag-anlage-kap.html" },
  {   title:"Der Meterstock-Test: Der Kühlschrank-Tipp, der alles in Perspektive setzt",   titleEn:"The Metre Stick Test: The Fridge Reminder That Puts Everything in Perspective",   cat:"Minimalismus",   subcat:"motivation",   date:"2026-07-25",   excerpt:"Ein Papier-Meterstock aus dem Einrichtungshaus, dein Alter, die Lebenserwartung — und was du mit dem Rest machst. Die einfachste Übung für Dringlichkeit.",   excerptEn:"A paper tape measure from a furniture store, your age, life expectancy — and what you do with the rest. The simplest exercise for life urgency.",   tags:["Motivation","Zeitmanagement","Lebensstil","FIRE","Persönlichkeitsentwicklung"],   link:"beitrag-meterstock-lebenszeit.html" },
  {   title:"Geld ist Lebenszeit: Was Erben wirklich erben",   titleEn:"Money Is Life Time: What Heirs Really Inherit",   cat:"Minimalismus",   subcat:"motivation",   date:"2026-07-11",   excerpt:"Geld ist gespeicherte Lebenszeit — verdient durch Arbeitsstunden, entwertet durch Inflation. Und eine Erbschaft ist eigentlich die umgewandelte Lebenszeit eines anderen Menschen.",   excerptEn:"Money is stored life time — earned through work hours, drained by inflation. And an inheritance is really someone else's converted life time.",   tags:["Motivation","Lebenszeit","Erbschaft","Inflation","Vermögensaufbau"],   link:"beitrag-geld-ist-lebenszeit.html" },
  {   title:"Die 7 Wege zur Effektivität — Stephen R. Covey",   titleEn:"The 7 Habits of Highly Effective People — Stephen R. Covey",   cat:"Bücher",   cover:"img/covers/sieben-wege-effektivitaet.jpg",   buyUrl:"https://www.amazon.de/dp/3897495732",   subcat:"vermoegensaufbau-mindset",   date:"2026-07-25",   excerpt:"Buchrezension: Die sieben Prinzipien, die den Unterschied zwischen Reaktion und Gestaltung des eigenen Lebens ausmachen. Das wichtigste Buch über persönliche Effektivität.",   excerptEn:"Book review: Seven principles that make the difference between reacting and shaping your own life. The most important book on personal effectiveness.",   tags:["Bücher","Persönlichkeitsentwicklung","Zeitmanagement","Motivation","vermoegensaufbau-mindset"],   link:"beitrag-buch-sieben-wege-effektivitaet.html" },
  {   title:"Wie viele Jahre musst du sparen? Die Renten-Heatmap.",   titleEn:"How Many Years Do You Need to Save? The Retirement Heat Map.",   cat:"Finanzen",   subcat:"rendite",   date:"2026-07-24",   excerpt:"Zwei Zahlen bestimmen, wie lange du arbeiten musst: monatliche Sparrate und gewünschte Jahresausgaben im Alter. Interaktive Farbmatrix — von grün bis rot — plus persönlichem Rechner mit Rendite-Schieberegler.",   excerptEn:"Two numbers determine how long you have to work: monthly savings rate and desired annual spending in retirement. Interactive colour heat map — from green to red — plus a personal calculator with return slider.",   tags:["FIRE","Rente","Sparrate","Zinseszins","Rechner","Finanzen"],   link:"beitrag-rente-sparjahre.html" },
  {   title:"MSCI World vs. FTSE All-World vs. ACWI — und was ist eigentlich ein Geldmarkt-ETF?",   titleEn:"MSCI World vs. FTSE All-World vs. ACWI — and What Is a Money Market ETF?",   cat:"Finanzen",   subcat:"vergleich",   date:"2026-07-24",   excerpt:"Die zwei Begriffspaare, die Anfänger am häufigsten irritieren: MSCI World vs. FTSE All-World vs. MSCI ACWI (die Schwellenländer-Frage), und Geldmarkt-ETF vs. Tagesgeld (wann welches Sinn ergibt).",   excerptEn:"The two pairs of terms that most confuse beginners: MSCI World vs. FTSE All-World vs. MSCI ACWI (the emerging markets question), and money market ETF vs. savings account (when each makes sense).",   tags:["Finanzen","ETF","MSCI World","FTSE All-World","Geldmarkt-ETF","Tagesgeld","Anfänger","ZERO_TO_HERO"],   link:"beitrag-msci-world-vs-ftse-all-world.html" },
  {   title:"Notgroschen: Wie viel Cash-Reserve wirklich Sinn macht",   titleEn:"Emergency Fund: How Much Cash Reserve Actually Makes Sense",   cat:"Finanzen",   subcat:"girokonto",   date:"2026-07-24",   excerpt:"Notgroschen erklärt: 3–6× Nettogehalt, Trade Republic Tagesgeld 2,25%, Bondora Go & Grow (~6% P2P, kein Einlagenschutz), kurzfristige Staatsanleihen — und warum erst Schulden weg.",   excerptEn:"Emergency fund explained: 3–6× net salary, Trade Republic 2.25%, Bondora Go & Grow (~6% P2P, no deposit guarantee), short-term bonds — and why debt comes first.",   tags:["Finanzen","Notgroschen","Tagesgeld","Bondora","Trade Republic","ZERO_TO_HERO"],   link:"beitrag-notgroschen.html" },
  {   title:"ETF-Sparplan im Vergleich: Trade Republic, Scalable, Consorsbank, Smartbroker+",   titleEn:"ETF Savings Plan Compared: Trade Republic, Scalable, Consorsbank, Smartbroker+",   cat:"Finanzen",   subcat:"vergleich",   date:"2026-07-14",   excerpt:"Trade Republic, Scalable Capital, Consorsbank und Smartbroker+ im Sparplan-Gebührenvergleich: Ausführungsgebühr, Mindestrate, ETF-Angebot — plus Rechner, was ein paar Euro Gebühr über 25 Jahre kosten.",   excerptEn:"Trade Republic, Scalable Capital, Consorsbank, and Smartbroker+ compared on savings-plan fees: execution cost, minimum rate, ETF range — plus a calculator for what a few euros in fees cost over 25 years.",   tags:["Finanzen", "ETF", "Sparplan", "Neobroker","ZERO_TO_HERO"],   link:"beitrag-neobroker-etf-vergleich.html" },
  {   title:"Geld darf kein Geld kosten: Kleingeld loswerden, ohne dafür zu zahlen",   titleEn:"Money Should Never Cost Money: Get Rid of Coins Without Paying a Fee",   cat:"Finanzen",   subcat:"vermoegen",   date:"2026-07-14",   excerpt:"Münzzählautomaten behalten 5 bis 6 Prozent für sich, nur um dein eigenes Geld zu zählen. Die kostenlose Alternative an der Selbstbedienungskasse — plus Rechner, was die Gebühr dich über die Jahre wirklich kostet.",   excerptEn:"Coin-counting machines keep 5 to 6 percent just for counting your own money. The free alternative at the self-checkout — plus a calculator showing what that fee really costs you over the years.",   tags:["Finanzen", "Vermögen", "Kleingeld", "Gebühren"],   link:"beitrag-muenzen-kostenlos-tauschen.html" },
  {   title:"Girokonto, Tagesgeld, Depot: Warum du bei der Filialbank zu viel zahlst",   titleEn:"Checking Account, Savings & Portfolio: Why You're Overpaying at Your Branch Bank",   cat:"Finanzen",   subcat:"vergleich",   date:"2026-07-14",   excerpt:"Wer seit Jahren bei Sparkasse oder Volksbank ist, zahlt oft 5 bis 15 Euro Kontoführung im Monat, ohne es zu hinterfragen. Ab wann sich ein Wechsel lohnt, was kostenlose Alternativen wie Consorsbank und Trade Republic bieten — mit Rechner für deine eigene Ersparnis.",   excerptEn:"If you've been with a branch bank for years, you're often paying 5 to 15 euros a month in account fees without questioning it. When switching pays off, what free alternatives like Consorsbank and Trade Republic offer – with a calculator for your own savings.",   tags:["Finanzen", "Girokonto", "Tagesgeld", "Neobroker","ZERO_TO_HERO"],   link:"beitrag-girokonto-vergleich.html" },
  {   title:"Raus aus dem Autopilot: Wie kleine Habit-Switches deinen Horizont erweitern",   titleEn:"Out of Autopilot: How Tiny Habit Switches Widen Your Horizon",   cat:"Minimalismus",   subcat:"motivation",   date:"2026-07-14",   excerpt:"Komfortzone verlassen, Horizont erweitern — das hört man ständig, aber was heißt das konkret? Kleine, alltägliche Gewohnheits-Switches als Türöffner, plus ein Kartenspiel mit über 20 Mikro-Habit-Ideen.",   excerptEn:"Leave your comfort zone, widen your horizon — you hear it constantly, but what does it actually mean? Small everyday habit switches as a door-opener, plus a card game with 20+ micro-habit ideas.",   tags:["Minimalismus", "Motivation", "Gewohnheiten", "Achtsamkeit"],   link:"beitrag-horizont-micro-habits.html" },
  {   title:"Zeit als Freund: Warum 30 Euro mit 25 mehr wert sind als 300 Euro mit 55",   titleEn:"Time Is Your Friend: Why €30 at 25 Beats €300 at 55",   cat:"Finanzen",   subcat:"vermoegen",   date:"2026-07-13",   excerpt:"Zeit ist kein Gegner, sondern der stärkste Verbündete beim Vermögensaufbau. Warum ein 25-Jähriger entspannt mit 30 Euro starten kann und ein 55-Jähriger für dieselbe Rentenlücke deutlich mehr stemmen muss — mit zwei interaktiven Rechnern.",   excerptEn:"Time isn't the enemy of building wealth — it's the strongest ally you have. Why a 25-year-old can start relaxed with €30, while a 55-year-old needs to work far harder to close the same pension gap — with two interactive calculators.",   tags:["Finanzen", "Vermögen", "Rendite", "Rente", "Zinseszins"],   link:"beitrag-zeit-ist-dein-freund.html" },
  {   title:"Der Abreißblock: Dein Geld als Notizblock zum Abreißen",   titleEn:"The Tear-Off Block: Turn Cash Into a Notepad You Peel Bills From",   cat:"Minimalismus",   subcat:"budget",   date:"2026-07-13",   excerpt:"15 bis 20 knackfrische 5-Euro-Scheine, hinten wie ein Notizblock gebunden — und jeder Schein lässt sich abreißen wie ein Post-it. Anleitung, Ideen und ein interaktives Abreiß-Widget.",   excerptEn:"15 to 20 crisp new €5 notes, bound at the back like a notepad — every note peels off just like a Post-it. Instructions, ideas, and an interactive tear-off widget.",   tags:["Minimalismus", "Budget", "DIY", "Cash"],   link:"beitrag-abreissblock-geldscheine.html" },
  {   title:"Der Cashbaum: Ein Wäscheklammer-Brett, das dich mit Geld umgibt",   titleEn:"The Cash Tree: A DIY Clothespin Board That Surrounds You With Money",   cat:"Minimalismus",   subcat:"budget",   date:"2026-07-13",   excerpt:"Ein Holzbrett, sieben Wäscheklammern, ein bisschen Sekundenkleber: Bau dir einen Cashbaum, an dem echte Scheinbündel hängen — mit Anleitung und interaktivem Bündel-Widget.",   excerptEn:"One wooden board, seven clothespins, a bit of super glue: build yourself a cash tree with real bundles of banknotes clipped on — with instructions and an interactive bundle widget.",   tags:["Minimalismus", "Budget", "DIY", "Cash"],   link:"beitrag-cashbaum-waescheklammern.html" },
  {   title:"Was ein Single-Haushalt wirklich kostet: Meilensteine & die 1-Euro-Challenge",   titleEn:"What Living Alone Really Costs: Milestones & the €1 Doubling Challenge",   cat:"Minimalismus",   subcat:"budget",   date:"2026-07-12",   excerpt:"Ein realistisches Beispielbudget für den Single-Haushalt, ein anklickbares Fieberthermometer bis 200.000 € und eine 1-Euro-Verdopplungs-Challenge zum Ausprobieren.",   excerptEn:"A realistic example budget for a single-person household, a clickable fever-thermometer up to €200,000, and a €1 doubling savings challenge to try for yourself.",   tags:["Minimalismus", "Budget", "Meilenstein", "Sparchallenge"],   link:"beitrag-singlehaushalt-budget-challenge.html" },
  {   title:"Mein Depot, sechs Jahre, ungeschönt: Von -29% zum neuen Allzeithoch",   titleEn:"My Portfolio, Six Years, No Filter: From -29% to a New All-Time High",   cat:"Finanzen",   subcat:"portfolio",   date:"2026-07-11",   excerpt:"Die reale Performance meines Depots von August 2020 bis heute: steiler Hype-Anstieg, harter Absturz, zwei Jahre Geduld im Minus, dann neues Allzeithoch bei rund 60%. Plus Rechner für die eigene annualisierte Rendite.",   excerptEn:"My portfolio's real performance from August 2020 to today: a steep hype-driven rise, a hard crash, two years of patience in the red, then a new all-time high around 60%. Plus a calculator for your own annualized return.",   tags:["Depot", "Rendite", "Volatilität"],   link:"beitrag-depot-performance-6-jahre.html" },
  {   title:"Energieeffizienz im Haushalt: Wann Neukauf sich mehr lohnt als das alte Gerät",   titleEn:"Energy Efficiency at Home: When Buying New Beats Keeping the Old One",   cat:"Minimalismus",   subcat:"nachhaltigkeit",   date:"2026-07-11",   excerpt:"Der alte Kühlschrank der Eltern ist nicht kostenlos, wenn er unheimlich viel Strom frisst. Wann sich ein neues, effizientes Gerät nach zwei bis drei Jahren rechnet — mit Amortisationsrechner.",   excerptEn:"Your parents' old fridge isn't really free if it burns through electricity. When a new, efficient appliance pays for itself in two to three years – with an amortization calculator.",   tags:["Minimalismus", "Energie", "Nachhaltigkeit"],   link:"beitrag-energieeffizienz-haushaltsgeraete.html" },
  {   title:"Second-Hand & Vintage: Nachhaltig weniger ausgeben",   titleEn:"Second-Hand & Vintage: The Sustainable Way to Spend Less",   cat:"Minimalismus",   subcat:"nachhaltigkeit",   date:"2026-07-10",   excerpt:"Second-Hand-Laden statt Einzelhandel, Vintage-Möbel statt Neukauf: Wie bewusster gebrauchter Konsum gleichzeitig Geld spart und nachhaltiger ist — mit Rechner zum Ausprobieren.",   excerptEn:"Second-hand shops instead of retail, vintage furniture instead of new: how buying used saves money and is more sustainable at the same time – with a calculator to play around with.",   tags:["Minimalismus", "Nachhaltigkeit", "Konsum"],   link:"beitrag-second-hand-nachhaltigkeit.html" },
  {   title:"Monatssparchallenge: 12 Felder, ein Monat, echtes Geld",   titleEn:"Monthly Savings Challenge: 12 Fields, One Month, Real Money",   cat:"Minimalismus",   subcat:"sparquote",   date:"2026-07-23",   excerpt:"Zwölf Felder, zufällig mit 5 €, 10 € oder 20 € belegt — aufdecken, erledigen, mit einem Klick abhaken. Am Ende des Monats landet der Gesamtbetrag als echtes Geld auf dem Sparkonto. Zum Ausdrucken, Abhaken, Weitergeben.",   excerptEn:"Twelve fields, randomly assigned 5 €, 10 € or 20 € — reveal, complete, tick off with a click. At the end of the month, the total lands as real money in your savings account. Print it, tick it off, share it.",   tags:["Minimalismus", "Sparquote", "Challenge", "Sparchallenge"],   link:"beitrag-monatssparchallenge.html" },
  {   title:"Kleine Ersparnisse, große Wirkung: Mobilfunk, LED & Balkonkraftwerk",   titleEn:"Small Savings, Big Impact: Phone Plan, LED Bulbs & Balcony Solar",   cat:"Minimalismus",   subcat:"sparquote",   date:"2026-07-09",   excerpt:"Handyvertrag wechseln, Glühbirnen gegen LED tauschen, ein Balkonkraftwerk installieren: Wie kleine, sofort wirksame Änderungen zehn, zwanzig, vielleicht hundert Euro im Monat freisetzen — mit Rechner für deine eigene Ersparnis.",   excerptEn:"Switching phone plans, swapping bulbs for LEDs, installing a balcony solar unit: how small, immediately effective changes free up ten, twenty, maybe a hundred euros a month – with a calculator for your own savings.",   tags:["Minimalismus", "Sparquote", "Nebenkosten"],   link:"beitrag-kleine-ersparnisse.html" },
  {   title:"Die 300-Euro-Geldbörse mit Münzspender: Mein einfacher Trick statt Umschlagsystem",   titleEn:"The 300-Euro Wallet with a Coin Dispenser: My Simple Trick Instead of an Envelope System",   cat:"Minimalismus",   subcat:"budget",   date:"2026-07-09",   excerpt:"Kein Umschlagsystem, keine zwanzig Budget-Kategorien: Wie ein fester Bargeldbetrag pro Monat ganz automatisch zeigt, wo zu viel Geld hingeht.",   excerptEn:"No envelope system, no twenty budget categories: how a fixed amount of cash per month automatically shows you where too much money is going.",   tags:["Minimalismus", "Budget", "Bargeld"],   link:"beitrag-bargeld-budget.html" },
  {   title:"Die 50/30/20-Regel: Dein Budget in drei einfachen Teilen",   titleEn:"The 50/30/20 Rule: Your Budget in Three Simple Parts",   cat:"Minimalismus",   subcat:"budget",   date:"2026-07-08",   excerpt:"50 Prozent für Notwendiges, 30 Prozent für Lifestyle, 20 Prozent zum Sparen: die 50/30/20-Regel einfach erklärt, mit Kuchendiagramm und Rechner für dein eigenes Nettoeinkommen.",   excerptEn:"50% for needs, 30% for lifestyle, 20% for savings: the 50/30/20 rule explained simply, with a pie chart and calculator for your own net income.",   tags:["Minimalismus", "Budget", "Sparquote"],   link:"beitrag-50-30-20-regel.html" },
  {   title:"Minimalismus für den Alltag: Warum es nicht ums Baumhaus geht",   titleEn:"Everyday Minimalism: Why It's Not About Living in a Treehouse",   cat:"Minimalismus",   subcat:"budget",   date:"2026-07-07",   excerpt:"Praktischer Minimalismus heißt nicht Verzicht auf alles — sondern das eigene Budget im Griff zu haben. Mit Rechner: wie viel eine höhere Sparquote den Weg zur finanziellen Freiheit verkürzt.",   excerptEn:"Practical minimalism isn't about giving up everything – it's about keeping your budget under control. With a calculator showing how much a higher savings rate shortens the path to financial independence.",   tags:["Minimalismus", "Sparquote", "FIRE"],   link:"beitrag-minimalismus-budget.html" },
  {   title:"Kredite im Vergleich: Der einzige Kredit, der wirklich Sinn ergibt",   titleEn:"Loan Comparison: The Only Loan That Really Makes Sense",   cat:"Finanzen",   subcat:"vergleich",   date:"2026-07-06",   excerpt:"Baufinanzierung, Ratenkredit, Autokredit und Dispo im Effektivzins-Vergleich — plus ein Rechner für die eigene Baufinanzierung inklusive Opportunitätskosten als ETF-Sparplan.",   excerptEn:"Mortgage, personal loan, car loan, and overdraft compared by effective interest rate — plus a mortgage calculator including the opportunity cost of an ETF savings plan.",   tags:["Kredit", "Baufinanzierung", "Zinsen", "ETF"],   link:"beitrag-kreditvergleich.html" },
  {   title:"REITs, Anleihen oder Immobilie: Drei Wege zu stabilem Einkommen im Vergleich",   titleEn:"REITs, Bonds, or Property: Comparing Three Ways to Stable Income",   cat:"Finanzen",   subcat:"immobilien",   date:"2026-07-06",   excerpt:"Direktimmobilie, Bundesanleihe oder Immobilien-ETF (REIT): Ein Vergleich nach Laufzeit, Liquidität, Rendite und Schwankungsbreite — mit interaktivem Rechner.",   excerptEn:"Direct property, government bonds, or REIT ETFs: a comparison by lock-in period, liquidity, return, and volatility — with an interactive calculator.",   tags:["REIT", "Immobilien", "Anleihen", "Liquidität"],   link:"beitrag-reits-vs-immobilien.html" },
  {   title:"ETF-Sparplan mit dem Neobroker: TER, Ausschüttend vs. Thesaurierend",   titleEn:"ETF Savings Plan with a Neobroker: TER, Distributing vs. Accumulating",   cat:"Finanzen",   subcat:"etf",   date:"2026-07-05",   excerpt:"Wie du mit einem Neobroker in Minuten einen ETF-Sparplan einrichtest, was Ausschüttend/Thesaurierend und Replizierend/Synthetisch bedeuten, und warum die TER über Jahrzehnte enorm ins Gewicht fällt.",   excerptEn:"How to set up an ETF savings plan with a neobroker in minutes, what distributing/accumulating and physical/synthetic replication mean, and why the TER matters enormously over decades.",   tags:["ETF", "Sparplan", "TER", "Neobroker","ZERO_TO_HERO"],   link:"beitrag-etf-sparplan.html" },
  {   title:"Die ersten 100.000 Euro: Der Meilenstein, der alles verändert",   titleEn:"The First €100,000: The Milestone That Changes Everything",   cat:"Finanzen",   subcat:"vermoegen",   date:"2026-07-05",   excerpt:"Warum die ersten 100.000 Euro so viel härter sind als jede weitere Etappe danach — mit vier Sparraten-Szenarien und einem interaktiven Rechner.",   excerptEn:"Why the first €100,000 is so much harder than every stretch after it — with four savings-rate scenarios and an interactive calculator.",   tags:["Meilenstein", "Vermögen", "Sparquote", "Rendite","ZERO_TO_HERO"],   link:"beitrag-erste-100k.html" },
  {   title:"Der Meilenstein-Fahrplan: Vom Schuldenberg zur ersten Million",   titleEn:"The Milestone Roadmap: From Debt to Your First Million",   cat:"Finanzen",   subcat:"vermoegen",   date:"2026-07-04",   excerpt:"Neun Meilensteine wie auf einem Spielbrett: von Schulden über Notgroschen und Sparerpauschbetrag bis zur ersten Million.",   excerptEn:"Nine milestones laid out like a game board: from debt through your emergency fund and tax allowance all the way to your first million.",   tags:["Meilenstein", "Vermögen", "Sparquote", "FIRE"],   link:"beitrag-meilensteine.html" },
  {   title:"Ohne Aktien werden die meisten finanziellen Ziele nicht erreichbar sein",   titleEn:"Without Stocks, Most Financial Goals Stay Out of Reach",   cat:"Finanzen",   subcat:"vermoegen",   date:"2026-07-04",   excerpt:"Woher deutsches Vermögen wirklich kommt — und warum für die meisten Angestellten am Ende nur der Kapitalmarkt als realistischer Hebel bleibt.",   excerptEn:"Where German wealth actually comes from — and why capital markets remain the only realistic lever for most employees.",   tags:["Vermögen", "Erbschaft", "Aktien", "ETF", "Sparquote"],   link:"beitrag-ohne-aktien.html" },
  {   title:"Was bringt am meisten Rendite bei akzeptablem Risiko?",   titleEn:"What Gives You the Most Return at Acceptable Risk?",   cat:"Finanzen",   subcat:"rendite",   date:"2026-07-04",   excerpt:"Cash, Tagesgeld, Immobilien, Aktien und ETFs im Rendite-Risiko-Vergleich — und warum das magische Dreieck der Geldanlage dabei hilft.",   excerptEn:"Cash, savings accounts, real estate, stocks, and ETFs compared on risk and return — and how the magic triangle of investing helps you decide.",   tags:["Rendite", "Risiko", "ETF", "Aktien", "Immobilien"],   link:"beitrag-rendite-risiko.html" },
  {   title:"Schulden sind die größte Falle, um überhaupt investieren zu können",   titleEn:"Debt Is the Biggest Trap Standing Between You and Investing",   cat:"Finanzen",   subcat:"kredit",   date:"2026-07-04",   excerpt:"Warum Schulden das echte Investitionshindernis sind – und was du tun musst, bevor du den ersten ETF-Sparplan startest.",   excerptEn:"Why debt is the real barrier to investing – and what to do before starting your first ETF savings plan.",   tags:["Schulden", "Sparquote", "ETF", "Investieren","ZERO_TO_HERO"],   link:"beitrag-schulden.html" },
  {   title:"Der 1.000-Euro-Freibetrag: So holst du dir jeden Cent zurück",   titleEn:"The €1,000 Tax Allowance: How to Get Every Cent Back",   cat:"Finanzen",   subcat:"steuer",   date:"2026-06-29",   excerpt:"Sparerpauschbetrag richtig nutzen und bis zu 264 € Steuern im Jahr sparen.",   excerptEn:"Use the saver's lump-sum allowance correctly and save up to €264 in taxes a year.",   tags:["Steuer", "Dividenden", "Freibetrag"],   link:"beitrag-freibetrag.html" },
  {   title:"Die 7 Stufen der finanziellen Entwicklung",   titleEn:"The 7 Stages of Financial Independence",   cat:"FIRE",   subcat:"allgemein",   date:"2026-07-12",   excerpt:"Von finanzieller Abhängigkeit bis finanziellem Überfluss: sieben klar definierte Stufen — und wie sie sich vom Meilenstein-Fahrplan in Euro-Beträgen unterscheiden.",   excerptEn:"From financial dependency to financial abundance: seven clearly defined stages — and how they differ from the euro-amount milestone roadmap.",   tags:["FIRE", "Freiheit", "Meilenstein"],   link:"beitrag-finanzielle-freiheitsstufen.html" },
  {   title:"FIRE mit 40: Ein realistischer Fahrplan für Normalverdiener",   titleEn:"FIRE at 40: A Realistic Roadmap for Average Earners",   cat:"FIRE",   subcat:"allgemein",   date:"2026-06-26",   excerpt:"Warum finanzielle Freiheit kein Traum für Großverdiener bleiben muss — und kein Wettlauf gegen eine bestimmte Altersgrenze. Mit Link zum FIRE-Rechner für die eigene Zahl.",   excerptEn:"Why financial independence doesn't have to stay a dream reserved for high earners — or a race against a specific age. With a link to the FIRE calculator for your own numbers.",   tags:["FIRE", "Rente", "Sparquote"],   link:"beitrag-fire-mit-40.html" },
  {   title:"FIRE-Bewegung: Für jeden anders",   titleEn:"The FIRE Movement: Different for Everyone",   cat:"FIRE",   subcat:"allgemein",   date:"2026-07-11",   excerpt:"Lean, Fat, Barista oder Coast FIRE: vier sehr unterschiedliche Varianten derselben Bewegung — und warum die Sparquote überall der größte Hebel bleibt.",   excerptEn:"Lean, Fat, Barista, or Coast FIRE: four very different variants of the same movement — and why savings rate remains the biggest lever in every one of them.",   tags:["FIRE", "Frugalismus", "Sparquote", "Lean FIRE", "Fat FIRE"],   link:"beitrag-fire-bewegung-fuer-jeden-anders.html" },
  {   title:"ETF oder Einzelaktie? Eine ehrliche Kosten-Nutzen-Rechnung",   titleEn:"ETF or Individual Stocks? An Honest Cost-Benefit Analysis",   cat:"Finanzen",   subcat:"vergleich",   date:"2026-07-22",   excerpt:"Wann sich der Mehraufwand von Einzelaktien wirklich lohnt — mit echten Zahlen zu Kosten, Zeitaufwand und wie oft professionelle Fondsmanager den Index tatsächlich schlagen.",   excerptEn:"When the extra effort of picking individual stocks actually pays off — with real numbers on cost, time, and how often professional fund managers actually beat the index.",   tags:["ETF", "Aktien", "Dividenden"],   link:"beitrag-etf-oder-einzelaktie.html" },
  {   title:"Die 4-Prozent-Regel: Mythos oder verlässlicher Rentenplan?",   titleEn:"The 4% Rule: Myth or Reliable Retirement Plan?",   cat:"FIRE",   subcat:"allgemein",   date:"2026-07-21",   excerpt:"Was die Entnahmeregel wirklich hält – und wo ihre Grenzen liegen. Mit einem Rechner, der zeigt, wie dieselbe Durchschnittsrendite zu völlig unterschiedlichen Ergebnissen führen kann.",   excerptEn:"What the withdrawal rule really delivers – and where its limits lie. With a calculator showing how the same average return can lead to wildly different outcomes.",   tags:["Rente", "FIRE", "Entnahme"],   link:"beitrag-vier-prozent-regel.html" },
  {   title:"Minimalismus und Vermögensaufbau: zwei Seiten derselben Medaille",   titleEn:"Minimalism and Wealth Building: Two Sides of the Same Coin",   cat:"Minimalismus",   subcat:"sparquote",   date:"2026-07-22",   excerpt:"Wie bewusster Konsum automatisch die Sparquote erhöht — und warum Kostensenkung dabei nur der Motor ist, während Einkommenswachstum der eigentliche Turbo bleibt. Mit Säulendiagramm zum Nachvollziehen.",   excerptEn:"How mindful consumption automatically raises your savings rate — and why cutting costs is only the engine, while income growth is the real turbo. With a bar chart to see it for yourself.",   tags:["Minimalismus", "Sparquote"],   link:"beitrag-minimalismus-vermoegensaufbau.html" },
  {   title:"Dividendenkalender selbst bauen: So behältst du den Überblick",   titleEn:"Build Your Own Dividend Calendar to Stay on Top of Payouts",   cat:"Finanzen",   subcat:"etf",   date:"2026-07-21",   excerpt:"Eine einfache Tabelle für alle Ausschüttungstermine im Jahr — mit acht Beispieltiteln zum Reinschnuppern und der vollständigen Excel-Liste im Shop.",   excerptEn:"A simple spreadsheet for every payout date of the year — with eight example stocks to get a feel for it, and the full Excel list in the shop.",   tags:["Dividenden", "ETF"],   link:"beitrag-dividendenkalender-selbst-bauen.html" },
  {   title:"Warum die Sparrate wichtiger ist als die Rendite",   titleEn:"Why Your Savings Rate Matters More Than Your Returns",   cat:"FIRE",   subcat:"allgemein",   date:"2026-07-21",   excerpt:"Der am meisten unterschätzte Hebel beim Vermögensaufbau. Mit einem Rechner, der +2 Punkte Rendite gegen +10 Punkte Sparquote antreten lässt.",   excerptEn:"The most underrated lever in building wealth. With a calculator that pits +2 points of return against +10 points of savings rate.",   tags:["Sparquote", "Rente", "FIRE"],   link:"beitrag-sparrate-vs-rendite.html" },
  {   title:"Die Kapitalertragsteuer einfach erklärt",   titleEn:"Capital Gains Tax, Simply Explained",   cat:"Finanzen",   subcat:"steuer",   date:"2026-07-22",   excerpt:"Abgeltungssteuer, Soli, Sparerpauschbetrag und Verlusttopf — ein verständlicher Überblick für alle, die zum ersten Mal eine Steuerbescheinigung ihrer Depotbank in der Hand halten.",   excerptEn:"Withholding tax, solidarity surcharge, saver's allowance, and the loss-offset pot — a clear overview for anyone holding their first brokerage tax statement.",   tags:["Steuer", "Dividenden"],   link:"beitrag-kapitalertragsteuer-erklaert.html" },
];

/* Kategorie- und Tag-Bezeichnungen auf Englisch (fuer den Sprachschalter) */
const FR_CAT_EN = { "Finanzen":"Finance", "Minimalismus":"Minimalism", "FIRE":"FIRE" };
const FR_TAG_EN = {
  "Schulden":"Debt", "Sparquote":"Savings rate", "ETF":"ETF", "Investieren":"Investing",
  "Steuer":"Tax", "Dividenden":"Dividends", "Freibetrag":"Tax allowance", "Rente":"Retirement",
  "Konsum":"Consumption", "Aktien":"Stocks", "Entnahme":"Withdrawal", "Meilenstein":"Milestone",
  "Rendite":"Return", "Risiko":"Risk", "Immobilien":"Real estate",
  "Vermögen":"Wealth", "Erbschaft":"Inheritance",
  "Kredit":"Loan", "Baufinanzierung":"Mortgage", "Zinsen":"Interest",
  "Budget":"Budget", "Bargeld":"Cash", "Nebenkosten":"Utility costs",
  "Energie":"Energy", "Nachhaltigkeit":"Sustainability",
  "Depot":"Portfolio", "Rendite":"Return", "Volatilität":"Volatility",
  "Psychologie":"Psychology", "Verlustaversion":"Loss aversion",
  "Scheitern":"Failure", "Gründung":"Founding", "Nebeneinkommen":"Side income"
};
function frIsEn(){ return document.documentElement.getAttribute('lang') === 'en'; }
function frCat(cat){ return frIsEn() ? (FR_CAT_EN[cat] || cat) : cat; }
function frTag(tag){ return frIsEn() ? (FR_TAG_EN[tag] || tag) : tag; }
function frTitle(p){ return frIsEn() && p.titleEn ? p.titleEn : p.title; }
function frExcerpt(p){ return frIsEn() && p.excerptEn ? p.excerptEn : p.excerpt; }
/* FR_POSTS_END */

/* Kategorie -> Zielseite (frueher: Anker auf der Startseite, jetzt eigene Seiten) */
const FR_CAT_PAGE = { "Finanzen":"kat-finanzen.html", "Minimalismus":"kat-minimalismus.html", "FIRE":"kat-fire.html" };

/* Unterkategorien je Hauptkategorie: key (fuer subcat-Filter), Label DE/EN, eigene Seite.
   Neue Unterkategorie hinzufuegen = 1 Eintrag hier + Seite per kat-page-template erzeugen. */
const FR_SUBCATS = {
  "Finanzen": [
    { key:"portfolio",   label:"Mein Portfolio",         labelEn:"My Portfolio",           page:"kat-finanzen-portfolio.html" },
    { key:"girokonto",   label:"Girokonto & Tagesgeld",  labelEn:"Checking & Savings Accounts", page:"kat-finanzen-girokonto.html" },
    { key:"etf",         label:"ETF & Sparplan",        labelEn:"ETFs & Savings Plans",   page:"kat-finanzen-etf.html" },
    { key:"kredit",      label:"Kredit & Schulden",      labelEn:"Loans & Debt",           page:"kat-finanzen-kredit.html" },
    { key:"immobilien",  label:"Immobilien & REITs",     labelEn:"Real Estate & REITs",    page:"kat-finanzen-immobilien.html" },
    { key:"rendite",     label:"Depot & Rendite",        labelEn:"Portfolio & Returns",    page:"kat-finanzen-rendite.html" },
    { key:"vermoegen",   label:"Vermögensaufbau",        labelEn:"Building Wealth",        page:"kat-finanzen-vermoegen.html" },
    { key:"steuer",      label:"Steuern",                labelEn:"Taxes",                  page:"kat-finanzen-steuer.html" },
    { key:"learning",    label:"Learning",               labelEn:"Learning",               page:"kat-finanzen-learning.html" }
  ],
  "Minimalismus": [
    { key:"budget",          label:"Budget",              labelEn:"Budget",                 page:"kat-minimalismus-budget.html" },
    { key:"nachhaltigkeit",  label:"Nachhaltigkeit",      labelEn:"Sustainability",          page:"kat-minimalismus-nachhaltigkeit.html" },
    { key:"sparquote",       label:"Sparquote & Alltag",  labelEn:"Savings Rate & Everyday", page:"kat-minimalismus-sparquote.html" },
    { key:"motivation",      label:"Motivation",          labelEn:"Motivation",              page:"kat-minimalismus-motivation.html" }
  ],
  "FIRE": [],
  "Bücher": [
    { key:"macht-einfluss",             label:"Macht & Einfluss",             labelEn:"Power & Influence",           page:"kat-buecher-macht-einfluss.html" },
    { key:"vermoegensaufbau-mindset",   label:"Vermögensaufbau & Mindset",    labelEn:"Building Wealth & Mindset",   page:"kat-buecher-vermoegensaufbau-mindset.html" },
    { key:"optionen",                   label:"Optionen",                     labelEn:"Options Trading",             page:"kat-buecher-optionen.html" }
  ]
};
function frSubcatLabel(cat, key){
  const list = FR_SUBCATS[cat] || [];
  const hit = list.find(s => s.key === key);
  if(!hit) return '';
  return frIsEn() ? hit.labelEn : hit.label;
}

/* Label für die Kategorie-Kennzeichnung auf "Alle"-Übersichtsseiten:
   bevorzugt die Unterkategorie (z.B. "ETF & Sparplan"), fällt auf die
   Hauptkategorie zurück, wenn der Beitrag keiner Unterkategorie
   zugeordnet ist (z.B. FIRE, das keine Unterkategorien hat). */
function frItemTagLabel(p){
  return frSubcatLabel(p.cat, p.subcat) || frCat(p.cat);
}

function frFormatDate(iso){
  const d = new Date(iso);
  return d.toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric' });
}

/* =========================================================
   SICHERHEIT: Escaping für alle Daten, die per innerHTML
   in die Seite geschrieben werden.
   ---------------------------------------------------------
   Wichtig für FR_TARIFE: dieser Block wird automatisch aus
   einer FREMDEN Website erzeugt (tools/update_tarife.py).
   Ohne Escaping könnte ein manipulierter Anbietername dort
   Code auf deiner Seite ausführen (Stored XSS).
   Regel: jeder ${...}-Wert in einem innerHTML-Template läuft
   durch frEsc(), jede URL zusätzlich durch frSafeUrl().
   ========================================================= */
const FR_HTML_ESC = { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' };

function frEsc(wert){
  return String(wert == null ? '' : wert).replace(/[&<>"']/g, c => FR_HTML_ESC[c]);
}

/* Lässt nur unbedenkliche Ziele durch. Blockt javascript:, data:, vbscript: usw. */
function frSafeUrl(url){
  const u = String(url == null ? '' : url).trim();
  if(!u) return '#';
  if(/^(https?:\/\/|mailto:|tel:|#|\/|\.\/|\.\.\/)/i.test(u)) return u;
  // Relative .html-Dateien im gleichen Verzeichnis erlauben
  if(/^[a-zA-Z0-9_-]+\.html(#[a-zA-Z0-9_-]*)?$/.test(u)) return u;
  console.warn('[Finanzritual] Unsicheres Link-Ziel blockiert:', u);
  return '#';
}

/* ---------- Tag-Cloud: Häufigkeit automatisch aus FR_POSTS berechnen ---------- */
function frBuildTagCloud(targetId, moreBtnId, pageSize=20){
  const el = document.getElementById(targetId);
  let moreBtn = moreBtnId ? document.getElementById(moreBtnId) : null;
  if(!el) return;
  const counts = {};
  FR_POSTS.forEach(p => p.tags.forEach(t => { counts[t] = (counts[t]||0) + 1; }));
  const entries = Object.entries(counts).sort((a,b) => b[1]-a[1]);
  const max = Math.max(...entries.map(e => e[1]));
  const min = Math.min(...entries.map(e => e[1]));
  const minSize = 0.85, maxSize = 2.2;

  el.innerHTML = '';
  /* Klon ohne alte Klick-Listener - wichtig, damit ein erneuter Aufruf
     (z. B. beim Sprachwechsel) nicht mehrfach "Mehr laden" auslöst. */
  if(moreBtn){
    const clone = moreBtn.cloneNode(true);
    moreBtn.parentNode.replaceChild(clone, moreBtn);
    moreBtn = clone;
  }
  let shown = 0;

  function renderNext(){
    const slice = moreBtn ? entries.slice(shown, shown+pageSize) : entries;
    slice.forEach(([tag,count]) => {
      const size = max === min ? (minSize+maxSize)/2
        : minSize + (count-min)/(max-min) * (maxSize-minSize);
      const a = document.createElement('a');
      a.href = frSafeUrl(hrefForTag(tag));
      a.style.fontSize = size.toFixed(2) + 'rem';
      a.textContent = frTag(tag);
      a.title = frIsEn()
        ? count + (count===1 ? ' post' : ' posts')
        : count + (count===1 ? ' Beitrag' : ' Beiträge');
      el.appendChild(a);
    });
    shown += slice.length;
    if(moreBtn){ moreBtn.style.display = shown >= entries.length ? 'none' : 'inline-flex'; }
  }
  renderNext();
  if(moreBtn){ moreBtn.addEventListener('click', renderNext); }
}
/* Verlinkt ein Tag auf die passendste Seite: Unterkategorie-Seite, falls der
   erste Treffer eine hat, sonst die Hauptkategorie-Seite. */
function hrefForTag(tag){
  const hit = FR_POSTS.find(p => p.tags.includes(tag));
  if(!hit) return 'kat-finanzen.html';
  const subList = FR_SUBCATS[hit.cat] || [];
  const subHit = hit.subcat && subList.find(s => s.key === hit.subcat);
  return subHit ? subHit.page : (FR_CAT_PAGE[hit.cat] || 'kat-finanzen.html');
}

/* ---------- Startseiten-Feed (neueste zuerst, "Mehr laden") ---------- */
function frBuildFeed(targetId, moreBtnId, pageSize=5){
  const el = document.getElementById(targetId);
  let moreBtn = document.getElementById(moreBtnId);
  if(!el) return;
  el.innerHTML = '';
  /* Klon ohne alte Klick-Listener - wichtig, damit ein erneuter Aufruf
     (z. B. beim Sprachwechsel) nicht mehrfach "Mehr laden" auslöst. */
  if(moreBtn){
    const clone = moreBtn.cloneNode(true);
    moreBtn.parentNode.replaceChild(clone, moreBtn);
    moreBtn = clone;
  }
  const sorted = [...FR_POSTS].sort((a,b) => new Date(b.date) - new Date(a.date));
  let shown = 0;

  function renderNext(){
    const slice = sorted.slice(shown, shown+pageSize);
    slice.forEach(p => {
      const item = document.createElement('article');
      item.className = 'feed-item';
      const href = frSafeUrl(p.link || FR_CAT_PAGE[p.cat] || 'kat-finanzen.html');
      item.innerHTML = `
        <time datetime="${frEsc(p.date)}">${frEsc(frFormatDate(p.date))}</time>
        <div>
          <span class="feed-cat">${frEsc(frCat(p.cat))}</span>
          <h3><a href="${frEsc(href)}">${frEsc(frTitle(p))}</a></h3>
          <p>${frEsc(frExcerpt(p))}</p>
        </div>`;
      el.appendChild(item);
    });
    shown += slice.length;
    if(moreBtn){ moreBtn.style.display = shown >= sorted.length ? 'none' : 'inline-flex'; }
  }
  renderNext();
  if(moreBtn){ moreBtn.addEventListener('click', renderNext); }
}

/* ---------- Icon je Hauptkategorie (fuer Karten-Ansicht auf Kategorie-Seiten) ---------- */
const FR_CAT_ICON = {
  "Finanzen": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V4"/><path d="M18 20V10"/><path d="M6 20v-6"/></svg>',
  "Minimalismus": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 3.6 18.3 2c1 6.5-.5 10.5-4.3 12.5 1 1 1.7 2.2 2 3.5"/><path d="M3 12c1.5 1.5 3 2 5 2 0-1.5-.3-2.8-1-4"/></svg>',
  "FIRE": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 17a2.5 2.5 0 0 0 2.5-2.5c0-1.4-1-2-1.5-3-1 1-1.5 1.5-2 1-.5-1 .5-2.5 0-4-2 1-4 3.5-4 6z"/><path d="M16 17c1.5-1 2.5-2.5 2.5-4.5 0-3-2-6-4-8 0 2-1 3-2 4 1 2 2 4 1 6.5"/></svg>',
  "Bücher": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>'
};
function frCatIcon(cat){ return FR_CAT_ICON[cat] || FR_CAT_ICON["Finanzen"]; }

/* ---------- Kategorie-/Unterkategorie-Seiten: Karten- oder Listenansicht ---------- */
function frRenderCategoryPosts(containerId, category, subcat){
  const el = document.getElementById(containerId);
  if(!el) return;
  let mode = 'cards';
  try { mode = localStorage.getItem('fr-viewmode') || 'cards'; } catch(e){ /* localStorage blockiert, s.o. */ }
  const cats = Array.isArray(category) ? category : [category];
  const items = FR_POSTS
    .filter(p => cats.includes(p.cat) && !!p.link && (!subcat || p.subcat === subcat))
    .sort((a,b) => new Date(b.date) - new Date(a.date));

  const emptyMsg = frIsEn()
    ? 'No posts here yet &ndash; check back soon.'
    : 'Hier gibt es noch keine Beiträge &ndash; schau bald wieder vorbei.';

  if(items.length === 0){
    el.innerHTML = `<p class="calc-note">${emptyMsg}</p>`;
    return;
  }

  /* Zeigt die Unterkategorie bzw. Kategorie jedes einzelnen Beitrags an —
     auf "Alle"-Seiten zur Einordnung, aber auch auf bereits gefilterten
     Unterkategorie-Seiten, damit die Darstellung überall konsistent bleibt. */
  const showTag = true;

  const buyLabel = frIsEn() ? 'View on Amazon' : 'Bei Amazon ansehen';

  if(mode === 'list'){
    const hasCovers = items.some(p => p.cover);
    el.className = hasCovers ? 'cat-list cat-list--with-cover' : 'cat-list';
    el.innerHTML = items.map(p => `
      <div class="cat-row">
        ${p.cover
          ? (p.buyUrl
              ? `<a class="cat-row-cover" href="${frEsc(p.buyUrl)}" target="_blank" rel="noopener sponsored nofollow" aria-label="${frEsc(buyLabel)}"><img src="${frEsc(p.cover)}" alt="" loading="lazy" onerror="this.closest('.cat-row-cover').classList.add('cover-broken'); this.remove();"></a>`
              : `<span class="cat-row-cover"><img src="${frEsc(p.cover)}" alt="" loading="lazy" onerror="this.closest('.cat-row-cover').classList.add('cover-broken'); this.remove();"></span>`)
          : ''
        }
        <div class="cat-row-meta">
          <time datetime="${frEsc(p.date)}">${frEsc(frFormatDate(p.date))}</time>
          ${showTag ? `<span class="cat-row-cat">${frEsc(frItemTagLabel(p))}</span>` : ''}
        </div>
        <a href="${frEsc(frSafeUrl(p.link))}">${frEsc(frTitle(p))}</a>
      </div>`).join('');
  } else {
    el.className = 'kat-card-grid';
    el.innerHTML = items.map(p => {
      const coverBlock = p.cover
        ? (p.buyUrl
            ? `<a class="kat-card-icon kat-card-icon--cover" href="${frEsc(p.buyUrl)}" target="_blank" rel="noopener sponsored nofollow" aria-label="${frEsc(buyLabel)}"><img src="${frEsc(p.cover)}" alt="" loading="lazy" onerror="this.closest('.kat-card-icon--cover').classList.add('cover-broken'); this.remove();"></a>`
            : `<span class="kat-card-icon kat-card-icon--cover"><img src="${frEsc(p.cover)}" alt="" loading="lazy" onerror="this.closest('.kat-card-icon--cover').classList.add('cover-broken'); this.remove();"></span>`)
        : `<span class="kat-card-icon kat-card-icon--${frEsc(p.cat === 'Minimalismus' ? 'green' : (p.cat === 'FIRE' ? 'amber' : 'blue'))}">${frCatIcon(p.cat)}</span>`;
      const bodyBlock = `
        <time datetime="${frEsc(p.date)}">${frEsc(frFormatDate(p.date))}</time>
        ${showTag ? `<span class="kat-card-tag">${frEsc(frItemTagLabel(p))}</span>` : ''}
        <h3>${frEsc(frTitle(p))}</h3>
        <p>${frEsc(frExcerpt(p))}</p>`;

      if(p.cover && p.buyUrl){
        // Cover verlinkt zu Amazon, Rest der Karte zum Artikel — zwei
        // getrennte Links statt einem, deshalb <div> statt <a> aussen.
        return `
      <div class="kat-card kat-card--split">
        ${coverBlock}
        <a class="kat-card-body" href="${frEsc(frSafeUrl(p.link))}">${bodyBlock}
        </a>
      </div>`;
      }
      return `
      <a class="kat-card" href="${frEsc(frSafeUrl(p.link))}">
        ${coverBlock}
        <span class="kat-card-body">${bodyBlock}
        </span>
      </a>`;
    }).join('');
  }
}

/* View-Toggle (Karten/Liste) auf Kategorie-Seiten: Zustand in localStorage,
   gilt seitenuebergreifend, damit die Wahl konsistent bleibt. */
function frInitViewToggle(renderFn){
  const btnCards = document.getElementById('view-toggle-cards');
  const btnList = document.getElementById('view-toggle-list');
  if(!btnCards || !btnList) return;
  function applyMode(mode){
    try { localStorage.setItem('fr-viewmode', mode); } catch(e){ /* localStorage blockiert, s.o. */ }
    btnCards.setAttribute('aria-pressed', mode === 'cards');
    btnList.setAttribute('aria-pressed', mode === 'list');
    renderFn();
  }
  btnCards.addEventListener('click', () => applyMode('cards'));
  btnList.addEventListener('click', () => applyMode('list'));
  let saved = 'cards';
  try { saved = localStorage.getItem('fr-viewmode') || 'cards'; } catch(e){ /* s.o. */ }
  btnCards.setAttribute('aria-pressed', saved === 'cards');
  btnList.setAttribute('aria-pressed', saved === 'list');
}

/* Baut alle FR_POSTS-abhaengigen Bereiche neu auf - wird beim Sprachwechsel
   erneut aufgerufen, damit Feed und Tag-Cloud sofort in der gewaehlten
   Sprache erscheinen. Kategorie-Seiten registrieren ihre eigene Render-
   Funktion zusaetzlich ueber window.frPageRecomputers. */
function frRenderDynamicSections(){
  frBuildTagCloud('tagcloud');
  frBuildFeed('feed-list', 'feed-more-btn');
  if(typeof frTariffRerender === 'function' && frTariffRerender) frTariffRerender();
}

/* =========================================================
   KAFFEE-BUTTON  (im versteckten Logo-Panel)
   ---------------------------------------------------------
   Hier deine Spenden-URL eintragen, z. B.
     "https://www.buymeacoffee.com/deinname"
     "https://ko-fi.com/deinname"
     "https://paypal.me/deinname"
   Leer lassen -> Button wird ausgegraut und ist nicht klickbar.
   ========================================================= */
const FR_KAFFEE_LINK = "https://www.buymeacoffee.com/finanzritual";

/* ---------- Schwebender Kaffee-Button: taucht erst auf, wenn der
   Artikeltext praktisch zu Ende gelesen ist -- keine der Projektseiten
   muss dafuer angefasst werden, das Element wird komplett per JS erzeugt
   und eingehaengt, wie das Glossar-System. Nur auf Seiten mit <article>. */
/* ---------- Such-Icon in der Header-Controls-Leiste ----------
   Komplett per JS erzeugt und an erster Stelle der Icon-Leiste eingefuegt,
   damit keine der 268 Projektseiten einzeln angefasst werden muss. Fuehrt
   zu suche.html, ausser man ist bereits dort (dann still ausgeblendet). */
/* ---------- Schwebende Lupe, erscheint nur wenn der Header ausgeblendet ist ----------
   Auf dem Handy verschwindet die Menüzeile beim Runterscrollen (siehe
   scroll-Handler oben) -- damit die Suche trotzdem jederzeit erreichbar
   bleibt, taucht oben rechts eine kleine schwebende Lupe auf, sobald der
   Header weg ist, und verschwindet wieder, sobald er zurueckkommt. */
function frInitFloatingSearch(){
  const isSearchPage = /(^|\/)suche\.html$/.test(location.pathname);
  if(isSearchPage) return;
  const header = document.querySelector('header.site');
  if(!header) return;

  const link = document.createElement('a');
  link.href = 'suche.html';
  link.className = 'search-float';
  link.setAttribute('aria-label', 'Suche öffnen');
  link.setAttribute('data-en-aria-label', 'Open search');
  link.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
  document.body.appendChild(link);

  const sync = () => { link.classList.toggle('is-visible', header.classList.contains('is-hidden')); };
  new MutationObserver(sync).observe(header, { attributes:true, attributeFilter:['class'] });
  sync();
}

function frInitSearchIcon(){
  const nav = document.getElementById('primary-nav');
  if(!nav) return;
  const isSearchPage = /(^|\/)suche\.html$/.test(location.pathname);
  if(isSearchPage) return;

  const link = document.createElement('a');
  link.href = 'suche.html';
  link.className = 'search-toggle';
  link.setAttribute('aria-label', 'Suche öffnen');
  link.setAttribute('data-en-aria-label', 'Open search');
  link.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
  nav.appendChild(link);
}

function frInitFloatingCoffee(){
  // article.legal deckt normale Blogbeitraege ab, section.legal die
  // "Utility"-Seiten (Glossar, Impressum, Datenschutz) -- die nutzen
  // bewusst <section> statt <article>, da es keine Artikel im
  // redaktionellen Sinn sind. Ohne diese Erweiterung fehlte die
  // Kaffeetasse auf allen dreien komplett.
  const article = document.querySelector('article.legal, section.legal');
  if(!article) return;

  const btn = document.createElement('a');
  btn.href = '#';
  btn.className = 'fr-coffee-btn fr-coffee-float';
  btn.setAttribute('aria-label', 'Kaffee spendieren');
  btn.setAttribute('data-en-aria-label', 'Buy me a coffee');
  btn.innerHTML =
    '<span class="fr-coffee-cup" aria-hidden="true">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
    '<path class="fr-steam fr-steam-1" d="M8 2.5c-.6.8-.6 1.7 0 2.5"/>' +
    '<path class="fr-steam fr-steam-2" d="M12 2c-.7 1-.7 2 0 3"/>' +
    '<path class="fr-steam fr-steam-3" d="M16 2.5c-.6.8-.6 1.7 0 2.5"/>' +
    '<path d="M3 8h14v6a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8z"/>' +
    '<path d="M17 9.5h1.5a2.5 2.5 0 0 1 0 5H17"/>' +
    '<path d="M2 22h16"/>' +
    '</svg></span>';
  document.body.appendChild(btn);

  // Absolute Position des Artikelendes EINMAL berechnen, nicht bei jedem
  // Scroll-Event neu -- getBoundingClientRect() ist bereits
  // scrollpositions-relativ, ein zusaetzliches += window.scrollY bei jedem
  // Aufruf wuerde den Wert mit fortschreitendem Scrollen immer weiter
  // verfaelschen.
  const articleBottom = article.getBoundingClientRect().bottom + window.scrollY;

  const onScroll = () => {
    const nearEnd = window.scrollY + window.innerHeight >= articleBottom - 260;
    btn.classList.toggle('is-visible', nearEnd);
  };
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  return btn;
}

function frInitKaffeeButton(){
  // Es kann mehrere Instanzen auf derselben Seite geben (Easter-Egg-Panel
  // UND der öffentliche Button im Footer) -- alle per Klasse erfassen,
  // nicht nur eine einzelne ID.
  const buttons = document.querySelectorAll('.fr-coffee-btn');
  if(!buttons.length) return;

  const url = (FR_KAFFEE_LINK || "").trim();

  buttons.forEach(function(btn){
    const sub = btn.querySelector('.fr-coffee-sub');
    if(!url){
      btn.classList.add('is-disabled');
      btn.setAttribute('aria-disabled', 'true');
      btn.removeAttribute('href');
      btn.title = 'Spenden-Link noch nicht hinterlegt (FR_KAFFEE_LINK in script.js)';
      if(sub) sub.textContent = 'bald verfügbar';
      return;
    }
    btn.href = url;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.setAttribute('aria-label', 'Kaffee spendieren – öffnet in neuem Tab');
  });
}


/* =========================================================
   MOBILFUNK-TARIFVERGLEICH  (Allnet Flats)
   ---------------------------------------------------------
   HIER trägst du deine Affiliate-Links ein — und NUR hier.
   Schlüssel = die "id" des Tarifs aus FR_TARIFE (weiter unten).
   Leer / nicht vorhanden  ->  Button zeigt auf FR_AFF_FALLBACK.
   Dieser Block wird vom Update-Skript NIEMALS angefasst.
   ========================================================= */
const FR_AFF_LINKS = {
  // "lyca-mobile-lyca-easy-s": "https://partner.example.com/klick?id=123",
  // "lebara-allnet-20-gb":     "https://partner.example.com/klick?id=456",
};

/* Fallback-Ziel, solange für einen Tarif kein Affiliate-Link gesetzt ist */
const FR_AFF_FALLBACK = "#tarif-link-folgt";

/* Datenstand — wird vom Update-Skript automatisch gesetzt */
const FR_TARIFE_STAND = "2026-07-14";

/* >>> FR_TARIFE_START — AUTOMATISCH GENERIERT, NICHT VON HAND EDITIEREN.
   Dieser Block wird von tools/update_tarife.py überschrieben.
   Affiliate-Links gehören in FR_AFF_LINKS, nicht hierher. <<< */
const FR_TARIFE = [
  { id:"lyca-mobile-lyca-easy-s",               anbieter:"Lyca Mobile",     tarif:"Lyca Easy S",                netz:"O2",       gb:12, down:50,  up:25,  laufzeit:"prepaid", anschluss:0.00,  monat:3.02, hinweis:"" },
  { id:"lebara-allnet-5-gb",                    anbieter:"Lebara",          tarif:"Allnet 5 GB",                netz:"O2",       gb:5,  down:50,  up:32,  laufzeit:"24",      anschluss:1.00,  monat:3.99, hinweis:"" },
  { id:"lebara-allnet-5-gb-flex",               anbieter:"Lebara",          tarif:"Allnet 5 GB Flex",           netz:"O2",       gb:5,  down:50,  up:32,  laufzeit:"flex",    anschluss:19.99, monat:3.99, hinweis:"" },
  { id:"cybersim-allnet-flat-10-gb",            anbieter:"cyberSIM",        tarif:"Allnet Flat 10 GB",          netz:"1&1",      gb:10, down:50,  up:32,  laufzeit:"24",      anschluss:0.00,  monat:4.99, hinweis:"" },
  { id:"cybersim-allnet-flat-10-gb-flex",       anbieter:"cyberSIM",        tarif:"Allnet Flat 10 GB Flex",     netz:"1&1",      gb:10, down:50,  up:32,  laufzeit:"flex",    anschluss:9.99,  monat:4.99, hinweis:"" },
  { id:"lebara-allnet-20-gb",                   anbieter:"Lebara",          tarif:"Allnet 20 GB",               netz:"O2",       gb:20, down:50,  up:32,  laufzeit:"24",      anschluss:1.00,  monat:4.99, hinweis:"" },
  { id:"lebara-allnet-20-gb-flex",              anbieter:"Lebara",          tarif:"Allnet 20 GB Flex",          netz:"O2",       gb:20, down:50,  up:32,  laufzeit:"flex",    anschluss:19.99, monat:4.99, hinweis:"" },
  { id:"maingau-energie-allnet-flat-5-gb",      anbieter:"MAINGAU Energie", tarif:"Allnet Flat 5 GB",           netz:"O2",       gb:5,  down:50,  up:32,  laufzeit:"24",      anschluss:19.99, monat:4.99, hinweis:"" },
  { id:"maingau-energie-allnet-flat-5-gb-flex", anbieter:"MAINGAU Energie", tarif:"Allnet Flat 5 GB Flex",      netz:"O2",       gb:5,  down:50,  up:32,  laufzeit:"flex",    anschluss:29.99, monat:4.99, hinweis:"" },
  { id:"lyca-mobile-lyca-easy-xs",              anbieter:"Lyca Mobile",     tarif:"Lyca Easy XS",               netz:"O2",       gb:5,  down:50,  up:25,  laufzeit:"prepaid", anschluss:0.00,  monat:5.41, hinweis:"15 € Guthaben" },
  { id:"lebara-hello-prepaid",                  anbieter:"Lebara",          tarif:"HELLO! Prepaid",             netz:"O2",       gb:3,  down:50,  up:25,  laufzeit:"prepaid", anschluss:0.00,  monat:5.41, hinweis:"" },
  { id:"vodafone-callya-start",                 anbieter:"Vodafone",        tarif:"CallYa Start",               netz:"Vodafone", gb:2,  down:300, up:100, laufzeit:"prepaid", anschluss:0.00,  monat:5.41, hinweis:"" },
  { id:"congstar-prepaid-allnet-xs",            anbieter:"congstar",        tarif:"Prepaid Allnet XS",          netz:"Telekom",  gb:1,  down:25,  up:10,  laufzeit:"prepaid", anschluss:1.00,  monat:5.42, hinweis:"5 € Guthaben" },
  { id:"congstar-prepaid-wie-ich-will-1-gb",    anbieter:"congstar",        tarif:"Prepaid wie ich will 1 GB",  netz:"Telekom",  gb:1,  down:25,  up:10,  laufzeit:"prepaid", anschluss:9.99,  monat:5.42, hinweis:"10 € Guthaben" },
  { id:"simplytel-allnet-flat-5-gb",            anbieter:"simplytel",       tarif:"Allnet Flat 5 GB",           netz:"1&1",      gb:5,  down:100, up:50,  laufzeit:"24",      anschluss:0.00,  monat:5.99, hinweis:"" },
  { id:"maingau-energie-allnet-flat-30-gb",     anbieter:"MAINGAU Energie", tarif:"Allnet Flat 30 GB",          netz:"O2",       gb:30, down:50,  up:32,  laufzeit:"24",      anschluss:19.99, monat:5.99, hinweis:"" },
  { id:"eazy-eazygo-s",                         anbieter:"eazy",            tarif:"eazyGo S",                   netz:"Vodafone", gb:35, down:100, up:50,  laufzeit:"24",      anschluss:0.00,  monat:6.99, hinweis:"" },
  { id:"logitel-allmobil-allnet-basic",         anbieter:"LogiTel",         tarif:"Allmobil Allnet Basic",      netz:"Vodafone", gb:35, down:50,  up:25,  laufzeit:"24",      anschluss:0.00,  monat:6.99, hinweis:"" },
  { id:"logitel-allmobil-allnet-basic-flex",    anbieter:"LogiTel",         tarif:"Allmobil Allnet Basic Flex", netz:"Vodafone", gb:35, down:50,  up:25,  laufzeit:"flex",    anschluss:0.00,  monat:6.99, hinweis:"" },
  { id:"sim24-allnet-flat-25-gb",               anbieter:"sim24",           tarif:"Allnet Flat 25 GB",          netz:"1&1",      gb:25, down:50,  up:32,  laufzeit:"24",      anschluss:0.00,  monat:6.99, hinweis:"" }
];
/* >>> FR_TARIFE_END <<< */

const FR_LAUFZEIT_LABEL = { "prepaid":"Prepaid (28 Tage)", "flex":"monatlich kündbar", "24":"24 Monate" };
const FR_LAUFZEIT_KURZ  = { "prepaid":"Prepaid", "flex":"mtl.", "24":"24 Mon." };
const FR_LAUFZEIT_KURZ_EN = { "prepaid":"Prepaid", "flex":"monthly", "24":"24 mo." };
let frTariffRerender = null;

function frBuildTariffTable(rootId){
  const root = document.getElementById(rootId);
  if(!root) return;

  const state = { netz:"alle", gb:0, laufzeit:"alle", sort:"preis" };

  function apply(){
    let rows = FR_TARIFE.filter(t =>
      (state.netz === "alle" || t.netz === state.netz) &&
      (t.gb >= state.gb) &&
      (state.laufzeit === "alle" || t.laufzeit === state.laufzeit)
    );
    if(state.sort === "preis")       rows.sort((a,b) => a.monat - b.monat || b.gb - a.gb);
    else if(state.sort === "gb")     rows.sort((a,b) => b.gb - a.gb || a.monat - b.monat);
    else if(state.sort === "preisgb")rows.sort((a,b) => (a.monat/a.gb) - (b.monat/b.gb));
    render(rows);
  }

  function render(rows){
    const en = frIsEn();
    const eur = new Intl.NumberFormat(en ? 'en-IE' : 'de-DE', { style:'currency', currency:'EUR' });
    const laufzeitMap = en ? FR_LAUFZEIT_KURZ_EN : FR_LAUFZEIT_KURZ;
    const body = root.querySelector('#fr-tarif-body');
    const count = root.querySelector('#fr-tarif-count');
    const stand = new Date(FR_TARIFE_STAND).toLocaleDateString(en ? 'en-GB' : 'de-DE',
      { day:'2-digit', month:'2-digit', year:'numeric' });
    count.textContent = rows.length === 0
      ? (en ? "No plans match your selection — try loosening the filters."
            : "Keine Tarife passen zu deiner Auswahl — bitte Filter lockern.")
      : (en
          ? `${rows.length} plan${rows.length === 1 ? "" : "s"} found · Data as of ${stand}`
          : `${rows.length} Tarif${rows.length === 1 ? "" : "e"} gefunden · Datenstand ${stand}`);
    if(rows.length === 0){ body.innerHTML = ''; return; }
    body.innerHTML = rows.map(t => {
      const aff = FR_AFF_LINKS[t.id];
      const hasAff = !!(aff && aff.trim());
      const link = frSafeUrl(hasAff ? aff : FR_AFF_FALLBACK);
      const rel = hasAff ? 'sponsored nofollow noopener' : 'nofollow noopener';
      const target = hasAff ? ' target="_blank"' : '';
      const hinweis = t.hinweis ? `<span class="fr-tarif-note">${frEsc(t.hinweis)}</span>` : '';
      const netzKlasse = String(t.netz).replace(/[^a-z0-9]/gi,'').toLowerCase();
      const flatText = en ? 'Calls &amp; SMS included' : 'Telefon- &amp; SMS-Flat';
      const monatText = en ? '/ month' : '/ Monat';
      const anschlussText = en ? 'connection fee' : 'Anschluss';
      const btnText = en ? 'View plan' : 'Zum Tarif';
      return `
      <div class="fr-tarif-row" role="row">
        <div class="fr-tarif-cell fr-tarif-main" role="cell">
          <span class="fr-tarif-name">${frEsc(t.anbieter)} · ${frEsc(t.tarif)}</span>
          <span class="fr-tarif-sub">${frEsc(t.gb)} GB · ${flatText} · ${frEsc(t.down)}/${frEsc(t.up)} MBit/s</span>
        </div>
        <div class="fr-tarif-cell fr-tarif-netz" role="cell"><span class="fr-tarif-badge netz-${frEsc(netzKlasse)}">${frEsc(t.netz)}</span></div>
        <div class="fr-tarif-cell fr-tarif-laufzeit mono" role="cell">${frEsc(laufzeitMap[t.laufzeit] || t.laufzeit)}</div>
        <div class="fr-tarif-cell fr-tarif-preis" role="cell">
          <span class="fr-tarif-price">${frEsc(eur.format(t.monat))}</span>
          <span class="fr-tarif-sub">${monatText}${t.anschluss ? ` · ${frEsc(eur.format(t.anschluss))} ${anschlussText}` : ''}</span>
          ${hinweis}
        </div>
        <div class="fr-tarif-cell fr-tarif-cta" role="cell">
          <a href="${frEsc(link)}" class="btn btn-green fr-tarif-btn" rel="${rel}"${target}>${btnText}</a>
        </div>
      </div>`;
    }).join('');
  }

  root.querySelectorAll('[data-filter]').forEach(sel => {
    sel.addEventListener('change', () => {
      const key = sel.getAttribute('data-filter');
      state[key] = (key === "gb") ? parseInt(sel.value, 10) : sel.value;
      apply();
    });
  });

  apply();
  frTariffRerender = apply;
}

/* =========================================================
   MINI-SPARRECHNER  (Spare-Ritual-Rechner)
   ========================================================= */
function frRenderBarChart(containerId, series, scaleMax, maxYears){
  const el = document.getElementById(containerId);
  if(!el) return;
  const years = series.length;
  const totalYears = Math.max(maxYears || years, years);
  const slot = 26, gap = 7, barW = slot - gap;
  const padL = 4, padR = 4, padT = 6, padB = 20;
  const chartH = 150;
  const width = totalYears*slot + padL + padR;
  const height = chartH + padT + padB;
  const maxTotal = Math.max(scaleMax || 0, 1);
  const scale = chartH / maxTotal;

  // Horizontale Gitternetzlinien (25%, 50%, 75%, 100% der Chart-Höhe) — über die volle mögliche Laufzeit,
  // damit sichtbar bleibt, wie viel Spielraum die gewählte Dauer im Verhältnis zur Maximal-Laufzeit hat.
  let out = '<g class="bar-hgrid">';
  [0.25, 0.5, 0.75, 1.0].forEach(frac => {
    const y = (padT + chartH * (1 - frac)).toFixed(1);
    out += `<line x1="${padL}" y1="${y}" x2="${padL + totalYears*slot}" y2="${y}" class="bar-hguide"/>`;
  });
  out += '</g>';

  // Vertikale 5-Jahres-Linien über die volle mögliche Laufzeit (auch jenseits der gewählten Dauer)
  for(let yearNum = 5; yearNum <= totalYears; yearNum += 5){
    const x = padL + (yearNum-1)*slot;
    out += `<line x1="${(x+barW/2).toFixed(1)}" y1="${padT}" x2="${(x+barW/2).toFixed(1)}" y2="${padT+chartH}" class="bar-guide"/>`;
    out += `<text x="${(x+barW/2).toFixed(1)}" y="${padT+chartH+15}" text-anchor="middle" class="bar-year-label is-milestone">${yearNum}J</text>`;
  }

  series.forEach((s, i) => {
    const x = padL + i*slot;
    const delay = (i * 0.022).toFixed(3);
    const hStart = s.start*scale;
    const hDeposit = s.deposit*scale;
    const hGain = Math.max(s.gain,0)*scale;
    let yCursor = padT + chartH;
    let segs = '';
    if(hStart > 0.3){
      yCursor -= hStart;
      segs += `<rect x="${x}" y="${yCursor.toFixed(1)}" width="${barW}" height="${hStart.toFixed(1)}" class="bar-seg bar-seg-start" style="animation-delay:${delay}s"/>`;
    }
    yCursor -= hDeposit;
    segs += `<rect x="${x}" y="${yCursor.toFixed(1)}" width="${barW}" height="${hDeposit.toFixed(1)}" class="bar-seg bar-seg-deposit" style="animation-delay:${delay}s"/>`;
    yCursor -= hGain;
    segs += `<rect x="${x}" y="${yCursor.toFixed(1)}" width="${barW}" height="${hGain.toFixed(1)}" class="bar-seg bar-seg-gain" style="animation-delay:${delay}s"/>`;
    out += `<g>${segs}</g>`;
  });

  // Markiert das Ende der gewählten Laufzeit farbig — unabhängig davon, ob es auf eine 5-Jahres-Linie fällt
  {
    const x = padL + (years-1)*slot;
    out += `<line x1="${(x+barW/2).toFixed(1)}" y1="${padT}" x2="${(x+barW/2).toFixed(1)}" y2="${padT+chartH}" class="bar-guide bar-guide-selected"/>`;
    out += `<text x="${(x+barW/2).toFixed(1)}" y="${padT+chartH+15}" text-anchor="middle" class="bar-year-label is-selected">${years}J</text>`;
  }

  el.innerHTML = `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMinYMax meet">${out}</svg>`;
}

function frInitCalculator(){
  const startEl = document.getElementById('calc-start');
  const rateEl = document.getElementById('calc-rate');
  const yearsEl = document.getElementById('calc-years');
  const returnEl = document.getElementById('calc-return');
  const startVal = document.getElementById('calc-start-val');
  const rateVal = document.getElementById('calc-rate-val');
  const yearsVal = document.getElementById('calc-years-val');
  const returnVal = document.getElementById('calc-return-val');
  const bigResult = document.getElementById('calc-result-big');
  const startStatRow = document.getElementById('calc-stat-start');
  const startOut = document.getElementById('calc-start-out');
  const investedOut = document.getElementById('calc-invested');
  const gainOut = document.getElementById('calc-gain');
  if(!rateEl) return;

  const fmt = new Intl.NumberFormat('de-DE', { maximumFractionDigits:0 });

  function pulse(node){
    node.classList.remove('is-pulsing');
    void node.offsetWidth; // Reflow erzwingen, damit die Animation erneut startet
    node.classList.add('is-pulsing');
  }

  function compute(){
    const startkapital = parseFloat(startEl.value);
    const monthly = parseFloat(rateEl.value);
    const years = parseInt(yearsEl.value, 10);
    const returnPct = parseFloat(returnEl.value);       // reines Anzeige-/Rechenformat, z.B. 7 oder 7.5
    const annualReturn = returnPct / 100;
    const monthlyReturn = annualReturn / 12;

    startVal.textContent = fmt.format(startkapital) + '\u00A0€';
    rateVal.textContent = fmt.format(monthly) + '\u00A0€';
    yearsVal.textContent = years + ' J.';
    returnVal.textContent = returnPct + '%';

    let balance = startkapital;
    let depositCum = 0;
    const series = [];
    for(let m = 1; m <= years*12; m++){
      balance = balance * (1+monthlyReturn) + monthly;
      depositCum += monthly;
      if(m % 12 === 0){
        series.push({ start:startkapital, deposit:depositCum, gain: balance - startkapital - depositCum });
      }
    }

    const last = series[series.length-1];
    const total = last.start + last.deposit + last.gain;

    bigResult.textContent = fmt.format(total) + '\u00A0€';
    investedOut.textContent = fmt.format(last.deposit) + '\u00A0€';
    gainOut.textContent = fmt.format(last.gain) + '\u00A0€';
    startOut.textContent = fmt.format(last.start) + '\u00A0€';
    startStatRow.hidden = startkapital <= 0;

    pulse(bigResult);
    pulse(gainOut);
    pulse(investedOut);

    // Stabile Skala: immer mindestens im Rahmen einer 20-Jahres-Ansicht,
    // damit kurze Laufzeiten nicht künstlich die ganze Höhe ausfüllen.
    let refBalance = startkapital;
    for(let m = 1; m <= 20*12; m++){ refBalance = refBalance * (1+monthlyReturn) + monthly; }
    const scaleMax = Math.max(refBalance, total);

    frRenderBarChart('calc-bars', series, scaleMax, parseInt(yearsEl.max, 10));
  }

  [startEl, rateEl, yearsEl, returnEl].forEach(el => el.addEventListener('input', compute));
  compute();
}

/* ---------- Hero-Chart: hochlaufender Demo-Betrag ---------- */
function frInitHeroCounter(){
  const el = document.getElementById('hero-chart-value');
  const wrap = document.getElementById('hero-chart-value-wrap');
  if(!el || !wrap) return;

  const target = 27000;
  const duration = 1800;   // ms — passend zur Chart-Linien-Animation
  const startDelay = 300;  // ms — passend zum CSS animation-delay der Linie
  const holdAfter = 1300;  // ms — wie lange die Endsumme stehen bleibt, bevor sie ausgeblendet wird
  const fmt = new Intl.NumberFormat('de-DE');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduceMotion){
    el.textContent = fmt.format(target) + '\u00A0€';
    setTimeout(() => wrap.classList.add('is-hidden'), 900);
    return;
  }

  setTimeout(() => {
    const start = performance.now();
    function tick(now){
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 2); // ease-out
      el.textContent = fmt.format(Math.round(target * eased)) + '\u00A0€';
      if(t < 1){
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => wrap.classList.add('is-hidden'), holdAfter);
      }
    }
    requestAnimationFrame(tick);
  }, startDelay);
}

document.addEventListener('DOMContentLoaded', () => {
  frBuildTagCloud('tagcloud');
  frBuildFeed('feed-list', 'feed-more-btn');
  frBuildTariffTable('fr-tarif-tool');
  frInitCalculator();
  frInitHeroCounter();
  frInitEasterEgg();
  frInitSecretLogoPanel();
  frInitSearchIcon();
  frInitFloatingSearch();
  frInitFloatingCoffee();
  frInitKaffeeButton();
  frInitInfoBanner();
  frInitRechnerOpenLink();
});

/* ---------- Spar-Ritual-Rechner: standardmäßig geschlossen, öffnet beim Sprung dorthin ---------- */
function frInitRechnerOpenLink(){
  const details = document.getElementById('rechner-details');
  if(!details) return;

  function openRechner(){
    details.open = true;
  }

  // Direktaufruf mit #rechner in der URL (z.B. geteilter Link)
  if(location.hash === '#rechner') openRechner();

  // Jeder Link/Button, der auf #rechner zeigt ("Spar-Rechner ausprobieren"),
  // öffnet den Rechner zusätzlich zum Hinscrollen
  document.querySelectorAll('a[href="#rechner"]').forEach(link => {
    link.addEventListener('click', openRechner);
  });

  // Falls sich der Hash während der Sitzung ändert
  window.addEventListener('hashchange', () => {
    if(location.hash === '#rechner') openRechner();
  });
}

/* ---------- Info-Disclaimer-Banner (einmalig pro Session, 5s Kreis-Timer) ---------- */
function frInitInfoBanner(){
  const banner  = document.getElementById('info-banner');
  const closeBtn= document.getElementById('info-banner-close');
  const arc     = document.getElementById('info-timer-arc');
  if(!banner || !closeBtn) return;

  if(sessionStorage.getItem('fr-info-banner-closed')) return;

  function closeBanner(){
    banner.classList.remove('is-visible');
    sessionStorage.setItem('fr-info-banner-closed', '1');
  }

  // Banner einfahren
  requestAnimationFrame(() => {
    setTimeout(() => {
      banner.classList.add('is-visible');

      // Kreis-Animation: stroke-dashoffset von 0 → 82 in 5s
      if(arc){
        arc.style.transition = 'none';
        arc.style.strokeDashoffset = '0';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            arc.style.transition = 'stroke-dashoffset 5s linear';
            arc.style.strokeDashoffset = '88';
          });
        });
      }

      // Auto-close nach 5s
      const timer = setTimeout(closeBanner, 5000);

      closeBtn.addEventListener('click', () => {
        clearTimeout(timer);
        closeBanner();
      });

    }, 120);
  });
}

/* ---------- Secret Panel: Doppelklick auf das Header-Logo ---------- */
function frInitSecretLogoPanel(){
  const logo = document.getElementById('logo-btn');
  const panel = document.getElementById('fr-secret-panel');
  if(!logo || !panel) return;

  frRenderMiniCalendar();

  let clickTimer = null;
  const DELAY = 280;

  logo.addEventListener('click', (e) => {
    e.preventDefault();
    if(clickTimer){
      // zweiter Klick innerhalb der Wartezeit -> Doppelklick
      clearTimeout(clickTimer);
      clickTimer = null;
      panel.classList.toggle('is-open');
      panel.setAttribute('aria-hidden', panel.classList.contains('is-open') ? 'false' : 'true');
    } else {
      // erster Klick -> abwarten, ob noch ein zweiter kommt
      clickTimer = setTimeout(() => {
        clickTimer = null;
        window.location.href = logo.getAttribute('href');
      }, DELAY);
    }
  });

  document.addEventListener('click', (e) => {
    if(panel.classList.contains('is-open') && !panel.contains(e.target) && e.target !== logo && !logo.contains(e.target)){
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
    }
  });

  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && panel.classList.contains('is-open')){
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
    }
  });
}

function frRenderMiniCalendar(){
  const headerEl = document.getElementById('fr-cal-header');
  const daysEl = document.getElementById('fr-cal-days');
  if(!headerEl || !daysEl) return;

  const MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayDate = today.getDate();

  headerEl.textContent = `${MONTHS[month]} ${year}`;

  const firstOfMonth = new Date(year, month, 1);
  // Montag = 0 ... Sonntag = 6
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  let html = '';
  // Auffüllen mit Tagen aus dem Vormonat
  for(let i = firstWeekday - 1; i >= 0; i--){
    html += `<span class="fr-cal-day is-other">${daysInPrevMonth - i}</span>`;
  }
  // Tage des aktuellen Monats
  for(let d = 1; d <= daysInMonth; d++){
    const isToday = d === todayDate;
    html += `<span class="fr-cal-day${isToday ? ' is-today' : ''}">${d}</span>`;
  }
  // Auffüllen mit Tagen aus dem Folgemonat bis volle Wochenzeile
  const totalCells = firstWeekday + daysInMonth;
  const remainder = totalCells % 7;
  if(remainder !== 0){
    const fillCount = 7 - remainder;
    for(let d = 1; d <= fillCount; d++){
      html += `<span class="fr-cal-day is-other">${d}</span>`;
    }
  }
  daysEl.innerHTML = html;
}

/* ---------- Easter Egg: irgendwo auf der Seite "fire" tippen ---------- */
function frInitEasterEgg(){
  let buffer = '';
  const word = 'fire';

  console.log('%c🔥 Kleine Rituale. Großes Vermögen.', 'color:#1E8E5A; font-weight:bold; font-size:14px;');
  console.log('%cNeugierig genug, um hier reinzuschauen? Tipp irgendwo auf der Seite das Wort "fire" — mal sehen, was passiert.', 'color:#2454A6;');

  document.addEventListener('keydown', (e) => {
    if(e.metaKey || e.ctrlKey || e.altKey) return;
    if(e.key.length !== 1) return;
    buffer = (buffer + e.key.toLowerCase()).slice(-word.length);
    if(buffer === word){
      buffer = '';
      frFireEasterEgg();
    }
  });
}

function frFireEasterEgg(){
  const logo = document.querySelector('.logo-l');
  const toastId = 'fr-easter-toast';
  if(document.getElementById(toastId)) return; // schon aktiv

  if(logo){
    logo.classList.add('fr-easter-glow');
    setTimeout(() => logo.classList.remove('fr-easter-glow'), 1800);
  }

  const toast = document.createElement('div');
  toast.id = toastId;
  toast.className = 'fr-easter-toast';
  toast.textContent = '🔥 Gefunden! Kleine Rituale, großes Vermögen.';
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('is-visible'));
  setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

/* Hinweis: Das alte Suche-Icon, das hier direkt in nav#primary-nav
   injiziert wurde, ist entfernt -- frInitSearchIcon() (siehe oben,
   erzeugt .search-toggle in der header-controls-Leiste) übernimmt diese
   Aufgabe jetzt vollstaendig und funktioniert zusaetzlich auch auf dem
   Handy, wo nav.primary ohnehin ausgeblendet ist. Beide gleichzeitig
   fuehrten zu einer sichtbaren doppelten Lupe. */

/* ── Zero-to-Hero-Button: einmaliger Puls, wenn er ins Blickfeld scrollt ── */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('.btn-hero-bounce');
  if (!btn) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let pulsed = false;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !pulsed) {
        pulsed = true;
        // Erster Lade-Bounce lief evtl. schon (0.5s Delay) — nur erneut pulsen, wenn seither Zeit vergangen ist
        setTimeout(() => {
          btn.classList.remove('fr-pulse-again');
          void btn.offsetWidth;
          btn.classList.add('fr-pulse-again');
        }, 300);
        io.disconnect();
      }
    });
  }, { threshold: 0.6 });
  io.observe(btn);
});


/* ── Anker-Sprung-Korrektur ──────────────────────────────────────────────
   Problem: auf Seiten, die Inhalte per JS nachladen (z.B. frRenderCategoryPosts
   in #kat-posts), ist die Seite beim initialen Browser-Sprung zu #hash noch
   kürzer als nach dem Rendern. Der Browser scrollt dann zu einer Position,
   die kurz danach nicht mehr stimmt, weil der Zielbereich durch den
   nachgeladenen Inhalt weiter nach unten rutscht -- man landet zu weit oben.
   Fix: nach 'load' (also nachdem alle DOMContentLoaded-Handler inkl. der
   seitenspezifischen render()-Aufrufe bereits gelaufen sind) einmal
   korrigierend zum Ziel-Element scrollen, falls die URL einen Hash hat.
   Wirkt sitehweit für jeden #anker-Link, nicht nur für einen bestimmten. */
window.addEventListener('load', function(){
  if(!location.hash) return;
  var target;
  try{ target = document.querySelector(location.hash); } catch(e){ return; }
  if(target){
    target.scrollIntoView({ behavior:'auto', block:'start' });
  }
});

/* ── Begriffs-Tooltip: Position (oben/unten), Klick-Umschalten ──────────── */
/* ── Begriffs-Tooltip: Position (oben/unten), Klick-Umschalten ────────────
   WICHTIG: per Delegation auf 'document' (nicht direkt am Element!), weil
   translatePage() bei jedem Seitenaufruf innerHTML von [data-en]-Elementen
   neu setzt (auch beim Verbleib auf Deutsch) und dabei die DOM-Knoten
   ersetzt -- direkt angehängte Listener wären an den alten, verwaisten
   Knoten hängen geblieben und nie ausgeloest worden. */
function frPositionTermTip(tip){
  const popup = tip.querySelector('.term-tip-popup');
  if (!popup) return;
  const tipRect = tip.getBoundingClientRect();
  const popupHeight = popup.offsetHeight || 160; // Fallback, falls noch 0 (z.B. erster Aufruf)
  const margin = 20; // Sicherheitsabstand zum Viewport-Rand
  const spaceAbove = tipRect.top;
  tip.classList.toggle('flip-down', spaceAbove < popupHeight + margin);
}

document.addEventListener('mouseover', function(e){
  const tip = e.target.closest('.term-tip');
  if (tip) frPositionTermTip(tip);
});

document.addEventListener('click', function(e){
  // Ein Klick auf den "Ganzer Glossar-Eintrag"-Link im Popup soll ganz
  // normal navigieren -- nicht vom Toggle-Handler abgefangen werden.
  // Ohne diese Ausnahme griff e.preventDefault() weiter unten faelschlich
  // auch fuer den Link, weil er ein Nachfahre von .term-tip ist.
  if (e.target.closest('.term-tip-popup a')) return;

  const tip = e.target.closest('.term-tip');
  document.querySelectorAll('.term-tip.is-open').forEach(function(open){
    if (open !== tip) open.classList.remove('is-open');
  });
  if (tip){
    e.preventDefault();
    const willOpen = !tip.classList.contains('is-open');
    if (willOpen) frPositionTermTip(tip);
    tip.classList.toggle('is-open');
  }
});
document.addEventListener('keydown', function(e){
  if (e.key === 'Escape'){
    document.querySelectorAll('.term-tip.is-open').forEach(function(open){ open.classList.remove('is-open'); });
  }
});

/* =========================================================
   ZENTRALES GLOSSAR-AUTO-LINKING
   ---------------------------------------------------------
   Statt in jedem Artikel von Hand ein Tooltip-Span einzubauen
   (fehleranfaellig, siehe fruehere Versionen), findet dieses
   Skript automatisch die ERSTE Erwaehnung jedes bekannten
   Fachbegriffs im Artikeltext und versieht sie mit demselben
   Flyover-Tooltip wie die von Hand gebauten (ESG, Spread) --
   nutzt dieselben CSS-Klassen (.term-tip/.term-tip-popup) und
   damit automatisch dieselbe Hover-/Klick-/Flip-Down-Logik
   weiter oben in dieser Datei, ohne zusaetzlichen Code dafuer.

   Neuen Begriff aufnehmen: einfach FR_GLOSSARY ergaenzen.
   Wirkt ab dann automatisch auf allen Artikeln, in denen das
   Wort vorkommt -- keine einzelne Artikeldatei muss angefasst
   werden.

   Bekannte Grenze: wirkt nur auf die deutsche Textversion.
   Nach dem Umschalten auf Englisch werden keine Tooltips
   gesetzt (kein Fehler, nur keine Abdeckung dort), da das ein
   zweites, englisches Begriffs-Woerterbuch erfordern wuerde.
   Beim Zurueckschalten auf Deutsch greift es wieder normal,
   da es ueber frPageRecomputers erneut ausgefuehrt wird. */

/* ============================================================
   FR_CONFIG — zentrale Konstanten-Tabelle
   ============================================================
   Wiederkehrende gesetzliche/wirtschaftliche Werte an EINER Stelle
   pflegen, statt sie in jedem Artikel einzeln zu suchen und zu
   ändern. Läuft nach demselben Prinzip wie FR_GLOSSARY weiter unten:
   ein Element im Artikel bekommt statt der festen Zahl ein
   data-fr-const-Attribut, z.B.
     <span data-fr-const="mindestlohn"></span> €/Std.
   frInitConstants() (siehe unten bei DOMContentLoaded) füllt beim
   Laden automatisch den passenden Wert ein. Ändert sich ein Wert
   (z.B. Mindestlohn-Erhöhung zum 1.1.2027), reicht EINE Änderung
   hier — alle Artikel, die ihn per data-fr-const referenzieren,
   ziehen beim nächsten Laden automatisch nach.
   Quellen zuletzt geprüft: 06.08.2026. */
const FR_CONFIG = {
  mwst_regulaer: '19',                    // Regulärer Mehrwertsteuersatz in %
  mwst_ermaessigt: '7',                   // Ermäßigter Mehrwertsteuersatz in %
  sparerpauschbetrag: '1.000',            // Sparerpauschbetrag Single, in €/Jahr
  sparerpauschbetrag_en: '1,000',         // dieselbe Zahl, englisches Tausendertrenner-Format
  sparerpauschbetrag_paar: '2.000',       // Sparerpauschbetrag Ehepaar/eingetr. Lebenspartnerschaft, in €/Jahr
  sparerpauschbetrag_paar_en: '2,000',    // dieselbe Zahl, englisches Tausendertrenner-Format
  mindestlohn: '13,90',                   // Gesetzlicher Mindestlohn, €/Std., seit 01.01.2026
  mindestlohn_ab_2027: '14,60',           // Gesetzlicher Mindestlohn, €/Std., ab 01.01.2027
  abgeltungssteuer: '25',                 // Abgeltungssteuersatz auf Kapitalerträge, in %
  soli: '5,5',                            // Solidaritätszuschlag auf die Abgeltungssteuer, in %
  abgeltungssteuer_effektiv: '26,375',    // 25 % Abgeltungssteuer + 5,5 % Soli darauf, in %
  ezb_leitzins: '2,25',                   // EZB-Einlagesatz (der für Sparer relevante Leitzins), in %, seit 11.06.2026
  renteneintritt_regel: '67',             // Regelaltersgrenze ab Geburtsjahrgang 1964 (gleitend für ältere Jahrgänge)
  kleinunternehmergrenze: '25.000',       // Vorjahresumsatz-Grenze für die Kleinunternehmerregelung (§19 UStG), in €/Jahr — seit 1.1.2025 (vorher 22.000 €)
  kleinunternehmergrenze_hart: '100.000', // Neue harte Obergrenze im laufenden Jahr seit 1.1.2025 — wird sie gerissen, endet die Regelung sofort
  gkv_beitragsbemessungsgrenze: '5.812,50', // GKV-Beitragsbemessungsgrenze, €/Monat, 2026
  gkv_mindestbemessungsgrundlage: '1.318,33' // GKV-Mindestbemessungsgrundlage für freiwillig versicherte Selbstständige, €/Monat, 2026
};

/* Sonderfall Renteneintrittsalter: kein fester Wert, sondern eine
   Gleitskala nach Geburtsjahrgang (66 Jahre + X Monate bis Jahrgang
   1964, danach 67 Jahre). Deshalb keine einzelne Zahl in FR_CONFIG,
   sondern data-fr-const="renteneintritt_regel" liefert bewusst nur
   die END-Regelaltersgrenze "67" — für Artikel, die die genaue
   Gleitskala erklären, weiterhin manuell mit Tabelle arbeiten. */

const FR_GLOSSARY = {

  'AGB': { id: 'agb',
    de: `Allgemeine Geschaeftsbedingungen — das Vertrags-Kleingedruckte einer Bank oder eines Anbieters. Steht dort ein Verbot der geschaeftlichen Nutzung eines Privatkontos, ist das AGB-Recht, kein Gesetz.`,
    en: `General terms and conditions — the fine print of a bank or provider's contract. A ban on business use of a private account there is contractual, not statutory law.` },
  'Betriebsprüfung': { id: 'betriebspruefung',
    de: `Pruefung durch das Finanzamt, ob Buchhaltung und Steuererklaerungen eines Betriebs korrekt sind. Der Pruefer erhaelt dabei Einblick in die betroffenen Konten — bei einem gemischt genutzten Konto also auch in private Ausgaben.`,
    en: `A tax office audit checking whether a business's bookkeeping and tax returns are correct. The auditor gets access to the accounts involved — including private spending if the account is mixed-use.` },
  'Bootstrapping': { id: 'bootstrapping',
    de: `Ein Unternehmen ausschliesslich aus eigenen Ersparnissen und laufenden Einnahmen aufbauen, ohne Fremdkapital (Kredit, Investoren). Typisch fuer Solo-Freelancer mit geringem Startkapitalbedarf — bei Geschaeftsmodellen mit Personal und teurer Ausstattung stoesst reines Bootstrapping schnell an Grenzen.`,
    en: `Building a business entirely from personal savings and ongoing revenue, without outside capital (loans, investors). Typical for solo freelancers with low starting-capital needs — for business models involving staff and expensive equipment, pure bootstrapping quickly hits its limits.` },
  'bootstrappen': { id: 'bootstrapping',
    de: `Ein Unternehmen ausschliesslich aus eigenen Ersparnissen und laufenden Einnahmen aufbauen, ohne Fremdkapital (Kredit, Investoren). Typisch fuer Solo-Freelancer mit geringem Startkapitalbedarf — bei Geschaeftsmodellen mit Personal und teurer Ausstattung stoesst reines Bootstrapping schnell an Grenzen.`,
    en: `Building a business entirely from personal savings and ongoing revenue, without outside capital (loans, investors). Typical for solo freelancers with low starting-capital needs — for business models involving staff and expensive equipment, pure bootstrapping quickly hits its limits.` },
  'FinTS': { id: 'fints',
    de: `Deutscher Standard (frueher HBCI), ueber den Buchhaltungssoftware wie sevDesk oder Lexware Office Kontoumsaetze automatisch bei der Bank abruft, statt sie manuell einzutippen.`,
    en: `A German banking standard (formerly HBCI) that lets bookkeeping software like sevDesk or Lexware Office pull account transactions automatically instead of typing them in by hand.` },
  'EBITDA': { id: 'ebit-ebitda',
    de: `EBIT plus wieder hinzugerechnete Abschreibungen — nuetzlich bei kapitalintensiven Geschaeften, kann aber echte Kosten verschleiern.`,
    en: `EBIT with depreciation added back — useful for capital-intensive businesses, but can mask real costs.` },
  'EBIT': { id: 'ebit-ebitda',
    de: `Gewinn vor Zinsen und Steuern — vergleicht Unternehmen rein operativ, ohne Finanzierungs- und Steuereffekte.`,
    en: `Earnings before interest and taxes — compares companies on operating performance alone.` },
  'Diversifikation': { id: 'diversifikation',
    de: `Geld ueber viele verschiedene Anlagen zu streuen, sodass keine einzelne das gesamte Portfolio versenken kann.`,
    en: `Spreading money across many investments so no single one can sink the whole portfolio.` },
  'Dividendenrendite': { id: 'dividendenrendite',
    de: `Jaehrliche Dividende pro Aktie geteilt durch den aktuellen Kurs, in Prozent — aendert sich taeglich mit dem Kurs.`,
    en: `Annual dividend per share divided by the current share price, as a percentage.` },
  'Marktkapitalisierung': { id: 'marktkapitalisierung',
    de: `Aktienkurs mal Anzahl ausstehender Aktien — der gesamte Marktwert eines Unternehmens.`,
    en: `Share price times outstanding shares — a company's total market value.` },
  'Market Maker': { id: 'market-maker',
    de: `Ein Marktteilnehmer, der fortlaufend Kauf- und Verkaufskurs stellt und damit Handel ueberhaupt moeglich macht.`,
    en: `A participant who continuously quotes both a buy and sell price, making trading possible at all.` },
  'Blue Chip': { id: 'blue-chip',
    de: `Ein etabliertes, grosses, finanziell stabiles Unternehmen mit langer Erfolgsbilanz.`,
    en: `An established, large, financially stable company with a long track record.` },
  'Circuit Breaker': { id: 'circuit-breaker',
    de: `Eine seltene, marktweite Handelsaussetzung — in den USA automatisch bei -7/-13/-20 % im S&P 500.`,
    en: `A rare, market-wide trading halt — in the US, triggered automatically at -7/-13/-20% on the S&amp;P 500.` },
  'Combined Ratio': { id: 'combined-ratio',
    de: `Schadenkosten plus Betriebskosten geteilt durch verdiente Praemien — unter 100 % heisst profitables Kerngeschaeft.`,
    en: `Claims plus operating costs divided by premiums earned — under 100% means a profitable core business.` },
  'Volatilitätsunterbrechung': { id: 'volatilitaetsunterbrechung',
    de: `Xetras Standard-Schutzmechanismus fuer ein einzelnes Wertpapier — Routine, kein Krisensignal.`,
    en: `Xetra's standard protection mechanism for a single security — routine, not a crisis signal.` },
  'Tracking Difference': { id: 'tracking-difference',
    de: `Wie weit die tatsaechliche ETF-Rendite von ihrem Vergleichsindex abweicht — besseres Qualitaetssignal als die TER allein.`,
    en: `How far an ETF's actual return deviates from its benchmark — a better quality signal than the TER alone.` },
  'Insiderhandel': { id: 'insiderhandel',
    de: `Handel auf Basis nicht-oeffentlicher, kursrelevanter Informationen zum eigenen Vorteil — illegal nach EU- und US-Recht.`,
    en: `Trading on non-public, price-relevant information for personal gain — illegal under EU and US law.` },
  'Zinseszins': { id: 'zinseszins',
    de: `Zinsen, die auch auf bereits gutgeschriebene Zinsen frueherer Perioden anfallen — macht lange Anlagehorizonte so wirkungsvoll.`,
    en: `Interest earned on interest already credited in earlier periods — what makes long horizons so powerful.` },
  'Thesaurierend': { id: 'ausschuettend-thesaurierend',
    de: `Ausschuettungen werden automatisch im Fonds wieder angelegt statt ausgezahlt.`,
    en: `Payouts are automatically reinvested inside the fund instead of paid out.` },
  'Rendite': { id: 'rendite',
    de: `Der Gewinn oder Verlust einer Geldanlage, meist als Prozentsatz pro Jahr.`,
    en: `The gain or loss on an investment, usually shown as a percentage per year.` },

  /* -- Ergänzt 03.08.2026: aus glossar.html verdrahtet + neu recherchiert -- */
  'Abgeltungssteuer': { id: 'abgeltungssteuer',
    de: `Deutschlands pauschale Steuer auf Kapitalerträge: 25 % plus Solidaritätszuschlag und ggf. Kirchensteuer. Wird von der Bank automatisch vor der Auszahlung einbehalten.`,
    en: `Germany's flat tax on capital gains: 25% plus solidarity surcharge and, if applicable, church tax.` },
  'BDC': { id: 'bdc',
    de: `Ein US-Unternehmenstyp, der kleinen und mittelständischen Unternehmen Kredite gewährt und gesetzlich verpflichtet ist, den Großteil der Erträge auszuschütten — daher oft hohe, teils monatliche Dividendenrenditen.`,
    en: `A US company type that lends to small/mid-sized businesses and must pay out most of its taxable income to shareholders — often high, sometimes monthly, dividend yields.` },
  'Beitragsbemessungsgrenze': { id: 'beitragsbemessungsgrenze',
    de: `Einkommens-Obergrenze, bis zu der Kranken- und Pflegeversicherungsbeitraege berechnet werden. 2026: 5.812,50 EUR im Monat. Wer mehr verdient, zahlt trotzdem nicht mehr.`,
    en: `The income ceiling up to which health and long-term-care insurance contributions are calculated. 2026: EUR 5,812.50 per month. Earning more than that doesn't raise the contribution further.` },
  'CAGR': { id: 'cagr',
    de: `Die durchschnittliche jährliche Wachstumsrate — rechnet eine holprige Mehrjahresrendite in eine einzige, vergleichbare Jahreszahl um.`,
    en: `The annualized average growth rate — converts a bumpy, multi-year return into one single, comparable yearly figure.` },
  'CEO': { id: 'ceo',
    de: `Der oberste Manager eines Unternehmens — auf Deutsch: Vorstandsvorsitzender oder Vorstandschef.`,
    en: `The company's top manager — in German, Vorstandsvorsitzender.` },
  'DATEV': { id: 'datev',
    de: `Marktfuehrende Software-Infrastruktur fuer deutsche Steuerberater. „DATEV-faehig" bedeutet, dass ein Buchhaltungstool Daten in einem Format exportiert, das Kanzleien direkt weiterverarbeiten koennen.`,
    en: `Germany's dominant software infrastructure for tax advisory firms. A bookkeeping tool being &lsquo;DATEV-compatible&rsquo; means it exports data in a format tax firms can process directly.` },
  'DAX': { id: 'dax',
    de: `Der deutsche Leitindex, bildet die 40 größten börsennotierten deutschen Unternehmen ab.`,
    en: `Germany's leading stock index, tracking the 40 largest publicly traded German companies.` },
  'ESG': { id: 'esg',
    de: `Sammelbegriff für „nachhaltige" Anlagekriterien — Umwelt, Soziales, Unternehmensführung. Kein geschütztes Gütesiegel: jeder Indexanbieter bewertet anders.`,
    en: `Umbrella term for 'sustainable' investing criteria — environment, social issues, corporate governance. Not a protected seal with one fixed standard.` },
  'ETF': { id: 'etf',
    de: `Ein börsengehandelter Indexfonds — bildet einen Markt wie den MSCI World nach, statt einzelne Aktien auszuwählen.`,
    en: `An index fund that trades on the stock exchange like a share, tracking a market such as the MSCI World.` },
  'Einlagensicherung': { id: 'einlagensicherung',
    de: `Gesetzlicher Schutz von Bankguthaben bis 100.000 € pro Kunde und Bank (EU-weit einheitlich). Gilt für Giro-, Tagesgeld- und Verrechnungskonten bei Banken — Wertpapiere im Depot sind ohnehin als Sondervermögen geschützt, P2P-Kredite (z. B. Bondora) fallen NICHT darunter.`,
    en: `Statutory protection of bank deposits up to €100,000 per customer and bank (uniform across the EU). Covers checking, savings, and settlement accounts at banks — securities in a depot are protected separately as special assets anyway, but P2P loans (e.g. Bondora) are NOT covered.` },
  'FIRE': { id: 'fire',
    de: `Eine Bewegung, die auf einer ungewöhnlich hohen Sparquote (oft 40–70 %) aufbaut, um finanzielle Unabhängigkeit deutlich vor dem regulären Renteneintritt zu erreichen.`,
    en: `A movement centered on saving an unusually high share of income (often 40-70%) to reach financial independence much earlier than the standard retirement age.` },
  'Freelancer': { id: 'freelancer',
    de: `Selbstständiger, der Auftragsarbeit für wechselnde Kunden leistet, meist projektbasiert. Kann rechtlich Freiberufler oder gewerblicher Einzelunternehmer sein — welches der beiden hängt von der konkreten Tätigkeit ab, nicht vom Begriff „Freelancer" selbst.`,
    en: `A self-employed person doing project-based work for a rotating set of clients. Legally either a Freiberufler or a commercial sole proprietor in Germany — which one depends on the actual activity, not on the word "freelancer" itself.` },
  'Freistellungsauftrag': { id: 'freistellungsauftrag',
    de: `Ein Auftrag an die Bank, Kapitalerträge bis zum Sparerpauschbetrag steuerfrei auszuzahlen, statt automatisch Steuer einzubehalten.`,
    en: `An instruction to your bank to pay out capital gains tax-free up to the Sparerpauschbetrag, instead of withholding tax automatically.` },
  'Geldmarktfonds': { id: 'geldmarktfonds',
    de: `Fonds, der in sehr kurzlaufende, hochliquide Zinsanlagen investiert und die Rendite eng am aktuellen Leitzins abbildet. Typisches Parkdepot fuer Geld, das nicht spekulativ, sondern sicher und jederzeit verfuegbar angelegt werden soll.`,
    en: `A fund investing in very short-term, highly liquid interest-bearing instruments, tracking the current key interest rate closely. A typical parking spot for money that needs to stay safe and available, not invested speculatively.` },
  'Gender Pay Gap': { id: 'gender-pay-gap',
    de: `Der Lohnunterschied zwischen Frauen und Männern, meist sowohl unbereinigt als auch bereinigt (gleicher Job, Qualifikation, Erfahrung) ausgewiesen.`,
    en: `The pay gap between women and men, usually reported both unadjusted and adjusted (same job, qualification, experience).` },
  'Grundfreibetrag': { id: 'grundfreibetrag',
    de: `Der Teil des Jahreseinkommens, der komplett steuerfrei bleibt, unabhängig von der Einkunftsart — zu unterscheiden vom Sparerpauschbetrag, der nur für Kapitalerträge gilt.`,
    en: `The portion of annual income that is entirely tax-free regardless of source — different from the Sparerpauschbetrag, which applies only to capital gains.` },
  'Günstigerprüfung': { id: 'guenstigerpruefung',
    de: `Das Finanzamt prüft automatisch, ob dein persönlicher Einkommensteuersatz statt der pauschalen 25 % Abgeltungssteuer günstiger ist — und wendet die niedrigere Variante an.`,
    en: `The tax office automatically checks whether your personal income tax rate works out cheaper than the flat 25% Abgeltungssteuer — and applies whichever is lower.` },
  'Gewerbesteuer': { id: 'gewerbesteuer',
    de: `Gemeindesteuer auf den Gewerbeertrag. Einzelunternehmer und Freiberufler zahlen sie erst ab einem Freibetrag von 24.500 EUR Jahresgewinn, und die Belastung wird bei Einzelunternehmen ueber die Einkommensteuer teilweise wieder angerechnet.`,
    en: `A municipal tax on trade income. Sole proprietors only pay it above a EUR 24,500 annual profit allowance, and for sole proprietorships part of it is credited back against income tax.` },
  'Home Bias': { id: 'home-bias',
    de: `Die Neigung, überproportional im eigenen Heimatland zu investieren statt global zu streuen — konzentriert das Risiko auf eine einzelne Volkswirtschaft.`,
    en: `The tendency to invest disproportionately in your own home country instead of spreading globally — concentrates risk in a single economy.` },
  'IPO': { id: 'ipo',
    de: `Der erste Börsengang eines Unternehmens. Davor werden seine Anteile nicht öffentlich gehandelt.`,
    en: `A company's first listing on a stock exchange. Before that, its shares aren't publicly traded.` },
  'ISIN': { id: 'isin',
    de: `Ein eindeutiger, 12-stelliger Code, der ein bestimmtes Wertpapier weltweit identifiziert.`,
    en: `A unique 12-character code that identifies a specific security worldwide.` },
  'Anlage KAP': { id: 'kap',
    de: `Eine Anlage zur Steuererklärung für Kapitalerträge. Nur in bestimmten Fällen Pflicht, freiwillig abgegeben kann sie sich über die Günstigerprüfung auszahlen.`,
    en: `A supplementary form for the German tax return that reports capital income.` },
  'KGV': { id: 'kgv',
    de: `Aktienkurs geteilt durch Gewinn je Aktie. Eine grobe, weit verbreitete Kennzahl dafür, ob eine Aktie im Verhältnis zu ihrem Gewinn teuer oder günstig aussieht.`,
    en: `Price-to-earnings ratio: share price divided by earnings per share.` },
  'Kursindex': { id: 'kursindex-performanceindex',
    de: `Ein Index, der nur Kursbewegungen abbildet und Dividenden ignoriert — Nikkei 225 und Nasdaq Composite funktionieren so, im Unterschied zu einem Performanceindex wie dem DAX.`,
    en: `An index that tracks share prices only, ignoring dividends — the Nikkei 225 and Nasdaq Composite work this way, unlike a total-return index such as the DAX.` },
  'Performanceindex': { id: 'kursindex-performanceindex',
    de: `Ein Index, der Dividenden automatisch wieder in den Indexstand einrechnet — der DAX funktioniert seit 1988 so, im Unterschied zu einem reinen Kursindex.`,
    en: `A total-return index that automatically reinvests dividends into the index level — the DAX has worked this way since 1988, unlike a pure price index.` },
  'Leverage': { id: 'leverage',
    de: `Mit geliehenem Geld eine Investition über das eigene Kapital hinaus vergrößern. Verstärkt Gewinne und Verluste gleichermaßen.`,
    en: `Using borrowed money to increase the size of an investment beyond your own capital. Amplifies both gains and losses.` },
  'Mindestbemessungsgrundlage': { id: 'mindestbemessungsgrundlage',
    de: `Fiktives Mindesteinkommen, auf dessen Basis freiwillig gesetzlich versicherte Selbststaendige ihren Krankenkassenbeitrag zahlen muessen — auch wenn der tatsaechliche Gewinn niedriger ist. 2026: 1.318,33 EUR im Monat.`,
    en: `A fictional minimum income that self-employed people with voluntary statutory health insurance must pay contributions on — even if actual profit is lower. 2026: EUR 1,318.33 per month.` },
  'MdB': { id: 'mdb',
    de: `Mitglied des Bundestages.`,
    en: `Mitglied des Bundestages — member of the German federal parliament.` },
  'MSCI': { id: 'msci',
    de: `Ein Indexanbieter, dessen Indizes — allen voran MSCI World und MSCI ACWI — von vielen der beliebtesten ETFs nachgebildet werden.`,
    en: `An index provider whose benchmarks — above all MSCI World and MSCI ACWI — are tracked by many of the most popular ETFs.` },
  'Nettovermögen': { id: 'nettovermoegen',
    de: `Vermögen abzüglich Schulden. Bei Milliardären fast immer der aktuelle Marktwert von Firmenanteilen — kein Geld auf dem Konto.`,
    en: `Assets minus debts. For billionaires, almost always the current market value of company shares — not cash in a bank account.` },
  'NV-Bescheinigung': { id: 'nv-bescheinigung',
    de: `Eine Bescheinigung des Finanzamts, dass das Gesamteinkommen so niedrig ist, dass gar keine Steuer anfällt — erlaubt komplett steuerfreie Auszahlung, über den Sparerpauschbetrag hinaus.`,
    en: `A certificate confirming your total income is so low that no tax is due at all — allows completely tax-free payout, beyond the Sparerpauschbetrag.` },
  'OCR': { id: 'ocr',
    de: `Optical Character Recognition — Texterkennung, mit der Buchhaltungs-Apps abfotografierte Belege automatisch auslesen (Betrag, Datum, Haendler), statt sie manuell eintippen zu muessen.`,
    en: `Optical Character Recognition — the technology bookkeeping apps use to automatically read photographed receipts (amount, date, merchant) instead of requiring manual entry.` },
  'Opportunitätskosten': { id: 'opportunitaetskosten',
    de: `Das, worauf man verzichtet, wenn man sich für eine Option statt einer anderen entscheidet.`,
    en: `What you give up by choosing one option over another.` },
  'Privatentnahme': { id: 'privatentnahme',
    de: `Geld, das ein Einzelunternehmer oder Freiberufler vom Geschaeftskonto aufs private Konto ueberweist. Rechtlich kein „Gehalt", sondern eine Entnahme aus dem eigenen Betriebsvermoegen — steuerlich unabhaengig vom versteuerten Gewinn.`,
    en: `Money a sole proprietor or freelancer transfers from the business account to their private account. Legally not a &lsquo;salary&rsquo; but a withdrawal from their own business assets — tax treatment is independent of the taxed profit.` },
  'PSD2': { id: 'psd2',
    de: `EU-Zahlungsdiensterichtlinie, die Banken zwingt, Kontodaten ueber standardisierte Schnittstellen freizugeben — Grundlage dafuer, dass Buchhaltungssoftware Kontobewegungen automatisch abrufen kann.`,
    en: `An EU payment services directive requiring banks to expose account data via standardized interfaces — the basis for bookkeeping software automatically pulling account transactions.` },
  'Rebalancing': { id: 'rebalancing',
    de: `Das periodische Zurücksetzen eines Depots auf die ursprüngliche Ziel-Gewichtung, nachdem Marktbewegungen sie verschoben haben.`,
    en: `Periodically resetting a portfolio back to its original target weighting, after market movements have shifted it.` },
  'Reverse-Charge-Verfahren': { id: 'reverse-charge',
    de: `Umsatzsteuer-Mechanismus bei Rechnungen von auslaendischen Dienstleistern: Nicht der Anbieter, sondern der deutsche Kunde meldet und zahlt die Umsatzsteuer selbst beim eigenen Finanzamt an.`,
    en: `A VAT mechanism for invoices from foreign service providers: instead of the provider, the German customer reports and pays the VAT to their own tax office.` },
  'REIT': { id: 'reit',
    de: `Ein börsennotiertes Unternehmen, das Immobilien besitzt und verwaltet und gesetzlich verpflichtet ist, den Großteil der Erträge auszuschütten.`,
    en: `A publicly traded company that owns and operates income-producing real estate and must pay out most of its taxable income to shareholders.` },
  'Schufa-Score': { id: 'schufa-score',
    de: `Bonitaetswert der Schutzgemeinschaft fuer allgemeine Kreditsicherung. Beeinflusst, ob und zu welchen Konditionen Banken, Vermieter oder Mobilfunkanbieter einen Vertrag anbieten — bei Selbststaendigen oft empfindlicher gegenueber schwankendem Einkommen.`,
    en: `A creditworthiness score from Germany's main credit bureau (Schufa). Influences whether and on what terms banks, landlords, or mobile carriers offer a contract — often more sensitive to fluctuating income for the self-employed.` },
  'Sequenzrisiko': { id: 'sequenzrisiko',
    de: `Das Risiko, dass die Reihenfolge guter und schlechter Jahre — nicht nur ihr Durchschnitt — das Ergebnis bestimmt, besonders kurz nach Entnahmebeginn.`,
    en: `The risk that the order of good and bad years, not just their average, determines your outcome — especially right after withdrawals begin.` },
  'Side Hustle': { id: 'side-hustle',
    de: `Ein Nebenjob neben der Haupttätigkeit für zusätzliches Einkommen — manche bleiben klein, andere wachsen zu einem tragfähigen Geschäft heran, das den Hauptjob finanziell vollständig überholt.`,
    en: `A side job pursued alongside a main occupation for extra income — some stay small, others grow into a viable business that ends up financially overtaking the main job.` },
  'Shiller-KGV': { id: 'shiller-kgv',
    de: `Wie das reguläre KGV, aber geteilt durch die durchschnittlichen, inflationsbereinigten Gewinne der letzten 10 Jahre — glättet kurzfristige Gewinnschwankungen.`,
    en: `Like the regular P/E ratio, but divided by average inflation-adjusted earnings over the past 10 years — smooths out short-term profit swings.` },
  'Sparerpauschbetrag': { id: 'sparerpauschbetrag',
    de: `Der steuerfreie Freibetrag für Kapitalerträge: 1.000 € pro Jahr für Singles, 2.000 € für gemeinsam veranlagte Ehepaare.`,
    en: `The tax-free allowance for capital gains: 1,000 € per year for singles, 2,000 € for married couples filing jointly.` },
  'Sparquote': { id: 'sparquote',
    de: `Der Anteil des Einkommens, der gespart statt ausgegeben wird.`,
    en: `The share of income that is saved rather than spent.` },
  'Sondervermögen': { id: 'sondervermoegen',
    de: `Fondsvermögen, das rechtlich getrennt vom Vermögen des Fondsanbieters gehalten wird — geht der Anbieter pleite, sind Anteile geschützt.`,
    en: `Fund assets legally kept separate from the fund provider's own assets — if the provider goes bankrupt, your shares are protected.` },
  'TER': { id: 'ter',
    de: `Die jährlichen Gesamtkosten eines Fonds, als Prozentsatz der Anlagesumme.`,
    en: `A fund's total annual running cost, as a percentage of your invested amount.` },
  'VIX': { id: 'vix',
    de: `Ein Maß für die erwartete Volatilität des S&P 500 über die nächsten 30 Tage — oft der „Angstindex" der Märkte genannt. Unter 15 ruhig, 15–30 normal, über 30 erhöhter Stress.`,
    en: `A measure of expected S&P 500 volatility over the next 30 days — often called the market's 'fear gauge'. Below 15 is calm, 15-30 normal, above 30 elevated stress.` },
  'Volatilitätsverlust': { id: 'volatilitaetsverlust',
    de: `Der mathematische Grund, warum abwechselnde Gewinne und Verluste derselben Prozenthöhe einen Wert nie zum Ausgangspunkt zurückführen: (1+x)(1-x)=1-x², und x² ist immer positiv.`,
    en: `The mathematical reason why alternating gains and losses of the same percentage never bring a value back to its starting point: (1+x)(1-x)=1-x², and x² is always positive.` },
  'Vorabpauschale': { id: 'vorabpauschale',
    de: `Eine deutsche Besonderheit: Auch thesaurierende ETFs werden einmal im Jahr auf einen fiktiven, berechneten Gewinn besteuert.`,
    en: `A German quirk: even accumulating ETFs are taxed once a year on a notional, calculated gain.` },
  'Zahlungsziel': { id: 'zahlungsziel',
    de: `Die Frist, innerhalb derer eine Rechnung bezahlt werden muss. Lange Zahlungsziele von Großkunden (60-90 Tage) koennen die Liquiditaet von Freelancern erheblich belasten.`,
    en: `The deadline by which an invoice must be paid. Long payment terms from large clients (60-90 days) can put significant strain on a freelancer's cash flow.` },
  'WKN': { id: 'wkn',
    de: `Eine rein deutsche, 6-stellige Wertpapierkennnummer, das ältere heimische Pendant zur internationalen ISIN.`,
    en: `A German-only 6-character security code, the older domestic sibling of the international ISIN.` },
  'Girokonto': { id: 'girokonto',
    de: `Das normale Bankkonto fuer den taeglichen Zahlungsverkehr — Gehalt/Honorar rein, Miete und Einkaeufe raus. Kein Wertpapierdepot und keine Geldanlage, sondern reine Abwicklungsstelle.`,
    en: `The normal bank account for everyday payments — salary or fees in, rent and purchases out. Not a securities account and not an investment vehicle, just the settlement layer.` },
  'Depot': { id: 'depot',
    de: `Ein Konto speziell zur Verwahrung von Wertpapieren wie Aktien und ETFs — getrennt vom Girokonto, meist mit einem angeschlossenen Verrechnungskonto fuer den Geldfluss.`,
    en: `An account specifically for holding securities like stocks and ETFs — separate from your checking account, usually paired with a settlement account for the cash side.` },
  'Festgeld': { id: 'festgeld',
    de: `Geld, das für eine feste Laufzeit (z.B. 6 oder 12 Monate) zu einem festen Zinssatz angelegt wird. Waehrend der Laufzeit kommst du normalerweise nicht ohne Weiteres an das Geld — im Gegensatz zum taeglich verfuegbaren Tagesgeld.`,
    en: `Money locked in for a fixed term (e.g. 6 or 12 months) at a fixed interest rate. You typically can't access it early — unlike a Tagesgeld account, which stays available daily.` },
  'Tagesgeldkonto': { id: 'tagesgeldkonto',
    de: `Ein verzinstes Sparkonto ohne feste Laufzeit — das Geld bleibt taeglich verfuegbar, der Zinssatz kann sich aber jederzeit aendern, anders als beim Festgeld.`,
    en: `An interest-bearing savings account with no fixed term — your money stays available daily, but unlike Festgeld, the rate can change at any time.` },
  'Liquidität': { id: 'liquiditaet',
    de: `Die Faehigkeit, fällige Zahlungen jederzeit begleichen zu koennen. Ein Unternehmen kann auf dem Papier profitabel sein und trotzdem insolvent gehen, wenn ihm schlicht das Geld zum richtigen Zeitpunkt fehlt.`,
    en: `The ability to meet payment obligations as they come due. A business can be profitable on paper and still go bankrupt if it simply runs out of cash at the wrong moment.` },
  'Insolvenz': { id: 'insolvenz',
    de: `Die Zahlungsunfaehigkeit oder Ueberschuldung eines Unternehmens oder einer Privatperson — der rechtliche Zustand, der ein Insolvenzverfahren ausloest.`,
    en: `The state of being unable to pay debts or being over-indebted — the legal condition that triggers formal insolvency proceedings.` },
  'Rechtsform': { id: 'rechtsform',
    de: `Der rechtliche Rahmen eines Unternehmens (z.B. Einzelunternehmen, GbR, GmbH) — bestimmt vor allem, wie du haftest: mit deinem Privatvermoegen oder nur mit dem Firmenvermoegen.`,
    en: `A business's legal structure (sole proprietorship, GbR, GmbH, etc.) — determines above all how you're liable: with your personal assets, or only with the company's assets.` },
  'Kleinunternehmerregelung': { id: 'kleinunternehmerregelung',
    de: `Eine Vereinfachung nach § 19 UStG: Wer im Vorjahr unter 25.000 € Umsatz blieb (und im laufenden Jahr unter 100.000 € bleibt), muss keine Umsatzsteuer ausweisen und abfuehren — spart Buerokratie, aber auch den Vorsteuerabzug.`,
    en: `A simplification under German tax law: businesses with under €25,000 revenue the prior year (and under €100,000 in the current year) don't charge or remit VAT — less paperwork, but no input-tax deduction either.` },
  'VG Wort': { id: 'vg-wort',
    de: `Die Verwertungsgesellschaft Wort schuettet Tantiemen an Autoren und Websitebetreiber aus, basierend auf Zaehlmarken (Pixeln), die an eine bestimmte URL gebunden sind und Zugriffszahlen erfassen — ab einer Mindestschwelle pro Zaehlmarke wird ausgezahlt.`,
    en: `Germany's collecting society for text usage pays out royalties to authors and site owners, based on counting pixels tied to a specific URL that track visits — payout kicks in once a minimum threshold per pixel is reached.` },
  'Leitzins': { id: 'leitzins',
    de: `Der Zinssatz, zu dem sich Geschaeftsbanken bei der Zentralbank (in der Eurozone: EZB) Geld leihen koennen. Er wirkt sich indirekt auf so gut wie jeden anderen Zinssatz aus — Spareinlagen, Kredite, Baufinanzierung.`,
    en: `The rate at which commercial banks can borrow from the central bank (the ECB in the eurozone). It indirectly influences almost every other interest rate — savings, loans, mortgages.` },
  'Umsatzsteuer': { id: 'umsatzsteuer',
    de: `Die Steuer auf den Verkauf von Waren und Dienstleistungen, in Deutschland meist 19 % oder ermaessigt 7 %. Wird vom Verkaeufer eingezogen und ans Finanzamt abgefuehrt — Kleinunternehmer sind davon befreit.`,
    en: `The tax on sales of goods and services, usually 19% or a reduced 7% in Germany. Collected by the seller and remitted to the tax office — small-business-scheme entrepreneurs are exempt.` },
  'Realzins': { id: 'realzins',
    de: `Der Nominalzins abzueglich der Inflationsrate — zeigt, ob dein Geld nach Kaufkraft wirklich mehr wird oder trotz positivem Zinssatz real an Wert verliert.`,
    en: `The nominal interest rate minus the inflation rate — shows whether your money is actually gaining purchasing power, or losing real value despite a positive rate.` },
  'Nominalzins': { id: 'nominalzins',
    de: `Der auf dem Papier vereinbarte Zinssatz, ohne Beruecksichtigung der Inflation — die Zahl, die in der Werbung steht, aber nicht die ganze Geschichte erzaehlt.`,
    en: `The interest rate as stated in the contract, without accounting for inflation — the number in the advertisement, but not the whole story.` },
  'Rating': { id: 'rating',
    de: `Eine Einstufung der Kreditwuerdigkeit von Staaten oder Unternehmen durch Agenturen wie Moody's oder S&P — beeinflusst, zu welchem Zinssatz sich diese Geld leihen koennen.`,
    en: `A creditworthiness assessment of countries or companies by agencies like Moody's or S&P — influences the interest rate at which they can borrow.` },
  'ROI': { id: 'roi',
    de: `Return on Investment — das Verhaeltnis von Gewinn zu eingesetztem Kapital, meist in Prozent. Eine der meistgenutzten, aber auch am haeufigsten unpraezise verwendeten Kennzahlen in der Wirtschaft.`,
    en: `Return on Investment — the ratio of profit to capital invested, usually expressed as a percentage. One of the most-used, but also most loosely used, metrics in business.` },
  'Portfolio': { id: 'portfolio',
    de: `Die Gesamtheit aller Geldanlagen einer Person — Aktien, ETFs, Anleihen, Immobilien und mehr, zusammen betrachtet statt einzeln.`,
    en: `The sum of all of a person's investments — stocks, ETFs, bonds, real estate and more, viewed together instead of in isolation.` },
  'Spread': { id: 'spread',
    de: `Die Differenz zwischen An- und Verkaufskurs eines Wertpapiers. Ein enger Spread bedeutet niedrige versteckte Handelskosten, ein weiter Spread verteuert jeden Kauf und Verkauf zusaetzlich zur sichtbaren Gebuehr.`,
    en: `The gap between the buy and sell price of a security. A tight spread means low hidden trading costs; a wide one adds extra cost to every buy and sell beyond the visible fee.` },
  'Fixkosten': { id: 'fixkosten',
    de: `Kosten, die unabhaengig vom Umsatz konstant anfallen — Miete, Versicherung, feste Gehaelter. Sie laufen auch dann weiter, wenn im Business gerade nichts passiert.`,
    en: `Costs that stay constant regardless of revenue — rent, insurance, fixed salaries. They keep running even when the business isn't generating income.` },
  'Variable Kosten': { id: 'variable-kosten',
    de: `Kosten, die mit der Produktions- oder Absatzmenge steigen und fallen — z.B. Material oder Versandkosten. Je mehr verkauft wird, desto hoeher diese Kosten, aber auch der Umsatz.`,
    en: `Costs that rise and fall with production or sales volume — materials, shipping. The more you sell, the higher these costs, but also the higher the revenue.` },
  'Handelsregister': { id: 'handelsregister',
    de: `Ein oeffentliches Verzeichnis beim Amtsgericht, in dem Kaufleute und Kapitalgesellschaften eingetragen sind — relevant z.B. beim Kauf eines bestehenden Unternehmens, um dessen rechtlichen Status zu pruefen.`,
    en: `A public register at the local court listing merchants and companies — relevant, for example, when buying an existing business, to check its legal status.` },
  'Grenzsteuersatz': { id: 'grenzsteuersatz',
    de: `Der Steuersatz, der auf den naechsten verdienten Euro faellig wird — anders als der Durchschnittssteuersatz, der sich ueber das gesamte Einkommen mittelt. Wichtig fuer die Frage, ob sich zusaetzliches Einkommen wirklich lohnt.`,
    en: `The tax rate applied to your next earned euro — different from the average tax rate across your whole income. Key for judging whether extra income is actually worth it.` },
  'Werbungskosten': { id: 'werbungskosten',
    de: `Ausgaben, die im Zusammenhang mit einer nichtselbststaendigen Taetigkeit stehen und die Steuerlast senken — z.B. Fahrtkosten, Arbeitsmittel oder Fortbildungen. Ohne Nachweis zieht das Finanzamt automatisch die Werbungskostenpauschale ab.`,
    en: `Expenses connected to employment that reduce your taxable income — commuting costs, work equipment, training. Without receipts, the tax office automatically applies a flat allowance instead.` },
  'AfA': { id: 'afa',
    de: `Absetzung fuer Abnutzung — die steuerliche Abschreibung eines Wirtschaftsguts (z.B. Laptop, Immobilie) ueber seine Nutzungsdauer, statt den vollen Kaufpreis sofort abzusetzen.`,
    en: `The German term for depreciation — writing off an asset's cost over its useful life for tax purposes, instead of deducting the full purchase price immediately.` },
  'Umsatzsteuervoranmeldung': { id: 'umsatzsteuervoranmeldung',
    de: `Die regelmaessige (meist monatliche oder quartalsweise) Meldung der eingenommenen und gezahlten Umsatzsteuer ans Finanzamt — Kleinunternehmer sind davon befreit.`,
    en: `The regular (usually monthly or quarterly) VAT return filed with the tax office — small-business-scheme entrepreneurs (Kleinunternehmer) are exempt from this.` },
  'USt-IdNr': { id: 'ust-idnr',
    de: `Die Umsatzsteuer-Identifikationsnummer, gebraucht fuer Geschaefte mit Kunden oder Dienstleistern im EU-Ausland — unterscheidet sich von der normalen Steuernummer.`,
    en: `The EU VAT identification number, needed for business with customers or providers in other EU countries — distinct from your regular domestic tax number.` },
  'Körperschaftsteuer': { id: 'koerperschaftsteuer',
    de: `Die Ertragsteuer für Kapitalgesellschaften (GmbH, AG) — das Pendant zur Einkommensteuer bei Einzelunternehmern und Freiberuflern, die stattdessen ihren Gewinn direkt persoenlich versteuern.`,
    en: `Corporate income tax for companies like a GmbH or AG — the equivalent of personal income tax, which sole proprietors and freelancers pay directly on their profits instead.` },
  'Ausgabeaufschlag': { id: 'ausgabeaufschlag',
    de: `Eine einmalige Gebuehr beim Kauf von Fondsanteilen, oft 3-5 % — bei ETFs ueber die Boerse ueblicherweise nicht faellig, kann aber bei manchen aktiv gemanagten Fonds oder Bankberatung anfallen.`,
    en: `A one-time fee when buying fund shares, often 3-5% — typically not charged for ETFs bought on an exchange, but common for actively managed funds sold through a bank advisor.` },
  'Fondsvolumen': { id: 'fondsvolumen',
    de: `Das verwaltete Gesamtvermoegen eines Fonds. Ein groesseres Volumen senkt meist das Risiko einer Schliessung mangels Rentabilitaet, sagt aber nichts ueber die Qualitaet aus.`,
    en: `The total assets managed by a fund. A larger volume usually lowers the risk of the fund closing due to low profitability, but says nothing about quality.` },
  'Sparplanrabatt': { id: 'sparplanrabatt',
    de: `Ein von manchen Brokern zeitlich begrenzt angebotener Nachlass auf die Ausfuehrungsgebuehr eines ETF-Sparplans, oft als Marketing-Aktion fuer bestimmte Partner-ETFs.`,
    en: `A time-limited discount some brokers offer on ETF savings-plan execution fees, often as a marketing promotion for specific partner ETFs.` },
  'Replikationsmethode': { id: 'replikationsmethode',
    de: `Wie ein ETF seinen Index nachbildet: physisch (kauft die echten Wertpapiere) oder synthetisch (bildet die Wertentwicklung ueber einen Tauschvertrag/Swap nach). Physisch gilt gemeinhin als transparenter.`,
    en: `How an ETF tracks its index: physically (buying the actual securities) or synthetically (replicating performance via a swap contract). Physical is generally considered more transparent.` },
  'Fondsdomizil': { id: 'fondsdomizil',
    de: `Das Land, in dem ein Fonds rechtlich aufgelegt ist (oft Irland oder Luxemburg für europaeische ETFs) — beeinflusst z.B. die Quellensteuer-Behandlung von US-Dividenden.`,
    en: `The country where a fund is legally domiciled (often Ireland or Luxembourg for European ETFs) — affects things like withholding tax treatment on US dividends.` },
  'Due Diligence': { id: 'due-diligence',
    de: `Die sorgfaeltige Pruefung eines Unternehmens vor einem Kauf oder einer Investition — Buchhaltung, Vertraege, Mitarbeiter, Kundenbeziehungen. Wer eine bestehende Firma kauft, sollte hier nicht sparen.`,
    en: `The careful review of a business before buying or investing in it — books, contracts, staff, client relationships. Not a place to cut corners when buying an existing company.` },
  'Burn Rate': { id: 'burn-rate',
    de: `Wie schnell ein Unternehmen sein verfuegbares Kapital fuer laufende Kosten verbraucht, meist pro Monat gemessen. Zusammen mit dem Runway zeigt sie, wie viel Zeit bis zur naechsten Finanzierung bleibt.`,
    en: `How fast a company burns through its available capital on running costs, usually measured per month. Combined with runway, it shows how much time is left before the next funding round.` },
  'Runway': { id: 'runway',
    de: `Die verbleibende Zeit in Monaten, bis einem Unternehmen ohne neues Kapital das Geld ausgeht — berechnet aus dem aktuellen Kontostand geteilt durch die Burn Rate.`,
    en: `The remaining time in months before a company runs out of money without new funding — current cash balance divided by the burn rate.` },
  'Pitch Deck': { id: 'pitch-deck',
    de: `Eine kurze, visuelle Praesentation (meist 10-15 Folien), mit der Gruender Investoren ihre Geschaeftsidee vorstellen — Problem, Loesung, Markt, Team, Zahlen.`,
    en: `A short, visual presentation (typically 10-15 slides) founders use to pitch their business idea to investors — problem, solution, market, team, numbers.` },
  'Skalierbarkeit': { id: 'skalierbarkeit',
    de: `Wie gut ein Geschaeftsmodell wachsen kann, ohne dass die Kosten proportional mitwachsen. Software skaliert meist gut (ein Kunde mehr kostet fast nichts), ein Ein-Mann-Handwerksbetrieb kaum.`,
    en: `How well a business model can grow without costs rising proportionally. Software usually scales well (one more customer costs almost nothing); a one-person trade business barely does.` },
  'Working Capital': { id: 'working-capital',
    de: `Das kurzfristig gebundene Netto-Betriebskapital eines Unternehmens (Umlaufvermoegen minus kurzfristige Schulden) — zeigt, wie viel finanziellen Spielraum ein Betrieb im Tagesgeschaeft hat.`,
    en: `A company's short-term net operating capital (current assets minus current liabilities) — shows how much financial breathing room a business has for day-to-day operations.` },
  'Unternehmensnachfolge': { id: 'unternehmensnachfolge',
    de: `Die Uebergabe eines bestehenden Unternehmens an einen neuen Inhaber, oft weil der bisherige Besitzer in Rente geht und keinen familiaeren Nachfolger hat. IHKs betreiben eigene Nachfolgeboersen, die Kaeufer und Verkaeufer zusammenbringen.`,
    en: `Transferring an existing business to a new owner, often because the current owner is retiring with no family successor. German chambers of commerce (IHK) run dedicated succession exchanges matching buyers and sellers.` },
  'Wagniskapital': { id: 'wagniskapital',
    de: `Deutsche Bezeichnung fuer Venture Capital — Eigenkapital, das Investoren wachstumsstarken, aber riskanten jungen Unternehmen zur Verfuegung stellen, im Tausch gegen Anteile.`,
    en: `The German term for venture capital — equity that investors provide to high-growth, high-risk young companies in exchange for a stake.` },
  'Selbstbeteiligung': { id: 'selbstbeteiligung',
    de: `Der Betrag, den du im Schadensfall selbst zahlst, bevor die Versicherung einspringt. Eine hoehere Selbstbeteiligung senkt meist den Beitrag, erhoeht aber dein eigenes Risiko im Ernstfall.`,
    en: `The amount you pay yourself in a claim before insurance kicks in. A higher deductible usually lowers your premium, but raises your own risk if something happens.` },
  'Berufsunfähigkeitsversicherung': { id: 'berufsunfaehigkeitsversicherung',
    de: `Eine Versicherung, die eine monatliche Rente zahlt, wenn du deinen Beruf aus gesundheitlichen Gruenden dauerhaft nicht mehr ausueben kannst. Fuer Selbststaendige besonders wichtig, da die gesetzliche Absicherung hier meist fehlt.`,
    en: `Insurance paying a monthly pension if you can no longer work in your profession due to health reasons. Especially important for the self-employed, who usually lack statutory coverage for this.` },
  'Betriebshaftpflichtversicherung': { id: 'betriebshaftpflichtversicherung',
    de: `Versichert Schaeden, die dein Unternehmen bei Dritten verursacht — z.B. wenn ein Kunde in deinem Laden stolpert. Anders als die Vermoegensschadenhaftpflicht deckt sie Personen- und Sachschaeden, nicht reine Vermoegensschaeden.`,
    en: `Covers damages your business causes to third parties — like a customer tripping in your shop. Unlike professional indemnity insurance, it covers bodily injury and property damage, not pure financial loss.` },
  'Vermögensschadenhaftpflicht': { id: 'vermoegensschadenhaftpflicht',
    de: `Versichert reine finanzielle Schaeden, die durch einen Beratungs- oder Arbeitsfehler entstehen — z.B. wenn eine falsche Empfehlung einen Kunden Geld kostet. Fuer Berater, Freelancer und Dienstleister oft wichtiger als die klassische Betriebshaftpflicht.`,
    en: `Covers pure financial losses caused by a professional mistake — like bad advice costing a client money. Often more important for consultants, freelancers, and service providers than standard general liability.` },
  'Deckungssumme': { id: 'deckungssumme',
    de: `Der Hoechstbetrag, den eine Versicherung im Schadensfall zahlt. Liegt der tatsaechliche Schaden darueber, bleibst du auf dem Rest sitzen — bei Berufshaftpflicht sollte die Summe grosszuegig gewaehlt sein.`,
    en: `The maximum amount an insurer pays out per claim. If the actual damage exceeds it, you're on the hook for the rest — for professional liability, it pays to choose a generous coverage limit.` },
  'Karenzzeit': { id: 'karenzzeit',
    de: `Die Wartezeit zwischen Vertragsabschluss (oder Eintritt eines Ereignisses) und dem Beginn der Leistungspflicht einer Versicherung — z.B. bei Berufsunfaehigkeit oft mehrere Monate.`,
    en: `The waiting period between signing a policy (or an event occurring) and the start of the insurer's obligation to pay — often several months for disability insurance, for example.` },
  'Grunderwerbsteuer': { id: 'grunderwerbsteuer',
    de: `Eine Steuer beim Kauf eines Grundstuecks oder einer Immobilie, je nach Bundesland zwischen 3,5 % und 6,5 % des Kaufpreises — wird beim Budget fuer den Immobilienkauf leicht unterschaetzt.`,
    en: `A tax paid on buying land or property, ranging by German state from 3.5% to 6.5% of the purchase price — easy to underestimate when budgeting for a property purchase.` },
  'Tilgung': { id: 'tilgung',
    de: `Der Teil der monatlichen Kreditrate, der die eigentliche Schuld reduziert (im Gegensatz zum Zinsanteil). Eine hoehere Anfangstilgung verkuerzt die Laufzeit eines Immobilienkredits deutlich.`,
    en: `The part of a monthly loan payment that reduces the actual debt (as opposed to the interest portion). A higher initial repayment rate significantly shortens a mortgage's term.` },
  'Annuitätendarlehen': { id: 'annuitaetendarlehen',
    de: `Der ueblichste Immobilienkredit-Typ: Die monatliche Rate bleibt ueber die Zinsbindung konstant, aber der Zinsanteil sinkt und der Tilgungsanteil steigt mit der Zeit.`,
    en: `The most common mortgage type: the monthly payment stays constant over the fixed-rate period, but the interest portion shrinks and the repayment portion grows over time.` },
  'Beleihungswert': { id: 'beleihungswert',
    de: `Der Wert, den eine Bank einer Immobilie fuer die Kreditvergabe zugrunde legt — meist vorsichtiger kalkuliert als der tatsaechliche Marktwert, um das Risiko der Bank abzufedern.`,
    en: `The value a bank assigns to a property for lending purposes — usually calculated more conservatively than the actual market value, to cushion the bank's risk.` },
  'Grundschuld': { id: 'grundschuld',
    de: `Ein Grundpfandrecht, das die Bank als Sicherheit ins Grundbuch eintraegt, wenn sie einen Immobilienkredit vergibt. Anders als bei der Hypothek bleibt sie auch nach vollstaendiger Tilgung bestehen, bis sie aktiv geloescht wird.`,
    en: `A land charge the bank registers in the property's land title as collateral for a mortgage. Unlike a mortgage lien, it remains registered even after full repayment, until actively cancelled.` },
  'Mietrendite': { id: 'mietrendite',
    de: `Das Verhaeltnis von jaehrlicher Netto-Kaltmiete zum Kaufpreis einer Immobilie, als grobe Kennzahl zur Einordnung, ob sich eine Vermietung wirtschaftlich lohnt.`,
    en: `The ratio of annual net rental income to a property's purchase price — a rough metric for judging whether renting it out makes financial sense.` },
  'Eigenkapitalquote': { id: 'eigenkapitalquote-immobilie',
    de: `Der Anteil des Immobilienkaufpreises, den du aus eigenen Mitteln statt per Kredit finanzierst. Eine hoehere Quote senkt in der Regel den Zinssatz, den die Bank anbietet.`,
    en: `The share of a property's purchase price you finance from your own funds rather than a loan. A higher share usually lowers the interest rate the bank offers.` },
};

/* Englisches Pendant zu FR_GLOSSARY -- gleiche Definitionen, aber mit
   den englischen Begriffen als Schluessel, da im englischen Fliesstext
   Fachbegriffe klein geschrieben werden (anders als deutsche Substantive)
   und daher gross-/kleinschreibungs-unabhaengig gesucht werden muss.
   Bewusst nicht jeder deutsche Begriff hat ein englisches Pendant hier --
   "Rendite"->"Return" und "Thesaurierend"->"Accumulating" wurden
   ausgelassen, da diese englischen Woerter zu generisch sind und in
   Fliesstext haeufig falsch-positive Treffer ausserhalb des
   Finanzkontexts erzeugen wuerden. */
const FR_GLOSSARY_EN = {
  'agb': FR_GLOSSARY['AGB'],
  'roi': FR_GLOSSARY['ROI'],
  'portfolio': FR_GLOSSARY['Portfolio'],
  'spread': FR_GLOSSARY['Spread'],
  'rating': FR_GLOSSARY['Rating'],
  'due diligence': FR_GLOSSARY['Due Diligence'],
  'burn rate': FR_GLOSSARY['Burn Rate'],
  'runway': FR_GLOSSARY['Runway'],
  'pitch deck': FR_GLOSSARY['Pitch Deck'],
  'working capital': FR_GLOSSARY['Working Capital'],
  'bootstrapping': FR_GLOSSARY['Bootstrapping'],
  'datev': FR_GLOSSARY['DATEV'],
  'psd2': FR_GLOSSARY['PSD2'],
  'ocr': FR_GLOSSARY['OCR'],
  'schufa': FR_GLOSSARY['Schufa-Score'],
  'schufa-score': FR_GLOSSARY['Schufa-Score'],
  'reverse-charge': FR_GLOSSARY['Reverse-Charge-Verfahren'],
  'fints': FR_GLOSSARY['FinTS'],
  'freelancer': FR_GLOSSARY['Freelancer'],
  'ebitda': FR_GLOSSARY['EBITDA'],
  'ebit': FR_GLOSSARY['EBIT'],
  'diversification': FR_GLOSSARY['Diversifikation'],
  'dividend yield': FR_GLOSSARY['Dividendenrendite'],
  'market capitalization': FR_GLOSSARY['Marktkapitalisierung'],
  'market cap': FR_GLOSSARY['Marktkapitalisierung'],
  'market maker': FR_GLOSSARY['Market Maker'],
  'blue chip': FR_GLOSSARY['Blue Chip'],
  'circuit breaker': FR_GLOSSARY['Circuit Breaker'],
  'combined ratio': FR_GLOSSARY['Combined Ratio'],
  'tracking difference': FR_GLOSSARY['Tracking Difference'],
  'insider trading': FR_GLOSSARY['Insiderhandel'],
  'compound interest': FR_GLOSSARY['Zinseszins'],
  /* -- Ergänzt 03.08.2026 -- bewusst ausgelassen: 'fire' (zu generisches
     Alltagswort im Englischen), 'spread'/'leverage'/'net worth'/'savings
     rate' (dieselbe Genericity-Sorge wie bei 'return'), sowie alle rein
     deutschen Steuer-/Rechtsbegriffe ohne sauberes 1:1-Englisch-Pendant
     (Freistellungsauftrag, Grundfreibetrag, Günstigerprüfung, Anlage KAP,
     MdB, NV-Bescheinigung, Sparerpauschbetrag, Sondervermögen,
     Vorabpauschale). */
  'bdc': FR_GLOSSARY['BDC'],
  'cagr': FR_GLOSSARY['CAGR'],
  'ceo': FR_GLOSSARY['CEO'],
  'dax': FR_GLOSSARY['DAX'],
  'esg': FR_GLOSSARY['ESG'],
  'etf': FR_GLOSSARY['ETF'],
  'gender pay gap': FR_GLOSSARY['Gender Pay Gap'],
  'home bias': FR_GLOSSARY['Home Bias'],
  'ipo': FR_GLOSSARY['IPO'],
  'isin': FR_GLOSSARY['ISIN'],
  'kgv': FR_GLOSSARY['KGV'],
  'p/e ratio': FR_GLOSSARY['KGV'],
  'price index': FR_GLOSSARY['Kursindex'],
  'total return index': FR_GLOSSARY['Performanceindex'],
  'msci': FR_GLOSSARY['MSCI'],
  'opportunity cost': FR_GLOSSARY['Opportunitätskosten'],
  'rebalancing': FR_GLOSSARY['Rebalancing'],
  'reit': FR_GLOSSARY['REIT'],
  'sequence-of-returns risk': FR_GLOSSARY['Sequenzrisiko'],
  'side hustle': FR_GLOSSARY['Side Hustle'],
  'shiller p/e': FR_GLOSSARY['Shiller-KGV'],
  'cape ratio': FR_GLOSSARY['Shiller-KGV'],
  'ter': FR_GLOSSARY['TER'],
  'vix': FR_GLOSSARY['VIX'],
  'volatility drain': FR_GLOSSARY['Volatilitätsverlust'],
  'volatility drag': FR_GLOSSARY['Volatilitätsverlust'],
  'wkn': FR_GLOSSARY['WKN'],
};

/* Fuellt alle [data-fr-const]-Elemente mit dem passenden Wert aus
   FR_CONFIG. Laeuft beim Laden UND nochmal nach jedem Sprachwechsel
   (Werte sind sprachneutral, aber die Funktion ist billig genug,
   um sie im selben Rhythmus wie das Glossar einfach mitlaufen zu
   lassen). Unbekannte Schluessel werden bewusst ignoriert statt
   einen Fehler zu werfen -- ein Tippfehler im Artikel soll die Seite
   nie zum Absturz bringen, hoechstens eine leere Stelle hinterlassen. */
function frInitConstants(){
  document.querySelectorAll('[data-fr-const]').forEach(el => {
    const key = el.getAttribute('data-fr-const');
    if(Object.prototype.hasOwnProperty.call(FR_CONFIG, key)){
      el.textContent = FR_CONFIG[key];
    }
  });
}

/* ================================================================
   AUTOMATISCH VERWANDTE ARTIKEL
   ----------------------------------------------------------------
   Loest ein wachsendes Problem bei > 100 Artikeln: von Hand
   gepflegte "Verwandt"-Boxen veralten zwangslaeufig, sobald neue
   Artikel dazukommen -- niemand denkt daran, alte Beitraege
   rueckwirkend mit neuen zu verlinken. Diese Funktion braucht keine
   Pflege: sie laeuft bei jedem Seitenaufruf automatisch, findet die
   aktuelle Seite in FR_POSTS wieder und zeigt die passendsten
   anderen Artikel an -- rueckwirkend fuer ALLE Artikel, sobald ein
   neuer in FR_POSTS auftaucht, ohne dass irgendeine Datei angefasst
   werden muss. Ergaenzt (ersetzt nicht) die weiterhin von Hand
   gepflegten "Weiter"-Links fuer bewusste Lese-Reihenfolgen
   innerhalb einer Artikel-Serie. */
function frInitRelatedArticles(){
  const container = document.querySelector('article.legal .wrap, article .wrap');
  if(!container) return;
  if(typeof FR_POSTS === 'undefined') return;

  // Bereits vorhandene automatische Box zuerst entfernen (Selbstheilung
  // bei Sprachwechsel, damit nicht doppelt gerendert wird).
  const old = container.querySelector('.fr-related-auto');
  if(old) old.remove();

  const path = location.pathname.split('/').pop();
  const current = FR_POSTS.find(p => p.link === path);
  if(!current) return; // keine Artikelseite oder nicht in FR_POSTS gelistet

  // Bereits im Artikel vorhandene Links sammeln (z.B. aus handverlesenen
  // "Verwandt"/"Weiter"-Boxen) -- diese sollen in der automatischen Box
  // nicht ein zweites Mal auftauchen. Einfacher, robuster Ansatz statt
  // die verschiedenen handverlesenen Box-Varianten einzeln zu erkennen:
  // wenn der Link schon irgendwo im Artikeltext als <a href> steht,
  // gilt er als "schon gezeigt", egal in welcher Box.
  const alreadyLinked = new Set(
    [...container.querySelectorAll('a[href]')]
      .map(a => a.getAttribute('href').split('/').pop())
  );

  const isEnglish = document.documentElement.getAttribute('lang') === 'en';
  const currentTags = new Set((current.tags || []).map(t => t.toLowerCase()));

  const scored = FR_POSTS
    .filter(p => p.link !== current.link && p.link && !alreadyLinked.has(p.link))
    .map(p => {
      let score = 0;
      if(p.subcat && p.subcat === current.subcat) score += 10;
      else if(p.cat === current.cat) score += 1;
      (p.tags || []).forEach(t => { if(currentTags.has(t.toLowerCase())) score += 3; });
      return { post: p, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || new Date(b.post.date) - new Date(a.post.date))
    .slice(0, 4);

  // Bei zu wenig thematischer Naehe lieber gar keine Box zeigen als
  // eine duenne, kaum relevante Liste.
  if(scored.length < 2) return;

  const box = document.createElement('div');
  box.className = 'fr-related-auto';
  const label = document.createElement('p');
  label.className = 'fr-related-auto-label';
  label.textContent = isEnglish ? 'Similar articles' : 'Ähnliche Artikel';
  box.appendChild(label);
  const ul = document.createElement('ul');
  ul.className = 'fr-related-auto-list';
  scored.forEach(({ post }) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = post.link;
    a.textContent = '→ ' + (isEnglish && post.titleEn ? post.titleEn : post.title);
    li.appendChild(a);
    ul.appendChild(li);
  });
  box.appendChild(ul);

  container.appendChild(box);
}

function frAutoLinkGlossary(){
  const container = document.querySelector('article.legal .wrap, article .wrap');
  if(!container) return;

  // Selbstheilung: eigene, frueher automatisch eingefuegte Tooltips zuerst
  // wieder entfernen (reinen Text wiederherstellen), bevor neu gescannt
  // wird. Notwendig, weil nicht jede Textstelle ein data-en-Attribut hat
  // (z.B. reine Zahlenzellen in Tabellen) -- ohne das wuerde die
  // Sprachumschaltung eine automatisch eingefuegte deutsche Erklaerung
  // im Englischen stehen lassen, statt sie durch die englische zu
  // ersetzen. Von Hand gebaute Tooltips (ESG, Spread) tragen dieses
  // Attribut nicht und bleiben unangetastet.
  container.querySelectorAll('.term-tip[data-auto-glossary="true"]').forEach(function(el){
    el.replaceWith(document.createTextNode(el.textContent));
  });
  container.normalize(); // benachbarte Text-Knoten wieder zusammenfuehren

  const isEnglish = document.documentElement.getAttribute('lang') === 'en';
  const dict = isEnglish ? FR_GLOSSARY_EN : FR_GLOSSARY;
  const defKey = isEnglish ? 'en' : 'de';
  const glossarLabel = isEnglish ? 'Glossary' : 'Glossar';
  const linkText = isEnglish ? 'Full glossary entry →' : 'Ganzer Glossar-Eintrag →';
  const ariaPrefix = isEnglish ? 'Show glossary explanation for ' : 'Begriffserklärung ';
  const ariaSuffix = isEnglish ? '' : ' anzeigen';

  // Begriffe nach Laenge absteigend sortieren, damit z.B. "EBITDA" vor
  // "EBIT" geprueft wird und nicht faelschlich in zwei Teile zerlegt wird.
  const terms = Object.keys(dict).sort((a, b) => b.length - a.length);

  // Begriffe, die auf dieser Seite (egal ob von Hand oder automatisch)
  // bereits ein Tooltip haben, nicht doppelt versehen. Case-insensitiv
  // verglichen, damit ein deutscher Begriff nicht doppelt mit seiner
  // englischen Entsprechung kollidiert und umgekehrt.
  const already = new Set();
  document.querySelectorAll('.term-tip').forEach(function(el){
    const txt = (el.getAttribute('data-glossary-term') || el.textContent || '').trim().toLowerCase();
    if(txt) already.add(txt);
  });

  const combinedPattern = isEnglish
    ? new RegExp('\\b(' + terms.join('|') + ')s?\\b', 'gi')
    : new RegExp('\\b(' + terms.join('|') + ')\\b', 'g');

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode: function(node){
      const p = node.parentElement;
      if(!p) return NodeFilter.FILTER_REJECT;
      if(p.closest('a, .term-tip, script, style, h1, h2, h3, .eyebrow, .breadcrumb, th, svg, [class$="-label"], [class*="-label "]')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const candidates = [];
  let node;
  while((node = walker.nextNode())){
    combinedPattern.lastIndex = 0;
    let m;
    // Schleife statt einmaligem exec(): findet ALLE Treffer im selben
    // Textknoten, nicht nur den ersten. Vorher brach ein Absatz mit
    // zwei Glossar-Begriffen (z.B. "...als Freelancer... eine
    // Privatentnahme...") die Verlinkung fuer den zweiten Begriff
    // stillschweigend ab, da combinedPattern.exec() nur einmal
    // aufgerufen wurde. Der Regex hat das "g"-Flag, exec() setzt
    // combinedPattern.lastIndex nach jedem Treffer automatisch weiter.
    while((m = combinedPattern.exec(node.nodeValue))){
      const key = m[1].toLowerCase();
      if(!already.has(key)){
        candidates.push({ node: node, fullMatch: m[0], lookupKey: isEnglish ? key : m[1], index: m.index });
        already.add(key); // pro Begriff weiterhin nur die erste Fundstelle auf der Seite
      }
    }
  }

  // Nach Textknoten gruppieren, damit mehrere Treffer im selben Absatz
  // korrekt nacheinander verarbeitet werden -- ein einzelner Knoten
  // kann jetzt mehrere Kandidaten haben, die sich sonst gegenseitig die
  // Text-Indizes verschieben wuerden.
  const byNode = new Map();
  candidates.forEach(function(c){
    if(!dict[c.lookupKey]) return;
    if(!byNode.has(c.node)) byNode.set(c.node, []);
    byNode.get(c.node).push(c);
  });

  byNode.forEach(function(nodeCandidates, textNode){
    nodeCandidates.sort(function(a, b){ return a.index - b.index; });
    const fullText = textNode.nodeValue;
    const parent = textNode.parentNode;
    let cursor = 0;
    const pieces = [];

    nodeCandidates.forEach(function(c){
      if(c.index < cursor) return; // ueberlappender Treffer, ueberspringen
      pieces.push({ type:'text', value: fullText.slice(cursor, c.index) });
      pieces.push({ type:'term', c: c });
      cursor = c.index + c.fullMatch.length;
    });
    pieces.push({ type:'text', value: fullText.slice(cursor) });

    pieces.forEach(function(piece){
      if(piece.type === 'text'){
        if(piece.value) parent.insertBefore(document.createTextNode(piece.value), textNode);
        return;
      }
      const c = piece.c;
      const info = dict[c.lookupKey];
      const wrapper = document.createElement('span');
      wrapper.className = 'term-tip';
      wrapper.tabIndex = 0;
      wrapper.setAttribute('role', 'button');
      wrapper.setAttribute('data-glossary-term', c.fullMatch);
      wrapper.setAttribute('data-auto-glossary', 'true');
      wrapper.setAttribute('aria-label', ariaPrefix + c.fullMatch + ariaSuffix);
      wrapper.textContent = c.fullMatch;

      const popup = document.createElement('span');
      popup.className = 'term-tip-popup';
      popup.setAttribute('role', 'tooltip');
      const label = document.createElement('span');
      label.className = 'term-tip-label';
      label.textContent = glossarLabel;
      popup.appendChild(label);
      popup.appendChild(document.createTextNode(info[defKey] + ' '));
      const link = document.createElement('a');
      link.href = 'glossar.html#' + info.id;
      link.textContent = linkText;
      popup.appendChild(link);
      wrapper.appendChild(popup);

      parent.insertBefore(wrapper, textNode);
    });

    parent.removeChild(textNode);
  });
}

document.addEventListener('DOMContentLoaded', function(){
  frInitConstants();
  frAutoLinkGlossary();
  frInitRelatedArticles();
});
if(Array.isArray(window.frPageRecomputers)){
  window.frPageRecomputers.push(frAutoLinkGlossary);
} else {
  window.frPageRecomputers = [frAutoLinkGlossary];
}

/* =========================================================
   PROZENT-FORMATIERUNG: kein Leerzeichen vor "%"
   ---------------------------------------------------------
   Nutzer-Vorgabe: "10,3 %" bricht bei vergroesserter Schrift
   das % auf eine eigene Zeile um -- schlecht lesbar. Ab jetzt
   global "10,3%" (kein Leerzeichen), automatisch fuer JEDEN
   Artikel, alt wie neu -- ohne die Quelldateien einzeln
   anzufassen. Gilt bewusst nur fuer %, nicht fuer € (dort ist
   das Leerzeichen deutsche Standardkonvention und das Problem
   laut Nutzer ohnehin seltener). */
function frFixPercentSpacing(){
  const container = document.querySelector('article.legal .wrap, article .wrap');
  if(!container) return;

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode: function(node){
      const p = node.parentElement;
      if(!p) return NodeFilter.FILTER_REJECT;
      if(p.closest('script, style')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const pattern = /(\d[\d.,]*)[ \t\u00A0]+%/g;
  let node;
  while((node = walker.nextNode())){
    if(pattern.test(node.nodeValue)){
      pattern.lastIndex = 0;
      node.nodeValue = node.nodeValue.replace(pattern, '$1%');
    }
  }
}

document.addEventListener('DOMContentLoaded', function(){
  frFixPercentSpacing();
});
if(Array.isArray(window.frPageRecomputers)){
  window.frPageRecomputers.push(frFixPercentSpacing);
} else {
  window.frPageRecomputers = [frFixPercentSpacing];
}
