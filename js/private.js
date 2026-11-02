// Modules with personal content (a quest's own page) are not published with the
// installed app, whose code is public: there they come from the private data
// repository. On claude.ai and in local development they load from the project.
// Such modules must not import anything themselves.
import { store } from './store.js';
import { ghConfig, github } from './github.js';

export function loadPrivate(path) {
  if (store.mode() === 'github') return github(ghConfig()).loadModule(path);
  return import(new URL(`../${path}`, import.meta.url));
}
