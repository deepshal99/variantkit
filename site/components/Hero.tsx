'use client'
import { useState } from 'react'
import { DialRoot } from 'dialkit'
import Link from 'next/link'
import WireframeMesh from './WireframeMesh'
import PreviewModal from './PreviewModal'

export default function Hero() {
  const [preview, setPreview] = useState(false)
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard?.writeText('npx variantkit@latest'); setCopied(true); setTimeout(() => setCopied(false), 1500) }

  return (
    <main className="ui">
      <WireframeMesh />
      <div className="wash" />

      <header className="top">
        <Link className="brand" href="/"><span className="mark"><i /><i /><i /></span>VariantKit</Link>
        <nav className="nav">
          <Link href="/docs">Docs</Link>
          <a className="ic" href="https://github.com/deepshal99/variantkit" target="_blank" rel="noopener" aria-label="GitHub">
            <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17"><path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.21 3.44 9.63 8.2 11.19.6.11.82-.25.82-.56 0-.28-.01-1.02-.02-2-3.34.73-4.04-1.6-4.04-1.6-.55-1.38-1.34-1.75-1.34-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.13-.31-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.87.12 3.18.77.84 1.24 1.91 1.24 3.23 0 4.63-2.81 5.66-5.49 5.96.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.69.83.57C20.56 21.91 24 17.5 24 12.29 24 5.78 18.63.5 12 .5z"/></svg>
          </a>
        </nav>
      </header>

      <div className="headline">
        <h1>The control panel for AI-built UI.</h1>
      </div>

      <div className="foot">
        <p className="sub">Ask your AI agent to build a few versions of a component instead of just one. VariantKit wires them to a live control panel, so you can switch between takes, tune every detail, and finalize the one you want. The rest get pruned from your code.</p>
        <div className="row">
          <span className="cmd">
            <span className="pr">$</span> npx variantkit@latest
            <button className={copied ? 'done' : undefined} onClick={copy} aria-label={copied ? 'Copied' : 'Copy command'}>
              {copied ? (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2.2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></svg>
              )}
            </button>
          </span>
          <button className="show" onClick={() => setPreview(true)}>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="2.6" /></svg>
            Show preview
          </button>
        </div>
      </div>

      {/* productionEnabled: this is a live marketing demo, so the panel must render on the
          deployed (production) build. In a real app VariantKit stays dev-only by default. */}
      <DialRoot productionEnabled />
      {preview && <PreviewModal onClose={() => setPreview(false)} />}

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </main>
  )
}

const css = `
.ui{position:relative;z-index:3;min-height:100dvh;display:grid;grid-template-rows:auto 1fr auto;
  padding:clamp(20px,2.4vw,30px) clamp(34px,4.6vw,68px);pointer-events:none}
.ui a,.ui button,.ui .cmd{pointer-events:auto}
.wash{position:fixed;inset:0;z-index:1;pointer-events:none;background:radial-gradient(74% 64% at 56% 50%, transparent 44%, rgba(0,0,0,.5) 100%)}

.top,.headline,.foot{position:relative;z-index:2}
.top{display:flex;align-items:center;justify-content:space-between;gap:16px}
.brand{display:flex;align-items:center;gap:10px;font-weight:560;font-size:15px;letter-spacing:-.01em}
.mark{display:inline-flex;gap:2.5px}
.mark i{width:5px;height:15px;border-radius:2px;background:var(--ink);opacity:.85;display:block;transition:.4s cubic-bezier(.2,.9,.2,1)}
.mark i:nth-child(2){opacity:.55;height:18px}.mark i:nth-child(3){opacity:.3}
.brand:hover .mark i:nth-child(1){background:#fff}
.nav{display:flex;align-items:center;gap:6px}
.nav a{font-size:14px;color:var(--dim);font-weight:450;padding:7px 11px;border-radius:8px;transition:.18s;display:inline-flex;align-items:center}
.nav a:hover{color:var(--ink);background:var(--chip)}
.nav a.ic{padding:8px}.nav svg{display:block}

.headline{align-self:start;justify-self:start;max-width:clamp(320px,42vw,580px);margin-top:clamp(10px,6vh,72px)}
.eyebrow{display:block;font-size:13px;color:var(--dim);font-weight:500;letter-spacing:-.003em;margin-bottom:20px}
h1{font-weight:600;font-size:clamp(36px,4.7vw,62px);line-height:1.02;letter-spacing:-.032em;margin:0;text-shadow:0 2px 40px rgba(0,0,0,.55)}

.foot{align-self:end;justify-self:start;max-width:50ch;display:flex;flex-direction:column;padding-bottom:clamp(6px,3vh,28px)}
.sub{font-size:16px;line-height:1.62;color:var(--dim);font-weight:400;margin:0;text-shadow:0 1px 22px rgba(0,0,0,.7)}
.row{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:28px}
.cmd{display:inline-flex;align-items:center;gap:8px;height:44px;box-sizing:border-box;border:1px solid var(--line-2);border-radius:9px;background:rgba(10,10,12,.6);backdrop-filter:blur(8px);padding:0 8px 0 13px;font-size:14px;font-weight:400}
.cmd .pr{color:var(--faint)}
.cmd button{display:inline-grid;place-items:center;border:0;background:transparent;color:var(--faint);cursor:pointer;width:26px;height:26px;border-radius:6px;transition:color .18s,background .18s,transform .12s}
.cmd button:hover{color:var(--ink);background:var(--chip)}
.cmd button:active{transform:scale(.9)}
.cmd button svg{display:block;animation:icpop .2s cubic-bezier(.2,.9,.2,1)}
.cmd button.done{color:var(--accent)}
@keyframes icpop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}
.show{display:inline-flex;align-items:center;gap:8px;height:44px;box-sizing:border-box;border:1px solid var(--line-2);background:rgba(255,255,255,.04);color:var(--ink);font:inherit;font-size:14px;font-weight:500;padding:0 16px 0 14px;border-radius:9px;cursor:pointer;transition:background .18s,border-color .18s,transform .12s}
.show svg{display:block;color:var(--dim);transition:color .18s}
.show:hover{background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.22)}
.show:hover svg{color:var(--ink)}
.show:active{transform:scale(.97)}

@media (max-width:820px){
  h1{font-size:clamp(30px,8vw,42px)}
  .nav a:not(.ic){padding:7px 8px}
}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`
