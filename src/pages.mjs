// Page templates. Every page is rendered twice: L = 'hr' | 'en'.
import { site, wines, wineOrder, facts } from './content.mjs';
import { ui, href, wineHref, productHref } from './i18n.mjs';
import { esc, pick, vflag, arrow, icons, lines, media, bottle } from './lib.mjs';
import map from './generated/map.json' with { type: 'json' };

const T = (L, hr, en) => (L === 'hr' ? hr : en);
const eyebrow = (n, text) => `<p class="eyebrow">${n ? `<span class="n">${n}</span><span class="ln"></span>` : ''}<span>${text}</span></p>`;
const price = (w, L) => w.price != null
  ? `<span class="price">${new Intl.NumberFormat(ui[L].locale, { style: 'currency', currency: 'EUR' }).format(w.price)}</span>`
  : `<span class="price na" data-verify>${ui[L].onRequest}</span>`;
const waLink = (L, text) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
const mailLink = (subject, body = '') => `mailto:${site.email}?subject=${encodeURIComponent(subject)}${body ? '&body=' + encodeURIComponent(body) : ''}`;
const xpMsg = L => T(L, 'Dobar dan, zanima me privatna degustacija u vinariji Vicelić. Datum: … Broj osoba: …', 'Hello, I would like to ask about a private wine tasting at Vicelić. Date: … Number of guests: …');
const xpSubject = L => T(L, 'Upit — privatna degustacija', 'Inquiry — private wine tasting');
const crumbs = (L, items) => `<nav aria-label="${T(L, 'Putanja', 'Breadcrumb')}"><ol class="crumbs">${items.map(([n, h]) => h ? `<li><a href="${h}">${esc(n)}</a></li>` : `<li aria-current="page">${esc(n)}</li>`).join('')}</ol></nav>`;
const specList = (rows, L) => `<dl class="spec">${rows.filter(r => r.v).map(r => `<div${vflag(r.verify)}><dt>${pick(r.k, L)}</dt><dd>${pick(r.v, L)}</dd></div>`).join('')}</dl>`;
const nameOf = w => w.nameFull || w.name;

// ─── Shared blocks ───────────────────────────────────────────────────────────
function mapBlock(L, dark = false) {
  const r = map.region, P = r.places;
  const lab = (k, name, dx = 10, dy = 4, anchor = 'start') => `<circle class="dot" cx="${P[k][0]}" cy="${P[k][1]}" r="3"/><text x="${P[k][0] + dx}" y="${P[k][1] + dy}" text-anchor="${anchor}">${name}</text>`;
  const c = map.croatia, f = c.frame;
  return `<div class="map-wrap rv">
<svg class="map" viewBox="0 0 ${r.width} ${r.height}" role="img" aria-labelledby="map-t">
<title id="map-t">${T(L, 'Karta: Dingač na poluotoku Pelješcu, između Dubrovnika i Korčule', 'Map: Dingač on the Pelješac peninsula, between Dubrovnik and Korčula')}</title>
<path class="land" d="${r.d}"/>
<text class="sea-l" x="${r.width * .2}" y="${r.height * .78}">${T(L, 'Jadransko more', 'Adriatic Sea')}</text>
<text x="${r.width * .06}" y="${r.height * .33}" opacity=".6">Korčula</text>
<text x="${r.width * .44}" y="${r.height * .72}" opacity=".6">Mljet</text>
<text x="${r.width * .38}" y="${r.height * .24}" opacity=".6">${T(L, 'Poluotok Pelješac', 'Pelješac peninsula')}</text>
<path class="route" d="M${P.dubrovnik[0]} ${P.dubrovnik[1]} Q ${P.ston[0] + 60} ${P.ston[1] + 40} ${P.ston[0]} ${P.ston[1]} T ${P.dingac[0]} ${P.dingac[1]}"/>
${lab('dubrovnik', 'Dubrovnik', -10, 18, 'end')}${lab('ston', 'Ston', 10, 16)}${lab('orebic', 'Orebić', -8, -10, 'end')}
<circle class="pin-ring" cx="${P.dingac[0]}" cy="${P.dingac[1]}" r="9"/><circle class="pin" cx="${P.dingac[0]}" cy="${P.dingac[1]}" r="5"/>
<text class="big" x="${P.dingac[0] + 14}" y="${P.dingac[1] + 34}">Dingač</text>
</svg>
<div class="map-inset" aria-hidden="true"><svg viewBox="0 0 ${c.width} ${c.height}"><path class="land" d="${c.d}"/><rect class="frame" x="${f[0]}" y="${f[1]}" width="${f[2] - f[0]}" height="${f[3] - f[1]}"/></svg><span class="cap">${T(L, 'Hrvatska', 'Croatia')}</span></div>
</div>`;
}

function xpBanner(L, n) {
  return `<section class="xp" aria-labelledby="xp-h">
${media('tasting', L, { parallax: .1, reveal: false, sizes: '100vw' })}
<div class="wrap">
${eyebrow(n, T(L, 'Privatna degustacija', 'Private wine experience'))}
<h2 id="xp-h" class="h1 mt-2 lines">${lines(T(L, 'Kušajte Dingač|ondje gdje nastaje.', 'Taste Dingač|where it is born.'))}</h2>
<div class="body rv" data-verify><p>${T(L,
    'Pridružite nam se na privatnoj, vođenoj degustaciji među vinogradima Dingača, s morem pod sobom. Točimo naša vina i pričamo o obitelji, o zemlji i o načinu na koji radimo.',
    'Join us for a private, guided tasting among the vineyards of Dingač, with the sea below. We pour our wines and talk about the family, the land and the way we work.')}</p></div>
<div class="actions rv d1"><a class="btn btn-light" href="${href(L, 'experience')}#rezervacija">${ui[L].reserve} ${arrow}</a></div>
<div class="inq rv d2"><a class="link" href="${waLink(L, xpMsg(L))}" rel="noopener">${icons.wa.replace('<svg', '<svg width="14" height="14"')} WhatsApp</a><a class="link" href="${mailLink(xpSubject(L))}">${ui[L].email}</a></div>
</div></section>`;
}

function finale(L) {
  return `<section class="finale" aria-label="Vicelić">
${media('finale', L, { parallax: .08, reveal: false })}
<div class="in"><p class="places rv"><span>Dingač</span><span>Pelješac</span><span>${T(L, 'Hrvatska', 'Croatia')}</span></p><p class="mark rv d2">VICELIĆ</p></div></section>`;
}

function buyBox(id, L) {
  const w = wines[id];
  const hasStripe = !!w.stripe;
  return `<div class="buy" data-buy="${id}">
<div class="top"><div><p class="caps-s muted">${pick(w.type, L)} · ${w.volume}${w.vintage ? ' · ' + w.vintage : ''}</p></div>${price(w, L)}</div>
<div class="row2">
<div class="qty" role="group" aria-label="${ui[L].qty}"><button type="button" data-q="-1" aria-label="−">−</button><input type="number" inputmode="numeric" min="1" max="99" value="1" aria-label="${ui[L].qty}"><button type="button" data-q="1" aria-label="+">+</button></div>
<button type="button" class="btn" data-add>${ui[L].addToCart}</button>
</div>
${hasStripe ? `<a class="btn btn-ghost" href="${w.stripe}" rel="noopener">${T(L, 'Kupi odmah', 'Buy now')} ${arrow}</a>` : ''}
<p class="note">${ui[L].cartNote} <a class="link" href="${href(L, 'terms')}">${ui[L].footer.terms}</a></p>
</div>`;
}

