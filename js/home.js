import { quests } from '../quests/index.js';
import { store } from './store.js';
import { esc, playerLevel, pips } from './util.js';
import { icon } from './icons.js';
import { applySquircles } from './squircle.js';

export function homeView(root) {
  const totalXP = quests.reduce((sum, q) => sum + q.xp(store.get(q.id)), 0);
  const pl = playerLevel(totalXP);
  const cards = quests.map((q) => ({ q, s: q.summary(store.get(q.id)) }));
  const doneToday = cards.filter(({ s }) => s.today >= s.goal).length;

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
      <p class="board-meta">${doneToday} di ${quests.length} completate oggi</p>
      <ul class="quests">${cards.map(questCard).join('')}</ul>
    </section>

    <footer class="foot">
      <p class="sync" data-el="sync" data-state="${store.status().state}">${esc(store.status().text)}</p>
      <details class="install">
        <summary>Tienila a portata di mano</summary>
        <p><strong>iPhone</strong>: apri questa pagina in Safari, Condividi, “Aggiungi alla schermata Home”.</p>
        <p><strong>Mac</strong>: in Chrome, menu ⋮, Trasmetti, salva e condividi, “Installa pagina come app”.</p>
      </details>
      ${store.mode() === 'github' ? '<button class="unlink" type="button" data-act="unlink">Scollega questo dispositivo dai dati</button>' : ''}
    </footer>`;

  const offSquircles = applySquircles(root);
  const sync = root.querySelector('[data-el=sync]');
  const offStatus = store.onStatus((s) => {
    sync.dataset.state = s.state;
    sync.textContent = s.text;
  });
  const offRemote = store.onRemote(() => homeView(root));
  root.querySelector('[data-act=unlink]')?.addEventListener('click', (e) => {
    const btn = e.currentTarget;
    if (btn.dataset.confirm !== '1') {
      btn.dataset.confirm = '1';
      btn.textContent = 'Tocca di nuovo per scollegare (i dati restano su GitHub)';
      return;
    }
    localStorage.removeItem('sq-gh');
    localStorage.removeItem('sq-gh-cache');
    location.reload();
  });
  return () => {
    offSquircles();
    offStatus();
    offRemote();
  };
}

function questCard({ q, s }) {
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
