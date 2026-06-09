# VariantKit — Phase Plan

Source: approved design doc (`~/.gstack/projects/variant-kit/deepakmaurya-milan-v1-design-20260608-232508.md`)
Decisions locked in plan-eng-review: **Architecture 1 (build on DialKit)** · 1A · 3A · 4A.
Branch: `deepshal99/milan-v1`

## The whole plan in one picture

```
  PHASE C — Prove the Prune (no prod code)          PHASE A — Spike on DialKit
  ┌───────────────────────────────────┐            ┌────────────────────────────────────┐
  │ C1 write the convention (AGENT.md) │            │ A1 scaffold Vite+React+DialKit       │
  │ C2 hand-author 1 variant set       │  5/5 clean │ A2 wire VariantKit-on-DialKit        │
  │ C3 run prune 5×, capture fixture   │ ─────────► │ A3 tests (buildDecision + fixture)   │
  │     GATE: deterministic prune?     │   (gate)   │ A4 run the full loop, feel the "whoa" │
  └───────────────────────────────────┘            └────────────────────────────────────┘
        risk killed here ▲                                 only build after gate passes ▲
```

**Hard gate:** Phase A does not start until Phase C hits 5/5 clean prunes. The whole
point of the order is to kill the one risk (prune determinism) before writing app code.

---

## PHASE C — Prove the Prune

**Goal:** confirm a coding agent prunes a file-per-variant component down to one clean
file, deterministically, with zero residue and no manual fixup.
**Acceptance:** 5 consecutive prunes (different winners) produce a clean component —
zero VariantKit/DialKit imports, zero leftover variant files, no hand-editing.
**Produces no production code.** Output is `AGENT.md` + a before/after fixture + a go/no-go.

### Wave C1 — Write the convention
- **C1.T1** Draft `AGENT.md`: the file-per-variant layout, registry shape, and the prune
  algorithm. Encode **1A** explicitly: the winner is promoted by *file rename + one
  export edit*, never by moving JSX into `index.tsx`. Encode **4A**: every variant must
  declare the same shared transition so switching morphs, not snaps.
- **C1.T2** Pin the `decision.json` schema in `AGENT.md` (depends: nothing):
  `component, finalized, values, overridesFromDefault{from,to}, prune[], note, status, timestamp`.
- **C1.T3** Specify the concrete file layout the agent must produce and prune:
  ```
  PricingCard/
    index.tsx        thin shell: registry + render active (the ONLY file with VK wiring)
    variants/
      ledger.tsx     one component per variant, shared transition
      slab.tsx
      inverse.tsx
    registry.ts      maps key -> component + param config
  prune target:  PricingCard/index.tsx re-exports slab.tsx (renamed); variants/ + registry.ts deleted
  ```

### Wave C2 — Hand-author one real variant set
- **C2.T1** Pick `PricingCard`. Write 3 variant files (`ledger`, `slab`, `inverse`) the
  convention's way; each carries the shared transition (depends: C1.T1, C1.T3).
- **C2.T2** Write `registry.ts` + `index.tsx` thin shell. No DialKit yet — hardcode the
  active key and render statically. This isolates the *convention* from the *panel*.
- **C2.T3** Hand-write a `decision.json` (winner `slab`, `prune: [ledger, inverse]`, 1-2
  overrides) per the C1.T2 schema (depends: C1.T2, C2.T1).

### Wave C3 — Run the experiment (the gate)
- **C3.T1** Feed `AGENT.md` + `decision.json` to your agent; run the prune; inspect for
  residue (leftover imports, files, dead registry) (depends: C1, C2).
- **C3.T2** Repeat 5× with different winners. Log each: clean, or the failure + which
  line of `AGENT.md` wording caused it. Treat every failure as a convention-wording bug,
  not a code bug; revise `AGENT.md` and re-run.
- **C3.T3** Capture the proven case as a fixture: commit `fixture/before/` (the variant
  set) and `fixture/after/` (the expected clean component). This becomes A3's regression
  target.
