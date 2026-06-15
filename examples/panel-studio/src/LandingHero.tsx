// VariantKit landing — a balanced split. Left: the hero, rendered as one of three DRASTICALLY
// different takes. Right: the REAL DialKit panel (wider, it's a demo). Switching a variant snaps
// a full preset AND restructures the hero's treatment (type, decoration, CTA, accent). Controls
// then fine-tune. Atmosphere (glow + grain + vignette) gives the dark depth.
import { useState, useEffect, useRef, type CSSProperties } from 'react'
import { useDialKit, DialStore } from 'dialkit'
import type { ParamValue } from './core/buildDecision'

type Take = 'Monolith' | 'Editorial' | 'Kinetic'

// Each take: a distinct typographic personality + a preset the variant snaps the controls to.
const TAKES: Record<Take, { family: string; transform: CSSProperties['textTransform']; italic?: boolean;
  size: number; weight: string; tracking: number; leading: number }> = {
  Monolith:  { family: '"Inter var", Inter, sans-serif',    transform: 'none',                   size: 64, weight: 'Black',   tracking: -2.5, leading: 1.0 },
  Editorial: { family: 'Georgia, "Times New Roman", serif', transform: 'none', italic: true,     size: 50, weight: 'Regular', tracking: -0.5, leading: 1.14 },
  Kinetic:   { family: '"Inter var", Inter, sans-serif',    transform: 'uppercase',              size: 78, weight: 'Bold',    tracking: -3.5, leading: 0.9 },
}
const WEIGHT: Record<string, number> = { Regular: 400, Medium: 500, Semibold: 600, Bold: 700, Black: 800 }

export default function LandingHero() {
  const [finalized, setFinalized] = useState<Take | null>(null)

  const v = useDialKit(
    'Hero',
    {
      variant: { type: 'select', options: ['Monolith', 'Editorial', 'Kinetic'], default: 'Monolith', segmented: true },
      headline: 'Ship three. Keep one.',
      eyebrow: 'The control panel for AI-built UI',
      size: [64, 38, 104, 1],
      weight: { type: 'select', options: ['Regular', 'Medium', 'Semibold', 'Bold', 'Black'], default: 'Black' },
      tracking: [-2.5, -5, 1, 0.5],
      accent: '#46d39a',
      glow: [22, 0, 80, 1],
      background: { type: 'select', options: ['Plain', 'Glow', 'Grid'], default: 'Glow' },
      rule: true,
      finalize: { type: 'action', label: 'Finalize Hero' },
    },
    {
      onChange: () => setFinalized(null),
      onAction: () => setFinalized(String(v.variant) as Take),
    },
  ) as Record<string, ParamValue>

  // Switching a variant snaps its whole preset (size/weight/tracking) — a dramatic starting point.
  const prev = useRef(String(v.variant))
  useEffect(() => {
    const cur = String(v.variant)
    if (cur === prev.current) return
    prev.current = cur
    const t = TAKES[cur as Take]
    const panel = (DialStore.getPanels() as Array<{ id: string; name: string }>).find((x) => x.name === 'Hero')
    if (!panel || !t) return
    DialStore.updateValue(panel.id, 'size', t.size)
    DialStore.updateValue(panel.id, 'weight', t.weight)
    DialStore.updateValue(panel.id, 'tracking', t.tracking)
  }, [v.variant])

  const variant = (String(v.variant) as Take) ?? 'Monolith'
  const take = TAKES[variant]
  const accent = String(v.accent)
  const size = Number(v.size)
  const weight = WEIGHT[String(v.weight)] ?? 700
  const tracking = Number(v.tracking)
  const glow = Number(v.glow)

  const headlineStyle: CSSProperties = {
    fontFamily: take.family,
    fontWeight: weight,
    fontStyle: take.italic ? 'italic' : 'normal',
    textTransform: take.transform,
    lineHeight: take.leading,
    letterSpacing: `${(tracking / 100).toFixed(3)}em`,
    fontSize: `clamp(36px, ${(size / 16).toFixed(2)}vw + 16px, ${size}px)`,
    margin: 0,
    color: 'var(--ink)',
    textShadow: glow > 0
      ? `0 0 ${glow}px color-mix(in srgb, ${accent} 55%, transparent), 0 2px 40px rgba(0,0,0,.5)`
      : '0 2px 40px rgba(0,0,0,.5)',
    transition: 'font-size .35s cubic-bezier(.2,.9,.2,1), line-height .35s, letter-spacing .35s, font-weight .2s, text-shadow .3s',
  }

  return (
    <main className="vk-land" data-bg={String(v.background)} style={{ ['--accent' as string]: accent }}>
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

      <section className="vk-hero">
        <div className="vk-left" data-take={variant}>
          {Boolean(v.eyebrow) && (
            <span className="vk-eyebrow">
              {variant === 'Kinetic' && <i className="vk-dot" />}
              {String(v.eyebrow)}
            </span>
          )}
          <h1 style={headlineStyle}>{String(v.headline) || ' '}</h1>
          {Boolean(v.rule) && variant !== 'Editorial' && <span className="vk-rule" />}
          <p className="vk-sub">When your AI agent builds UI, VariantKit has it generate a few versions instead of one. You compare them live, tune anything, and keep the one you want. The rest are deleted for you.</p>
          <div className="vk-row">
            <span className={`vk-cmd${variant === 'Kinetic' ? ' solid' : ''}`}>npx variantkit</span>
            {finalized && <span className="vk-done">✓ Finalized {finalized}</span>}
          </div>
        </div>
        <div className="vk-right" aria-hidden="true" />
      </section>

      <style>{css}</style>
    </main>
  )
}

