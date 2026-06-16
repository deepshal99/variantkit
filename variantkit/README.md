# variantkit/ — what gets installed

This directory is the distributable. `init.mjs` copies the runtime into a target project
and wires everything; see the [repo README](../README.md) for positioning and
[docs/quickstart.md](../docs/quickstart.md) for usage.

```sh
npx variantkit@latest [init|doctor|remove] [targetDir] [flags]
```

- `buildDecision.ts` — pure core: dot-path flatten (schema 2), override diff (taste
  signal), prune list, `submitDecision` (dev transport, "✓ Saved") with clipboard fallback
  ("✓ Copied"), `defaultsFromConfig`
- `configs.ts` — panel assembly helpers (`panelConfig`, `defaultsOf`, `regOf`); VariantKit
  adds only the variant select + finalize around YOUR controls
- `schemas/sections.ts` — composable control sections + token resolvers (SHADOWS, FONT_STACKS)
- `schemas/archetypes.ts` — 11 per-element checklists of design axes (see
  [docs/archetypes.md](../docs/archetypes.md)) — adapt + seed, never paste
- `react.tsx` — `Studio` (N elements → one panel, folder each, finalize routing,
  focus-on-hover) + `useDialkitTheme` (panel dark mode with header toggle)
- `react/VariantBar.tsx` — bottom bar: variant tabs, keys 1-9, Compare, Finalize;
  auto-discovers sets (shell or Studio layout) from DialKit's documented store
- `react/VariantStage.tsx` — live side-by-side compare grid for the classic shell
- `dialkit-clean.css` / `dialkit-dark.css` / `motion.css` — panel chrome polish (hide
  redundant copy button, dark palette, micro-motion; never touches project UI)
- `patches/dialkit+1.2.0.patch` — delightful panel minimize/expand morph (patch-package)
- `vite-plugin.mjs` (+ `.d.mts`) — dev-only decision transport for Vite
- `templates/` — Next.js App/Pages Router transport routes
- `skill/SKILL.md` — global Claude Code skill (installed to `~/.claude/skills/variantkit`)
- `../AGENT.md` — the agent contract: scaffold convention, authoring rules, decision
  schema 2, prune + self-check, §7 completeness bar, §6 deslop, §8 taste memory
- `../NAMING.md` — the vocabulary (one word per concept)
