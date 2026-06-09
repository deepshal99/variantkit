// Variant: Inverse — dark surface, light text, glowing CTA. Self-contained (no tool imports).
type Props = { plan?: string; radius: number; accent: string }

const morph = {
  transition:
    'border-radius .25s ease, background-color .25s ease, box-shadow .25s ease, padding .25s ease',
}

export default function Inverse({ plan = 'Pro', radius, accent }: Props) {
  return (
    <div
      style={{
        ...morph,
        borderRadius: radius,
        padding: 28,
        border: 'none',
        background: '#141311',
        boxShadow: '0 0 0 1px rgba(255,255,255,.06), 0 18px 50px rgba(0,0,0,.5)',
        color: '#ede8df',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: 320,
      }}
    >
      <div style={{ fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase', color: accent }}>
        {plan}
      </div>
      <div style={{ fontSize: 40, fontWeight: 700, margin: '8px 0' }}>$29</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0', fontSize: 14, lineHeight: 1.9, color: '#b8b2a7' }}>
        <li>Unlimited projects</li>
        <li>Priority support</li>
        <li>Audit log</li>
      </ul>
      <button
        style={{
          ...morph,
          borderRadius: radius / 2,
          padding: '10px 16px',
          width: '100%',
          border: 'none',
          background: accent,
          color: '#141311',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Choose {plan}
      </button>
    </div>
  )
}
