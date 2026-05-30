// Opsio site - tiny vanilla JS

// ===================== SCROLL ANIMATIONS =====================
(function () {
  const SELECTORS = [
    '.section-eyebrow', '.section-title', '.section-lead',
    '.feature', '.value', '.step', '.industry', '.service-eyebrow',
    '.service-h', '.service-p', '.service-list', '.service-visual',
    '.cta-band > *', '.testimonial > *', '.faq-item', '.price-card',
    '.compare', '.subhero h1', '.subhero p', '.eyebrow', '.contact-form',
    '.contact-aside > *', '.hero-pill', '.hero-h1', '.hero-sub',
    '.hero-actions', '.hero-demo', '.trust-row', '.footer-eyebrow',
    '.footer-headline', '.footer-cta',
    '.pkg-step', '.feature-detail', '.voor-wie-list li', '.dashboard-item',
  ];

  function assignStagger(el, siblings) {
    const idx = siblings.indexOf(el);
    el.style.transitionDelay = (idx * 60) + 'ms';
  }

  function initReveal() {
    const all = document.querySelectorAll(SELECTORS.join(','));
    all.forEach(el => {
      el.classList.add('will-reveal');
      const parent = el.parentElement;
      if (parent) {
        const siblings = Array.from(parent.querySelectorAll(':scope > .will-reveal'));
        assignStagger(el, siblings);
      }
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    all.forEach(el => io.observe(el));
  }

  function initHeroEntrance() {
    const pill    = document.querySelector('.hero-pill');
    const h1      = document.querySelector('.hero-h1');
    const sub     = document.querySelector('.hero-sub');
    const actions = document.querySelector('.hero-actions');
    const demo    = document.querySelector('.hero-demo');
    [pill, h1, sub, actions, demo].forEach((el, i) => {
      if (!el) return;
      el.classList.add('will-reveal');
      el.style.transitionDelay = (i * 90) + 'ms';
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('revealed')));
    });
  }

  function initCounters() {
    const els = document.querySelectorAll('.stat-num, .cta-stat-card .num, .voor-wie-stat-num, .dashboard-item-num');
    els.forEach(el => {
      const raw = el.textContent.trim();
      const match = raw.match(/^([€+%]?)(\d+)([\s\S]*)$/);
      if (!match) return;
      const prefix = match[1] || '';
      const target = parseInt(match[2], 10);
      const suffix = match[3] || '';
      if (isNaN(target) || target < 2) return;
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          io.unobserve(el);
          const dur = 900;
          const start = performance.now();
          function tick(now) {
            const pct = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - pct, 3);
            const val = Math.round(ease * target);
            el.textContent = prefix + val + suffix;
            if (pct < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
      }, { threshold: 0.5 });
      io.observe(el);
    });
  }

  function initNavShadow() {
    const nav = document.querySelector('.nav-wrap');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  function initBtnRipple() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('.btn-primary, .btn-light');
      if (!btn) return;
      const r = document.createElement('span');
      r.className = 'btn-ripple';
      const rect = btn.getBoundingClientRect();
      r.style.cssText = `left:${e.clientX - rect.left}px;top:${e.clientY - rect.top}px`;
      btn.appendChild(r);
      setTimeout(() => r.remove(), 600);
    });
  }

  function initTypewriters() {
    const els = document.querySelectorAll('[data-typewriter]');
    if (!els.length) return;
    els.forEach(el => {
      const fullText = el.textContent;
      const extraDelay = parseInt(el.dataset.typewriterDelay || '0', 10);
      el.textContent = '';
      el.style.visibility = 'hidden';
      const visual = el.closest('.service-visual') || el;
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          io.unobserve(visual);
          setTimeout(() => {
            el.style.visibility = 'visible';
            let i = 0;
            function type() {
              if (i < fullText.length) {
                el.textContent = fullText.slice(0, ++i);
                el.classList.add('typing');
                setTimeout(type, 28 + (Math.random() * 12));
              } else {
                el.classList.remove('typing');
                el.classList.add('typed');
              }
            }
            type();
          }, 400 + extraDelay);
        });
      }, { threshold: 0.35 });
      io.observe(visual);
    });
  }

  function initScrollHint() {
    const hint = document.querySelector('.scroll-hint');
    if (!hint) return;
    const hide = () => { if (window.scrollY > 60) hint.classList.add('hidden'); };
    window.addEventListener('scroll', hide, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHeroEntrance();
    initReveal();
    initCounters();
    initNavShadow();
    initBtnRipple();
    initTypewriters();
    initScrollHint();
  });
})();

// Mobile nav toggle
document.addEventListener('click', (e) => {
  const toggle = e.target.closest('[data-nav-toggle]');
  if (toggle) {
    document.querySelector('.nav-menu')?.classList.toggle('open');
  } else if (!e.target.closest('.nav-menu')) {
    document.querySelector('.nav-menu')?.classList.remove('open');
  }
});

// Nav dropdown — click-toggle (alle schermformaten)
document.addEventListener('click', (e) => {
  const trigger = e.target.closest('.nav-dropdown-trigger');
  if (trigger) {
    e.preventDefault();
    const dropdown = trigger.closest('.nav-dropdown');
    const isOpen = dropdown.classList.contains('open');
    document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
    if (!isOpen) dropdown.classList.add('open');
    return;
  }
  if (!e.target.closest('.nav-dropdown')) {
    document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
  }
});

