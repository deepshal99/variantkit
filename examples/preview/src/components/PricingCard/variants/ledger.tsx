type Props = { plan?: string; radius: number; accent: string }

const morph = {
  transition:
    'border-radius .25s ease, background-color .25s ease, box-shadow .25s ease, padding .25s ease',
}

export default function Ledger({ plan = 'Pro', radius, accent }: Props) {
  return (
    <div
      style={{
        ...morph,
        borderRadius: radius,
        padding: 24,
        border: `1px solid ${accent}`,
        background: 'transparent',
        color: '#1a1a1a',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: 320,
      }}
    >
      <div style={{ fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase', color: accent }}>{plan}</div>
      <div style={{ fontSize: 40, fontWeight: 700, margin: '8px 0' }}>$29</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0', fontSize: 14, lineHeight: 1.9 }}>
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
          border: `1px solid ${accent}`,
          background: 'transparent',
          color: accent,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Choose {plan}
      </button>
    </div>
  )
}
