// In-page router: claude.ai doesn't pass path-style hashes to the page, so
// navigation lives in memory. Routes: "/" (home) and "/quest/<id>".
// A link to the page with #<quest id> opens that quest directly.
import { quests, getQuest } from '../quests/index.js';
import { initStore } from './store.js';
import { homeView } from './home.js';
import { unlockView } from './unlock.js';

const root = document.getElementById('app');
let cleanup = null;

function go(path) {
  cleanup?.();
  cleanup = null;
  root.className = '';
  root.innerHTML = '';
  window.scrollTo(0, 0);
  const [, section, id] = path.split('/');
  const quest = section === 'quest' && getQuest(id);
  cleanup = (quest ? quest.view(root) : homeView(root)) || null;
}

// composedPath reaches links inside a quest's shadow root.
document.addEventListener('click', (e) => {
  const link = e.composedPath().find((n) => n instanceof Element && n.dataset.go !== undefined);
  if (!link) return;
  e.preventDefault();
  go(link.dataset.go);
});

document.head.append(Object.assign(document.createElement('style'), { textContent: quests.map((q) => q.world.css).join('\n') }));
root.innerHTML = '<p class="loading">Apro la mappa…</p>';
// The installed app opens with its code first (unlock.js), then loads the data.
async function start() {
  const mode = await initStore(quests.map((q) => q.id));
  const first = location.hash.slice(1);
  if (mode === 'setup') unlockView(root, { onUnlock: start });
  else go(getQuest(first) ? `/quest/${first}` : '/');
}
start();
