(function () {
  'use strict';

  var html = document.documentElement;
  html.classList.add('js-ready');

  /* ---------- Header glass state on scroll ---------- */
  var header = document.getElementById('siteHeader');
  function onScroll() {
    if (window.scrollY > 20) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav (kept OUTSIDE any backdrop-filter ancestor
     on purpose — a blurred parent becomes the containing block for a
     fixed-position child, which breaks full-viewport overlays). ---------- */
  var navToggle = document.getElementById('navToggle');
  var mobileNav = document.getElementById('mobileNav');

  function closeNav() {
    mobileNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  navToggle.addEventListener('click', function () {
    var isOpen = mobileNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mobileNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- Animated stat counters ---------- */
  var statEls = document.querySelectorAll('.stat-num');
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var isDecimal = target % 1 !== 0;
    var duration = 1500;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = target * eased;
      el.textContent = (isDecimal ? value.toFixed(1) : Math.round(value)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (statEls.length && 'IntersectionObserver' in window) {
    var statObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    statEls.forEach(function (el) { statObserver.observe(el); });
  }

  /* ---------- Pricing -> contact form plan preselect ---------- */
  var planSelect = document.getElementById('plan');
  document.querySelectorAll('[data-plan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (planSelect) planSelect.value = btn.getAttribute('data-plan');
    });
  });

  /* ---------- Contact form (demo submit, no backend) ---------- */
  var form = document.getElementById('contactForm');
  var formNote = document.getElementById('formNote');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!name || !emailValid) {
        formNote.textContent = 'Preencha seu nome e um e-mail válido para continuar.';
        formNote.className = 'text-sm mt-1 text-red-400';
        return;
      }

      formNote.textContent = 'Solicitação enviada! (Formulário de demonstração — nenhum dado foi enviado de verdade.)';
      formNote.className = 'text-sm mt-1 text-[var(--accent-2)]';
      form.reset();
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
