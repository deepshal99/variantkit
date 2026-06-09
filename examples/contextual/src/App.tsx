import { useState } from 'react'
import PricingCard from './components/PricingCard'
import Button from './components/Button'
import Hero from './components/Hero'
import { useDialkitTheme } from './useDialkitTheme'

const label: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  color: '#9a948b',
  marginBottom: 14,
  fontFamily: 'system-ui, sans-serif',
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  useDialkitTheme(theme)

  return (
    <main style={{ minHeight: '100vh', backgroundColor: theme === 'dark' ? '#0f0e0d' : '#e9e6e0', padding: '56px 24px 120px', fontFamily: 'system-ui, sans-serif', transition: 'background .25s ease' }}>
      <button
        onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        style={{
          position: 'fixed',
          left: 20,
          top: 20,
          zIndex: 1000,
          border: `1px solid ${theme === 'dark' ? '#2a2723' : '#d8d5cf'}`,
          background: theme === 'dark' ? '#1b1a18' : '#fff',
          color: theme === 'dark' ? '#ede8df' : '#1c1b1a',
          borderRadius: 999,
          padding: '8px 14px',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {theme === 'dark' ? 'Dark panel ·  switch to light' : 'Light panel ·  switch to dark'}
      </button>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 56, alignItems: 'center' }}>
        <div style={{ textAlign: 'center', color: '#9a948b', fontSize: 13, maxWidth: 460 }}>
          Each element registers its own contextual controls in the panel (top-right).
          Pick the section for the element you want to tune.
        </div>

        <section style={{ textAlign: 'center' }}>
          <div style={label}>Hero</div>
          <Hero />
        </section>

        <section style={{ textAlign: 'center' }}>
          <div style={label}>Pricing card</div>
          <PricingCard />
        </section>

        <section style={{ textAlign: 'center' }}>
          <div style={label}>Button</div>
          <Button />
        </section>
      </div>
    </main>
  )
}
