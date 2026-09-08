/* ==========================================================================
   Scroll motion — GSAP ScrollTrigger, used only for effects that ADD to an
   already-visible page.

   Deliberately NOT used for reveals: gsap.from() sets opacity:0 the moment it
   is created, so a slow CDN, a blocked script, a print stylesheet or any later
   error leaves whole sections blank. Reveals stay with the IntersectionObserver
   in main.js, which fails visible. Everything here only transforms.
   ========================================================================== */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  /* 1. the hero certificate drifts against the scroll */
  var cert = document.querySelector('.cert-float');
  if (cert) {
    gsap.to(cert, {
      yPercent: -12, ease: 'none',
      scrollTrigger: { trigger: cert.closest('.hero') || cert, start: 'top top', end: 'bottom top', scrub: 0.6 }
    });
  }

  /* 2. the partnership mark and plaque settle a little slower than the page */
  gsap.utils.toArray('.plaque').forEach(function (el) {
    gsap.to(el, {
      yPercent: -6, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.8 }
    });
  });

  /* 3. the hero aurora tracks scroll depth, so the ground shifts as you read */
  var hero = document.querySelector('.hero');
  if (hero) {
    gsap.to(hero, {
      '--aurora-shift': 1, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 }
    });
  }

  /* 4. stage rails and progress tracks fill as their section crosses the view */
  gsap.utils.toArray('.bench-rail, .tl-track').forEach(function (el) {
    gsap.fromTo(el, { '--scroll-fill': '0%' }, {
      '--scroll-fill': '100%', ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 45%', scrub: 0.5 }
    });
  });

  /* 5. section headings get a short settle — transform only, never opacity */
  gsap.utils.toArray('section h2').forEach(function (el) {
    gsap.from(el, {
      y: 14, duration: 0.5, ease: 'power2.out', clearProps: 'transform',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true }
    });
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
