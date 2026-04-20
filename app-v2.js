// ============================================================
// GLOBAL PULSE v2 — Main application
// ============================================================

const CATS = window.CATEGORIES;
const CITIES = window.CITIES;
let events = [...window.EVENTS];
let activeFilters = new Set(Object.keys(CATS));
let globe = null;
let eventCount24h = 2847;
let regionCount = 47;
let userInteracted = false;
let autoRotate = true;
let currentView = 'live';

// ---------- Country data ----------
const COUNTRIES = [
  { iso: 'USA', name: 'United States', lat: 39.8, lng: -98.6 },
  { iso: 'CAN', name: 'Canada',        lat: 56.1, lng: -106.3 },
  { iso: 'MEX', name: 'Mexico',        lat: 23.6, lng: -102.5 },
  { iso: 'BRA', name: 'Brazil',        lat: -10.4, lng: -52.9 },
  { iso: 'ARG', name: 'Argentina',     lat: -34.6, lng: -63.6 },
  { iso: 'UK',  name: 'United Kingdom',lat: 54.0, lng: -2.0 },
  { iso: 'DE',  name: 'Germany',       lat: 51.2, lng: 10.4 },
  { iso: 'FR',  name: 'France',        lat: 46.6, lng: 2.2 },
  { iso: 'ES',  name: 'Spain',         lat: 40.5, lng: -3.7 },
  { iso: 'IT',  name: 'Italy',         lat: 41.9, lng: 12.6 },
  { iso: 'PL',  name: 'Poland',        lat: 51.9, lng: 19.1 },
  { iso: 'SE',  name: 'Sweden',        lat: 60.1, lng: 18.6 },
  { iso: 'NO',  name: 'Norway',        lat: 60.5, lng: 8.5 },
  { iso: 'RU',  name: 'Russia',        lat: 61.5, lng: 95.0 },
  { iso: 'UA',  name: 'Ukraine',       lat: 48.4, lng: 31.2 },
  { iso: 'TR',  name: 'Turkey',        lat: 38.9, lng: 35.2 },
  { iso: 'EG',  name: 'Egypt',         lat: 26.8, lng: 30.8 },
  { iso: 'SA',  name: 'Saudi Arabia',  lat: 23.9, lng: 45.1 },
  { iso: 'IR',  name: 'Iran',          lat: 32.4, lng: 53.7 },
  { iso: 'IL',  name: 'Israel',        lat: 31.0, lng: 34.9 },
  { iso: 'IN',  name: 'India',         lat: 22.3, lng: 78.9 },
  { iso: 'CN',  name: 'China',         lat: 35.9, lng: 104.2 },
  { iso: 'JP',  name: 'Japan',         lat: 36.2, lng: 138.3 },
  { iso: 'KR',  name: 'South Korea',   lat: 36.5, lng: 127.9 },
  { iso: 'TW',  name: 'Taiwan',        lat: 23.7, lng: 121.0 },
  { iso: 'VN',  name: 'Vietnam',       lat: 14.1, lng: 108.3 },
  { iso: 'TH',  name: 'Thailand',      lat: 15.9, lng: 101.0 },
  { iso: 'ID',  name: 'Indonesia',     lat: -2.5, lng: 118.0 },
  { iso: 'AU',  name: 'Australia',     lat: -25.3, lng: 133.8 },
  { iso: 'NZ',  name: 'New Zealand',   lat: -40.9, lng: 174.9 },
  { iso: 'ZA',  name: 'South Africa',  lat: -30.6, lng: 22.9 },
  { iso: 'NG',  name: 'Nigeria',       lat: 9.1, lng: 8.7 },
  { iso: 'KE',  name: 'Kenya',         lat: -0.0, lng: 37.9 },
  { iso: 'ET',  name: 'Ethiopia',      lat: 9.1, lng: 40.5 },
  { iso: 'MA',  name: 'Morocco',       lat: 31.8, lng: -7.1 },
  { iso: 'PK',  name: 'Pakistan',      lat: 30.4, lng: 69.3 },
  { iso: 'BD',  name: 'Bangladesh',    lat: 23.7, lng: 90.4 },
  { iso: 'PH',  name: 'Philippines',   lat: 12.9, lng: 121.8 },
  { iso: 'MY',  name: 'Malaysia',      lat: 4.2, lng: 101.9 },
  { iso: 'SG',  name: 'Singapore',     lat: 1.4, lng: 103.8 },
];

