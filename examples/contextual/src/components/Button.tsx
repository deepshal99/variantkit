// Contextual config: a button exposes radius, SIZE, weight, accent, LABEL — different
// controls than a card (no padding/price; it has size + label).
import { useDialKit } from 'dialkit'
import { buildDecision, copyDecision, type ParamValue } from '../core/buildDecision'

const VARIANTS = ['solid', 'outline', 'ghost']
const DEFAULTS: Record<string, ParamValue> = { radius: 10, size: 'md', weight: 600, accent: '#1F5E54', label: 'Get started' }
const reg = Object.fromEntries(VARIANTS.map((k) => [k, 1]))
const PAD: Record<string, string> = { sm: '8px 14px', md: '11px 20px', lg: '15px 28px' }
const FS: Record<string, number> = { sm: 13, md: 15, lg: 17 }

export default function Button() {
  const v = useDialKit(
    'Button',
    {
      variant: { type: 'select', options: VARIANTS, default: 'solid' },
      radius: [10, 0, 24],
      size: { type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
      weight: [600, 400, 800],
      accent: '#1F5E54',
      label: 'Get started',
      finalize: { type: 'action', label: 'Finalize Button' },
    },
    { onAction: () => copyDecision(buildDecision('Button', v as Record<string, ParamValue>, DEFAULTS, reg)) },
  ) as Record<string, ParamValue>

  const variant = String(v.variant)
  const accent = String(v.accent)
  const size = String(v.size)
  const solid = variant === 'solid'
  const ghost = variant === 'ghost'

  return (
    <button
      style={{
        transition: 'all .25s ease',
        borderRadius: Number(v.radius),
        padding: PAD[size],
        fontSize: FS[size],
        fontWeight: Number(v.weight),
        fontFamily: 'system-ui, sans-serif',
        cursor: 'pointer',
        background: solid ? accent : 'transparent',
        color: solid ? '#fff' : accent,
        border: ghost ? '1px solid transparent' : `1px solid ${accent}`,
      }}
    >
      {String(v.label)}
    </button>
  )
}
