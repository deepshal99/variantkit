'use client'
// "Show preview" modal — a real feature section (two capability cards) driven live by the REAL
// VariantKit/DialKit panel. Switch the card treatment, recolor the accent, change radius and
// density, toggle the glow, retype the heading. Finalize commits the take — the panel reports
// which variant survives and the rest get pruned. This is VariantKit working on an actual
// section, in front of you.
import { useEffect, type CSSProperties } from 'react'
import { useDialKit } from 'dialkit'
import { usePanelActions } from './vk/usePanelActions'

type ParamValue = number | string | boolean
type Treatment = 'Gradient' | 'Flat' | 'Outline'

const FINALIZE_LABEL = 'Finalize section'

const CONFIG = {
  treatment: { type: 'select', options: ['Gradient', 'Flat', 'Outline'], default: 'Gradient', segmented: true },
  accent: '#5b7cfa',
  radius: [18, 4, 30, 1],
  density: [26, 18, 40, 1],
  glow: true,
  heading: 'the way agents ship UI',
  finalize: { type: 'action', label: FINALIZE_LABEL },
} as const

// Mirror the real VariantKit behaviour: on Finalize, copy the decision and flash the panel's
// Finalize button to "✓ Copied" for 1.5s (panel-side feedback, no toast/overlay). DialKit does
// not re-render on an action, so a direct text swap sticks until we revert it.
function flashFinalized(label: string, text: string) {
  if (typeof document === 'undefined') return
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.dialkit-root .dialkit-button'))
  let btn = buttons.find((b) => b.textContent?.trim() === label)
  if (!btn && buttons.length === 1) btn = buttons[0]
  if (!btn || btn.dataset.vkFlashing) return
  const original = btn.textContent ?? ''
  btn.dataset.vkFlashing = '1'
  btn.textContent = text
  setTimeout(() => {
    if (btn!.dataset.vkFlashing) { btn!.textContent = original; delete btn!.dataset.vkFlashing }
  }, 1500)
}

export default function PreviewModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  usePanelActions('Capabilities', CONFIG as unknown as Record<string, unknown>)

  const v = useDialKit(
    'Capabilities',
    CONFIG as never,
    {
      onAction: () => {
        const decision = {
          component: 'Capabilities',
          finalized: String(v.treatment),
          values: { accent: String(v.accent), radius: Number(v.radius), density: Number(v.density), glow: Boolean(v.glow), heading: String(v.heading) },
        }
        try { navigator.clipboard?.writeText(JSON.stringify(decision, null, 2)) } catch { /* clipboard unavailable */ }
        flashFinalized(FINALIZE_LABEL, '✓  Copied')
      },
    },
  ) as Record<string, ParamValue>

  const treat = (String(v.treatment) as Treatment) ?? 'Gradient'
  const accent = String(v.accent)
  const radius = Number(v.radius)
  const pad = Number(v.density)
  const glow = Boolean(v.glow)

  // card skins per treatment
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
    <div className="ov" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-bar">
          <span className="mb-dots"><i /><i /><i /></span>
          <span className="mb-file">Capabilities.tsx · live preview</span>
          <button className="mb-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <div className="modal-stage">
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
          </section>
        </div>

        <style dangerouslySetInnerHTML={{ __html: css }} />
      </div>
    </div>
  )
}

