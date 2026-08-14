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

  /* Live QR codes for certificate verification (elements with data-qr-cert="ID") */
  var qrTargets = document.querySelectorAll('[data-qr-cert]');
  if (qrTargets.length && typeof qrcode === 'function') {
    qrTargets.forEach(function (el) {
      var id = el.getAttribute('data-qr-cert');
      var url = window.location.origin + '/verify.html?id=' + encodeURIComponent(id);
      var qr = qrcode(0, 'M');
      qr.addData(url);
      qr.make();
      el.innerHTML = qr.createSvgTag({ scalable: true });
      var svg = el.querySelector('svg');
      if (svg) {
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', 'QR code to verify certificate ' + id);
        svg.style.width = '100%';
        svg.style.height = '100%';
      }
    });
  }

  /* Contact form: submit to /api/contact instead of mailto */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    var contactStatus = document.getElementById('contact-status');
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var submitBtn = contactForm.querySelector('button[type="submit"]');
      var formData = new FormData(contactForm);
      var payload = {
        name: formData.get('name'),
        org: formData.get('org'),
        email: formData.get('email'),
        role: formData.get('role'),
        message: formData.get('message'),
        company: formData.get('company')
      };
      submitBtn.disabled = true;
      contactStatus.style.color = 'var(--text-faint)';
      contactStatus.textContent = 'Sending...';
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
        .then(function (result) {
          if (result.ok) {
            contactForm.reset();
            contactStatus.style.color = 'var(--teal-hi)';
            contactStatus.textContent = 'Thanks — we\'ll be in touch shortly.';
          } else {
            contactStatus.style.color = 'var(--red)';
            contactStatus.textContent = result.data.error || 'Something went wrong. Please email us directly.';
          }
        })
        .catch(function () {
          contactStatus.style.color = 'var(--red)';
          contactStatus.textContent = 'Network error — please email us directly at Khalid@risiqbs.com.';
        })
        .finally(function () { submitBtn.disabled = false; });
    });
  }

  /* Verify page: manual lookup form + auto-lookup from ?id= (e.g. from a scanned QR) */
  var verifyForm = document.getElementById('verify-form');
  var verifyResultSection = document.getElementById('verify-result-section');
  var verifyResult = document.getElementById('verify-result');
  if (verifyForm && verifyResult && verifyResultSection) {
    var verifyInput = document.getElementById('verify-id');

    var renderCert = function (id, cert) {
      verifyResultSection.style.display = '';
      verifyResult.innerHTML =
        '<div class="cert" style="max-width:640px;">' +
          '<div class="cert-top">' +
            '<div><span class="pill">RISIQ Certified · Valid</span><h3 style="margin-top:14px;">' + cert.vehicle + '</h3></div>' +
            '<span class="cert-grade">' + cert.grade + '</span>' +
          '</div>' +
          '<div class="cert-rows">' +
            '<div class="cert-row"><span>Certificate ID</span><span>' + id + '</span></div>' +
            '<div class="cert-row"><span>Test type / date</span><span>' + cert.testType + ' · ' + cert.testDate + '</span></div>' +
            '<div class="cert-row"><span>State of health</span><span>' + cert.stateOfHealth + '%</span></div>' +
            '<div class="cert-row"><span>Usable capacity / range</span><span>' + cert.usableCapacityKwh + ' kWh / ' + cert.estimatedRangeKm + ' km</span></div>' +
            '<div class="cert-row"><span>Test location</span><span>' + cert.location + '</span></div>' +
          '</div>' +
          '<div class="cert-seal" style="margin-top:22px;">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" stroke-linejoin="round"/><path d="M9.5 12l2 2 3.5-4"/></svg>' +
            'Signed &amp; verified against the RISIQ registry' +
          '</div>' +
        '</div>';
    };

    var renderNotFound = function (id) {
      verifyResultSection.style.display = '';
      verifyResult.innerHTML =
        '<div class="compare-card bad" style="max-width:640px;">' +
          '<h3>No certificate found for "' + id + '"</h3>' +
          '<p style="margin-top:10px;">Double-check the ID printed under the QR code on the certificate, or scan its QR code directly.</p>' +
        '</div>';
    };

    var renderError = function () {
      verifyResultSection.style.display = '';
      verifyResult.innerHTML = '<p style="color:var(--red);">Something went wrong checking that certificate. Please try again.</p>';
    };

    var escapeHtml = function (str) {
      var div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    };

    var lookup = function (rawId) {
      var id = escapeHtml(rawId.trim());
      if (!id) return;
      verifyResultSection.style.display = '';
      verifyResult.innerHTML = '<p style="color:var(--text-faint);">Checking…</p>';
      fetch('/api/verify?id=' + encodeURIComponent(rawId.trim()))
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.found) renderCert(id, data.certificate);
          else renderNotFound(id);
        })
        .catch(renderError);
    };

    verifyForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var id = verifyInput.value.trim();
      if (!id) return;
      history.replaceState(null, '', '?id=' + encodeURIComponent(id));
      lookup(id);
    });

    var presetId = new URLSearchParams(window.location.search).get('id');
    if (presetId) {
      verifyInput.value = presetId;
      lookup(presetId);
    }
  }
})();
