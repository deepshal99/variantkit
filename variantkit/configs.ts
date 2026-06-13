// VariantKit — panel assembly helpers. VariantKit does NOT decide what the controls are.
//
// The agent building the project authors the controls per element — contextual, specific,
// derived from that element's actual design axes and the project's design system. Any control
// DialKit supports is fair game: slider, select, toggle (boolean), color, text, spring /
// transition, nested folder groups. There is no preset menu and no VariantKit default value:
// every default comes from the project (its tokens, or the element's current values).
//
// VariantKit's only additions are structural:
//   - a `variant` select (only when there are 2+ variants)
//   - a `finalize` action
//
// Usage in a component's index.tsx (built on DialKit):
//   const cfg = panelConfig(
//     { tone: { type: 'select', options: ['quiet','bold'], default: 'quiet' },  // yours,
//       accent: tokens.brand, compact: false },                                  // per element
//     ['solid', 'outline', 'ghost'],
//     { component: 'Button' },
//   )
//   const v = useDialKit('Button', cfg, { onAction: () =>
//     copyDecision(buildDecision('Button', v, defaultsOf(cfg), regOf(['solid','outline','ghost']))) })

// Loose config shape — these are DialKit config objects; we don't import DialKit's types here
// so the helpers stay framework-light. `any` keeps the result assignable to DialKit's own
// config type at the useDialKit call site without coupling this file to DialKit.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Control = any
export type PanelConfig = Record<string, Control>

const RESERVED = new Set(['variant', 'finalize'])

// Assemble the full DialKit config for a variant set: [variant select +] the element's own
// controls + a finalize action. With a single variant key, no dropdown is added — the panel
// is just the element's controls + finalize.
export function panelConfig(
  controls: PanelConfig,
  variantKeys: string[],
  opts?: { finalizeLabel?: string; component?: string },
): PanelConfig {
  return {
    // `segmented: true` makes DialKit render the variant as clean separated selection pills
    // (one per take) instead of a dropdown — the variant is the panel's hero choice, so it
    // shows every option at a glance. Pills wrap when names are long / the panel is narrow.
    ...(variantKeys.length > 1
      ? { variant: { type: 'select', options: variantKeys, default: variantKeys[0], segmented: true } }
      : {}),
    ...controls,
    finalize: { type: 'action', label: opts?.finalizeLabel ?? `Finalize ${opts?.component ?? ''}`.trim() },
  }
}

// Resolve the frozen default value of each control — feeds buildDecision's `defaults`.
export function defaultsOf(cfg: PanelConfig): Record<string, number | string | boolean> {
  const out: Record<string, number | string | boolean> = {}
  for (const [key, c] of Object.entries(cfg)) {
    if (RESERVED.has(key)) continue
    if (typeof c === 'number' || typeof c === 'string' || typeof c === 'boolean') {
      out[key] = c
    } else if (Array.isArray(c)) {
      out[key] = c[0] as number
    } else if (c && typeof c === 'object') {
      const o = c as { type?: string; default?: unknown }
      if (o.type === 'action') continue
      if (o.default !== undefined) out[key] = o.default as number | string | boolean
    }
  }
  return out
}

// Convenience: registry object from variant keys, for buildDecision's prune computation.
export function regOf(variantKeys: string[]): Record<string, true> {
  return Object.fromEntries(variantKeys.map((k) => [k, true]))
}
