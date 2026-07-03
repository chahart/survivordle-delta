const fs = require("fs");

const BB_START_DATE = new Date(2026, 6, 9);
const BB_SHUFFLE_SEED = 20260709;
const houseguests = JSON.parse(fs.readFileSync("./public/bb_contestants.json", "utf8"));

function mulberry32(seed) {
  return function() {
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

function getPuzzleNumber() {
  const etDateStr = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const [y, m, d] = etDateStr.split("-").map(Number);
  const todayUTC = Date.UTC(y, m - 1, d);
  const startUTC = Date.UTC(BB_START_DATE.getFullYear(), BB_START_DATE.getMonth(), BB_START_DATE.getDate());
  return Math.floor((todayUTC - startUTC) / 86400000) + 1;
}

const shuffled = seededShuffle(houseguests, BB_SHUFFLE_SEED);
const todayPuzzleNum = getPuzzleNumber();

// Only past puzzles — spoiler safe
const usedIDs = Array.from({ length: Math.max(todayPuzzleNum - 1, 0) }, (_, i) => shuffled[i % shuffled.length].id);
console.log(JSON.stringify(usedIDs));