// Pricing toggle
function bindPricingToggle() {
  const toggle = document.querySelector('[data-toggle]');
  if (!toggle) return;
  toggle.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    toggle.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
    const period = btn.dataset.period;
    document.querySelectorAll('[data-price]').forEach(el => {
      const m = el.dataset.priceMonthly;
      const y = el.dataset.priceYearly;
      el.textContent = period === 'yearly' ? y : m;
    });
    document.querySelectorAll('[data-period-label]').forEach(el => {
      el.textContent = period === 'yearly' ? '/maand (jaarlijks)' : '/maand';
    });
  });
}
bindPricingToggle();

// Contact form
function bindContactForm() {
  const form = document.querySelector('[data-contact]');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const success = form.querySelector('.success-msg');
    success?.classList.add('show');
    form.querySelectorAll('input, textarea, select').forEach(i => { if (i.type !== 'submit') i.value = ''; });
    setTimeout(() => success?.classList.remove('show'), 5000);
  });
}
bindContactForm();

// Mock-call audio players
(function () {
  function initMockPlayers() {
    const btns = document.querySelectorAll('[data-mock-play]');
    if (!btns.length) return;
    btns.forEach(btn => {
      const visual  = btn.closest('.service-visual');
      const audio   = visual ? visual.querySelector('[data-mock-audio]') : null;
      if (!audio) return;
      const iconPlay  = btn.querySelector('.icon-play');
      const iconPause = btn.querySelector('.icon-pause');
      const label     = btn.querySelector('.mock-play-label');
      const mockCall  = visual.querySelector('.mock-call');
      const progressBar = document.createElement('div');
      progressBar.className = 'mock-audio-progress';
      const progressFill = document.createElement('div');
      progressFill.className = 'mock-audio-progress-fill';
      progressBar.appendChild(progressFill);
      mockCall.after(progressBar);
      audio.addEventListener('error', () => { btn.classList.add('no-audio'); });
      audio.addEventListener('timeupdate', () => {
        if (!audio.duration) return;
        progressFill.style.width = (audio.currentTime / audio.duration * 100) + '%';
      });
      audio.addEventListener('ended', () => {
        btn.classList.remove('playing');
        iconPlay.style.display = '';
        iconPause.style.display = 'none';
        label.textContent = 'Beluister';
        progressFill.style.width = '0%';
        progressBar.classList.remove('visible');
        audio.currentTime = 0;
      });
      btn.addEventListener('click', () => {
        if (btn.classList.contains('no-audio')) return;
        document.querySelectorAll('[data-mock-audio]').forEach(a => {
          if (a !== audio && !a.paused) {
            a.pause();
            const ov = a.closest('.service-visual');
            if (ov) {
              const ob = ov.querySelector('[data-mock-play]');
              const obar = ov.querySelector('.mock-audio-progress');
              if (ob) { ob.classList.remove('playing'); ob.querySelector('.icon-play').style.display = ''; ob.querySelector('.icon-pause').style.display = 'none'; const ol = ob.querySelector('.mock-play-label'); if (ol) ol.textContent = 'Beluister'; }
              if (obar) obar.classList.remove('visible');
            }
          }
        });
        if (audio.paused) {
          audio.play().then(() => { btn.classList.add('playing'); iconPlay.style.display = 'none'; iconPause.style.display = ''; label.textContent = 'Pauzeer'; progressBar.classList.add('visible'); }).catch(() => { btn.classList.add('no-audio'); });
        } else {
          audio.pause(); btn.classList.remove('playing'); iconPlay.style.display = ''; iconPause.style.display = 'none'; label.textContent = 'Beluister';
        }
      });
    });
  }
  document.addEventListener('DOMContentLoaded', initMockPlayers);
})();

// Demo dialogue rotation
(function() {
  const demoScenarios = [
    { title: "Tandartspraktijk De Smile", caller: "Goedemiddag, ik bel voor een afspraak als nieuwe patiënt.", reply: "Welkom! Ik zet u graag in de agenda. Heeft u voorkeur voor een ochtend of middag?" },
    { title: "Van der Berg Makelaardij", caller: "Ik wil graag een bezichtiging aanvragen voor het huis aan de Kerkstraat.", reply: "Vrijdag om 14:00 is er beschikbaarheid. Zal ik dat voor u inplannen?" },
    { title: "Installatiebedrijf De Groot", caller: "We hebben een lekkage, is er iemand die vandaag langs kan komen?", reply: "Ik noteer het als spoed. Een monteur staat morgenochtend tussen 08:00 en 10:00 bij u." }
  ];
  function fadeSwap(el, newText) {
    el.style.opacity = '0'; el.style.transform = 'translateY(4px)';
    setTimeout(() => { el.textContent = newText; el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, 220);
  }
  document.addEventListener('DOMContentLoaded', function() {
    const titleEl  = document.querySelector('[data-demo-title]');
    const callerEl = document.querySelector('[data-demo-caller]');
    const replyEl  = document.querySelector('[data-demo-reply]');
    if (!titleEl || !callerEl || !replyEl) return;
    [titleEl, callerEl, replyEl].forEach(el => { el.style.transition = 'opacity 220ms ease, transform 220ms ease'; });
    let idx = 0;
    setInterval(() => {
      idx = (idx + 1) % demoScenarios.length;
      const s = demoScenarios[idx];
      fadeSwap(titleEl, s.title);
      setTimeout(() => fadeSwap(callerEl, s.caller), 80);
      setTimeout(() => fadeSwap(replyEl, s.reply), 160);
    }, 5500);
  });
})();
