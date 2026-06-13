# VariantKit — Agent Contract

`contractVersion: 0.3`

VariantKit lets a developer generate N structural variants of a component, choose one
live in the running app, tweak its params, and finalize a winner. You (the coding agent)
do two things: **scaffold** variant sets when asked for "options/variants/takes", and
**prune** a set down to the chosen winner when a decision is finalized.

Pruning must be reliable. It is mostly file deletion plus one file rename. Never move JSX
between files by hand. Follow this exactly.

**Vocabulary:** element, variant, control, configuration, finalize, decision, prune
— one word per concept, defined in `NAMING.md`. Use them consistently.

---

## 0. When to offer variants (read this first)

**Default to divergence.** When the developer asks you to build or change any user-facing
UI — a component, screen, section, state, layout, or visual treatment — do NOT commit to a
single interpretation. Scaffold a **variant set** of **2-3 structural takes** (§1) — a 4th
only when the directions genuinely diverge, since each take is more generation the developer
waits on — and let them choose live in the panel, then finalize. Generating N is the point;
one is the exception.

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
import { buildDecision, submitDecision } from '../../variantkit/buildDecision'
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
    onAction: () => submitDecision(buildDecision('PricingCard', v, defaultsOf(cfg), regOf(KEYS))),
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
  set that repeats across unrelated elements is by definition not contextual. (The archetype
  schemas in §7 are checklists of design axes to ADAPT and seed from the code — not sets to
  paste.)
- **Cover the element fully.** Contextual does not mean minimal — §7 sets the completeness
  bar: the panel should feel like the element's actual configuration panel.
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
    submitDecision(buildDecision(e.name, all[e.name], defaultsOf(panelConfig(e.controls, e.keys)), regOf(e.keys)))
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

### On-canvas chrome — VariantBar and VariantStage

`<VariantBar/>` (`variantkit/react/VariantBar`) mounts once next to `<DialRoot/>`: a slim
bottom bar with variant tabs, keys 1..9, a live side-by-side **Compare** toggle, and
Finalize. It auto-discovers every variant set from DialKit's store — both the classic
shell layout and the Studio's folder-per-element layout — no per-component wiring. It is
tool chrome at the screen edge; it never decorates the rendered element itself.

For the classic single-set shell, render through `<VariantStage/>`
(`variantkit/react/VariantStage`) instead of a bare `<Active/>` — same render normally,
and a live grid of all variants when Compare is on (clicking a cell selects it):

```tsx
return <VariantStage name="PricingCard" registry={registry} active={String(v.variant)} props={variantProps} />
```

### Hide DialKit's top toolbar