// ---------- Boot ----------
const bootLines = [
  'INITIALIZING GEOSPATIAL FEED',
  'AUTHENTICATING OSINT NODES',
  'CONNECTING TO EDGE NODES · 14 REGIONS',
  'SYNCING SATELLITE TELEMETRY',
  'LOADING EARTH NIGHT TEXTURE · NASA BLACK MARBLE',
  'BINDING EVENT CLASSIFIER · 5 STREAMS',
  'READY · ENTERING MAIN VIEW',
];
function runBoot() {
  const bar = document.querySelector('.boot-progress-bar');
  const log = document.querySelector('.boot-log');
  let i = 0;
  const tick = () => {
    if (i >= bootLines.length) {
      bar.style.width = '100%';
      setTimeout(() => {
        document.querySelector('.boot').classList.add('hide');
        initGlobe();
        startLoops();
        setTimeout(() => document.querySelector('.boot').remove(), 900);
      }, 380);
      return;
    }
    const pct = Math.round(((i + 1) / bootLines.length) * 100);
    bar.style.width = pct + '%';
    log.innerHTML = '<b>› </b>' + bootLines[i];
    i++;
    setTimeout(tick, 340 + Math.random() * 160);
  };
  tick();
}

// ---------- Globe ----------
function initGlobe() {
  const el = document.getElementById('globe');

  globe = Globe()(el)
    .width(el.clientWidth)
    .height(el.clientHeight)
    .backgroundColor('#00000000')
    .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
    .showAtmosphere(true)
    .atmosphereColor('#4cc9f0')
    .atmosphereAltitude(0.32);

  globe
    .arcsData([])
    .arcColor('color')
    .arcStroke(0.45)
    .arcDashLength(0.4)
    .arcDashGap(0.18)
    .arcDashAnimateTime(() => 2600 + Math.random() * 1200)
    .arcAltitudeAutoScale(0.48);

  rebuildPoints();

  globe
    .pointColor('color')
    .pointAltitude(0)
    .pointRadius('radius')
    .pointsMerge(false)
    .pointLabel(d => tooltipHtml(d))
    .onPointClick(d => {
      userInteracted = true;
      globe.controls().autoRotate = false;
      globe.pointOfView({ lat: d.lat, lng: d.lng, altitude: 1.4 }, 900);
      const evt = events.find(e => e.to === d.code || e.from === d.code);
      if (evt) showDetail(evt);
    });

  // Rings
  const ringCities = Object.keys(CITIES).slice(0, 18).map(k => {
    const c = CITIES[k];
    return { lat: c.lat, lng: c.lng, maxR: 3.5, propagation: 2.2, repeat: 1600 + Math.random() * 1200 };
  });
  globe
    .ringsData(ringCities)
    .ringColor(() => t => `rgba(76, 201, 240, ${Math.sqrt(1 - t)})`)
    .ringMaxRadius('maxR')
    .ringPropagationSpeed('propagation')
    .ringRepeatPeriod('repeat');

  // HTML country labels
  globe
    .htmlElementsData(COUNTRIES)
    .htmlAltitude(0.01)
    .htmlElement(d => {
      const el = document.createElement('div');
      el.className = 'country-label';
      el.innerHTML = `<span class="iso">${d.iso}</span><span class="cname">${d.name}</span>`;
      el.dataset.lat = d.lat;
      el.dataset.lng = d.lng;
      return el;
    })
    .htmlTransitionDuration(0);

  // Controls — auto-rotate until first interaction, then permanent off
  const controls = globe.controls();
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.2;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 180;
  controls.maxDistance = 600;

  const killAuto = () => {
    if (userInteracted) return;
    userInteracted = true;
    autoRotate = false;
    controls.autoRotate = false;
    updateAutoBtn();
  };
  el.addEventListener('mousedown', killAuto);
  el.addEventListener('touchstart', killAuto, { passive: true });
  el.addEventListener('wheel', killAuto, { passive: true });

  // Scale labels with zoom — fade out when far, in when close
  const scene = globe.scene();
  scene.background = null;
  globe.pointOfView({ lat: 30, lng: 15, altitude: 2.2 }, 0);

  let lastAlt = 2.2;
  function labelZoomLoop() {
    const pov = globe.pointOfView();
    const alt = pov.altitude;
    if (Math.abs(alt - lastAlt) > 0.02) {
      lastAlt = alt;
      // opacity: fade in as we approach
      const op = Math.max(0.15, Math.min(1, (3.2 - alt) / 2.0));
      const scale = Math.max(0.6, Math.min(1.15, (3.2 - alt) / 1.8));
      document.querySelectorAll('.country-label').forEach(l => {
        l.style.opacity = op;
        l.style.transform = (l.style.transform || '').replace(/scale\([^)]*\)/, '') + ` scale(${scale.toFixed(2)})`;
      });
    }
    requestAnimationFrame(labelZoomLoop);
  }
  requestAnimationFrame(labelZoomLoop);

  window.addEventListener('resize', () => {
    globe.width(el.clientWidth);
    globe.height(el.clientHeight);
  });
}

