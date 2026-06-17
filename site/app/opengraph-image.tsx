import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'VariantKit — the control panel for AI-built UI'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Branded social card, generated at the edge. Mirrors the site: near-black canvas, the variant
// mark + wordmark, the headline, and the install command.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#08090a',
          padding: '72px 80px',
          color: '#f4f5f6',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 34 }}>
            <div style={{ width: 8, height: 20, borderRadius: 4, background: '#f4f5f6', opacity: 0.4 }} />
            <div style={{ width: 8, height: 34, borderRadius: 4, background: '#f4f5f6' }} />
            <div style={{ width: 8, height: 26, borderRadius: 4, background: '#f4f5f6', opacity: 0.4 }} />
          </div>
          <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5 }}>VariantKit</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ fontSize: 76, fontWeight: 600, letterSpacing: -2.5, lineHeight: 1.05, maxWidth: 900 }}>
            The control panel for AI-built UI.
          </div>
          <div style={{ fontSize: 28, color: '#8a8f98', maxWidth: 820, lineHeight: 1.4 }}>
            Your agent builds a few real variants. Tune them in a live panel, finalize one, the rest get pruned.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 24,
              color: '#c3c7cc',
              border: '1px solid #23252a',
              borderRadius: 12,
              padding: '14px 20px',
              fontFamily: 'monospace',
            }}
          >
            <span style={{ color: '#595e64', marginRight: 12 }}>$</span>
            npx variantkit@latest
          </div>
          <div style={{ fontSize: 24, color: '#595e64' }}>variantkit.vercel.app</div>
        </div>
      </div>
    ),
    { ...size },
  )
}