// ─── HOME ────────────────────────────────────────────────────────────────────
export function home(L) {
  const d = wines.dingac, p = wines['plavac-mali'], o = wines['opolo-rose'];
  const body = `
<section class="hero" data-hero aria-labelledby="hero-h">
${media('hero', L, { eager: true, reveal: false, parallax: .18, sizes: '100vw', pos: '50% 60%' })}
<div class="hero-in wrap on-image">
<p class="kicker caps"><span>Boutique Winery Vicelić</span><span class="dot"></span><span>Dingač · Pelješac · ${T(L, 'Hrvatska', 'Croatia')}</span></p>
<h1 id="hero-h" class="display lines">${lines(T(L, 'Iz kamena,|sunca <em>i</em> mora.', 'Born of stone,|sun <em>&amp;</em> sea.'))}</h1>
<div class="hero-foot"><div>
<p class="rv d2">${T(L, 'Organski Plavac Mali sa strmih obronaka Dingača.', 'Organic Plavac Mali from the steep slopes of Dingač.')}</p>
<div class="actions mt-2 rv d3"><a class="btn btn-light" href="${href(L, 'dingac')}">${T(L, 'Otkrijte Dingač', 'Discover Dingač')} ${arrow}</a><a class="btn btn-ghost" href="${href(L, 'wines')}">${T(L, 'Naša vina', 'Explore our wines')}</a></div>
</div><p class="scroll-cue" aria-hidden="true">${T(L, 'Dalje', 'Scroll')}<i></i></p></div>
</div></section>

<main id="main">
<section class="sec intro" aria-labelledby="intro-h">
<div class="wrap grid">
<div class="col-span mb-3">${eyebrow('01', 'Boutique Winery Vicelić')}</div>
<h2 id="intro-h" class="statement balance lines">${lines(T(L, 'Obiteljska vinarija|oblikovana jednim od|najneobičnijih vinograda|Mediterana.', 'A family winery|shaped by one of the|Mediterranean’s most|extraordinary vineyards.'))}</h2>
<div class="side body rv"><p>${T(L,
    'Plavac Mali uzgajamo na strmim, suncu izloženim obroncima Dingača na poluotoku Pelješcu — bez pesticida, herbicida i umjetnih gnojiva. Svako naše vino fermentira spontano, isključivo na divljim kvascima, kako bi mjesto i godište mogli govoriti sami za sebe.',
    'We grow Plavac Mali on the steep, sun-exposed slopes of Dingač, on the Pelješac peninsula — without pesticides, herbicides or artificial fertilizers. Every wine ferments spontaneously, on wild yeasts alone, so that the place and the vintage can speak for themselves.')}</p>
<p class="mt-2"><a class="link" href="${href(L, 'story')}">${T(L, 'Naša priča', 'Our story')} ${arrow}</a></p></div>
</div></section>

<section class="place-full" aria-labelledby="place-h">
${media('slope', L, { parallax: .12, reveal: false })}
<div class="wrap on-image">
${eyebrow('02', T(L, 'Mjesto', 'The place'))}
<h2 id="place-h" class="place-word lines">${lines('Dingač')}</h2>
<p class="lede rv d2" style="max-width:22ch">${T(L, 'Vinograd iznad Jadrana, na kamenu i suncu.', 'A vineyard above the Adriatic, made of stone and sun.')}</p>
</div></section>

<section class="sec" aria-labelledby="why-h">
<div class="wrap grid place-split">
<div class="fig">${media('stone', L, { ratio: '4x5', sizes: '(min-width:900px) 50vw, 100vw' })}</div>
<div class="txt">
<h2 id="why-h" class="h2 balance rv">${T(L, 'Zašto je <em>Dingač</em> poseban.', 'Why <em>Dingač</em> matters.')}</h2>
<p class="body mt-2 rv d1">${T(L,
    'Dingač je jedan od najslavnijih vinogradarskih položaja Hrvatske: strmi obronci na Pelješcu koji se spuštaju prema moru. Ovdje Plavac Mali raste na kamenu, pod punim suncem.',
    'Dingač is one of Croatia’s most celebrated vineyard sites: steep slopes on Pelješac that run down towards the sea. Here Plavac Mali grows on stone, in full sun.')}</p>
<ol class="elements rv d2">
<li><span class="n">i</span><div><h3>${T(L, 'Kamen', 'Stone')}</h3><p>${T(L, 'Stjenoviti obronci — mineralnost u čaši dolazi odavde.', 'Rocky slopes — the minerality in the glass begins here.')}</p></div></li>
<li><span class="n">ii</span><div><h3>${T(L, 'Sunce', 'Sun')}</h3><p>${T(L, 'Strmi, suncu izloženi vinogradi — temeljna odlika Dingača.', 'Steep, sun-exposed vineyards — the defining condition of Dingač.')}</p></div></li>
<li><span class="n">iii</span><div><h3>${T(L, 'More', 'Sea')}</h3><p>${T(L, 'Jadran leži izravno ispod trsova.', 'The Adriatic lies directly below the vines.')}</p></div></li>
<li><span class="n">iv</span><div><h3>Plavac Mali</h3><p>${T(L, 'Autohtona hrvatska sorta — i jedina koju uzgajamo.', 'Croatia’s indigenous red grape — and the only one we grow.')}</p></div></li>
</ol></div></div>
<div class="wrap mt-6"><div class="facts rv">
<div data-verify><p class="v">${T(L, facts.hectares.v, facts.hectares.en)}<small>HA</small></p><p class="k">${T(L, 'Vinograda', 'Of vineyards')}</p></div>
<div data-verify><p class="v">${T(L, facts.density.v, facts.density.en)}</p><p class="k">${T(L, 'Trsova po hektaru', 'Vines per hectare')}</p></div>
<div><p class="v">0</p><p class="k">${T(L, 'Pesticida, herbicida, umjetnih gnojiva', 'Pesticides, herbicides, artificial fertilizers')}</p></div>
<div><p class="v"><em>${T(L, 'Divlji', 'Wild')}</em></p><p class="k">${T(L, 'Kvasci — spontana fermentacija', 'Yeasts — spontaneous fermentation')}</p></div>
</div></div></section>

<section class="sec paper" aria-labelledby="wines-h">
<div class="wrap">
<div class="wines-head">${eyebrow('03', T(L, 'Vina', 'The wines'))}<h2 id="wines-h" class="h2 balance rv" style="max-width:14ch">${T(L, 'Jedna sorta. <em>Tri izraza.</em>', 'One grape. <em>Three expressions.</em>')}</h2></div>
<div class="wines-set">
${[['dingac', 'wine-a', true], ['plavac-mali', 'wine-b'], ['opolo-rose', 'wine-c']].map(([id, cls, flag]) => {
    const w = wines[id];
    return `<article class="wine ${cls} rv">
<a class="stage" href="${wineHref(L, id)}" aria-label="${esc(nameOf(w))}">${flag ? `<span class="flag">${T(L, 'Vodeće vino', 'Flagship')}</span>` : ''}${bottle(id, L, { sizes: '30vw' })}</a>
<div class="meta"><span class="caps-s">${pick(w.origin, L)}</span><span class="caps-s muted">${w.grape}${w.vintage ? ' · ' + w.vintage : ''}</span></div>
<h3>${nameOf(w)}</h3>
<p class="d">${pick(w.short, L)}</p>
<div class="actions"><a class="link" href="${wineHref(L, id)}">${ui[L].explore} ${arrow}</a><a class="link" href="${productHref(L, id)}">${ui[L].buy}</a></div>
</article>`;
  }).join('')}
</div></div></section>

<section class="sec dark flagship" aria-labelledby="flag-h">
<div class="wrap grid">
<div class="bottle-col rv"><span class="halo" aria-hidden="true"></span>${bottle('dingac', L, { sizes: '(min-width:1000px) 30vw, 60vw' })}</div>
<div class="copy">
${eyebrow('04', T(L, 'Vodeće vino', 'The flagship'))}
<h2 id="flag-h" class="display mt-2 lines">${lines('Dingač')}</h2>
<p class="caps mt-2 rv muted">Plavac Mali · Dingač, Pelješac</p>
<ul class="pillars rv d1">
<li>${T(L, 'Organski uzgoj', 'Organic viticulture')}</li><li data-verify>${T(L, 'Ručna berba', 'Hand harvested')}</li><li>${T(L, 'Divlji kvasci', 'Wild fermentation')}</li><li data-verify>${T(L, 'Hrastove bačve', 'Oak ageing')}</li><li>${T(L, 'Mala proizvodnja', 'Small production')}</li>
</ul>
<div class="aromas rv d2">
<p class="caps-s muted">${T(L, 'U čaši', 'In the glass')}</p>
<ul class="aroma-list">${pick(d.aromas.young, L).map(a => `<li>${a}</li>`).join('')}</ul>
<p class="caps-s muted mt-2">${T(L, 'S godinama', 'With age')}</p>
<ul class="aroma-list aged">${pick(d.aromas.aged, L).map(a => `<li>${a}</li>`).join('')}</ul>
</div>
<div class="actions mt-3 rv d3"><a class="btn btn-light" href="${href(L, 'dingac')}">${T(L, 'Otkrijte Dingač', 'Discover Dingač')} ${arrow}</a><a class="link" href="${productHref(L, 'dingac')}">${ui[L].buy}</a></div>
</div></div>
<div class="wrap"><div class="flag-images">
<div class="i1">${media('vines', L, { ratio: '3x2', sizes: '(min-width:700px) 58vw, 100vw' })}</div>
<div class="i2">${media('cellar', L, { ratio: '3x4', sizes: '(min-width:700px) 33vw, 75vw' })}</div>
</div></div></section>

<section class="sec phil" aria-labelledby="phil-h">
<div class="wrap grid">
<div class="head">${eyebrow('05', T(L, 'Filozofija', 'Philosophy'))}
<h2 id="phil-h" class="h1 mt-2 lines">${lines(T(L, 'Neka|govori|mjesto.', 'Let the|place|speak.'))}</h2>
<p class="body mt-2 rv">${T(L, 'Minimalna intervencija — kako bi se karakter Dingača i svakog godišta mogao u potpunosti izraziti.', 'Minimal intervention — so that the character of Dingač, and of each vintage, can express itself fully.')}</p></div>
<ol class="list principles rv">${philosophy(L)}</ol>
</div></section>

<section class="sec stone-2 people" aria-labelledby="people-h">
<div class="wrap grid">
<div class="fig">${media('family', L, { ratio: '4x5', sizes: '(min-width:900px) 40vw, 100vw' })}</div>
<div class="txt">
${eyebrow('06', T(L, 'Ljudi', 'People'))}
<h2 id="people-h" class="triad mt-2 lines">${lines(T(L, 'Obitelj.|Vinograd.|Vino.', 'Family.|Vineyard.|Wine.'))}</h2>
<div class="body mt-3 rv"><p>${T(L,
    'Vicelić je obiteljska vinarija. Vinograde obrađuje i vina radi obitelj — vinar je Mateo Vicelić.',
    'Vicelić is a family winery. The family farms the vineyards and makes the wines, with Mateo Vicelić as winemaker.')}</p>
<p data-verify>${T(L,
    'Veza s Dingačem seže do 1935., kada je Mateov pradjed ovdje proizvodio Dingač. Rat je prekinuo tu priču; obitelj ju je nastavila obnovivši povijesne vinograde na Dingaču.',
    'The family’s story in Dingač reaches back to 1935, when Mateo’s great-grandfather made Dingač here. War interrupted it; the family picked it up again by replanting the historic vineyards of Dingač.')}</p></div>
<div class="sig rv"><span class="nm">Mateo Vicelić</span><span class="caps-s muted">${T(L, 'Vinar', 'Winemaker')}</span></div>
<p class="mt-2 rv"><a class="link" href="${href(L, 'story')}">${T(L, 'Naša priča', 'Our story')} ${arrow}</a></p>
</div></div></section>

${xpBanner(L, '07')}

<section class="sec geo" aria-labelledby="geo-h">
<div class="wrap grid">
<div class="txt">${eyebrow('08', 'Pelješac')}
<h2 id="geo-h" class="h2 mt-2 balance rv">${T(L, 'Između Dubrovnika <em>i</em> Korčule.', 'Between Dubrovnik <em>&amp;</em> Korčula.')}</h2>
<p class="body mt-2 rv d1">${T(L,
    'Dingač leži na južnoj strani poluotoka Pelješca, u južnoj Dalmaciji. Pelješac se od kopna kod Stona pruža prema zapadu, sve do Orebića i kanala prema Korčuli.',
    'Dingač lies on the southern side of the Pelješac peninsula, in southern Dalmatia. From the mainland at Ston, Pelješac reaches west towards Orebić and the channel facing Korčula.')}</p>
<address class="mt-2 rv d2" style="font-style:normal"><p class="caps-s muted">${T(L, 'Vinarija', 'The winery')}</p><p class="lede mt-1">${site.address.street}<br>${site.address.postalCode} ${site.address.locality}, Pelješac</p></address>
<p class="mt-2 rv d3"><a class="link" href="${href(L, 'contact')}">${T(L, 'Kako do nas', 'Plan your visit')} ${arrow}</a></p>
</div>
${mapBlock(L)}
</div></section>

<section class="sec-s paper" aria-labelledby="shop-h">
<div class="wrap">
<div class="wines-head" style="margin-bottom:2.5rem">${eyebrow('09', T(L, 'Izravno s imanja', 'From the estate'))}<a class="link" href="${href(L, 'shop')}">${T(L, 'Cijela ponuda', 'Visit the shop')} ${arrow}</a></div>
<h2 id="shop-h" class="sr-only">${ui[L].nav.shop}</h2>
<ul class="rowlist">${wineOrder.map(id => {
    const w = wines[id];
    return `<li><a class="row" href="${productHref(L, id)}"><span class="th">${bottle(id, L, { decorative: true, sizes: '120px' })}</span><span><span class="nm">${nameOf(w)}</span><span class="sub">${pick(w.origin, L)} · ${w.grape}</span></span><span class="ds">${pick(w.short, L)}</span><span class="pr">${price(w, L)}<span class="caps-s">${ui[L].buy} →</span></span></a></li>`;
  }).join('')}</ul>
</div></section>
${finale(L)}
</main>`;
  return {
    key: 'home', hero: true, sticky: true,
    title: T(L, 'Butik vinarija Vicelić — organski Dingač i Plavac Mali, Pelješac', 'Boutique Winery Vicelić — Organic Dingač & Plavac Mali, Pelješac'),
    desc: T(L, 'Obiteljska butik vinarija na Dingaču, Pelješac. Certificirano organski Plavac Mali, spontana fermentacija, mala proizvodnja. Vina i privatne degustacije.',
      'Family boutique winery on the slopes of Dingač, Pelješac. Certified organic Plavac Mali, wild-yeast fermentation, small production. Wines and private tastings.'),
    og: 'hero', body,
  };
}

