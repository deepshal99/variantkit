// VariantKit landing — the hero IS the product. A compact pitch on the left, a live STAGE in the
// middle showing one CTA rendered as three variant cards (the "illustration"), and the REAL
// DialKit panel on the right tuning the component — accent, radius, padding, weight, label. Click
// a card (or a pill) to select the variant; everything restyles live. Fills the whole space.
import { useState, type CSSProperties } from 'react'
import { useDialKit, DialStore } from 'dialkit'
import type { ParamValue } from './core/buildDecision'

type Take = 'Solid' | 'Outline' | 'Soft'
const TAKES: Take[] = ['Solid', 'Outline', 'Soft']
const WEIGHT: Record<string, number> = { Regular: 400, Medium: 500, Semibold: 600, Bold: 700 }

// Render the CTA in a given take, using the shared (panel-controlled) props.
function Cta({ take, label, accent, radius, padX, weight, arrow }: {
  take: Take; label: string; accent: string; radius: number; padX: number; weight: number; arrow: boolean
}) {
  const base: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 9, borderRadius: radius,
    padding: `13px ${padX}px`, fontSize: 15, fontWeight: weight, lineHeight: 1,
    fontFamily: 'inherit', letterSpacing: '-0.01em', cursor: 'pointer', whiteSpace: 'nowrap',
    transition: 'all .25s cubic-bezier(.2,.9,.2,1)',
  }
  const skin: CSSProperties =
    take === 'Solid' ? { background: accent, color: '#07130d', border: '1px solid transparent' }
    : take === 'Outline' ? { background: 'transparent', color: accent, border: `1.5px solid ${accent}` }
    : { background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent, border: '1px solid transparent' }
  return (
    <span style={{ ...base, ...skin }}>
      {label}
      {arrow && <span style={{ fontSize: 16, opacity: 0.9 }}>→</span>}
    </span>
  )
}

export default function LandingHero() {
  const [finalized, setFinalized] = useState<Take | null>(null)

  const v = useDialKit(
    'CTA',
    {
      variant: { type: 'select', options: ['Solid', 'Outline', 'Soft'], default: 'Solid', segmented: true },
      label: 'Get started',
      accent: '#46d39a',
      radius: [12, 0, 28, 1],
      paddingX: [24, 12, 48, 1],
      weight: { type: 'select', options: ['Regular', 'Medium', 'Semibold', 'Bold'], default: 'Semibold' },
      arrow: true,
      surface: { type: 'select', options: ['Plain', 'Grid', 'Dots'], default: 'Grid' },
      finalize: { type: 'action', label: 'Finalize CTA' },
    },
    {
      onChange: () => setFinalized(null),
      onAction: () => setFinalized(String(v.variant) as Take),
    },
  ) as Record<string, ParamValue>

  const active = (String(v.variant) as Take) ?? 'Solid'
  const accent = String(v.accent)
  const label = String(v.label) || 'Button'
  const radius = Number(v.radius)
  const padX = Number(v.paddingX)
  const weight = WEIGHT[String(v.weight)] ?? 600
  const arrow = Boolean(v.arrow)

  const select = (t: Take) => {
    const p = (DialStore.getPanels() as Array<{ id: string; name: string }>).find((x) => x.name === 'CTA')
    if (p) DialStore.updateValue(p.id, 'variant', t)
  }

  return (
    <main className="vk-land" data-bg={String(v.surface)} style={{ ['--accent' as string]: accent }}>
      <div className="vk-grain" />

      <header className="vk-top">
        <a className="vk-brand" href="#"><span className="vk-mark"><i /><i /><i /></span>VariantKit</a>
        <nav className="vk-nav">
          <a href="./docs.html">Docs</a>
          <a className="ic" href="https://github.com/deepshal99/variantkit" target="_blank" rel="noopener" aria-label="GitHub">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.21 3.44 9.63 8.2 11.19.6.11.82-.25.82-.56 0-.28-.01-1.02-.02-2-3.34.73-4.04-1.6-4.04-1.6-.55-1.38-1.34-1.75-1.34-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.13-.31-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.87.12 3.18.77.84 1.24 1.91 1.24 3.23 0 4.63-2.81 5.66-5.49 5.96.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.69.83.57C20.56 21.91 24 17.5 24 12.29 24 5.78 18.63.5 12 .5z"/></svg>
          </a>
        </nav>
      </header>

      <section className="vk-body">
        <div className="vk-pitch">
          <span className="vk-eyebrow"><i className="vk-dot" />Live — this is the product</span>
          <h1 className="vk-h1">Your agent ships three. You keep one.</h1>
          <p className="vk-sub">VariantKit generates a few real takes of every component, tunes them in this panel, and prunes everything you didn’t pick.</p>
          <span className="vk-cmd">npx variantkit@latest</span>
        </div>

        <div className="vk-stage">
          {TAKES.map((t, i) => (
            <button
              key={t}
              className="vk-card"
              data-on={String(t === active)}
              onClick={() => select(t)}
            >
              <span className="vk-card-top">
                <span className="vk-card-n">{String(i + 1).padStart(2, '0')}</span>
                <span className="vk-card-name">{t}</span>
                {t === active && (
                  <span className="vk-card-flag">{finalized === t ? 'finalized' : 'selected'}</span>
                )}
              </span>
              <span className="vk-card-stage">
                <Cta take={t} label={label} accent={accent} radius={radius} padX={padX} weight={weight} arrow={arrow} />
              </span>
            </button>
          ))}
          <span className="vk-stage-foot">Click a take, or use the panel. <b>Finalize</b> keeps one and prunes the rest.</span>
        </div>

        <div className="vk-right" aria-hidden="true" />
      </section>

      <style>{css}</style>
    </main>
  )
}

