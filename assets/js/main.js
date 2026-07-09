(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mobile nav toggle */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });
  }

  /* Stagger: expand group reveals into per-child reveals */
  document.querySelectorAll('.grid.reveal, .steps.reveal, .compare.reveal').forEach(function (group) {
    var kids = Array.prototype.filter.call(group.children, function (c) { return c.nodeType === 1; });
    if (kids.length < 2) return;
    group.classList.remove('reveal');
    kids.forEach(function (kid, i) {
      kid.classList.add('reveal');
      kid.style.transitionDelay = (i * 90) + 'ms';
    });
  });

  /* Scroll reveal */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* Animated stat counters */
  var counters = document.querySelectorAll('[data-count]');
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals'), 10) : 0;
    if (reduceMotion) {
      el.textContent = target.toLocaleString(undefined, { maximumFractionDigits: decimals }) + suffix;
      return;
    }
    var start = null;
    var duration = 1400;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = target * eased;
      el.textContent = value.toLocaleString(undefined, { maximumFractionDigits: decimals }) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (el) { cio.observe(el); });
    } else {
      counters.forEach(animateCount);
    }
  }

  /* Role tab switcher (For Partners page) */
  var tabs = document.querySelectorAll('.role-tab');
  if (tabs.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-role');
        tabs.forEach(function (t) {
          t.classList.toggle('active', t === tab);
          t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        });
        document.querySelectorAll('.role-panel').forEach(function (panel) {
          panel.classList.toggle('active', panel.getAttribute('data-role') === target);
        });
      });
    });
  }

  /* Current year in footer */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Back to top */
  var toTop = document.createElement('button');
  toTop.className = 'to-top';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="18" height="18"><path d="M12 19V5M5 12l7-7 7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(toTop);
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* Nav shadow + back-to-top visibility + hero parallax */
  var navEl = document.querySelector('.site-nav');
  var heroImg = document.querySelector('.hero-figure img');
  function onScroll() {
    if (navEl) navEl.classList.toggle('scrolled', window.scrollY > 24);
    toTop.classList.toggle('show', window.scrollY > 600);
    if (!reduceMotion && heroImg) {
      var y = Math.min(window.scrollY * 0.06, 60);
      heroImg.style.transform = 'translateY(' + y + 'px)';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Lightbox for images marked data-lightbox */
  var lbImgs = document.querySelectorAll('img[data-lightbox]');
  if (lbImgs.length) {
    var overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.innerHTML = '<img alt="">';
    document.body.appendChild(overlay);
    var overlayImg = overlay.querySelector('img');
    function closeLb() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
    lbImgs.forEach(function (img) {
      img.addEventListener('click', function () {
        overlayImg.src = img.src;
        overlayImg.alt = img.alt || '';
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });
    overlay.addEventListener('click', closeLb);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLb(); });
  }
})();
