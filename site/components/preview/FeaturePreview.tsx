'use client'
import { type CSSProperties } from 'react'
import { usePreview } from './shared'

const NAME = 'Capabilities'
const FINALIZE = 'Finalize section'
const CONFIG = {
  treatment: { type: 'select', options: ['Gradient', 'Flat', 'Outline'], default: 'Gradient', segmented: true },
  accent: '#5b7cfa',
  radius: [18, 4, 30, 1],
  density: [26, 18, 40, 1],
  glow: true,
  heading: 'the way agents ship UI',
  finalize: { type: 'action', label: FINALIZE },
} as const

export default function FeaturePreview() {
  const v = usePreview(NAME, CONFIG, FINALIZE)
  const treat = String(v.treatment)
  const accent = String(v.accent)
  const radius = Number(v.radius)
  const pad = Number(v.density)
  const glow = Boolean(v.glow)

  const cardA: CSSProperties = treat === 'Gradient'
    ? { background: `linear-gradient(155deg, color-mix(in srgb, ${accent} 78%, #11131a), color-mix(in srgb, ${accent} 28%, #0b0d12))`, border: '1px solid rgba(255,255,255,.12)' }
    : treat === 'Flat'
    ? { background: '#101218', border: '1px solid var(--line-2)' }
    : { background: 'transparent', border: `1px solid color-mix(in srgb, ${accent} 55%, transparent)` }
  const cardB: CSSProperties = treat === 'Outline'
    ? { background: 'transparent', border: '1px solid var(--line-2)' }
    : { background: '#0e1015', border: '1px solid var(--line)' }
  const shadow = glow ? `0 30px 80px -36px color-mix(in srgb, ${accent} 40%, transparent)` : '0 20px 60px -34px rgba(0,0,0,.7)'

  return (
    <section className="cap" data-treat={treat} style={{ ['--ac' as string]: accent }}>
      <h2 className="cap-h">
        <span className="dim">Built for </span>
        <span className="bright">{String(v.heading) || ' '}</span>
      </h2>
      <div className="cap-grid">
        <article className="card" style={{ ...cardA, borderRadius: radius, padding: pad, boxShadow: shadow }}>
          <h3>Live variants</h3>
          <p>Your agent scaffolds a few real takes and wires them to a panel. Switch, tweak, and compare without leaving the canvas.</p>
          <div className="mini" style={{ borderRadius: radius - 4 }}>
            <div className="mini-row"><span className="mi-ic">◧</span><span className="mi-t">Variant</span><span className="mi-tag">Pills</span></div>
            <div className="mini-sub">Switch takes: Slab, Ledger, Inverse</div>
            <div className="mini-field" style={{ borderRadius: radius - 8 }}><span>Radius</span><b>{radius}</b></div>
            <div className="mini-conn" />
            <div className="mini-row"><span className="mi-ic">⎇</span><span className="mi-t">Accent</span><span className="mi-tag">Color</span></div>
            <div className="mini-sub">Recolor the whole component from one swatch</div>
          </div>
        </article>

        <article className="card card-b" style={{ ...cardB, borderRadius: radius, padding: pad, boxShadow: treat === 'Outline' ? 'none' : '0 20px 60px -34px rgba(0,0,0,.7)' }}>
          <h3>Clean handoff</h3>
          <p>You finalize one variant. The losers are pruned from the codebase, with no graveyard of commented-out alternatives.</p>
          <div className="stat" style={{ borderRadius: radius - 4 }}>
            <span className="stat-label">Variants explored</span>
            <span className="stat-num">3.7K</span>
          </div>
        </article>
      </div>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </section>
  )
}

const css = `
.cap{padding:clamp(40px,5vw,72px)}
.cap-h{margin:0 0 clamp(28px,4vw,48px);font-size:clamp(26px,2.6vw,38px);line-height:1.18;letter-spacing:-.025em;font-weight:600;max-width:22ch}
.cap-h .dim{color:var(--faint)}.cap-h .bright{color:var(--ink)}
.cap-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:22px;max-width:920px}
.card{display:flex;flex-direction:column;gap:10px;transition:background .28s cubic-bezier(.23,1,.32,1),border-color .28s cubic-bezier(.23,1,.32,1),box-shadow .28s cubic-bezier(.23,1,.32,1),border-radius .2s cubic-bezier(.23,1,.32,1),padding .2s cubic-bezier(.23,1,.32,1);min-height:300px}
.card h3{margin:0;font-size:18px;font-weight:560;color:#fff;letter-spacing:-.01em}
.card p{margin:0;font-size:14px;line-height:1.55;color:rgba(255,255,255,.66);max-width:34ch}
.cap[data-treat='Outline'] .card h3,.cap[data-treat='Flat'] .card h3{color:var(--ink)}
.cap[data-treat='Outline'] .card p,.cap[data-treat='Flat'] .card p{color:var(--dim)}
.mini{margin-top:auto;background:rgba(8,9,12,.42);border:1px solid rgba(255,255,255,.12);padding:14px;display:flex;flex-direction:column;gap:7px;transition:border-radius .2s cubic-bezier(.23,1,.32,1)}
.cap[data-treat='Outline'] .mini,.cap[data-treat='Flat'] .mini{background:rgba(255,255,255,.03);border-color:var(--line)}
.mini-row{display:flex;align-items:center;gap:9px;font-size:13px;color:#fff;font-weight:500}
.cap[data-treat='Outline'] .mini-row,.cap[data-treat='Flat'] .mini-row{color:var(--ink)}
.mi-ic{opacity:.7;font-size:13px}
.mi-tag{margin-left:auto;font-size:10.5px;color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.2);border-radius:6px;padding:2px 8px}
.cap[data-treat='Outline'] .mi-tag,.cap[data-treat='Flat'] .mi-tag{color:var(--dim);border-color:var(--line-2)}
.mini-sub{font-size:12px;color:rgba(255,255,255,.5);padding-left:22px}
.cap[data-treat='Outline'] .mini-sub,.cap[data-treat='Flat'] .mini-sub{color:var(--faint)}
.mini-field{display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,.08);padding:9px 12px;font-size:12.5px;color:#fff;margin-top:2px;transition:border-radius .2s cubic-bezier(.23,1,.32,1)}
.cap[data-treat='Outline'] .mini-field,.cap[data-treat='Flat'] .mini-field{background:rgba(255,255,255,.05);color:var(--ink)}
.mini-field b{font-variant-numeric:tabular-nums;color:var(--ac)}
.cap[data-treat='Gradient'] .mini-field b{color:#fff}
.mini-conn{width:1px;height:14px;background:rgba(255,255,255,.25);margin:2px 0 2px 11px}
.stat{margin-top:auto;background:rgba(255,255,255,.03);border:1px solid var(--line);padding:22px;display:flex;flex-direction:column;gap:8px;transition:border-radius .2s cubic-bezier(.23,1,.32,1)}
.stat-label{font-size:13px;color:var(--dim)}
.stat-num{font-size:clamp(44px,5vw,68px);font-weight:600;letter-spacing:-.04em;line-height:.9;color:var(--ink);font-variant-numeric:tabular-nums}
@media (max-width:920px){.cap-grid{grid-template-columns:1fr}}
`
