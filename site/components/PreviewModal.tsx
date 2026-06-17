'use client'
// "Show preview" modal — a tabbed gallery of real components, each driven live by the REAL
// VariantKit/DialKit panel (segmented variant pills, shuffle/reset, Finalize -> "✓ Copied").
// Switch tabs to see VariantKit working across a button, a pricing card, a feature section, and
// a callout — same panel, different component. Each tab also shows its live props as code.
import { useEffect, useState, type ComponentType } from 'react'
import ButtonPreview from './preview/ButtonPreview'
import PricingPreview from './preview/PricingPreview'
import FeaturePreview from './preview/FeaturePreview'
import BannerPreview from './preview/BannerPreview'

const TABS: { id: string; label: string; Comp: ComponentType }[] = [
  { id: 'button', label: 'Button.tsx', Comp: ButtonPreview },
  { id: 'pricing', label: 'PricingCard.tsx', Comp: PricingPreview },
  { id: 'feature', label: 'Capabilities.tsx', Comp: FeaturePreview },
  { id: 'banner', label: 'Callout.tsx', Comp: BannerPreview },
]

export default function PreviewModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState('button')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  const Active = TABS.find((t) => t.id === tab)!.Comp

  return (
    <div className="ov" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-bar">
          <span className="mb-dots"><i /><i /><i /></span>
          <span className="mb-file">VariantKit · live preview</span>
          <button className="mb-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <div className="modal-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={t.id === tab}
              data-on={t.id === tab}
              className="mtab"
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="modal-stage">
          <Active key={tab} />
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

/* editor-style tabs */
.modal-tabs{flex:0 0 auto;display:flex;gap:1px;padding:0 10px;border-bottom:1px solid var(--line);background:rgba(255,255,255,.012);overflow-x:auto;scrollbar-width:none}
.modal-tabs::-webkit-scrollbar{display:none}
.mtab{position:relative;border:0;background:transparent;font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:12px;color:var(--faint);padding:11px 14px;cursor:pointer;white-space:nowrap;transition:color .15s}
.mtab:hover{color:var(--dim)}
.mtab[data-on='true']{color:var(--ink)}
.mtab[data-on='true']::after{content:"";position:absolute;left:10px;right:10px;bottom:-1px;height:2px;background:var(--ink);border-radius:2px}

.modal-stage{flex:1;min-height:0;overflow:auto;position:relative;
  background:radial-gradient(60% 50% at 30% 10%, rgba(255,255,255,.02), transparent 60%), #0a0b0d}

/* shared preview layout: centered canvas + live code, with room reserved for the panel */
.pv{min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;padding:clamp(36px,5vw,60px)}
.pv-canvas{flex:0 1 auto;display:flex;align-items:center;justify-content:center;width:100%;min-height:220px}
.vk-code{margin:0;font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:12.5px;line-height:1.65;color:var(--dim);
  background:rgba(255,255,255,.025);border:1px solid var(--line);border-radius:12px;padding:16px 18px;max-width:min(440px,92%);overflow-x:auto}
.vk-code code{white-space:pre}
@media (min-width:921px){ .pv{padding-right:470px} }

/* the REAL VariantKit panel, floated at the modal's top-right, latest polished chrome.
   Only the EXPANDED panel is constrained; the collapsed bubble is left to DialKit. */
.dialkit-panel{position:fixed!important;z-index:320!important;left:auto!important;bottom:auto!important;transform:none!important;
  top:calc(50dvh - min(40vh,400px) + 96px)!important;
  right:calc(max(0px,(100vw - 1240px)/2) + clamp(34px,3vw,56px))!important}
.dialkit-panel-inner:not([data-collapsed='true']){
  border-radius:16px!important;border:1px solid var(--line-2)!important;background:#101113!important;
  backdrop-filter:none!important;-webkit-backdrop-filter:none!important;
  box-shadow:0 40px 110px -36px rgba(0,0,0,.9), 0 0 0 1px rgba(255,255,255,.03)!important;
  max-height:calc(min(86vh,820px) - 150px)!important;overflow-y:auto!important;padding:18px 20px 22px!important}
.dialkit-panel-inner::-webkit-scrollbar{width:9px}
.dialkit-panel-inner::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:5px}

@media (max-width:920px){
  .dialkit-panel{top:auto!important;bottom:24px!important;right:24px!important;left:auto!important}
  .dialkit-panel-inner:not([data-collapsed='true']){max-height:40dvh!important}
}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`
