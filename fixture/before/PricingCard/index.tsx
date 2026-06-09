// Thin shell — the ONLY file that wires VariantKit/DialKit. On prune this is overwritten
// by the winning variant (rename), leaving a plain component with zero tool imports.
import { useDialKit } from 'dialkit'
import { registry } from './registry'
import { buildDecision, copyDecision } from '../../../core/buildDecision'

const DEFAULTS = { radius: 18, accent: '#1F5E54' }

export default function PricingCard(props: { plan?: string }) {
  const v = useDialKit(
    'PricingCard',
    {
      variant: { type: 'select', options: ['ledger', 'slab', 'inverse'], default: 'slab' },
      radius: [DEFAULTS.radius, 0, 32],
      accent: DEFAULTS.accent,
      finalize: { type: 'action', label: 'Finalize & copy decision' },
    },
    {
      onAction: () => copyDecision(buildDecision('PricingCard', v, DEFAULTS, registry)),
    },
  )

  const Active = registry[v.variant as keyof typeof registry].component
  return <Active {...props} radius={v.radius} accent={v.accent} />
}