function tooltipHtml(d) {
  return `
    <div class="tooltip">
      <div class="tt-city">${d.city}</div>
      <div class="tt-coord">${d.lat.toFixed(2)}° ${d.lat >= 0 ? 'N' : 'S'} · ${d.lng.toFixed(2)}° ${d.lng >= 0 ? 'E' : 'W'}</div>
      <div class="tt-row"><span>EVENTS</span><b>${d.count}</b></div>
      <div class="tt-row"><span>DOMINANT</span><b style="color:${d.color}">${d.cat.toUpperCase()}</b></div>
    </div>`;
}

function rebuildPoints() {
  if (!globe) return;
  const buckets = {};
  events.forEach(e => {
    if (!activeFilters.has(e.cat)) return;
    [e.to, e.from].forEach(code => {
      const c = CITIES[code];
      if (!c) return;
      if (!buckets[code]) buckets[code] = { ...c, code, count: 0, cats: {} };
      buckets[code].count++;
      buckets[code].cats[e.cat] = (buckets[code].cats[e.cat] || 0) + 1;
    });
  });
  const points = Object.values(buckets).map(b => {
    const top = Object.entries(b.cats).sort((a, b) => b[1] - a[1])[0][0];
    return {
      lat: b.lat, lng: b.lng, code: b.code, city: b.name,
      count: b.count, cat: top, color: CATS[top].color,
      radius: Math.min(0.8, 0.22 + b.count * 0.11),
    };
  });
  globe.pointsData(points);

  const arcs = events.filter(e => activeFilters.has(e.cat)).map(e => {
    const f = CITIES[e.from], t = CITIES[e.to];
    return {
      startLat: f.lat, startLng: f.lng,
      endLat: t.lat, endLng: t.lng,
      color: [CATS[e.cat].color, CATS[e.cat].color],
      evt: e,
    };
  });
  globe.arcsData(arcs);
}

