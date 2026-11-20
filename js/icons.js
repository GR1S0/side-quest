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
  // Grip (Presa del toro): a black bull's head, horns, ears and muzzle.
  bull: svg('<path d="M2.8 3.5c.2 3.4 2.1 5.4 5 5.7"/><path d="M21.2 3.5c-.2 3.4-2.1 5.4-5 5.7"/><path d="M7.4 8.8h9.2l-.9 6.8c-.4 2.6-2 4.4-3.7 4.4s-3.3-1.8-3.7-4.4Z" fill="currentColor" fill-opacity=".2"/><path d="M7.6 10.4 4.8 12M16.4 10.4l2.8 1.6"/><path d="M10.4 17.2h.01M13.6 17.2h.01" stroke-width="2.4"/>'),
  // A closed world on the home.
  lock: svg('<rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5" fill="currentColor" fill-opacity=".18"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><path d="M12 14.5v2.6"/>'),
  // Left foot (Tornare a correre): a footprint.
  footprint: svg('<path d="M9 10.6c0-1.7 1.6-2.7 3.6-2.7 2.4 0 4 1.5 3.9 4.1-.1 2-1.2 3.3-1.3 5.2-.1 1.6.6 2.5.3 3.5-.4 1.3-1.7 1.9-3 1.7-1.6-.3-2.4-1.6-2.4-3.3 0-1.9.6-3 .2-4.6-.4-1.5-1.3-2.3-1.3-3.9Z" fill="currentColor" fill-opacity=".2"/><circle cx="15.4" cy="4.6" r="1.5"/><circle cx="12.3" cy="3.6" r="1"/><circle cx="9.8" cy="4.3" r=".85"/><circle cx="7.8" cy="5.8" r=".75"/><circle cx="6.6" cy="7.9" r=".65"/>'),
};
