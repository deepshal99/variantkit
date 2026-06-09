---
name: variantkit
description: AI-assisted UI exploration. When the user asks to build, design, or change any user-facing UI (a component, screen, section, state, hero, card, layout, or visual treatment), generate 2-4 structural variants instead of one and wire them to a live DialKit panel so they can switch, tweak, finalize, and have the losers pruned. Also handles "deslop" / "remove the AI slop" requests. Triggers on building/redesigning UI, "give me options/takes/variants", "explore directions", "deslop", "this looks AI-generated".
---

# VariantKit

Make UI exploration cheap and structured. Instead of committing to one interpretation of a
UI request, generate several variants the user can judge live, then prune to the winner. The
full contract lives in the project's `AGENT.md` — read it before scaffolding.

## When to use (proactively)

Trigger whenever the user asks to build or change user-facing UI and the result is open-ended
(aesthetic, layout, tone, structure). Default to offering options. Skip only for mechanical,
exactly-specified changes or when the user says "just one".

## First: is this project set up?

Check for `AGENT.md` + `dialkit` in the project's deps.

- **Not set up:** run `node <path-to>/variantkit/init.mjs .` (installs `dialkit motion`, drops
  in `buildDecision.ts` + `AGENT.md`, adds the rules pointer). Tell the user what it did.
- **Set up:** proceed.

## Build a variant set

Follow `AGENT.md` exactly:
- Scaffold `ComponentName/` with `index.tsx` (the only file wiring DialKit), `registry.ts`,
  and `variants/<key>.tsx` — 2-4 self-contained components sharing the same props and the
  same morph transition.
- `index.tsx` drives selection via `useDialKit`: variant = a `select`, params = controls,
  finalize = an `action` whose `onAction` calls `buildDecision` + `copyDecision`.
- Every variant must pass the **deslop** rules in `AGENT.md §6` — no random mono/italics,
  all-caps eyebrows, decorative lines/dots, unmotivated warm accents, oversized radii, em
  dashes, or emoji. Generated UI must not look AI-generated.

## Finalize → prune

When the user finalizes, they get a `decision.json` (winner + override diff + prune list).
On the next turn, prune per `AGENT.md §4`: inline the values into the winner, rename it to
`index.tsx`, delete the losers + registry, remove the DialKit wiring. Run the §5 self-check.
The result is a plain component with zero VariantKit/DialKit residue.

## Deslop on request

On "deslop" / "remove the AI slop" / "this looks AI-generated": run the `AGENT.md §6`
pass — scope, scan signatures, judge each with the Intentional Test, remove only slop,
verify in the browser, report a table. Subtract, never add. Default to keep when unsure.
This targets generated app UI, never the VariantKit/DialKit dev panel.
