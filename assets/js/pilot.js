/* RISIQ pilot dashboard — Apache ECharts (canvas renderer).
   Palette validated for a light surface: slot 1 #0d9488, slot 2 #b45309.
   Every chart has a hover layer, direct labels, and a table counterpart in the page. */
(function () {
  /* If the chart library never arrives, say so and point at the table rather than
     leaving three boxes reading "Loading chart…" forever. */
  if (typeof echarts === 'undefined') {
    document.querySelectorAll('.chart-canvas[data-empty]').forEach(function (el) {
      el.setAttribute('data-empty', 'fallback');
    });
    var t = document.querySelector('.table-view');
    if (t) t.open = true;
    return;
  }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var C1 = '#0d9488';      /* slot 1 — measured */
  var C2 = '#b45309';      /* slot 2 — rated / claimed */
  var GRID = '#e2e8f0';
  var INK = '#0f1b2d', MUTED = '#46556b', FAINT = '#6b7a90';
  var SANS = "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  var MONO = "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace";

  /* Grade thresholds — the same bands the certificate uses */
  var BANDS = [
    { g: 'A', min: 92, max: 100, ink: '#15803d', wash: 'rgba(21,128,61,0.055)' },
    { g: 'B', min: 85, max: 92,  ink: '#0f766e', wash: 'rgba(15,118,110,0.055)' },
    { g: 'C', min: 78, max: 85,  ink: '#b45309', wash: 'rgba(180,83,9,0.055)' },
    { g: 'D', min: 70, max: 78,  ink: '#b91c1c', wash: 'rgba(185,28,28,0.06)' }
  ];

  var FLEET = [
    {id:'RISIQ-P01',model:'Atto 3',   odo:18400,soh:97.1,grade:'A',rated:420,meas:408},
    {id:'RISIQ-P02',model:'Dolphin',  odo:62800,soh:95.4,grade:'A',rated:405,meas:386},
    {id:'RISIQ-P03',model:'Song Plus',odo:24100,soh:88.2,grade:'B',rated:505,meas:445},
    {id:'RISIQ-P04',model:'Atto 3',   odo:71500,soh:93.8,grade:'A',rated:420,meas:394},
    {id:'RISIQ-P05',model:'Yuan Plus',odo:33900,soh:84.6,grade:'C',rated:430,meas:364},
    {id:'RISIQ-P06',model:'Dolphin',  odo:47200,soh:91.7,grade:'B',rated:405,meas:371},
    {id:'RISIQ-P07',model:'Song Plus',odo:12600,soh:90.3,grade:'B',rated:505,meas:456},
    {id:'RISIQ-P08',model:'Atto 3',   odo:55400,soh:96.2,grade:'A',rated:420,meas:404},
    {id:'RISIQ-P09',model:'e2',       odo:88300,soh:79.4,grade:'C',rated:405,meas:322},
    {id:'RISIQ-P10',model:'Yuan Plus',odo:29700,soh:74.8,grade:'D',rated:430,meas:322}
  ];

  var km = function (n) { return n.toLocaleString('en-US'); };
  var bandOf = function (soh) {
    for (var i = 0; i < BANDS.length; i++) if (soh >= BANDS[i].min) return BANDS[i];
    return BANDS[BANDS.length - 1];
  };

  var tip = {
    backgroundColor: '#ffffff',
    borderColor: '#dbe3ee',
    borderWidth: 1,
    padding: [12, 14],
    extraCssText: 'box-shadow:0 10px 28px rgba(15,27,45,0.14); border-radius:10px;',
    textStyle: { color: INK, fontFamily: SANS, fontSize: 13 }
  };

  /* label markup shared by the tooltips — grade always carries its letter, never colour alone */
  function tipBody(d) {
    var b = bandOf(d.soh);
    return '<div style="font-weight:600;margin-bottom:6px">' + d.model +
           ' <span style="color:' + FAINT + ';font-family:' + MONO + ';font-size:11px">' + d.id + '</span></div>' +
           '<div style="font-family:' + MONO + ';font-size:12px;color:' + MUTED + ';line-height:1.8">' +
           'Odometer &nbsp;<b style="color:' + INK + '">' + km(d.odo) + ' km</b><br>' +
           'State of health &nbsp;<b style="color:' + INK + '">' + d.soh.toFixed(1) + '%</b><br>' +
           'Grade &nbsp;<b style="color:' + b.ink + '">' + d.grade + '</b><br>' +
           'Range &nbsp;<b style="color:' + INK + '">' + d.meas + ' km</b> ' +
           '<span style="color:' + FAINT + '">of ' + d.rated + ' rated</span>' +
           '</div>';
  }

  var charts = [];
  function mount(el, option) {
    if (!el) return;
    el.removeAttribute('data-empty');
    var c = echarts.init(el, null, { renderer: 'canvas' });
    option.animation = !reduce;
    option.animationDuration = 620;
    option.animationEasing = 'cubicOut';
    c.setOption(option);
    charts.push(c);
    return c;
  }

  /* grade bands drawn as recessive background zones + a right-hand letter */
  function gradeAreas() {
    return {
      silent: true,
      itemStyle: { opacity: 1 },
      data: BANDS.map(function (b) {
        return [
          { yAxis: b.min, itemStyle: { color: b.wash },
            label: { show: true, position: 'insideEndTop', formatter: 'Grade ' + b.g,
                     color: b.ink, fontFamily: MONO, fontSize: 10.5, opacity: 0.85,
                     padding: [4, 8, 0, 0] } },
          { yAxis: b.max }
        ];
      })
    };
  }

  /* thresholds as right-labelled reference lines, for charts whose marks fill the plot */
  function gradeLines() {
    return {
      silent: true, symbol: 'none',
      lineStyle: { color: '#cbd5e1', type: 'dashed', width: 1 },
      label: { position: 'end', distance: 6, color: FAINT, fontFamily: MONO, fontSize: 10.5,
               formatter: function (p) { return p.name; } },
      data: BANDS.slice(0, 3).map(function (b) {
        return { yAxis: b.min, name: b.g + ' \u2265 ' + b.min };
      })
    };
  }

  /* ---------- 1. SoH vs odometer — the thesis chart ---------- */
  mount(document.getElementById('chart-scatter'), {
    grid: { left: 62, right: 74, top: 24, bottom: 58 },
    tooltip: {
      trigger: 'item', backgroundColor: tip.backgroundColor, borderColor: tip.borderColor,
      borderWidth: 1, padding: tip.padding, extraCssText: tip.extraCssText, textStyle: tip.textStyle,
      formatter: function (p) { return tipBody(p.data.d); }
    },
    xAxis: {
      type: 'value', name: 'Odometer · km', nameLocation: 'middle', nameGap: 36,
      nameTextStyle: { color: FAINT, fontFamily: MONO, fontSize: 11 },
      min: 0, max: 100000, interval: 20000,
      axisLabel: { color: FAINT, fontFamily: MONO, fontSize: 11, formatter: function (v) { return km(v); } },
      axisLine: { lineStyle: { color: GRID } },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: GRID } }
    },
    yAxis: {
      type: 'value', name: 'State of health · %', nameLocation: 'middle', nameGap: 44,
      nameTextStyle: { color: FAINT, fontFamily: MONO, fontSize: 11 },
      min: 70, max: 100, interval: 5,
      axisLabel: { color: FAINT, fontFamily: MONO, fontSize: 11, formatter: '{value}%' },
      axisLine: { show: false }, axisTick: { show: false },
      splitLine: { lineStyle: { color: GRID } }
    },
    series: [{
      type: 'scatter',
      symbolSize: 17,
      data: FLEET.map(function (d) { return { value: [d.odo, d.soh], d: d }; }),
      itemStyle: { color: C1, borderColor: '#ffffff', borderWidth: 2 },
      emphasis: { scale: 1.35, itemStyle: { color: C1 } },
      markArea: gradeAreas(),
      /* direct-label only the two cars that carry the argument */
      label: {
        show: true, color: MUTED, fontFamily: MONO, fontSize: 10.5, position: 'right', distance: 9,
        formatter: function (p) {
          var d = p.data.d;
          return (d.id === 'RISIQ-P04' || d.id === 'RISIQ-P10') ? d.id.replace('RISIQ-', '') : '';
        }
      }
    }]
  });

  /* ---------- 2. Fleet SoH, sorted — the portfolio view ---------- */
  var sorted = FLEET.slice().sort(function (a, b) { return b.soh - a.soh; });
  mount(document.getElementById('chart-fleet'), {
    grid: { left: 58, right: 76, top: 30, bottom: 66 },
    tooltip: {
      trigger: 'item', backgroundColor: tip.backgroundColor, borderColor: tip.borderColor,
      borderWidth: 1, padding: tip.padding, extraCssText: tip.extraCssText, textStyle: tip.textStyle,
      formatter: function (p) { return tipBody(sorted[p.dataIndex]); }
    },
    xAxis: {
      type: 'category',
      data: sorted.map(function (d) { return d.id.replace('RISIQ-', ''); }),
      axisLabel: { color: FAINT, fontFamily: MONO, fontSize: 11, rotate: 0 },
      axisLine: { lineStyle: { color: GRID } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value', name: 'State of health · %', nameLocation: 'middle', nameGap: 42,
      nameTextStyle: { color: FAINT, fontFamily: MONO, fontSize: 11 },
      min: 70, max: 100, interval: 5,
      axisLabel: { color: FAINT, fontFamily: MONO, fontSize: 11, formatter: '{value}%' },
      axisLine: { show: false }, axisTick: { show: false },
      splitLine: { lineStyle: { color: GRID } }
    },
    series: [{
      type: 'bar',
      data: sorted.map(function (d) { return d.soh; }),
      barWidth: '52%',
      /* one hue: bar length already encodes the value, so colour is not spent on it */
      itemStyle: { color: C1, borderRadius: [4, 4, 0, 0] },
      label: { show: true, position: 'top', color: MUTED, fontFamily: MONO, fontSize: 10.5,
               formatter: function (p) { return p.value.toFixed(1); } },
      markLine: gradeLines()
    }]
  });

  /* ---------- 3. Rated vs measured range — the valuation gap ---------- */
  var byGap = FLEET.slice().sort(function (a, b) { return (a.rated - a.meas) - (b.rated - b.meas); });
  var cats = byGap.map(function (d) { return d.model + ' · ' + d.id.replace('RISIQ-', ''); });
  mount(document.getElementById('chart-range'), {
    grid: { left: 132, right: 78, top: 42, bottom: 52 },
    legend: {
      top: 0, right: 0, itemWidth: 11, itemHeight: 11, itemGap: 18,
      textStyle: { color: MUTED, fontFamily: SANS, fontSize: 12 },
      data: ['Rated range', 'Measured range']
    },
    tooltip: {
      trigger: 'axis', axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(15,27,45,0.05)' } },
      backgroundColor: tip.backgroundColor, borderColor: tip.borderColor, borderWidth: 1,
      padding: tip.padding, extraCssText: tip.extraCssText, textStyle: tip.textStyle,
      formatter: function (ps) {
        var d = byGap[ps[0].dataIndex];
        return tipBody(d) +
          '<div style="margin-top:8px;padding-top:8px;border-top:1px solid #e7edf5;font-family:' + MONO +
          ';font-size:12px;color:' + C2 + '">shortfall ' + (d.rated - d.meas) + ' km</div>';
      }
    },
    xAxis: {
      type: 'value', name: 'Range · km', nameLocation: 'middle', nameGap: 32,
      nameTextStyle: { color: FAINT, fontFamily: MONO, fontSize: 11 },
      min: 250, max: 550, interval: 50,
      axisLabel: { color: FAINT, fontFamily: MONO, fontSize: 11 },
      axisLine: { show: false }, axisTick: { show: false },
      splitLine: { lineStyle: { color: GRID } }
    },
    yAxis: {
      type: 'category', data: cats,
      axisLabel: { color: MUTED, fontFamily: MONO, fontSize: 11 },
      axisLine: { lineStyle: { color: GRID } }, axisTick: { show: false }
    },
    series: [
      { /* the connector makes the gap the thing you read */
        name: 'gap', type: 'custom', silent: true, legendHoverLink: false,
        renderItem: function (params, api) {
          var y = api.coord([0, params.dataIndex])[1];
          var x1 = api.coord([byGap[params.dataIndex].meas, params.dataIndex])[0];
          var x2 = api.coord([byGap[params.dataIndex].rated, params.dataIndex])[0];
          return { type: 'line', shape: { x1: x1, y1: y, x2: x2, y2: y },
                   style: { stroke: '#cbd5e1', lineWidth: 2 } };
        },
        data: byGap.map(function () { return 0; })
      },
      { name: 'Rated range', type: 'scatter', symbolSize: 14,
        data: byGap.map(function (d) { return d.rated; }),
        itemStyle: { color: C2, borderColor: '#ffffff', borderWidth: 2 } },
      { name: 'Measured range', type: 'scatter', symbolSize: 14,
        data: byGap.map(function (d) { return d.meas; }),
        itemStyle: { color: C1, borderColor: '#ffffff', borderWidth: 2 },
        label: { show: true, position: 'left', distance: 8, color: C1,
                 fontFamily: MONO, fontSize: 10.5, fontWeight: 600, formatter: '{c}' } }
    ]
  });

  var t;
  window.addEventListener('resize', function () {
    clearTimeout(t);
    t = setTimeout(function () { charts.forEach(function (c) { c.resize(); }); }, 120);
  });
})();
