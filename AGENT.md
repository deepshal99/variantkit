# VariantKit — Agent Contract

`contractVersion: 0.1`

VariantKit lets a developer generate N structural variants of a component, choose one
live in the running app, tweak its params, and finalize a winner. You (the coding agent)
do two things: **scaffold** variant sets when asked for "options/variants/takes", and
**prune** a set down to the chosen winner when a decision is finalized.

Pruning must be reliable. It is mostly file deletion plus one file rename. Never move JSX
between files by hand. Follow this exactly.

**Vocabulary:** element, variant, control, configuration, snapshot, finalize, decision, prune
— one word per concept, defined in `NAMING.md`. Use them consistently.

---

## 0. When to offer variants (read this first)

**Default to divergence.** When the developer asks you to build or change any user-facing
UI — a component, screen, section, state, layout, or visual treatment — do NOT commit to a
single interpretation. Scaffold a **variant set** of 2–4 structural takes (§1) and let the
developer choose live in the panel, then finalize. Generating N is the point; one is the
exception.

Offer variants especially when:
- the request is aesthetic or open-ended ("a pricing card", "make this nicer", "a hero")
- there are real directions to explore (layout, density, tone, emphasis, structure)
- the developer has not pinned exact specs

Skip variants only when the change is mechanical and unambiguous (a copy fix, a wired bug,
an exact pixel spec) or the developer explicitly says "just one". When unsure, offer options.

Each variant you generate must pass the deslop rules in §6 — generated UI should not look
AI-generated.

**VariantKit presents; the project decides.** VariantKit is the panel, the wiring, the
finalize → prune loop — nothing else. It has no opinion on what the variants look like or
what their controls are:

- **Design comes from the project.** You already know this project's design system, tokens,
  and guidelines — every variant follows them, exactly as a hand-built component would.
  VariantKit ships no colors, radii, fonts, spacings, or "house style". Never introduce a
  VariantKit default into project UI.
- **Controls come from the element.** For each element, author the controls that genuinely
  matter for tweaking THAT element — its real design axes. Any number, any kind. There is no
  standard control set, and no control is required besides finalize.
- **Defaults come from the code.** Every control's default is the element's current/intended
  value from the project (its tokens, its existing CSS) — never an invented value.
- **The rendered element stays untouched.** No rings, badges, overlays, entrance animations,
  or layout imposed on project UI. The user must be able to judge the element exactly as it
  will ship.

---

## 1. Scaffolding a variant set

When the developer asks for "options" / "N takes" / "variants" of a component, create a
folder, file-per-variant:

```
ComponentName/
  index.tsx          # thin shell: drives selection via DialKit, renders the active variant.
                     # THE ONLY FILE THAT IMPORTS dialkit / variantkit / registry / buildDecision.
  registry.ts        # maps variant key -> { component, label }
  variants/
    <keyA>.tsx        # one self-contained component per variant
    <keyB>.tsx
    <keyC>.tsx
```

Rules:
- Each `variants/<key>.tsx` **default-exports** a component taking the SAME props.
- Each variant file is **self-contained**: it imports nothing from VariantKit/DialKit and
  nothing from a shared variant helper. Whatever it needs (e.g. the transition) is a local
  const in that file.
- **Shared transition (morph rule):** every variant declares the *identical* transition
  local const on the morph-able properties (radius, padding, shadow, color). Duplicated on
  purpose so the winner is self-contained after prune and switching reads as a morph, not a
  snap.
- Only `index.tsx` wires the tool. That single-point-of-wiring is what makes prune a
  deletion, not surgery.

## 2. Build on DialKit (v0)

`index.tsx` drives selection through DialKit — variant choice is a `select`, params are
controls, finalize is an `action`. **You author the controls per element** — there is no
preset menu. `panelConfig(controls, variantKeys, opts)` (from `variantkit/configs`) wraps
your controls with the structural parts: a `variant` select (only when there are 2+ keys) and
a `finalize` action. Derive `defaults` with `defaultsOf` so you never hand-maintain a separate
defaults object.

```tsx
import { useDialKit } from 'dialkit'
import { registry } from './registry'
import { buildDecision, copyDecision } from '../../variantkit/buildDecision'
import { panelConfig, defaultsOf, regOf } from '../../variantkit/configs'

const KEYS = ['ledger', 'slab', 'inverse']
// These controls are EXAMPLES — derive yours from this element + this project's tokens.
const cfg = panelConfig(
  {
    density: { type: 'select', options: ['compact', 'comfortable'], default: 'comfortable' },
    accent: tokens.brand,          // default = the project's real token, not an invented hex
    showAnnualToggle: true,
  },
  KEYS,
  { component: 'PricingCard' },
)

export default function PricingCard(props: { plan?: string }) {
  const v = useDialKit('PricingCard', cfg, {
    onAction: () => copyDecision(buildDecision('PricingCard', v, defaultsOf(cfg), regOf(KEYS))),
  })
  const Active = registry[v.variant].component
  return <Active {...props} density={v.density} accent={v.accent} showAnnualToggle={v.showAnnualToggle} />
}
```

