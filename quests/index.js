// Quest registry. To add a side quest, create quests/<id>/index.js exporting
// { id, title, world, icon, summary(data), xp(data), view(root) }
// and list it here. Its data is the database document sq/<id>.
//
// Every quest is a world of its own. world = { css, kicker, name }: css defines
// the class .w-<id> with the --w-* tokens (faces and palette) its home card
// uses; name is the quest's own title, as markup.
// summary(data) → { today, goal, streak, detail } for the home card.
// xp(data) → experience earned so far, derived from the quest's own data.
// view(root) → optional cleanup function.
import pelvicFloor from './pelvic-floor/index.js';
import face from './face/index.js';

export const quests = [pelvicFloor, face];

export const getQuest = (id) => quests.find((q) => q.id === id);
