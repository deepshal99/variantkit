// Contextual config: a hero exposes ALIGN, headingSize, background, accent — different
// again (layout-level controls a button or card would never show).
import { useDialKit } from 'dialkit'
import { buildDecision, copyDecision, type ParamValue } from '../core/buildDecision'

const VARIANTS = ['centered', 'split', 'minimal']
const DEFAULTS: Record<string, ParamValue> = { headingSize: 48, align: 'center', bg: 'light', accent: '#1F5E54' }
const reg = Object.fromEntries(VARIANTS.map((k) => [k, 1]))

export default function Hero() {
  const v = useDialKit(
    'Hero',
    {
      variant: { type: 'select', options: VARIANTS, default: 'centered' },
      align: { type: 'select', options: ['left', 'center'], default: 'center' },
      headingSize: [48, 28, 72],
      bg: { type: 'select', options: ['light', 'dark'], default: 'light' },
      accent: '#1F5E54',
      finalize: { type: 'action', label: 'Finalize Hero' },
    },
    { onAction: () => copyDecision(buildDecision('Hero', v as Record<string, ParamValue>, DEFAULTS, reg)) },
  ) as Record<string, ParamValue>

  const align = String(v.align) as 'left' | 'center'
  const dark = String(v.bg) === 'dark'
  const accent = String(v.accent)
  const split = String(v.variant) === 'split'
  const minimal = String(v.variant) === 'minimal'

  return (
    <div
      style={{
        transition: 'all .25s ease',
        width: 620,
        maxWidth: '100%',
        borderRadius: 16,
        padding: minimal ? '36px 32px' : '52px 40px',
        background: dark ? '#141311' : '#fbfaf8',
        border: `1px solid ${dark ? '#2a2723' : '#e7e5e1'}`,
        color: dark ? '#ede8df' : '#1a1a1a',
        fontFamily: 'system-ui, sans-serif',
        display: split ? 'grid' : 'block',
        gridTemplateColumns: split ? '1.4fr 1fr' : undefined,
        gap: split ? 28 : 0,
        alignItems: 'center',
        textAlign: split ? 'left' : align,
      }}
    >
      <div>
        <div style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: accent, marginBottom: 12 }}>
          New
        </div>
        <h1 style={{ fontSize: Number(v.headingSize), lineHeight: 1.05, margin: 0, fontWeight: 700 }}>
          Ship UI you can feel
        </h1>
        {!minimal && (
          <p style={{ fontSize: 16, color: dark ? '#b8b2a7' : '#6b665e', marginTop: 14, maxWidth: 440 }}>
            Generate variants, pick by feel, finalize. Your codebase stays clean.
          </p>
        )}
        <button
          style={{
            marginTop: 22,
            borderRadius: 10,
            padding: '12px 22px',
            border: 'none',
            background: accent,
            color: dark ? '#141311' : '#fff',
            fontWeight: 600,
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          Get started
        </button>
      </div>
      {split && (
        <div style={{ height: 150, borderRadius: 12, background: dark ? '#0d0c0a' : '#efece6', border: `1px solid ${dark ? '#2a2723' : '#e7e5e1'}` }} />
      )}
    </div>
  )
}
