'use client'
import { usePreview, CodeBlock } from './shared'

const NAME = 'PricingCard'
const FINALIZE = 'Finalize PricingCard'
const CONFIG = {
  variant: { type: 'select', options: ['Minimal', 'Card', 'Highlight'], default: 'Card', segmented: true },
  accent: '#46d39a',
  radius: [18, 4, 28, 1],
  plan: 'Pro',
  price: [24, 0, 99, 1],
  featured: true,
  finalize: { type: 'action', label: FINALIZE },
} as const

const FEATURES = ['Unlimited variants', 'Live control panel', 'One-click finalize', 'Clean code handoff']

export default function PricingPreview() {
  const v = usePreview(NAME, CONFIG, FINALIZE)
  const variant = String(v.variant)
  const accent = String(v.accent)
  const radius = Number(v.radius)
  const plan = String(v.plan) || 'Plan'
  const price = Number(v.price)
  const featured = Boolean(v.featured)

  const skin =
    variant === 'Minimal' ? { background: 'transparent', border: '1px solid var(--line)' }
    : variant === 'Highlight' ? { background: `color-mix(in srgb, ${accent} 10%, #0e1015)`, border: `1px solid color-mix(in srgb, ${accent} 45%, transparent)` }
    : { background: '#101218', border: '1px solid var(--line-2)' }
  const shadow = variant === 'Highlight'
    ? `0 30px 80px -40px color-mix(in srgb, ${accent} 50%, transparent)`
    : '0 24px 60px -40px rgba(0,0,0,.7)'

  return (
    <div className="pv">
      <div className="pv-canvas">
        <div className="price-card" style={{ ...skin, borderRadius: radius, boxShadow: shadow, ['--ac' as string]: accent }}>
          {featured && <span className="price-badge">Most popular</span>}
          <div className="price-plan">{plan}</div>
          <div className="price-amt"><span className="price-cur">$</span>{price}<span className="price-per">/mo</span></div>
          <ul className="price-feats">
            {FEATURES.map((f) => <li key={f}><span className="tick">✓</span>{f}</li>)}
          </ul>
          <button className="price-cta" style={{ borderRadius: Math.max(6, radius - 6) }}>Choose {plan}</button>
        </div>
      </div>
      <CodeBlock lines={[
        `<PricingCard`,
        `  variant="${variant.toLowerCase()}"`,
        `  plan="${plan}"`,
        `  price={${price}}`,
        `  accent="${accent}"`,
        `  featured={${featured}}`,
        `/>`,
      ]} />
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </div>
  )
}

const css = `
.price-card{position:relative;width:300px;max-width:100%;padding:28px;display:flex;flex-direction:column;gap:16px;transition:background .25s cubic-bezier(.23,1,.32,1),border-color .25s cubic-bezier(.23,1,.32,1),box-shadow .25s cubic-bezier(.23,1,.32,1),border-radius .2s cubic-bezier(.23,1,.32,1)}
.price-badge{position:absolute;top:16px;right:16px;font-size:10.5px;letter-spacing:.04em;text-transform:uppercase;color:var(--ac);border:1px solid color-mix(in srgb,var(--ac) 40%,transparent);border-radius:999px;padding:3px 9px}
.price-plan{font-size:14px;color:var(--dim);font-weight:500}
.price-amt{font-size:46px;font-weight:600;letter-spacing:-.03em;line-height:1;color:var(--ink);font-variant-numeric:tabular-nums;display:flex;align-items:baseline;gap:2px}
.price-cur{font-size:24px;color:var(--dim)}
.price-per{font-size:15px;color:var(--faint);font-weight:400}
.price-feats{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
.price-feats li{display:flex;align-items:center;gap:10px;font-size:13.5px;color:var(--dim)}
.tick{display:grid;place-items:center;width:16px;height:16px;border-radius:50%;background:color-mix(in srgb,var(--ac) 20%,transparent);color:var(--ac);font-size:10px;flex:0 0 auto}
.price-cta{margin-top:4px;border:0;cursor:pointer;font-family:inherit;font-size:14px;font-weight:560;padding:11px 16px;background:var(--ac);color:#07130d;transition:transform .12s,filter .18s}
.price-cta:hover{filter:brightness(1.07)}
.price-cta:active{transform:scale(.97)}
`
