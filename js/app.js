// In-page router: claude.ai doesn't pass path-style hashes to the page, so
// navigation lives in memory. Routes: "/" (home) and "/quest/<id>".
// A link to the page with #<quest id> opens that quest directly.
import { quests, getQuest } from '../quests/index.js';
import { initStore } from './store.js';
import { homeView } from './home.js';
import { setupView } from './setup.js';

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
const mode = await initStore(quests.map((q) => q.id));
const start = location.hash.slice(1);
if (mode === 'setup') setupView(root);
else go(getQuest(start) ? `/quest/${start}` : '/');