// ---------- Clock ----------
function tickClock() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  document.getElementById('clock').textContent = `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
  document.getElementById('datecode').textContent = `${now.getUTCFullYear()}.${pad(now.getUTCMonth()+1)}.${pad(now.getUTCDate())}`;
}

// ---------- Count-up ----------
function tween(el, to, dur = 900) {
  const from = parseInt(el.dataset.val || el.textContent.replace(/,/g, '') || '0', 10);
  const start = performance.now();
  const step = (t) => {
    const p = Math.min(1, (t - start) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    const v = Math.round(from + (to - from) * e);
    el.textContent = v.toLocaleString('en-US');
    if (p < 1) requestAnimationFrame(step);
    else el.dataset.val = to;
  };
  requestAnimationFrame(step);
}

// ---------- Feed ----------
function relTime(mins) {
  if (mins < 1) return 'NOW';
  if (mins < 60) return `${mins}M`;
  if (mins < 60 * 24) return `${Math.floor(mins / 60)}H`;
  return `${Math.floor(mins / (60 * 24))}D`;
}
function renderFeed() {
  const scroll = document.querySelector('.feed-scroll');
  scroll.innerHTML = '';
  const filtered = events.filter(e => activeFilters.has(e.cat));
  filtered.forEach(e => {
    const f = CITIES[e.from], t = CITIES[e.to];
    const c = CATS[e.cat];
    const div = document.createElement('div');
    div.className = 'feed-item' + (e._new ? ' new' : '');
    div.style.setProperty('--cat-color', c.color);
    div.innerHTML = `
      <div class="feed-head">
        <span class="feed-cat">
          <span class="d" style="background:${c.color};color:${c.color}"></span>
          ${c.label}
        </span>
        <span class="feed-time">${relTime(e.mins)}</span>
      </div>
      <div class="feed-title">${e.title}</div>
      <div class="feed-route">
        <span class="cc">${f.cc}</span> ${f.name}
        <span class="arrow">›</span>
        <span class="cc">${t.cc}</span> ${t.name}
      </div>
    `;
    div.addEventListener('click', () => {
      showDetail(e);
      if (globe) {
        userInteracted = true;
        globe.controls().autoRotate = false;
        globe.pointOfView({ lat: t.lat, lng: t.lng, altitude: 1.6 }, 800);
      }
    });
    scroll.appendChild(div);
    if (e._new) setTimeout(() => { e._new = false; }, 2500);
  });
}

// ---------- Categories w/ inline sparks ----------
const CAT_SPARKS = {
  Konflikt:    [3,5,4,6,8,7,9,11,9,10,12,14],
  Politik:     [8,7,9,6,7,5,6,4,5,4,3,4],
  Wirtschaft:  [4,5,5,6,6,7,8,9,11,13,14,15],
  Technologie: [6,7,6,8,9,10,9,11,12,13,14,15],
  Klima:       [4,4,5,5,6,7,6,7,8,9,10,11],
};
function miniSparkSvg(values, color) {
  const w = 40, h = 12;
  const max = Math.max(...values), min = Math.min(...values);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 2) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline fill="none" stroke="${color}" stroke-width="1" points="${pts}" style="filter:drop-shadow(0 0 2px ${color})"/></svg>`;
}
function renderCategories() {
  const host = document.getElementById('cat-list');
  host.innerHTML = '';
  const counts = {};
  Object.keys(CATS).forEach(k => counts[k] = 0);
  events.forEach(e => { counts[e.cat] = (counts[e.cat] || 0) + 1; });

  Object.entries(CATS).forEach(([key, c], i) => {
    const row = document.createElement('div');
    row.className = 'cat-row' + (activeFilters.has(key) ? '' : ' off');
    row.innerHTML = `
      <span class="dot" style="background:${c.color};color:${c.color}"></span>
      <span class="name">${key}</span>
      <span class="cat-spark">${miniSparkSvg(CAT_SPARKS[key], c.color)}</span>
      <span class="count">${String(counts[key]).padStart(2,'0')}</span>
      <span class="kbd">${i+1}</span>
    `;
    row.addEventListener('click', () => {
      if (activeFilters.has(key)) activeFilters.delete(key);
      else activeFilters.add(key);
      if (activeFilters.size === 0) activeFilters.add(key);
      renderCategories();
      renderFeed();
      rebuildPoints();
    });
    host.appendChild(row);
  });
}