function philosophy(L) {
  const items = [
    [T(L, 'Certificirano organski', 'Certified organic'), T(L, 'Naši su vinogradi certificirano organski, od 2017.', 'Our vineyards are certified organic, since 2017.'), true],
    [T(L, 'Zdravo tlo', 'Healthy soil'), T(L, 'Bez pesticida, bez herbicida, bez umjetnih gnojiva. Zemlja ostaje živa — i čista.', 'No pesticides, no herbicides, no artificial fertilizers. The land stays alive — and clean.')],
    [T(L, 'Divlji kvasci', 'Wild yeasts'), T(L, 'Fermentacija počinje sama, isključivo na divljim (autohtonim) kvascima. Bez dodanih enzima i umjetnih aditiva.', 'Fermentation starts on its own, on wild (indigenous) yeasts alone. No added enzymes, no artificial additives.')],
    [T(L, 'Minimalna intervencija', 'Minimal intervention'), T(L, 'Ne ispravljamo vino — pratimo ga, da bi Dingač i godište mogli doći do izražaja.', 'We accompany the wine rather than correct it, so that Dingač and the vintage come through.')],
    [T(L, 'Ručni rad', 'By hand'), T(L, 'Grožđe se bere i sortira ručno.', 'Grapes are picked and sorted by hand.'), true],
    [T(L, 'Mala proizvodnja', 'Small production'), T(L, 'Ne jurimo za količinom. Naš rosé, Opolo, puni se u samo 2.500 boca.', 'We do not chase volume. Our rosé, Opolo, is bottled in just 2,500 bottles.')],
  ];
  return items.map(([h, p, v]) => `<li${vflag(v)}><h3>${h}</h3><p>${p}</p></li>`).join('');
}

