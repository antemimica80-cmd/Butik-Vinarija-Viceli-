/* Vicelić — minimal progressive enhancement. No dependencies. */
(() => {
  const d = document, root = d.documentElement, body = d.body;
  const cfg = JSON.parse(d.getElementById('cfg').textContent);
  const L = cfg.i18n;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Audit mode */
  try {
    if (/[?&]audit\b/.test(location.search)) {
      root.classList.add('audit');
      const n = d.querySelectorAll('[data-verify]').length;
      const b = d.createElement('div'); b.className = 'audit-bar'; b.textContent = `Audit · ${n} unverified`; body.append(b);
    }
  } catch {}

  /* Navigation: transparent over hero, solid after; hides on fast scroll down */
  const nav = d.querySelector('.nav');
  const heroEl = d.querySelector('[data-hero]');
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    const over = heroEl ? y < heroEl.offsetHeight - nav.offsetHeight - 10 : false;
    nav.classList.toggle('over', over);
    nav.classList.toggle('hide', !over && y > lastY + 4 && y > 600 && !body.classList.contains('menu-open'));
    if (y < lastY - 4) nav.classList.remove('hide');
    lastY = y;
    const s = d.querySelector('.sticky-cta');
    if (s) s.classList.toggle('on', y > innerHeight * .9 && !nearEnd());
  };
  const nearEnd = () => innerHeight + scrollY > d.body.scrollHeight - 700;
  addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
  onScroll();

  /* Mobile menu */
  const burger = d.querySelector('.burger');
  const menu = d.getElementById('menu');
  const setMenu = open => {
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    menu.inert = !open;
    if (open) menu.querySelector('a')?.focus({ preventScroll: true });
  };
  if (burger) {
    menu.inert = true;
    burger.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
    d.addEventListener('keydown', e => { if (e.key === 'Escape' && body.classList.contains('menu-open')) { setMenu(false); burger.focus(); } });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  }

  /* Reveal on view */
  const els = d.querySelectorAll('.rv,.reveal-img,.lines');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    els.forEach(el => io.observe(el));
  } else els.forEach(el => el.classList.add('in'));

  /* Gentle parallax on full-bleed images */
  const px = [...d.querySelectorAll('[data-parallax]')];
  if (px.length && !reduce) {
    let ticking = false;
    const run = () => {
      const h = innerHeight;
      for (const el of px) {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > h) continue;
        const k = parseFloat(el.dataset.parallax) || .12;
        const off = (r.top + r.height / 2 - h / 2) * -k;
        const t = el.querySelector('picture,.ph');
        if (t) t.style.transform = `translate3d(0,${off.toFixed(1)}px,0) scale(1.14)`;
      }
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  /* ─── Cart ─────────────────────────────────────────────────────────────── */
  const KEY = 'vicelic-cart-v1';
  const products = cfg.products;
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const write = c => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {} };
  let cart = read();
  const fmt = n => new Intl.NumberFormat(cfg.locale, { style: 'currency', currency: 'EUR' }).format(n);
  const drawer = d.getElementById('cart');
  const count = () => Object.values(cart).reduce((a, b) => a + b, 0);

  function render() {
    d.querySelectorAll('.cart-count').forEach(el => { const n = count(); el.textContent = n; el.classList.toggle('on', n > 0); });
    if (!drawer) return;
    const list = drawer.querySelector('.items');
    const ids = Object.keys(cart).filter(id => products[id]);
    if (!ids.length) {
      list.innerHTML = `<div class="empty"><p>${L.cartEmpty}</p><a class="btn" href="${cfg.shopUrl}">${L.toShop}</a></div>`;
      drawer.querySelector('footer').hidden = true;
      return;
    }
    drawer.querySelector('footer').hidden = false;
    let total = 0, priced = true;
    list.innerHTML = ids.map(id => {
      const p = products[id], q = cart[id];
      if (p.price == null) priced = false; else total += p.price * q;
      return `<div class="citem" data-id="${id}">
        <div class="th">${p.thumb}</div>
        <div><div class="nm">${p.name}</div><div class="sub">${p.origin}${p.price != null ? ' · ' + fmt(p.price) : ''}</div>
          <div class="qty" role="group" aria-label="${L.qty}"><button type="button" data-q="-1" aria-label="−">−</button><input type="number" inputmode="numeric" min="1" max="99" value="${q}" aria-label="${L.qty}"><button type="button" data-q="1" aria-label="+">+</button></div></div>
        <button type="button" class="rm">${L.remove}</button></div>`;
    }).join('');
    drawer.querySelector('.tot .price').textContent = priced ? fmt(total) : L.onRequest;
    drawer.querySelector('.tot .price').classList.toggle('na', !priced);
  }
  const setQty = (id, q) => { q = Math.max(0, Math.min(99, q | 0)); if (q) cart[id] = q; else delete cart[id]; write(cart); render(); };
  const openCart = () => { if (!drawer) return; drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); drawer.inert = false; drawer.querySelector('.close').focus(); };
  const closeCart = () => { if (!drawer) return; drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); drawer.inert = true; };
  if (drawer) {
    drawer.inert = true;
    drawer.addEventListener('click', e => {
      const it = e.target.closest('.citem');
      if (e.target.closest('.scrim,.close')) closeCart();
      else if (it && e.target.matches('[data-q]')) setQty(it.dataset.id, cart[it.dataset.id] + +e.target.dataset.q);
      else if (it && e.target.matches('.rm')) setQty(it.dataset.id, 0);
    });
    drawer.addEventListener('change', e => { const it = e.target.closest('.citem'); if (it) setQty(it.dataset.id, +e.target.value); });
    d.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('open')) closeCart(); });
    drawer.querySelector('[data-checkout=email]')?.addEventListener('click', () => location.href = orderLink('email'));
    drawer.querySelector('[data-checkout=whatsapp]')?.addEventListener('click', () => location.href = orderLink('wa'));
  }
  d.querySelectorAll('.cart-btn').forEach(b => b.addEventListener('click', e => { e.preventDefault(); openCart(); }));

  function orderText() {
    const lines = Object.entries(cart).filter(([id]) => products[id]).map(([id, q]) => `• ${products[id].name} ×${q}`);
    return `${L.orderIntro}\n\n${lines.join('\n')}\n\n${L.orderOutro}`;
  }
  function orderLink(kind) {
    const txt = orderText();
    return kind === 'wa' ? `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(txt)}`
      : `mailto:${cfg.email}?subject=${encodeURIComponent(L.orderSubject)}&body=${encodeURIComponent(txt)}`;
  }

  /* Product quantity + add to cart */
  d.querySelectorAll('[data-buy]').forEach(box => {
    const id = box.dataset.buy, input = box.querySelector('.qty input');
    box.querySelectorAll('.qty [data-q]').forEach(b => b.addEventListener('click', () => { input.value = Math.max(1, Math.min(99, (+input.value || 1) + +b.dataset.q)); }));
    box.querySelector('[data-add]')?.addEventListener('click', () => { setQty(id, (cart[id] || 0) + Math.max(1, +input.value || 1)); openCart(); });
  });
  d.querySelectorAll('[data-add-one]').forEach(b => b.addEventListener('click', () => { const id = b.dataset.addOne; setQty(id, (cart[id] || 0) + 1); openCart(); }));
  render();

  /* Reservation / inquiry forms → email or WhatsApp (no backend needed) */
  d.querySelectorAll('form[data-inquiry]').forEach(f => {
    f.addEventListener('submit', e => {
      e.preventDefault();
      if (!f.reportValidity()) return;
      const data = new FormData(f);
      const lines = [];
      for (const [k, v] of data) if (String(v).trim()) lines.push(`${f.querySelector(`[name="${k}"]`)?.dataset.label || k}: ${v}`);
      const txt = `${f.dataset.intro}\n\n${lines.join('\n')}`;
      const via = e.submitter?.value || 'email';
      location.href = via === 'wa'
        ? `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(txt)}`
        : `mailto:${cfg.email}?subject=${encodeURIComponent(f.dataset.subject)}&body=${encodeURIComponent(txt)}`;
    });
  });

  /* Date input minimum = today */
  d.querySelectorAll('input[type=date]').forEach(i => { i.min = new Date().toISOString().slice(0, 10); });
})();
