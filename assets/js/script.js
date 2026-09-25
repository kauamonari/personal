(function () {
  'use strict';

  /* ---------- Header scroll state ---------- */
  var header = document.getElementById('header');
  function onScroll() {
    if (window.scrollY > 12) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');

  function closeNav() {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  navToggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('.nav__link').forEach(function (link) {
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
  var statEls = document.querySelectorAll('.stat__num');
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var isDecimal = target % 1 !== 0;
    var duration = 1400;
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

  /* ---------- Hero progress ring ---------- */
  var ring = document.getElementById('progressRing');
  if (ring && 'IntersectionObserver' in window) {
    var ringObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var circumference = 2 * Math.PI * 52;
            var target = circumference * (1 - 0.82);
            requestAnimationFrame(function () {
              ring.style.strokeDashoffset = target;
            });
            ringObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    ringObserver.observe(ring);
  }

  /* ---------- Testimonials carousel ---------- */
  var track = document.getElementById('testiTrack');
  var dotsWrap = document.getElementById('testiDots');
  var prevBtn = document.getElementById('testiPrev');
  var nextBtn = document.getElementById('testiNext');

  if (track) {
    var slides = Array.prototype.slice.call(track.children);
    var current = 0;
    var autoplayTimer = null;

    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'testi-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', 'Ir para depoimento ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === current); });
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(next, 6000);
    }
    function stopAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
    }

    track.style.transition = 'transform 0.5s cubic-bezier(0.22,1,0.36,1)';
    nextBtn.addEventListener('click', function () { next(); startAutoplay(); });
    prevBtn.addEventListener('click', function () { prev(); startAutoplay(); });

    var testiSection = document.getElementById('depoimentos');
    testiSection.addEventListener('mouseenter', stopAutoplay);
    testiSection.addEventListener('mouseleave', startAutoplay);

    goTo(0);
    startAutoplay();
  }

  /* ---------- FAQ accordion ---------- */
  var accordionItems = document.querySelectorAll('.accordion__item');
  accordionItems.forEach(function (item) {
    var trigger = item.querySelector('.accordion__trigger');
    trigger.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      accordionItems.forEach(function (i) { i.classList.remove('is-open'); });
      if (!isOpen) item.classList.add('is-open');
    });
  });

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
        formNote.className = 'form-note is-error';
        return;
      }

      formNote.textContent = 'Mensagem enviada! (Formulário de demonstração — nenhum dado foi enviado de verdade.)';
      formNote.className = 'form-note is-success';
      form.reset();
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
