# VariantKit — TODOs

Design doc: `~/.gstack/projects/variant-kit/deepakmaurya-milan-v1-design-20260608-232508.md`
Plan: prove the prune (phase C), then build the spike ON DialKit (phase A, Architecture 1).

---

## Deferred (phase B — after the prune loop is proven)

### Panel + packaging decision
- **What:** Decide whether to build the custom VariantKit panel (UI/UX doc: variant tabs,
  amber DECISION HANDOFF drawer, multi-set badge, Locate) and whether to ship standalone
  vs. as a DialKit "mode"/PR.
- **Why:** Architecture 1 deliberately shelves the entire UI/UX spec and lives inside
  DialKit's auto-generated panel. Right for proving the prune; leaves the nicest design
  work unbuilt and the long-term shape (PRD §10.1) open.
- **Context:** v0 proves the prune with ~50 lines on DialKit (variant = a `select`,
  finalize = an `action`). If the loop feels good, the question becomes: keep riding
  DialKit's panel, build the custom unified panel (Architecture 2), or fork/PR DialKit
  (Architecture 3). DialKit is MIT and Puckett invites ports (TweakPine, dialkit-ui,
  dialkit-rails, iOS), so a "variants mode" PR is socially viable. DialKit does NOT export
  controls/store, so Architecture 2 means rebuilding ~70% for a unified panel — only worth
  it if you outgrow the single-select-per-component model.
- **Depends on:** Phase A loop working + wanting more than one-component/single-select UX.
- **When you pick this up:** run `/plan-design-review` on the UI/UX doc first. It was
  skipped now (2026-06-09) on purpose — v0 uses DialKit's panel, so there was no custom
  UI to review. The UI/UX doc is ~8.5/10 as a spec; the review would harden empty states,
  multi-set badge at scale, error/failure UX, and long-label/RTL edge cases before build.

---

## Phase A spike — required (not deferred)

### Clipboard fallback for insecure contexts
- **What:** In the finalize `onAction`, handle `navigator.clipboard` being undefined
  (non-HTTPS / non-localhost, older webviews) — fall back to a visible textarea-select or
  render the decision JSON for manual copy.
- **Why:** The whole v0 handoff is clipboard. If `navigator.clipboard` is missing,
  finalize silently does nothing — the one user-facing path fails invisibly.
- **Context:** `navigator.clipboard.writeText` needs a secure context. Localhost counts as
  secure, so day-to-day is fine — but a dev URL over plain HTTP (LAN preview, some Docker
  setups) breaks it. Catch the rejection/undefined and surface the JSON.
- **Depends on:** Phase A finalize handler existing.

---

## Locked review decisions (for reference)

- **Architecture 1:** build v0 on DialKit (`useDialKit` select + controls + action;
  VariantKit owns variant→component map, `buildDecision`, file-per-variant convention, prune).
- **1A:** file layout so the winner is promoted by rename + one export edit, never by
  moving JSX into index — maximizes prune determinism (the project's core bet).
- **3A:** unit-test `buildDecision` (override-diff: only-changed keys, shared merge,
  hex≠number, empty-on-no-change) + capture phase-C prune as a before/after fixture.
- **4A:** AGENT.md mandates a shared transition on all variants so switching morphs, not
  snaps (rides DialKit's `motion`).
