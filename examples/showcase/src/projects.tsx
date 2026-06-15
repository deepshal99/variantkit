// Five simulated "projects", each a DIFFERENT product with a DIFFERENT element and its OWN
// contextual controls — the whole point of VariantKit: the controls are about what THAT element
// needs (a hero needs alignment + heading size; a player needs speed, size, glow; a stat needs a
// value + trend). Switch between them in the top bar; each mounts its own VariantKit panel.
import type { CSSProperties, ReactNode } from 'react'
import { motion } from 'motion/react'
import type { ElementDef } from './variantkit/react'

// Loosely-typed value bag — the controls are authored just below each element, so we know the keys.
type V = Record<string, string | number | boolean>

export interface Project {
  id: string
  label: string
  blurb: string
  /** Stage background — makes each project read as its own product. */
  bg: string
  /** Whether the switcher bar should flip to its dark treatment for this project. */
  darkChrome?: boolean
  element: ElementDef
}

const font = "'Inter', system-ui, -apple-system, sans-serif"
const card = (extra: CSSProperties): CSSProperties => ({
  fontFamily: font,
  borderRadius: 24,
  position: 'relative',
  ...extra,
})

// ─────────────────────────────────────────────────────────────────────────────────────────────
// 1 · AURORA — a SaaS landing hero. Controls: copy, heading size, alignment, dark mode, accent.
// ─────────────────────────────────────────────────────────────────────────────────────────────
function AuroraHero(variant: string, v: V): ReactNode {
  const dark = v.darkMode as boolean
  const accent = v.accent as string
  const center = (v.align as string) === 'center'
  const ink = dark ? '#f4f4f5' : '#0a0a0a'
  const sub = dark ? 'rgba(244,244,245,0.62)' : 'rgba(10,10,10,0.55)'
  const surface = dark ? '#141417' : '#ffffff'
  const eyebrow = (
    <span style={{ fontSize: 12, fontWeight: 650, letterSpacing: '0.08em', textTransform: 'uppercase', color: accent }}>
      {String(v.eyebrow)}
    </span>
  )
  const h1 = (
    <h1 style={{ margin: '14px 0 0', fontSize: Number(v.headingSize), lineHeight: 1.04, letterSpacing: '-0.03em', fontWeight: 720, color: ink }}>
      {String(v.headline)}
    </h1>
  )
  const cta = (
    <button style={{ marginTop: 26, border: 'none', cursor: 'pointer', background: accent, color: '#fff', fontWeight: 620, fontSize: 15, padding: '13px 24px', borderRadius: 12, fontFamily: font, boxShadow: `0 8px 22px ${accent}44` }}>
      Get started
    </button>
  )

  if (variant === 'minimal') {
    return (
      <div style={card({ width: 560, padding: '60px 8px', textAlign: center ? 'center' : 'left' })}>
        {h1}
        <a style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 22, color: accent, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
          Start building <span style={{ fontSize: 19 }}>→</span>
        </a>
      </div>
    )
  }
  if (variant === 'split') {
    const shape = String(v.shape ?? 'blob')
    const shapeStyle: CSSProperties =
      shape === 'disc'
        ? { borderRadius: '50%', background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.35)' }
        : shape === 'ring'
          ? { borderRadius: '50%', background: 'transparent', border: '12px solid rgba(255,255,255,0.4)' }
          : { borderRadius: '42% 58% 60% 40%', background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.35)' }
    return (
      <div style={card({ width: 880, background: surface, boxShadow: dark ? '0 30px 80px rgba(0,0,0,0.5)' : '0 30px 80px rgba(0,0,0,0.12)', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', overflow: 'hidden' })}>
        <div style={{ padding: '56px 48px' }}>
          {eyebrow}
          {h1}
          <p style={{ marginTop: 16, fontSize: 16, lineHeight: 1.55, color: sub, maxWidth: 360 }}>Generate variants, pick by feel, finalize. Your codebase stays clean.</p>
          {cta}
        </div>
        <div style={{ background: `radial-gradient(120% 120% at 20% 10%, ${accent} 0%, ${accent}99 40%, ${dark ? '#141417' : '#1a1a1f'} 100%)`, position: 'relative' }}>
          <motion.div
            aria-hidden
            animate={{ y: [0, -14, 0], rotate: shape === 'blob' ? [0, 8, 0] : 0 }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', width: 150, height: 150, top: '32%', left: '34%', backdropFilter: 'blur(6px)', ...shapeStyle }}
          />
        </div>
      </div>
    )
  }
  // centered
  return (
    <div style={card({ width: 720, padding: '72px 56px', background: surface, boxShadow: dark ? '0 30px 80px rgba(0,0,0,0.5)' : '0 30px 80px rgba(0,0,0,0.10)', textAlign: center ? 'center' : 'left' })}>
      {eyebrow}
      {h1}
      <p style={{ margin: '18px auto 0', marginLeft: center ? 'auto' : 0, marginRight: center ? 'auto' : 0, fontSize: 17, lineHeight: 1.55, color: sub, maxWidth: 440 }}>Generate variants, pick by feel, finalize. Your codebase stays clean.</p>
      {cta}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// 2 · HALO — a pricing card. Controls: plan, price, period, radius, highlight, accent.
// ─────────────────────────────────────────────────────────────────────────────────────────────
function HaloPricing(variant: string, v: V): ReactNode {
  const accent = v.accent as string
  const featured = variant === 'featured' || (v.highlight as boolean)
  const radius = Number(v.radius)
  const compact = variant === 'compact'
  const feats = ['Unlimited projects', 'Priority support', 'Audit log & SSO']
  return (
    <div
      style={card({
        width: compact ? 460 : 360,
        padding: compact ? '26px 30px' : '34px 32px',
        borderRadius: radius,
        background: '#fff',
        border: `1px solid ${featured ? accent : 'rgba(0,0,0,0.08)'}`,
        boxShadow: featured ? `0 0 0 4px ${accent}1f, 0 24px 60px rgba(0,0,0,0.12)` : '0 14px 40px rgba(0,0,0,0.07)',
        display: compact ? 'grid' : 'block',
        gridTemplateColumns: compact ? '1fr auto' : undefined,
        alignItems: 'center',
        gap: 22,
      })}
    >
      {featured && (
        <span style={{ position: 'absolute', top: -12, left: 28, background: accent, color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '5px 11px', borderRadius: 999 }}>
          Most popular
        </span>
      )}
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.5)' }}>{String(v.plan)}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
          <span style={{ fontSize: 44, fontWeight: 740, letterSpacing: '-0.03em', color: '#0a0a0a', fontVariantNumeric: 'tabular-nums' }}>${Number(v.price)}</span>
          <span style={{ fontSize: 15, color: 'rgba(0,0,0,0.45)', fontWeight: 500 }}>{String(v.period)}</span>
        </div>
        {!compact && (
          <ul style={{ listStyle: 'none', padding: 0, margin: '22px 0 0', display: 'grid', gap: 11 }}>
            {feats.map((f) => (
              <li key={f} style={{ display: 'flex', gap: 9, alignItems: 'center', fontSize: 14.5, color: 'rgba(0,0,0,0.72)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                {f}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button style={{ marginTop: compact ? 0 : 24, width: compact ? 'auto' : '100%', whiteSpace: 'nowrap', border: 'none', cursor: 'pointer', background: featured ? accent : '#0a0a0a', color: '#fff', fontWeight: 640, fontSize: 15, padding: '13px 22px', borderRadius: Math.max(8, radius - 8), fontFamily: font }}>
        Choose {String(v.plan)}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// 3 · PULSE — a now-playing card. Controls that ONLY a media element needs: cover size, glow
//     intensity, animation speed, palette, playing. (Shuffle these to feel the difference.)
// ─────────────────────────────────────────────────────────────────────────────────────────────
const PALETTES: Record<string, { bg: string; accent: string; ink: string }> = {
  midnight: { bg: '#0f172a', accent: '#818cf8', ink: '#e2e8f0' },
  sunset: { bg: '#1d1015', accent: '#fb7185', ink: '#fde7ec' },
  mono: { bg: '#161618', accent: '#d4d4d8', ink: '#fafafa' },
}
function PulsePlayer(variant: string, v: V): ReactNode {
  const pal = PALETTES[v.palette as string] ?? PALETTES.midnight
  const size = Number(v.coverSize)
  const glow = Number(v.glow)
  const playing = v.playing as boolean
  // Variant-specific knobs (each defined only for its own take — fall back when absent).
  const eqDur = 1.1 / (variant === 'cover' ? Number(v.eqSpeed ?? 1) : 1)
  const spinDur = 3.4 / Number(v.spin ?? 1)
  const barCount = variant === 'bars' ? Number(v.barCount ?? 7) : 7
  const cover = (extra: CSSProperties) => (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: variant === 'vinyl' ? '50%' : 18,
        background: `radial-gradient(120% 120% at 30% 25%, ${pal.accent} 0%, ${pal.accent}88 45%, ${pal.bg} 100%)`,
        boxShadow: `0 0 ${40 * glow}px ${10 * glow}px ${pal.accent}${Math.round(glow * 140).toString(16).padStart(2, '0')}`,
        display: 'grid',
        placeItems: 'center',
        animation: variant === 'vinyl' && playing ? `spin ${spinDur}s linear infinite` : undefined,
        ...extra,
      }}
      className={variant === 'vinyl' ? 'vinyl-spin' : undefined}
    >
      {variant === 'vinyl' && <div style={{ width: size * 0.22, height: size * 0.22, borderRadius: '50%', background: pal.bg, border: `2px solid ${pal.accent}66` }} />}
    </div>
  )
  const bars = (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 30 }}>
      {Array.from({ length: barCount }, (_, i) => (
        <span
          key={i}
          className="eq-bar"
          style={{
            width: 4,
            height: '100%',
            borderRadius: 3,
            transformOrigin: 'bottom',
            background: pal.accent,
            animation: playing ? `eq ${eqDur * (0.7 + (i % 3) * 0.25)}s ease-in-out ${i * 0.07}s infinite` : undefined,
            transform: playing ? undefined : 'scaleY(0.3)',
          }}
        />
      ))}
    </div>
  )
  const meta = (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 18, fontWeight: 680, color: pal.ink, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Resonance</div>
      <div style={{ fontSize: 14, color: pal.ink, opacity: 0.6, marginTop: 3 }}>Midnight Set · 3:24</div>
      {variant === 'bars' && <div style={{ marginTop: 18 }}>{bars}</div>}
    </div>
  )
  const playBtn = (
    <button style={{ width: 46, height: 46, flexShrink: 0, borderRadius: '50%', border: 'none', cursor: 'pointer', background: pal.accent, color: pal.bg, display: 'grid', placeItems: 'center', boxShadow: `0 6px 18px ${pal.accent}55` }}>
      {playing ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l12 7-12 7z" /></svg>
      )}
    </button>
  )

  const vertical = variant === 'vinyl'
  return (
    <div
      style={card({
        width: vertical ? 320 : 440,
        padding: 26,
        background: pal.bg,
        boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: vertical ? 'column' : 'row',
        alignItems: 'center',
        gap: 22,
        textAlign: vertical ? 'center' : 'left',
      })}
    >
      {cover({})}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minWidth: 0, alignItems: vertical ? 'center' : 'stretch', width: vertical ? '100%' : undefined }}>
        {meta}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: vertical ? 'center' : 'space-between' }}>
          {playBtn}
          {variant !== 'bars' && bars}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// 4 · DRIFT — a notification toast. Controls: title, body, elevation, radius, dismissible.
// ─────────────────────────────────────────────────────────────────────────────────────────────
const TOAST_TONE: Record<string, { accent: string; icon: ReactNode }> = {
  info: { accent: '#3b82f6', icon: <path d="M12 16v-4M12 8h.01" /> },
  success: { accent: '#10b981', icon: <polyline points="20 6 9 17 4 12" /> },
  alert: { accent: '#f59e0b', icon: <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /> },
}
function DriftToast(variant: string, v: V): ReactNode {
  const tone = TOAST_TONE[variant] ?? TOAST_TONE.info
  const elevation = Number(v.elevation)
  return (
    <div
      key={`${variant}-${v.title}`}
      style={card({
        width: 400,
        padding: '16px 16px 16px 18px',
        borderRadius: Number(v.radius),
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.06)',
        display: 'flex',
        gap: 13,
        alignItems: 'flex-start',
        boxShadow: `0 ${elevation}px ${elevation * 2.4}px rgba(0,0,0,${0.04 + elevation * 0.006})`,
        animation: 'toast-in 360ms cubic-bezier(0.23,1,0.32,1)',
      })}
    >
      <div style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 9, background: `${tone.accent}1a`, display: 'grid', placeItems: 'center' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={tone.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{tone.icon}</svg>
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 650, color: '#0a0a0a' }}>{String(v.title)}</div>
        <div style={{ fontSize: 13.5, color: 'rgba(0,0,0,0.55)', marginTop: 3, lineHeight: 1.5 }}>{String(v.body)}</div>
      </div>
      {(v.dismissible as boolean) && (
        <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'rgba(0,0,0,0.35)', padding: 4, lineHeight: 0, borderRadius: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// 5 · ORBIT — a dashboard stat tile. Controls: label, value, accent, density, trend, animated.
// ─────────────────────────────────────────────────────────────────────────────────────────────
function OrbitStat(variant: string, v: V): ReactNode {
  const accent = v.accent as string
  const value = Number(v.value)
  const compact = (v.density as string) === 'compact'
  const trend = v.trend as string
  const animated = v.animated as boolean
  const trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#a1a1aa'
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'
  const pad = compact ? 20 : 28
  const big = (
    <span style={{ fontSize: compact ? 30 : 40, fontWeight: 740, letterSpacing: '-0.03em', color: '#0a0a0a', fontVariantNumeric: 'tabular-nums' }}>{value}%</span>
  )
  const head = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.5)', letterSpacing: '0.01em' }}>{String(v.label)}</span>
      <span style={{ fontSize: 12.5, fontWeight: 650, color: trendColor, display: 'inline-flex', alignItems: 'center', gap: 3 }}>{trendIcon} {Math.round(value / 7)}%</span>
    </div>
  )

  if (variant === 'ring') {
    const r = 34
    const c = 2 * Math.PI * r
    return (
      <div style={card({ width: compact ? 230 : 270, padding: pad, background: '#fff', boxShadow: '0 14px 40px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: 20 })}>
        <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
          <svg width="88" height="88" viewBox="0 0 88 88" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="9" />
            <motion.circle cx="44" cy="44" r={r} fill="none" stroke={accent} strokeWidth="9" strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: animated ? c : c - (value / 100) * c }} animate={{ strokeDashoffset: c - (value / 100) * c }} transition={{ duration: animated ? 0.9 : 0, ease: [0.23, 1, 0.32, 1] }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 18, fontWeight: 720, color: '#0a0a0a', fontVariantNumeric: 'tabular-nums' }}>{value}%</div>
        </div>
        <div style={{ flex: 1 }}>{head}<div style={{ marginTop: 6, fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>vs last week</div></div>
      </div>
    )
  }
  if (variant === 'spark') {
    const pts = [40, 36, 38, 30, 33, 22, 26, 14, value / 5]
    const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * 26} ${44 - p}`).join(' ')
    return (
      <div style={card({ width: compact ? 240 : 280, padding: pad, background: '#fff', boxShadow: '0 14px 40px rgba(0,0,0,0.07)' })}>
        {head}
        <div style={{ marginTop: 12 }}>{big}</div>
        <svg width="100%" height="46" viewBox="0 0 208 46" preserveAspectRatio="none" style={{ marginTop: 8, overflow: 'visible' }}>
          <motion.path d={path} fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: animated ? 0 : 1 }} animate={{ pathLength: 1 }} transition={{ duration: animated ? 1 : 0, ease: 'easeInOut' }} />
        </svg>
      </div>
    )
  }
  // bar
  return (
    <div style={card({ width: compact ? 240 : 290, padding: pad, background: '#fff', boxShadow: '0 14px 40px rgba(0,0,0,0.07)' })}>
      {head}
      <div style={{ marginTop: 12 }}>{big}</div>
      <div style={{ marginTop: 16, height: 10, borderRadius: 999, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <motion.div initial={{ width: animated ? 0 : `${value}%` }} animate={{ width: `${value}%` }} transition={{ duration: animated ? 0.9 : 0, ease: [0.23, 1, 0.32, 1] }} style={{ height: '100%', borderRadius: 999, background: accent }} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// 6 · FORGE — a button with SIX variants whose names vary in length. Exists to show the variant
//     pills handle more-than-three takes and uneven names (they wrap, and long ones truncate).
// ─────────────────────────────────────────────────────────────────────────────────────────────
function ForgeButton(variant: string, v: V): ReactNode {
  const accent = v.accent as string
  const size = String(v.size)
  const radius = Number(v.radius)
  const pad = size === 'sm' ? '9px 16px' : size === 'lg' ? '15px 30px' : '12px 22px'
  const fs = size === 'sm' ? 13.5 : size === 'lg' ? 17 : 15
  const base: CSSProperties = {
    fontFamily: font,
    fontWeight: 600,
    fontSize: fs,
    padding: pad,
    borderRadius: radius,
    cursor: 'pointer',
    border: '1.5px solid transparent',
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap',
  }
  const byVariant: Record<string, CSSProperties> = {
    primary: { background: accent, color: '#fff', boxShadow: `0 8px 22px ${accent}44` },
    secondary: { background: 'rgba(0,0,0,0.06)', color: '#0a0a0a' },
    destructive: { background: '#dc2626', color: '#fff', boxShadow: '0 8px 22px #dc262644' },
    ghost: { background: 'transparent', color: accent },
    link: { background: 'transparent', color: accent, textDecoration: 'underline', textUnderlineOffset: 4, padding: 0 },
    outline: { background: 'transparent', color: accent, borderColor: accent },
  }
  return (
    <div style={{ display: 'grid', placeItems: 'center', padding: 48 }}>
      <button style={{ ...base, ...(byVariant[variant] ?? byVariant.primary) }}>{String(v.label)}</button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Project registry — each entry pairs an element with the controls that element actually needs.
// ─────────────────────────────────────────────────────────────────────────────────────────────
export const PROJECTS: Project[] = [
  {
    id: 'aurora',
    label: 'Aurora',
    blurb: 'A SaaS landing hero. Controls fit a hero: copy, heading size, alignment, theme, accent.',
    bg: 'radial-gradient(120% 80% at 50% -10%, #eef2ff 0%, #f6f7f9 45%, #eceef1 100%)',
    element: {
      name: 'Hero',
      keys: ['centered', 'split', 'minimal'],
      // Per-variant controls: only the SPLIT take has a visual panel, so only it gets a shape
      // control. Switch variants and watch the panel gain/lose "Shape".
      controls: (variant) => ({
        eyebrow: 'Now in beta',
        headline: 'Ship UI you can feel',
        headingSize: [54, 32, 84, 1],
        align: { type: 'select', options: ['left', 'center'], default: 'center' },
        darkMode: false,
        accent: '#6366f1',
        ...(variant === 'split'
          ? { shape: { type: 'select', options: ['blob', 'disc', 'ring'], default: 'blob' } }
          : {}),
      }),
      render: AuroraHero,
    },
  },
  {
    id: 'halo',
    label: 'Halo',
    blurb: 'A pricing card. Controls fit pricing: plan, price, period, corner radius, highlight.',
    bg: 'linear-gradient(180deg, #f0fdf9 0%, #f4f6f5 100%)',
    element: {
      name: 'Pricing Card',
      keys: ['classic', 'featured', 'compact'],
      controls: {
        plan: 'Pro',
        price: [29, 5, 199, 1],
        period: { type: 'select', options: ['/mo', '/yr'], default: '/mo' },
        radius: [22, 8, 36, 1],
        highlight: false,
        accent: '#10b981',
      },
      render: HaloPricing,
    },
  },
  {
    id: 'pulse',
    label: 'Pulse',
    blurb: 'A now-playing card. Controls only a media element needs: cover size, glow, speed, palette.',
    bg: 'linear-gradient(180deg, #0b1020 0%, #131826 100%)',
    darkChrome: true,
    element: {
      name: 'Now Playing',
      // Per-variant controls: each take needs a different knob — cover has an equalizer (speed),
      // vinyl has a spinning disc (spin), bars has a count. Shared knobs (size, glow, palette,
      // playing) stay across all three.
      keys: ['cover', 'vinyl', 'bars'],
      controls: (variant) => ({
        coverSize: [128, 80, 200, 2],
        glow: [0.55, 0, 1, 0.05],
        palette: { type: 'select', options: ['midnight', 'sunset', 'mono'], default: 'midnight' },
        playing: true,
        ...(variant === 'cover' ? { eqSpeed: [1, 0.3, 2.2, 0.1] } : {}),
        ...(variant === 'vinyl' ? { spin: [1, 0.3, 2.5, 0.1] } : {}),
        ...(variant === 'bars' ? { barCount: [7, 3, 14, 1] } : {}),
      }),
      render: PulsePlayer,
    },
  },
  {
    id: 'drift',
    label: 'Drift',
    blurb: 'A notification toast. Controls fit a toast: title, body, elevation, radius, dismissible.',
    bg: 'linear-gradient(180deg, #fff7ed 0%, #f5f3f1 100%)',
    element: {
      name: 'Toast',
      keys: ['info', 'success', 'alert'],
      controls: {
        title: 'Changes saved',
        body: 'Your project is up to date.',
        elevation: [18, 0, 44, 1],
        radius: [14, 6, 24, 1],
        dismissible: true,
      },
      render: DriftToast,
    },
  },
  {
    id: 'orbit',
    label: 'Orbit',
    blurb: 'A dashboard stat tile. Controls fit a metric: value, label, trend, density, accent.',
    bg: 'radial-gradient(120% 80% at 50% -10%, #fffbeb 0%, #f6f6f4 50%, #eeeeec 100%)',
    element: {
      name: 'Stat Tile',
      keys: ['ring', 'bar', 'spark'],
      controls: {
        label: 'Conversion',
        value: [72, 0, 100, 1],
        trend: { type: 'select', options: ['up', 'down', 'flat'], default: 'up' },
        density: { type: 'select', options: ['cozy', 'compact'], default: 'cozy' },
        accent: '#f59e0b',
        animated: true,
      },
      render: OrbitStat,
    },
  },
  {
    id: 'forge',
    label: 'Forge',
    blurb: 'A button — six variants with names of differing length. The pills wrap and truncate.',
    bg: 'radial-gradient(120% 80% at 50% -10%, #faf5ff 0%, #f5f4f6 55%, #edebf1 100%)',
    element: {
      name: 'Button',
      keys: ['primary', 'secondary', 'destructive', 'ghost', 'link', 'outline'],
      controls: {
        label: 'Get started',
        size: { type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
        radius: [10, 0, 24, 1],
        accent: '#7c3aed',
      },
      render: ForgeButton,
    },
  },
]
