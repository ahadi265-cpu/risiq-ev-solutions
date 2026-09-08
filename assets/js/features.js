/* ==========================================================================
   RISIQ interactive features — calculator, coverage search, test timeline,
   and the live certificate verification demo.
   ========================================================================== */
(function () {
  'use strict';
  var UI = window.RISIQ_UI;
  if (!UI || typeof ReactDOM === 'undefined') return;

  var h = UI.h, cx = UI.cx, fmt = UI.fmt, etb = UI.etb, clamp = UI.clamp;
  var useState = React.useState, useEffect = React.useEffect, useMemo = React.useMemo, useRef = React.useRef;

  /* ------------------------------------------------------------ shared data */
  var FLEET = [
    { id: 'atto3',   name: 'BYD Atto 3',    kwh: 60.5, range: 420, price: 4500000, seg: 'SUV' },
    { id: 'dolphin', name: 'BYD Dolphin',   kwh: 44.9, range: 405, price: 3200000, seg: 'Hatchback' },
    { id: 'song',    name: 'BYD Song Plus', kwh: 71.8, range: 505, price: 5400000, seg: 'SUV' },
    { id: 'yuan',    name: 'BYD Yuan Plus', kwh: 60.5, range: 430, price: 4300000, seg: 'SUV' },
    { id: 'e2',      name: 'BYD e2',        kwh: 43.2, range: 405, price: 2900000, seg: 'Hatchback' }
  ];
  var CLIMATES = [
    { id: 'addis',  label: 'Addis Ababa', temp: 16, note: '2,355 m — mild all year' },
    { id: 'hawassa',label: 'Hawassa',     temp: 20, note: '1,700 m — warm temperate' },
    { id: 'dire',   label: 'Dire Dawa',   temp: 26, note: 'lowland heat' },
    { id: 'afar',   label: 'Afar corridor', temp: 31, note: 'extreme — import route' }
  ];

  /* Degradation model. Calendar fade follows a square-root-of-time law with an
     Arrhenius temperature term (rate roughly doubles per +10 °C); cycle fade is
     linear in equivalent full cycles. Constants sit in the published range for
     automotive LFP packs. */
  var T_REF = 25, K_CAL = 2.2, K_CYC = 0.0115;
  var arrh = function (t) { return Math.pow(2, (t - T_REF) / 10); };
  function modelSoH(years, cycles, temp) {
    var cal = K_CAL * Math.sqrt(Math.max(0, years)) * arrh(temp);
    var cyc = K_CYC * cycles;
    return { soh: clamp(100 - cal - cyc, 40, 100), cal: cal, cyc: cyc };
  }
  function gradeOf(s) { return s >= 92 ? 'A' : s >= 85 ? 'B' : s >= 78 ? 'C' : 'D'; }
  var GRADE_INK = { A: '#15803d', B: '#0f766e', C: '#b45309', D: '#b91c1c' };

  /* Book depreciation ignores the pack; the battery factor reprices it. The gap
     between the two is the exposure a lender currently cannot see. */
  var PACK_SHARE = 0.35;
  function bookFactor(years, km) {
    return Math.pow(0.86, years) * Math.max(0.55, 1 - km / 500000);
  }
  function batteryFactor(soh) {
    return (1 - PACK_SHARE) + PACK_SHARE * clamp((soh - 60) / 40, 0, 1);
  }

  /* ------------------------------------------------- 1. Valuation calculator */
  function Calculator() {
    var _v = useState('atto3'), vid = _v[0], setVid = _v[1];
    var _y = useState(4),      yrs = _y[0], setYrs = _y[1];
    var _k = useState(72000),  km  = _k[0], setKm  = _k[1];
    var _c = useState(620),    cyc = _c[0], setCyc = _c[1];
    var _t = useState('addis'),cli = _t[0], setCli = _t[1];

    var car = FLEET.filter(function (f) { return f.id === vid; })[0];
    var climate = CLIMATES.filter(function (c) { return c.id === cli; })[0];
    var m = useMemo(function () { return modelSoH(yrs, cyc, climate.temp); }, [yrs, cyc, climate.temp]);

    var soh = m.soh, grade = gradeOf(soh);
    var usable = car.kwh * soh / 100;
    var range = car.range * soh / 100;
    var book = car.price * bookFactor(yrs, km);
    var bf = batteryFactor(soh);
    var adjusted = book * bf;
    var gap = book - adjusted;

    var tSoh = UI.useTween(soh), tGap = UI.useTween(gap, 620), tAdj = UI.useTween(adjusted, 620);

    return h('div', { className: 'calc' },
      h('div', { className: 'calc-inputs' },
        h('span', { className: 'ui-legend' }, 'Vehicle'),
        h('div', { className: 'chip-row', role: 'radiogroup', 'aria-label': 'Vehicle' },
          FLEET.map(function (f) {
            return h('button', {
              key: f.id, type: 'button', role: 'radio', 'aria-checked': f.id === vid ? 'true' : 'false',
              className: cx('chip', f.id === vid && 'is-on'),
              onClick: function () { setVid(f.id); }
            }, f.name.replace('BYD ', ''));
          })
        ),
        h(UI.Slider, {
          label: 'Age', value: yrs, min: 0, max: 10, step: 0.5,
          display: yrs + (yrs === 1 ? ' year' : ' years'),
          onChange: setYrs, hint: 'Calendar fade grows with the square root of time.'
        }),
        h(UI.Slider, {
          label: 'Odometer', value: km, min: 0, max: 200000, step: 1000,
          display: fmt(km) + ' km', onChange: setKm,
          hint: 'Drives market depreciation — not battery health.'
        }),
        h(UI.Slider, {
          label: 'Charge cycles', value: cyc, min: 0, max: 2000, step: 10,
          display: fmt(cyc) + ' cycles', onChange: setCyc,
          hint: 'Equivalent full cycles. A commuter adds ~150/year; a taxi, ~600.'
        }),
        h('span', { className: 'ui-legend' }, 'Climate'),
        h('div', { className: 'chip-row', role: 'radiogroup', 'aria-label': 'Climate' },
          CLIMATES.map(function (c) {
            return h('button', {
              key: c.id, type: 'button', role: 'radio', 'aria-checked': c.id === cli ? 'true' : 'false',
              className: cx('chip', c.id === cli && 'is-on'),
              onClick: function () { setCli(c.id); }
            }, c.label, h('small', null, c.temp + '°C'));
          })
        ),
        h('p', { className: 'ui-hint' }, climate.note)
      ),

      h('div', { className: 'calc-out' },
        h('div', { className: 'calc-soh' },
          h(HealthRing, { soh: tSoh, grade: grade }),
          h('div', null,
            h('span', { className: 'calc-soh-num' }, tSoh.toFixed(1) + '%'),
            h('span', { className: 'calc-soh-lab' }, 'estimated state of health'),
            h('span', { className: 'grade ' + grade.toLowerCase(), style: { marginTop: '10px' } }, 'Grade ' + grade)
          )
        ),
        h('div', { className: 'calc-grid' },
          h(Stat, { k: 'Usable capacity', v: usable.toFixed(1) + ' kWh', s: 'of ' + car.kwh + ' kWh new' }),
          h(Stat, { k: 'Estimated range', v: Math.round(range) + ' km', s: 'of ' + car.range + ' km rated' }),
          h(Stat, { k: 'Calendar fade', v: '−' + m.cal.toFixed(1) + ' pp', s: yrs + ' yr at ' + climate.temp + '°C' }),
          h(Stat, { k: 'Cycle fade', v: '−' + m.cyc.toFixed(1) + ' pp', s: fmt(cyc) + ' full cycles' })
        ),
        h('div', { className: 'calc-money' },
          h('span', { className: 'ui-legend' }, 'Collateral position'),
          h('div', { className: 'money-row' },
            h('span', null, 'Book residual ', h('small', null, 'battery ignored')),
            h('b', null, etb(book))
          ),
          h('div', { className: 'money-row is-key' },
            h('span', null, 'Battery-adjusted residual'),
            h('b', null, etb(tAdj))
          ),
          h('div', { className: 'money-bar', role: 'img',
                     'aria-label': 'Battery-adjusted residual is ' + Math.round(bf * 100) + '% of book residual.' },
            h('i', { style: { width: (bf * 100) + '%' } })
          ),
          h('div', { className: 'money-gap' },
            h('span', null, 'Unpriced exposure'),
            h('b', null, etb(tGap))
          )
        ),
        h('p', { className: 'calc-note' },
          'Indicative model using RISIQ’s published method — a square-root calendar-fade law with an Arrhenius temperature term, plus linear cycle fade. Vehicle prices are indicative Addis retail. A certificate replaces this estimate with a measurement.')
      )
    );
  }

  function Stat(p) {
    return h('div', { className: 'calc-stat' },
      h('span', null, p.k), h('b', null, p.v), h('small', null, p.s));
  }

  function HealthRing(p) {
    var R = 52, C = 2 * Math.PI * R;
    var off = C * (1 - clamp(p.soh, 0, 100) / 100);
    return h('svg', { className: 'ring', viewBox: '0 0 128 128', 'aria-hidden': 'true' },
      h('circle', { cx: 64, cy: 64, r: R, fill: 'none', stroke: '#e2e8f0', strokeWidth: 11 }),
      h('circle', {
        cx: 64, cy: 64, r: R, fill: 'none', stroke: GRADE_INK[p.grade], strokeWidth: 11,
        strokeLinecap: 'round', strokeDasharray: C, strokeDashoffset: off,
        transform: 'rotate(-90 64 64)'
      })
    );
  }

  /* --------------------------------------- 2. Rapid vs Reference visualiser */
  var RUNS = {
    reference: { label: 'Reference Test', mins: 241, window: 46.0, band: '±3.0%', src: 'AC 7.2 kW wall box',
      steps: ['Rig in line at the socket', 'Full-window controlled charge', 'Four quality gates', 'Integrate & extrapolate', 'Sign & publish'] },
    rapid: { label: 'Rapid Check', mins: 15, window: 24.7, band: '±6.0%', src: 'DC 60 kW charger',
      steps: ['Rig in line at the socket', 'Partial-window charge', 'Four quality gates', 'Model-mapped to full SoH', 'Sign & publish'] }
  };
  function TestTimeline() {
    var _m = useState('rapid'), mode = _m[0], setMode = _m[1];
    var _p = useState(1), prog = _p[0], setProg = _p[1];
    var _r = useState(false), running = _r[0], setRunning = _r[1];
    var raf = useRef(0);
    var run = RUNS[mode];

    var play = function () {
      cancelAnimationFrame(raf.current);
      if (UI.reduceMotion) { setProg(1); return; }
      setRunning(true); setProg(0);
      var t0 = null, DUR = 4200;
      var step = function (ts) {
        if (t0 === null) t0 = ts;
        var q = Math.min((ts - t0) / DUR, 1);
        setProg(q);
        if (q < 1) raf.current = requestAnimationFrame(step); else setRunning(false);
      };
      raf.current = requestAnimationFrame(step);
    };
    useEffect(function () { return function () { cancelAnimationFrame(raf.current); }; }, []);

    var elapsed = run.mins * prog;
    var stage = Math.min(run.steps.length - 1, Math.floor(prog * run.steps.length));
    var clock = function (mn) {
      var s = Math.round(mn * 60), hh = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60);
      var p2 = function (n) { return (n < 10 ? '0' : '') + n; };
      return p2(hh) + ':' + p2(mm) + ':' + p2(s % 60);
    };

    return h('div', { className: 'tl' },
      h('div', { className: 'tl-bar' },
        h('div', { className: 'chip-row', role: 'radiogroup', 'aria-label': 'Test type' },
          Object.keys(RUNS).map(function (k) {
            return h('button', {
              key: k, type: 'button', role: 'radio', 'aria-checked': k === mode ? 'true' : 'false',
              className: cx('chip', k === mode && 'is-on'),
              onClick: function () { setMode(k); setProg(1); setRunning(false); cancelAnimationFrame(raf.current); }
            }, RUNS[k].label);
          })
        ),
        h('div', { className: 'tl-live' },
          h('span', { className: 'tl-clock' }, clock(elapsed)),
          h('button', { type: 'button', className: 'btn btn-primary btn-sm', onClick: play, disabled: running },
            running ? 'Running…' : 'Play the run')
        )
      ),
      h('div', { className: 'tl-track', role: 'img',
                 'aria-label': run.label + ': ' + run.mins + ' minutes, ' + run.window + ' percentage-point window, ' + run.band + ' band.' },
        h('i', { style: { width: (prog * 100).toFixed(2) + '%' } })
      ),
      h('ol', { className: 'tl-steps' },
        run.steps.map(function (s, i) {
          return h('li', { key: s, className: cx('tl-step', i <= stage && prog > 0 && 'is-on') },
            h('span', { className: 'tl-dot' }), h('span', null, s));
        })
      ),
      h('div', { className: 'tl-facts' },
        h(Stat, { k: 'Duration', v: run.mins < 60 ? run.mins + ' min' : (run.mins / 60).toFixed(1) + ' h', s: run.src }),
        h(Stat, { k: 'Measured window', v: run.window.toFixed(1) + ' pp', s: 'of charge observed' }),
        h(Stat, { k: 'Confidence band', v: run.band, s: mode === 'rapid' ? 'model-mapped' : 'reference accuracy' })
      )
    );
  }

  window.RISIQ_FEATURES = {
    FLEET: FLEET, CLIMATES: CLIMATES, gradeOf: gradeOf, GRADE_INK: GRADE_INK,
    Stat: Stat, HealthRing: HealthRing, Calculator: Calculator, TestTimeline: TestTimeline
  };
})();
