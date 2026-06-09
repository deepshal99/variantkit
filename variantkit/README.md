# VariantKit (v0, on DialKit)

AI-assisted UI exploration: your agent generates N structural variants instead of one, you
switch/tweak/finalize live in a panel, and the agent prunes the losers to a clean component.
Built on [DialKit](https://github.com/joshpuckett/dialkit) — DialKit is the panel; VariantKit
adds variant-switching, the finalize decision, and the prune contract.

## Install it in another project

**Easiest — straight from GitHub, no clone, no publish.** From inside the target project:

```sh
npx github:deepshal99/variantkit          # set up this project
npx github:deepshal99/variantkit --skill  # also install the global skill (every project)
```

**Or from a local clone** (no network needed beyond the npm step):

```sh
node /path/to/this-repo/variantkit/init.mjs /path/to/your/project
```

Either way it runs `npm i dialkit motion`, copies `buildDecision.ts` into your project,
copies `AGENT.md` (the agent contract), and appends a pointer to your `CLAUDE.md` /
`AGENTS.md` / `.cursorrules` so your AI knows to offer variants. Flags: `--dry-run`,
`--skip-install`, `--skill`.

Then add `<DialRoot/>` as a sibling of your app root, import `dialkit/styles.css`, and ask
your agent for "three takes on the pricing card". See `examples/sandbox/` for a wired example.

## Make your AI offer variants in *every* project (Claude Code)

Pass `--skill` to `init` (above), or copy the skill manually:

```sh
cp -r /path/to/this-repo/variantkit/skill ~/.claude/skills/variantkit
```

Now in any project, the agent proactively offers variants for open-ended UI requests and
handles `deslop`. (Per-project, still run `init` once for the runtime.)

## What's in here

- `buildDecision.ts` — the only runtime file (pure; override diff + prune list + clipboard).
- `init.mjs` — the per-project installer.
- `skill/SKILL.md` — the global Claude Code skill.
- `../AGENT.md` — the contract: when to offer variants, the file-per-variant convention, the
  decision schema, the prune algorithm, and the deslop rules.

## Future (not built yet)

`npx variantkit init` after an npm publish; the custom VariantKit panel (the UI/UX spec);
the dev-server decision plugin; MCP. See the repo's `TODOS.md`.