Import these three stylesheets once (the `Studio` helper assumes them):
- `variantkit/dialkit-clean.css` — hides DialKit's entire top toolbar row (the preset/"Version"
  manager + the "Copy parameters" button) and the folder/header dividers (panel reads on
  spacing, like DialKit's own UI). VariantKit has no snapshots concept: the variant selector is
  the first thing in the panel — pick a variant, tweak it, Finalize.
- `variantkit/dialkit-dark.css` — the dark palette DialKit lacks. Call `useDialkitTheme()`
  (from `variantkit/react`) once: it applies the theme, persists it, and injects a sun/moon
  toggle into the panel header so the user flips the panel's light/dark right there.
- `variantkit/motion.css` — press feedback, theme-switch cross-fade, reduced-motion. Scoped
  strictly to the panel chrome; it never styles or animates the project's UI.

## 3. `decision.json` schema (schema 2)

Finalize writes one decision per component. Values are **dot-path flattened** — folder
groups become `"surface.radius"` — so grouped configurations stay flat and inlineable.

```jsonc
{
  "schema": 2,
  "component": "PricingCard",
  "finalized": "slab",                                  // the winning variant key
  "values": {                                           // final live values to inline
    "density": "compact",
    "surface.radius": 12,
    "accent": "#175048"
  },
  "overridesFromDefault": {                             // only changed keys; the taste signal
    "density": { "from": "comfortable", "to": "compact" },
    "accent": { "from": "#1F5E54", "to": "#175048" }    // from = the project's own default
  },
  "prune": ["ledger", "inverse"],                       // loser keys to delete
  "note": "",
  "status": "pending",
  "timestamp": "2026-06-09T00:00:00Z"
}
```

When inlining (§4), a dot-path maps to the prop the shell derived from it: the prop fed by
`v.surface.radius` gets the literal at `"surface.radius"`. Token values (`"shadow": "lg"`)
inline as the **resolved CSS** the shell produced, not the token string.

## 4. Prune algorithm (the reliable part)

**Where decisions come from.** Finalize ships the decision through the dev transport
(vite plugin / Next route) into `.variantkit/decisions/<Component>.json`. When no
transport is running it falls back to the clipboard and the developer pastes it to you.

**When to apply.** On "apply decision" / "apply the decision" — and at the start of any
session in a VariantKit project — scan `.variantkit/decisions/*.json` for
`status: "pending"` and prune each one. A pasted decision JSON is applied the same way.

Given a decision with `status: "pending"`:

1. **INLINE** the `values` into the winner file `variants/<finalized>.tsx` — replace the
   prop-driven values with the literals (so the component needs no incoming params).
2. **PROMOTE by rename** — `mv variants/<finalized>.tsx index.tsx`, overwriting the old
   shell. **Do NOT copy code into the old index by hand.** (Rule 1A: rename, never move JSX.)
3. **DELETE** every loser in `prune` plus any leftover `variants/*.tsx`; remove the now-empty
   `variants/` folder.
4. **DELETE** `registry.ts`.
5. Mark the decision `resolved`: append the decision (with `"status": "resolved"`) as one
   line to `.variantkit/history/log.jsonl`, then delete
   `.variantkit/decisions/<Component>.json`. For pasted decisions, append the same way.

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

---

## 7. Full configuration, not three sliders — the completeness bar

The §0 rules stand: controls come from the element, defaults come from the code. This
section adds the other half: for a rich element, **a panel with 2-3 loose sliders is a
failure.** During exploration the panel must feel like the element's actual configuration
panel — covering every design decision the element really has, grouped the way a real
settings panel would group them.

But **scale the panel to the element.** Every control and every variant is generation the
developer waits on — over-building a button into 20 controls is what makes VariantKit feel
slow for no payoff. Match the work to the ask (see the minimum bar below).

**Paramify rule — expose the decisions, not every number.** A control earns its place only
if a developer would plausibly reach for it while exploring THIS element. Run that test over
every design literal a variant renders — px sizes, radii, colors, font sizes, weights,
spacing, shadows, durations: if it's a real, tweakable design decision, it becomes a control
fed from the shell; if it's a fixed structural constant, a value the layout simply dictates,
or something nobody would touch, leave it inline. The bar is *"would they turn this dial?"*,
not *"is there a number here?"*. No **meaningful** design value stays outside the panel — and
no useless one clutters it. (A variant's structural identity always stays inline — see below.)

Curating is the job, not a shortcut. A panel of 8 controls that all matter beats one of 20
where half are noise — the developer scans every row, so each junk control is a small tax.
When a control feels borderline, drop it (or collapse it into a secondary folder); the
developer can always ask for more.

**Archetype checklists.** `variantkit/schemas/archetypes.ts` ships per-element-family
checklists of design axes:

`button · card · hero · navbar · modal · form · table · list · badge · pricing · section`

built from section builders in `variantkit/schemas/sections.ts` (`layoutSection`,
`surfaceSection`, `typographySection`, `colorSection`, `motionSection`, `statesSection`).
They are **checklists to adapt, not sets to paste** (§2 authoring rules apply unchanged):

- **Seed every default from the code.** Pass the element's rendered values as overrides —
  `pricingArchetype({ surface: { radius: 18 }, color: { accent: tokens.brand } })` — so the
  panel opens matching what's on screen. The builders' fallback values are scaffolding for
  brand-new elements only; on an existing element, an unseeded default is a §0 violation.
- **Adapt the set.** Drop axes this element doesn't have, add the ones it does (`extra`),
  rename folders if the element thinks in different terms. Two unrelated elements ending up
  with identical panels means you pasted, not adapted.
- **Copy control shapes, never invent control types.** DialKit supports: slider
  `[def,min,max,step?]`, boolean, text, color (hex), select, spring, easing, action, nested
  folders (`_collapsed: true`).

**Proportional bar** — size the panel to the element, smallest sufficient first:
- **Trivial** (icon, divider, single label, tag) ⇒ a flat 3-5 control panel.
- **Small** (button, badge, single input, chip) ⇒ the ~3-8 controls that genuinely matter; one
  or two folders at most. Resist padding it out.
- **Rich** (hero, pricing card, navbar, modal, form, table) ⇒ the full set: ≥4 folders,
  ~12-25 controls, secondary folders collapsed.

When unsure between two tiers, build the smaller one — an under-built panel is a quick add;
an over-built one already cost the developer the wait.

**Identity exception.** A control must be honest. If a value IS the variant's structural
identity (the dark variant's background, the outlined variant's transparent surface), do
not expose it — drop that control by destructuring and leave the literal in the variant:

```ts
const { bg: _bg, ...surface } = sections.surface  // variants own their surface bg
```

**Token resolution.** Selects may return tokens (`shadow: 'lg'`, `family: 'mono'`). The
SHELL resolves tokens to CSS (`SHADOWS` / `FONT_STACKS` from the schemas) and passes plain
CSS values as props. Variants never import from variantkit/schemas — they stay
self-contained (§1).

**Standalone paramify (no variants).** On "paramify this" / "let me tweak this" / "give me
controls for this" for an EXISTING component: wrap it with a full configuration — no
registry, no variants/ folder, no variant select. Just `useDialKit` (or a single-entry
`Studio`) with the adapted archetype + a finalize action, props fed from panel values. On
finalize: inline the final values back as literals and strip the wiring completely (§5
self-check applies, minus the registry/variants boxes).

---

## 8. Taste memory — decisions compound

Every resolved decision is one line in `.variantkit/history/log.jsonl`. The
`overridesFromDefault` fields are the developer telling you, with numbers, where your
defaults were wrong. Use them.

**Distill (after resolving, when history has ≥3 entries).** Write or update
`.variantkit/TASTE.md` with observed preferences. Rules:

- **Grounded only.** Every claim cites ≥2 decisions with the actual values. No claim from
  a single data point; no speculation ("seems to like minimal" is banned — "finalized
  radius 8-12 in 4/4 decisions, always below my default" is the format).
- **Track the dimensions that repeat:** radius range, accent hue temperature, spacing
  density (padding/gap direction vs default), shadow level, type scale, variant character
  (which structural take keeps winning: dense/outlined/dark...).
- **Keep it short** — a scannable bullet list, ≤15 lines, newest evidence first.
- **Update, don't append forever:** revise existing bullets as new decisions land; drop
  bullets the data stops supporting.

Format:

```markdown
# Taste — observed from finalized decisions
<!-- distilled by the agent from .variantkit/history/log.jsonl — grounded claims only -->

- Radius lands 8-12 (18→12, 16→8, 12→10 across PricingCard, Hero, Modal). Default to 10.
- Accents shift cooler + darker (#1F5E54→#175048, #3B82F6→#1D4ED8). Avoid warm accents.
- Picks the densest structural take (slab 2x, compact-table 1x). Offer one dense variant first.
```

**Read back (before generating).** Before scaffolding any variant set or paramify panel,
read `.variantkit/TASTE.md` if it exists. Seed defaults toward the observed preferences —
and still include ONE variant that deliberately breaks the pattern, so taste keeps getting
tested rather than ossified.