// ─── DINGAČ (flagship) ───────────────────────────────────────────────────────
export function dingac(L) {
  const w = wines.dingac;
  const row = k => w.vineyard.concat(w.cellar).find(r => pick(r.k, 'en') === k);
  const ch = (n, label, inner, cls = '') => `<section class="sec ${cls}"><div class="wrap chapter"><div class="ch-n"><p class="ch-num rv">${n}</p><p class="caps mt-1 rv">${label}</p></div><div class="ch-b">${inner}</div></div></section>`;
  const body = `
<section class="phero" data-hero aria-labelledby="h1">
${media('hero', L, { eager: true, reveal: false, parallax: .16, pos: '50% 55%' })}
<div class="wrap on-image">
${crumbs(L, [[ui[L].home, href(L, 'home')], ['Dingač']])}
<h1 id="h1" class="display lines">${lines('Dingač')}</h1>
<p class="lede mt-2 rv d2" style="max-width:24ch">${T(L, 'Plavac Mali s legendarnih obronaka Pelješca.', 'Plavac Mali from the legendary slopes of Pelješac.')}</p>
</div></section>
<main id="main">
<section class="sec"><div class="wrap grid"><p class="statement c-2-12 col-span balance lines">${lines(T(L, 'Kamen, sunce i more|u jednoj boci.|Naše vodeće vino.', 'Stone, sun and sea|in a single bottle.|Our flagship wine.'))}</p></div></section>

${ch('I', T(L, 'Vinograd', 'The vineyard'), `
<h2 class="h2 balance rv">${T(L, 'Strmi obronci <em>iznad mora.</em>', 'Steep slopes <em>above the sea.</em>')}</h2>
<p class="body mt-2 rv">${T(L, 'Dingač je položaj na južnoj strani Pelješca: stjenoviti, suncu izloženi obronci koji se spuštaju prema Jadranu. Ovdje uzgajamo isključivo Plavac Mali.', 'Dingač is a site on the southern side of Pelješac: rocky, sun-exposed slopes falling towards the Adriatic. Here we grow Plavac Mali and nothing else.')}</p>
<p class="body mt-1 rv" data-verify>${T(L, 'Najveći dio naših vinograda nalazi se upravo na Dingaču.', 'The great majority of our vineyards lie within Dingač itself.')}</p>
<div class="mt-3">${media('slope', L, { ratio: '16x9', sizes: '(min-width:1000px) 60vw, 100vw' })}</div>`)}

${ch('II', 'Terroir', `
<h2 class="h2 balance rv">${T(L, 'Mineralnost <em>stjenovitih obronaka.</em>', 'The minerality <em>of rock.</em>')}</h2>
<p class="body mt-2 rv">${T(L, 'Kamen, sunce i blizina mora oblikuju ovo vino. U čaši se to osjeća kao suptilna mineralnost koja odražava stjenovite, suncu izložene obronke Dingača.', 'Stone, sun and the nearness of the sea shape this wine. In the glass it shows as a quiet minerality that reflects the rocky, sun-exposed slopes of Dingač.')}</p>
<div class="kv-line rv">${[['Soil', T(L, 'Tlo', 'Soil')], ['Area', T(L, 'Površina', 'Area')]].map(([k, lab]) => { const r = row(k); return `<div data-verify><p class="k">${lab}</p><p class="v">${r?.v ? pick(r.v, L) : `<span class="caps-s muted">${ui[L].tbc}</span>`}</p></div>`; }).join('')}
<div><p class="k">${T(L, 'Sorta', 'Grape')}</p><p class="v">Plavac Mali</p></div></div>
<div class="mt-3" style="max-width:520px">${media('stone', L, { ratio: '4x5', sizes: '(min-width:1000px) 40vw, 100vw' })}</div>`, 'paper')}

${ch('III', T(L, 'Uzgoj', 'Viticulture'), `
<h2 class="h2 balance rv">${T(L, 'Gusto sađeni <em>trsovi u čaši.</em>', 'Densely planted <em>bush vines.</em>')}</h2>
<div class="big-num mt-3 rv" data-verify><span class="v">${T(L, '10.000', '10,000')}</span><span class="u">${T(L, 'trsova po hektaru', 'vines per hectare')}</span></div>
<div class="kv-line rv">
<div data-verify><p class="k">${T(L, 'Uzgoj', 'Training')}</p><p class="v">${T(L, 'Gobelet', 'En gobelet')}</p></div>
<div data-verify><p class="k">${T(L, 'Podloga', 'Rootstock')}</p><p class="v">Richter 110</p></div>
<div><p class="k">${T(L, 'Uzgoj', 'Farming')}</p><p class="v">${T(L, 'Organski', 'Organic')}</p></div>
</div>
<p class="body mt-3 rv">${T(L, 'Bez pesticida, herbicida i umjetnih gnojiva. Svaki trs na ovim obroncima traži ruke, a ne strojeve.', 'No pesticides, no herbicides, no artificial fertilizers. On slopes like these, every vine asks for hands rather than machines.')}</p>
<div class="mt-3">${media('vines', L, { ratio: '3x2', sizes: '(min-width:1000px) 60vw, 100vw' })}</div>`)}

<section class="sec dark" aria-labelledby="cellar-h"><div class="wrap">
${eyebrow('IV — VI', T(L, 'Od berbe do bačve', 'From harvest to barrel'))}
<h2 id="cellar-h" class="h1 mt-2 lines">${lines(T(L, 'Ručno. Spontano.|Strpljivo.', 'By hand. On its own.|In its own time.'))}</h2>
<ol class="timeline rv">
<li data-verify><div><h3>${T(L, 'Berba', 'Harvest')}</h3><p>${T(L, 'Grožđe se bere ručno.', 'The grapes are picked by hand.')}</p></div></li>
<li><div><h3>${T(L, 'Fermentacija', 'Fermentation')}</h3><p>${T(L, 'Spontano, isključivo na divljim (autohtonim) kvascima.', 'Spontaneous, on wild (indigenous) yeasts only.')}</p></div></li>
<li><div><h3>${T(L, 'Bez dodataka', 'Nothing added')}</h3><p>${T(L, 'Bez dodanih enzima i umjetnih aditiva.', 'No added enzymes, no artificial additives.')}</p></div></li>
<li data-verify><div><h3>${T(L, 'Hrast', 'Oak')}</h3><p>${T(L, 'Bačve od 225 L, francuski i američki hrast — svake godine 50 % novih, 50 % rabljenih.', '225-litre barrels of French and American oak — each year 50% new, 50% used.')}</p></div></li>
</ol>
<div class="flag-images"><div class="i1">${media('harvest', L, { ratio: '3x2', sizes: '(min-width:700px) 58vw, 100vw' })}</div><div class="i2">${media('cellar', L, { ratio: '3x4', sizes: '(min-width:700px) 33vw, 75vw' })}</div></div>
${(() => { const a = row('Ageing'), p = row('Production'); return `<div class="kv-line rv"><div data-verify><p class="k">${T(L, 'Dozrijevanje', 'Ageing')}</p><p class="v">${a?.v ? pick(a.v, L) : `<span class="caps-s muted">${ui[L].tbc}</span>`}</p></div><div data-verify><p class="k">${T(L, 'Proizvodnja', 'Production')}</p><p class="v">${p?.v ? pick(p.v, L) : `<span class="caps-s muted">${ui[L].tbc}</span>`}</p></div></div>`; })()}
</div></section>

${ch('VII', T(L, 'Kušanje', 'Tasting'), `
<p class="lede rv">${pick(w.tasting.text, L)}</p>
<div class="aromas"><p class="caps-s muted">${T(L, 'Mlado vino', 'In youth')}</p><ul class="aroma-list rv">${pick(w.aromas.young, L).map(a => `<li>${a}</li>`).join('')}</ul>
<p class="caps-s muted mt-2">${T(L, 'S godinama', 'With age')}</p><ul class="aroma-list aged rv">${pick(w.aromas.aged, L).map(a => `<li>${a}</li>`).join('')}</ul></div>`)}

${ch('VIII', T(L, 'Posluživanje', 'Serving'), `
<div class="spec-2">
<div data-verify><p class="caps-s muted">${T(L, 'Temperatura', 'Temperature')}</p><div class="temp"><span class="deg">18°</span><span class="bar" style="--x:78%"><i></i></span></div><p class="body mt-2">${pick(w.serving.v, L)}</p></div>
<div><p class="caps-s muted">${T(L, 'Arhiviranje', 'Cellaring')}</p><p class="h3 mt-1">${T(L, 'Vino za čekanje.', 'Built to age.')}</p><p class="body mt-1">${T(L, 'Starenjem Dingač dobiva dubinu — tamnu čokoladu, duhan i slatke začine.', 'With time in bottle Dingač gains depth — dark chocolate, tobacco and sweet spice.')}</p>${w.cellaring.v ? `<p class="caps mt-1" data-verify>${pick(w.cellaring.v, L)}</p>` : ''}</div>
</div>`, 'paper')}

<section class="sec dark product dk" aria-labelledby="buy-h"><div class="wrap grid">
<div class="pstage rv"><span class="halo" aria-hidden="true"></span>${bottle('dingac', L, { sizes: '40vw' })}</div>
<div class="pinfo">${eyebrow('IX', T(L, 'Boca', 'The bottle'))}
<h2 id="buy-h" class="h1 mt-2">Dingač</h2>
<p class="caps muted mt-1">Plavac Mali · Dingač, Pelješac</p>
<p class="body mt-2">${pick(w.short, L)}</p>
${buyBox('dingac', L)}
<p class="mt-2"><a class="link" href="${productHref(L, 'dingac')}">${T(L, 'Tehnički podaci', 'Full technical sheet')} ${arrow}</a></p>
</div></div></section>
${finale(L)}
</main>`;
  return {
    key: 'dingac', hero: true, sticky: true,
    title: T(L, 'Dingač — Plavac Mali s Pelješca | Vinarija Vicelić', 'Dingač Wine — Plavac Mali from Pelješac | Vicelić Winery'),
    desc: T(L, 'Vicelić Dingač: organski Plavac Mali sa strmih obronaka Dingača na Pelješcu. Divlji kvasci, hrastove bačve, crna trešnja, smokva, kadulja.',
      'Vicelić Dingač: organic Plavac Mali from the steep slopes of Dingač, Pelješac. Wild yeasts, oak barrels, notes of black cherry, dried fig and wild sage.'),
    og: 'hero', crumbs: [[ui[L].home, href(L, 'home')], ['Dingač', href(L, 'dingac')]], body,
  };
}

// ─── WINES overview ──────────────────────────────────────────────────────────
export function winesPage(L) {
  const body = `<main id="main">
<section class="pband"><div class="wrap">
${crumbs(L, [[ui[L].home, href(L, 'home')], [ui[L].nav.wines]])}
<h1 class="display lines">${lines(T(L, 'Jedna sorta.|<em>Tri izraza.</em>', 'One grape.|<em>Three expressions.</em>'))}</h1>
<p class="lede mt-3 rv" style="max-width:34ch">${T(L, 'Sva naša vina rađaju se od Plavca Malog — autohtone sorte Pelješca — uzgojenog organski i fermentiranog na divljim kvascima.', 'Every wine we make is Plavac Mali — the indigenous grape of Pelješac — farmed organically and fermented on wild yeasts.')}</p>
</div></section>
${wineOrder.map((id, i) => {
    const w = wines[id];
    const bg = id === 'dingac' ? 'dark' : id === 'opolo-rose' ? 'opolo sun-band' : 'stone-2';
    return `<section class="sec ${bg}" aria-labelledby="w-${id}"><div class="wrap grid place-split ${i % 2 ? 'rev' : ''}">
<div class="fig"><a href="${wineHref(L, id)}" class="pcard ${id === 'dingac' ? 'dk' : id === 'opolo-rose' ? 'lt' : ''}" style="display:block"><span class="stage">${bottle(id, L, { sizes: '(min-width:900px) 30vw, 60vw' })}</span></a></div>
<div class="txt">${eyebrow(`0${i + 1}`, `${pick(w.type, L)} · ${pick(w.origin, L)}`)}
<h2 id="w-${id}" class="h1 mt-2 rv">${nameOf(w)}</h2>
<p class="lede mt-2 rv d1">${pick(w.tagline, L)}</p>
<p class="body mt-2 rv d2">${pick(w.short, L)}</p>
<div class="actions mt-3 rv d3"><a class="btn ${id === 'dingac' ? 'btn-light' : ''}" href="${wineHref(L, id)}">${ui[L].explore} ${arrow}</a><a class="link" href="${productHref(L, id)}">${ui[L].buy}</a></div>
</div></div></section>`;
  }).join('')}
${xpBanner(L, '')}
</main>`;
  return {
    key: 'wines',
    title: T(L, 'Vina — Dingač, Plavac Mali, Opolo Rosé | Vinarija Vicelić', 'Our Wines — Dingač, Plavac Mali, Opolo Rosé | Vicelić Winery'),
    desc: T(L, 'Organska vina od Plavca Malog s Pelješca: Dingač, Plavac Mali i Opolo rosé. Butik vinarija Vicelić.', 'Organic Plavac Mali wines from Pelješac, Croatia: Dingač, Plavac Mali and Opolo rosé, from Boutique Winery Vicelić.'),
    og: 'grapes', crumbs: [[ui[L].home, href(L, 'home')], [ui[L].nav.wines, href(L, 'wines')]], body,
  };
}