### Authoring controls — contextual, unrestricted

Ask: *which axes of this element would the developer actually want to tweak before
committing?* Those are the controls. Nothing else.

- **Any DialKit control is fair game:** number `[default, min, max]` → slider; string →
  text input; `#hex` string → color picker; boolean → segmented Off|On toggle; `select` →
  dropdown; `{ type: 'spring' | 'transition' }` → motion editor (only for elements that
  actually move); a nested object → a folder (group related controls of a complex element).
- **Any count.** A button might need two controls; a data table might need ten in two
  folders. More is not better — show what this element needs, nothing it doesn't.
- **Never copy a control set** from this file, another element, or a previous project. The
  set that repeats across unrelated elements is by definition not contextual.
- **Defaults are the project's values.** Pull them from the design tokens or the element's
  current styles. If you typed a literal that exists nowhere in the project, it's wrong.

### Multiple elements → ONE panel (folders), never many

DialKit renders one panel per `useDialKit` call, so calling it from each component clutters
the screen with stacked panels. For 2+ elements in play, make a **single** `useDialKit` call
whose config has **one folder per element** (a nested object becomes a folder). Route each
folder's finalize via `onAction(path)` — `path` is dot-notation, e.g. `PricingCard.finalize`.

```tsx
const ELEMENTS = [
  { name: 'Hero', keys: ['centered','split','minimal'], controls: heroControls },
  { name: 'PricingCard', keys: ['slab','ledger','inverse'], controls: cardControls },
]
const combined = Object.fromEntries(
  ELEMENTS.map((e, i) => [e.name, { ...panelConfig(e.controls, e.keys, { component: e.name }), _collapsed: i !== 0 }]),
)
const all = useDialKit('VariantKit', combined, {
  onAction: (path) => {
    const e = ELEMENTS.find((x) => x.name === path.split('.')[0])!
    copyDecision(buildDecision(e.name, all[e.name], defaultsOf(panelConfig(e.controls, e.keys)), regOf(e.keys)))
  },
})
// values are nested: all.Hero.headingSize, all.PricingCard.density, ...
```

`_collapsed: true` starts a folder closed (first one open). Result: one panel, a section per
element, each with its contextual controls and its own Finalize. See `examples/contextual`.

**Easiest path — the `Studio` helper.** Don't hand-write the wiring above; use it:

```tsx
import { Studio, type ElementDef } from './variantkit/react'

const ELEMENTS: ElementDef[] = [
  { name: 'PricingCard', keys: ['slab','ledger','inverse'], controls: cardControls, render: (variant, v) => <Card variant={variant} {...v} /> },
  // ...more elements, each with ITS OWN authored controls
]
<Studio elements={ELEMENTS} focusOnHover />   // one panel, folders, finalize routing, focus
```

`focusOnHover` expands the panel folder of the element you hover — so the panel always shows
"the element you're editing." It is panel-side only: **nothing is ever drawn on or around the
rendered element** (no rings, badges, or overlays — the user must see the element exactly as
it ships). For a SINGLE element, just pass one entry (one folder, nothing extra); with one
variant key, no variant dropdown is shown. DialKit's `<DialRoot/>` must be mounted once in
the app root.

### Hide the redundant copy button

