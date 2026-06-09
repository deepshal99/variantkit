// Differentiator ② + ③: the finalize moment DialKit has no concept of. Shows the decision's
// CONSEQUENCE (what changed + what gets deleted) before you commit, in amber = decide.
import { useEffect, useState } from 'react'
import { T } from './tokens'
import { buildDecision, copyText, type ParamValue } from './buildDecision'
import type { SetState } from './store'

function registryOf(set: SetState) {
  return Object.fromEntries(set.variants.map((v) => [v.key, true]))
}

export default function FinalizeDrawer({
  set,
  onClose,
  onToast,
}: {
  set: SetState
  onClose: () => void
  onToast: (msg: string) => void
}) {
  const live = { variant: set.active, ...set.params[set.active] } as Record<string, ParamValue>
  const decision = buildDecision(set.name, live, set.defaults, registryOf(set))
  const overrides = Object.entries(decision.overridesFromDefault)
  const label = set.variants.find((v) => v.key === set.active)?.label ?? set.active

  const [copied, setCopied] = useState<string | null>(null)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function copy(which: 'json' | 'instruction', text: string) {
    const ok = await copyText(text)
    setCopied(ok ? which : null)
    setTimeout(() => setCopied(null), 1500)
  }

  const instruction = `Finalize ${set.name} as "${decision.finalized}". Inline ${JSON.stringify(
    decision.values,
  )}, then prune: delete ${decision.prune.join(', ')} and the registry, leaving a clean component.`

  const block: React.CSSProperties = {
    background: T.well,
    border: `1px solid ${T.edge}`,
    borderRadius: T.rCtl,
    padding: 12,
    fontFamily: T.mono,
    fontSize: 12,
    color: T.text,
    overflow: 'auto',
  }
  const copyBtn: React.CSSProperties = {
    border: `1px solid ${T.edge}`,
    background: T.bg,
    borderRadius: 8,
    padding: '4px 10px',
    fontSize: 11,
    fontFamily: T.font,
    cursor: 'pointer',
    color: T.dim,
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, fontFamily: T.font }}>
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(20,19,17,.45)', backdropFilter: 'blur(3px)' }}
      />
      <div
        role="dialog"
        aria-label={`Finalize ${label}`}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: '100%',
          width: 'min(440px, 100vw)',
          background: T.bg,
          borderLeft: `1px solid ${T.edge}`,
          boxShadow: T.shadow,
          padding: 22,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          animation: 'vkDrawerIn .28s cubic-bezier(.32,.72,.25,1)',
        }}
      >
        <style>{`@keyframes vkDrawerIn{from{transform:translateX(24px);opacity:.4}to{transform:none;opacity:1}}`}</style>

        <div>
          <div
            style={{
              fontFamily: T.mono,
              fontSize: 11,
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: T.accent,
              fontWeight: 600,
            }}
          >
            Decision
          </div>
          <div style={{ fontSize: 20, fontWeight: 650, marginTop: 4 }}>
            Finalize “{label}”
          </div>
          <div style={{ fontSize: 13, color: T.dim, marginTop: 2 }}>
            Review what changes and what gets removed, then hand off to your agent.
          </div>
        </div>

        {/* what changed */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: T.dim }}>Changes</div>
          {overrides.length === 0 ? (
            <div style={{ fontSize: 13, color: T.dim }}>No changes from defaults.</div>
          ) : (
            overrides.map(([k, o]) => (
              <div key={k} style={{ fontSize: 13, fontFamily: T.mono, display: 'flex', gap: 8 }}>
                <span style={{ color: T.dim, minWidth: 64 }}>{k}</span>
                <span style={{ color: T.dim }}>{String(o.from)}</span>
                <span style={{ color: T.accentInk }}>→</span>
                <span style={{ color: T.text, fontWeight: 600 }}>{String(o.to)}</span>
              </div>
            ))
          )}
        </section>

        {/* consequence — the part DialKit can't show */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: T.dim }}>
            Prune ({decision.prune.length})
          </div>
          <div style={{ fontSize: 13, color: T.text }}>
            Deletes{' '}
            <strong>{decision.prune.length ? decision.prune.join(', ') : 'nothing'}</strong>
            {decision.prune.length ? ', keeping only the winner.' : '.'}
          </div>
        </section>

        {/* payload */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minHeight: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: T.dim }}>
              decision.json
            </div>
            <button style={copyBtn} onClick={() => copy('json', JSON.stringify(decision, null, 2))}>
              {copied === 'json' ? <span style={{ color: T.ok }}>Copied</span> : 'Copy'}
            </button>
          </div>
          <pre style={{ ...block, margin: 0, flex: 1, whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(decision, null, 2)}
          </pre>
        </section>

        {/* footer */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              border: `1px solid ${T.edge}`,
              background: T.bg,
              borderRadius: T.rCtl,
              padding: '11px 14px',
              fontSize: 13,
              fontWeight: 600,
              color: T.dim,
              cursor: 'pointer',
            }}
          >
            Keep exploring
          </button>
          <button
            onClick={async () => {
              await copy('instruction', JSON.stringify(decision, null, 2) + '\n\n' + instruction)
              onToast(`${label} finalized, decision copied`)
              onClose()
            }}
            style={{
              flex: 1.4,
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
            Send &amp; prune
          </button>
        </div>
      </div>
    </div>
  )
}
