---
name: variantkit
description: AI-assisted UI exploration. When the user asks to build, design, or change any user-facing UI (a component, screen, section, state, hero, card, layout, or visual treatment), generate 2-4 structural variants instead of one and wire them to a live, FULL configuration panel so they can switch, tweak everything, finalize, and have the losers pruned to one clean component. Also wraps existing components in their own configuration panel on "paramify" / "let me tweak this" / "give me controls", applies pending decisions on "apply decision", and handles "deslop" / "remove the AI slop" requests. Triggers on building/redesigning UI, "give me options/takes/variants", "explore directions", "paramify", "let me tweak", "give me controls", "apply decision", "deslop", "this looks AI-generated".
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
npx variantkit
```

That installs `dialkit motion` + the runtime (`buildDecision`, `configs`, `react` Studio
helper, `dialkit-clean.css`, `dialkit-dark.css`, `motion.css`), `AGENT.md`, and a rules pointer.
Ensure the panel host + stylesheets are set up once in the app root (DialRoot is a sibling,
not a wrapper):

```tsx
import { DialRoot } from 'dialkit'
import 'dialkit/styles.css'
import './variantkit/dialkit-clean.css' // hide redundant copy button + dividers (keeps snapshots)
import './variantkit/dialkit-dark.css'  // optional dark palette; set data-theme="dark" on .dialkit-root
import './variantkit/motion.css'        // stagger, press feedback, easings, reduced-motion
// render <App /> and <DialRoot /> as siblings
```

The installer also wires the decision transport (vite plugin / Next API route), mounts
`<DialRoot/>` + `<VariantBar/>` (tabs, keys 1..9, live Compare grid, Finalize) and the
stylesheets automatically. Check or undo anytime: `npx variantkit doctor`
(15 checks with fix-its) / `npx variantkit remove` (zero-residue).

Finalize feedback is in-button (the button morphs to "✓ Saved" via the transport, or
"✓ Copied" on the clipboard fallback), so no toast is needed. **Snapshots:** the panel's preset toolbar (≡+ / Version) saves a tuned
variant — use it to keep two tunings and switch between them; Finalize acts on the active one.

## The rules that make this work (never violate)

**VariantKit presents; the project decides.**
- **Design comes from the project.** You already know this project's design system, tokens,
  and guidelines — every variant follows them, exactly as a hand-built component would.
  VariantKit ships no colors, radii, fonts, or "house style"; never introduce one.
- **Controls come from the element.** Author the controls that genuinely matter for tweaking
  THIS element — its real design axes. Any number, any kind of control; there is no standard
  set. Never reuse a control set across unrelated elements.
- **Defaults come from the code.** Every control default is the element's current/intended
  value from the project (tokens, existing styles) — never an invented literal.
- **The rendered element stays untouched.** No rings, badges, overlays, or layout imposed on
  the project's UI — the user judges the element exactly as it ships. All feedback lives in
  the panel.

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
  {
    name: 'PricingCard',
    keys: ['slab', 'ledger', 'inverse'],
    // Authored for THIS element, defaults from THIS project's tokens — not a fixed menu.
    controls: {
      density: { type: 'select', options: ['compact', 'comfortable'], default: 'comfortable' },
      accent: tokens.brand,
      showAnnualToggle: true,
    },
    render: (variant, v) => <Card variant={variant} {...v} />,
  },
  // add more elements here; each gets its own folder + its own authored controls
]
<Studio elements={ELEMENTS} focusOnHover />
```

`controls` is whatever fits the element — any DialKit control: number `[default,min,max]` →
slider, string → text, `#hex` → color, boolean → segmented toggle, `select` → dropdown,
`spring`/`transition` → motion editor (only for elements that move), nested object → folder
group. Ask "which axes of this element would the developer tweak before committing?" and
expose exactly those. For a single element, pass one entry; with one variant key no dropdown
is shown. `focusOnHover` expands the hovered element's folder — panel-side only, nothing is
drawn over the rendered element. Mount `<DialRoot/>` once in the app root. Still author the
variant components file-per-variant (recipe below) so the prune stays a clean delete.

