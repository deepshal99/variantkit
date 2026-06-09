// Panel design: Clean — light, soft shadow, pill chips. DialKit-calm.
type Props = { radius: number; accent: string }
const sans = 'system-ui, -apple-system, "Segoe UI", sans-serif'
const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace'
const morph = { transition: 'border-radius .25s ease, background-color .25s ease' }
const chips = [
  ['Ledger', false],
  ['Slab', true],
  ['Inverse', false],
] as const

export default function Clean({ radius, accent }: Props) {
  return (
    <div style={{ ...morph, width: 300, background: '#fff', border: '1px solid #e7e5e1', borderRadius: radius, boxShadow: '0 14px 40px rgba(0,0,0,.14), 0 2px 6px rgba(0,0,0,.05)', fontFamily: sans, color: '#1c1b1a', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid #efedea' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, background: '#1c1b1a', transform: 'rotate(45deg)', borderRadius: 2 }} />
          <span style={{ fontSize: 13, fontWeight: 650 }}>PricingCard</span>
        </div>
        <span style={{ fontSize: 11, color: '#8a857d', fontFamily: mono }}>3 takes</span>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '12px 14px 8px' }}>
        {chips.map(([label, active]) => (
          <span key={label} style={{ ...morph, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 11px', borderRadius: 999, border: `1px solid ${active ? accent : '#e7e5e1'}`, background: active ? accent : 'transparent', color: active ? '#fff' : '#8a857d', fontSize: 12.5, fontWeight: 600 }}>
            <span style={{ width: 9, height: 9, borderRadius: 999, background: active ? '#fff' : accent }} />
            {label}
          </span>
        ))}
      </div>
      <div style={{ padding: '6px 14px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Track label="radius" value="18px" accent={accent} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '.06em', textTransform: 'uppercase', color: '#8a857d' }}>accent</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: mono, fontSize: 11.5 }}>{accent}<span style={{ width: 22, height: 16, borderRadius: 5, background: accent, border: '1px solid #e7e5e1' }} /></span>
        </div>
      </div>
      <div style={{ padding: '0 14px 14px' }}>
        <div style={{ ...morph, background: accent, color: '#fff', textAlign: 'center', borderRadius: Math.max(8, radius - 4), padding: '11px', fontSize: 13, fontWeight: 700 }}>Finalize Slab</div>
      </div>
    </div>
  )
}

function Track({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '.06em', textTransform: 'uppercase', color: '#8a857d' }}>{label}</span>
        <span style={{ fontFamily: mono, fontSize: 11.5 }}>{value}</span>
      </div>
      <div style={{ height: 4, background: '#efedea', borderRadius: 999, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '55%', background: '#cfcbc3', borderRadius: 999 }} />
        <div style={{ position: 'absolute', left: '55%', top: '50%', transform: 'translate(-50%,-50%)', width: 12, height: 12, borderRadius: 999, background: '#fff', border: `1px solid ${accent}`, boxShadow: '0 1px 2px rgba(0,0,0,.2)' }} />
      </div>
    </div>
  )
}
