'use client'
import { usePreview } from './shared'

const NAME = 'Testimonial'
const FINALIZE = 'Finalize Testimonial'
const CONFIG = {
  variant: { type: 'select', options: ['Card', 'Quote', 'Minimal'], default: 'Card', segmented: true },
  accent: '#f59e0b',
  radius: [20, 6, 30, 1],
  name: 'Alex Rivera',
  role: 'Design Engineer',
  rating: [5, 1, 5, 1],
  finalize: { type: 'action', label: FINALIZE },
} as const

const QUOTE = 'My agent used to commit to one design. Now it hands me a few real takes and a panel. I keep the best, and the rest just disappear.'

export default function TestimonialPreview() {
  const v = usePreview(NAME, CONFIG, FINALIZE)
  const variant = String(v.variant)
  const accent = String(v.accent)
  const radius = Number(v.radius)
  const name = String(v.name) || 'Anonymous'
  const role = String(v.role) || ' '
  const rating = Math.max(1, Math.min(5, Number(v.rating)))
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  const surface =
    variant === 'Quote'
      ? { background: 'transparent', border: '0', borderLeft: `2px solid ${accent}`, borderRadius: 0 }
      : variant === 'Minimal'
      ? { background: 'transparent', border: '1px solid var(--line)', borderRadius: radius }
      : { background: '#101218', border: '1px solid var(--line-2)', borderRadius: radius }

  return (
    <div className="pv">
      <div className="pv-canvas">
        <figure className="tm-card" data-variant={variant} style={{ ...surface, ['--ac' as string]: accent }}>
          {variant === 'Quote' && <span className="tm-mark">&ldquo;</span>}
          <div className="tm-stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="tm-star" data-on={i < rating}>★</span>
            ))}
          </div>
          <blockquote className="tm-quote">{QUOTE}</blockquote>
          <figcaption className="tm-by">
            <span className="tm-avatar" style={{ background: `linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 30%, #6366f1))` }}>{initials}</span>
            <span className="tm-meta">
              <span className="tm-name">{name}</span>
              <span className="tm-role">{role}</span>
            </span>
          </figcaption>
        </figure>
      </div>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </div>
  )
}

const css = `
.tm-card{position:relative;width:420px;max-width:100%;margin:0;padding:26px 28px;display:flex;flex-direction:column;gap:16px;
  transition:background .28s cubic-bezier(.23,1,.32,1),border-color .28s cubic-bezier(.23,1,.32,1),border-radius .2s cubic-bezier(.23,1,.32,1)}
.tm-card[data-variant='Quote']{padding-left:24px}
.tm-mark{position:absolute;top:6px;right:22px;font-size:64px;line-height:1;color:color-mix(in srgb,var(--ac) 40%,transparent);font-family:Georgia,serif;pointer-events:none}
.tm-stars{display:flex;gap:3px}
.tm-star{font-size:15px;color:var(--line-2);transition:color .2s}
.tm-star[data-on='true']{color:var(--ac)}
.tm-quote{margin:0;font-size:16.5px;line-height:1.55;color:var(--ink);letter-spacing:-.01em}
.tm-by{display:flex;align-items:center;gap:12px;margin-top:2px}
.tm-avatar{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;flex:0 0 auto;font-size:14px;font-weight:600;color:#0b0c10;letter-spacing:.02em}
.tm-meta{display:flex;flex-direction:column;line-height:1.3}
.tm-name{font-size:14px;font-weight:560;color:var(--ink)}
.tm-role{font-size:12.5px;color:var(--dim)}
`
