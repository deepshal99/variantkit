import PanelDesign from './components/PanelDesign'

export default function App() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#e9e6e0',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9a948b', marginBottom: 18 }}>
          designing — VariantKit panel
        </div>
        <PanelDesign />
        <div style={{ fontSize: 12, color: '#9a948b', marginTop: 18, maxWidth: 320 }}>
          Pick a direction, tweak it, and finalize — using VariantKit's own panel (top-right).
        </div>
      </div>
    </main>
  )
}
