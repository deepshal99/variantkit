// The custom VariantKit panel — DialKit's calm light surface, plus the three differentiators:
// ① variants as a visual strip (not a dropdown), ② a finalize drawer that shows consequence,
// ③ amber reserved for the decide moment only.
import { useState } from 'react'
import { T } from './tokens'
import {
  useVK,
  liveVariants,
  setActive,
  setParam,
  removeVariant,
  restoreRemoved,
  resetParams,
} from './store'
import FinalizeDrawer from './FinalizeDrawer'

export default function VariantPanel() {
  const s = useVK()
  const [drawer, setDrawer] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const live = liveVariants(s)
  const p = s.params[s.active]
  const activeLabel = s.variants.find((v) => v.key === s.active)?.label ?? s.active

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2600)
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          width: 300,
          background: T.bg,
          border: `1px solid ${T.edge}`,
          borderRadius: T.rPanel,
          boxShadow: T.shadow,
          fontFamily: T.font,
          color: T.text,
          zIndex: 900,
          overflow: 'hidden',
        }}
      >
        {/* header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            borderBottom: `1px solid ${T.edge}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: T.text, display: 'inline-block', transform: 'rotate(45deg)' }} />
            <span style={{ fontSize: 13, fontWeight: 650 }}>{s.name}</span>
          </div>
          <span style={{ fontSize: 11, color: T.dim, fontFamily: T.mono }}>
            {live.length} {live.length === 1 ? 'take' : 'takes'}
          </span>
        </div>

        {/* ① variant strip */}
        <div style={{ padding: '12px 14px 6px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {live.map((v) => {
            const isActive = v.key === s.active
            const dot = String(s.params[v.key].accent)
            return (
              <button
                key={v.key}
                onClick={() => setActive(v.key)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '6px 10px 6px 8px',
                  borderRadius: 999,
                  border: `1px solid ${isActive ? T.text : T.edge}`,
                  background: isActive ? T.text : 'transparent',
                  color: isActive ? '#fff' : T.dim,
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all .15s ease',
                }}
              >
                <span style={{ width: 9, height: 9, borderRadius: 999, background: dot, boxShadow: isActive ? '0 0 0 1.5px rgba(255,255,255,.5)' : `0 0 0 1px ${T.edge}` }} />
                {v.label}
                {live.length > 1 && (
                  <span
                    role="button"
                    aria-label={`remove ${v.label}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      removeVariant(v.key)
                    }}
                    style={{ marginLeft: 1, opacity: 0.6, fontSize: 13, lineHeight: 1 }}
                  >
                    ×
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* controls (active variant) */}
        <div style={{ padding: '6px 14px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Row label="radius" value={`${p.radius}px`}>
            <input
              type="range"
              min={0}
              max={32}
              step={1}
              value={Number(p.radius)}
              onChange={(e) => setParam(s.active, 'radius', Number(e.target.value))}
              style={{ width: '100%', accentColor: T.text }}
            />
          </Row>
          <Row label="accent" value={String(p.accent)}>
            <input
              type="color"
              value={String(p.accent)}
              onChange={(e) => setParam(s.active, 'accent', e.target.value)}
              style={{ width: 36, height: 24, border: `1px solid ${T.edge}`, borderRadius: 7, background: T.bg, cursor: 'pointer', padding: 2 }}
            />
          </Row>
        </div>

        {/* footer */}
        <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* ③ amber = decide */}
          <button
            onClick={() => setDrawer(true)}
            style={{
              width: '100%',
              border: 'none',
              background: T.accent,
              color: T.accentInk,
              borderRadius: T.rCtl,
              padding: '11px 14px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Finalize {activeLabel}
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: T.dim }}>
            <button onClick={resetParams} style={linkBtn}>reset</button>
            {s.removed.length > 0 && (
              <button onClick={restoreRemoved} style={linkBtn}>restore removed ({s.removed.length})</button>
            )}
          </div>
        </div>
      </div>

      {drawer && <FinalizeDrawer set={s} onClose={() => setDrawer(false)} onToast={showToast} />}

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: T.text,
            color: '#fff',
            padding: '10px 16px',
            borderRadius: 999,
            fontSize: 13,
            fontFamily: T.font,
            boxShadow: T.shadow,
            zIndex: 1100,
          }}
        >
          {toast}
        </div>
      )}
    </>
  )
}

const linkBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: T.dim,
  fontSize: 11,
  cursor: 'pointer',
  padding: 0,
  textDecoration: 'underline',
  fontFamily: T.font,
}

function Row({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: '.06em', textTransform: 'uppercase', color: T.dim }}>
          {label}
        </span>
        <span style={{ fontFamily: T.mono, fontSize: 11.5, color: T.text }}>{value}</span>
      </div>
      {children}
    </div>
  )
}