Import these three stylesheets once (the `Studio` helper assumes them):
- `variantkit/dialkit-clean.css` — hides the redundant "Copy parameters" button and the
  folder/header dividers (panel reads on spacing, like DialKit's own UI). **Keeps the preset
  toolbar** — that's the snapshot mechanism (below).
- `variantkit/dialkit-dark.css` — the dark palette DialKit lacks. Call `useDialkitTheme()`
  (from `variantkit/react`) once: it applies the theme, persists it, and injects a sun/moon
  toggle into the panel header so the user flips the panel's light/dark right there.
- `variantkit/motion.css` — press feedback, theme-switch cross-fade, reduced-motion. Scoped
  strictly to the panel chrome; it never styles or animates the project's UI.

### Snapshots — keep two tunings and compare

A **Snapshot** = a saved (variant + control values) state, so you can keep two tunings of one
element (Slab/12/green vs Inverse/4/amber) and pick one. This is DialKit's **preset toolbar**
(the ≡+ "add" and the Version dropdown), reused: because the variant is itself a control, a
preset captures variant+values, and DialKit restores them atomically on switch. Finalize acts
on the **active** snapshot. So: tune → ≡+ to snapshot → tune differently → switch between them
→ Finalize the winner. (We hide only the redundant Copy button, not the preset toolbar.)

## 3. `decision.json` schema

Finalize writes one decision per component (clipboard in v0; file later).

```jsonc
{
  "component": "PricingCard",
  "finalized": "slab",                                  // the winning variant key
  "values": { "density": "compact", "accent": "#175048" },  // final live values to inline
  "overridesFromDefault": {                                 // only changed keys; the taste signal
    "density": { "from": "comfortable", "to": "compact" },
    "accent": { "from": "#1F5E54", "to": "#175048" }        // from = the project's own default
  },
  "prune": ["ledger", "inverse"],                       // loser keys to delete
  "note": "",
  "status": "pending",
  "timestamp": "2026-06-09T00:00:00Z"
}
```

## 4. Prune algorithm (the reliable part)

Given `decisions/<Component>.json` with `status: "pending"`:

1. **INLINE** the `values` into the winner file `variants/<finalized>.tsx` — replace the
   prop-driven values with the literals (so the component needs no incoming params).
2. **PROMOTE by rename** — `mv variants/<finalized>.tsx index.tsx`, overwriting the old
   shell. **Do NOT copy code into the old index by hand.** (Rule 1A: rename, never move JSX.)
3. **DELETE** every loser in `prune` plus any leftover `variants/*.tsx`; remove the now-empty
   `variants/` folder.
4. **DELETE** `registry.ts`.
5. Mark the decision `resolved`, append it to history, remove the pending decision file.

Net diff: deleted files + one renamed file + inlined literals. No JSX moved between files.

## 5. Self-check after pruning (ALL must be true)

- [ ] No file imports `dialkit`, `variantkit`, `./registry`, or `buildDecision`.
- [ ] `variants/` is gone; `registry.ts` is gone.
- [ ] `index.tsx` renders the winner with the finalized `values` inlined as literals.
- [ ] The component's visible output matches the winning variant before prune.

If any box is unchecked, the prune is wrong. Re-read this file; do not hand-patch around it.

---

## 6. Deslop — generated variants must not look AI-generated

Apply this to every variant you generate. Also run it as a pass on request ("deslop",
"remove the AI slop", "this looks AI-generated", "strip the AI tells").

**Core principle:** slop is *decoration without a system*. A tell is slop when it appears as
a one-off for "flavor"; it is fine when it is a consistent, intentional, repeated system. The
test is never "does this pattern appear" — it is "does it earn its place in a repeated
system." Default to **keep** when meaning is unclear; never delete load-bearing meaning.
**Subtract, never add** — deslop introduces no new color, font, or decoration.

Catalog (signature → slop when → fix), adapted from the design-deslop skill:

1. **Random italics** — `italic`, `<em>/<i>` on headings/labels/captions → one-off "flavor"
   → remove italic; use weight/size for emphasis. Keep true inline prose emphasis.
2. **Random mono font** — `font-mono`, `*mono*` family on labels/eyebrows/body → "tech feel"
   with no data reason → revert to UI font; for numbers use `tabular-nums`, not a mono face.
3. **All-caps + wide tracking "eyebrows"** — `uppercase` + `tracking-wide*` kicker above every
   heading (the single most common AI tell) → delete it, or keep at most one system-wide,
   normal-case at real hierarchy.
4. **Decorative accent / divider lines** — `w-8 h-px`, `h-1 w-10 bg-{color}`, `::before` bars
   under headings → remove. Keep only full-width structural rules doing layout work.
5. **Ornamental colored dots** — `w-1.5 h-1.5 rounded-full bg-{color}`, `•`, `animate-pulse`
   dots that convey no status → remove. Keep dots that encode real state (online, unread).
6. **Unmotivated warm accents** — amber/orange/rose (`#f59e0b #f97316 #fb923c #f43f5e`, warm
   gradients) injected for "energy" when warm is not the brand → map back to the design's
   real tokens. Reserve warm for true semantic meaning (a real warning).
7. **Decorative single letters / monograms** — lone styled `A`/`01`/drop-cap/letter-in-a-box
   standing for nothing → remove. Keep real initial avatars for named entities.
8. **Oversized rounded corners** — `rounded-3xl`, radius ≥ 20px on cards/buttons/inputs →
   bring to ~8–12px, consistent and concentric (inner = outer − padding). Pills/avatars stay
   full-round on purpose.
9. **One-sided / gradient highlight borders** — `border-t-2 border-{accent}` top stripes,
   gradient/`mask` borders, one-side glows for flair → use a uniform 1px border or none.
   Reserve edge accents for real selected/semantic states.
10. **Em dashes in copy** — replace `—` with commas, colons, or separate sentences.
11. **Emoji in product UI** — remove decorative emoji from interface copy and labels.

**Deslop-on-request workflow:** scope (the named files or the current diff) → scan each
signature → judge each hit with the Intentional Test above → remove only the slop → verify
in the browser (before/after) → report a table (`# | tell | file:line | removed/kept | why`).

**Scope note:** this applies to the **generated app components** (the variants). It does NOT
apply to the VariantKit/DialKit dev panel — the panel's mono labels, amber accent, and pill
tabs are an intentional, system-wide tool chrome, not slop.
