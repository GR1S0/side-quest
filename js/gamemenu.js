// The game menu inside a world: a bar that rises from the bottom when the
// player scrolls up, and leaves when they scroll down or stop for a moment.
// Each world keeps its own "‹ SideQuest" at the top of its page; this one
// reaches the map from anywhere without scrolling back up. It lives in the
// shell (outside the world's shadow root), so it looks the same in every world.
import { applySquircles } from './squircle.js';
import { icon } from './icons.js';

const IDLE = 2600; // ms the bar stays after the last scroll up
const TOP = 90; // px from the top where the world's own bar is still in view
const STEP = 6; // px of scroll that count as a direction

export function gameMenu(quest) {
  const bar = document.createElement('nav');
  bar.className = 'gmenu';
  bar.setAttribute('aria-label', 'Menu di gioco');
  bar.innerHTML = `
    <div class="gm w-${quest.id}" data-sq="22">
      <a class="gm-home" href="#" data-go="/"><span class="gm-chev">${icon.chev}</span><img src="icons/gem.png" alt="" width="14" height="20">Mappa</a>
      <span class="gm-world">${quest.world.name}</span>
      <button class="gm-top" type="button" aria-label="Torna all'inizio del mondo">${icon.chev}</button>
    </div>`;
  document.body.append(bar);
  const offSq = applySquircles(bar);

  let lastY = window.scrollY;
  let timer = 0;
  let held = false; // a finger or the pointer on the bar keeps it open
  let jumping = false; // the scroll back to the top doesn't call the bar again
  const show = () => {
    bar.classList.add('is-on');
    clearTimeout(timer);
    timer = setTimeout(() => !held && hide(), IDLE);
  };
  const hide = () => {
    clearTimeout(timer);
    bar.classList.remove('is-on');
  };

  const onScroll = () => {
    const y = window.scrollY;
    const dy = y - lastY;
    if (Math.abs(dy) < STEP) return;
    lastY = y;
    if (jumping) { if (y < TOP) jumping = false; return; }
    if (y < TOP) hide();
    else if (dy < 0) show();
    else if (!held) hide();
  };
  const hold = () => { held = true; clearTimeout(timer); };
  const release = () => { held = false; if (bar.classList.contains('is-on')) show(); };

  window.addEventListener('scroll', onScroll, { passive: true });
  bar.addEventListener('pointerenter', hold);
  bar.addEventListener('pointerleave', release);
  bar.addEventListener('touchstart', hold, { passive: true });
  bar.addEventListener('touchend', release);
  bar.addEventListener('focusin', hold);
  bar.addEventListener('focusout', release);
  bar.querySelector('.gm-top').addEventListener('click', () => {
    hide();
    jumping = true;
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });

  return () => {
    clearTimeout(timer);
    window.removeEventListener('scroll', onScroll);
    offSq();
    bar.remove();
  };
}
