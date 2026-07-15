-- Fix: bb_solve_events / bb_recall_events / bb_sandwich_events are missing an RLS
-- policy allowing the anon role to INSERT. Confirmed via direct API test: inserting
-- into solve_events (Survivor's table) succeeds and returns 201 with the persisted
-- row; the identical insert into bb_solve_events fails with:
--   42501: new row violates row-level security policy for table "bb_solve_events"
-- This is why every BB game completion since launch has silently failed to log
-- (logBBSolveEvent/logBBRecallEvent/logBBSandwichEvent all fail silently by design,
-- so players never saw an error) and why /bb/stats Daily and Global both show 0.

-- Run this in the Supabase SQL Editor.

create policy "Allow anon insert" on bb_solve_events
  for insert to anon with check (true);

create policy "Allow anon insert" on bb_recall_events
  for insert to anon with check (true);

create policy "Allow anon insert" on bb_sandwich_events
  for insert to anon with check (true);

-- If RLS is not yet enabled on these tables at all (rather than enabled-but-missing-
-- a-policy), you'll also need:
-- alter table bb_solve_events enable row level security;
-- alter table bb_recall_events enable row level security;
-- alter table bb_sandwich_events enable row level security;

-- After running, verify with (should return 201, not 401/42501):
-- insert into bb_solve_events (puzzle, guesses, hints, won, mode, timestamp)
-- values ('RLS TEST - delete me', 1, false, true, 'test', now()::text)
-- returning *;
-- Then delete the test row: delete from bb_solve_events where puzzle = 'RLS TEST - delete me';

-- IMPORTANT: solve_events/recall_events/sandwich_events (Survivor's tables) also need
-- their EXISTING anon insert policy left untouched -- this script only adds new
-- policies to the three bb_* tables and does not modify Survivor's tables at all.
