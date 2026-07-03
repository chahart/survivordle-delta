import bbSandwichSchedule from "./bbSandwichSchedule.json";

export const BB_SANDWICH_MAX_GUESSES = 4;
export const BB_SANDWICH_SHUFFLE_SEED = 20260711;

const [SY, SM, SD] = bbSandwichSchedule.startDate.split("-").map(Number);
export const BB_SANDWICH_START_DATE = new Date(SY, SM - 1, SD);

const norm = s => (s || "").toLowerCase().trim();
const pairKey = c => `${norm(c.placedBefore)}|${norm(c.placedAfter)}`;

// Unlimited pool: any houseguest with both neighbors whose (placedBefore, placedAfter)
// name pair is unambiguous (only one houseguest in the dataset shares that exact pair).
export function getBBSandwichUnlimitedPool(houseguests) {
  const pairCounts = {};
  for (const c of houseguests) {
    if (!c.placedBefore || !c.placedAfter) continue;
    pairCounts[pairKey(c)] = (pairCounts[pairKey(c)] || 0) + 1;
  }
  return houseguests.filter(c =>
    c.placedBefore && c.placedAfter && pairCounts[pairKey(c)] === 1
  );
}

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function seededShuffle(arr, seed) {
  const a = [...arr];
  const rand = mulberry32(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getBBSandwichPuzzleNumber() {
  const etDateStr = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const [y, m, d] = etDateStr.split("-").map(Number);
  const todayUTC = Date.UTC(y, m - 1, d);
  const startUTC = Date.UTC(SY, SM - 1, SD);
  return Math.floor((todayUTC - startUTC) / 86400000) + 1;
}

export function getBBSandwichAnswerForPuzzle(houseguests, puzzleNum) {
  // Past puzzles — locked in, immune to roster changes
  if (puzzleNum >= 1 && puzzleNum - 1 < bbSandwichSchedule.puzzles.length) {
    const id = bbSandwichSchedule.puzzles[puzzleNum - 1];
    return houseguests.find(c => c.id === id);
  }

  // Future/unlisted puzzles — shuffle the unambiguous-pair pool
  const pool = getBBSandwichUnlimitedPool(houseguests);
  const usedSet = new Set(bbSandwichSchedule.puzzles);
  const remaining = pool.filter(c => !usedSet.has(c.id));
  const shuffled = seededShuffle(remaining.length ? remaining : pool, BB_SANDWICH_SHUFFLE_SEED);
  const len = shuffled.length;
  const idx = (((puzzleNum - 1 - bbSandwichSchedule.puzzles.length) % len) + len) % len;
  return shuffled[idx];
}

export function getDailyBBSandwichAnswer(houseguests) {
  return getBBSandwichAnswerForPuzzle(houseguests, getBBSandwichPuzzleNumber());
}

export function getDateForBBSandwichPuzzle(puzzleNum) {
  const d = new Date(BB_SANDWICH_START_DATE);
  d.setDate(BB_SANDWICH_START_DATE.getDate() + puzzleNum - 1);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function getRandomBBSandwichAnswer(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildDisplayName(houseguest) {
  const { name, showName } = houseguest;
  if (!showName || name.toLowerCase().includes(showName.toLowerCase())) return name;
  const spaceIdx = name.indexOf(" ");
  if (spaceIdx === -1) return `${name} "${showName}"`;
  return `${name.slice(0, spaceIdx)} "${showName}" ${name.slice(spaceIdx + 1)}`;
}

// Actual placements of the answer's neighbors, looked up by name within the
// same season; falls back to ±1 if the neighbor row isn't in the dataset.
export function getBBNeighborPlacements(houseguests, answer) {
  const before = houseguests.find(c => c.season === answer.season && norm(c.name) === norm(answer.placedBefore));
  const after  = houseguests.find(c => c.season === answer.season && norm(c.name) === norm(answer.placedAfter));
  return {
    before:         before?.placement ?? answer.placement - 1,
    after:          after?.placement  ?? answer.placement + 1,
    beforeShowName: before ? buildDisplayName(before) : answer.placedBefore,
    afterShowName:  after  ? buildDisplayName(after)  : answer.placedAfter,
  };
}