const MAXW = 1280 // centered container
const PANEL = 500 // panel / right column width (wider — it's the demo)

const css = `
:root{
  --bg:#08090a; --ink:#f7f8f8; --dim:#8a8f98; --faint:#5c6066;
  --line:rgba(255,255,255,.09); --chip:rgba(255,255,255,.04); --pad:clamp(28px,4vw,44px);
  --accent:#46d39a;
  font-family:"Inter var",Inter,-apple-system,sans-serif;
}
*{box-sizing:border-box}
html,body,#root{height:100%}
body{margin:0;background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;
  font-feature-settings:"cv01","cv03","cv04","ss03";letter-spacing:-0.011em}
a{color:inherit;text-decoration:none}

.vk-land{position:relative;min-height:100dvh;overflow:hidden;background:var(--bg)}
.vk-land[data-bg='Plain']{background:radial-gradient(38% 50% at 80% 50%, color-mix(in srgb, var(--accent) 5%, transparent), transparent 62%), var(--bg)}
.vk-land[data-bg='Glow']{background:radial-gradient(44% 58% at 79% 50%, color-mix(in srgb, var(--accent) 13%, transparent), transparent 60%),
  radial-gradient(46% 46% at 16% 16%, rgba(255,255,255,.022), transparent 60%), var(--bg)}
.vk-land[data-bg='Grid']{background-color:var(--bg);
  background-image:radial-gradient(40% 56% at 79% 50%, color-mix(in srgb, var(--accent) 11%, transparent), transparent 60%),
    linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
  background-size:auto, 42px 42px, 42px 42px}
.vk-land::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;
  background:radial-gradient(84% 80% at 48% 48%, transparent 52%, rgba(0,0,0,.5) 100%)}
.vk-grain{position:fixed;inset:0;pointer-events:none;z-index:1;opacity:.038;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}

.vk-top{position:absolute;top:0;left:50%;transform:translateX(-50%);width:100%;max-width:${MAXW}px;z-index:5;
  padding:clamp(20px,2.4vw,30px) var(--pad);display:flex;align-items:center;justify-content:space-between;gap:16px}
.vk-brand{display:flex;align-items:center;gap:10px;font-weight:560;font-size:15px;letter-spacing:-.01em}
.vk-mark{display:inline-flex;gap:2.5px}
.vk-mark i{width:5px;height:15px;border-radius:2px;background:var(--ink);opacity:.85;display:block;transition:.4s cubic-bezier(.2,.9,.2,1)}
.vk-mark i:nth-child(2){opacity:.55;height:18px}.vk-mark i:nth-child(3){opacity:.3}
.vk-nav{display:flex;align-items:center;gap:4px}
.vk-nav a{font-size:14px;color:var(--dim);font-weight:450;padding:8px 12px;border-radius:8px;transition:.18s;display:inline-flex;align-items:center}
.vk-nav a:hover{color:var(--ink);background:var(--chip)}
.vk-nav a.ic{padding:8px;color:var(--dim)}.vk-nav a.ic:hover{color:var(--ink)}
.vk-nav svg{display:block}

.vk-hero{position:relative;z-index:2;min-height:100dvh;max-width:${MAXW}px;margin:0 auto;padding:0 var(--pad);
  display:grid;grid-template-columns:minmax(0,1fr) ${PANEL}px;gap:clamp(48px,5vw,84px);align-items:center}
.vk-left{display:flex;flex-direction:column;gap:26px;min-width:0}
.vk-eyebrow{font-size:14.5px;color:var(--dim);font-weight:500;letter-spacing:-.005em;display:inline-flex;align-items:center}
.vk-rule{display:block;height:3px;width:76px;border-radius:2px;background:var(--accent);transition:background .25s;margin-top:-10px}
.vk-sub{font-size:16.5px;line-height:1.62;color:var(--dim);font-weight:450;margin:0;max-width:46ch;text-shadow:0 1px 20px rgba(0,0,0,.5)}
.vk-row{display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin-top:8px}
.vk-cmd{font-size:14px;font-weight:500;color:var(--ink);border:1px solid var(--line);border-radius:9px;padding:11px 15px;background:rgba(10,10,12,.5);transition:.2s}
.vk-cmd::before{content:"$";color:var(--faint);margin-right:9px}
.vk-cmd.solid{background:var(--accent);border-color:transparent;color:#08130d;font-weight:650}
.vk-cmd.solid::before{color:rgba(8,19,13,.55)}
.vk-done{font-size:13.5px;color:var(--accent);font-weight:500}
.vk-dot{width:8px;height:8px;border-radius:50%;background:var(--accent);margin-right:11px;flex:0 0 auto;
  box-shadow:0 0 12px var(--accent);animation:vkpulse 2.4s infinite}
@keyframes vkpulse{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--accent) 55%,transparent)}70%{box-shadow:0 0 0 7px transparent}100%{box-shadow:0 0 0 0 transparent}}

/* ── DRASTIC per-take treatments ──────────────────────────────────────────── */
/* Editorial — refined, centered, serif; eyebrow becomes a tracked kicker with a leading rule */
.vk-left[data-take='Editorial']{align-items:center;text-align:center}
.vk-left[data-take='Editorial'] .vk-eyebrow{text-transform:uppercase;letter-spacing:.24em;font-size:12px;color:var(--dim);gap:14px}
.vk-left[data-take='Editorial'] .vk-eyebrow::before,
.vk-left[data-take='Editorial'] .vk-eyebrow::after{content:"";width:30px;height:1px;background:rgba(255,255,255,.25)}
.vk-left[data-take='Editorial'] .vk-sub{max-width:50ch;font-size:17px}
.vk-left[data-take='Editorial'] .vk-row{justify-content:center}
/* Kinetic — loud poster; accent-filled CTA, pulsing dot eyebrow, tighter rule */
.vk-left[data-take='Kinetic'] .vk-eyebrow{text-transform:uppercase;letter-spacing:.14em;font-size:12.5px;font-weight:600;color:var(--ink)}
.vk-left[data-take='Kinetic'] .vk-rule{width:120px;height:5px}

.dialkit-panel{position:fixed!important;top:50%!important;left:auto!important;bottom:auto!important;
  transform:translateY(-50%)!important;
  right:calc(max(0px, (100vw - ${MAXW}px) / 2) + var(--pad))!important;
  width:${PANEL}px!important;height:auto!important;max-height:min(88vh,820px)!important;z-index:4!important}
.dialkit-panel-inner{width:100%!important;max-height:min(88vh,820px)!important;
  border-radius:18px!important;border:1px solid var(--line)!important;
  background:#0d0e10!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;
  box-shadow:0 50px 130px -42px rgba(70,211,154,.16), 0 36px 90px -30px rgba(0,0,0,.85), 0 0 0 1px rgba(255,255,255,.03)!important;
  overflow-y:auto!important;padding:18px 20px 22px!important}
.dialkit-panel-inner::-webkit-scrollbar{width:9px}
.dialkit-panel-inner::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:5px}
.dialkit-panel-icon{display:none!important}

@media (max-width:1040px){
  .vk-hero{grid-template-columns:1fr;min-height:auto;padding-top:104px;padding-bottom:48dvh}
  .vk-right{display:none}.vk-left{max-width:none}
  .dialkit-panel{top:auto!important;bottom:14px!important;right:14px!important;left:14px!important;
    transform:none!important;width:auto!important;max-height:44dvh!important}
  .dialkit-panel-inner{max-height:44dvh!important}
  .vk-nav a:not(.ic){display:none}
}
@media (prefers-reduced-motion:reduce){*{transition:none!important}.vk-dot{animation:none}}
`
