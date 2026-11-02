export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Ranks along the way, one per level; past the last, you stay a Leggenda.
const RANKS = ['Novizio', 'Viandante', 'Esploratore', 'Cercatore', 'Ramingo', 'Custode', 'Cavaliere', 'Maestro', 'Leggenda'];

// Level 1→2 costs 100 XP, 2→3 costs 200, and so on.
export function playerLevel(xp) {
  let level = 1;
  let floor = 0;
  while (xp >= floor + level * 100) {
    floor += level * 100;
    level++;
  }
  return { level, rank: RANKS[Math.min(level, RANKS.length) - 1], into: xp - floor, need: level * 100 };
}

export const pips = (done, goal) =>
  Array.from({ length: goal }, (_, i) => `<i class="${i < done ? 'on' : ''}"></i>`).join('');
