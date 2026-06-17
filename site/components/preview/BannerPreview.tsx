'use client'
import { usePreview, CodeBlock } from './shared'

const NAME = 'Callout'
const FINALIZE = 'Finalize Callout'
const CONFIG = {
  variant: { type: 'select', options: ['Subtle', 'Solid', 'Outline'], default: 'Subtle', segmented: true },
  accent: '#5b7cfa',
  radius: [12, 4, 22, 1],
  title: 'Heads up',
  message: 'Your trial ends in 3 days. Upgrade to keep your panels.',
  icon: true,
  finalize: { type: 'action', label: FINALIZE },
} as const

export default function BannerPreview() {
  const v = usePreview(NAME, CONFIG, FINALIZE)
  const variant = String(v.variant)
  const accent = String(v.accent)
  const radius = Number(v.radius)
  const title = String(v.title)
  const message = String(v.message)
  const icon = Boolean(v.icon)

  const skin =
    variant === 'Solid' ? { background: `color-mix(in srgb, ${accent} 88%, #000)`, border: '1px solid transparent' }
    : variant === 'Outline' ? { background: 'transparent', border: `1px solid color-mix(in srgb, ${accent} 55%, transparent)` }
    : { background: `color-mix(in srgb, ${accent} 12%, #0e1015)`, border: `1px solid color-mix(in srgb, ${accent} 28%, transparent)` }

  return (
    <div className="pv">
      <div className="pv-canvas">
        <div className="callout" data-variant={variant} style={{ ...skin, borderRadius: radius, ['--ac' as string]: accent }}>
          {icon && <span className="callout-ic">!</span>}
          <div className="callout-body">
            <div className="callout-title">{title}</div>
            <div className="callout-msg">{message}</div>
          </div>
          <button className="callout-x" aria-label="Dismiss">✕</button>
        </div>
      </div>
      <CodeBlock lines={[
        `<Callout`,
        `  variant="${variant.toLowerCase()}"`,
        `  accent="${accent}"`,
        `  radius={${radius}}`,
        `  title="${title}"`,
        `/>`,
      ]} />
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </div>
  )
}

const css = `
.callout{display:flex;align-items:flex-start;gap:13px;width:440px;max-width:100%;padding:15px 15px 15px 16px;transition:background .25s cubic-bezier(.23,1,.32,1),border-color .25s cubic-bezier(.23,1,.32,1),border-radius .2s cubic-bezier(.23,1,.32,1)}
.callout-ic{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;flex:0 0 auto;font-size:13px;font-weight:700;background:color-mix(in srgb,var(--ac) 22%,transparent);color:var(--ac)}
.callout[data-variant='Solid'] .callout-ic{background:rgba(255,255,255,.22);color:#fff}
.callout-body{flex:1;min-width:0}
.callout-title{font-size:14px;font-weight:560;color:var(--ink);margin-bottom:2px}
.callout[data-variant='Solid'] .callout-title{color:#fff}
.callout-msg{font-size:13px;line-height:1.5;color:var(--dim)}
.callout[data-variant='Solid'] .callout-msg{color:rgba(255,255,255,.85)}
.callout-x{border:0;background:transparent;color:var(--faint);cursor:pointer;font-size:12px;padding:3px 5px;border-radius:5px;transition:color .15s,transform .12s}
.callout-x:hover{color:var(--ink)}
.callout-x:active{transform:scale(.9)}
.callout[data-variant='Solid'] .callout-x{color:rgba(255,255,255,.7)}
.callout[data-variant='Solid'] .callout-x:hover{color:#fff}
`
