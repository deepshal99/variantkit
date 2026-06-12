// Variant: Slab — solid surface, soft shadow, filled CTA. Self-contained (no tool imports).
type Props = {
  plan?: string
  padding: number
  gap: number
  maxWidth: number
  align: 'start' | 'center' | 'end'
  radius: number
  borderWidth: number
  borderColor: string
  shadow: string
  fontSize: number
  weight: number
  lineHeight: number
  fontFamily: string
  accent: string
  fg: string
  muted: string
  priceSize: number
  ctaStyle: 'solid' | 'outline' | 'ghost'
  featured: boolean
  duration: number
}

const morph = (duration: number) => ({
  transition: `border-radius ${duration}s ease, background-color ${duration}s ease, box-shadow ${duration}s ease, padding ${duration}s ease, border-color ${duration}s ease`,
})

const TEXT_ALIGN = { start: 'left', center: 'center', end: 'right' } as const

export default function Slab(p: Props) {
  const { plan = 'Pro' } = p
  const cta =
    p.ctaStyle === 'solid'
      ? { background: p.accent, color: '#fff', border: 'none' }
      : p.ctaStyle === 'outline'
        ? { background: 'transparent', color: p.accent, border: `${p.borderWidth}px solid ${p.accent}` }
        : { background: 'transparent', color: p.accent, border: 'none' }
  return (
    <div
      style={{
        ...morph(p.duration),
        display: 'flex',
        flexDirection: 'column',
        gap: p.gap,
        textAlign: TEXT_ALIGN[p.align],
        borderRadius: p.radius,
        padding: p.padding,
        border: 'none',
        background: '#f6f4ef',
        boxShadow: p.featured ? `${p.shadow}, 0 0 0 2px ${p.accent}` : p.shadow,
        color: p.fg,
        fontFamily: p.fontFamily,
        fontSize: p.fontSize,
        maxWidth: p.maxWidth,
      }}
    >
      <div style={{ fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase', color: p.accent }}>
        {plan}
      </div>
      <div style={{ fontSize: p.priceSize, fontWeight: p.weight }}>$29</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: p.lineHeight, color: p.muted }}>
        <li>Unlimited projects</li>
        <li>Priority support</li>
        <li>Audit log</li>
      </ul>
      <button
        style={{
          ...morph(p.duration),
          ...cta,
          borderRadius: p.radius / 2,
          padding: '10px 16px',
          width: '100%',
          fontWeight: 600,
          fontFamily: p.fontFamily,
          cursor: 'pointer',
        }}
      >
        Choose {plan}
      </button>
    </div>
  )
}
