// The demo uses the reusable Studio helper from the package — no hand-written panel wiring.
// Each element AUTHORS ITS OWN controls (this is the demo-project's contextual choice, not a
// VariantKit menu): Studio only wraps them with the variant select + finalize, folds all
// elements into one panel, and routes finalize.
import { Studio, type ElementDef } from './variantkit/react'
import { renderCard, renderButton, renderHero, renderBadge } from './elements'

// This demo's design tokens — defaults below come from here, not from VariantKit.
const BRAND = '#1F5E54'

const ELEMENTS: ElementDef[] = [
  {
    name: 'Hero',
    keys: ['centered', 'split', 'minimal'],
    controls: {
      eyebrow: 'New',
      headingSize: [48, 28, 72],
      align: { type: 'select', options: ['left', 'center'], default: 'center' },
      darkMode: false,
      accent: BRAND,
    },
    render: renderHero,
  },
  {
    name: 'PricingCard',
    keys: ['slab', 'ledger', 'inverse'],
    controls: {
      radius: [12, 0, 32],
      padding: [24, 12, 48],
      accent: BRAND,
      shadow: { type: 'select', options: ['none', 'soft', 'strong'], default: 'soft' },
      darkMode: false,
    },
    render: renderCard,
  },
  {
    name: 'Button',
    keys: ['solid', 'outline', 'ghost'],
    controls: {
      radius: [10, 0, 24],
      size: { type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
      weight: [600, 400, 800],
      accent: BRAND,
      label: 'Get started',
      fullWidth: false,
      darkMode: false,
    },
    render: renderButton,
  },
  {
    name: 'Badge',
    keys: ['solid', 'soft', 'outline'],
    controls: {
      radius: [999, 0, 999],
      size: { type: 'select', options: ['sm', 'md'], default: 'sm' },
      uppercase: true,
      label: 'Beta',
      accent: BRAND,
      darkMode: false,
    },
    render: renderBadge,
  },
]

export default function DemoStudio() {
  // Studio renders the elements untouched — the demo page owns its own layout.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 56, alignItems: 'center' }}>
      <Studio elements={ELEMENTS} focusOnHover />
    </div>
  )
}