// ─── PLAVAC MALI (own character: open, graphic, cool) ────────────────────────
export function plavac(L) {
  const w = wines['plavac-mali'];
  const body = `<main id="main" class="plv">
<section class="pband stone-2" style="overflow:hidden"><div class="wrap grid" style="align-items:end;row-gap:2rem">
<div class="col-span">${crumbs(L, [[ui[L].home, href(L, 'home')], [ui[L].nav.wines, href(L, 'wines')], ['Plavac Mali']])}</div>
<h1 class="col-span big-word lines" aria-label="Plavac Mali">${lines('Plavac|<em>Mali</em>')}</h1>
<div class="col-span c-8-13 rv"><p class="lede">${pick(w.tagline, L)}</p><p class="caps muted mt-1">${pick(w.type, L)} · ${pick(w.origin, L)}</p></div>
</div></section>
<section class="sec"><div class="wrap grid place-split">
<div class="fig"><div class="pcard" style="display:block"><span class="stage">${bottle('plavac-mali', L, { eager: true, sizes: '(min-width:900px) 30vw, 60vw' })}</span></div></div>
<div class="txt">${eyebrow('', T(L, 'Karakter', 'Character'))}
<p class="statement mt-2 rv" data-verify>${T(L, 'Crveno voće. Bilje. <em>Jedva primjetni tanini.</em>', 'Red fruit. Herbs. <em>The lightest touch of tannin.</em>')}</p>
<p class="body mt-2 rv" data-verify>${pick(w.tasting.text, L)}</p>
</div></div></section>
<section class="sec-s dark"><div class="wrap grid" style="row-gap:3rem;align-items:center">
<div class="col-span c-1-6"><p class="caps-s muted">${T(L, 'Posluživanje', 'Serving')}</p><p class="h1 mt-1" data-verify>${T(L, 'Rashlađeno.', 'Chilled.')}</p></div>
<div class="col-span c-7-13"><p class="lede" data-verify>${T(L, 'Ljetno crno vino koje ne treba sobnu temperaturu. Poslužite ga lagano rashlađenog — idealno uz odrezak od tune.', 'A summer red that does not need room temperature. Serve it lightly chilled — ideally with a tuna steak.')}</p></div>
</div></section>
<section class="sec"><div class="wrap spec-2">
<div>${eyebrow('', T(L, 'Vinograd', 'Vineyard'))}<div class="mt-2">${specList(w.vineyard, L)}</div></div>
<div>${eyebrow('', T(L, 'Podrum', 'Cellar'))}<div class="mt-2">${specList(w.cellar, L)}</div></div>
</div></section>
<section class="sec-s paper"><div class="wrap grid" style="row-gap:2rem;align-items:end">
<div class="col-span c-1-7"><p class="caps-s muted">Plavac Mali · ${w.volume}</p><h2 class="h2 mt-1">${T(L, 'Naručite izravno s imanja.', 'Order direct from the estate.')}</h2></div>
<div class="col-span c-8-13">${buyBox('plavac-mali', L)}</div>
</div></section>
${xpBanner(L, '')}
</main>`;
  return {
    key: 'wine-plavac-mali',
    title: T(L, 'Plavac Mali — organsko crno vino s Pelješca | Vicelić', 'Plavac Mali — Organic Croatian Red Wine from Pelješac | Vicelić'),
    desc: T(L, 'Vicelić Plavac Mali: pitko, voćno crno vino s Pelješca, organski uzgoj i divlji kvasci. Crveno voće, bilje, nježni tanini.', 'Vicelić Plavac Mali: an easy, fruit-led Croatian red from Pelješac — organic, wild-yeast fermented, with red fruit, herbs and gentle tannins.'),
    og: 'bottle-plavac-mali', crumbs: [[ui[L].home, href(L, 'home')], [ui[L].nav.wines, href(L, 'wines')], ['Plavac Mali', href(L, 'wine-plavac-mali')]], body,
  };
}

// ─── OPOLO ROSÉ (lighter Mediterranean register) ─────────────────────────────
export function opolo(L) {
  const w = wines['opolo-rose'];
  const body = `
<section class="phero light" data-hero aria-labelledby="h1">
${media('summer', L, { eager: true, reveal: false, parallax: .12 })}
<div class="wrap">
${crumbs(L, [[ui[L].home, href(L, 'home')], [ui[L].nav.wines, href(L, 'wines')], ['Opolo Rosé']])}
<h1 id="h1" class="display lines">${lines('Opolo')}</h1>
<p class="lede mt-2 rv d2">${pick(w.tagline, L)}</p>
</div></section>
<main id="main" class="opolo">
<section class="sec sun-band"><div class="wrap grid place-split">
<div class="fig"><div class="pcard lt" style="display:block"><span class="stage glow">${bottle('opolo-rose', L, { sizes: '(min-width:900px) 30vw, 60vw' })}</span></div></div>
<div class="txt">${eyebrow('', T(L, 'Boja', 'Colour'))}
<p class="statement mt-2 rv">${pick(w.colour.v, L)}.</p>
<div class="palette rv" aria-hidden="true"><i style="background:#f3e2d4"></i><i style="background:#eed0bd"></i><i style="background:#e7b49a"></i><i style="background:#d99c80"></i></div>
<p class="palette-cap"><span>${T(L, 'Blijedo', 'Pale')}</span><span>${T(L, 'Losos', 'Salmon')}</span></p>
<p class="body mt-3 rv">${pick(w.tasting.text, L)}</p>
</div></div></section>
<section class="sec"><div class="wrap">
${eyebrow('', T(L, 'Arome', 'Aromas'))}
<ul class="aroma-list mt-2 rv" style="max-width:none">${pick(w.aromas.young, L).map(a => `<li>${a}</li>`).join('')}</ul>
</div></section>
<section class="sec-s stone-2"><div class="wrap facts" style="border-top:0">
<div><p class="v">0,8<small>HA</small></p><p class="k">${T(L, 'Odabrane parcele za rosé', 'Plots selected for rosé')}</p></div>
<div><p class="v">${T(L, '2.500', '2,500')}</p><p class="k">${T(L, 'Boca', 'Bottles')}</p></div>
<div><p class="v">4–6</p><p class="k">${T(L, 'Mjeseci na finom talogu', 'Months on fine lees')}</p></div>
<div><p class="v"><em>${T(L, 'Divlji', 'Wild')}</em></p><p class="k">${T(L, 'Kvasci', 'Yeasts')}</p></div>
</div></section>
<section class="sec"><div class="wrap spec-2">
<div>${eyebrow('', T(L, 'Vinograd', 'Vineyard'))}<div class="mt-2">${specList(w.vineyard, L)}</div></div>
<div>${eyebrow('', T(L, 'Podrum', 'Cellar'))}<div class="mt-2">${specList(w.cellar, L)}</div></div>
</div></section>
<section class="sec-s sun-band"><div class="wrap grid" style="row-gap:2rem;align-items:end">
<div class="col-span c-1-7"><p class="caps-s muted">Opolo Rosé · ${w.volume}</p><h2 class="h2 mt-1">${T(L, 'Svjež i voćan — za ljetne trenutke.', 'Fresh and fruity — made for summer.')}</h2></div>
<div class="col-span c-8-13">${buyBox('opolo-rose', L)}</div>
</div></section>
${xpBanner(L, '')}
</main>`;
  return {
    key: 'wine-opolo-rose', hero: true,
    title: T(L, 'Opolo Rosé — organski rosé od Plavca Malog | Vicelić', 'Opolo Rosé — Organic Plavac Mali Rosé from Pelješac | Vicelić'),
    desc: T(L, 'Opolo rosé: blijedo lososove boje, šumske jagode, latice ruže, citrusi. Plavac Mali s Pelješca, divlji kvasci, 2.500 boca.', 'Opolo rosé: pale salmon, wild strawberry, rose petal and citrus peel. Plavac Mali from Pelješac, wild yeasts, 2,500 bottles.'),
    og: 'summer', crumbs: [[ui[L].home, href(L, 'home')], [ui[L].nav.wines, href(L, 'wines')], ['Opolo Rosé', href(L, 'wine-opolo-rose')]], body,
  };
}

