// Squircle corners — continuous curvature, like iOS icons — for every rounded
// box in SideQuest. CSS corner-shape isn't in Safari yet, so each box marked
// data-sq="<radius>" gets an SVG backdrop drawn with Figma's corner smoothing
// (after the figma-squircle algorithm, MIT) and redrawn when its size changes.
// The backdrop takes its look from CSS: --sq-fill, --sq-edge, --sq-edge-width
// and --sq-shadow (a filter), so state changes stay in the stylesheet.
const SMOOTHING = 0.6; // iOS-like
const NS = 'http://www.w3.org/2000/svg';
const rad = (deg) => (deg * Math.PI) / 180;

function corner(radius, budget) {
  let s = SMOOTHING;
  let p = (1 + s) * radius;
  s = Math.min(s, budget / radius - 1);
  p = Math.min(p, budget);
  const arcMeasure = 90 * (1 - s);
  const arc = Math.sin(rad(arcMeasure / 2)) * radius * Math.SQRT2;
  const alpha = (90 - arcMeasure) / 2;
  const p3p4 = radius * Math.tan(rad(alpha / 2));
  const beta = 45 * s;
  const c = p3p4 * Math.cos(rad(beta));
  const d = c * Math.tan(rad(beta));
  const b = (p - arc - c - d) / 3;
  const a = 2 * b;
  return { a, b, c, d, p, arc, r: radius };
}

export function squirclePath(w, h, radius) {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  if (!r) return `M0 0H${w}V${h}H0Z`;
  const { a, b, c, d, p, arc } = corner(r, Math.min(w, h) / 2);
  const f = (n) => +n.toFixed(2);
  const [A, B, C, D, ARC, R] = [a, b, c, d, arc, r].map(f);
  const ab = f(a + b), abc = f(a + b + c), bc = f(b + c);
  return [
    `M${f(w - p)} 0`,
    `c${A} 0 ${ab} 0 ${abc} ${D}`, `a${R} ${R} 0 0 1 ${ARC} ${ARC}`, `c${D} ${C} ${D} ${bc} ${D} ${abc}`,
    `L${w} ${f(h - p)}`,
    `c0 ${A} 0 ${ab} ${-D} ${abc}`, `a${R} ${R} 0 0 1 ${-ARC} ${ARC}`, `c${-C} ${D} ${-bc} ${D} ${-abc} ${D}`,
    `L${f(p)} ${h}`,
    `c${-A} 0 ${-ab} 0 ${-abc} ${-D}`, `a${R} ${R} 0 0 1 ${-ARC} ${-ARC}`, `c${-D} ${-C} ${-D} ${-bc} ${-D} ${-abc}`,
    `L0 ${f(p)}`,
    `c0 ${-A} 0 ${-ab} ${D} ${-abc}`, `a${R} ${R} 0 0 1 ${ARC} ${-ARC}`, `c${C} ${-D} ${bc} ${-D} ${abc} ${-D}`,
    'Z',
  ].join('');
}

function draw(el) {
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  if (!w || !h) return;
  const svg = el.querySelector(':scope > .sq');
  const edge = parseFloat(getComputedStyle(el).getPropertyValue('--sq-edge-width')) || 0;
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  // The edge is stroked on the path's centre line, so draw the path half an edge inside the box.
  const path = svg.firstChild;
  path.setAttribute('d', squirclePath(w - edge, h - edge, Number(el.dataset.sq) - edge / 2));
  path.setAttribute('transform', `translate(${edge / 2} ${edge / 2})`);
}

const observer = new ResizeObserver((entries) => entries.forEach((e) => draw(e.target)));

// ── Automatic squircles for pages SideQuest didn't write ──
// Quest pages copied as they are (e.g. Lasciare andare) style their boxes with
// plain border-radius. autoSquircle finds every rounded rectangle with a solid
// fill or edge, hides its own background and border, and draws the same colours
// as a squircle behind it. It follows the page as it re-renders and changes
// state. Circles, pills, gradients and form fields keep their shape.
const SKIP = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'IMG', 'VIDEO', 'CANVAS', 'IFRAME', 'OPTION']);
const RADIUS_SCALE = 1.3; // a squircle reads smaller than a circular corner of the same radius
const autoState = new WeakMap();

const autoResize = new ResizeObserver((entries) =>
  entries.forEach((e) => {
    const s = autoState.get(e.target);
    if (s) paint(e.target, s);
  })
);

