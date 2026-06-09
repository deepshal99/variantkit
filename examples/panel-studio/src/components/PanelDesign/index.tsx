// The component under design is VariantKit's OWN panel. DialKit drives it: pick a design
// direction (variant), tweak its tokens, finalize the one you want. Dogfooding VariantKit.
import { useDialKit } from 'dialkit'
import { registry } from './registry'
import { buildDecision, copyDecision, type ParamValue } from '../../core/buildDecision'

const DEFAULTS: Record<string, ParamValue> = { radius: 14, accent: '#1F5E54' }

export default function PanelDesign() {
  const v = useDialKit(
    'PanelDesign',
    {
      variant: { type: 'select', options: ['clean', 'dark', 'mono'], default: 'clean' },
      radius: [DEFAULTS.radius as number, 0, 28],
      accent: DEFAULTS.accent as string,
      finalize: { type: 'action', label: 'Finalize panel design' },
    },
    {
      onAction: () => copyDecision(buildDecision('PanelDesign', v as Record<string, ParamValue>, DEFAULTS, registry)),
    },
  ) as Record<string, ParamValue>

  const Active = registry[String(v.variant)].component
  return <Active radius={Number(v.radius)} accent={String(v.accent)} />
}
