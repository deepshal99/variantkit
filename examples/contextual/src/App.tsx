import { useState } from 'react'
import Studio from './studio'
import { useDialkitTheme } from './useDialkitTheme'

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  useDialkitTheme(theme)

  return (
    <main style={{ minHeight: '100vh', backgroundColor: theme === 'dark' ? '#0f0e0d' : '#e9e6e0', padding: '56px 24px 160px', fontFamily: 'system-ui, sans-serif', transition: 'background .25s ease' }}>
      <button
        onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        style={{
          position: 'fixed', left: 20, top: 20, zIndex: 1000,
          border: `1px solid ${theme === 'dark' ? '#2a2723' : '#d8d5cf'}`,
          background: theme === 'dark' ? '#1b1a18' : '#fff',
          color: theme === 'dark' ? '#ede8df' : '#1c1b1a',
          borderRadius: 999, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'system-ui, sans-serif',
        }}
      >
        {theme === 'dark' ? 'Dark panel' : 'Light panel'} · switch
      </button>

      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40, alignItems: 'center' }}>
        <div style={{ textAlign: 'center', color: '#9a948b', fontSize: 13, maxWidth: 460 }}>
          One panel, a folder per element. Open a folder to tune that element with controls that
          fit its type, then finalize it.
        </div>
        <Studio />
      </div>
    </main>
  )
}
