import PricingCard from './components/PricingCard'

export default function App() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#e9e6e0' }}>
      <PricingCard plan="Pro" />
    </main>
  )
}
