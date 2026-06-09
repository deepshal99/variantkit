// VariantKit — contextual config presets per element type.
//
// The panel should show controls that fit the ELEMENT being edited: a hero gets align /
// heading size / background; a button gets size / weight / label; a card gets radius /
// padding. When the agent scaffolds a variant set, it picks the preset for the element type
// so the panel is contextual, not a generic radius/accent for everything.
//
// Usage in a component's index.tsx (built on DialKit):
//   const cfg = panelConfig('button', ['solid','outline','ghost'])
//   const v = useDialKit('Button', cfg, { onAction: () =>
//     copyDecision(buildDecision('Button', v, defaultsOf(cfg), regOf(['solid','outline','ghost']))) })

// Loose config shape — these are DialKit config objects; we don't import DialKit's types here
// so the presets stay framework-light. `any` keeps the result assignable to DialKit's own
// config type at the useDialKit call site without coupling this file to DialKit.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Control = any
export type PanelConfig = Record<string, Control>

const ACCENT = '#1F5E54'

// Per-type CONTROL presets (the params only — variant select + finalize are added by panelConfig).
export const elementConfigs: Record<string, PanelConfig> = {
  generic: { radius: [12, 0, 32], accent: ACCENT },
  card: {
    radius: [12, 0, 32],
    padding: [24, 12, 48],
    accent: ACCENT,
    shadow: { type: 'select', options: ['none', 'soft', 'strong'], default: 'soft' },
    theme: { type: 'select', options: ['light', 'dark'], default: 'light' }, // design-system both-modes
  },
  button: {
    radius: [10, 0, 24],
    size: { type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
    weight: [600, 400, 800],
    accent: ACCENT,
    label: 'Get started',
    fullWidth: false,
    theme: { type: 'select', options: ['light', 'dark'], default: 'light' },
  },
  hero: {
    eyebrow: 'New',
    headingSize: [48, 28, 72],
    align: { type: 'select', options: ['left', 'center'], default: 'center' },
    theme: { type: 'select', options: ['light', 'dark'], default: 'light' },
    accent: ACCENT,
  },
  badge: {
    radius: [999, 0, 999],
    size: { type: 'select', options: ['sm', 'md'], default: 'sm' },
    uppercase: true,
    label: 'Beta',
    accent: ACCENT,
    theme: { type: 'select', options: ['light', 'dark'], default: 'light' },
  },
  input: {
    radius: [8, 0, 20],
    size: { type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
    label: 'Email',
    placeholder: 'you@company.com',
    accent: ACCENT,
  },
  nav: { gap: [24, 8, 48], sticky: true, accent: ACCENT },
  banner: {
    radius: [12, 0, 28],
    align: { type: 'select', options: ['left', 'center'], default: 'left' },
    dismissible: true,
    accent: ACCENT,
  },
  table: {
    density: { type: 'select', options: ['compact', 'cozy', 'comfortable'], default: 'cozy' },
    striped: true,
    radius: [10, 0, 20],
    headerWeight: [600, 400, 800],
    accent: ACCENT,
  },
  avatar: {
    size: [40, 24, 96],
    radius: [999, 0, 999],
    ring: false,
    accent: ACCENT,
  },
  toast: {
    radius: [10, 0, 24],
    position: { type: 'select', options: ['top', 'bottom'], default: 'bottom' },
    duration: [3000, 1000, 8000],
    accent: ACCENT,
    transition: { type: 'spring', visualDuration: 0.4, bounce: 0.3 }, // how it springs in/out
  },
  tabs: {
    size: { type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
    gap: [24, 8, 48],
    accent: ACCENT,
    transition: { type: 'spring', visualDuration: 0.3, bounce: 0.2 }, // active-indicator slide
  },
}

const RESERVED = new Set(['variant', 'finalize'])

// Assemble the full DialKit config for a variant set: variant select + the type's controls +
// a finalize action. Unknown types fall back to `generic`.
export function panelConfig(
  type: string,
  variantKeys: string[],
  opts?: { finalizeLabel?: string; component?: string },
): PanelConfig {
  const params = elementConfigs[type] ?? elementConfigs.generic
  return {
    variant: { type: 'select', options: variantKeys, default: variantKeys[0] },
    ...params,
    finalize: { type: 'action', label: opts?.finalizeLabel ?? `Finalize ${opts?.component ?? type}` },
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
