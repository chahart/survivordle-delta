// Pre-generates the static daily schedule for Sandwich mode.
// Usage: node sandwichSchedule.cjs
//
// Writes src/shared/sandwichSchedule.json — an ordered list of contestant ids.
// Puzzle #N uses puzzles[N-1]. The JSON file is the source of truth: if it
// already exists, its order is preserved and only newly-eligible ids are
// appended, so future contestants.json updates never change past puzzles.

const fs = require("fs");
const path = require("path");

const SEED = 20260612;
const START_DATE = "2026-06-12";
const EXCLUDED_SEASONS = new Set([7, 22, 23, 27, 38, 40]);

const CONTESTANTS_PATH = path.join(__dirname, "public", "contestants.json");
const OUT_PATH = path.join(__dirname, "src", "shared", "sandwichSchedule.json");

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

const norm = s => (s || "").toLowerCase().trim();
const pairKey = c => `${norm(c.placedBefore)}|${norm(c.placedAfter)}`;
const placeKey = c => `${c.season}|${c.placement}`;

const contestants = JSON.parse(fs.readFileSync(CONTESTANTS_PATH, "utf8"));

// Count (placedBefore, placedAfter) pairs across the FULL dataset — a puzzle
// is only usable if its name pair points to exactly one castaway.
const pairCounts = {};
for (const c of contestants) {
  if (!c.placedBefore || !c.placedAfter) continue;
  pairCounts[pairKey(c)] = (pairCounts[pairKey(c)] || 0) + 1;
}

// Count how many castaways share a given (season, placement) — e.g. ties for
// 2nd place in a final 3. Ambiguous on both ends: a tied castaway is itself
// an ambiguous answer (multiple correct answers to the same clue), and any
// castaway whose neighbor name corresponds to a tied placement has an
// ambiguous clue (the neighbor's real placement could be either tied person).
const placeCounts = {};
for (const c of contestants) {
  placeCounts[placeKey(c)] = (placeCounts[placeKey(c)] || 0) + 1;
}
const tiedNames = new Set();
for (const c of contestants) {
  if (placeCounts[placeKey(c)] > 1) tiedNames.add(`${c.season}|${norm(c.name)}`);
}

const eligible = contestants.filter(c =>
  c.placedBefore && c.placedAfter &&
  !EXCLUDED_SEASONS.has(c.season) &&
  pairCounts[pairKey(c)] === 1 &&
  placeCounts[placeKey(c)] === 1 &&
  !tiedNames.has(`${c.season}|${norm(c.placedBefore)}`) &&
  !tiedNames.has(`${c.season}|${norm(c.placedAfter)}`)
);

// Preserve the existing schedule — past puzzles are locked in.
// Any previously-scheduled id that's no longer eligible (e.g. found to be
// ambiguous after the fact) is dropped from the order, not just left in place.
const eligibleIds = new Set(eligible.map(c => c.id));
let existing = [];
if (fs.existsSync(OUT_PATH)) {
  try { existing = JSON.parse(fs.readFileSync(OUT_PATH, "utf8")).puzzles || []; }
  catch { existing = []; }
}
existing = existing.filter(id => eligibleIds.has(id));
const existingSet = new Set(existing);
const fresh = seededShuffle(eligible.map(c => c.id), SEED).filter(id => !existingSet.has(id));
const puzzles = [...existing, ...fresh];

const json = `{\n  "startDate": "${START_DATE}",\n  "puzzles": [\n${puzzles.map(id => `    "${id}"`).join(",\n")}\n  ]\n}\n`;
fs.writeFileSync(OUT_PATH, json);

console.log(`Eligible puzzles: ${eligible.length} (of ${contestants.length} rows)`);
console.log(`Kept ${existing.length} existing, appended ${fresh.length} new → ${puzzles.length} total`);
console.log(`Wrote ${OUT_PATH}`);
