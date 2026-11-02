// Side quest: "Lasciare andare", the evening pelvic floor routine of Winter
// Arc 2026. The page itself is the Journey Log's, copied as is (template.js,
// boot.js); this file mounts it and reads its data for the SideQuest home.
// The page is personal content, so it loads through loadPrivate: in the
// installed app it comes from the private data repository.
import { store } from '../../js/store.js';
import { loadPrivate } from '../../js/private.js';
import { icon } from '../../js/icons.js';
import { autoSquircle } from '../../js/squircle.js';

const ID = 'pelvic-floor';

// Which exercises count each night or week, per phase (same map as the Journey Log).
const PHASES = {
  1: { name: 'Mappa', ex: { resp: ['day', 1], cue: ['day', 1], r36: ['day', 1], close: ['day', 1] } },
  2: { name: 'Rilascio', ex: { resp: ['day', 1], elev: ['day', 1], rk: ['day', 1], flick: ['day', 1], dec: ['day', 1], close: ['day', 1] } },
  3: { name: 'Controllo', ex: { resp: ['day', 1], elev: ['day', 1], rk: ['day', 1], dec: ['day', 1], ss: ['week', 3] } },
  4: { name: 'Integrazione', ex: { resp: ['week', 5], elev: ['week', 5], rk: ['week', 5], duo: ['week', 2] } },
};
const XP = { exercise: 5, night: 20, ascolto: 10 };

const iso = (d) => {
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 10);
};
const add = (s, n) => {
  const d = new Date(`${s}T12:00:00`);
  d.setDate(d.getDate() + n);
  return iso(d);
};
// The night lasts until 5 am: a session at 1 am counts for the evening before.
const tonightKey = () => {
  const d = new Date();
  if (d.getHours() < 5) d.setDate(d.getDate() - 1);
  return iso(d);
};
const weekStart = (s) => add(s, -((new Date(`${s}T12:00:00`).getDay() + 6) % 7));
const cnt = (S, ph, id, date) => (S.log?.[`${ph}:${id}`] || []).filter((x) => x === date).length;
const cntWeek = (S, ph, id, date) => {
  const from = weekStart(date);
  return (S.log?.[`${ph}:${id}`] || []).filter((x) => x >= from && x <= date).length;
};

// 0 nothing, 1 partial, 2 complete — judged on the phase most practised that night.
function nightLevel(S, date) {
  const by = {};
  for (const ph in PHASES) for (const id in PHASES[ph].ex) {
    const c = cnt(S, ph, id, date);
    if (c) by[ph] = (by[ph] || 0) + c;
  }
  const ph = Object.keys(by).sort((a, b) => by[b] - by[a])[0];
  if (!ph) return 0;
  const daily = Object.entries(PHASES[ph].ex).filter(([, [per]]) => per === 'day');
  if (!daily.length) return 2;
  return daily.every(([id, [, t]]) => cnt(S, ph, id, date) >= t) ? 2 : 1;
}

function summary(S) {
  S = S || {};
  const ph = String(S.phase || 1);
  const today = tonightKey();
  const all = Object.entries(PHASES[ph].ex);
  const daily = all.filter(([, [per]]) => per === 'day');
  const list = daily.length ? daily : all;
  const done = list.filter(([id, [per, t]]) => (per === 'day' ? cnt(S, ph, id, today) : cntWeek(S, ph, id, today)) >= t).length;
  let night = nightLevel(S, today) ? today : add(today, -1);
  let streak = 0;
  while (nightLevel(S, night)) {
    streak++;
    night = add(night, -1);
  }
  return { today: done, goal: list.length, streak, detail: `Fase ${ph} · ${PHASES[ph].name}` };
}

