// Side quest: "Tornare a correre", the left foot rehab protocol (tibialis
// posterior and FHL tendinopathy, Physiosophy), moved here from BodyTemple on
// 2026-11-09. The page is the "Tendine" page of the Winter Arc Journey Log
// (template.js, boot.js), whose history was imported; this file mounts it and
// reads its data for the SideQuest home. The page is personal content, so it
// loads through loadPrivate: in the installed app it comes from the private
// data repository.
import { store } from '../../js/store.js';
import { loadPrivate } from '../../js/private.js';
import { icon } from '../../js/icons.js';
import { autoSquircle } from '../../js/squircle.js';

const ID = 'foot';

// Which exercises count each day or week, per phase. Keep in step with P in boot.js.
const PHASES = {
  1: { name: 'Scarico', ex: { 'iso-tp': ['day', 1], 'iso-fhl': ['day', 1], 'mob-df': ['day', 1], 'mob-all': ['day', 1] } },
  2: { name: 'Isotonico', ex: { 'hr-bi': ['week', 4], 'hr-mono': ['week', 3], 'toe-fhl': ['week', 4], hip: ['week', 3], bal: ['week', 5] } },
  3: { name: 'Funzionale', ex: { drop: ['day', 1], 'hr-load': ['week', 3], pogo: ['week', 3], lunge: ['week', 3], bal2: ['week', 4] } },
  4: { name: 'Corsa', ex: { 'm-hr': ['week', 2], 'm-plio': ['week', 2], 'm-core': ['week', 2] } },
};
const XP = { exercise: 5, day: 20, pain: 5 };

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
const weekStart = (s) => add(s, -((new Date(`${s}T12:00:00`).getDay() + 6) % 7));
const cnt = (S, id, date) => (S.log?.[id] || []).filter((x) => x === date).length;
const cntWeek = (S, id, date) => {
  const from = weekStart(date);
  return (S.log?.[id] || []).filter((x) => x >= from && x <= date).length;
};
const trained = (S, date) => Object.values(S.log || {}).some((l) => l.includes(date));

// A day is complete when every daily exercise of the phase is done (any
// exercise, in phases without daily ones).
function complete(S, date) {
  const daily = Object.entries(PHASES[S.phase || 1].ex).filter(([, [per]]) => per === 'day');
  if (!daily.length) return trained(S, date);
  return daily.every(([id, [, t]]) => cnt(S, id, date) >= t);
}

function summary(S) {
  S = S || {};
  const ph = String(S.phase || 1);
  const today = iso(new Date());
  const all = Object.entries(PHASES[ph].ex);
  const daily = all.filter(([, [per]]) => per === 'day');
  const list = daily.length ? daily : all;
  const done = list.filter(([id, [per, t]]) => (per === 'day' ? cnt(S, id, today) : cntWeek(S, id, today)) >= t).length;
  let day = trained(S, today) ? today : add(today, -1);
  let streak = 0;
  while (trained(S, day)) {
    streak++;
    day = add(day, -1);
  }
  return { today: done, goal: list.length, streak, detail: `Fase ${ph} · ${PHASES[ph].name}` };
}

function xp(S) {
  if (!S?.log) return 0;
  const dates = Object.values(S.log).flat();
  const days = [...new Set(dates)];
  const full = days.filter((d) => complete(S, d)).length;
  const pain = Object.keys(S.pain || {}).length;
  return dates.length * XP.exercise + full * XP.day + pain * XP.pain;
}

// The quest's world on the SideQuest home: the page's own faces and palette
// (from template.js), warm paper with orange, dark in dark mode.
const WORLD = `
.w-foot {
  --w-bg:#fbf9f4; --w-ink:#16130f; --w-ink2:#5b554c; --w-line:#d9d2c5;
  --w-accent:#d6461a; --w-mark:#ff5a1f; --w-on-mark:#ffffff; --w-glow:rgba(255,90,31,.25);
  --w-display:"Archivo",system-ui,sans-serif; --w-body:"Geist",system-ui,sans-serif; --w-mono:"Geist Mono",ui-monospace,Menlo,monospace;
}
.w-foot .quest-title { font-weight:900; font-stretch:75%; text-transform:uppercase; letter-spacing:-.01em; }
.w-foot .quest-title em { font-style:normal; color:var(--w-mark); }
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .w-foot{
  --w-bg:#1b1916; --w-ink:#f1ece3; --w-ink2:#a39b8f; --w-line:#332f29; --w-accent:#ff7a45;
}}
:root[data-theme="dark"] .w-foot{
  --w-bg:#1b1916; --w-ink:#f1ece3; --w-ink2:#a39b8f; --w-line:#332f29; --w-accent:#ff7a45;
}`;

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
  shadow.innerHTML = `<p style="${MESSAGE}">Apro Tornare a correre…</p>`;

  let api = null;
  let off = null;
  let offSquircles = null;
  let closed = false;
  Promise.all([loadPrivate('quests/foot/template.js'), loadPrivate('quests/foot/boot.js')])
    .then(([template, boot]) => {
      if (closed) return;
      shadow.innerHTML = template.default;
      boot.bootTendine(
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
  title: 'Piede sinistro',
  world: { css: WORLD, kicker: 'Riabilitazione · Piede sinistro', name: 'Tornare a <em>correre</em>' },
  icon: icon.footprint,
  summary,
  xp,
  view,
};
