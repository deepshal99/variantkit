'use client'
import { usePreview, CodeBlock } from './shared'

const NAME = 'Button'
const FINALIZE = 'Finalize Button'
const CONFIG = {
  variant: { type: 'select', options: ['Solid', 'Outline', 'Soft', 'Ghost'], default: 'Solid', segmented: true },
  label: 'Get started',
  accent: '#5b7cfa',
  radius: [12, 2, 26, 1],
  size: { type: 'select', options: ['Small', 'Medium', 'Large'], default: 'Medium' },
  weight: { type: 'select', options: ['Regular', 'Medium', 'Semibold'], default: 'Semibold' },
  icon: true,
  finalize: { type: 'action', label: FINALIZE },
} as const

const WEIGHT: Record<string, number> = { Regular: 400, Medium: 500, Semibold: 600 }
const SIZE: Record<string, { px: number; fs: number; h: number }> = {
  Small: { px: 14, fs: 13, h: 36 },
  Medium: { px: 20, fs: 15, h: 44 },
  Large: { px: 26, fs: 16, h: 52 },
}

export default function ButtonPreview() {
  const v = usePreview(NAME, CONFIG, FINALIZE)
  const variant = String(v.variant)
  const accent = String(v.accent)
  const label = String(v.label) || 'Button'
  const radius = Number(v.radius)
  const size = SIZE[String(v.size)] ?? SIZE.Medium
  const weight = WEIGHT[String(v.weight)] ?? 600
  const icon = Boolean(v.icon)

  const skin =
    variant === 'Solid' ? { background: accent, color: '#07130d', border: '1px solid transparent' }
    : variant === 'Outline' ? { background: 'transparent', color: accent, border: `1.5px solid ${accent}` }
    : variant === 'Soft' ? { background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent, border: '1px solid transparent' }
    : { background: 'transparent', color: accent, border: '1px solid transparent' }

  return (
    <div className="pv">
      <div className="pv-canvas">
        <button className="demo-btn" style={{ ...skin, borderRadius: radius, height: size.h, padding: `0 ${size.px}px`, fontSize: size.fs, fontWeight: weight }}>
          {label}{icon && <span className="demo-arrow">→</span>}
        </button>
      </div>
      <CodeBlock lines={[
        `<Button`,
        `  variant="${variant.toLowerCase()}"`,
        `  size="${String(v.size).toLowerCase()}"`,
        `  accent="${accent}"`,
        `  radius={${radius}}`,
        `>${label}${icon ? ' →' : ''}</Button>`,
      ]} />
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </div>
  )
}

const css = `
.demo-btn{display:inline-flex;align-items:center;gap:9px;font-family:inherit;letter-spacing:-.01em;cursor:pointer;white-space:nowrap;line-height:1;box-sizing:border-box;transition:background .25s cubic-bezier(.23,1,.32,1),color .25s cubic-bezier(.23,1,.32,1),border-color .25s cubic-bezier(.23,1,.32,1),border-radius .2s cubic-bezier(.23,1,.32,1),transform .12s}
.demo-btn:active{transform:scale(.97)}
.demo-arrow{font-size:1.05em;opacity:.9}
`