const css = `
.ov{position:fixed;inset:0;z-index:200;background:rgba(4,5,6,.66);backdrop-filter:blur(8px);
  display:flex;align-items:center;justify-content:center;padding:clamp(16px,3vw,40px);
  animation:ovin .2s cubic-bezier(.23,1,.32,1) both}
@keyframes ovin{from{opacity:0}to{opacity:1}}
.modal{position:relative;width:100%;max-width:1240px;height:min(86vh,820px);background:#0a0b0d;
  border:1px solid var(--line-2);border-radius:18px;overflow:hidden;display:flex;flex-direction:column;
  box-shadow:0 60px 160px -50px rgba(0,0,0,.9);transform-origin:center;
  animation:modin .28s cubic-bezier(.23,1,.32,1) both}
@keyframes modin{from{opacity:0;transform:translateY(8px) scale(.985)}to{opacity:1;transform:none}}
.modal-bar{flex:0 0 auto;height:44px;display:flex;align-items:center;gap:12px;padding:0 14px;border-bottom:1px solid var(--line);background:rgba(255,255,255,.02)}
.mb-dots{display:flex;gap:7px}.mb-dots i{width:11px;height:11px;border-radius:50%;background:#2a2d31}
.mb-file{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:12px;color:var(--faint)}
.mb-close{display:grid;place-items:center;margin-left:auto;width:30px;height:30px;border:0;border-radius:8px;background:transparent;color:var(--dim);cursor:pointer;transition:background .16s,color .16s,transform .12s}
.mb-close:hover{background:var(--chip);color:var(--ink)}
.mb-close:active{transform:scale(.92)}
.mb-close svg{display:block}

.modal-stage{flex:1;min-height:0;overflow:auto;position:relative;
  background:radial-gradient(60% 50% at 30% 10%, rgba(255,255,255,.02), transparent 60%), #0a0b0d}

/* the recreated capability section */
.cap{padding:clamp(40px,5vw,72px);padding-right:clamp(40px,5vw,72px)}
.cap-h{margin:0 0 clamp(28px,4vw,48px);font-size:clamp(26px,2.6vw,38px);line-height:1.18;letter-spacing:-.025em;font-weight:600;max-width:22ch}
.cap-h .dim{color:var(--faint)}.cap-h .bright{color:var(--ink)}
.cap-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:22px;max-width:920px}
.card{display:flex;flex-direction:column;gap:10px;transition:background .28s cubic-bezier(.23,1,.32,1),border-color .28s cubic-bezier(.23,1,.32,1),box-shadow .28s cubic-bezier(.23,1,.32,1),border-radius .2s cubic-bezier(.23,1,.32,1),padding .2s cubic-bezier(.23,1,.32,1);min-height:300px}
.card h3{margin:0;font-size:18px;font-weight:560;color:#fff;letter-spacing:-.01em}
.card p{margin:0;font-size:14px;line-height:1.55;color:rgba(255,255,255,.66);max-width:34ch}
.cap[data-treat='Outline'] .card h3,.cap[data-treat='Flat'] .card h3{color:var(--ink)}
.cap[data-treat='Outline'] .card p,.cap[data-treat='Flat'] .card p{color:var(--dim)}

/* mini control UI inside card A */
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

/* stat card B */
.stat{margin-top:auto;background:rgba(255,255,255,.03);border:1px solid var(--line);padding:22px;display:flex;flex-direction:column;gap:8px;transition:border-radius .2s cubic-bezier(.23,1,.32,1)}
.stat-label{font-size:13px;color:var(--dim)}
.stat-num{font-size:clamp(44px,5vw,68px);font-weight:600;letter-spacing:-.04em;line-height:.9;color:var(--ink);font-variant-numeric:tabular-nums}

/* the REAL VariantKit panel, floated at the modal's top-right, with the latest polished chrome.
   Only the EXPANDED panel is constrained (height/scroll); the collapsed bubble is left to DialKit
   so it minimizes cleanly. */
.dialkit-panel{position:fixed!important;z-index:320!important;left:auto!important;bottom:auto!important;transform:none!important;
  top:calc(50dvh - min(43vh,410px) + 78px)!important;
  right:calc(max(0px,(100vw - 1240px)/2) + clamp(34px,3vw,56px))!important}
.dialkit-panel-inner:not([data-collapsed='true']){
  border-radius:16px!important;border:1px solid var(--line-2)!important;background:#101113!important;
  backdrop-filter:none!important;-webkit-backdrop-filter:none!important;
  box-shadow:0 40px 110px -36px rgba(0,0,0,.9), 0 0 0 1px rgba(255,255,255,.03)!important;
  max-height:calc(min(86vh,820px) - 120px)!important;overflow-y:auto!important;padding:18px 20px 22px!important}
.dialkit-panel-inner::-webkit-scrollbar{width:9px}
.dialkit-panel-inner::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:5px}

@media (max-width:920px){
  .cap-grid{grid-template-columns:1fr}
  .dialkit-panel{top:auto!important;bottom:24px!important;right:24px!important;left:auto!important}
  .dialkit-panel-inner:not([data-collapsed='true']){max-height:40dvh!important}
}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`
