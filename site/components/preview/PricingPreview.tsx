'use client'
import { usePreview } from './shared'

const NAME = 'PricingCard'
const FINALIZE = 'Finalize PricingCard'
const CONFIG = {
  variant: { type: 'select', options: ['Minimal', 'Card', 'Highlight'], default: 'Highlight', segmented: true },
  accent: '#5b7cfa',
  radius: [20, 6, 30, 1],
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

  const surface =
    variant === 'Minimal' ? { background: 'transparent', border: '1px solid var(--line)' }
    : variant === 'Highlight' ? { background: `linear-gradient(180deg, color-mix(in srgb, ${accent} 16%, #0e1015), #0c0d11 42%)`, border: `1px solid color-mix(in srgb, ${accent} 42%, transparent)` }
    : { background: '#101218', border: '1px solid var(--line-2)' }
  const shadow = variant === 'Highlight'
    ? `0 36px 90px -44px color-mix(in srgb, ${accent} 55%, transparent)`
    : '0 26px 60px -44px rgba(0,0,0,.75)'

  return (
    <div className="pv">
      <div className="pv-canvas">
        <div className="price-card" data-variant={variant} style={{ ...surface, borderRadius: radius, boxShadow: shadow, ['--ac' as string]: accent }}>
          <div className="price-head">
            <span className="price-plan">{plan}</span>
            {featured && <span className="price-badge">Most popular</span>}
          </div>
          <div className="price-amt"><span className="price-cur">$</span>{price}<span className="price-per">/mo</span></div>
          <div className="price-rule" />
          <ul className="price-feats">
            {FEATURES.map((f) => (
              <li key={f}><span className="tick"><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L20 6.5" /></svg></span>{f}</li>
            ))}
          </ul>
          <button className="price-cta" style={{ borderRadius: Math.max(8, radius - 8) }}>Choose {plan}</button>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </div>
  )
}

const css = `
.price-card{position:relative;width:320px;max-width:100%;padding:28px;display:flex;flex-direction:column;gap:16px;
  transition:background .3s cubic-bezier(.23,1,.32,1),border-color .3s cubic-bezier(.23,1,.32,1),box-shadow .3s cubic-bezier(.23,1,.32,1),border-radius .2s cubic-bezier(.23,1,.32,1)}
.price-head{display:flex;align-items:center;justify-content:space-between}
.price-plan{font-size:14px;color:var(--dim);font-weight:560;letter-spacing:.01em}
.price-badge{font-size:10.5px;letter-spacing:.04em;text-transform:uppercase;color:var(--ac);border:1px solid color-mix(in srgb,var(--ac) 42%,transparent);
  background:color-mix(in srgb,var(--ac) 14%,transparent);border-radius:999px;padding:3px 9px}
.price-amt{font-size:48px;font-weight:600;letter-spacing:-.035em;line-height:1;color:var(--ink);font-variant-numeric:tabular-nums;display:flex;align-items:baseline;gap:2px}
.price-cur{font-size:24px;color:var(--dim)}
.price-per{font-size:15px;color:var(--faint);font-weight:400}
.price-rule{height:1px;background:var(--line);margin:2px 0}
.price-feats{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:11px}
.price-feats li{display:flex;align-items:center;gap:11px;font-size:13.5px;color:var(--dim)}
.tick{display:grid;place-items:center;width:18px;height:18px;border-radius:50%;background:color-mix(in srgb,var(--ac) 20%,transparent);color:var(--ac);flex:0 0 auto}
.tick svg{display:block}
.price-cta{margin-top:4px;border:0;cursor:pointer;font-family:inherit;font-size:14px;font-weight:560;padding:12px 16px;background:var(--ac);color:#fff;
  transition:transform .12s,filter .18s,border-radius .2s cubic-bezier(.23,1,.32,1)}
.price-cta:hover{filter:brightness(1.08)}
.price-cta:active{transform:scale(.97)}
.price-card[data-variant='Minimal'] .price-cta{background:transparent;border:1px solid var(--ac);color:var(--ac)}
`