// ---------- Detail ----------
function showDetail(e) {
  const f = CITIES[e.from], t = CITIES[e.to];
  const c = CATS[e.cat];
  const el = document.getElementById('detail');
  el.innerHTML = `
    <span class="br-bl"></span><span class="br-br"></span>
    <div class="detail-cat" style="color:${c.color};border-color:${c.color}">
      <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${c.color};box-shadow:0 0 8px ${c.color}"></span>
      ${c.label} · INCIDENT #${String(e.id).padStart(4,'0')}
    </div>
    <div class="detail-title">${e.title}</div>
    <div class="detail-route">
      <span class="code">${f.cc}</span><span>${f.name}</span>
      <span class="arrow">→</span>
      <span class="code">${t.cc}</span><span>${t.name}</span>
      <span style="margin-left:auto;color:var(--ink-ghost);font-size:10px;letter-spacing:0.18em">T+${relTime(e.mins)}</span>
    </div>
    <div class="detail-summary">${e.sum}</div>
    <div class="detail-actions">
      <button class="detail-btn danger" onclick="hideDetail()">CLOSE</button>
      <button class="detail-btn">SHARE · CLIP</button>
      <button class="detail-btn">TRACK REGION</button>
    </div>
  `;
  el.classList.add('show');
}
function hideDetail() { document.getElementById('detail').classList.remove('show'); }
window.hideDetail = hideDetail;

// ---------- Ticker ----------
function renderTicker() {
  const track = document.getElementById('ticker-stream');
  const items = [...events, ...events].map(e => {
    const c = CATS[e.cat];
    return `<span class="ticker-item">
      <span class="tag" style="color:${c.color}">${c.label}</span>
      <span>${e.title.replace(/—/g,'·')}</span>
      <span class="diamond">◆</span>
    </span>`;
  }).join('');
  track.innerHTML = items;
}

// ---------- Inject breaking ----------
function injectBreaking() {
  const pool = window.BREAKING_POOL;
  const base = pool[Math.floor(Math.random() * pool.length)];
  const newEvt = { ...base, id: 1000 + Math.floor(Math.random() * 9000), mins: 0, _new: true };
  events.unshift(newEvt);
  events.forEach((e, i) => { if (i > 0) e.mins = Math.max(e.mins, 1); });
  eventCount24h += 1;
  tween(document.getElementById('stat-events'), eventCount24h);
  renderFeed();
  renderCategories();
  renderTicker();
  rebuildPoints();
}

// ---------- Watchlist ----------
function renderWatchlist() {
  const rows = [
    { flag: 'RU', name: 'Russia · Western Front', v: '+3.2', cls: 'up' },
    { flag: 'CN', name: 'China · Taiwan Strait',  v: '+1.1', cls: 'up' },
    { flag: 'IR', name: 'Iran · Strait of Hormuz',v: '+2.8', cls: 'up' },
    { flag: 'SD', name: 'Sudan · Darfur',         v: '+4.5', cls: 'up' },
  ];
  const host = document.getElementById('watchlist');
  host.innerHTML = rows.map(r => `
    <div class="watch-row">
      <span class="flag">${r.flag}</span>
      <span class="wname">${r.name}</span>
      <span class="wv ${r.cls}">${r.v}σ</span>
    </div>
  `).join('');
}

