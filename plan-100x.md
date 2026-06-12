# VariantKit 100x Plan

Goal: make VariantKit the must-have tool for UI exploration with AI.
Positioning: **"The configuration panel for AI-built UI. Stop describing tweaks in chat."**

---

## 0. Evaluation of v0 (current state)

### What works (keep, don't rebuild)

| Asset | Evidence |
|---|---|
| The loop concept: variants → live switch → finalize → prune | `AGENT.md` §0–4, PRD |
| Prune contract proven deterministic | `fixture/PRUNE-LOG.md` (3/3 clean) |
| Tiny pure runtime | `variantkit/buildDecision.ts` (125 lines, tested) |
| DialKit foundation (panel, controls, persistence, shortcuts) | `examples/sandbox/node_modules/dialkit/dist/index.d.ts` |
| Installer skeleton + rules pointer + global skill | `variantkit/init.mjs`, `variantkit/skill/SKILL.md` |

### What blocks 100x

1. **Panels are generic, not contextual.** Agent hand-writes 2–3 controls (radius, accent).
   User expectation: *the element's actual configuration panel* — layout, type, color,
   surface, motion, states — 12–25 relevant controls, grouped.
2. **Loop friction.** Finalize → clipboard → manual paste into chat. Should be: finalize →
   file written → agent picks it up.
3. **No VariantKit identity in the panel.** Variant choice is a dropdown inside DialKit's
   panel. No tabs, no compare view, no finalize drawer.
4. **Install is fragile.** GitHub-only npx, TS-only runtime, `src/` heuristic, no DialRoot
   auto-mount, no doctor, no uninstall.
5. **No memory.** Decisions don't compound into taste the agent reads back.
6. **No positioning assets.** No demo GIF, no landing, README is internal-tone.

### The 100x bet

Two entry points, one panel:
- **"Give me 3 takes on X"** → variant set with a *full* contextual panel (existing flow, upgraded).
- **"Paramify this"** → wrap any *existing* component in its own full configuration panel,
  no variants needed. New flow. This is what makes it a daily tool, not an occasional one.

Either way: tweak everything live → Finalize → decision lands on disk → agent inlines and prunes.

---

## Phase 0 output: Allowed APIs (verified against dialkit@1.2.0)

Source: `examples/sandbox/node_modules/dialkit/dist/index.d.ts` (lines cited), `dialkit/README.md`.

**Hooks/components**
- `useDialKit<T>(name, config, { onAction?, shortcuts? })` → typed live values (index.d.ts:153)
- `DialRoot({ position?, defaultOpen?, mode: 'popover'|'inline', theme?, productionEnabled? })` (index.d.ts:158–165)
- Exported control components for custom layouts: `Slider, Toggle, Folder, ButtonGroup, SpringControl, TransitionControl, TextControl, SelectControl, ColorControl, PresetManager` (index.d.ts:167–270)

**Control types** (full set): slider `[def,min,max,step?]`, toggle `boolean`, text, color (hex),
select `{type:'select', options:[{value,label}|string], default?}`, spring, easing/transition,
action `{type:'action', label?}`, folders = nested objects, `_collapsed: true` supported.

**Imperative store** — `DialStore` singleton (index.d.ts:147):
`registerPanel / updateValue(panelId, path, value) / getValue / getValues / subscribe(panelId, fn) / subscribeGlobal / subscribeActions / triggerAction / savePreset / loadPreset / clearActivePreset`.
Dot-paths for nested values. This is the sanctioned hook for custom chrome.

**Shortcuts**: `{ key, modifier?, mode: 'fine'|'normal'|'coarse', interaction: 'scroll'|'drag'|'move'|'scroll-only' }`, dot-paths supported.

**Frameworks**: React 18+, plus `dialkit/vue`, `dialkit/svelte`, `dialkit/solid` (identical API).

