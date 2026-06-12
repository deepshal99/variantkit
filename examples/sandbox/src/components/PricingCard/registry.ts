// Maps variant key -> component + label. Deleted entirely on prune.
import type { ComponentType } from 'react'
import Ledger from './variants/ledger'
import Slab from './variants/slab'
import Inverse from './variants/inverse'

export type VariantProps = {
  plan?: string
  padding: number
  gap: number
  maxWidth: number
  align: 'start' | 'center' | 'end'
  radius: number
  borderWidth: number
  borderColor: string
  shadow: string
  fontSize: number
  weight: number
  lineHeight: number
  fontFamily: string
  accent: string
  fg: string
  muted: string
  priceSize: number
  ctaStyle: 'solid' | 'outline' | 'ghost'
  featured: boolean
  duration: number
}

export const registry: Record<string, { component: ComponentType<VariantProps>; label: string }> = {
  ledger: { component: Ledger, label: 'A · Ledger' },
  slab: { component: Slab, label: 'B · Slab' },
  inverse: { component: Inverse, label: 'C · Inverse' },
}
