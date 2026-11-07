const svg = (body, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${body}</svg>`;

export const icon = {
  check: svg('<path d="M20 6 9 17l-5-5"/>'),
  flame: svg('<path d="M12 2c1 3.5 5 6 5 11a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .3 1.5 1 2.5 2 3 0-3-.5-6 .5-9Z"/>', 'class="i-flame"'),
  chev: svg('<path d="m9 18 6-6-6-6"/>'),
  // Pelvic floor (Lasciare andare): the floor's "hammock" as a crescent moon
  // lying down for the evening, with a star.
  moonHammock: svg('<path d="M3.5 11.5a8.5 8.5 0 0 0 17 0 10.5 6.5 0 0 1-17 0Z" fill="currentColor" fill-opacity=".2"/><path d="M17.5 2.8l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7Z" fill="currentColor" stroke-width="1"/>'),
  // Face (Specchio d'acqua): a drop falling on still water.
  ripple: svg('<path d="M12 2.5c2.3 2.8 3.6 4.8 3.6 6.5a3.6 3.6 0 0 1-7.2 0c0-1.7 1.3-3.7 3.6-6.5Z" fill="currentColor" fill-opacity=".2"/><ellipse cx="12" cy="18.5" rx="9.5" ry="2.6"/><ellipse cx="12" cy="18.5" rx="4.5" ry="1.1" stroke-width="1.5"/>'),
};
