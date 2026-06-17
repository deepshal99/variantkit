'use client'
import { usePreview } from './shared'

const NAME = 'Hero'
const FINALIZE = 'Finalize Hero'
const CONFIG = {
  variant: { type: 'select', options: ['Gradient', 'Glass', 'Minimal'], default: 'Gradient', segmented: true },
  accent: '#6366f1',
  radius: [22, 8, 34, 1],
  headline: 'Ship the UI you actually want',
  cta: 'Get started',
  glow: true,
  finalize: { type: 'action', label: FINALIZE },
} as const

export default function HeroPreview() {
  const v = usePreview(NAME, CONFIG, FINALIZE)
  const variant = String(v.variant)
  const accent = String(v.accent)
  const radius = Number(v.radius)
  const headline = String(v.headline) || ' '
  const cta = String(v.cta) || 'Get started'
  const glow = Boolean(v.glow)

  const surface =
    variant === 'Gradient'
      ? { background: `radial-gradient(120% 120% at 0% 0%, color-mix(in srgb, ${accent} 32%, #0d0e12), #0b0c10 70%)`, border: '1px solid rgba(255,255,255,.1)' }
      : variant === 'Glass'
      ? { background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.14)', backdropFilter: 'blur(8px)' }
      : { background: '#0e0f13', border: '1px solid var(--line-2)' }
  const shadow = glow ? `0 40px 90px -44px color-mix(in srgb, ${accent} 60%, transparent)` : '0 30px 70px -44px rgba(0,0,0,.8)'

  return (
    <div className="pv">
      <div className="pv-canvas">
        <div className="hero-card" data-variant={variant} style={{ ...surface, borderRadius: radius, boxShadow: shadow, ['--ac' as string]: accent }}>
          <span className="hero-orb" />
          <span className="hero-badge"><span className="hero-dot" />New · v0.4</span>
          <h3 className="hero-title">{headline}</h3>
          <p className="hero-sub">Your agent drafts a few takes. You tune them here and keep the one that feels right.</p>
          <div className="hero-actions">
            <button className="hero-cta" style={{ borderRadius: Math.max(8, radius - 10) }}>{cta}<span className="hero-arrow">→</span></button>
            <button className="hero-ghost" style={{ borderRadius: Math.max(8, radius - 10) }}>Learn more</button>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </div>
  )
}

const css = `
.hero-card{position:relative;overflow:hidden;width:440px;max-width:100%;padding:30px 30px 28px;display:flex;flex-direction:column;gap:14px;
  transition:background .3s cubic-bezier(.23,1,.32,1),border-color .3s cubic-bezier(.23,1,.32,1),box-shadow .3s cubic-bezier(.23,1,.32,1),border-radius .2s cubic-bezier(.23,1,.32,1)}
.hero-orb{position:absolute;top:-70px;right:-50px;width:200px;height:200px;border-radius:50%;pointer-events:none;
  background:radial-gradient(circle,color-mix(in srgb,var(--ac) 55%,transparent),transparent 68%);opacity:.7;transition:background .3s}
.hero-card[data-variant='Minimal'] .hero-orb{opacity:.25}
.hero-badge{position:relative;align-self:flex-start;display:inline-flex;align-items:center;gap:7px;font-size:12px;color:var(--ink);
  background:color-mix(in srgb,var(--ac) 16%,transparent);border:1px solid color-mix(in srgb,var(--ac) 32%,transparent);border-radius:999px;padding:5px 11px}
.hero-dot{width:6px;height:6px;border-radius:50%;background:var(--ac)}
.hero-title{position:relative;margin:0;font-size:27px;line-height:1.12;letter-spacing:-.025em;font-weight:600;color:#fff;max-width:14ch}
.hero-sub{position:relative;margin:0;font-size:14px;line-height:1.55;color:var(--dim);max-width:32ch}
.hero-actions{position:relative;display:flex;align-items:center;gap:10px;margin-top:6px}
.hero-cta{display:inline-flex;align-items:center;gap:8px;border:0;cursor:pointer;font-family:inherit;font-size:14px;font-weight:560;padding:11px 18px;color:#fff;
  background:var(--ac);transition:transform .12s,filter .18s,border-radius .2s cubic-bezier(.23,1,.32,1)}
.hero-cta:hover{filter:brightness(1.08)}
.hero-cta:active{transform:scale(.97)}
.hero-arrow{font-size:1.05em;transition:transform .2s cubic-bezier(.23,1,.32,1)}
.hero-cta:hover .hero-arrow{transform:translateX(3px)}
.hero-ghost{border:1px solid var(--line-2);background:transparent;cursor:pointer;font-family:inherit;font-size:14px;font-weight:500;padding:11px 16px;color:var(--ink);
  transition:background .18s,border-color .18s,transform .12s,border-radius .2s cubic-bezier(.23,1,.32,1)}
.hero-ghost:hover{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.22)}
.hero-ghost:active{transform:scale(.97)}
`