// ---------- Toolbar ----------
function setView(name) {
  currentView = name;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === name));
  const ph = document.getElementById('view-placeholder');
  if (name === 'live') {
    ph.style.display = 'none';
  } else {
    ph.style.display = 'block';
    const labels = {
      timeline:  { t: 'TIMELINE VIEW', s: 'Chronological event replay · scrub across the last 24 hours' },
      network:   { t: 'ENTITY NETWORK', s: 'Graph of actors, sources and cross-references' },
      analytics: { t: 'ANALYTICS WORKBENCH', s: 'Cohort comparisons, forecasts, sentiment decomposition' },
    };
    const m = labels[name];
    ph.innerHTML = `<div class="v-tag">COMING · v0.2</div><h2>${m.t}</h2><p>${m.s}</p>`;
  }
}

function toggleAutoRotate() {
  if (!globe) return;
  autoRotate = !autoRotate;
  globe.controls().autoRotate = autoRotate;
  // When user explicitly re-enables, clear interaction latch
  if (autoRotate) userInteracted = false;
  updateAutoBtn();
}
function updateAutoBtn() {
  const btn = document.getElementById('auto-btn');
  if (!btn) return;
  btn.classList.toggle('active', autoRotate && !userInteracted);
  btn.innerHTML = `<span style="display:inline-block;transform:rotate(${autoRotate ? 0 : 0}deg)">⟳</span> AUTO <span class="caret" style="color:${autoRotate && !userInteracted ? 'var(--cyan)' : 'var(--ink-ghost)'}">${autoRotate && !userInteracted ? 'ON' : 'OFF'}</span>`;
}

let density = 'comfortable';
function toggleDensity() {
  density = density === 'comfortable' ? 'compact' : 'comfortable';
  document.body.classList.toggle('compact', density === 'compact');
  const btn = document.getElementById('density-btn');
  btn.classList.toggle('active', density === 'compact');
}

// ---------- Search jump ----------
function cityJump(q) {
  q = q.trim().toLowerCase();
  if (!q) return;
  const match = Object.values(CITIES).find(c =>
    c.name.toLowerCase().includes(q) || c.cc.toLowerCase() === q
  ) || COUNTRIES.find(c => c.name.toLowerCase().includes(q) || c.iso.toLowerCase() === q);
  if (match && globe) {
    userInteracted = true;
    globe.controls().autoRotate = false;
    updateAutoBtn();
    globe.pointOfView({ lat: match.lat, lng: match.lng, altitude: 1.4 }, 1100);
  }
}

// ---------- Startup ----------
function startLoops() {
  renderCategories();
  renderFeed();
  renderTicker();
  renderWatchlist();
  tickClock();
  setInterval(tickClock, 1000);
  setInterval(injectBreaking, 7500);
  setInterval(() => {
    regionCount += (Math.random() < 0.5 ? -1 : 1);
    regionCount = Math.max(42, Math.min(58, regionCount));
    tween(document.getElementById('stat-regions'), regionCount);
  }, 4200);
  tween(document.getElementById('stat-events'), eventCount24h);
  tween(document.getElementById('stat-regions'), regionCount);

  // Toolbar wiring
  document.querySelectorAll('.tab').forEach(t => {
    t.addEventListener('click', () => setView(t.dataset.view));
  });
  document.getElementById('auto-btn').addEventListener('click', toggleAutoRotate);
  document.getElementById('density-btn').addEventListener('click', toggleDensity);
  updateAutoBtn();

  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { cityJump(e.target.value); e.target.blur(); }
  });

  // Keyboard
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') hideDetail();
    if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'k') {
      ev.preventDefault();
      searchInput.focus();
    }
    if (document.activeElement === searchInput) return;
    const num = parseInt(ev.key, 10);
    if (num >= 1 && num <= 5) {
      const key = Object.keys(CATS)[num - 1];
      if (activeFilters.has(key)) activeFilters.delete(key);
      else activeFilters.add(key);
      if (activeFilters.size === 0) activeFilters.add(key);
      renderCategories();
      renderFeed();
      rebuildPoints();
    }
  });
}

document.addEventListener('DOMContentLoaded', runBoot);
