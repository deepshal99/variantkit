// Thin shell — the ONLY file that wires VariantKit/DialKit. On finalize it copies a
// decision; the agent then prunes this whole folder down to the winning variant file
// (renamed to index.tsx), leaving a plain component with zero tool imports. See AGENT.md.
import { useDialKit } from 'dialkit'
import { registry } from './registry'
import { buildDecision, submitDecision, defaultsFromConfig, type NestedValues } from '../../core/buildDecision'
import { pricingArchetype, SHADOWS, FONT_STACKS } from '../../core/schemas/archetypes'
import { VariantStage } from '../../core/react/VariantStage'

// Full pricing panel (AGENT.md §7), defaults seeded from the rendered design. Variants
// own their surface bg, fg identity, and hover states — those controls are dropped.
const arch = pricingArchetype({
  layout: { padding: 28, gap: 12, maxWidth: 320 },
  surface: { radius: 18, shadow: 'lg', borderWidth: 1, borderColor: '#1F5E54' },
  typography: { size: 14, weight: '700', lineHeight: 1.9 },
  color: { accent: '#1F5E54', fg: '#1a1a1a', muted: '#6b6b6b' },
  priceSize: 40,
})
const { states: _states, ...rest } = arch
const { bg: _sbg, ...surface } = rest.surface
const { bg: _cbg, ...color } = rest.color
const { direction: _dir, ...layout } = rest.layout
const { tracking: _tr, ...typography } = rest.typography
const { spring: _sp, hoverScale: _hov, ...motion } = rest.motion

const CONFIG = {
  variant: {
    type: 'select' as const,
    options: Object.entries(registry).map(([value, { label }]) => ({ value, label })),
    default: 'slab',
  },
  priceSize: rest.priceSize,
  featured: rest.featured,
  ctaStyle: rest.ctaStyle,
  layout,
  surface,
  typography,
  color,
  motion,
  finalize: { type: 'action' as const, label: 'Finalize' },
}

// Frozen defaults — the reference the override diff (taste signal) is measured against.
const DEFAULTS = defaultsFromConfig(CONFIG as NestedValues)

export default function PricingCard(props: { plan?: string }) {
  const v = useDialKit('PricingCard', CONFIG, {
    onAction: () =>
      submitDecision(buildDecision('PricingCard', v as unknown as NestedValues, DEFAULTS, registry)),
  })

  // Resolve panel values (tokens -> CSS) into the shared variant props once;
  // VariantStage renders the active variant, or all of them in compare mode.
  const variantProps = {
    ...props,
    padding: v.layout.padding,
    gap: v.layout.gap,
    maxWidth: v.layout.maxWidth,
    align: v.layout.align as 'start' | 'center' | 'end',
    radius: v.surface.radius,
    borderWidth: v.surface.borderWidth,
    borderColor: v.surface.borderColor,
    shadow: SHADOWS[v.surface.shadow],
    fontSize: v.typography.size,
    weight: Number(v.typography.weight),
    lineHeight: v.typography.lineHeight,
    fontFamily: FONT_STACKS[v.typography.family],
    accent: v.color.accent,
    fg: v.color.fg,
    muted: v.color.muted,
    priceSize: v.priceSize,
    ctaStyle: v.ctaStyle as 'solid' | 'outline' | 'ghost',
    featured: v.featured,
    duration: v.motion.duration,
  }

  return (
    <VariantStage name="PricingCard" registry={registry} active={String(v.variant)} props={variantProps} />
  )
}
