// Panel design: Mono — flat, bordered, monospace labels, square chips. Technical/precise.
type Props = { radius: number; accent: string }
const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace'
const morph = { transition: 'border-radius .25s ease, background-color .25s ease' }
const chips = [
  ['LEDGER', false],
  ['SLAB', true],
  ['INVERSE', false],
] as const

export default function Mono({ radius, accent }: Props) {
  return (
    <div style={{ ...morph, width: 300, background: '#fafafa', border: '1px solid #d8d5cf', borderRadius: radius, fontFamily: mono, color: '#1c1b1a', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', borderBottom: '1px solid #e2dfd9' }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.04em' }}>PRICINGCARD</span>
        <span style={{ fontSize: 11, color: '#8a857d' }}>3 takes</span>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '12px 14px 8px' }}>
        {chips.map(([label, active]) => (
          <span key={label} style={{ ...morph, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 9px', borderRadius: 6, border: `1px solid ${active ? accent : '#d8d5cf'}`, background: active ? '#fff' : 'transparent', color: active ? '#1c1b1a' : '#8a857d', fontSize: 11, fontWeight: 600, letterSpacing: '.04em' }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: accent }} />
            {label}
          </span>
        ))}
      </div>
      <div style={{ padding: '6px 14px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Track label="RADIUS" value="18" accent={accent} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10.5, letterSpacing: '.06em', color: '#8a857d' }}>ACCENT</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5 }}>{accent}<span style={{ width: 22, height: 16, borderRadius: 3, background: accent, border: '1px solid #d8d5cf' }} /></span>
        </div>
      </div>
      <div style={{ padding: '0 14px 14px' }}>
        <div style={{ ...morph, background: 'transparent', color: accent, border: `1px solid ${accent}`, textAlign: 'center', borderRadius: 6, padding: '10px', fontSize: 12, fontWeight: 700, letterSpacing: '.04em' }}>FINALIZE SLAB</div>
      </div>
    </div>
  )
}

function Track({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10.5, letterSpacing: '.06em', color: '#8a857d' }}>{label}</span>
        <span style={{ fontSize: 11.5 }}>{value}</span>
      </div>
      <div style={{ height: 4, background: '#e8e5df', borderRadius: 2, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '55%', background: accent, opacity: 0.5, borderRadius: 2 }} />
        <div style={{ position: 'absolute', left: '55%', top: '50%', transform: 'translate(-50%,-50%)', width: 10, height: 10, borderRadius: 2, background: '#fff', border: `1px solid ${accent}` }} />
      </div>
    </div>
  )
}
