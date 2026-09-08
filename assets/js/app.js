/* ==========================================================================
   RISIQ interactive layer — React 18 islands on a static page.
   No build step: components are plain React.createElement, so there is no
   JSX to transpile and nothing to bundle. Primitives follow the WAI-ARIA
   patterns Radix implements (roving tabindex, focus trap, aria-expanded).
   ========================================================================== */
(function () {
  'use strict';
  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') return;

  var h = React.createElement;
  var useState = React.useState, useEffect = React.useEffect,
      useRef = React.useRef, useMemo = React.useMemo,
      useCallback = React.useCallback, useId = React.useId;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cx = function () {
    return Array.prototype.filter.call(arguments, Boolean).join(' ');
  };
  var clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };
  var fmt = function (n, d) {
    return n.toLocaleString('en-US', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
  };
  var etb = function (n) { return fmt(Math.round(n)) + ' Br'; };

  /* deterministic PRNG so a certificate's cell map is identical on every visit */
  function hashStr(s) {
    var a = 2166136261;
    for (var i = 0; i < s.length; i++) { a ^= s.charCodeAt(i); a = Math.imul(a, 16777619); }
    return a >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* count a number up whenever it changes, respecting reduced motion */
  function useTween(target, ms) {
    var _s = useState(target), val = _s[0], setVal = _s[1];
    var from = useRef(target), raf = useRef(0);
    useEffect(function () {
      if (reduceMotion) { from.current = target; setVal(target); return; }
      var start = null, a = from.current, b = target, dur = ms || 460;
      cancelAnimationFrame(raf.current);
      var step = function (ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var e = 1 - Math.pow(1 - p, 3);
        setVal(a + (b - a) * e);
        if (p < 1) raf.current = requestAnimationFrame(step); else from.current = b;
      };
      raf.current = requestAnimationFrame(step);
      return function () { cancelAnimationFrame(raf.current); };
    }, [target, ms]);
    return val;
  }

  /* ---------------------------------------------------------------- Slider */
  function Slider(p) {
    var id = useId();
    var pct = ((p.value - p.min) / (p.max - p.min)) * 100;
    return h('div', { className: 'ui-field' },
      h('div', { className: 'ui-field-top' },
        h('label', { htmlFor: id, className: 'ui-label' }, p.label),
        h('output', { htmlFor: id, className: 'ui-value' }, p.display || fmt(p.value))
      ),
      h('input', {
        id: id, type: 'range', className: 'ui-slider',
        min: p.min, max: p.max, step: p.step || 1, value: p.value,
        style: { '--fill': pct + '%' },
        'aria-describedby': p.hint ? id + '-h' : undefined,
        onChange: function (e) { p.onChange(parseFloat(e.target.value)); }
      }),
      p.hint ? h('p', { id: id + '-h', className: 'ui-hint' }, p.hint) : null
    );
  }

  /* ------------------------------------------------------------------ Tabs */
  function Tabs(p) {
    var _s = useState(p.items[0].id), active = _s[0], setActive = _s[1];
    var refs = useRef({});
    var base = useId();
    var onKey = function (e) {
      var ids = p.items.map(function (t) { return t.id; });
      var i = ids.indexOf(active), n = null;
      if (e.key === 'ArrowRight') n = ids[(i + 1) % ids.length];
      else if (e.key === 'ArrowLeft') n = ids[(i - 1 + ids.length) % ids.length];
      else if (e.key === 'Home') n = ids[0];
      else if (e.key === 'End') n = ids[ids.length - 1];
      if (n) { e.preventDefault(); setActive(n); if (refs.current[n]) refs.current[n].focus(); }
    };
    var current = p.items.filter(function (t) { return t.id === active; })[0];
    return h('div', { className: 'ui-tabs' },
      h('div', { className: 'ui-tablist', role: 'tablist', 'aria-label': p.label, onKeyDown: onKey },
        p.items.map(function (t) {
          var on = t.id === active;
          return h('button', {
            key: t.id, role: 'tab', type: 'button',
            id: base + '-t-' + t.id,
            'aria-selected': on ? 'true' : 'false',
            'aria-controls': base + '-p-' + t.id,
            tabIndex: on ? 0 : -1,
            className: cx('ui-tab', on && 'is-on'),
            ref: function (el) { refs.current[t.id] = el; },
            onClick: function () { setActive(t.id); }
          }, t.label, t.badge ? h('span', { className: 'ui-tab-badge' }, t.badge) : null);
        })
      ),
      h('div', {
        role: 'tabpanel', id: base + '-p-' + active,
        'aria-labelledby': base + '-t-' + active, tabIndex: 0,
        className: 'ui-tabpanel', key: active
      }, current.render())
    );
  }

  /* ------------------------------------------------------------- Accordion */
  function AccordionItem(p) {
    var id = useId();
    var body = useRef(null);
    return h('div', { className: cx('ui-acc-item', p.open && 'is-open') },
      h('h3', { className: 'ui-acc-h' },
        h('button', {
          type: 'button', className: 'ui-acc-trigger',
          id: id + '-b', 'aria-expanded': p.open ? 'true' : 'false', 'aria-controls': id + '-p',
          onClick: p.onToggle
        },
          h('span', null, p.question),
          h('span', { className: 'ui-acc-icon', 'aria-hidden': 'true' })
        )
      ),
      h('div', {
        id: id + '-p', role: 'region', 'aria-labelledby': id + '-b',
        className: 'ui-acc-panel', hidden: !p.open, ref: body
      }, h('div', { className: 'ui-acc-body' }, p.answer))
    );
  }
  function Accordion(p) {
    var _s = useState(p.items[0] ? [p.items[0].q] : []), open = _s[0], setOpen = _s[1];
    return h('div', { className: 'ui-acc' },
      p.items.map(function (it) {
        var isOpen = open.indexOf(it.q) > -1;
        return h(AccordionItem, {
          key: it.q, question: it.q, answer: it.a, open: isOpen,
          onToggle: function () {
            setOpen(isOpen ? open.filter(function (x) { return x !== it.q; }) : open.concat([it.q]));
          }
        });
      })
    );
  }

  /* ---------------------------------------------------------------- Dialog */
  function Dialog(p) {
    var panel = useRef(null), opener = useRef(null);
    useEffect(function () {
      if (!p.open) return;
      opener.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      var node = panel.current;
      var sel = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';
      var first = node && node.querySelector(sel);
      if (first) first.focus();
      var onKey = function (e) {
        if (e.key === 'Escape') { e.preventDefault(); p.onClose(); return; }
        if (e.key !== 'Tab' || !node) return;
        var f = Array.prototype.filter.call(node.querySelectorAll(sel), function (el) {
          return el.offsetParent !== null;
        });
        if (!f.length) return;
        var a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      };
      document.addEventListener('keydown', onKey);
      return function () {
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = '';
        if (opener.current && opener.current.focus) opener.current.focus();
      };
    }, [p.open]);
    if (!p.open) return null;
    return h('div', { className: 'ui-overlay', onMouseDown: function (e) { if (e.target === e.currentTarget) p.onClose(); } },
      h('div', {
        className: 'ui-dialog', role: 'dialog', 'aria-modal': 'true',
        'aria-label': p.title, ref: panel
      },
        h('div', { className: 'ui-dialog-head' },
          h('h3', null, p.title),
          h('button', { type: 'button', className: 'ui-x', onClick: p.onClose, 'aria-label': 'Close dialog' }, '×')
        ),
        h('div', { className: 'ui-dialog-body' }, p.children)
      )
    );
  }

  window.RISIQ_UI = {
    h: h, cx: cx, clamp: clamp, fmt: fmt, etb: etb,
    hashStr: hashStr, mulberry32: mulberry32, useTween: useTween, reduceMotion: reduceMotion,
    Slider: Slider, Tabs: Tabs, Accordion: Accordion, Dialog: Dialog
  };
})();
