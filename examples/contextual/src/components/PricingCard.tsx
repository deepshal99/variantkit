// Contextual config: a pricing card uses the 'card' preset (radius, padding, accent) — the
// agent now picks this preset by element type instead of hand-listing controls.
import { useDialKit } from 'dialkit'
import { buildDecision, copyDecision, type ParamValue } from '../core/buildDecision'
import { panelConfig, defaultsOf, regOf } from '../variantkit/configs'

const KEYS = ['slab', 'ledger', 'inverse']
const cfg = panelConfig('card', KEYS, { component: 'PricingCard' })

export default function PricingCard() {
  const v = useDialKit('PricingCard', cfg, {
    onAction: () => copyDecision(buildDecision('PricingCard', v as Record<string, ParamValue>, defaultsOf(cfg), regOf(KEYS))),
  }) as Record<string, ParamValue>

  const variant = String(v.variant)
  const radius = Number(v.radius)
  const accent = String(v.accent)
  const padding = Number(v.padding)
  const dark = variant === 'inverse'
  const t = { transition: 'all .25s ease' }

  return (
    <div
      style={{
        ...t,
        width: 280,
        borderRadius: radius,
        padding,
        fontFamily: 'system-ui, sans-serif',
        background: variant === 'ledger' ? 'transparent' : dark ? '#141311' : '#f6f4ef',
        border: variant === 'ledger' ? `1px solid ${accent}` : 'none',
        boxShadow: variant === 'slab' ? '0 18px 40px rgba(0,0,0,.10)' : dark ? '0 18px 50px rgba(0,0,0,.5)' : 'none',
        color: dark ? '#ede8df' : '#1a1a1a',
      }}
    >
      <div style={{ fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase', color: accent }}>Pro</div>
      <div style={{ fontSize: 40, fontWeight: 700, margin: '8px 0' }}>$29</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0', fontSize: 14, lineHeight: 1.9, color: dark ? '#b8b2a7' : '#1a1a1a' }}>
        <li>Unlimited projects</li>
        <li>Priority support</li>
        <li>Audit log</li>
      </ul>
      <button
        style={{
          ...t,
          borderRadius: radius / 2,
          padding: '10px 16px',
          width: '100%',
          border: variant === 'ledger' ? `1px solid ${accent}` : 'none',
          background: variant === 'ledger' ? 'transparent' : accent,
          color: variant === 'ledger' ? accent : dark ? '#141311' : '#fff',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Choose Pro
      </button>
    </div>
  )
}
