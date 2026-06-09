// Maps variant key -> component + label. Deleted entirely on prune.
import Ledger from './variants/ledger'
import Slab from './variants/slab'
import Inverse from './variants/inverse'

export const registry = {
  ledger: { component: Ledger, label: 'A · Ledger' },
  slab: { component: Slab, label: 'B · Slab' },
  inverse: { component: Inverse, label: 'C · Inverse' },
} as const
