// VariantKit section builders — composable chunks of a DialKit config. Each returns a
// plain config object (a DialKit folder body) covering one design dimension with the
// controls that dimension actually needs. Archetypes (./archetypes.ts) compose these
// into full panels so an element's panel feels like its real configuration panel,
// not 2-3 loose sliders.
//
// Pure data — no imports from dialkit/react. Pass current-code values as overrides so
// the panel opens matching what's rendered:
//
//   surface: surfaceSection({ radius: 16, bg: '#0A0A0A' })
//
// Drop a control you don't need by destructuring:
//
//   const { maxWidth, ...layout } = layoutSection()

export type SelectOption = string | { value: string; label: string }
export type Select = { type: 'select'; options: SelectOption[]; default?: string }
export type Color = { type: 'color'; default?: string }
export type Slider = [number, number, number] | [number, number, number, number]
export type Spring = { type: 'spring'; visualDuration?: number; bounce?: number; stiffness?: number; damping?: number; mass?: number }
export type SectionConfig = Record<string, unknown>

export interface SectionOpts {
  collapsed?: boolean
}

function section<T extends SectionConfig>(body: T, opts?: SectionOpts): T {
  return (opts?.collapsed ? { _collapsed: true, ...body } : body) as T
}

const select = (options: SelectOption[], def?: string): Select => ({ type: 'select', options, default: def })
const color = (def: string): Color => ({ type: 'color', default: def })

// ---------------------------------------------------------------------------
// Token resolvers — selects return tokens; variants map them to CSS with these.
// ---------------------------------------------------------------------------

export const SHADOWS: Record<string, string> = {
  none: 'none',
  xs: '0 1px 2px rgba(0,0,0,0.05)',
  sm: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
  md: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
  lg: '0 12px 32px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.05)',
  xl: '0 24px 56px rgba(0,0,0,0.16), 0 8px 16px rgba(0,0,0,0.06)',
}

export const FONT_STACKS: Record<string, string> = {
  system: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  sans: "'Inter', system-ui, sans-serif",
  serif: "'Georgia', 'Times New Roman', serif",
  mono: "'SF Mono', 'JetBrains Mono', monospace",
}

export const SHADOW_LEVELS = Object.keys(SHADOWS)
export const FONT_FAMILIES = Object.keys(FONT_STACKS)
export const WEIGHTS = ['400', '500', '600', '700', '800']

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

export function layoutSection(
  d: Partial<{ padding: number; gap: number; align: 'start' | 'center' | 'end'; direction: 'row' | 'column'; maxWidth: number }> = {},
  opts?: SectionOpts,
) {
  return section(
    {
      padding: [d.padding ?? 24, 0, 96, 1] as Slider,
      gap: [d.gap ?? 12, 0, 64, 1] as Slider,
      align: select(['start', 'center', 'end'], d.align ?? 'start'),
      direction: select(['column', 'row'], d.direction ?? 'column'),
      maxWidth: [d.maxWidth ?? 480, 240, 1440, 10] as Slider,
    },
    opts,
  )
}

export function surfaceSection(
  d: Partial<{ bg: string; radius: number; borderWidth: number; borderColor: string; shadow: string }> = {},
  opts?: SectionOpts,
) {
  return section(
    {
      bg: color(d.bg ?? '#ffffff'),
      radius: [d.radius ?? 12, 0, 32, 1] as Slider,
      borderWidth: [d.borderWidth ?? 1, 0, 4, 1] as Slider,
      borderColor: color(d.borderColor ?? '#e4e4e7'),
      shadow: select(SHADOW_LEVELS, d.shadow ?? 'sm'),
    },
    opts,
  )
}

export function typographySection(
  d: Partial<{ size: number; weight: string; tracking: number; lineHeight: number; family: string }> = {},
  opts?: SectionOpts,
) {
  return section(
    {
      size: [d.size ?? 16, 10, 48, 1] as Slider,
      weight: select(WEIGHTS, d.weight ?? '500'),
      tracking: [d.tracking ?? 0, -1, 2, 0.05] as Slider,
      lineHeight: [d.lineHeight ?? 1.4, 1, 2, 0.05] as Slider,
      family: select(FONT_FAMILIES, d.family ?? 'system'),
    },
    opts,
  )
}

export function colorSection(
  d: Partial<{ accent: string; fg: string; bg: string; muted: string }> = {},
  opts?: SectionOpts,
) {
  return section(
    {
      accent: color(d.accent ?? '#18181b'),
      fg: color(d.fg ?? '#18181b'),
      bg: color(d.bg ?? '#ffffff'),
      muted: color(d.muted ?? '#71717a'),
    },
    opts,
  )
}

export function motionSection(
  d: Partial<{ spring: Spring; hoverScale: number; duration: number }> = {},
  opts?: SectionOpts,
) {
  return section(
    {
      spring: d.spring ?? ({ type: 'spring', visualDuration: 0.3, bounce: 0.15 } as Spring),
      hoverScale: [d.hoverScale ?? 1.02, 1, 1.12, 0.005] as Slider,
      duration: [d.duration ?? 0.25, 0, 1.5, 0.05] as Slider,
    },
    opts,
  )
}

export function statesSection(
  d: Partial<{ hoverBg: string; hoverShadow: string; activeScale: number }> = {},
  opts?: SectionOpts,
) {
  return section(
    {
      hoverBg: color(d.hoverBg ?? '#fafafa'),
      hoverShadow: select(SHADOW_LEVELS, d.hoverShadow ?? 'md'),
      activeScale: [d.activeScale ?? 0.98, 0.9, 1, 0.005] as Slider,
    },
    opts,
  )
}