// The quest's world on the SideQuest home: the page's own faces and palette
// (from template.js), dark first like the page.
const WORLD = `
.w-pelvic-floor {
  --w-bg:#1f1a28; --w-ink:#efe8f1; --w-ink2:#a89db3; --w-line:#342c40;
  --w-accent:#f1a7a9; --w-mark:#c9bff0; --w-on-mark:#2a1420; --w-glow:rgba(201,191,240,.28);
  --w-display:"Gloock",Georgia,"Times New Roman",serif; --w-body:"Figtree",system-ui,sans-serif; --w-mono:"Spline Sans Mono",ui-monospace,Menlo,monospace;
}
@media (prefers-color-scheme:light){:root:not([data-theme="dark"]) .w-pelvic-floor{
  --w-bg:#fbf9fc; --w-ink:#261c2e; --w-ink2:#675c71; --w-line:#ddd4e4;
  --w-accent:#b4475e; --w-mark:#6c5bb8; --w-on-mark:#ffffff; --w-glow:rgba(108,91,184,.18);
}}
:root[data-theme="light"] .w-pelvic-floor{
  --w-bg:#fbf9fc; --w-ink:#261c2e; --w-ink2:#675c71; --w-line:#ddd4e4;
  --w-accent:#b4475e; --w-mark:#6c5bb8; --w-on-mark:#ffffff; --w-glow:rgba(108,91,184,.18);
}`;

function xp(S) {
  if (!S?.log) return 0;
  const dates = Object.values(S.log).flat();
  const nights = [...new Set(dates)];
  const full = nights.filter((d) => nightLevel(S, d) === 2).length;
  const ascolto = Object.values(S.aware || {}).filter(Boolean).length;
  return dates.length * XP.exercise + full * XP.night + ascolto * XP.ascolto;
}

// The page expects a document; inside a shadow root it gets this stand-in (as in the Journey Log).
const docFor = (root) => ({
  getElementById: (id) => root.getElementById(id),
  querySelector: (s) => root.querySelector(s),
  querySelectorAll: (s) => root.querySelectorAll(s),
  createElement: (t) => document.createElement(t),
  fonts: document.fonts,
  addEventListener: (...a) => document.addEventListener(...a),
});

const MESSAGE = 'margin:0;min-height:100vh;padding:48px 28px;font:400 13px ui-monospace,Menlo,monospace;letter-spacing:.06em;color:var(--muted);background:var(--bg)';

function view(root) {
  root.classList.add('bleed');
  const host = document.createElement('div');
  const theme = document.documentElement.dataset.theme;
  if (theme) host.dataset.theme = theme;
  root.append(host);
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `<p style="${MESSAGE}">Apro Lasciare andare…</p>`;

  let api = null;
  let off = null;
  let offSquircles = null;
  let closed = false;
  Promise.all([loadPrivate('quests/pelvic-floor/template.js'), loadPrivate('quests/pelvic-floor/boot.js')])
    .then(([template, boot]) => {
      if (closed) return;
      shadow.innerHTML = template.default;
      boot.bootPelvico(
        docFor(shadow),
        () => JSON.parse(JSON.stringify(store.get(ID))),
        (_key, S) => store.set(ID, S),
        (_key, registered) => {
          api = registered;
          store.adopt(ID, registered.S);
        }
      );
      off = store.onRemote((id) => id === ID && api?.refresh());
      // SideQuest's squircle rule, applied over the page's own rounded corners.
      offSquircles = autoSquircle(shadow);
    })
    .catch(() => {
      if (!closed) shadow.innerHTML = `<p style="${MESSAGE}">Non riesco ad aprire la quest. Controlla la connessione e riprova.</p>`;
    });
  return () => {
    closed = true;
    off?.();
    offSquircles?.();
    api?.stop();
  };
}

export default {
  id: ID,
  title: 'Pavimento pelvico',
  world: { css: WORLD, kicker: 'Routine serale · Pavimento pelvico', name: 'Lasciare <em>andare</em>' },
  icon: icon.moonHammock,
  summary,
  xp,
  view,
};