- **GATE:** 5/5 clean → Phase A. Flaky after wording fixes → stop, reconsider the layout
  (1B/1C fallback) before any app code.

---

## PHASE A — The Spike on DialKit

**Goal:** in one running app, switch variant + tweak params + Finalize → decision on the
clipboard → paste to agent → losers pruned, untouched by you.
**Acceptance:** the full loop runs; Finalize copies a valid `decision.json`; clipboard
fallback works in an insecure context; `buildDecision` is unit-tested; the fixture from
C3 passes as a regression check.

### Wave A1 — Scaffold
- **A1.T1** Vite + React + TypeScript app in `examples/sandbox/`.
- **A1.T2** `npm i dialkit motion`; add `<DialRoot/>` as a **sibling** of `{children}` in
  the root (not wrapping); import `dialkit/styles.css` (depends: A1.T1).
- **A1.T3** Port the *proven* Phase C variant set (`PricingCard` + 3 variants + registry
  + the validated `AGENT.md`) into the app (depends: C gate, A1.T1).

### Wave A2 — Wire VariantKit-on-DialKit
- **A2.T1** One `useDialKit('PricingCard', { variant: {type:'select', options:[...]},
  ...params, finalize: {type:'action'} }, { onAction })`. Render the active component by
  switching on `v.variant`. No custom panel (depends: A1).
- **A2.T2** `core/buildDecision.ts` — pure, no React. Computes `finalized`, the
  `overridesFromDefault` diff (only-changed keys, shared+active merge, `#hex` ≠ number
  equality, empty-on-no-change), and the `prune` list (non-winner options). This is the
  one pure module the eng review kept (depends: C1.T2 schema).
- **A2.T3** `onAction` → `buildDecision` → clipboard write, with the **TODO 2**
  insecure-context fallback (textarea-select / show JSON) + a toast or console
  confirmation so finalize never fails silently (depends: A2.T1, A2.T2).

### Wave A3 — Tests (3A)
- **A3.T1** Unit-test `buildDecision` exhaustively: only-changed keys, shared+active
  merge order, `#FFF` vs `#ffffff`, number vs string, no-change → `{}` (depends: A2.T2).
- **A3.T2** Wire the C3 `before/after` fixture as a regression check on the prune target
  (depends: C3.T3, A2).
- **A3.T3** (optional) RTL smoke: clicking Finalize produces the expected payload
  (depends: A2.T3).

### Wave A4 — Feel it / decide phase B
- **A4.T1** Run the full loop once unattended-ish: Finalize → paste decision → agent
  prunes → confirm zero residue (depends: A1-A3).
- **A4.T2** Go/no-go on Phase B (custom panel from the UI/UX doc + packaging). Update
  `TODOS.md` TODO 1 with the decision. Run `/plan-design-review` on the UI/UX doc only if
  building the custom panel.

---

## Dependencies & ordering

```
C1 ──► C2 ──► C3 ══GATE══► A1 ──► A2 ──► A3 ──► A4
        │                          ▲
   C1.T2 schema ────────────────► A2.T2 buildDecision
   C3.T3 fixture ───────────────► A3.T2 regression
```

## Failure modes carried from eng review

| Risk | Where handled |
|---|---|
| Prune non-deterministic (the core bet) | Phase C gate; 1A layout |
| `navigator.clipboard` undefined (silent finalize) | A2.T3 fallback (TODO 2) |
| Variant switch snaps instead of morphs | 4A shared-transition in AGENT.md (C1.T1) |
| Override-diff subtly wrong (taste signal) | A3.T1 unit tests |
| localStorage failure / last-survivor | eliminated — DialKit owns store, v0 has no remove-variant |

## Out of scope (deferred to Phase B)

Custom VariantKit panel (tabs, finalize drawer, badge, Locate), the 6-package monorepo,
Vite/Next decision plugin, MCP, SSR/prod-hardening, multi-set UX. See `TODOS.md`.
