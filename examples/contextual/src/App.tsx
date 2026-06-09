import PricingCard from './components/PricingCard'
import Button from './components/Button'
import Hero from './components/Hero'

const label: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  color: '#9a948b',
  marginBottom: 14,
  fontFamily: 'system-ui, sans-serif',
}

export default function App() {
  return (
    <main style={{ minHeight: '100vh', background: '#e9e6e0', padding: '56px 24px 120px', fontFamily: 'system-ui, sans-serif' }}>
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
