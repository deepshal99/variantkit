// Pure renderers — each takes a resolved values slice from the single panel and draws the
// active variant. No useDialKit here; the Studio owns the one panel and passes slices in.
import type { ReactElement } from 'react'

type V = Record<string, string | number | boolean>
const sans = 'system-ui, -apple-system, sans-serif'
// On-screen morph between variants: exact properties, strong ease-in-out, under 300ms.
const EASE = 'cubic-bezier(0.77,0,0.175,1)'
const props = ['border-radius', 'background-color', 'box-shadow', 'color', 'border-color', 'padding']
const morph = { transition: props.map((p) => `${p} 220ms ${EASE}`).join(', ') }
const SHADOW: Record<string, string> = { none: 'none', soft: '0 18px 40px rgba(0,0,0,.10)', strong: '0 28px 60px rgba(0,0,0,.22)' }

export function renderCard(variant: string, v: V): ReactElement {
  const radius = Number(v.radius), padding = Number(v.padding), accent = String(v.accent)
  const dark = variant === 'inverse'
  const bg = dark ? '#141311' : variant === 'ledger' ? 'transparent' : '#f6f4ef'
  return (
    <div style={{ ...morph, width: 300, borderRadius: radius, padding, background: bg, border: variant === 'ledger' ? `1px solid ${accent}` : 'none', boxShadow: variant === 'ledger' ? 'none' : SHADOW[String(v.shadow)], color: dark ? '#ede8df' : '#1a1a1a', fontFamily: sans }}>
      <div style={{ fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase', color: accent }}>PRO</div>
      <div style={{ fontSize: 40, fontWeight: 700, margin: '8px 0' }}>$29</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0', fontSize: 14, lineHeight: 1.9, color: dark ? '#b8b2a7' : undefined }}>
        <li>Unlimited projects</li><li>Priority support</li><li>Audit log</li>
      </ul>
      <button style={{ ...morph, borderRadius: radius / 2, padding: '10px 16px', width: '100%', border: variant === 'ledger' ? `1px solid ${accent}` : 'none', background: variant === 'ledger' ? 'transparent' : accent, color: variant === 'ledger' ? accent : dark ? '#141311' : '#fff', fontWeight: 600, cursor: 'pointer' }}>Choose Pro</button>
    </div>
  )
}

export function renderButton(variant: string, v: V): ReactElement {
  const accent = String(v.accent), size = String(v.size)
  const pad: Record<string, string> = { sm: '8px 14px', md: '11px 20px', lg: '15px 28px' }
  const fs: Record<string, number> = { sm: 13, md: 15, lg: 17 }
  const solid = variant === 'solid', ghost = variant === 'ghost'
  return (
    <button style={{ ...morph, borderRadius: Number(v.radius), padding: pad[size], fontSize: fs[size], fontWeight: Number(v.weight), fontFamily: sans, cursor: 'pointer', width: v.fullWidth ? 320 : 'auto', background: solid ? accent : 'transparent', color: solid ? '#fff' : accent, border: ghost ? '1px solid transparent' : `1px solid ${accent}` }}>{String(v.label)}</button>
  )
}

export function renderHero(variant: string, v: V): ReactElement {
  const accent = String(v.accent), align = String(v.align) as 'left' | 'center', dark = String(v.bg) === 'dark'
  const split = variant === 'split', minimal = variant === 'minimal'
  return (
    <div style={{ ...morph, width: 620, maxWidth: '100%', borderRadius: 16, padding: minimal ? '36px 32px' : '52px 40px', background: dark ? '#141311' : '#fbfaf8', border: `1px solid ${dark ? '#2a2723' : '#e7e5e1'}`, color: dark ? '#ede8df' : '#1a1a1a', fontFamily: sans, display: split ? 'grid' : 'block', gridTemplateColumns: split ? '1.4fr 1fr' : undefined, gap: split ? 28 : 0, alignItems: 'center', textAlign: split ? 'left' : align }}>
      <div>
        <div style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: accent, marginBottom: 12 }}>{String(v.eyebrow)}</div>
        <h1 style={{ fontSize: Number(v.headingSize), lineHeight: 1.05, margin: 0, fontWeight: 700 }}>Ship UI you can feel</h1>
        {!minimal && <p style={{ fontSize: 16, color: dark ? '#b8b2a7' : '#6b665e', marginTop: 14, maxWidth: 440, marginLeft: align === 'center' && !split ? 'auto' : 0, marginRight: align === 'center' && !split ? 'auto' : 0 }}>Generate variants, pick by feel, finalize. Your codebase stays clean.</p>}
        <button style={{ marginTop: 22, borderRadius: 10, padding: '12px 22px', border: 'none', background: accent, color: dark ? '#141311' : '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Get started</button>
      </div>
      {split && <div style={{ height: 150, borderRadius: 12, background: dark ? '#0d0c0a' : '#efece6', border: `1px solid ${dark ? '#2a2723' : '#e7e5e1'}` }} />}
    </div>
  )
}

export function renderBadge(variant: string, v: V): ReactElement {
  const accent = String(v.accent), size = String(v.size)
  const soft = variant === 'soft', outline = variant === 'outline'
  const pad = size === 'md' ? '5px 12px' : '3px 9px'
  const fs = size === 'md' ? 13 : 11
  return (
    <span style={{ ...morph, display: 'inline-block', borderRadius: Number(v.radius), padding: pad, fontSize: fs, fontWeight: 600, fontFamily: sans, letterSpacing: v.uppercase ? '.06em' : 0, textTransform: v.uppercase ? 'uppercase' : 'none', background: soft ? `${accent}22` : outline ? 'transparent' : accent, color: soft || outline ? accent : '#fff', border: outline ? `1px solid ${accent}` : '1px solid transparent' }}>{String(v.label)}</span>
  )
}