// ─── OUR STORY ───────────────────────────────────────────────────────────────
export function story(L) {
  const sec = (n, h, p, extra = '', cls = '', verify = false) => `<section class="sec-s ${cls}"><div class="wrap grid" style="row-gap:2rem">
<div class="col-span c-1-5">${eyebrow(n, '')}<h2 class="h2 mt-1 rv">${h}</h2></div>
<div class="col-span c-6-13 body rv"${vflag(verify)}>${p}${extra}</div></div></section>`;
  const body = `
<section class="phero" data-hero aria-labelledby="h1">
${media('family', L, { eager: true, reveal: false, parallax: .14 })}
<div class="wrap on-image">
${crumbs(L, [[ui[L].home, href(L, 'home')], [T(L, 'Naša priča', 'Our story')]])}
<p class="caps">${T(L, 'Naša priča', 'Our story')}</p>
<h1 id="h1" class="display mt-2 lines">${lines(T(L, 'Ukorijenjeni|u Dingaču.', 'Rooted|in Dingač.'))}</h1>
</div></section>
<main id="main">
<section class="sec"><div class="wrap grid"><p class="statement c-2-12 col-span balance lines">${lines(T(L, 'Ne jurimo za količinom.|Jurimo za mjestom —|i za onim što ono|daje u čaši.', 'We do not chase volume.|We follow the place —|and what it gives|to the glass.'))}</p></div></section>
${sec('01', T(L, 'Obitelj', 'Family'),
    `<p>${T(L, 'Vicelić je obiteljska vinarija s Pelješca. Vlasnik je obitelj Vicelić, a vinar Mateo Vicelić.', 'Vicelić is a family winery on Pelješac, owned by the Vicelić family, with Mateo Vicelić as winemaker.')}</p>`,
    `<p class="mt-1" data-verify>${T(L, 'Godine 1935. Mateov pradjed proizvodio je ovdje Dingač, a vino se izvozilo sve do Praga. Drugi svjetski rat prekinuo je proizvodnju; obitelj je tu baštinu obnovila ponovnom sadnjom povijesnih vinograda na Dingaču.', 'In 1935 Mateo’s great-grandfather was making Dingač here, and the wine travelled as far as Prague. The Second World War brought production to a halt; the family revived that heritage by replanting the historic vineyards of Dingač.')}</p>`)}
<div class="wrap">${media('vines', L, { ratio: '21x9', sizes: '100vw' })}</div>
${sec('02', T(L, 'Zemlja', 'Land'),
    `<p>${T(L, 'Naši vinogradi leže na strmim, suncu izloženim obroncima Dingača na Pelješcu — kamen, sunce i more.', 'Our vineyards lie on the steep, sun-exposed slopes of Dingač on Pelješac — stone, sun and sea.')}</p>`,
    `<p class="mt-1" data-verify>${T(L, 'Obrađujemo oko 3,5 hektara vinograda.', 'We farm around 3.5 hectares of vines.')}</p>`)}
${sec('03', 'Plavac Mali',
    `<p>${T(L, 'Naša su vina napravljena isključivo od Plavca Malog, autohtone sorte ove obale. Jedna sorta, tri izraza: Dingač, Plavac Mali i rosé Opolo.', 'Our wines are made exclusively from Plavac Mali, the indigenous grape of this coast. One grape, three expressions: Dingač, Plavac Mali and the rosé, Opolo.')}</p>`, '', 'paper')}
<div class="wrap grid mt-4" style="row-gap:1rem;align-items:end"><div class="col-span c-1-7">${media('grapes', L, { ratio: '4x5', sizes: '(min-width:900px) 50vw, 100vw' })}</div><div class="col-span c-8-13">${media('harvest', L, { ratio: '3x4', sizes: '(min-width:900px) 40vw, 100vw' })}</div></div>
${sec('04', T(L, 'Organski uzgoj', 'Organic viticulture'),
    `<p>${T(L, 'Bez pesticida, herbicida i umjetnih gnojiva. Naša su vina certificirano organska.', 'No pesticides, no herbicides, no artificial fertilizers. Our wines are certified organic.')}</p>`,
    `<p class="mt-1" data-verify>${T(L, 'Vinogradi su certificirani od 2017.', 'The vineyards have been certified since 2017.')}</p>`)}
${sec('05', T(L, 'Minimalna intervencija', 'Minimal intervention'),
    `<p>${T(L, 'Fermentacija se odvija spontano, isključivo na divljim (autohtonim) kvascima, bez dodanih enzima i umjetnih aditiva — kako bi se karakter Dingača i svakog godišta mogao u potpunosti izraziti.', 'Fermentation happens spontaneously, on wild (indigenous) yeasts alone, with no added enzymes or artificial additives — so that the character of Dingač and of each vintage can express itself fully.')}</p>`)}
${sec('06', T(L, 'Mala proizvodnja', 'Small production'),
    `<p>${T(L, 'Butik vinarija znači male parcele i ograničena punjenja. Naš rosé, Opolo, puni se u 2.500 boca.', 'Boutique means small parcels and limited bottlings. Our rosé, Opolo, runs to 2,500 bottles.')}</p>`)}
<section class="sec dark"><div class="wrap grid" style="row-gap:3rem;align-items:center">
<blockquote class="quote col-span c-1-7 rv">${T(L, 'Neka se karakter Dingača i svakog godišta u potpunosti izrazi.', 'Let the character of Dingač, and of each vintage, express itself fully.')}</blockquote>
<div class="col-span c-8-13">${media('cellar', L, { ratio: '4x5', sizes: '(min-width:900px) 40vw, 100vw' })}</div>
</div></section>
${xpBanner(L, '')}
</main>`;
  return {
    key: 'story', hero: true,
    title: T(L, 'Naša priča — obiteljska vinarija na Dingaču | Vicelić', 'Our Story — A Family Winery in Dingač, Pelješac | Vicelić'),
    desc: T(L, 'Obitelj Vicelić i vinar Mateo Vicelić: organski Plavac Mali s Dingača, spontana fermentacija, mala proizvodnja.', 'The Vicelić family and winemaker Mateo Vicelić: organic Plavac Mali from Dingač, wild-yeast fermentation and small production on Pelješac.'),
    og: 'family', crumbs: [[ui[L].home, href(L, 'home')], [T(L, 'Naša priča', 'Our story'), href(L, 'story')]], body,
  };
}

