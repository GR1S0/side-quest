// Side quest: "Presa del toro", grip, wrists and forearms (Captains of Crush
// grippers G, S, T; extensors; wrist and elbow work for size; hangs and carries
// for endurance). From the research doc approved on 2026-11-20. World "Toro nero
// e ottone", chosen on 2026-11-21: PP Hatton, PP Neue Montreal, PP Fraktion Mono
// on warm black, bone and brass.
//
// The world starts closed: the card waits under a lock on the home until the
// player says yes (the user wanted it opened once the extensor bands arrive).
// The page itself is page.js, loaded through loadPrivate like the other quests.
import { store } from '../../js/store.js';
import { loadPrivate } from '../../js/private.js';
import { icon } from '../../js/icons.js';
import { autoSquircle } from '../../js/squircle.js';
import { streakOf } from '../../js/util.js';

const ID = 'grip';
const XP = { setup: 50, A: 20, B: 20, R: 5, goal: 40 };
const NAMES = { 0: 'Setup', 1: 'Adattamento', 2: 'Costruzione', 3: 'Salita' };
const KIND = { A: 'Seduta A', B: 'Seduta B', R: 'Richiamo' };

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
// The day ends at 5 am: a session after midnight counts for the evening before.
// Keep in step with dayOf() in page.js.
const dayKey = () => {
  const d = new Date();
  if (d.getHours() < 5) d.setDate(d.getDate() - 1);
  return iso(d);
};

const doneOn = (S, d) => !!S.log?.[d]?.full || S.setup?.done === d;

function summary(S) {
  S = S || {};
  const today = dayKey();
  const ph = S.setup?.done ? S.phase || 1 : 0;
  const { streak, risk } = streakOf((d) => doneOn(S, d), today, add);
  const last = S.log?.[today];
  const detail = ph === 0 ? 'Fase 0 · Setup' : `Fase ${ph} · ${NAMES[ph]}${last?.full ? ` · ${KIND[last.kind]} fatta` : ''}`;
  return { today: doneOn(S, today) ? 1 : 0, goal: 1, streak, risk, detail };
}

function xp(S) {
  if (!S) return 0;
  const sessions = Object.values(S.log || {}).filter((x) => x.full);
  const goals = Object.values(S.goals || {}).filter(Boolean).length;
  return (S.setup?.done ? XP.setup : 0) + sessions.reduce((n, x) => n + (XP[x.kind] || 0), 0) + goals * XP.goal;
}

// The quest's world on the SideQuest home: Toro nero e ottone.
const WORLD = `
.w-grip {
  --w-bg:#0f0e0d; --w-ink:#f1e7d6; --w-ink2:#a3978a; --w-line:#2c2824;
  --w-accent:#e2b257; --w-mark:#d9a441; --w-on-mark:#1c1206; --w-glow:rgba(217,164,65,.38);
  --w-display:"PP Hatton",Georgia,"Times New Roman",serif; --w-body:"PP Neue Montreal",system-ui,sans-serif; --w-mono:"PP Fraktion Mono",ui-monospace,Menlo,monospace;
}
.w-grip .quest-title { font-weight:800; font-size:1.85rem; letter-spacing:-.01em; }
.w-grip .quest-title em { font-weight:500; font-style:italic; }`;

const MESSAGE = 'margin:0;min-height:100vh;padding:48px 28px;font:400 13px ui-monospace,Menlo,monospace;letter-spacing:.06em;color:#a3978a;background:#0f0e0d';

function view(root) {
  root.classList.add('bleed');
  const host = document.createElement('div');
  root.append(host);
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `<p style="${MESSAGE}">Apro Presa del toro…</p>`;

  let api = null;
  let off = null;
  let offSquircles = null;
  let closed = false;
  loadPrivate('quests/grip/page.js')
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
  title: 'Presa del toro',
  world: { css: WORLD, kicker: 'Presa · Polsi · Avambracci', name: 'Presa del <em>toro</em>' },
  icon: icon.bull,
  locked: (S) => !S?.unlocked,
  unlock: {
    quote: 'Un toro non nasce forte: diventa forte stringendo, giorno dopo giorno.',
    text: 'Aprendo questo mondo ti prendi un impegno: tre sedute a settimana, a cominciare dal setup. Te la senti?',
  },
  summary,
  xp,
  view,
};
