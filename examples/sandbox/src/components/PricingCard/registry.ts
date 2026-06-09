// Maps variant key -> component + label. Deleted entirely on prune.
import type { ComponentType } from 'react'
import Ledger from './variants/ledger'
import Slab from './variants/slab'
import Inverse from './variants/inverse'

type VariantProps = { plan?: string; radius: number; accent: string }

export const registry: Record<string, { component: ComponentType<VariantProps>; label: string }> = {
  ledger: { component: Ledger, label: 'A · Ledger' },
  slab: { component: Slab, label: 'B · Slab' },
  inverse: { component: Inverse, label: 'C · Inverse' },
}
