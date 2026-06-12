// VariantKit archetypes — per-element-family CHECKLISTS of design axes, composed from
// section builders (./sections.ts) plus the element's own controls. They exist so a
// configuration covers everything that's actually a design decision for an element
// (layout, surface, typography, color, motion, states, element-specific knobs) instead
// of 2-3 loose sliders.
//
// "VariantKit presents; the project decides" still holds (AGENT.md §0/§7): adapt the
// set per element, seed every default from the project's rendered values/tokens, drop
// axes the element doesn't have. The fallback values below are scaffolding for brand-new
// elements only — on an existing element, an unseeded default is a contract violation.
//
// Contract (AGENT.md §7): a non-trivial element gets an archetype panel — ≥4 folders,
// 12-25 controls — with defaults seeded from the code as rendered:
//
//   useDialKit('PricingCard', {
//     variant: { type: 'select', options: [...], default: '...' },
//     ...pricingArchetype({ surface: { radius: 18 }, color: { accent: '#1F5E54' } }),
//     finalize: { type: 'action', label: 'Finalize' },
//   })
//
// Pure data — safe to import anywhere, prunes away cleanly.

import {
  layoutSection,
  surfaceSection,
  typographySection,
  colorSection,
  motionSection,
  statesSection,
  type SectionConfig,
  type Slider,
  type SelectOption,
} from './sections'

export * from './sections'

type Overrides = {
  layout?: Parameters<typeof layoutSection>[0]
  surface?: Parameters<typeof surfaceSection>[0]
  typography?: Parameters<typeof typographySection>[0]
  color?: Parameters<typeof colorSection>[0]
  motion?: Parameters<typeof motionSection>[0]
  states?: Parameters<typeof statesSection>[0]
  /** Extra top-level controls or folders merged into the panel. */
  extra?: SectionConfig
}

const select = (options: SelectOption[], def?: string) => ({ type: 'select' as const, options, default: def })

// ---------------------------------------------------------------------------

export function buttonArchetype(o: Overrides & { size?: string; iconPosition?: string; fullWidth?: boolean } = {}) {
  return {
    size: select(['sm', 'md', 'lg'], o.size ?? 'md'),
    iconPosition: select(['none', 'left', 'right'], o.iconPosition ?? 'none'),
    fullWidth: o.fullWidth ?? false,
    surface: surfaceSection({ radius: 8, shadow: 'none', ...o.surface }),
    typography: typographySection({ size: 14, weight: '600', ...o.typography }),
    color: colorSection(o.color),
    states: statesSection(o.states),
    motion: motionSection(o.motion, { collapsed: true }),
    ...o.extra,
  }
}

export function cardArchetype(o: Overrides & { media?: string; density?: string } = {}) {
  return {
    media: select(['none', 'top', 'left'], o.media ?? 'none'),
    density: select(['compact', 'regular', 'spacious'], o.density ?? 'regular'),
    layout: layoutSection({ padding: 24, gap: 12, ...o.layout }),
    surface: surfaceSection(o.surface),
    typography: typographySection(o.typography, { collapsed: true }),
    color: colorSection(o.color),
    states: statesSection(o.states, { collapsed: true }),
    motion: motionSection(o.motion, { collapsed: true }),
    ...o.extra,
  }
}

export function heroArchetype(o: Overrides & { alignment?: string; ctaStyle?: string; minHeight?: number } = {}) {
  return {
    alignment: select(['left', 'center'], o.alignment ?? 'left'),
    ctaStyle: select(['solid', 'outline', 'ghost'], o.ctaStyle ?? 'solid'),
    minHeight: [o.minHeight ?? 480, 240, 960, 10] as Slider,
    layout: layoutSection({ padding: 64, gap: 24, maxWidth: 960, ...o.layout }),
    typography: typographySection({ size: 44, weight: '700', lineHeight: 1.1, tracking: -0.5, ...o.typography }),
    color: colorSection(o.color),
    motion: motionSection(o.motion, { collapsed: true }),
    ...o.extra,
  }
}

export function navbarArchetype(o: Overrides & { height?: number; sticky?: boolean; blur?: number; linkGap?: number } = {}) {
  return {
    height: [o.height ?? 56, 40, 96, 1] as Slider,
    sticky: o.sticky ?? true,
    blur: [o.blur ?? 8, 0, 24, 1] as Slider,
    linkGap: [o.linkGap ?? 24, 8, 64, 1] as Slider,
    surface: surfaceSection({ shadow: 'xs', radius: 0, ...o.surface }),
    typography: typographySection({ size: 14, ...o.typography }, { collapsed: true }),
    color: colorSection(o.color),
    motion: motionSection(o.motion, { collapsed: true }),
    ...o.extra,
  }
}

