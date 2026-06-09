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
`.cursorrules` so your AI knows to offer variants. Flags: `--dry-run`, `--skip-install`,
`--skill`.

Then add the panel host once, in your app root:

```tsx
import { DialRoot } from 'dialkit'
import 'dialkit/styles.css'
import './variantkit/dialkit-clean.css' // hide the redundant copy button + dividers
import './variantkit/dialkit-dark.css'  // optional dark palette
import './variantkit/motion.css'        // stagger, toast easing, press feedback
// render <App /> and <DialRoot /> as siblings
```

Now ask your agent for *"three takes on the pricing card"*. Switch / tweak / finalize, paste
the decision back, and it prunes to one clean file.

### Many elements? Use the `Studio` helper

```tsx
import { Studio } from './variantkit/react'
<Studio elements={[ /* { name, type, keys, render } per element */ ]} focusOnHover />
```

One panel, a folder per element, contextual controls by element type, per-element finalize,
and focus-on-hover (the folder of the element you hover expands). See
[`examples/contextual`](./examples/contextual).

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
