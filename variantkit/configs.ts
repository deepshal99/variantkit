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

import { SHADOWS, FONT_STACKS } from './schemas/sections'

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

// Flatten a (possibly nested) config into the path→default map DialKit addresses values by:
// dot-joined raw keys (`headingSize`, `Pricing Card.accent`). Used by the header Reset button
// to push every control — INCLUDING the variant — back to where it started. Folders are plain
// objects without a `type`; `_`-prefixed keys (e.g. `_collapsed`) and actions are skipped.
export function flatDefaults(cfg: PanelConfig, prefix = ''): Record<string, number | string | boolean> {
  const out: Record<string, number | string | boolean> = {}
  for (const [key, c] of Object.entries(cfg)) {
    if (key.startsWith('_') || c == null) continue
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof c === 'number' || typeof c === 'string' || typeof c === 'boolean') {
      out[path] = c
    } else if (Array.isArray(c)) {
      out[path] = c[0] as number
    } else if (typeof c === 'object') {
      const o = c as { type?: string; default?: unknown }
      if (o.type === 'action') continue
      if (o.type) {
        if (o.default !== undefined) out[path] = o.default as number | string | boolean
      } else {
        Object.assign(out, flatDefaults(c as PanelConfig, path)) // nested folder of controls
      }
    }
  }
  return out
}

// The archetype section folders resolvePanel flattens. Anything not in here (the element's own
// top-level controls, or a custom folder you authored) is left exactly as-is.
const SECTIONS = new Set(['layout', 'surface', 'typography', 'color', 'motion', 'states'])

// Turn the panel's live values (nested archetype folders, token selects as keywords) into the
// flat, render-ready props a variant component consumes — so `render` is a one-liner:
//
//   render: (variant, v) => <Card variant={variant} {...resolvePanel(v)} />
//
// It does exactly the mechanical work a shell used to hand-write every time: lifts the standard
// section folders (layout/surface/typography/color/motion/states) up one level, resolves the
// token selects to CSS (`shadow`/`hoverShadow` → SHADOWS, `family` → FONT_STACKS), and coerces
// `weight` to a number. `variant`, `finalize`, and `_`-prefixed keys are dropped. This is a
// RENDER-time convenience only — buildDecision still sees the raw token-space values, so the
// taste signal is unchanged. If you keep two same-named keys across folders (e.g. surface.bg and
// color.bg), the later folder wins; alias one in the archetype or map it by hand.
export function resolvePanel(
  values: Record<string, unknown>,
  opts?: { shadows?: Record<string, string>; fonts?: Record<string, string> },
): Record<string, unknown> {
  const shadows = opts?.shadows ?? SHADOWS
  const fonts = opts?.fonts ?? FONT_STACKS
  const out: Record<string, unknown> = {}
  const put = (k: string, v: unknown) => {
    if (k === 'variant' || k === 'finalize' || k.startsWith('_')) return
    if ((k === 'shadow' || k === 'hoverShadow') && typeof v === 'string') out[k] = shadows[v] ?? v
    else if (k === 'family' && typeof v === 'string') out[k] = fonts[v] ?? v
    else if (k === 'weight') out[k] = typeof v === 'string' ? Number(v) : v
    else out[k] = v
  }
  for (const [k, v] of Object.entries(values)) {
    if (SECTIONS.has(k) && v && typeof v === 'object' && !Array.isArray(v)) {
      for (const [kk, vv] of Object.entries(v as Record<string, unknown>)) put(kk, vv)
    } else put(k, v)
  }
  return out
}

// Immutably drop owned axes from an archetype before it becomes the panel — the structural
// knobs a variant owns (its surface bg, fg identity, hover states) shouldn't be dials. Replaces
// the per-shell destructuring dance with one call:
//
//   const controls = dropAxes(pricingArchetype({...}), ['states', 'surface.bg', 'color.bg'])
//
// Dot-paths address nested folders ('surface.bg'); a bare key drops a whole folder or top-level
// control ('states', 'priceSize'). Missing paths are no-ops.
export function dropAxes(config: PanelConfig, paths: string[]): PanelConfig {
  const clone = structuredClone(config)
  for (const path of paths) {
    const parts = path.split('.')
    let obj: Record<string, unknown> | undefined = clone
    for (let i = 0; i < parts.length - 1 && obj; i++) obj = obj[parts[i]] as Record<string, unknown>
    if (obj) delete obj[parts[parts.length - 1]]
  }
  return clone
}
