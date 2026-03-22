/* ============================================================
   BEYOND THE TRAIL MEDIA — SCRIPT.JS
   ============================================================ */

/* ── Navbar scroll ─────────────────────────────────────────── */
(function () {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── Active nav link ───────────────────────────────────────── */
(function () {
  const links = document.querySelectorAll('.navbar__links a, .mobile-menu__links a');
  const page = location.pathname.split('/').pop() || 'index.html';
  links.forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === page || (page === 'index.html' && href === 'index.html') || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

/* ── Mobile menu ───────────────────────────────────────────── */
(function () {
  const btn   = document.querySelector('.navbar__hamburger');
  const menu  = document.querySelector('.mobile-menu');
  const close = document.querySelector('.mobile-menu__close');
  if (!btn || !menu) return;

  const open  = () => { menu.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const shut  = () => { menu.classList.remove('open'); document.body.style.overflow = ''; };

  btn.addEventListener('click', open);
  close?.addEventListener('click', shut);
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', shut));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') shut(); });
})();

/* ── Entrance animations (IntersectionObserver) ────────────── */
(function () {
  const targets = [
    '.service-card',
    '.why-card',
    '.pkg-card',
    '.testimonial-card',
    '.blog-card',
    '.step',
    '.stat-badge',
  ];
  const els = document.querySelectorAll(targets.join(','));
  if (!els.length) return;

  // Apply initial hidden state via JS so content is visible without JS / in screenshots
  els.forEach(el => el.classList.add('will-animate'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const idx = [...els].indexOf(el);
      const delay = (idx % 4) * 0.08;
      el.style.transitionDelay = `${delay}s`;
      el.classList.add('visible');
      observer.unobserve(el);
    });
  }, { threshold: 0.08 });

  els.forEach(el => observer.observe(el));
})();

/* ── Smooth scroll for anchor links ────────────────────────── */
(function () {
  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 76;
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ── Contact form submission ────────────────────────────────── */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn     = form.querySelector('[type="submit"]');
    const status  = document.getElementById('form-status');
    const data    = Object.fromEntries(new FormData(form));
    const origTxt = btn.textContent;

    btn.disabled   = true;
    btn.textContent = 'Sending…';

    try {
      const webhookUrl = form.dataset.webhook || '';
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
      btn.textContent    = 'Message Sent!';
      btn.style.background = '#16a34a';
      if (status) { status.textContent = 'Thanks! Josh will be in touch within 24 hours.'; status.className = 'form-status success'; }
      form.reset();
      setTimeout(() => {
        btn.textContent    = origTxt;
        btn.style.background = '';
        btn.disabled       = false;
        if (status) { status.textContent = ''; status.className = 'form-status'; }
      }, 5000);
    } catch {
      btn.textContent = origTxt;
      btn.disabled    = false;
      if (status) { status.textContent = 'Something went wrong. Call or text Josh at 775-338-5537.'; status.className = 'form-status error'; }
    }
  });
})();
