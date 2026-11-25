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

// Days in a row with the quest done, forgiving an empty day between two done
// ones: the empty day does not count, two empty days in a row break the series.
// Today still open is never a miss.
// done(day) says whether that day counts; add(day, n) moves a day key by n.
// risk: yesterday was empty and today is not done yet, so today decides.
export function streakOf(done, today, add) {
  let d = done(today) ? today : add(today, -1);
  let streak = 0;
  while (done(d) || done(add(d, -1))) {
    if (done(d)) streak++;
    d = add(d, -1);
  }
  const yesterday = add(today, -1);
  return { streak, risk: streak > 0 && !done(today) && !done(yesterday) };
}
