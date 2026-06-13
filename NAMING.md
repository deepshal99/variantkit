# VariantKit — Vocabulary

One word per concept, used the same way everywhere (code, UI, docs, agent contract). If a
term here conflicts with how you named something, this file wins — rename the code.

## The core nouns

| Term | Means | Not to be called |
|------|-------|------------------|
| **Element** | The UI thing being designed: a pricing card, a button, a hero. The subject of a session. | "component" (too generic), "widget" |
| **Variant** | One structural take on an element — different code/layout, same role (Slab vs Ledger vs Inverse). The agent generates several. | "version", "option" (fine in plain English, but the type is `variant`) |
| **Control** | One tunable setting of an element (radius, accent, padding). | "param" (ok internally), "knob" |
| **Configuration** | The full set of controls exposed for an element — the settings panel for it. Authored per element by the agent, contextual; there is no predefined menu. | "config object" (that's the DialKit wiring, see below), "preset" |
| **Defaults** | The frozen reference values a variant ships with. The override diff is measured against these. | "initial" |
| **Override** | A control whose value differs from its default — the "taste signal". The set of them = the **override diff**. | "change", "delta" |
| **Finalize** | Committing the chosen variant + its current values. Produces a decision. | "save", "submit" |
| **Decision** | The machine-readable result of finalize: `{ component, finalized, values, overridesFromDefault, prune, … }`. The handoff to the agent. | "result", "output" |
| **Prune** | The agent deleting the losing variants down to the clean winner. | "cleanup", "resolve" |

## Supporting terms

| Term | Means |
|------|-------|
| **Panel** | The floating dev-time UI that hosts the controls (DialKit). One panel per session. |
| **Folder** | One element's collapsible section inside the single panel. One folder = one element. |
| **Registry** | Map of variant key → component, per element. Used to render the active variant and to compute the prune list. |
| **Set** (variant set) | An element plus its variants + registry + the shell that wires them. What the agent scaffolds. |
| **DialKit config object** | The technical config you pass to `useDialKit` (controls + the `variant` select + the `finalize` action). The *implementation* of a Configuration. Don't say "config" when you mean the user-facing Configuration. |
| **Archetype** | A per-element-family CHECKLIST of design axes (`variantkit/schemas/archetypes.ts`) used to assemble a complete Configuration — adapted per element and seeded from the project's values, never pasted as-is. |
| **Section** | One design dimension's worth of controls (layout, surface, typography, color, motion, states) — the building blocks archetypes compose. |
| **Paramify** | Wrapping an EXISTING component in its full Configuration (no variants) so the user can tune it live, then inline the result. |
| **Transport** | The dev-only channel (vite plugin / Next route) that carries a Decision from Finalize into `.variantkit/decisions/`. Clipboard is the fallback. |
| **Compare** | VariantBar's side-by-side mode: every variant rendered live in a grid (VariantStage). |
| **Taste** | `.variantkit/TASTE.md` — grounded preferences distilled from resolved Decisions, read back before generating. |

## One sentence, all of it

> The agent scaffolds a **set** of **variants** for an **element**; you tune each variant's
> **controls** (its **configuration**) in the **panel**; you **finalize** the winner, which
> writes a **decision**; the agent **prunes** the losers to a clean component.
