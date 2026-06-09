---
name: variantkit
description: AI-assisted UI exploration. When the user asks to build, design, or change any user-facing UI (a component, screen, section, state, hero, card, layout, or visual treatment), generate 2-4 structural variants instead of one and wire them to a live DialKit panel so they can switch, tweak, finalize, and have the losers pruned to one clean component. Also handles "deslop" / "remove the AI slop" requests. Triggers on building/redesigning UI, "give me options/takes/variants", "explore directions", "deslop", "this looks AI-generated".
---

# VariantKit

Make UI exploration cheap and structured: generate several variants the user judges live,
then prune to the winner. This skill is self-contained — you can scaffold and prune from it
alone. If the project has an `AGENT.md` with a VariantKit section, that is authoritative; read
it and prefer it over this summary.

## When to use (proactively)

Trigger whenever the user asks to build or change user-facing UI and the result is open-ended
(aesthetic, layout, tone, structure, density). Default to offering 2-4 variants. Skip only for
mechanical, exactly-specified changes, or when the user says "just one".

## Step 1 — make sure the project is set up

Check for `dialkit` in the project's deps and a `buildDecision.ts` (usually `src/variantkit/`).
If missing, set it up from the project root:

```sh
npx github:deepshal99/variantkit
```

That installs `dialkit motion`, adds `buildDecision.ts` + `AGENT.md`, and a rules pointer.
Also ensure the panel host exists once in the app root (sibling of the app, not a wrapper):

```tsx
import { DialRoot } from 'dialkit'
import 'dialkit/styles.css'
// render <App /> and <DialRoot /> as siblings
```

If you cannot run the installer (offline), you can still scaffold using the recipe below; add
`dialkit motion` to deps and copy `buildDecision.ts` from the variantkit repo when possible.

## Vocabulary (use these exactly)

**Element** = the thing being designed. **Variant** = one structural take on it. **Control** =
one setting; **Configuration** = the contextual set of controls for an element. **Snapshot** =
a saved variant+values state. **Finalize** → writes a **Decision** → agent **prunes** losers.
Full glossary: `NAMING.md`.

## Step 2 — scaffold a variant set

**Easiest path — the `Studio` helper.** For one OR many elements, prefer it over hand-wiring;
it gives one panel, a folder per element, finalize routing, and focus-on-hover:

```tsx
import { Studio, type ElementDef } from './variantkit/react'

const ELEMENTS: ElementDef[] = [
  { name: 'PricingCard', type: 'card', keys: ['slab','ledger','inverse'], render: (variant, v) => <Card variant={variant} {...v} /> },
  // add more elements here; each gets its own folder + contextual controls
]
<Studio elements={ELEMENTS} focusOnHover />
```

`type` selects the contextual preset (`card`/`button`/`hero`/`badge`/`input`/`table`/…);
controls are scoped to that element. For a single element, pass one entry. Mount `<DialRoot/>`
once in the app root. Still author the variant components file-per-variant (recipe below) so
the prune stays a clean delete.

### Manual wiring (if not using the helper)

File-per-variant. Only `index.tsx` wires the tool; each variant is a plain, self-contained
component. This is what makes the later prune reliable (delete files + one rename).

```
ComponentName/
  index.tsx          # the ONLY file importing dialkit / registry / buildDecision
  registry.ts        # { key: { component, label } }
  variants/
    <a>.tsx          # 2-4 self-contained components, same props, same morph transition
    <b>.tsx
    <c>.tsx
```

`index.tsx` — variant = a DialKit `select`, params = controls, finalize = an `action`:

```tsx
import { useDialKit } from 'dialkit'
import { registry } from './registry'
import { buildDecision, copyDecision, type ParamValue } from '../../core/buildDecision'

const DEFAULTS: Record<string, ParamValue> = { radius: 18, accent: '#1F5E54' }

export default function ComponentName(props: { /* real props */ }) {
  const v = useDialKit('ComponentName', {
    variant: { type: 'select', options: ['a', 'b', 'c'], default: 'a' },
    radius: [DEFAULTS.radius as number, 0, 32],
    accent: DEFAULTS.accent as string,
    finalize: { type: 'action', label: 'Finalize & copy decision' },
  }, {
    onAction: () => copyDecision(buildDecision('ComponentName', v as Record<string, ParamValue>, DEFAULTS, registry)),
  }) as Record<string, ParamValue>

  const Active = registry[String(v.variant)].component
  return <Active {...props} radius={v.radius as number} accent={v.accent as string} />
}
```

Each variant declares the **same** transition (a local const, duplicated on purpose so it
stays self-contained), so switching morphs rather than snaps:

```ts
const morph = { transition: 'border-radius .25s ease, background-color .25s ease, box-shadow .25s ease, padding .25s ease' }
```

Every variant must pass the deslop checklist below — generated UI must not look AI-generated.

## Step 3 — finalize → prune

Finalize copies a `decision.json`: `{ component, finalized, values, overridesFromDefault,
prune[], note, status, timestamp }`. When the user hands it back, prune (mechanical — never
move JSX between files):

1. Inline `values` (as literals) into the winner file `variants/<finalized>.tsx`.
2. Rename that file to `index.tsx`, overwriting the shell. Do NOT copy code by hand.
3. Delete every loser in `prune` + leftover `variants/*`; delete `registry.ts`.
4. Remove the DialKit wiring. If this was the last variant set, also drop `<DialRoot/>`.

Self-check (all must hold): no file imports `dialkit` / `registry` / `buildDecision`;
`variants/` and `registry.ts` gone; `index.tsx` renders the winner with values inlined; the
visible output matches the chosen variant.

## Deslop — applies to generated UI, never the DialKit panel

Slop is decoration without a system: a tell is slop as a one-off, fine as a consistent,
repeated system. Default to keep when unsure; subtract, never add. On "deslop" / "this looks
AI-generated", run a pass: scope → scan → judge each → remove only slop → verify in browser →
report a table. Catalog:

1. Random italics on headings/labels → remove; use weight/size for emphasis.
2. Random mono font for "tech feel" → revert to UI font; numbers use `tabular-nums`.
3. All-caps + wide-tracking "eyebrow" kickers → delete, or keep at most one system-wide.
4. Decorative accent/divider stub lines → remove; keep only full structural rules.
5. Ornamental colored/pulsing dots → remove; keep dots that encode real state.
6. Unmotivated warm accents (amber/orange/rose) → map to real tokens; reserve for semantics.
7. Decorative single letters/monograms standing for nothing → remove.
8. Oversized radii (≥20px) → 8-12px, concentric (inner = outer − padding).
9. One-sided / gradient highlight borders for flair → uniform 1px or none.
10. Em dashes in copy → commas, colons, or separate sentences.
11. Emoji in product UI → remove.