// ─── EXPERIENCE ──────────────────────────────────────────────────────────────
export function experience(L) {
  const detail = (k, v) => `<div data-verify><p class="k">${k}</p><p class="v ${v ? '' : 'tbc'}">${v || ui[L].tbc}</p></div>`;
  const f = (name, label, input) => `<div class="field"><label for="f-${name}">${label}</label>${input.replace('<input', `<input id="f-${name}" name="${name}" data-label="${esc(label)}"`).replace('<select', `<select id="f-${name}" name="${name}" data-label="${esc(label)}"`).replace('<textarea', `<textarea id="f-${name}" name="${name}" data-label="${esc(label)}"`)}</div>`;
  const body = `
<section class="phero" data-hero aria-labelledby="h1">
${media('tasting', L, { eager: true, reveal: false, parallax: .14 })}
<div class="wrap on-image">
${crumbs(L, [[ui[L].home, href(L, 'home')], [ui[L].nav.experience]])}
<p class="caps">${T(L, 'Privatna degustacija', 'Private wine experience')}</p>
<h1 id="h1" class="display mt-2 lines">${lines(T(L, 'Na Dingaču,|<em>s nama.</em>', 'At Dingač,|<em>with us.</em>'))}</h1>
<div class="actions mt-3 rv d2"><a class="btn btn-light" href="#rezervacija">${ui[L].reserve} ${arrow}</a><a class="btn btn-ghost" href="${waLink(L, xpMsg(L))}" rel="noopener">${icons.wa.replace('<svg', '<svg width="16" height="16"')} WhatsApp</a></div>
</div></section>
<main id="main">
<section class="sec"><div class="wrap grid" style="row-gap:3rem">
<p class="statement col-span c-1-7 balance lines" data-verify>${lines(T(L, 'Vino, vinograd|i more — za jednim|stolom.', 'Wine, vineyard|and sea — at a|single table.'))}</p>
<div class="col-span c-8-13 body rv" data-verify><p>${T(L,
    'Privatna, vođena degustacija u vinogradima Dingača. Kušate naša vina uz pogled na more, a mi vam pričamo o obiteljskoj povijesti i o načelima po kojima radimo — organski uzgoj, divlji kvasci, minimalna intervencija.',
    'A private, guided tasting in the vineyards of Dingač. You taste our wines looking out over the sea while we tell you the family’s story and the principles we work by — organic farming, wild yeasts, minimal intervention.')}</p></div>
</div></section>
<section class="strip-wrap"><div class="strip">
${media('table', L, { ratio: '4x5', sizes: '(min-width:900px) 40vw, 78vw' })}
${media('grapes', L, { ratio: '3x4', sizes: '(min-width:900px) 25vw, 78vw' })}
${media('slope', L, { ratio: '1', sizes: '(min-width:900px) 33vw, 78vw' })}
</div></section>
<section class="sec"><div class="wrap">
${eyebrow('', T(L, 'Što vas očekuje', 'What to expect'))}
<ol class="steps mt-2">
<li class="rv" data-verify><span class="n">i</span><h3>${T(L, 'Vinograd', 'The vineyard')}</h3><p>${T(L, 'Dočekujemo vas među trsovima Dingača, iznad mora.', 'We welcome you among the vines of Dingač, above the sea.')}</p></li>
<li class="rv" data-verify><span class="n">ii</span><h3>${T(L, 'Priča', 'The story')}</h3><p>${T(L, 'Obiteljska povijest i ideja koja stoji iza naših vina.', 'The family’s history and the thinking behind our wines.')}</p></li>
<li class="rv" data-verify><span class="n">iii</span><h3>${T(L, 'Vina', 'The wines')}</h3><p>${T(L, 'Kušanje naših vina — od Opola do Dingača.', 'A tasting of our wines — from Opolo to Dingač.')}</p></li>
</ol></div></section>
<section class="sec-s dark"><div class="wrap">
<div class="details">
${detail(T(L, 'Trajanje', 'Duration'), null)}${detail(T(L, 'Vina', 'Wines'), null)}${detail(T(L, 'Grupa', 'Group size'), null)}${detail(T(L, 'Cijena', 'Price'), null)}
</div>
<p class="note mt-2">${T(L, 'Za detalje i dostupnost javite nam se — odgovaramo osobno.', 'For details and availability, get in touch — we reply personally.')}</p>
</div></section>
<section class="sec paper"><div class="wrap grid" style="row-gap:3rem">
<div class="col-span c-1-6">${eyebrow('', T(L, 'Dolazite iz', 'Coming from'))}
<ul class="origins mt-2 rv"><li>Dubrovnik</li><li>Ston</li><li>Orebić</li><li>Korčula</li><li>${T(L, 'Pelješac', 'Pelješac')}</li></ul>
<p class="body mt-2 rv">${T(L, 'Vinarija je na adresi ', 'The winery is at ')}${site.address.street}, ${site.address.postalCode} ${site.address.locality}, Pelješac.</p></div>
<div class="col-span c-7-13">${mapBlock(L)}</div>
</div></section>
<section class="sec" id="rezervacija" aria-labelledby="res-h"><div class="wrap grid" style="row-gap:3rem">
<div class="col-span c-1-5">${eyebrow('', T(L, 'Rezervacija', 'Reservation'))}<h2 id="res-h" class="h1 mt-2">${T(L, 'Rezervirajte svoj termin.', 'Reserve your tasting.')}</h2>
<p class="body mt-2">${T(L, 'Pošaljite upit — potvrdit ćemo termin osobno. Najbrže putem WhatsAppa.', 'Send us a request and we will confirm personally. WhatsApp is quickest.')}</p>
<div class="contact-list mt-3"><div><p class="k">${T(L, 'Telefon', 'Phone')}</p><a class="v" href="tel:${site.phoneHref}">${site.phone}</a></div><div><p class="k">${ui[L].email}</p><a class="v" href="mailto:${site.email}">${site.email}</a></div></div></div>
<form class="form col-span c-6-13" data-inquiry data-subject="${esc(xpSubject(L))}" data-intro="${esc(T(L, 'Upit za privatnu degustaciju:', 'Private tasting request:'))}" novalidate>
<div class="two">${f('name', T(L, 'Ime i prezime', 'Name'), '<input type="text" autocomplete="name" required>')}${f('email', ui[L].email, '<input type="email" autocomplete="email" required>')}</div>
<div class="two">${f('date', T(L, 'Željeni datum', 'Preferred date'), '<input type="date">')}${f('guests', T(L, 'Broj osoba', 'Guests'), '<input type="number" min="1" max="30" inputmode="numeric">')}</div>
<div class="two">${f('phone', T(L, 'Telefon', 'Phone'), '<input type="tel" autocomplete="tel">')}${f('lang', T(L, 'Jezik', 'Language'), `<select><option>${T(L, 'Hrvatski', 'English')}</option><option>${T(L, 'Engleski', 'Croatian')}</option></select>`)}</div>
${f('msg', T(L, 'Poruka', 'Message'), `<textarea placeholder="${T(L, 'Odakle dolazite, posebne želje…', 'Where you are travelling from, any requests…')}"></textarea>`)}
<div class="actions"><button class="btn" type="submit" value="email">${T(L, 'Pošalji upit', 'Send request')} ${arrow}</button><button class="btn btn-ghost" type="submit" value="wa">${icons.wa.replace('<svg', '<svg width="16" height="16"')} ${T(L, 'Pošalji putem WhatsAppa', 'Send via WhatsApp')}</button></div>
<p class="form-note">${T(L, 'Obrazac otvara vašu aplikaciju za e-poštu ili WhatsApp s ispunjenom porukom.', 'The form opens your email app or WhatsApp with the message ready to send.')}</p>
</form></div></section>
${finale(L)}
</main>`;
  return {
    key: 'experience', hero: true, sticky: true, stickyXp: true,
    title: T(L, 'Degustacija vina na Dingaču, Pelješac — privatno | Vicelić', 'Private Wine Tasting at Dingač, Pelješac | Vicelić Winery'),
    desc: T(L, 'Privatna, vođena degustacija vina u vinogradima Dingača s pogledom na more. Blizu Dubrovnika, Stona, Orebića i Korčule. Rezervirajte termin.', 'A private, guided wine tasting in the vineyards of Dingač overlooking the sea — near Dubrovnik, Ston, Orebić and Korčula. Reserve your visit.'),
    og: 'tasting', crumbs: [[ui[L].home, href(L, 'home')], [ui[L].nav.experience, href(L, 'experience')]], body,
  };
}

// ─── SHOP ────────────────────────────────────────────────────────────────────
export function shop(L) {
  const body = `<main id="main">
<section class="pband"><div class="wrap grid" style="align-items:end;row-gap:2rem">
<div class="col-span c-1-7">${crumbs(L, [[ui[L].home, href(L, 'home')], [ui[L].nav.shop]])}<h1 class="h1 lines">${lines(T(L, 'Izravno|s imanja.', 'Direct from|the estate.'))}</h1></div>
<p class="col-span c-8-13 body rv">${T(L, 'Tri vina od Plavca Malog, organski uzgojena na Pelješcu i punjena u malim količinama. Svaku narudžbu potvrđujemo osobno.', 'Three wines of Plavac Mali, organically farmed on Pelješac and bottled in small numbers. We confirm every order personally.')}</p>
</div></section>
<section class="sec-s" style="padding-top:0"><div class="wrap shop-grid">
${wineOrder.map((id, i) => {
    const w = wines[id];
    return `<article class="pcard p${i + 1} ${id === 'dingac' ? 'dk' : id === 'opolo-rose' ? 'lt' : ''} rv">
<a class="stage" href="${productHref(L, id)}" aria-label="${esc(nameOf(w))}">${bottle(id, L, { sizes: '(min-width:1100px) 30vw, (min-width:760px) 45vw, 80vw', eager: i === 0 })}</a>
<div class="info"><h2>${nameOf(w)}</h2>${price(w, L)}<p class="o">${pick(w.origin, L)} · ${w.grape}${w.vintage ? ' · ' + w.vintage : ''} · ${w.volume}</p><p class="d">${pick(w.short, L)}</p></div>
<div class="actions"><button type="button" class="btn" data-add-one="${id}">${ui[L].addToCart}</button><a class="link" href="${productHref(L, id)}">${T(L, 'Detalji', 'View details')} ${arrow}</a></div>
</article>`;
  }).join('')}
</div></section>
<section class="sec-s stone-2"><div class="wrap grid" style="row-gap:2rem">
<div class="col-span c-1-5"><p class="caps">${T(L, 'Kupnja', 'Buying')}</p></div>
<div class="col-span c-6-13 body"><p>${ui[L].cartNote}</p><p><a class="link" href="${href(L, 'terms')}">${ui[L].footer.terms} ${arrow}</a></p></div>
</div></section>
</main>`;
  return {
    key: 'shop',
    title: T(L, 'Trgovina — kupite vino Dingač i Plavac Mali | Vicelić', 'Shop — Buy Dingač & Plavac Mali Wine | Vicelić Winery'),
    desc: T(L, 'Kupite organska vina izravno od vinarije Vicelić: Dingač, Plavac Mali i Opolo rosé s Pelješca.', 'Buy organic Croatian wine direct from Vicelić: Dingač, Plavac Mali and Opolo rosé from Pelješac.'),
    og: 'bottle-dingac', crumbs: [[ui[L].home, href(L, 'home')], [ui[L].nav.shop, href(L, 'shop')]], body,
  };
}

