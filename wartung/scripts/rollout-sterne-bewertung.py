#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Rollout Sterne-Bewertung auf die restlichen 27 Buchartikel.
Werte sind aus den bestehenden Absätzen "Für wen" / "Ehrliche Einschätzung"
jedes Artikels abgeleitet (siehe Chat-Erklärung) — keine externen Quellen.
"""
import re, os

BUCKET_A = ("Umsetzbarkeit", "Actionability", "Zeitlosigkeit", "Timelessness", "Substanz vs. Blendwerk", "Substance vs. hype")
BUCKET_B = ("Konkretheit", "Concreteness", "Zielgruppenschärfe", "Audience fit", "Wiederlesewert", "Re-read value")
BUCKET_C = ("Praxistauglichkeit (DE)", "Practicality (Germany)", "Verständlichkeit", "Clarity", "Aktualität", "Up to date")
BUCKET_D = ("Praxistauglichkeit", "Practicality", "Einsteigerfreundlichkeit", "Beginner-friendliness", "Vollständigkeit", "Comprehensiveness")

def subs(bucket, s1, s2, s3):
    l1d,l1e,l2d,l2e,l3d,l3e = bucket
    return [(l1d,l1e,s1), (l2d,l2e,s2), (l3d,l3e,s3)]

RATINGS = {
"beitrag-buch-100m-angebote.html": dict(
    score=4.5, subs=subs(BUCKET_B, 4.5, 4, 4),
    quote_de="Wenn du nur eins aus der Serie liest, dann dieses – der Satz über wahrgenommenen Wert hat mir mehr gebracht als die meisten Marketing-Seminare.",
    quote_en="If you only read one book from the series, make it this one — the line about perceived value taught me more than most marketing seminars.",
    notfor_de="wer nichts verkauft und auch nichts verkaufen will.",
    notfor_en="anyone who isn't selling anything and has no intention to."),

"beitrag-buch-100m-geldmodelle.html": dict(
    score=4, subs=subs(BUCKET_B, 4.5, 3.5, 4),
    quote_de="Der stärkste Band der drei – aber nur, wenn du schon etwas verkaufst. Ohne Produkt fängst du hier am falschen Ende an.",
    quote_en="The strongest of the three volumes — but only once you already have something to sell. Without a product, you're starting at the wrong end.",
    notfor_de="wer noch kein laufendes Angebot hat (dann erst Band 1).",
    notfor_en="anyone without a running offer yet (start with volume 1 instead)."),

"beitrag-buch-10x-regel.html": dict(
    score=3.5, subs=subs(BUCKET_B, 3, 3, 3.5),
    quote_de="Cardone nervt streckenweise – und genau das ist vermutlich der Punkt. Wer die Lautstärke aushält, nimmt eine Idee mit, die hängen bleibt.",
    quote_en="Cardone gets grating at times — that's probably the point. Push through the volume and one idea actually sticks.",
    notfor_de="wer leise, nuancierte Businessbücher bevorzugt.",
    notfor_en="anyone who prefers quiet, nuanced business books."),

"beitrag-buch-48-gesetze-der-macht.html": dict(
    score=4, subs=subs(BUCKET_A, 3, 4.5, 4),
    quote_de="Kein Buch, das ich empfehlen würde, um danach zu handeln – aber eins, das schärfer macht, was man ohnehin um sich herum sieht.",
    quote_en="Not a book I'd recommend acting on directly — but one that sharpens what you're already seeing around you.",
    notfor_de="wer moralische Anleitung sucht statt Machtanalyse.",
    notfor_en="anyone looking for moral guidance rather than an analysis of power."),

"beitrag-buch-aktien-ohne-vorkenntnisse.html": dict(
    score=3.5, subs=subs(BUCKET_C, 4, 4.5, 4.5),
    quote_de="Ein gutes erstes Buch, kein letztes – irgendwann brauchst du Kommer, aber nicht am ersten Tag.",
    quote_en="A good first book, not a final one — you'll want Kommer eventually, just not on day one.",
    notfor_de="wer schon ein Depot hat und tiefer einsteigen will.",
    notfor_en="anyone who already has a portfolio and wants to go deeper."),

"beitrag-buch-handbuch-optionsstrategien.html": dict(
    score=4, subs=subs(BUCKET_D, 4.5, 2, 4.5),
    quote_de="Kein Buch für den ersten Kontakt mit Optionen – aber wenn die Grundlagen sitzen, eine der vollständigsten Referenzen, die ich kenne.",
    quote_en="Not a book for your first contact with options — but once the basics sit, one of the most complete references I know.",
    notfor_de="Einsteiger*innen ohne Optionsvorwissen.",
    notfor_en="beginners with no prior options knowledge."),

"beitrag-buch-influence.html": dict(
    score=4.5, subs=subs(BUCKET_A, 4.5, 4.5, 4.5),
    quote_de="Nach diesem Buch schaust du Rabatt-Countdowns im Onlineshop nie wieder unschuldig an.",
    quote_en="After this book, you'll never look at a discount countdown timer the same way again.",
    notfor_de="eigentlich für fast alle geeignet — höchstens für alle, die glauben, gegen Beeinflussung immun zu sein.",
    notfor_en="genuinely for almost everyone — if anything, skip it only if you think you're immune to persuasion."),

"beitrag-buch-keine-kompromisse.html": dict(
    score=3.5, subs=subs(BUCKET_A, 4, 3.5, 3.5),
    quote_de="Kein Finanzbuch – aber wer sich beim Geld ständig kleiner macht als nötig, findet hier den Hebel, der eigentlich woanders ansetzt.",
    quote_en="Not a finance book — but if you keep shrinking yourself around money, this is the lever that actually applies.",
    notfor_de="wer konkrete Anlage-Tipps sucht statt Mindset-Arbeit.",
    notfor_en="anyone looking for concrete investment tips rather than mindset work."),

"beitrag-buch-millionaire-next-door.html": dict(
    score=4.5, subs=subs(BUCKET_A, 4, 4, 5),
    quote_de="Die Studie, die mir am nachhaltigsten das Bild vom „reich aussehen“ zerstört hat.",
    quote_en="The study that did the most lasting damage to my image of what 'looking rich' actually means.",
    notfor_de="wer eine unterhaltsame Erzählung sucht statt Studienergebnisse.",
    notfor_en="anyone wanting an entertaining narrative rather than study data."),

"beitrag-buch-optionen-unschlagbar-handeln.html": dict(
    score=4, subs=subs(BUCKET_D, 4.5, 3, 3.5),
    quote_de="Zugänglicher geschrieben als die meisten Optionsbücher – die Marketing-Sprache im Klappentext trennt man trotzdem besser selbst von der Risikobewertung.",
    quote_en="More accessible than most options books — though it's still on you to separate the cover-blurb marketing from the actual risk assessment.",
    notfor_de="absolute Einsteiger*innen ins Optionshandeln ganz ohne Vorwissen.",
    notfor_en="absolute beginners to options trading with zero prior knowledge."),

"beitrag-buch-optionsstrategien-praxis.html": dict(
    score=4, subs=subs(BUCKET_D, 4.5, 2.5, 4),
    quote_de="Zweites Buch, nicht erstes – aber wenn Covered Calls und Cash-Secured Puts für dich mehr als Buzzwords sind, wird's hier konkret.",
    quote_en="A second book, not a first — but once covered calls and cash-secured puts mean more to you than buzzwords, this gets concrete.",
    notfor_de="Gelegenheitsanleger*innen ohne Zeit für die Einarbeitung.",
    notfor_en="casual investors without time to get properly up to speed."),

"beitrag-buch-playbook-to-millions.html": dict(
    score=3.5, subs=subs(BUCKET_B, 4.5, 3, 4),
    quote_de="Kein Buch zum Durchlesen, eher eins zum Draufsetzen, wenn Die 10x-Regel schon sitzt.",
    quote_en="Not a book to read cover to cover — more one to build on once The 10X Rule has already landed.",
    notfor_de="wer Cardone zum ersten Mal liest (dann lieber Die 10x-Regel).",
    notfor_en="anyone reading Cardone for the first time (start with The 10X Rule instead)."),

"beitrag-buch-psycho-kybernetik.html": dict(
    score=3.5, subs=subs(BUCKET_A, 3.5, 3.5, 4),
    quote_de="Der Schreibstil ist aus einer anderen Zeit, die Kernidee nicht: Dein Selbstbild bestimmt dein Verhalten, nicht umgekehrt.",
    quote_en="The writing style is from another era, the core idea isn't: your self-image drives your behavior, not the other way round.",
    notfor_de="wer modernen, datengetriebenen Stil erwartet statt Sprache der 1960er.",
    notfor_en="anyone expecting a modern, data-driven style rather than 1960s prose."),

"beitrag-buch-reichste-mann-von-babylon.html": dict(
    score=4, subs=subs(BUCKET_A, 4, 4.5, 3.5),
    quote_de="Zwei, drei Stunden Lesezeit für die Grundhaltung, auf der alles andere aufbaut – wer schon investiert, lernt hier nichts Neues mehr.",
    quote_en="Two or three hours for the mindset everything else builds on — if you already invest, you won't learn anything new here.",
    notfor_de="wer bereits Finanzwissen hat und tiefer gehen will.",
    notfor_en="anyone who already has financial knowledge and wants to go deeper."),

"beitrag-buch-rente-mit-40.html": dict(
    score=3.5, subs=subs(BUCKET_A, 3, 3.5, 3.5),
    quote_de="Kein Buch mit neuen Zahlen, sondern eins, das den mentalen Anschub liefert, wenn der Sparplan schon läuft und trotzdem der letzte Schritt fehlt.",
    quote_en="Not a book with new numbers — one that supplies the mental push when the savings plan is already running but the last step is missing.",
    notfor_de="wer nach neuen konkreten Strategien statt Motivation sucht.",
    notfor_en="anyone looking for new concrete strategies rather than motivation."),

"beitrag-buch-revolution-geldanlage.html": dict(
    score=3.5, subs=subs(BUCKET_C, 4, 3.5, 3.5),
    quote_de="Textlastiger als andere ETF-Einsteigerbücher – aber der Autor hat das selbst durchgemacht, nicht nur recherchiert, und das merkt man.",
    quote_en="Denser text than other ETF beginner books — but the author lived this, didn't just research it, and it shows.",
    notfor_de="wer einen sehr knappen, visuellen Einstieg sucht.",
    notfor_en="anyone wanting a very short, visual introduction."),

"beitrag-buch-schwarzer-schwan.html": dict(
    score=4.5, subs=subs(BUCKET_A, 3.5, 4.5, 4.5),
    quote_de="Taleb nervt streckenweise mit seinem Ton – und hat trotzdem eine der wichtigsten Ideen der letzten zwanzig Jahre sauber auf den Punkt gebracht.",
    quote_en="Taleb's tone gets grating at times — and he still nails one of the most important ideas of the last twenty years.",
    notfor_de="wer einen schnellen Praxisratgeber sucht statt anspruchsvoller Lektüre.",
    notfor_en="anyone wanting a quick practical guide rather than a demanding read."),

"beitrag-buch-secrets-of-the-millionaire-mind.html": dict(
    score=3, subs=subs(BUCKET_A, 2.5, 3.5, 3),
    quote_de="Stark, wenn du den Anstoß brauchst, überhaupt anzufangen – schwach, wenn du danach fragst: und jetzt konkret wie?",
    quote_en="Strong if you need the push to get started at all — weak the moment you ask: okay, but concretely how?",
    notfor_de="wer Zahlen, Strategien und Werkzeuge sucht statt Mindset-Impulse.",
    notfor_en="anyone looking for numbers, strategies and tools rather than mindset nudges."),

"beitrag-buch-sieben-wege-effektivitaet.html": dict(
    score=4, subs=subs(BUCKET_A, 4, 4.5, 3.5),
    quote_de="Lang, amerikanisch, manchmal repetitiv – und trotzdem einer der Denkrahmen, auf den ich am häufigsten zurückgreife.",
    quote_en="Long, American, occasionally repetitive — and still one of the frameworks I come back to most often.",
    notfor_de="wer schnelle, kompakte Lektüre ohne Anekdoten sucht.",
    notfor_en="anyone wanting a quick, compact read without anecdotes."),

"beitrag-buch-simple-path-to-wealth.html": dict(
    score=4.5, subs=subs(BUCKET_C, 4, 5, 4),
    quote_de="Kein Wort zu viel: kaufen, halten, Lärm ignorieren. Der US-Fokus lässt sich easy auf ETF-Sparpläne hierzulande übertragen.",
    quote_en="Not a wasted word: buy, hold, ignore the noise. The US focus translates easily to ETF savings plans over here.",
    notfor_de="wer detaillierte Asset-Allocation-Strategien sucht statt radikaler Einfachheit.",
    notfor_en="anyone wanting detailed asset-allocation strategies rather than radical simplicity."),

"beitrag-buch-souveraen-investieren-einsteiger.html": dict(
    score=4.5, subs=subs(BUCKET_C, 4.5, 4.5, 4),
    quote_de="Das Kommer-Buch, das ich als Erstes in die Hand drücken würde – zugänglich, ohne die Substanz zu verlieren.",
    quote_en="The Kommer book I'd hand over first — accessible without losing the substance.",
    notfor_de="wer schon die fortgeschrittene Ausgabe kennt.",
    notfor_en="anyone who already knows the advanced edition."),

"beitrag-buch-souveraen-investieren.html": dict(
    score=4.5, subs=subs(BUCKET_C, 4.5, 3, 4.5),
    quote_de="Die dichteste, am besten belegte Quelle zu ETFs auf Deutsch – aber bitte nicht als erstes Buch, dafür ist es zu viel auf einmal.",
    quote_en="The densest, best-sourced resource on ETFs in German — just not as your first book, it's too much at once.",
    notfor_de="absolute Einsteiger*innen ohne Vorwissen (dann erst die Einsteiger-Ausgabe).",
    notfor_en="absolute beginners with no prior knowledge (start with the beginner edition first)."),

"beitrag-buch-strategisch-investieren-aktienoptionen.html": dict(
    score=4, subs=subs(BUCKET_D, 4, 3.5, 3),
    quote_de="Verständlich, weil es sich auf Short-Puts konzentriert – genau deshalb aber auch schmaler als andere Optionsbücher.",
    quote_en="Clear precisely because it focuses on short puts — which is also exactly why it's narrower than other options books.",
    notfor_de="wer einen breiten Überblick über alle Optionsstrategien sucht.",
    notfor_en="anyone wanting a broad overview of all options strategies."),

"beitrag-buch-think-and-grow-rich.html": dict(
    score=3.5, subs=subs(BUCKET_A, 3, 3.5, 3),
    quote_de="Manche Kapitel haben sich gehalten, andere sind reine Zeitkapsel – wer mit Esoterik nichts anfangen kann, greift besser zu Psycho-Kybernetik.",
    quote_en="Some chapters held up, others are pure time capsule — if esoteric framing isn't for you, reach for Psycho-Cybernetics instead.",
    notfor_de="wer nüchterne, unesoterische Herleitungen bevorzugt.",
    notfor_en="anyone who prefers sober, non-esoteric reasoning."),

"beitrag-buch-weg-zur-finanziellen-freiheit.html": dict(
    score=3.5, subs=subs(BUCKET_C, 3, 4, 2.5),
    quote_de="Die Anlagetipps sind erkennbar in die Jahre gekommen – der Grundimpuls, konsequent zur Seite zu legen, nicht.",
    quote_en="The investment tips are visibly dated — the core impulse to consistently set money aside isn't.",
    notfor_de="wer aktuelle, konkrete Anlageempfehlungen sucht.",
    notfor_en="anyone looking for current, concrete investment recommendations."),

"beitrag-buch-weltordnung-im-wandel.html": dict(
    score=4, subs=subs(BUCKET_C, 3.5, 3, 4),
    quote_de="Kein Buch für zwischendurch – aber wer sein Portfolio geografisch diversifizieren will, bekommt hier den historischen Rahmen dazu geliefert.",
    quote_en="Not a book for in between — but if you want to diversify your portfolio geographically, this supplies the historical framework.",
    notfor_de="Einsteiger*innen ohne Vorwissen zu Anleihen, Geldpolitik und Wirtschaftsgeschichte.",
    notfor_en="beginners without prior knowledge of bonds, monetary policy and economic history."),

"beitrag-buch-zero-to-one.html": dict(
    score=4.5, subs=subs(BUCKET_B, 3, 4, 4.5),
    quote_de="Manche Aussagen stimmen nicht – und das ist der Punkt: Wer Thiel als Rezept liest, wird enttäuscht, wer ihn als Gesprächspartner liest, profitiert.",
    quote_en="Some claims don't hold up — that's the point: read Thiel as a recipe and you'll be disappointed, read him as a sparring partner and you'll gain.",
    notfor_de="wer ein Schritt-für-Schritt-Gründerhandbuch sucht statt Grundsatzfragen.",
    notfor_en="anyone wanting a step-by-step founder's manual rather than first-principles questions."),
}

def fmt_score(s):
    # 4 -> "4", 4.5 -> "4,5"  (DE-Komma, wie im Rest der Seite)
    return str(s).rstrip('0').rstrip('.').replace('.', ',') if isinstance(s, float) else str(s)

def build_card(data, buy_url):
    score = data['score']
    score_de = fmt_score(score)
    sub_rows = []
    for label_de, label_en, sc in data['subs']:
        sc_de = fmt_score(sc)
        sub_rows.append(f'''      <div class="fr-rating-sub-row">
        <span class="fr-rating-sub-label" data-en="{label_en}">{label_de}</span>
        <span class="fr-rating-sub-stars" style="--score:{sc};" role="img" aria-label="{sc_de} von 5" data-en-aria-label="{sc} out of 5">
          <span class="fr-stars-bg" aria-hidden="true">★★★★★</span><span class="fr-stars-fg" aria-hidden="true">★★★★★</span>
        </span>
      </div>''')
    sub_html = '\n'.join(sub_rows)

    card = f'''  <div class="fr-rating-card">
    <div class="fr-rating-top">
      <div class="fr-rating-info">
        <div class="fr-stars" style="--score:{score};" role="img" aria-label="{score_de} von 5 Sternen" data-en-aria-label="{score} out of 5 stars">
          <div class="fr-stars-bg" aria-hidden="true">★★★★★</div>
          <div class="fr-stars-fg" aria-hidden="true">★★★★★</div>
        </div>
        <span class="fr-rating-num">{score_de}<span class="fr-rating-num-max">/5</span></span>
        <span class="fr-rating-label" data-en="My rating">Meine Bewertung</span>
      </div>
      <a href="{buy_url}" class="btn btn-green fr-rating-buy-btn" target="_blank" rel="noopener sponsored" data-en="View on Amazon *">Bei Amazon ansehen *</a>
    </div>

    <blockquote class="fr-rating-quote">
      <p data-en="{data['quote_en']}">{data['quote_de']}</p>
    </blockquote>

    <div class="fr-rating-sub">
{sub_html}
    </div>

    <p class="fr-rating-not-for">
      <strong data-en="Not for:">Nicht geeignet für:</strong>
      <span data-en="{data['notfor_en']}">{data['notfor_de']}</span>
    </p>
  </div>

'''
    return card

BOTTOM_BTN_RE = re.compile(
    r'\n?\s*<p><a href="[^"]*" class="btn btn-green" target="_blank" rel="noopener sponsored" data-en="View on Amazon \*">Bei Amazon ansehen \*</a></p>\n?'
)

def main():
    done, missing, errors = [], [], []
    for fn, data in RATINGS.items():
        if not os.path.exists(fn):
            missing.append(fn)
            continue
        html = open(fn, encoding='utf-8').read()

        if 'fr-rating-card' in html:
            done.append((fn, 'SKIP schon vorhanden'))
            continue

        m = re.search(r'amazon\.[a-z]+/dp/[A-Za-z0-9]{10}', html)
        if not m:
            errors.append((fn, 'keine Amazon-URL gefunden'))
            continue
        buy_url = 'https://www.' + m.group(0)

        card = build_card(data, buy_url)

        # Einfügepunkt: nach disclaimer-box (Standardfall) oder nach der
        # abweichenden Inline-Variante (sieben-wege-effektivitaet)
        if 'class="disclaimer-box"' in html:
            insert_re = re.compile(r'(<div class="disclaimer-box"[^>]*>.*?</div>\s*\n)', re.S)
            new_html, n = insert_re.subn(lambda mm: mm.group(1) + '\n' + card, html, count=1)
        else:
            insert_re = re.compile(
                r'(<p style="font-size:\.8rem;color:var\(--ink-soft\);border-left:2px solid var\(--line-strong\);padding-left:10px;margin-bottom:24px;"[^>]*>.*?</p>\s*\n)',
                re.S
            )
            new_html, n = insert_re.subn(lambda mm: mm.group(1) + '\n' + card, html, count=1)

        if n != 1:
            errors.append((fn, 'Einfügepunkt (disclaimer) nicht gefunden'))
            continue

        # redundanten Bottom-Button entfernen
        new_html2, n2 = BOTTOM_BTN_RE.subn('\n', new_html, count=1)
        if n2 != 1:
            errors.append((fn, 'Bottom-Button nicht gefunden, Rating-Card trotzdem eingebaut'))
            new_html2 = new_html

        open(fn, 'w', encoding='utf-8').write(new_html2)
        done.append((fn, 'OK'))

    print(f'OK: {sum(1 for _,s in done if s=="OK")}')
    print(f'Übersprungen: {sum(1 for _,s in done if s!="OK")}')
    print(f'Fehler: {len(errors)}')
    for fn, e in errors:
        print(f'  FEHLER {fn}: {e}')
    for fn in missing:
        print(f'  FEHLT: {fn}')

if __name__ == '__main__':
    main()
