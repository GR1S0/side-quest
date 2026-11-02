// SideQuest outside claude.ai (the installed app on GitHub Pages): data lives in
// a private GitHub repository, one JSON file per quest (data/<id>.json), read and
// written with a personal token that stays on this device. The Pangram fonts live
// there too, because their licence doesn't allow a public page.
const CFG_KEY = 'sq-gh';
const API = 'https://api.github.com';

export function ghConfig() {
  try {
    return JSON.parse(localStorage.getItem(CFG_KEY)) || null;
  } catch {
    return null;
  }
}

export function saveGhConfig(repo, token) {
  localStorage.setItem(CFG_KEY, JSON.stringify({ repo, token }));
}

const fail = (code, status) => Object.assign(new Error(code), { code, status });
const b64enc = (str) => {
  const bytes = new TextEncoder().encode(str);
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};
const b64dec = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, '')), (c) => c.charCodeAt(0)));

export function github({ repo, token }) {
  async function gh(path, opt = {}) {
    let r;
    try {
      r = await fetch(`${API}/repos/${repo}/${path}`, {
        cache: 'no-store',
        ...opt,
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...opt.headers },
      });
    } catch {
      throw fail('offline');
    }
    if (r.status === 401 || r.status === 403) throw fail('auth', r.status);
    return r;
  }

  return {
    // { sha, data } — data is null when the file doesn't exist yet.
    async get(id) {
      const r = await gh(`contents/data/${id}.json`);
      if (r.status === 404) return { sha: null, data: null };
      if (!r.ok) throw fail('net', r.status);
      const j = await r.json();
      return { sha: j.sha, data: JSON.parse(b64dec(j.content)) };
    },

    // Returns the new sha. A stale sha means someone else wrote first: 'conflict'.
    async put(id, data, sha) {
      const body = { message: `sidequest: ${id}`, content: b64enc(JSON.stringify(data, null, 1)) };
      if (sha) body.sha = sha;
      const r = await gh(`contents/data/${id}.json`, { method: 'PUT', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
      if (r.status === 409 || r.status === 422) throw fail('conflict', r.status);
      if (!r.ok) throw fail('net', r.status);
      return (await r.json()).content.sha;
    },

    // Imports a module kept in the private repository (app/<path>), e.g. a quest's
    // own page. The device keeps the last copy, so it opens offline; a newer
    // version is fetched in the background and used from the next launch.
    async loadModule(path) {
      const cache = await caches.open('sq-private');
      const key = `app/${path}`;
      const fresh = (async () => {
        const r = await gh(`contents/app/${path}`, { headers: { Accept: 'application/vnd.github.raw' } });
        if (!r.ok) throw fail('net', r.status);
        const text = await r.text();
        await cache.put(key, new Response(text));
        return text;
      })();
      let text = await cache.match(key).then((r) => r?.text());
      if (text) fresh.catch(() => {});
      else text = await fresh;
      const url = URL.createObjectURL(new Blob([text], { type: 'text/javascript' }));
      try {
        return await import(url);
      } finally {
        URL.revokeObjectURL(url);
      }
    },

    // Registers the fonts listed in fonts/fonts.json, cached on the device after the first time.
    async loadFonts() {
      const cache = await caches.open('sq-fonts');
      let list = await cache.match('fonts.json').then((r) => r?.json());
      if (!list) {
        const r = await gh('contents/fonts/fonts.json');
        if (!r.ok) return;
        list = JSON.parse(b64dec((await r.json()).content));
        for (const f of list) {
          const b = await gh(`contents/fonts/${f.file}`, { headers: { Accept: 'application/vnd.github.raw' } });
          if (b.ok) await cache.put(f.file, new Response(await b.arrayBuffer()));
        }
        await cache.put('fonts.json', new Response(JSON.stringify(list)));
      }
      for (const f of list) {
        const buf = await cache.match(f.file).then((r) => r?.arrayBuffer());
        if (!buf) continue;
        const face = new FontFace(f.family, buf, { weight: f.weight, style: f.style || 'normal', display: 'swap' });
        await face.load();
        document.fonts.add(face);
      }
    },
  };
}
