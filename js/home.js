import { quests } from '../quests/index.js';
import { store } from './store.js';
import { esc, playerLevel, pips } from './util.js';
import { icon } from './icons.js';
import { applySquircles } from './squircle.js';

// The home registers its listeners once and redraws itself in place when data
// arrives from another device. (It used to call itself again, adding a new
// listener on every redraw while the listeners were being called: the page
// looped forever as soon as another device had saved something.)
export function homeView(root) {
  let offSquircles = () => {};
  const render = () => {
    offSquircles();
    offSquircles = draw(root);
  };
  render();
  const offStatus = store.onStatus((s) => {
    const sync = root.querySelector('[data-el=sync]');
    if (!sync) return;
    sync.dataset.state = s.state;
    sync.textContent = s.text;
  });
  const offRemote = store.onRemote(render);
  return () => {
    offSquircles();
    offStatus();
    offRemote();
  };
}

function draw(root) {
  const totalXP = quests.reduce((sum, q) => sum + q.xp(store.get(q.id)), 0);
  const pl = playerLevel(totalXP);
  // A quest can start closed (locked(data)): its card shows under a lock until
  // the player opens its world, and it doesn't count among today's quests.
  const cards = quests.map((q) => ({ q, s: q.summary(store.get(q.id)), locked: !!q.locked?.(store.get(q.id)) }));
  const open = cards.filter((c) => !c.locked);
  const closed = cards.filter((c) => c.locked);
  const doneToday = open.filter(({ s }) => s.today >= s.goal).length;

  root.innerHTML = `
    <header class="masthead">
      <h1 class="wordmark"><img class="mark" src="icons/gem.png" alt="" width="140" height="200">SideQuest</h1>
      <p class="tagline">Le quest fuori dalla strada maestra</p>
    </header>

    <section class="hud" aria-label="Il tuo livello">
      <div class="seal" aria-hidden="true"><span>${pl.level}</span></div>
      <div class="hud-body">
        <p class="hud-rank">${pl.rank}</p>
        <div class="xp" role="progressbar" aria-label="Esperienza verso il livello ${pl.level + 1}" aria-valuemin="0" aria-valuemax="${pl.need}" aria-valuenow="${pl.into}">
          <span style="width:${(pl.into / pl.need) * 100}%"></span>
        </div>
        <p class="hud-meta"><span>Liv. ${pl.level}</span><span>${pl.into} / ${pl.need} XP</span></p>
      </div>
    </section>

    <section class="board">
      <h2 class="rule-title"><span>Side quest attive</span></h2>
      <p class="board-meta">${doneToday} di ${open.length} completate oggi</p>
      <ul class="quests">${open.map(questCard).join('')}</ul>
    </section>
${closed.length ? `
    <section class="board">
      <h2 class="rule-title"><span>Da sbloccare</span></h2>
      <ul class="quests">${closed.map(questCard).join('')}</ul>
    </section>
` : ''}
    <p class="sync" data-el="sync" data-state="${store.status().state}">${esc(store.status().text)}</p>
    <dialog class="unlockw" data-el="unlockw" aria-labelledby="uw-name">
      <form method="dialog" class="uw" data-sq="30">
        <p class="uw-k">Sblocca mondo</p>
        <h2 class="uw-name" id="uw-name"></h2>
        <q class="uw-q"></q>
        <p class="uw-t"></p>
        <div class="uw-b">
          <button class="uw-no" data-sq="20" value="no">Non ancora</button>
          <button class="uw-yes" data-sq="20" value="yes" type="button">Sì, sblocca</button>
        </div>
      </form>
    </dialog>`;

  const dlg = root.querySelector('[data-el=unlockw]');
  root.querySelectorAll('[data-unlock]').forEach((el) => {
    el.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      el.click();
    });
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const q = quests.find((x) => x.id === el.dataset.unlock);
      dlg.querySelector('.uw-name').innerHTML = q.world.name;
      dlg.querySelector('.uw-q').textContent = q.unlock?.quote || '';
      dlg.querySelector('.uw-t').textContent = q.unlock?.text || '';
      const yes = dlg.querySelector('.uw-yes');
      yes.dataset.go = `/quest/${q.id}`;
      yes.onclick = () => {
        // Opens the world; the click then reaches the router (data-go) and enters it.
        store.set(q.id, { ...(store.get(q.id) || {}), unlocked: new Date().toISOString() });
        dlg.close();
      };
      dlg.showModal();
    });
  });

  return applySquircles(root);
}

function questCard({ q, s, locked }) {
  if (locked) return lockedCard(q);
  const done = s.today >= s.goal;
  return `
    <li>
      <a class="quest w-${q.id} ${done ? 'is-done' : ''}" href="#${q.id}" data-go="/quest/${q.id}" data-sq="28" aria-label="${esc(q.title)}">
        <span class="quest-icon" data-sq="16">${done ? icon.check : q.icon}</span>
        <span class="quest-text">
          <span class="quest-kicker">${esc(q.world.kicker)}</span>
          <span class="quest-title">${q.world.name}</span>
          <span class="quest-detail">${esc(s.detail)}</span>
        </span>
        <span class="quest-stats">
          <span class="pips" aria-label="${s.today} di ${s.goal} oggi">${pips(s.today, s.goal)}</span>
          <span class="streak ${s.streak ? '' : 'is-zero'}" aria-label="Serie di ${s.streak} notti">${icon.flame}${s.streak}</span>
        </span>
        <span class="chev">${icon.chev}</span>
      </a>
    </li>`;
}

// A closed world: the card shows the quest in grey under a lock; the card and
// the lock both ask whether to open it.
function lockedCard(q) {
  return `
    <li>
      <div class="quest w-${q.id} is-locked" data-sq="28" data-unlock="${q.id}" role="button" tabindex="0" aria-label="${esc(q.title)}: mondo chiuso, tocca per sbloccarlo">
        <span class="quest-icon" data-sq="16">${q.icon}</span>
        <span class="quest-text">
          <span class="quest-kicker">${esc(q.world.kicker)}</span>
          <span class="quest-title">${q.world.name}</span>
          <span class="quest-detail">${esc(q.unlock?.status || 'Mondo chiuso')}</span>
        </span>
        <span class="lock" data-sq="18" aria-hidden="true">${icon.lock}</span>
      </div>
    </li>`;
}
