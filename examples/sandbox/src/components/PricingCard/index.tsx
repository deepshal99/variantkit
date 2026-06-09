// Thin shell — the ONLY file that wires VariantKit/DialKit. On finalize it copies a
// decision; the agent then prunes this whole folder down to the winning variant file
// (renamed to index.tsx), leaving a plain component with zero tool imports. See AGENT.md.
import { useDialKit } from 'dialkit'
import { registry } from './registry'
import { buildDecision, copyDecision, type ParamValue } from '../../core/buildDecision'

// Frozen defaults — the reference the override diff is measured against.
const DEFAULTS: Record<string, ParamValue> = { radius: 18, accent: '#1F5E54' }

export default function PricingCard(props: { plan?: string }) {
  const v = useDialKit(
    'PricingCard',
    {
      variant: { type: 'select', options: ['ledger', 'slab', 'inverse'], default: 'slab' },
      radius: [DEFAULTS.radius as number, 0, 32],
      accent: DEFAULTS.accent as string,
      finalize: { type: 'action', label: 'Finalize & copy decision' },
    },
    {
      onAction: () =>
        copyDecision(buildDecision('PricingCard', v as Record<string, ParamValue>, DEFAULTS, registry)),
    },
  ) as Record<string, ParamValue>

  const Active = registry[String(v.variant)].component
  return <Active {...props} radius={v.radius as number} accent={v.accent as string} />
}
