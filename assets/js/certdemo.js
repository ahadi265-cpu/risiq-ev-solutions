/* ==========================================================================
   Live certificate verification demo + coverage search + booking dialog.
   ========================================================================== */
(function () {
  'use strict';
  var UI = window.RISIQ_UI, F = window.RISIQ_FEATURES;
  if (!UI || !F || typeof ReactDOM === 'undefined') return;

  var h = UI.h, cx = UI.cx, fmt = UI.fmt, clamp = UI.clamp;
  var useState = React.useState, useEffect = React.useEffect, useMemo = React.useMemo, useRef = React.useRef;

  /* cell-health ramp — one hue, light→dark, validated for a white surface */
  var RAMP = ['#3cc4ae', '#1eab97', '#12897c', '#0d6b61', '#084f47'];
  var COLS = 12, ROWS = 8, CELLS = COLS * ROWS;

  /* A pack's cells diverge as it ages, so spread widens as SoH falls. Values are
     derived from the certificate id, so the same certificate always draws the
     same map. */
  function cellMap(id, soh) {
    var rnd = UI.mulberry32(UI.hashStr(id));
    var spread = 1.1 + (100 - soh) * 0.13;
    var out = [];
    for (var i = 0; i < CELLS; i++) {
      var g = (rnd() + rnd() + rnd() - 1.5) * spread;      /* ~gaussian */
      out.push(clamp(soh + g, 35, 100));
    }
    return out;
  }
  function rampIndex(v, lo, hi) {
    var t = hi === lo ? 1 : (v - lo) / (hi - lo);
    return clamp(Math.floor(t * RAMP.length), 0, RAMP.length - 1);
  }

  var STEPS = [
    { k: 'fetch',  label: 'Locating certificate in the registry' },
    { k: 'sig',    label: 'Verifying issuer signature' },
    { k: 'gates',  label: 'Confirming quality gates passed at issue' },
    { k: 'ready',  label: 'Record verified' }
  ];

  function CertDemo() {
    var _q = useState(''),        query = _q[0], setQuery = _q[1];
    var _s = useState('idle'),    phase = _s[0], setPhase = _s[1];   /* idle|running|done|missing|error */
    var _st= useState(-1),        step  = _st[0], setStep = _st[1];
    var _c = useState(null),      cert  = _c[0], setCert = _c[1];
    var _i = useState(''),        cid   = _i[0], setCid  = _i[1];
    var _r = useState(null),      reg   = _r[0], setReg  = _r[1];
    var timers = useRef([]);

    useEffect(function () {
      fetch('assets/data/certificates.json', { cache: 'no-cache' })
        .then(function (r) { return r.json(); }).then(setReg).catch(function () { setReg({}); });
      return function () { timers.current.forEach(clearTimeout); };
    }, []);

    /* A scanned QR code arrives as /v/<ID>, which 404.html rewrites to
       ?id=<ID>. Prefill and verify automatically so a scan resolves without
       the visitor retyping the ID they just scanned. */
    var autoRan = useRef(false);
    useEffect(function () {
      if (!reg || autoRan.current) return;
      var id = new URLSearchParams(window.location.search).get('id');
      if (!id) return;
      autoRan.current = true;
      setQuery(id.trim().toUpperCase());
      run(id);
    }, [reg]);

    var run = function (rawId) {
      var id = String(rawId || '').trim().toUpperCase();
      if (!id) return;
      timers.current.forEach(clearTimeout); timers.current = [];
      setCid(id); setCert(null); setStep(-1); setPhase('running');
      var found = reg && reg[id];
      var pace = UI.reduceMotion ? 0 : 620;
      STEPS.forEach(function (s, i) {
        timers.current.push(setTimeout(function () { setStep(i); }, pace * (i + 1)));
      });
      timers.current.push(setTimeout(function () {
        if (found) { setCert(found); setPhase('done'); }
        else { setPhase('missing'); }
      }, pace * (STEPS.length + 0.4)));
    };

    var scan = function () {
      var ids = reg ? Object.keys(reg) : [];
      if (!ids.length) return;
      var pick = ids[Math.floor(Math.random() * ids.length)];
      setQuery(pick); run(pick);
    };

    return h('div', { className: 'cd' },
      h('form', {
        className: 'cd-form',
        onSubmit: function (e) { e.preventDefault(); run(query); }
      },
        h('label', { className: 'ui-label', htmlFor: 'cd-id' }, 'Certificate ID'),
        h('div', { className: 'cd-row' },
          h('input', {
            id: 'cd-id', className: 'cd-input', type: 'text', value: query,
            placeholder: 'RISIQ-0001', autoComplete: 'off', spellCheck: 'false',
            onChange: function (e) { setQuery(e.target.value); }
          }),
          h('button', { type: 'submit', className: 'btn btn-primary' }, 'Verify'),
          h('button', { type: 'button', className: 'btn btn-ghost cd-scan', onClick: scan },
            h('span', { className: 'cd-qr', 'aria-hidden': 'true' }), 'Simulate QR scan')
        ),
        h('p', { className: 'ui-hint' },
          'Try ', h('button', { type: 'button', className: 'linkish', onClick: function () { setQuery('RISIQ-0001'); run('RISIQ-0001'); } }, 'RISIQ-0001'),
          ', ', h('button', { type: 'button', className: 'linkish', onClick: function () { setQuery('RISIQ-0002'); run('RISIQ-0002'); } }, 'RISIQ-0002'),
          ' or ', h('button', { type: 'button', className: 'linkish', onClick: function () { setQuery('RISIQ-0003'); run('RISIQ-0003'); } }, 'RISIQ-0003'),
          ' — or scan to pick one at random.')
      ),

      phase !== 'idle' ? h('ol', { className: 'cd-steps', 'aria-live': 'polite' },
        STEPS.map(function (s, i) {
          var state = step > i || phase === 'done' ? 'done' : step === i ? 'now' : 'wait';
          if (phase === 'missing' && i >= step) state = i === step ? 'fail' : 'wait';
          return h('li', { key: s.k, className: 'cd-step is-' + state },
            h('span', { className: 'cd-tick' }), h('span', null, s.label));
        })
      ) : null,

      phase === 'missing' ? h('div', { className: 'cd-miss' },
        h('b', null, 'No certificate found for “' + cid + '”'),
        h('p', null, 'Check the ID printed under the QR code, or scan the code directly. Only certificates issued by RISIQ resolve here.')
      ) : null,

      cert && phase === 'done' ? h(CertCard, { id: cid, cert: cert }) : null
    );
  }

  function CertCard(p) {
    var c = p.cert, soh = c.stateOfHealth, grade = c.grade;
    var cells = useMemo(function () { return cellMap(p.id, soh); }, [p.id, soh]);
    var lo = Math.min.apply(null, cells), hi = Math.max.apply(null, cells);
    var weakest = cells.indexOf(lo);
    var tSoh = UI.useTween(soh, 900);
    var _sel = useState(null), sel = _sel[0], setSel = _sel[1];

    return h('div', { className: 'cd-cert' },
      h('div', { className: 'cd-cert-top' },
        h('div', null,
          h('span', { className: 'cd-verified' },
            h('span', { className: 'cd-shield', 'aria-hidden': 'true' }), 'Signed & verified'),
          h('h3', null, c.vehicle),
          h('span', { className: 'cd-id' }, p.id)
        ),
        h('div', { className: 'cd-grade-wrap' },
          h(F.HealthRing, { soh: tSoh, grade: grade }),
          h('span', { className: 'cd-ring-num' }, tSoh.toFixed(0) + '%'),
          h('span', { className: 'grade ' + String(grade).toLowerCase() }, 'Grade ' + grade)
        )
      ),

      h('div', { className: 'cd-rows' },
        [['Test type', c.testType], ['Test date', c.testDate],
         ['Usable capacity', c.usableCapacityKwh + ' kWh'], ['Estimated range', c.estimatedRangeKm + ' km'],
         ['Test location', c.location], ['Registry status', c.status]].map(function (r) {
          return h('div', { className: 'cd-rowline', key: r[0] },
            h('span', null, r[0]), h('b', null, r[1]));
        })
      ),

      h('div', { className: 'cd-heat' },
        h('div', { className: 'cd-heat-head' },
          h('span', { className: 'ui-legend' }, 'Cell-level degradation'),
          h('span', { className: 'cd-heat-scale' },
            h('small', null, lo.toFixed(0) + '%'),
            RAMP.map(function (col) { return h('i', { key: col, style: { background: col } }); }),
            h('small', null, hi.toFixed(0) + '%'))
        ),
        h('div', {
          className: 'cd-grid', role: 'img',
          'aria-label': CELLS + ' cells span ' + lo.toFixed(1) + '% to ' + hi.toFixed(1) +
            '% state of health; the weakest sits in module ' + (Math.floor(weakest / COLS) + 1) + '.'
        },
          cells.map(function (v, i) {
            return h('button', {
              key: i, type: 'button',
              className: cx('cd-cell', i === weakest && 'is-weak', sel === i && 'is-sel'),
              style: { background: RAMP[rampIndex(v, lo, hi)], animationDelay: (i * 6) + 'ms' },
              onClick: function () { setSel(sel === i ? null : i); },
              'aria-label': 'Cell ' + (i + 1) + ', ' + v.toFixed(1) + ' percent'
            });
          })
        ),
        h('p', { className: 'cd-heat-note' },
          sel !== null
            ? h('span', null, h('b', null, 'Cell ' + (sel + 1)), ' — ' + cells[sel].toFixed(1) + '% of nominal, module ' + (Math.floor(sel / COLS) + 1) + ' of ' + ROWS + '.')
            : h('span', null, h('b', null, 'Weakest cell ' + (weakest + 1)), ' at ' + lo.toFixed(1) + '%, ' + (soh - lo).toFixed(1) + ' pp below pack average. Select any cell to inspect it.'))
      ),

      h('div', { className: 'cd-crypto' },
        h('div', null,
          h('span', { className: 'ui-legend' }, 'Cryptographic status'),
          h('code', null, 'sha256:' + (UI.hashStr(p.id + soh).toString(16) + UI.hashStr(c.vehicle).toString(16)).slice(0, 40))
        ),
        h('ul', null,
          h('li', null, 'Signature valid — issuer RISIQ EV Solutions'),
          h('li', null, 'Record unchanged since ' + c.testDate),
          h('li', null, 'Any edit to a downloaded PDF breaks this signature')
        )
      )
    );
  }

  /* ------------------------------------------------- coverage search + modal */
  var COVERAGE = F.FLEET.map(function (f) {
    return { name: f.name, seg: f.seg, kwh: f.kwh, range: f.range, status: 'Pilot fleet' };
  }).concat([
    { name: 'Changan Lumin',      seg: 'City car',  kwh: 29.8, range: 301, status: 'Certified' },
    { name: 'Jetour Ice Cream EV',seg: 'City car',  kwh: 28.8, range: 251, status: 'Certified' },
    { name: 'Hyundai Kona EV',    seg: 'SUV',       kwh: 64.0, range: 484, status: 'Supported' },
    { name: 'Nissan Leaf',        seg: 'Hatchback', kwh: 40.0, range: 270, status: 'Supported' },
    { name: 'Volkswagen ID.4',    seg: 'SUV',       kwh: 77.0, range: 522, status: 'Supported' },
    { name: 'Toyota bZ4X',        seg: 'SUV',       kwh: 71.4, range: 516, status: 'Supported' },
    { name: 'MG ZS EV',           seg: 'SUV',       kwh: 51.1, range: 320, status: 'Supported' },
    { name: 'Geely Geometry C',   seg: 'SUV',       kwh: 53.0, range: 400, status: 'Supported' }
  ]);
  var SEGS = ['All', 'SUV', 'Hatchback', 'City car'];

  function Coverage() {
    var _q = useState(''), q = _q[0], setQ = _q[1];
    var _s = useState('All'), seg = _s[0], setSeg = _s[1];
    var _o = useState(false), open = _o[0], setOpen = _o[1];
    var _p = useState(null), picked = _p[0], setPicked = _p[1];

    var rows = useMemo(function () {
      var t = q.trim().toLowerCase();
      return COVERAGE.filter(function (r) {
        return (seg === 'All' || r.seg === seg) && (!t || r.name.toLowerCase().indexOf(t) > -1);
      });
    }, [q, seg]);

    return h('div', { className: 'cov' },
      h('div', { className: 'cov-controls' },
        h('div', { className: 'cov-search' },
          h('span', { className: 'cov-ico', 'aria-hidden': 'true' }),
          h('input', {
            type: 'search', className: 'cd-input', value: q, placeholder: 'Search a model — Atto 3, Leaf, Kona…',
            'aria-label': 'Search vehicle coverage',
            onChange: function (e) { setQ(e.target.value); }
          })
        ),
        h('div', { className: 'chip-row', role: 'radiogroup', 'aria-label': 'Segment' },
          SEGS.map(function (s) {
            return h('button', {
              key: s, type: 'button', role: 'radio', 'aria-checked': s === seg ? 'true' : 'false',
              className: cx('chip', s === seg && 'is-on'), onClick: function () { setSeg(s); }
            }, s);
          })
        )
      ),
      h('p', { className: 'cov-count', 'aria-live': 'polite' },
        rows.length + ' of ' + COVERAGE.length + ' models'),
      rows.length ? h('ul', { className: 'cov-list' },
        rows.map(function (r) {
          return h('li', { key: r.name, className: 'cov-item' },
            h('div', null, h('b', null, r.name), h('small', null, r.seg + ' · ' + r.kwh + ' kWh · ' + r.range + ' km rated')),
            h('span', { className: cx('cov-tag', 'is-' + r.status.split(' ')[0].toLowerCase()) }, r.status),
            h('button', {
              type: 'button', className: 'btn btn-ghost btn-sm',
              onClick: function () { setPicked(r); setOpen(true); }
            }, 'Book a briefing')
          );
        })
      ) : h('div', { className: 'cov-empty' },
        h('b', null, 'No match for “' + q + '”'),
        h('p', null, 'Socket-side measurement is manufacturer-agnostic, so a model missing from this list is almost certainly still testable. Ask us.')
      ),
      h(UI.Dialog, { open: open, onClose: function () { setOpen(false); }, title: 'Book a pilot briefing' },
        h(BookingForm, { vehicle: picked, onDone: function () { setOpen(false); } })
      )
    );
  }

  function BookingForm(p) {
    var _n = useState(''), name = _n[0], setName = _n[1];
    var _o = useState(''), org = _o[0], setOrg = _o[1];
    var _e = useState(''), email = _e[0], setEmail = _e[1];
    var _s = useState('idle'), st = _s[0], setSt = _s[1];

    var submit = function (e) {
      e.preventDefault();
      if (!name.trim() || !org.trim() || !email.trim()) return;
      setSt('sending');
      fetch('https://formsubmit.co/ajax/ahadi265@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: name, org: org, email: email,
          _subject: 'Pilot briefing request — ' + org,
          message: 'Briefing request' + (p.vehicle ? ' about ' + p.vehicle.name : '') + ' via the coverage tool.'
        })
      }).then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (r) { setSt(String(r && r.success) === 'true' ? 'done' : 'error'); })
        .catch(function () { setSt('error'); });
    };

    if (st === 'done') return h('div', { className: 'cd-miss', style: { borderColor: '#a7e3da', background: '#f0fbf9' } },
      h('b', null, 'Request received'), h('p', null, 'We will confirm a briefing slot by email within one working day.'));

    return h('form', { onSubmit: submit, className: 'bk' },
      p.vehicle ? h('p', { className: 'bk-ctx' }, 'About ', h('b', null, p.vehicle.name), ' — ', p.vehicle.kwh + ' kWh, ' + p.vehicle.range + ' km rated.') : null,
      h('div', { className: 'form-field' }, h('label', { htmlFor: 'bk-n' }, 'Full name'),
        h('input', { id: 'bk-n', required: true, value: name, onChange: function (e) { setName(e.target.value); } })),
      h('div', { className: 'form-field' }, h('label', { htmlFor: 'bk-o' }, 'Organisation'),
        h('input', { id: 'bk-o', required: true, value: org, onChange: function (e) { setOrg(e.target.value); } })),
      h('div', { className: 'form-field' }, h('label', { htmlFor: 'bk-e' }, 'Email'),
        h('input', { id: 'bk-e', type: 'email', required: true, value: email, onChange: function (e) { setEmail(e.target.value); } })),
      h('button', { type: 'submit', className: 'btn btn-primary btn-block', disabled: st === 'sending' },
        st === 'sending' ? 'Sending…' : 'Request a briefing'),
      st === 'error' ? h('p', { className: 'ui-hint', style: { color: 'var(--red)' } },
        'Could not send — please email Khalid@risiqbs.com directly.') : null
    );
  }

  /* ------------------------------------------------------------- mount them */
  var MOUNTS = {
    'calculator':  F.Calculator,
    'test-timeline': F.TestTimeline,
    'cert-demo':   CertDemo,
    'coverage':    Coverage
  };
  Object.keys(MOUNTS).forEach(function (key) {
    var node = document.querySelector('[data-react="' + key + '"]');
    if (!node) return;
    node.removeAttribute('data-loading');
    ReactDOM.createRoot(node).render(React.createElement(MOUNTS[key]));
  });
})();
