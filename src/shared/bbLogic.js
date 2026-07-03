import bbPuzzleHistory from "./bbPuzzleHistory.json";

// Flip to true before the production launch deploy to show the countdown page
export const BB_PRELAUNCH = false;
export const BB_LAUNCH = new Date("2026-07-09T04:00:00Z"); // Wed Jul 8 11pm CT (UTC-5)
export const BB_START_DATE = new Date(2026, 6, 9); // Jul 9 2026 = puzzle #1
export const BB_SHUFFLE_SEED = 20260709;
export const BB_MAX_GUESSES = 8;

export const BB_THRESHOLDS = { season: 2, placement: 3, compWins: 2, age: 5 };

export const BB_COLUMNS = [
  { full: "Season",    short: "Season"   },
  { full: "Placement", short: "Place"    },
  { full: "Gender",    short: "Gender"   },
  { full: "Comp Wins", short: "Comps"    },
  { full: "Returnee",  short: "Returnee" },
  { full: "Age",       short: "Age"      },
];

function compareNumeric(g, a, t) {
  if (g == null || a == null) return { status: "wrong", hint: null };
  if (g === a) return { status: "correct", hint: null };
  return { status: Math.abs(g - a) <= t ? "close" : "wrong", hint: g < a ? "↑" : "↓" };
}

function compareText(g, a) {
  return g === a ? { status: "correct", hint: null } : { status: "wrong", hint: null };
}

export function evaluateBBGuess(guess, answer) {
  return [
    { label: "Season",    displayMain: `S${guess.season}`,            displaySub: guess.seasonName, ...compareNumeric(guess.season,    answer.season,    BB_THRESHOLDS.season) },
    { label: "Placement", displayMain: `#${guess.placement}`,         displaySub: null,             ...compareNumeric(guess.placement, answer.placement, BB_THRESHOLDS.placement) },
    { label: "Gender",    displayMain: guess.gender,                   displaySub: null,             ...compareText(guess.gender,       answer.gender) },
    { label: "Comp Wins", displayMain: String(guess.COMP_wins ?? "?"), displaySub: null,             ...compareNumeric(guess.COMP_wins, answer.COMP_wins, BB_THRESHOLDS.compWins) },
    { label: "Returnee",  displayMain: guess.returnee ? "Yes" : "No",  displaySub: null,             ...compareText(guess.returnee,     answer.returnee) },
    { label: "Age",       displayMain: guess.age ?? "?",               displaySub: null,             ...compareNumeric(guess.age,       answer.age,       BB_THRESHOLDS.age) },
  ];
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

export function getBBPuzzleNumber() {
  const etDateStr = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const [y, m, d] = etDateStr.split("-").map(Number);
  const todayUTC = Date.UTC(y, m - 1, d);
  const startUTC = Date.UTC(BB_START_DATE.getFullYear(), BB_START_DATE.getMonth(), BB_START_DATE.getDate());
  return Math.floor((todayUTC - startUTC) / 86400000) + 1;
}

export function getBBAnswerForPuzzle(houseguests, puzzleNum) {
  // Past puzzles — locked in, immune to roster changes
  if (puzzleNum >= 1 && puzzleNum - 1 < bbPuzzleHistory.length) {
    const id = bbPuzzleHistory[puzzleNum - 1];
    return houseguests.find(c => c.id === id);
  }

  // Future puzzles — shuffle only unused houseguests
  const usedSet = new Set(bbPuzzleHistory);
  const remaining = houseguests.filter(c => !usedSet.has(c.id));
  const shuffled = seededShuffle(remaining, BB_SHUFFLE_SEED);
  // Positive modulo so pre-launch (puzzleNum <= 0) days still resolve to an answer
  const len = shuffled.length;
  const idx = (((puzzleNum - 1 - bbPuzzleHistory.length) % len) + len) % len;
  return shuffled[idx];
}

export function getDailyBBAnswer(houseguests) {
  return getBBAnswerForPuzzle(houseguests, getBBPuzzleNumber());
}

export function getRandomBBAnswer(houseguests) {
  return houseguests[Math.floor(Math.random() * houseguests.length)];
}

export function getDateForBBPuzzle(puzzleNum) {
  const d = new Date(BB_START_DATE);
  d.setDate(BB_START_DATE.getDate() + puzzleNum - 1);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
