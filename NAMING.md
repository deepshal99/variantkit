# VariantKit — Vocabulary

One word per concept, used the same way everywhere (code, UI, docs, agent contract). If a
term here conflicts with how you named something, this file wins — rename the code.

## The core nouns

| Term | Means | Not to be called |
|------|-------|------------------|
| **Element** | The UI thing being designed: a pricing card, a button, a hero. The subject of a session. | "component" (too generic), "widget" |
| **Variant** | One structural take on an element — different code/layout, same role (Slab vs Ledger vs Inverse). The agent generates several. | "version" (means snapshot), "option" (fine in plain English, but the type is `variant`) |
| **Control** | One tunable setting of an element (radius, accent, padding). | "param" (ok internally), "knob" |
| **Configuration** | The full set of controls exposed for an element — the settings panel for it. Contextual to the element type. | "config object" (that's the DialKit wiring, see below) |
| **Preset** | The predefined configuration for an element *type* (`card`, `button`, `hero`…) in `configs.ts`. Pick one; extend when a type recurs. | "template" |
| **Defaults** | The frozen reference values a variant ships with. The override diff is measured against these. | "initial" |
| **Override** | A control whose value differs from its default — the "taste signal". The set of them = the **override diff**. | "change", "delta" |
| **Snapshot** | A saved (variant + control values) state kept so you can compare two tunings of the same element. (See "presets, reconsidered" in AGENT.md.) | "preset" (that's the per-type config), "version" |
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

## One sentence, all of it

> The agent scaffolds a **set** of **variants** for an **element**; you tune each variant's
> **controls** (its **configuration**) in the **panel**, optionally keeping **snapshots** to
> compare; you **finalize** the winner, which writes a **decision**; the agent **prunes** the
> losers to a clean component.
