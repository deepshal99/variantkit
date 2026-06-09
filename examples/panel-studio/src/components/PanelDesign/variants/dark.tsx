// Panel design: Dark — the original VariantKit direction. Dark surface, light text.
type Props = { radius: number; accent: string }
const sans = 'system-ui, -apple-system, "Segoe UI", sans-serif'
const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace'
const morph = { transition: 'border-radius .25s ease, background-color .25s ease' }
const chips = [
  ['Ledger', false],
  ['Slab', true],
  ['Inverse', false],
] as const

export default function Dark({ radius, accent }: Props) {
  return (
    <div style={{ ...morph, width: 300, background: '#141311', border: '1px solid #2a2723', borderRadius: radius, boxShadow: '0 24px 60px rgba(0,0,0,.5)', fontFamily: sans, color: '#ede8df', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid #2a2723' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, background: accent, transform: 'rotate(45deg)', borderRadius: 2 }} />
          <span style={{ fontSize: 13, fontWeight: 650 }}>PricingCard</span>
        </div>
        <span style={{ fontSize: 11, color: '#8c857a', fontFamily: mono }}>3 takes</span>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '12px 14px 8px' }}>
        {chips.map(([label, active]) => (
          <span key={label} style={{ ...morph, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 11px', borderRadius: 999, border: `1px solid ${active ? 'transparent' : '#2a2723'}`, background: active ? '#ede8df' : 'transparent', color: active ? '#141311' : '#8c857a', fontSize: 12.5, fontWeight: 600 }}>
            <span style={{ width: 9, height: 9, borderRadius: 999, background: accent }} />
            {label}
          </span>
        ))}
      </div>
      <div style={{ padding: '6px 14px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Track label="radius" value="18px" accent={accent} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '.06em', textTransform: 'uppercase', color: '#8c857a' }}>accent</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: mono, fontSize: 11.5, color: '#ede8df' }}>{accent}<span style={{ width: 22, height: 16, borderRadius: 5, background: accent, border: '1px solid #2a2723' }} /></span>
        </div>
      </div>
      <div style={{ padding: '0 14px 14px' }}>
        <div style={{ ...morph, background: accent, color: '#141311', textAlign: 'center', borderRadius: Math.max(8, radius - 4), padding: '11px', fontSize: 13, fontWeight: 700 }}>Finalize Slab</div>
      </div>
    </div>
  )
}

function Track({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '.06em', textTransform: 'uppercase', color: '#8c857a' }}>{label}</span>
        <span style={{ fontFamily: mono, fontSize: 11.5, color: '#ede8df' }}>{value}</span>
      </div>
      <div style={{ height: 4, background: '#0d0c0a', borderRadius: 999, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '55%', background: '#454038', borderRadius: 999 }} />
        <div style={{ position: 'absolute', left: '55%', top: '50%', transform: 'translate(-50%,-50%)', width: 12, height: 12, borderRadius: 999, background: '#ede8df', border: `2px solid ${accent}` }} />
      </div>
    </div>
  )
}
