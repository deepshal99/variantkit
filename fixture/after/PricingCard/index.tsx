// PRUNED from the PricingCard variant set. Finalized: "slab".
// Produced mechanically per AGENT.md §4: slab.tsx had its decision values inlined
// (radius 18->12, accent #1F5E54->#175048), then was renamed to index.tsx; ledger.tsx,
// inverse.tsx and registry.ts were deleted. Zero VariantKit/DialKit residue.
type Props = { plan?: string }

const morph = {
  transition:
    'border-radius .25s ease, background-color .25s ease, box-shadow .25s ease, padding .25s ease',
}

export default function PricingCard({ plan = 'Pro' }: Props) {
  return (
    <div
      style={{
        ...morph,
        borderRadius: 12,
        padding: 28,
        border: 'none',
        background: '#f6f4ef',
        boxShadow: '0 18px 40px rgba(0,0,0,.10)',
        color: '#1a1a1a',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: 320,
      }}
    >
      <div style={{ fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase', color: '#175048' }}>
        {plan}
      </div>
      <div style={{ fontSize: 40, fontWeight: 700, margin: '8px 0' }}>$29</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0', fontSize: 14, lineHeight: 1.9 }}>
        <li>Unlimited projects</li>
        <li>Priority support</li>
        <li>Audit log</li>
      </ul>
      <button
        style={{
          ...morph,
          borderRadius: 6,
          padding: '10px 16px',
          width: '100%',
          border: 'none',
          background: '#175048',
          color: '#fff',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Choose {plan}
      </button>
    </div>
  )
}
