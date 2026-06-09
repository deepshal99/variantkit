# Phase C — Prune Experiment Log

Goal: confirm the `AGENT.md` convention prunes a file-per-variant component to one clean
file, deterministically, with zero residue and no manual fixup.

**Agent under test:** Claude Opus 4.8 (me), this session. One model. See "Honest gate
status" below — the design doc's full rigor (5× across your own agent + a CI cross-model
run) is still yours to confirm.

## Method

Start state: `fixture/before/PricingCard/` (index shell + registry + 3 variants) and a
pending `decisions/PricingCard.json`. For each run, apply `AGENT.md §4` mechanically:
inline `values` into the winner, rename winner → `index.tsx`, delete losers + registry,
then run the §5 self-check.

## Runs

| # | Winner | Inlined values | Result | Residue? | Self-check |
|---|--------|----------------|--------|----------|------------|
| 1 | slab    | radius 18→12, accent #1F5E54→#175048 | clean | none | 4/4 PASS |
| 2 | ledger  | radius 18→8 (accent default)         | clean | none | 4/4 PASS |
| 3 | inverse | radius 18→20, accent #1F5E54→#E8B04B | clean | none | 4/4 PASS |

Run 1 is committed as the canonical fixture (`fixture/after/PricingCard/index.tsx`).
Runs 2 and 3 were performed to check determinism across different winners; each produced
the same shape of result (the winner's file becomes a self-contained `index.tsx`, all
other files deleted, no tool imports). They are not committed as separate trees to keep
the fixture canonical.

## Why it pruned cleanly (the mechanism)

The prune never moved JSX between files. It was: inline literals into one file → rename
that file → delete the rest. That is file deletion + one rename + a literal substitution —
the most reliable operations an agent performs. This is rule **1A** working as designed:
because each variant is self-contained (no tool imports, the morph transition duplicated
locally), the winner needs nothing from the deleted files.

Self-check, every run:
- [x] No file imports `dialkit` / `variantkit` / `./registry` / `buildDecision`
- [x] `variants/` gone; `registry.ts` gone
- [x] `index.tsx` renders the winner with finalized values inlined
- [x] Visible output matches the winning variant

## One observation worth keeping

After prune the shared `morph` transition is retained but inert — with values now literal,
no prop changes drive it. Keeping it is the *mechanical* choice (rename + inline only). A
"smarter" prune that strips the inert transition would make the algorithm less mechanical
and therefore less reliable. Decision: keep prune mechanical; tolerate the inert const.
(If you ever want it gone, do it as a separate lint pass, not inside prune.)

## Honest gate status

- **3/3 clean prunes by one model (Opus 4.8).** Strong evidence the convention is
  prunable. The mechanism is mechanical, so determinism is expected, not lucky.
- **Not yet the full design-doc bar:** that asked for 5 consecutive clean prunes run by
  *your* agent, plus a CI run against a different default model (TRD §9 contract test).
  Do that before freezing the contract.
- **Recommendation: GATE PASS (provisional).** Safe to start Phase A. Re-run the 5×/
  cross-model check once Phase A wires the real `buildDecision`, since that path generates
  the decisions the prune consumes.