// ─── PRODUCT ─────────────────────────────────────────────────────────────────
export function product(id) {
  return L => {
    const w = wines[id];
    const cls = id === 'dingac' ? 'dk' : id === 'opolo-rose' ? 'lt' : '';
    const extra = [
      w.serving.v && { k: { hr: 'Posluživanje', en: 'Serving' }, v: w.serving.v, verify: w.serving.verify },
      w.pairing.v && { k: { hr: 'Uz jelo', en: 'Food pairing' }, v: w.pairing.v, verify: w.pairing.verify },
      w.cellaring.v && { k: { hr: 'Arhiviranje', en: 'Ageing potential' }, v: w.cellaring.v, verify: w.cellaring.verify },
    ].filter(Boolean);
    const body = `<main id="main">
<section class="product ${cls}" style="padding-top:calc(var(--nav-h) + 1.5rem)"><div class="wrap grid">
<div class="pstage">${bottle(id, L, { eager: true, sizes: '(min-width:1000px) 40vw, 80vw' })}</div>
<div class="pinfo">
${crumbs(L, [[ui[L].home, href(L, 'home')], [ui[L].nav.shop, href(L, 'shop')], [nameOf(w)]])}
<p class="caps muted">${pick(w.origin, L)} · ${w.grape}</p>
<h1 class="h1 mt-1">${nameOf(w)}</h1>
<p class="lede mt-2">${pick(w.tagline, L)}</p>
${buyBox(id, L)}
<div class="mt-4"><p class="caps-s muted">${T(L, 'Bilješke kušanja', 'Tasting notes')}</p><p class="body mt-1"${vflag(w.tasting.verify)}>${pick(w.tasting.text, L)}</p></div>
${pick(w.aromas.young, L).length ? `<ul class="aroma-list mt-2"${vflag(w.aromas.verify)} style="font-size:.7em">${pick(w.aromas.young, L).concat(pick(w.aromas.aged, L)).map(a => `<li style="font-size:clamp(1.3rem,2vw,1.8rem)">${a}</li>`).join('')}</ul>` : ''}
<div class="mt-4"><p class="caps-s muted mb-2">${T(L, 'Vinograd', 'Vineyard')}</p>${specList(w.vineyard, L)}</div>
<div class="mt-3"><p class="caps-s muted mb-2">${T(L, 'Podrum', 'Cellar')}</p>${specList(w.cellar, L)}</div>
${extra.length ? `<div class="mt-3"><p class="caps-s muted mb-2">${T(L, 'Uživanje', 'Enjoying')}</p>${specList(extra, L)}</div>` : ''}
<p class="mt-3"><a class="link" href="${wineHref(L, id)}">${T(L, 'Priča o vinu', 'The story of this wine')} ${arrow}</a></p>
</div></div></section>
<section class="sec-s"><div class="wrap"><p class="caps mb-3">${T(L, 'Također iz naše kolekcije', 'Also from the estate')}</p>
<ul class="rowlist">${wineOrder.filter(x => x !== id).map(x => { const o = wines[x]; return `<li><a class="row" href="${productHref(L, x)}"><span class="th">${bottle(x, L, { decorative: true, sizes: '120px' })}</span><span><span class="nm">${nameOf(o)}</span><span class="sub">${pick(o.origin, L)}</span></span><span class="ds">${pick(o.short, L)}</span><span class="pr">${price(o, L)}</span></a></li>`; }).join('')}</ul></div></section>
</main>`;
    return {
      key: `product-${id}`, product: id,
      title: T(L, `${nameOf(w)} — kupite online | Vinarija Vicelić`, `${nameOf(w)} — Buy Online | Vicelić Winery, Pelješac`),
      desc: `${pick(w.short, L)} ${T(L, 'Organski Plavac Mali, Pelješac.', 'Organic Plavac Mali from Pelješac, Croatia.')}`,
      og: `bottle-${id}`, crumbs: [[ui[L].home, href(L, 'home')], [ui[L].nav.shop, href(L, 'shop')], [nameOf(w), productHref(L, id)]], body,
    };
  };
}

// ─── CONTACT ─────────────────────────────────────────────────────────────────
export function contact(L) {
  const body = `<main id="main">
<section class="pband"><div class="wrap">${crumbs(L, [[ui[L].home, href(L, 'home')], [ui[L].nav.contact]])}<h1 class="display lines">${lines(T(L, 'Kontakt', 'Contact'))}</h1></div></section>
<section class="sec-s" style="padding-top:0"><div class="wrap grid" style="row-gap:3rem">
<div class="col-span c-1-6"><div class="contact-list">
<div><p class="k">${T(L, 'Adresa', 'Address')}</p><address class="v" style="font-style:normal">${site.address.street}<br>${site.address.postalCode} ${site.address.locality}<br>Pelješac, ${T(L, 'Hrvatska', 'Croatia')}</address></div>
<div><p class="k">${T(L, 'Telefon', 'Phone')}</p><a class="v" href="tel:${site.phoneHref}">${site.phone}</a></div>
<div><p class="k">${ui[L].email}</p><a class="v" href="mailto:${site.email}">${site.email}</a></div>
<div><p class="k">WhatsApp</p><a class="v" href="https://wa.me/${site.whatsapp}" rel="noopener">${T(L, 'Pošaljite poruku', 'Send a message')} →</a></div>
<div><p class="k">${T(L, 'Vinar', 'Winemaker')}</p><p class="v">${site.winemaker}</p></div>
</div>
<p class="note mt-3">${site.legalName} · OIB ${site.oib}</p></div>
<div class="col-span c-7-13">${mapBlock(L)}
<p class="mt-2"><a class="link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.address.street}, ${site.address.postalCode} ${site.address.locality}, Croatia`)}" rel="noopener">${T(L, 'Otvori u Google kartama', 'Open in Google Maps')} ${arrow}</a></p></div>
</div></section>
<section class="sec stone-2"><div class="wrap grid" style="row-gap:3rem">
<div class="col-span c-1-5"><h2 class="h2">${T(L, 'Pišite nam.', 'Write to us.')}</h2></div>
<form class="form col-span c-6-13" data-inquiry data-subject="${esc(T(L, 'Upit — vinarija Vicelić', 'Inquiry — Vicelić Winery'))}" data-intro="${esc(T(L, 'Upit s web-stranice:', 'Website inquiry:'))}" novalidate>
<div class="two"><div class="field"><label for="c-name">${T(L, 'Ime i prezime', 'Name')}</label><input id="c-name" name="name" data-label="${T(L, 'Ime', 'Name')}" autocomplete="name" required></div><div class="field"><label for="c-email">${ui[L].email}</label><input id="c-email" name="email" type="email" data-label="Email" autocomplete="email" required></div></div>
<div class="field"><label for="c-msg">${T(L, 'Poruka', 'Message')}</label><textarea id="c-msg" name="msg" data-label="${T(L, 'Poruka', 'Message')}" required></textarea></div>
<div class="actions"><button class="btn" type="submit" value="email">${T(L, 'Pošalji', 'Send')} ${arrow}</button><button class="btn btn-ghost" type="submit" value="wa">WhatsApp</button></div>
</form></div></section>
</main>`;
  return {
    key: 'contact',
    title: T(L, 'Kontakt — vinarija Vicelić, Kuna, Pelješac', 'Contact — Vicelić Winery, Kuna, Pelješac'),
    desc: T(L, `Vinarija Vicelić, ${site.address.street}, ${site.address.postalCode} Kuna, Pelješac. Tel. ${site.phone}, ${site.email}.`, `Vicelić Winery, ${site.address.street}, ${site.address.postalCode} Kuna, Pelješac, Croatia. Phone ${site.phone}, ${site.email}.`),
    crumbs: [[ui[L].home, href(L, 'home')], [ui[L].nav.contact, href(L, 'contact')]], body,
  };
}

// ─── LEGAL (structure; wording must be copied from the current site) ─────────
export function legal(kind) {
  return L => {
    const isTerms = kind === 'terms';
    const title = isTerms ? ui[L].footer.terms : ui[L].footer.privacy;
    const heads = isTerms
      ? T(L, ['Prodavatelj', 'Narudžba', 'Cijene i plaćanje', 'Dostava', 'Pravo na jednostrani raskid', 'Prodaja alkohola'], ['Seller', 'Orders', 'Prices & payment', 'Delivery', 'Right of withdrawal', 'Sale of alcohol'])
      : T(L, ['Voditelj obrade', 'Koje podatke prikupljamo', 'Svrha obrade', 'Kolačići i lokalna pohrana', 'Vaša prava'], ['Data controller', 'What we collect', 'Why we process it', 'Cookies & local storage', 'Your rights']);
    const body = `<main id="main">
<section class="pband"><div class="wrap">${crumbs(L, [[ui[L].home, href(L, 'home')], [title]])}<h1 class="h1">${title}</h1></div></section>
<section class="sec-s" style="padding-top:0"><div class="wrap"><div class="prose">
<h2>${heads[0]}</h2>
<p>${site.legalName}<br>${site.address.street}, ${site.address.postalCode} ${site.address.locality}, ${T(L, 'Hrvatska', 'Croatia')}<br>OIB: ${site.oib}<br>${site.phone} · <a href="mailto:${site.email}">${site.email}</a></p>
${heads.slice(1).map(h => `<h2>${h}</h2><p data-verify>${T(L, 'Tekst ovog odjeljka prenosi se s postojeće stranice vicelic.hr.', 'The wording of this section is to be carried over from the current vicelic.hr page.')}</p>`).join('')}
${!isTerms ? `<p>${T(L, 'Ova stranica ne koristi kolačiće za praćenje. Sadržaj košarice sprema se samo u vašem pregledniku (localStorage).', 'This site sets no tracking cookies. Your cart is stored only in your own browser (localStorage).')}</p>` : ''}
</div></div></section></main>`;
    return {
      key: kind, noindex: false,
      title: `${title} | Vicelić`, desc: `${title} — Boutique Winery Vicelić.`,
      crumbs: [[ui[L].home, href(L, 'home')], [title, href(L, kind)]], body,
    };
  };
}

export function notFound(L) {
  return {
    key: '404', noindex: true,
    title: T(L, 'Stranica nije pronađena | Vicelić', 'Page not found | Vicelić'), desc: '',
    body: `<main id="main"><section class="pband" style="min-height:80vh"><div class="wrap"><p class="caps muted">404</p><h1 class="display mt-2">${T(L, 'Izgubljeni<br>u vinogradu.', 'Lost among<br>the vines.')}</h1><div class="actions mt-3"><a class="btn" href="${href(L, 'home')}">${ui[L].home} ${arrow}</a><a class="link" href="${href(L, 'shop')}">${ui[L].nav.shop}</a></div></div></section></main>`,
  };
}

export const pages = [home, story, dingac, winesPage, plavac, opolo, experience, shop, product('dingac'), product('plavac-mali'), product('opolo-rose'), contact, legal('terms'), legal('privacy')];
