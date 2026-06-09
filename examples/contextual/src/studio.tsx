// The demo now uses the reusable Studio helper from the package — no hand-written panel
// wiring. Define the elements + their renderers; Studio folds them into one panel, routes
// finalize, and focuses the folder of whatever element you hover.
import { Studio, type ElementDef } from './variantkit/react'
import { renderCard, renderButton, renderHero, renderBadge } from './elements'

const ELEMENTS: ElementDef[] = [
  { name: 'Hero', type: 'hero', keys: ['centered', 'split', 'minimal'], render: renderHero },
  { name: 'PricingCard', type: 'card', keys: ['slab', 'ledger', 'inverse'], render: renderCard },
  { name: 'Button', type: 'button', keys: ['solid', 'outline', 'ghost'], render: renderButton },
  { name: 'Badge', type: 'badge', keys: ['solid', 'soft', 'outline'], render: renderBadge },
]

export default function DemoStudio() {
  return <Studio elements={ELEMENTS} focusOnHover />
}
