import sandwichSchedule from "./sandwichSchedule.json";

export const SANDWICH_MAX_GUESSES = 4;
export const SANDWICH_EXCLUDED_SEASONS = new Set([7, 22, 23, 27, 38, 40]);

// Fixed start date — must match startDate in sandwichSchedule.json
const [SY, SM, SD] = sandwichSchedule.startDate.split("-").map(Number);
export const SANDWICH_START_DATE = new Date(SY, SM - 1, SD);

export function getSandwichPuzzleNumber() {
  const etDateStr = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const [y, m, d] = etDateStr.split("-").map(Number);
  const todayUTC = Date.UTC(y, m - 1, d);
  const startUTC = Date.UTC(SY, SM - 1, SD);
  return Math.floor((todayUTC - startUTC) / 86400000) + 1;
}

export function getSandwichAnswerForPuzzle(contestants, puzzleNum) {
  const idx = (puzzleNum - 1) % sandwichSchedule.puzzles.length;
  const id = sandwichSchedule.puzzles[idx];
  return contestants.find(c => c.id === id);
}

export function getDailySandwichAnswer(contestants) {
  return getSandwichAnswerForPuzzle(contestants, getSandwichPuzzleNumber());
}

export function getDateForSandwichPuzzle(puzzleNum) {
  const d = new Date(SANDWICH_START_DATE);
  d.setDate(SANDWICH_START_DATE.getDate() + puzzleNum - 1);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const norm = s => (s || "").toLowerCase().trim();
const pairKey = c => `${norm(c.placedBefore)}|${norm(c.placedAfter)}`;

// Unlimited pool: any castaway with both neighbors whose (placedBefore, placedAfter)
// name pair is unambiguous. Includes the seasons excluded from the daily pool.
export function getSandwichUnlimitedPool(contestants) {
  const pairCounts = {};
  for (const c of contestants) {
    if (!c.placedBefore || !c.placedAfter) continue;
    pairCounts[pairKey(c)] = (pairCounts[pairKey(c)] || 0) + 1;
  }
  return contestants.filter(c =>
    c.placedBefore && c.placedAfter && pairCounts[pairKey(c)] === 1
  );
}

export function getRandomSandwichAnswer(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildDisplayName(castaway) {
  const { name, showName } = castaway;
  if (!showName || name.toLowerCase().includes(showName.toLowerCase())) return name;
  const spaceIdx = name.indexOf(" ");
  if (spaceIdx === -1) return `${name} "${showName}"`;
  return `${name.slice(0, spaceIdx)} "${showName}" ${name.slice(spaceIdx + 1)}`;
}

// Actual placements of the answer's neighbors, looked up by name within the
// same season; falls back to ±1 if the neighbor row isn't in the dataset.
export function getNeighborPlacements(contestants, answer) {
  const before = contestants.find(c => c.season === answer.season && norm(c.name) === norm(answer.placedBefore));
  const after  = contestants.find(c => c.season === answer.season && norm(c.name) === norm(answer.placedAfter));
  return {
    before:         before?.placement ?? answer.placement - 1,
    after:          after?.placement  ?? answer.placement + 1,
    beforeShowName: before ? buildDisplayName(before) : answer.placedBefore,
    afterShowName:  after  ? buildDisplayName(after)  : answer.placedAfter,
  };
}