**Anti-patterns (these do NOT exist — do not invent):**
- ❌ Custom control type registration — fixed control set only.
- ❌ Panel section/extension API — custom chrome must be a separate overlay using `DialStore`.
- ❌ Non-hex color handling in `buildDecision` diff (`buildDecision.ts:34–48` — hex only).
- ❌ Clipboard API on insecure origins (fallback exists, `buildDecision.ts:89–124`).

---

## Phase 1 — Contextual schema library (the differentiator)

**Outcome:** every panel feels like the element's real configuration panel.

### 1.1 Section builders — `variantkit/schemas/sections.ts` (new)
Pure functions returning DialKit config folders (copy folder shape from dialkit README §Folders,
and control shapes from Phase 0 list). Each accepts current-code defaults:

- `layoutSection({ padding, gap, align, direction, maxWidth })`
- `surfaceSection({ bg, radius, borderWidth, borderColor, shadow })` — shadow as select of elevation presets
- `typographySection({ size, weight, tracking, lineHeight, family })` — family/weight as selects
- `colorSection({ accent, fg, bg, muted })`
- `motionSection({ spring, hoverScale, duration })` — uses DialKit `spring` control
- `statesSection({ hoverBg, hoverShadow, activeScale })`

### 1.2 Archetype schemas — `variantkit/schemas/archetypes.ts` (new)
Compose sections + archetype-specific controls. Ship at least:
`button, card, hero, navbar, modal, form, table, list, badge, pricing, section`.
Example: `button` adds `size: select(sm/md/lg)`, `iconPosition`, `fullWidth: boolean`.
Each archetype = 4+ folders, 12–25 controls, `_collapsed: true` on secondary folders.

### 1.3 Nested decision support — `variantkit/buildDecision.ts` (modify)
Folders return nested objects; current `Decision.values` is flat (`buildDecision.ts:20–29`).
- Flatten with dot-paths (`surface.radius: 12`) in `values` and `overridesFromDefault`.
- Bump `Decision` with `"schema": 2`.
- Update unit tests; re-run against fixture.

### 1.4 Agent contract upgrade — `AGENT.md` (modify)
New §7 "Contextual panel contract":
- **Paramify rule:** every design literal in a variant (px, color, weight, duration, shadow)
  becomes a control. No hardcoded design values left outside the panel during exploration.
- **Minimum bar:** non-trivial element ⇒ pick archetype schema, ≥4 folders. Trivial element
  (icon, divider) may use a flat 3–5 control panel.
- **Standalone paramify flow:** "paramify this / let me tweak this" on an existing component
  ⇒ wrap with archetype panel, no variants, no registry; finalize ⇒ inline values + strip panel.

### 1.5 Skill upgrade — `variantkit/skill/SKILL.md` (modify)
Add paramify trigger phrases ("let me tweak", "give me controls for", "paramify").
Point at archetype list so the agent copies, never invents control shapes.

**Verification**
- [ ] Rewire sandbox PricingCard with `pricing` archetype → panel shows ≥4 folders, ≥12 controls
- [ ] Finalize → decision has dot-path values → agent prune → zero residue (re-run fixture flow)
- [ ] Paramify a fresh non-variant component end-to-end (wrap → tweak → finalize → strip)
- [ ] `grep -r "type: 'custom'" variantkit/` returns nothing (no invented control types)

---

## Phase 2 — Zero-friction decision transport

**Outcome:** Finalize writes a file; the agent applies it. No copy-paste.

### 2.1 `submitDecision()` — `variantkit/buildDecision.ts` (add)
`POST /__variantkit/decision` via fetch; on failure fall back to existing `copyDecision`.
Toast text on success: *"Decision saved — tell your agent: apply decision."*

### 2.2 Vite plugin — `variantkit/vite-plugin.mjs` (new)
`configureServer` middleware (copy pattern from Vite docs, `server.middlewares.use`):
- `POST /__variantkit/decision` → write `.variantkit/decisions/<Component>.json` (pretty),
  append one line to `.variantkit/history/log.jsonl`.
