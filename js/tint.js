// The phone's status bar (time, battery, notifications) in the world's colour.
// iPhone, installed app: the status bar is see-through (black-translucent), so
// it shows the page's own background: the world paints only its shadow root,
// so the page underneath gets the world's colour too.
// Android, Mac Chrome and Safari read <meta name="theme-color">.
// The colour is read from the world's page once it has drawn (pages from the
// private repository arrive a moment later), and again when light/dark changes.
const meta = () => {
  let m = document.querySelector('meta[name="theme-color"]');
  if (!m) m = Object.assign(document.createElement('meta'), { name: 'theme-color' });
  if (!m.isConnected) document.head.append(m);
  return m;
};

// The world's background at the top of its page: the first element under the
// top edge with a colour of its own (its --bg token if it has one, since a
// background can be a gradient).
function worldColor(root) {
  const host = root.firstElementChild;
  const sr = host?.shadowRoot;
  if (!sr) return null;
  const y = Math.max(2, host.getBoundingClientRect().top + 2);
  let el = sr.elementFromPoint?.(innerWidth / 2, y);
  for (; el && el !== host; el = el.parentElement || el.getRootNode().host) {
    const cs = getComputedStyle(el);
    const token = cs.getPropertyValue('--bg').trim();
    if (token) return token;
    const bg = cs.backgroundColor;
    if (bg && bg !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(bg)) return bg;
  }
  return null;
}

export function tintWorld(root) {
  const m = meta();
  const before = m.content;
  const html = document.documentElement;
  const apply = () => {
    const c = worldColor(root);
    if (!c) return;
    html.style.background = c;
    m.content = c;
  };
  const timers = [0, 250, 900, 2500].map((ms) => setTimeout(apply, ms));
  const mq = matchMedia('(prefers-color-scheme: dark)');
  const onScheme = () => setTimeout(apply, 50);
  mq.addEventListener('change', onScheme);
  return () => {
    timers.forEach(clearTimeout);
    mq.removeEventListener('change', onScheme);
    html.style.background = '';
    if (before) m.content = before;
    else m.remove();
  };
}
