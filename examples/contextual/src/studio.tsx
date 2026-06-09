// Single panel, one folder per element. ONE useDialKit call hosts every element as a
// collapsible folder (so multiple elements never spawn multiple panels). onAction(path)
// routes finalize by the folder name (e.g. "PricingCard.finalize").
import type { ReactElement } from 'react'
import { useDialKit } from 'dialkit'
import { panelConfig, defaultsOf, regOf } from './variantkit/configs'
import { buildDecision, copyDecision, type ParamValue } from './core/buildDecision'
import { renderCard, renderButton, renderHero, renderBadge } from './elements'

type El = { name: string; type: string; keys: string[]; render: (variant: string, v: Record<string, ParamValue>) => ReactElement }

const ELEMENTS: El[] = [
  { name: 'Hero', type: 'hero', keys: ['centered', 'split', 'minimal'], render: renderHero },
  { name: 'PricingCard', type: 'card', keys: ['slab', 'ledger', 'inverse'], render: renderCard },
  { name: 'Button', type: 'button', keys: ['solid', 'outline', 'ghost'], render: renderButton },
  { name: 'Badge', type: 'badge', keys: ['solid', 'soft', 'outline'], render: renderBadge },
]

const cfgFor = (e: El) => panelConfig(e.type, e.keys, { component: e.name })

// Combined config: one folder per element. First folder open, rest collapsed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const combined: Record<string, any> = {}
ELEMENTS.forEach((e, i) => {
  combined[e.name] = { ...cfgFor(e), _collapsed: i !== 0 }
})

const label: React.CSSProperties = { fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: '#9a948b', marginBottom: 14, fontFamily: 'system-ui, sans-serif' }

export default function Studio() {
  const all = useDialKit('VariantKit', combined, {
    onAction: (path: string) => {
      const name = path.split('.')[0]
      const e = ELEMENTS.find((x) => x.name === name)
      if (!e) return
      const slice = (all as Record<string, Record<string, ParamValue>>)[name]
      copyDecision(buildDecision(name, slice, defaultsOf(cfgFor(e)), regOf(e.keys)))
    },
  }) as Record<string, Record<string, ParamValue>>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 56, alignItems: 'center' }}>
      {ELEMENTS.map((e) => {
        const slice = all[e.name]
        return (
          <section key={e.name} style={{ textAlign: 'center' }}>
            <div style={label}>{e.name}</div>
            {e.render(String(slice.variant), slice)}
          </section>
        )
      })}
    </div>
  )
}
