import { useVK } from './vk/store'
import { registry } from './components/PricingCard/registry'
import VariantPanel from './vk/VariantPanel'

export default function App() {
  const s = useVK()
  const Active = registry[s.active].component
  const p = s.params[s.active]

  return (
    <>
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
          <div style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9a948b', marginBottom: 20 }}>
            VariantKit preview
          </div>
          <Active plan="Pro" radius={Number(p.radius)} accent={String(p.accent)} />
        </div>
      </main>
      <VariantPanel />
    </>
  )
}