- Reject non-dev / non-localhost.

### 2.3 Next.js template — installer drops `app/api/__variantkit/decision/route.ts`
(or `pages/api` fallback). Dev-only guard (`process.env.NODE_ENV !== 'development'` → 404).

### 2.4 Agent contract — `AGENT.md` §4 (modify)
- On "apply decision" or at session start: scan `.variantkit/decisions/*.json` for
  `status: "pending"` → prune → set `status: "resolved"` → move record to history.
- Clipboard paste path stays as documented fallback.

**Verification**
- [ ] Finalize in sandbox (Vite) → file appears in `.variantkit/decisions/`
- [ ] "apply decision" → prune completes from file, status flips, history line appended
- [ ] Kill dev server → finalize still works via clipboard fallback
- [ ] `.variantkit/` is gitignored by installer

---

## Phase 3 — Panel identity & exploration UX

**Outcome:** exploring feels native: tabs, keyboard, compare grid.

### 3.1 `VariantBar` — `variantkit/react/VariantBar.tsx` (new)
Thin overlay (own chrome, NOT inside DialKit's panel — no extension API exists):
- Variant tabs with labels from registry; active state.
- Drives selection via `DialStore.updateValue(panelId, 'variant', key)`;
  stays in sync via `DialStore.subscribe(panelId, fn)` (index.d.ts:147).
- Finalize button → same `submitDecision` path.
- Multi-set: dropdown when >1 registered set.
- Keys `1..N` switch variants (own keydown listener; skip when input focused — mirror
  DialKit's behavior, README §shortcuts).

### 3.2 `VariantStage` compare mode — `variantkit/react/VariantStage.tsx` (new)
Renders all registry variants in a responsive grid with shared live params
(subscribe to DialStore values). Toggle from VariantBar. Click a card = select that variant.

### 3.3 Polish pass
Apply `make-interfaces-feel-better` baseline to VariantBar/Stage: concentric radii,
tabular numbers, enter/exit transitions via `motion` (already a dep).

**Verification**
- [ ] Tabs + keys 1..N switch variants; DialKit panel select stays in sync (two-way)
- [ ] Compare grid shows all variants reacting live to a param drag
- [ ] Finalize from VariantBar produces byte-identical decision JSON to panel action
- [ ] Production build: VariantBar/Stage tree-shaken or dev-gated (grep prod bundle)

---

## Phase 4 — Bulletproof install

**Outcome:** one command, any React project, zero manual steps, reversible.

### 4.1 `init.mjs` hardening (modify `variantkit/init.mjs`)
- Framework detect via package.json deps: `next` / `vite` / `remix` / fallback.
- TS vs JS detect (tsconfig.json) → copy `.ts` or pre-built `.js` runtime.
- Component dir detect: `src/`, `app/`, `components/` — current heuristic at init.mjs:62 is src-only.
- **Auto-mount codemod:** insert `<DialRoot/>` + `import 'dialkit/styles.css'` into
  `app/layout.tsx` / `src/main.tsx` / `src/App.tsx`. Show diff, `--no-mount` opt-out.
- Wire transport: add vite plugin to `vite.config.*` or drop Next route (Phase 2 artifacts).
- Add `.variantkit/` to `.gitignore`.
- `--skill` becomes default-on with prompt (keep flag to force).

### 4.2 New subcommands (same bin)
- `npx variantkit doctor` — checks: deps installed, DialRoot mounted, styles imported,
  transport reachable, rules pointer present, skill installed. Prints fix-its.
- `npx variantkit remove` — full uninstall: deps, runtime dir, AGENT.md, rules pointer
  block (between `<!-- variantkit -->` markers), mount lines, `.variantkit/`. Zero-residue,
  matching the prune ethos.

### 4.3 Publish
- npm publish as `variantkit` (check name; fallback `@variantkit/cli`). Keep
  `npx github:deepshal99/variant-kit` working.
- Add `repository`, `keywords`, `engines` to package.json.

**Verification**
- [ ] Fresh `create-next-app` + fresh Vite app: init → ask agent for variants → full loop, no manual edits
- [ ] `doctor` passes on both; fails informatively when DialRoot removed
- [ ] `remove` → `git status` clean except lockfile
- [ ] Re-running init twice = no duplicate pointers/mounts (idempotency, init.mjs:101 pattern)

---

## Phase 5 — Taste memory (retention hook)

**Outcome:** every decision makes the next generation better. Compounding value.

### 5.1 History (already appended by Phase 2 plugin)
`.variantkit/history/log.jsonl` — one resolved decision per line.

### 5.2 `TASTE.md` distillation — `AGENT.md` new §8
After resolving a decision, if history ≥3 entries: write/update `.variantkit/TASTE.md` —
observed preferences grounded in data ("radius finalized 8–12 across 4 decisions; accents
shifted cooler 3/4 times; chose densest variant 3/3"). Never speculative.

### 5.3 Read-back rule — rules pointer (init.mjs:84–93 block, modify)
Add: "Before generating variants, read `.variantkit/TASTE.md` if present; bias defaults
toward observed preferences; still offer one variant that breaks the pattern."

**Verification**
- [ ] Replay 3 fixture decisions → agent writes TASTE.md, every claim cites ≥2 decisions
- [ ] Next generation's defaults measurably reflect TASTE.md (radius default within observed range)

---

## Phase 6 — Positioning & launch assets

**Outcome:** people understand it in 10 seconds and install in 30.

- README rewrite around the wedge: *"You: 'three takes on the hero.' VariantKit: a panel with
  every control that matters. You tweak, hit Finalize, the losers vanish from the codebase."*
- 30s demo GIF: variants → tabs → compare grid → tweak → finalize → prune diff.
- Landing page (single page, copy via `copywriting` skill; deslopped).
- Docs: quickstart per framework, archetype gallery (screenshot per archetype panel),
  decision schema v2 reference, "works with Claude Code / Cursor" section.
- Comparison framing: vs asking AI to hand-build a switcher every time; vs Storybook
  controls (storybook = isolated, VariantKit = in your real app + prunes itself).

**Verification**
- [ ] Cold-reader test: someone uninvolved installs + completes a loop using README only
- [ ] GIF under 10MB, shows full loop
- [ ] Landing passes `design-deslop` scan

---

## Final phase — Verification sweep

- [ ] Prune fixture 5× consecutive with nested (schema 2) decisions — zero residue each
- [ ] Cross-framework smoke: Next 15 + Vite 6, TS and JS targets
- [ ] `grep -ri "dialkit\|variantkit" <pruned-component-dir>` → empty after prune
- [ ] `variantkit remove` → grep repo for `variantkit` → only lockfile noise
- [ ] Cross-model prune check (run prune via a second model per TRD §9 bar)

---

## Sequencing & rationale

| Priority | Phase | Why |
|---|---|---|
| P0 | 1 (schemas) | The differentiator. "Real config panel" is the promise. |
| P0 | 2 (transport) | Kills the copy-paste — biggest felt friction. |
| P1 | 4 (install) | Adoption gate. Must precede any public push. |
| P1 | 3 (panel UX) | Delight; tabs + compare = demo material. |
| P2 | 5 (taste) | Retention; needs 2's history first. |
| P2 | 6 (launch) | Last; demos phases 1–3. |

## Open decisions (resolve before/during phases)

1. **Decision schema 2** (nested dot-paths) — contract change; update AGENT.md + fixtures together.
2. **npm name** — check `variantkit` availability before Phase 4.3.
3. **Compare mode scope** — VariantStage can slip to post-launch if Phase 3 runs long; tabs cannot.
4. **DialKit coupling** — stay on documented `DialStore` surface only; never fork/patch. If
   DialKit breaks the store API, vendoring is the fallback, not patching.