### The completeness bar (AGENT.md §7)

A panel with 2-3 loose sliders is a failure: during exploration the panel must feel like
the element's ACTUAL configuration panel. Every design literal a variant renders becomes a
control (paramify rule). Non-trivial element ⇒ ≥4 folders, 12-25 controls; collapse the
secondary ones. Use the archetype checklists in `variantkit/schemas/archetypes.ts`
(button, card, hero, navbar, modal, form, table, list, badge, pricing, section) — they are
checklists to ADAPT and seed from the project's real values, never sets to paste. Drop a
control that is a variant's structural identity by destructuring; resolve token selects
(shadow, font family) to CSS in the shell via `SHADOWS` / `FONT_STACKS`.

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

`index.tsx` — variant = a DialKit `select`, your authored controls, finalize = an `action`.
(Control names/defaults below are placeholders — derive yours from the element + the
project's tokens.)

```tsx
import { useDialKit } from 'dialkit'
import { registry } from './registry'
import { buildDecision, submitDecision, type ParamValue } from '../../core/buildDecision'

// Defaults = the project's real values (tokens / current styles), never invented literals.
const DEFAULTS: Record<string, ParamValue> = { density: 'comfortable', accent: tokens.brand }

export default function ComponentName(props: { /* real props */ }) {
  const v = useDialKit('ComponentName', {
    variant: { type: 'select', options: ['a', 'b', 'c'], default: 'a' }, // omit when only one variant
    density: { type: 'select', options: ['compact', 'comfortable'], default: DEFAULTS.density },
    accent: DEFAULTS.accent as string,
    finalize: { type: 'action', label: 'Finalize' },
  }, {
    onAction: () => submitDecision(buildDecision('ComponentName', v as Record<string, ParamValue>, DEFAULTS, registry)),
  }) as Record<string, ParamValue>

  const Active = registry[String(v.variant)].component
  return <Active {...props} density={String(v.density)} accent={v.accent as string} />
}
```

Each variant declares the **same** transition (a local const, duplicated on purpose so it
stays self-contained), so switching morphs rather than snaps:

```ts
const morph = { transition: 'border-radius .25s ease, background-color .25s ease, box-shadow .25s ease, padding .25s ease' }
```

Every variant must pass the deslop checklist below — generated UI must not look AI-generated.

## Step 3 — finalize → prune

Finalize ships a `decision.json` (schema 2, dot-path values): `{ schema, component,
finalized, values, overridesFromDefault, prune[], note, status, timestamp }` — through the
dev transport into `.variantkit/decisions/<Component>.json`, or to the clipboard when no
transport is running. On "apply decision" (or at session start) scan
`.variantkit/decisions/*.json` for `status: "pending"`; a pasted decision applies the same
way. Prune (mechanical — never move JSX between files):

1. Inline `values` (as literals) into the winner file `variants/<finalized>.tsx`.
2. Rename that file to `index.tsx`, overwriting the shell. Do NOT copy code by hand.
3. Delete every loser in `prune` + leftover `variants/*`; delete `registry.ts`.
4. Remove the DialKit wiring. If this was the last variant set, also drop `<DialRoot/>`.
5. Resolve: append the decision (status "resolved") to `.variantkit/history/log.jsonl`,
   delete the pending decision file.

## Paramify an existing component (no variants)

On "paramify this" / "let me tweak this" / "give me controls for this": wrap the EXISTING
component in its full configuration per AGENT.md §7 — adapted archetype + finalize action,
props fed from panel values; no registry, no variants/. On finalize: inline the chosen
values as literals and strip the wiring completely.

## Taste memory

Before scaffolding, read `.variantkit/TASTE.md` if present — seed defaults toward the
observed preferences, plus one variant that deliberately breaks the pattern. After
resolving, if `.variantkit/history/log.jsonl` has ≥3 entries, distill/update `TASTE.md`
per AGENT.md §8 — grounded claims only, every bullet cites ≥2 decisions with real values.

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