export function modalArchetype(o: Overrides & { width?: number; overlayOpacity?: number; backdropBlur?: number } = {}) {
  return {
    width: [o.width ?? 440, 280, 880, 10] as Slider,
    overlayOpacity: [o.overlayOpacity ?? 0.5, 0, 1, 0.05] as Slider,
    backdropBlur: [o.backdropBlur ?? 0, 0, 16, 1] as Slider,
    layout: layoutSection({ padding: 24, gap: 16, ...o.layout }),
    surface: surfaceSection({ radius: 12, shadow: 'xl', ...o.surface }),
    typography: typographySection(o.typography, { collapsed: true }),
    color: colorSection(o.color),
    motion: motionSection(o.motion),
    ...o.extra,
  }
}

export function formArchetype(o: Overrides & { labelPosition?: string; fieldGap?: number; inputRadius?: number } = {}) {
  return {
    labelPosition: select(['top', 'left', 'floating'], o.labelPosition ?? 'top'),
    fieldGap: [o.fieldGap ?? 16, 4, 48, 1] as Slider,
    inputRadius: [o.inputRadius ?? 8, 0, 24, 1] as Slider,
    layout: layoutSection({ padding: 0, gap: 16, ...o.layout }, { collapsed: true }),
    surface: surfaceSection(o.surface, { collapsed: true }),
    typography: typographySection({ size: 14, ...o.typography }),
    color: colorSection(o.color),
    states: statesSection(o.states, { collapsed: true }),
    ...o.extra,
  }
}

export function tableArchetype(o: Overrides & { density?: string; rowHeight?: number; striped?: boolean; dividers?: string } = {}) {
  return {
    density: select(['compact', 'regular', 'relaxed'], o.density ?? 'regular'),
    rowHeight: [o.rowHeight ?? 44, 28, 72, 1] as Slider,
    striped: o.striped ?? false,
    dividers: select(['none', 'rows', 'all'], o.dividers ?? 'rows'),
    surface: surfaceSection({ shadow: 'none', ...o.surface }),
    typography: typographySection({ size: 13, ...o.typography }),
    color: colorSection(o.color),
    states: statesSection(o.states, { collapsed: true }),
    ...o.extra,
  }
}

export function listArchetype(o: Overrides & { marker?: string; itemGap?: number; dense?: boolean } = {}) {
  return {
    marker: select(['none', 'dot', 'check', 'number'], o.marker ?? 'none'),
    itemGap: [o.itemGap ?? 8, 0, 32, 1] as Slider,
    dense: o.dense ?? false,
    layout: layoutSection({ padding: 0, gap: 8, ...o.layout }, { collapsed: true }),
    typography: typographySection(o.typography),
    color: colorSection(o.color),
    states: statesSection(o.states, { collapsed: true }),
    ...o.extra,
  }
}

export function badgeArchetype(o: Overrides & { size?: string; pill?: boolean; tone?: string } = {}) {
  return {
    size: select(['sm', 'md'], o.size ?? 'sm'),
    pill: o.pill ?? true,
    tone: select(['neutral', 'accent', 'success', 'warning', 'danger'], o.tone ?? 'neutral'),
    surface: surfaceSection({ radius: 6, shadow: 'none', borderWidth: 1, ...o.surface }),
    typography: typographySection({ size: 12, weight: '500', ...o.typography }),
    color: colorSection(o.color),
    ...o.extra,
  }
}

export function pricingArchetype(o: Overrides & { priceSize?: number; featured?: boolean; ctaStyle?: string } = {}) {
  return {
    priceSize: [o.priceSize ?? 36, 20, 64, 1] as Slider,
    featured: o.featured ?? false,
    ctaStyle: select(['solid', 'outline', 'ghost'], o.ctaStyle ?? 'solid'),
    layout: layoutSection({ padding: 28, gap: 16, maxWidth: 380, ...o.layout }),
    surface: surfaceSection(o.surface),
    typography: typographySection(o.typography, { collapsed: true }),
    color: colorSection(o.color),
    states: statesSection(o.states, { collapsed: true }),
    motion: motionSection(o.motion, { collapsed: true }),
    ...o.extra,
  }
}

export function sectionArchetype(o: Overrides & { paddingY?: number } = {}) {
  return {
    paddingY: [o.paddingY ?? 80, 0, 240, 4] as Slider,
    layout: layoutSection({ padding: 24, gap: 32, maxWidth: 1120, ...o.layout }),
    surface: surfaceSection({ shadow: 'none', radius: 0, ...o.surface }),
    typography: typographySection({ size: 32, weight: '700', ...o.typography }),
    color: colorSection(o.color),
    ...o.extra,
  }
}

// Lookup for agents: archetype key -> builder. Pick the closest archetype; when nothing
// fits, compose sections directly per AGENT.md §7.
export const ARCHETYPES = {
  button: buttonArchetype,
  card: cardArchetype,
  hero: heroArchetype,
  navbar: navbarArchetype,
  modal: modalArchetype,
  form: formArchetype,
  table: tableArchetype,
  list: listArchetype,
  badge: badgeArchetype,
  pricing: pricingArchetype,
  section: sectionArchetype,
} as const

export type ArchetypeKey = keyof typeof ARCHETYPES
