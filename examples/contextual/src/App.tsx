import Studio from './studio'
import { useDialkitTheme } from './variantkit/react'

export default function App() {
  // Manages the panel theme AND injects a sun/moon toggle into the panel header.
  useDialkitTheme('light')

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#e9e6e0', padding: '56px 24px 160px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40, alignItems: 'center' }}>
        <div style={{ textAlign: 'center', color: '#9a948b', fontSize: 13, maxWidth: 460 }}>
          One panel, a folder per element. Open a folder to tune that element with controls that
          fit its type, then finalize it. Toggle the panel's light/dark with the icon in its header.
        </div>
        <Studio />
      </div>
    </main>
  )
}
