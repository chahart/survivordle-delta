import bbRecallPuzzleHistory from "./bbRecallPuzzleHistory.json";

export const BB_RECALL_START_DATE = new Date(2026, 6, 9); // Jul 9 2026 = puzzle #1
export const BB_RECALL_SHUFFLE_SEED = 20260710;

export function scoreSeason(guess, answer) {
  return Math.max(0, 40 - Math.abs(guess - answer) * 4);
}

export function scorePlacement(guess, answer) {
  return Math.max(0, 40 - Math.abs(guess - answer) * 4);
}

export function scoreAge(guess, answer) {
  const diff = Math.abs(guess - answer);
  if (diff <= 3)  return 12;
  if (diff <= 5)  return 8;
  if (diff <= 10) return 4;
  return 0;
}

export function scoreCompWins(guess, answer) {
  const diff = Math.abs(guess - answer);
  if (diff <= 1)  return 8;
  if (diff <= 2)  return 4;
  return 0;
}

export function getGrade(score) {
  if (score === 100) return "A+";
  if (score >= 93)   return "A";
  if (score >= 90)   return "A-";
  if (score >= 87)   return "B+";
  if (score >= 83)   return "B";
  if (score >= 80)   return "B-";
  if (score >= 77)   return "C+";
  if (score >= 73)   return "C";
  if (score >= 70)   return "C-";
  if (score >= 67)   return "D+";
  if (score >= 63)   return "D";
  if (score >= 60)   return "D-";
  return "F";
}

export function buildStintMap(houseguests) {
  const grouped = {};
  for (const c of houseguests) {
    if (!grouped[c.houseguest_id]) grouped[c.houseguest_id] = [];
    grouped[c.houseguest_id].push(c);
  }
  for (const id in grouped) {
    grouped[id].sort((a, b) => a.season - b.season);
  }
  const stintMap = {};
  for (const id in grouped) {
    grouped[id].forEach((c, idx) => {
      const labels = ["First Appearance", "Second Appearance", "Third Appearance", "Fourth Appearance", "Fifth Appearance"];
      stintMap[c.id] = c.returnee ? (labels[idx] || `Appearance ${idx + 1}`) : null;
    });
  }
  return stintMap;
}

export function pickRandom(pool, seenIds) {
  const available = pool.filter(c => !seenIds.has(c.id));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
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

export function getBBRecallPuzzleNumber() {
  const etDateStr = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const [y, m, d] = etDateStr.split("-").map(Number);
  const todayUTC = Date.UTC(y, m - 1, d);
  const startUTC = Date.UTC(BB_RECALL_START_DATE.getFullYear(), BB_RECALL_START_DATE.getMonth(), BB_RECALL_START_DATE.getDate());
  return Math.floor((todayUTC - startUTC) / 86400000) + 1;
}

export function getBBRecallAnswerForPuzzle(houseguests, puzzleNum) {
  // Past puzzles — locked in, immune to roster changes
  if (puzzleNum >= 1 && puzzleNum - 1 < bbRecallPuzzleHistory.length) {
    const id = bbRecallPuzzleHistory[puzzleNum - 1];
    return houseguests.find(c => c.id === id);
  }

  // Future puzzles — shuffle only unused houseguests
  const usedSet = new Set(bbRecallPuzzleHistory);
  const remaining = houseguests.filter(c => !usedSet.has(c.id));
  const shuffled = seededShuffle(remaining, BB_RECALL_SHUFFLE_SEED);
  // Positive modulo so pre-launch (puzzleNum <= 0) days still resolve to an answer
  const len = shuffled.length;
  const idx = (((puzzleNum - 1 - bbRecallPuzzleHistory.length) % len) + len) % len;
  return shuffled[idx];
}

export function getBBRecallDailyAnswer(houseguests) {
  return getBBRecallAnswerForPuzzle(houseguests, getBBRecallPuzzleNumber());
}

export function getDateForBBRecallPuzzle(puzzleNum) {
  const d = new Date(BB_RECALL_START_DATE);
  d.setDate(BB_RECALL_START_DATE.getDate() + puzzleNum - 1);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Past puzzle numbers, most recent first (empty if puzzleNum <= 1)
export function getPastBBRecallPuzzleNumbers() {
  const puzzleNum = getBBRecallPuzzleNumber();
  return Array.from({ length: Math.max(puzzleNum - 1, 0) }, (_, i) => puzzleNum - 1 - i);
}

const GPA_SCALE = {
  "A+": 4.0, "A": 4.0, "A-": 3.66,
  "B+": 3.33, "B": 3.0, "B-": 2.66,
  "C+": 2.33, "C": 2.0, "C-": 1.66,
  "D+": 1.33, "D": 1.0, "D-": 0.66,
  "F": 0.0,
};

export function computeGPA(grades) {
  const valid = grades.filter(g => g != null && GPA_SCALE[g] !== undefined);
  if (!valid.length) return null;
  const sum = valid.reduce((acc, g) => acc + GPA_SCALE[g], 0);
  return (sum / valid.length).toFixed(1);
}

export function computeGradeDist(grades) {
  const dist = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  for (const g of grades) {
    if (!g) continue;
    if (g.startsWith("A")) dist.A++;
    else if (g.startsWith("B")) dist.B++;
    else if (g.startsWith("C")) dist.C++;
    else if (g.startsWith("D")) dist.D++;
    else dist.F++;
  }
  return dist;
}