const PANEL = 432 // panel width, docked right

const css = `
:root{
  --bg:#0a0b0c; --ink:#f4f5f6; --dim:#8c9197; --faint:#595e64;
  --line:rgba(255,255,255,.09); --chip:rgba(255,255,255,.04); --pad:clamp(34px,5vw,72px);
  --accent:#46d39a;
  font-family:"Inter var",Inter,-apple-system,sans-serif;
}
*{box-sizing:border-box}
html,body,#root{height:100%}
body{margin:0;background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;
  font-feature-settings:"cv01","cv03","cv04","ss03";letter-spacing:-0.011em}
a{color:inherit;text-decoration:none}

.vk-land{position:relative;min-height:100dvh;overflow:hidden;background:var(--bg)}
.vk-land[data-bg='Plain']{background:linear-gradient(180deg,#0d0e10,var(--bg) 60%)}
.vk-land[data-bg='Grid']{background-color:var(--bg);
  background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:46px 46px}
.vk-land[data-bg='Dots']{background-color:var(--bg);
  background-image:radial-gradient(rgba(255,255,255,.06) 1.1px,transparent 1.1px);background-size:26px 26px}
.vk-land::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;
  background:radial-gradient(92% 82% at 42% 38%, transparent 56%, rgba(0,0,0,.48) 100%)}
.vk-grain{position:fixed;inset:0;pointer-events:none;z-index:1;opacity:.04;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}

.vk-top{position:absolute;top:0;left:0;right:0;z-index:5;
  padding:clamp(22px,2.4vw,32px) var(--pad);display:flex;align-items:center;justify-content:space-between;gap:16px}
.vk-brand{display:flex;align-items:center;gap:10px;font-weight:560;font-size:15px;letter-spacing:-.01em}
.vk-mark{display:inline-flex;gap:2.5px}
.vk-mark i{width:5px;height:15px;border-radius:2px;background:var(--ink);opacity:.85;display:block}
.vk-mark i:nth-child(2){opacity:.55;height:18px}.vk-mark i:nth-child(3){opacity:.3}
.vk-nav{display:flex;align-items:center;gap:4px}
.vk-nav a{font-size:14px;color:var(--dim);font-weight:450;padding:8px 12px;border-radius:8px;transition:.18s;display:inline-flex;align-items:center}
.vk-nav a:hover{color:var(--ink);background:var(--chip)}
.vk-nav a.ic{padding:8px;color:var(--dim)}.vk-nav a.ic:hover{color:var(--ink)}
.vk-nav svg{display:block}

/* body: pitch | live stage | (reserved panel) */
.vk-body{position:relative;z-index:2;min-height:100dvh;display:grid;
  grid-template-columns:minmax(240px,320px) minmax(0,1fr) ${PANEL}px;
  gap:clamp(36px,4vw,72px);align-items:center;padding:120px var(--pad) 64px}
.vk-right{}

.vk-pitch{display:flex;flex-direction:column;gap:22px}
.vk-eyebrow{display:inline-flex;align-items:center;font-size:13px;color:var(--dim);font-weight:500;letter-spacing:.02em;text-transform:uppercase}
.vk-dot{width:7px;height:7px;border-radius:50%;background:var(--accent);margin-right:11px;flex:0 0 auto}
.vk-h1{font-size:clamp(32px,3vw,44px);line-height:1.08;letter-spacing:-.028em;font-weight:600;margin:0;color:var(--ink)}
.vk-sub{font-size:15.5px;line-height:1.6;color:var(--dim);font-weight:450;margin:0}
.vk-cmd{align-self:flex-start;font-size:14px;font-weight:500;color:var(--ink);border:1px solid var(--line);border-radius:9px;padding:11px 15px;background:rgba(255,255,255,.03)}
.vk-cmd::before{content:"$";color:var(--faint);margin-right:9px}

/* live stage — three variant preview cards, the illustration */
.vk-stage{display:flex;flex-direction:column;gap:16px;max-width:520px;width:100%;justify-self:center}
.vk-card{position:relative;display:flex;flex-direction:column;gap:0;text-align:left;cursor:pointer;
  border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,.018);overflow:hidden;
  transition:.22s cubic-bezier(.2,.9,.2,1)}
.vk-card:hover{border-color:rgba(255,255,255,.2);background:rgba(255,255,255,.035);transform:translateY(-2px)}
.vk-card[data-on='true']{border-color:color-mix(in srgb,var(--accent) 60%,transparent);
  background:color-mix(in srgb,var(--accent) 7%,transparent);
  box-shadow:0 18px 50px -22px color-mix(in srgb,var(--accent) 45%,transparent)}
.vk-card-top{display:flex;align-items:center;gap:11px;padding:11px 15px;border-bottom:1px solid var(--line);font-size:12px}
.vk-card-n{font-variant-numeric:tabular-nums;color:var(--faint);font-weight:600}
.vk-card-name{color:var(--dim);font-weight:500}
.vk-card[data-on='true'] .vk-card-name{color:var(--ink)}
.vk-card-flag{margin-left:auto;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--accent);
  border:1px solid color-mix(in srgb,var(--accent) 40%,transparent);border-radius:999px;padding:3px 9px}
.vk-card-stage{display:flex;align-items:center;justify-content:center;padding:30px 18px;min-height:104px}
.vk-stage-foot{font-size:12.5px;color:var(--faint);margin-top:2px}
.vk-stage-foot b{color:var(--dim);font-weight:500}

/* docked panel, right */
.dialkit-panel{position:fixed!important;top:50%!important;left:auto!important;bottom:auto!important;
  transform:translateY(-50%)!important;right:clamp(20px,2vw,32px)!important;
  width:${PANEL}px!important;height:auto!important;max-height:min(90vh,860px)!important;z-index:4!important}
.dialkit-panel-inner{width:100%!important;max-height:min(90vh,860px)!important;
  border-radius:18px!important;border:1px solid var(--line)!important;background:#101113!important;
  backdrop-filter:none!important;-webkit-backdrop-filter:none!important;
  box-shadow:0 40px 110px -36px rgba(0,0,0,.9), 0 0 0 1px rgba(255,255,255,.03)!important;
  overflow-y:auto!important;padding:18px 20px 22px!important}
.dialkit-panel-inner::-webkit-scrollbar{width:9px}
.dialkit-panel-inner::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:5px}
.dialkit-panel-icon{display:none!important}

@media (max-width:1100px){
  .vk-body{grid-template-columns:1fr;min-height:auto;padding:104px var(--pad) 48dvh;gap:30px}
  .vk-right{display:none}.vk-stage{max-width:none;justify-self:stretch}
  .dialkit-panel{top:auto!important;bottom:14px!important;right:14px!important;left:14px!important;
    transform:none!important;width:auto!important;max-height:42dvh!important}
  .dialkit-panel-inner{max-height:42dvh!important}
  .vk-nav a:not(.ic){display:none}
}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`
