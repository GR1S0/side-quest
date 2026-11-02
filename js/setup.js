// First launch of the installed app on a device: link it to the private data
// repository. The token is typed by the user and stays in this browser only.
import { saveGhConfig } from './github.js';
import { applySquircles } from './squircle.js';

const DEFAULT_REPO = 'GR1S0/side-quest-data';

export function setupView(root, { error } = {}) {
  root.innerHTML = `
    <header class="masthead">
      <h1 class="wordmark"><img class="mark" src="icons/gem.png" alt="" width="140" height="200">SideQuest</h1>
      <p class="tagline">Le quest fuori dalla strada maestra</p>
    </header>
    <form class="setup" data-sq="28" autocomplete="off">
      <h2>Collega i dati</h2>
      <p class="setup-lead">${error || 'Per avere le stesse quest su telefono e Mac, collega il repository privato dove stanno i tuoi dati. Serve una volta per dispositivo.'}</p>
      <label for="gh-repo">Repository</label>
      <input id="gh-repo" type="text" spellcheck="false" value="${DEFAULT_REPO}">
      <label for="gh-token">Chiave GitHub (token)</label>
      <input id="gh-token" type="password" spellcheck="false" placeholder="github_pat_…">
      <button class="setup-btn" type="submit" data-sq="16">Collega</button>
      <p class="setup-note">La chiave resta solo su questo dispositivo.</p>
    </form>`;

  applySquircles(root);
  root.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const repo = root.querySelector('#gh-repo').value.trim();
    const token = root.querySelector('#gh-token').value.trim();
    if (!repo || !token) return;
    saveGhConfig(repo, token);
    location.reload();
  });
}
