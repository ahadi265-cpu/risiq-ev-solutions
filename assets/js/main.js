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
  document.querySelectorAll('.grid.reveal, .steps.reveal, .compare.reveal, .aud-grid.reveal, .invite.reveal, .kpi-row.reveal, .chart-grid.reveal, .split.reveal').forEach(function (group) {
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
    var activateRole = function (role) {
      var match = false;
      tabs.forEach(function (t) {
        var isMatch = t.getAttribute('data-role') === role;
        if (isMatch) match = true;
        t.classList.toggle('active', isMatch);
        t.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      });
      if (!match) return false;
      document.querySelectorAll('.role-panel').forEach(function (panel) {
        panel.classList.toggle('active', panel.getAttribute('data-role') === role);
      });
      return true;
    };
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        activateRole(tab.getAttribute('data-role'));
      });
    });
    /* Deep link support: partners.html?role=banks preselects a tab */
    var presetRole = new URLSearchParams(window.location.search).get('role');
    if (presetRole) activateRole(presetRole);
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

  /* Scroll progress rail — one quiet indicator of how far through a long page you are */
  var rail = null;
  if (!reduceMotion) {
    rail = document.createElement('div');
    rail.className = 'scroll-rail';
    rail.setAttribute('aria-hidden', 'true');
    rail.innerHTML = '<i></i>';
    document.body.appendChild(rail);
  }
  var railFill = rail ? rail.querySelector('i') : null;

  /* Nav shadow + back-to-top visibility */
  var navEl = document.querySelector('.site-nav');
  function onScroll() {
    if (navEl) navEl.classList.toggle('scrolled', window.scrollY > 24);
    toTop.classList.toggle('show', window.scrollY > 600);
    if (railFill) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      railFill.style.width = (max > 0 ? Math.min(window.scrollY / max, 1) * 100 : 0) + '%';
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
      var url = window.location.origin + '/v/' + encodeURIComponent(id);
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

  /* Pilot registration — posts to an email relay, because GitHub Pages cannot
     run a serverless function. Without JS the form posts natively to the same
     endpoint, so registration still works with scripting off. */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    var contactStatus = document.getElementById('contact-status');
    var setStatus = function (msg, color) {
      contactStatus.style.color = color;
      contactStatus.textContent = msg;
    };

    contactForm.addEventListener('submit', function (e) {
      /* let the browser show its own message for empty required fields */
      if (!contactForm.reportValidity()) return;
      e.preventDefault();

      var submitBtn = contactForm.querySelector('button[type="submit"]');
      var data = new FormData(contactForm);
      var payload = {};
      data.forEach(function (v, k) { payload[k] = v; });

      if (payload._honey) { setStatus('Thanks — we\'ll be in touch shortly.', 'var(--teal-hi)'); return; }
      delete payload._next;

      payload._subject = 'RISIQ pilot registration — ' + (payload.org || payload.name || 'new enquiry');

      submitBtn.disabled = true;
      setStatus('Sending…', 'var(--text-faint)');

      fetch(contactForm.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json().catch(function () { return {}; }); })
        .then(function (result) {
          if (result && String(result.success) === 'true') {
            contactForm.reset();
            setStatus('Registered — thank you. We will confirm your pilot place by email.', 'var(--teal-hi)');
          } else {
            setStatus(
              (result && result.message) ||
              'We could not send that. Please email Khalid@risiqbs.com directly.',
              'var(--red)');
          }
        })
        .catch(function () {
          setStatus('Network error — please email us directly at Khalid@risiqbs.com.', 'var(--red)');
        })
        .finally(function () { submitBtn.disabled = false; });
    });

    /* returning from the no-JS native POST */
    if (new URLSearchParams(window.location.search).get('sent') === '1') {
      setStatus('Registered — thank you. We will confirm your pilot place by email.', 'var(--teal-hi)');
    }
  }

  /* ------------------------------------------------------------------
     Test bench — plays back a worked certification run.
     Renders complete at rest; the button replays it from t = 0.
     ------------------------------------------------------------------ */
  var bench = document.querySelector('[data-bench]');
  if (bench) {
    var X0 = 62, XW = 634;                    /* chart plot area, in viewBox units */
    var ysoc = function (soc) { return 228 - soc * 2.04; };
    var capx = function (kwh) { return 8 + kwh * 10.472; };
    var SVGNS = 'http://www.w3.org/2000/svg';

    var RUNS = {
      reference: {
        name: 'Reference Test', tmax: 241,
        socStart: 32.0, socEnd: 78.0,
        socketKwh: 28.9, packKwh: 26.6,
        usable: 57.8, nominal: 61.5, soh: 94.0, grade: 'A', range: 402,
        band: '±3.0% · reference accuracy',
        pwrMax: '10', pwrNote: '7.20 kW steady',
        foot: 'Full-window reference test · Class 0.5S revenue-grade meter · 1 Hz sampling',
        gap: '1.0 s', temp: '28 °C',
        ticks: [[62, '0'], [219.8, '60'], [377.7, '120'], [535.5, '180'], [696, '241']],
        soc: '62,162.7 114.6,154.8 167.2,147.4 219.8,139.3 272.5,131.7 325.1,123.6 377.7,116 430.3,108 482.9,100.3 535.5,92.7 588.1,84.8 640.8,76.8 696,68.9',
        pwr: '62,350 62,296.7 114.6,296.2 167.2,297.1 219.8,296.4 272.5,296.9 325.1,296.3 377.7,297 430.3,296.5 482.9,296.8 535.5,296.6 588.1,297.2 640.8,297.9 696,298.9 696,350',
        alt: 'Charge session: state of charge rises from 32 to 78 percent over 241 minutes at a steady 7.2 kilowatts, giving a 46 percentage-point measured window.'
      },
      rapid: {
        name: 'Rapid Check', tmax: 15,
        socStart: 38.0, socEnd: 62.7,
        socketKwh: 15.0, packKwh: 14.3,
        usable: 57.9, nominal: 61.5, soh: 94.1, grade: 'A', range: 403,
        band: '±6.0% · model-mapped, provisional',
        pwrMax: '70', pwrNote: '63 → 56 kW taper',
        foot: 'Partial-window Rapid Check · DC 60 kW · mapped to full SoH by model',
        gap: '0.0 s', temp: '31 °C',
        ticks: [[62, '0'], [188.8, '3'], [315.6, '6'], [442.4, '9'], [569.2, '12'], [696, '15']],
        soc: '62,150.5 125.4,145.2 188.8,140.1 252.2,134.8 315.6,129.7 379,124.6 442.4,119.5 505.8,114.4 569.2,109.5 632.6,104.6 696,100.1',
        pwr: '62,350 62,283.4 188.8,283.9 315.6,285.5 442.4,287.1 569.2,289.2 696,290.8 696,350',
        alt: 'Charge session: state of charge rises from 38 to 62.7 percent in 15 minutes on a 60 kilowatt DC charger, giving a 24.7 percentage-point measured window.'
      }
    };

    var el = function (sel) { return bench.querySelector(sel); };
    var ro = function (k) { return bench.querySelector('[data-ro="' + k + '"]'); };
    var gateEls = Array.prototype.slice.call(bench.querySelectorAll('[data-gates] li'));
    var railEls = Array.prototype.slice.call(bench.querySelectorAll('[data-rail] li'));
    var playBtn = el('[data-play]');
    var chart = el('[data-chart]');

    var run = RUNS.reference;
    var socPts = [];
    var frame = null;

    /* y on the drawn SoC curve at a given playhead x — keeps dot and readouts in step */
    var parsePts = function (str) {
      return str.trim().split(/\s+/).map(function (pair) {
        var xy = pair.split(',');
        return [parseFloat(xy[0]), parseFloat(xy[1])];
      });
    };
    var yAt = function (x) {
      for (var i = 1; i < socPts.length; i++) {
        if (x <= socPts[i][0]) {
          var a = socPts[i - 1], b = socPts[i];
          var f = (x - a[0]) / (b[0] - a[0] || 1);
          return a[1] + (b[1] - a[1]) * f;
        }
      }
      return socPts[socPts.length - 1][1];
    };

    var clock = function (tMin) {
      var s = Math.round(tMin * 60);
      var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
      var pad = function (n) { return (n < 10 ? '0' : '') + n; };
      return pad(h) + ':' + pad(m) + ':' + pad(s % 60);
    };
    var mins = function (t) { return run.tmax >= 60 ? Math.round(t) + ' min' : t.toFixed(1) + ' min'; };

    /* paint the static parts that only change when the test type changes */
    var applyRun = function () {
      socPts = parsePts(run.soc);
      el('#chSoc').setAttribute('points', run.soc);
      el('#chPwr').setAttribute('points', run.pwr);
      el('#chPwrMax').textContent = run.pwrMax;
      el('#chPwrNote').textContent = run.pwrNote;
      el('#chFoot').textContent = run.foot;
      el('#chBandBot').setAttribute('y1', ysoc(run.socStart));
      el('#chBandBot').setAttribute('y2', ysoc(run.socStart));
      el('#chStartLab').setAttribute('y', ysoc(run.socStart) + 13);
      el('#chStartLab').textContent = 'start ' + run.socStart.toFixed(1) + '%';
      chart.setAttribute('aria-label', run.alt);

      var ticks = el('#chTicks');
      while (ticks.firstChild) ticks.removeChild(ticks.firstChild);
      run.ticks.forEach(function (t) {
        var n = document.createElementNS(SVGNS, 'text');
        n.setAttribute('x', t[0]);
        n.setAttribute('y', 246);
        n.textContent = t[1];
        ticks.appendChild(n);
      });

      var pp = (run.socEnd - run.socStart).toFixed(1);
      bench.querySelector('[data-gate="win"]').textContent = 'SoC window ' + pp + ' pp — needs ≥ 10 pp';
      bench.querySelector('[data-gate="gap"]').textContent = 'Longest data gap ' + run.gap + ' — needs ≤ 5 s';
      bench.querySelector('[data-gate="temp"]').textContent = 'Pack temperature ' + run.temp + ' — inside valid band';
      bench.querySelector('[data-gate="soh"]').textContent = 'SoH ' + run.soh.toFixed(1) + '% — inside plausible 40–105%';
    };

    /* q = 0 .. 1 across the whole run: measure -> gate -> compute -> certify */
    var draw = function (q) {
      var MEASURE = 0.62, COMPUTE = 0.78, CERTIFY = 0.92;
      var p = Math.min(q / MEASURE, 1);
      var x = X0 + XW * p;
      var y = yAt(x);
      var soc = (228 - y) / 2.04;
      var pack = (soc - run.socStart) / 100 * run.usable;
      var socket = pack * (run.socketKwh / run.packKwh);
      var pp = soc - run.socStart;

      el('#chClipR').setAttribute('width', XW * p);
      el('#chBand').setAttribute('y', y);
      el('#chBand').setAttribute('height', Math.max(0, ysoc(run.socStart) - y));
      el('#chBandTop').setAttribute('y1', y);
      el('#chBandTop').setAttribute('y2', y);
      el('#chPlay').setAttribute('opacity', q >= 1 ? 0 : 1);
      el('#chPlay').setAttribute('x1', x);
      el('#chPlay').setAttribute('x2', x);
      el('#chDot').setAttribute('cx', x);
      el('#chDot').setAttribute('cy', y);
      el('#chEndLab').setAttribute('y', y - 6);
      el('#chEndLab').textContent = 'now ' + soc.toFixed(1) + '%';
      el('#chWinLab').textContent = 'measured window · ' + pp.toFixed(1) + ' pp';

      ro('elapsed').textContent = mins(run.tmax * p);
      ro('soc').textContent = soc.toFixed(1) + '%';
      ro('socket').textContent = socket.toFixed(1) + ' kWh';
      ro('pack').textContent = pack.toFixed(1) + ' kWh';
      ro('clock').textContent = clock(run.tmax * p);

      /* extrapolation from the measured slice out to the full window */
      var r = q < COMPUTE ? 0 : Math.min((q - COMPUTE) / (CERTIFY - COMPUTE), 1);
      var shown = pack + (run.usable - pack) * r;
      el('#capLab').textContent = 'MEASURED ' + pack.toFixed(1) + ' kWh · ' + pp.toFixed(1) + ' pp';
      el('#capFill').setAttribute('width', Math.max(0, capx(pack) - 8));
      el('#capExt').setAttribute('x', capx(pack));
      el('#capExt').setAttribute('width', Math.max(0, capx(shown) - capx(pack)));
      el('#capLost').setAttribute('x', capx(shown));
      el('#capLost').setAttribute('width', r > 0 ? Math.max(0, capx(run.nominal) - capx(shown)) : 0);
      el('#capMark').setAttribute('x1', capx(shown));
      el('#capMark').setAttribute('x2', capx(shown));
      el('#capUsable').setAttribute('x', capx(shown));
      el('#capUsable').textContent = r > 0 ? shown.toFixed(1) + ' kWh usable today' : '';

      gateEls.forEach(function (g, i) {
        var at = [MEASURE, MEASURE + 0.05, MEASURE + 0.10, CERTIFY - 0.02][i];
        g.classList.toggle('is-pass', q >= at);
      });
      railEls.forEach(function (s, i) {
        s.classList.toggle('is-on', q >= [0, 0.02, MEASURE, COMPUTE, CERTIFY][i]);
      });

      ro('grade').textContent = q >= CERTIFY ? run.grade : '—';
      ro('soh').textContent = q >= COMPUTE ? (shown / run.nominal * 100).toFixed(1) + '%' : '—';
      ro('detail').textContent = q >= CERTIFY
        ? run.usable.toFixed(1) + ' kWh usable · ' + run.range + ' km estimated range'
        : q >= COMPUTE ? 'extrapolating the full charge window…'
        : 'no result until every gate passes';
      ro('band').textContent = q >= CERTIFY ? run.band : '';
      ro('state').textContent = q >= 1 ? 'Complete'
        : q >= CERTIFY ? 'Signing'
        : q >= COMPUTE ? 'Computing'
        : q >= MEASURE ? 'Checking' : 'Measuring';
    };

    var play = function () {
      if (frame) cancelAnimationFrame(frame);
      if (reduceMotion) { draw(1); return; }
      bench.setAttribute('data-state', 'running');
      playBtn.disabled = true;
      ro('playlabel').textContent = 'Running…';
      var t0 = null, DUR = 7600;
      var step = function (ts) {
        if (t0 === null) t0 = ts;
        var q = Math.min((ts - t0) / DUR, 1);
        draw(q);
        if (q < 1) { frame = requestAnimationFrame(step); }
        else {
          frame = null;
          bench.setAttribute('data-state', 'done');
          playBtn.disabled = false;
          ro('playlabel').textContent = 'Replay the run';
        }
      };
      frame = requestAnimationFrame(step);
    };

    applyRun();
    draw(1);

    playBtn.addEventListener('click', play);
    bench.querySelectorAll('.bench-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        if (frame) { cancelAnimationFrame(frame); frame = null; }
        bench.setAttribute('data-state', 'done');
        playBtn.disabled = false;
        ro('playlabel').textContent = 'Replay the run';
        bench.querySelectorAll('.bench-tab').forEach(function (t) {
          var on = t === tab;
          t.classList.toggle('is-on', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        run = RUNS[tab.getAttribute('data-test')];
        applyRun();
        draw(1);
      });
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
      /* Static registry: the certificate store is a JSON file, so verification
         works on static hosting with no backend to go down. */
      fetch('assets/data/certificates.json', { cache: 'no-cache' })
        .then(function (res) { return res.json(); })
        .then(function (registry) {
          var cert = registry[rawId.trim().toUpperCase()];
          if (cert) renderCert(id, cert);
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
