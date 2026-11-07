// Side quest: "Specchio d'acqua", the evening face massage ritual (jaw that
// clenches at night, the folds beside the nose). World "Argento bagnato" with
// a copper accent, chosen on 2026-11-07: PP Kyoto, PP Fragment Sans,
// PP Neue Montreal Mono on wet silver, copper and azure water. The page itself is page.js, loaded through
// loadPrivate like the other quests' pages; this file mounts it and reads its
// data for the SideQuest home.
import { store } from '../../js/store.js';
import { loadPrivate } from '../../js/private.js';
import { icon } from '../../js/icons.js';
import { autoSquircle } from '../../js/squircle.js';

const ID = 'face';

// Steps of a full ritual per phase, and of the short one (phase 3). Keep in
// step with STEPS in page.js.
const NEED = { 1: 8, 2: 9, 3: 9 };
const NEED_SHORT = 4;
const NAMES = { 1: 'Increspatura', 2: 'Fondale', 3: 'Specchio' };
const XP = { step: 3, night: 15, ascolto: 5 };

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
// The night lasts until 5 am: a ritual at 1 am counts for the evening before.
const tonightKey = () => {
  const d = new Date();
  if (d.getHours() < 5) d.setDate(d.getDate() - 1);
  return iso(d);
};

// log[night] = { p: phase, ids: [step ids done], full: true once the ritual is complete }
const full = (S, d) => !!S.log?.[d]?.full;

function summary(S) {
  S = S || {};
  const ph = S.phase || 1;
  const today = tonightKey();
  const night = S.log?.[today];
  const goal = night?.short || (ph === 3 && S.short) ? NEED_SHORT : NEED[night?.p || ph];
  const done = Math.min(goal, night?.ids?.length || 0);
  let d = full(S, today) ? today : add(today, -1);
  let streak = 0;
  while (full(S, d)) {
    streak++;
    d = add(d, -1);
  }
  return { today: done, goal, streak, detail: `Fase ${ph} · ${NAMES[ph]}` };
}

function xp(S) {
  if (!S?.log) return 0;
  const nights = Object.values(S.log);
  const steps = nights.reduce((n, x) => n + (x.ids?.length || 0), 0);
  const fulls = nights.filter((x) => x.full).length;
  const ascolto = Object.keys(S.aware || {}).length;
  return steps * XP.step + fulls * XP.night + ascolto * XP.ascolto;
}

// The quest's world on the SideQuest home: Argento bagnato with copper, the
// page's one light theme (no dark variant: the user wanted nothing black).
const WORLD = `
.w-face {
  --w-bg:#ccd7e0; --w-ink:#151c26; --w-ink2:#45525f; --w-line:#aab9c7;
  --w-accent:#9a4a24; --w-mark:#b2532a; --w-on-mark:#ffffff; --w-glow:rgba(178,83,42,.35);
  --w-display:"PP Kyoto",Georgia,"Times New Roman",serif; --w-body:"PP Fragment Sans",system-ui,sans-serif; --w-mono:"PP Neue Montreal Mono",ui-monospace,Menlo,monospace;
}
.w-face .quest-title { font-weight:300; letter-spacing:-.02em; }
.w-face .quest-title em { font-style:italic; }
.w-face .quest-kicker, .w-face .quest-detail, .w-face .streak { font-weight:400; }
.w-face:not(.is-done) .quest-icon { color:#8f3c1b; }`;

const MESSAGE = 'margin:0;min-height:100vh;padding:48px 28px;font:400 13px ui-monospace,Menlo,monospace;letter-spacing:.06em;color:var(--muted);background:var(--bg)';

function view(root) {
  root.classList.add('bleed');
  const host = document.createElement('div');
  const theme = document.documentElement.dataset.theme;
  if (theme) host.dataset.theme = theme;
  root.append(host);
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `<p style="${MESSAGE}">Apro Specchio d'acqua…</p>`;

  let api = null;
  let off = null;
  let offSquircles = null;
  let closed = false;
  loadPrivate('quests/face/page.js')
    .then((page) => {
      if (closed) return;
      shadow.innerHTML = page.template;
      api = page.boot(shadow, {
        init: () => JSON.parse(JSON.stringify(store.get(ID))),
        save: (S) => store.set(ID, S),
      });
      store.adopt(ID, api.S);
      off = store.onRemote((id) => id === ID && api.refresh());
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
  title: 'Viso',
  world: { css: WORLD, kicker: 'Rituale serale · Viso', name: 'Specchio <em>d’acqua</em>' },
  icon: icon.ripple,
  summary,
  xp,
  view,
};
