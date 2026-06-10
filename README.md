# VariantKit

AI-assisted UI exploration. Instead of your agent committing to one interpretation of a UI
request, it generates **N structural variants**. You switch, tweak, and finalize live in a
panel — then the agent **prunes the losers down to one clean component**, untouched by you.

Built on [DialKit](https://github.com/joshpuckett/dialkit): DialKit is the live panel;
VariantKit adds variant-switching, the finalize decision, the prune contract, and baked-in
deslop so generated UI doesn't look AI-generated.

## Install in any project

From inside your project:

```sh
npx github:deepshal99/variantkit            # set up this project
npx github:deepshal99/variantkit --skill    # also install the global Claude Code skill
```

It runs `npm i dialkit motion`, drops `buildDecision.ts` into `src/variantkit/`, copies
`AGENT.md` (the agent contract), and adds a pointer to your `CLAUDE.md` / `AGENTS.md` /
`.cursorrules` so your AI knows to offer variants. It also ships a tiny `patch-package` patch
(`patches/dialkit+1.2.0.patch`) that makes the panel **minimize/expand morph delightful** — a
soft-bloom expand, a clean-tuck collapse, and a hover-lift bubble (the one thing CSS can't
reach, since it's a hardcoded motion spring). The patch is pinned to dialkit 1.2.0 and applied
via a `postinstall` hook; it's entirely non-fatal — the panel works regardless. Flags:
`--dry-run`, `--skip-install`, `--skill`.

Then add the panel host once, in your app root:

```tsx
import { DialRoot } from 'dialkit'
import 'dialkit/styles.css'
import './variantkit/dialkit-clean.css' // hide the redundant copy button + dividers
import './variantkit/dialkit-dark.css'  // optional dark palette
import './variantkit/motion.css'        // panel-only motion (press feedback, theme cross-fade)
// render <App /> and <DialRoot /> as siblings
```

Now ask your agent for *"three takes on the pricing card"*. Switch / tweak / finalize, paste
the decision back, and it prunes to one clean file.

### Many elements? Use the `Studio` helper

```tsx
import { Studio } from './variantkit/react'
<Studio elements={[ /* { name, keys, controls, render } per element */ ]} focusOnHover />
```

One panel, a folder per element, per-element finalize, and focus-on-hover (the folder of the
element you hover expands — panel-side only, nothing is drawn over your UI). `controls` is
authored per element by your agent — any DialKit control, contextual to that element, with
defaults from your project's design system. VariantKit never decides what the controls are.
See [`examples/contextual`](./examples/contextual).

## How it works

```
ask for UI ──► agent scaffolds 2-4 variants ──► you switch / tweak in the panel
   ──► Finalize ──► decision.json (winner + override diff + prune list)
   ──► agent prunes: inline winner, delete losers, strip the tooling ──► clean component
```

The prune is mechanical (delete files + one rename + inline literals), which is why it's
reliable. The contract lives in [`AGENT.md`](./AGENT.md). A wired example is in
[`examples/sandbox`](./examples/sandbox). More detail in
[`variantkit/README.md`](./variantkit/README.md).

## Status

v0 — built on DialKit, single-component variant sets, clipboard handoff. Deferred: the custom
panel UI, a dev-server decision plugin, MCP, npm publish. See [`TODOS.md`](./TODOS.md).

## License

MIT