function measure(el) {
  el.style.removeProperty('background-color');
  el.style.removeProperty('border-color');
  const cs = getComputedStyle(el);
  const r = cs.borderTopLeftRadius;
  if (!r || r.includes('%') || ![cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].every((x) => x === r)) return null;
  const radius = parseFloat(r);
  if (!radius || cs.backgroundImage !== 'none') return null;
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  if (w && h && radius >= Math.min(w, h) / 2 - 1) return null; // circle or pill
  const sides = ['Right', 'Bottom', 'Left'];
  const bw = parseFloat(cs.borderTopWidth) || 0;
  const uniformWidth = sides.every((s) => cs[`border${s}Width`] === cs.borderTopWidth);
  const edge = bw && uniformWidth && cs.borderTopStyle !== 'none' && sides.every((s) => cs[`border${s}Color`] === cs.borderTopColor) ? bw : 0;
  const bg = cs.backgroundColor;
  const fill = bg && bg !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(bg) ? bg : 'none';
  if (fill === 'none' && !edge) return null;
  if (bw && !uniformWidth) return null;
  return { radius: radius * RADIUS_SCALE, fill, edge, inset: uniformWidth ? bw : 0, stroke: edge ? cs.borderTopColor : 'none', dashed: edge && cs.borderTopStyle === 'dashed' };
}

function paint(el, s) {
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  if (!w || !h) return;
  s.svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  const path = s.svg.firstChild;
  path.setAttribute('d', squirclePath(w - s.edge, h - s.edge, s.radius - s.edge / 2));
  path.setAttribute('transform', `translate(${s.edge / 2} ${s.edge / 2})`);
}

function convert(el) {
  if (el instanceof SVGElement || SKIP.has(el.tagName)) return;
  const prev = autoState.get(el);
  const m = measure(el);
  if (!m) {
    if (prev) {
      prev.svg.remove();
      autoState.delete(el);
      autoResize.unobserve(el);
    }
    return;
  }
  const svg = prev?.svg || document.createElementNS(NS, 'svg');
  if (!prev) {
    svg.setAttribute('aria-hidden', 'true');
    svg.dataset.sqAuto = '';
    svg.append(document.createElementNS(NS, 'path'));
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.style.isolation = 'isolate';
    autoResize.observe(el);
  }
  // Absolute children start inside the border, so pull the backdrop out over it.
  svg.setAttribute('style', `position:absolute;top:${-m.inset}px;left:${-m.inset}px;width:calc(100% + ${2 * m.inset}px);height:calc(100% + ${2 * m.inset}px);z-index:-1;overflow:visible;pointer-events:none`);
  const path = svg.firstChild;
  path.setAttribute('fill', m.fill);
  path.setAttribute('stroke', m.stroke);
  path.setAttribute('stroke-width', m.edge);
  if (m.dashed) path.setAttribute('stroke-dasharray', `${m.edge * 3} ${m.edge * 2}`);
  else path.removeAttribute('stroke-dasharray');
  if (el.firstChild !== svg) el.prepend(svg);
  el.style.backgroundColor = 'transparent';
  el.style.borderColor = 'transparent';
  const state = { ...m, svg };
  autoState.set(el, state);
  paint(el, state);
}

const convertTree = (node) => {
  if (!(node instanceof Element) || node.dataset?.sqAuto !== undefined) return;
  convert(node);
  node.querySelectorAll('*').forEach((el) => !(el instanceof SVGElement) && convert(el));
};

// Squircles every rounded box inside root (a document fragment or shadow root)
// and keeps doing it as the page changes. Returns a cleanup function.
export function autoSquircle(root) {
  [...root.children].forEach(convertTree);
  const mo = new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'childList') r.addedNodes.forEach(convertTree);
      else if (r.target instanceof Element && r.target.dataset.sqAuto === undefined) convertTree(r.target);
    }
  });
  mo.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'open', 'hidden', 'aria-pressed', 'aria-checked'] });
  const theme = matchMedia('(prefers-color-scheme: dark)');
  const retheme = () => [...root.children].forEach(convertTree);
  theme.addEventListener('change', retheme);
  return () => {
    mo.disconnect();
    theme.removeEventListener('change', retheme);
  };
}

// Gives every [data-sq] box inside root its backdrop. Returns a cleanup function.
export function applySquircles(root) {
  const boxes = [...root.querySelectorAll('[data-sq]')];
  for (const el of boxes) {
    if (!el.querySelector(':scope > .sq')) {
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'sq');
      svg.setAttribute('aria-hidden', 'true');
      svg.append(document.createElementNS(NS, 'path'));
      el.prepend(svg);
    }
    draw(el);
    observer.observe(el);
  }
  return () => boxes.forEach((el) => observer.unobserve(el));
}
