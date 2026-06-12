# Quickstart

## Vite (React 18+)

```sh
cd your-app
npx github:deepshal99/variantkit
npm run dev
```

The installer wires everything: deps, runtime at `src/variantkit/`, the `variantkit()`
plugin in `vite.config`, `<DialRoot/>` + `<VariantBar/>` in `src/main.tsx`, the agent
contract, and `.variantkit/` in `.gitignore`. Verify with
`npx github:deepshal99/variantkit doctor`.

## Next.js (App or Pages Router)

```sh
cd your-app
npx github:deepshal99/variantkit
npm run dev
```

Same, except the transport is an API route (`app/api/__variantkit/decision/route.ts` or
`pages/api/__variantkit/decision.ts`, dev-only) and the chrome mounts in `app/layout.tsx`.

## The loop

1. Ask your agent: **"give me three takes on the `<component>`"** — it scaffolds
   `Component/{index.tsx, registry.ts, variants/*.tsx}` with a full archetype panel.
2. Switch with the bottom bar or **keys 1-9**. **Compare** = live side-by-side grid.
3. Tweak anything in the DialKit panel (folders: layout, surface, typography, color, motion).
4. **Finalize** — the decision lands in `.variantkit/decisions/<Component>.json`.
5. Tell your agent: **"apply decision"** — it inlines your values into the winner, deletes
   the losers, strips all tool wiring. Plain component remains.

Other phrases the agent understands: **"paramify this"** (full panel on an existing
component, no variants) · **"deslop"** (strip AI-looking tells) · decisions auto-feed
`.variantkit/TASTE.md` after 3+ finalizes.

## Decision schema (v2)

What Finalize produces — flat dot-paths so folder-grouped panels stay inlineable:

```jsonc
{
  "schema": 2,
  "component": "PricingCard",
  "finalized": "slab",                       // winner key
  "values": { "surface.radius": 12, "color.accent": "#175048", /* ... */ },
  "overridesFromDefault": {                  // only what YOU changed — the taste signal
    "surface.radius": { "from": 18, "to": 12 }
  },
  "prune": ["ledger", "inverse"],            // losers to delete
  "status": "pending",
  "timestamp": "..."
}
```

Full contract (scaffold convention, prune algorithm, panel rules, deslop, taste):
[`AGENT.md`](../AGENT.md).

## Troubleshooting

- `npx ... doctor` — 12 checks with fix-its (deps, mount, styles, transport, pointer, skill).
- Finalize says "copied to clipboard" — the dev transport isn't reachable; paste the JSON
  to your agent (same result), or re-run init / check the vite plugin / Next route.
- Bar not visible — it appears only when a variant set is registered (a panel with a
  `variant` select + `finalize` action) and only in dev builds.
- Full uninstall: `npx github:deepshal99/variantkit remove` (leaves `git status` clean).
