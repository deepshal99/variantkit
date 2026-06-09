import type { ComponentType } from 'react'
import Clean from './variants/clean'
import Dark from './variants/dark'
import Mono from './variants/mono'

type P = { radius: number; accent: string }

export const registry: Record<string, { component: ComponentType<P>; label: string }> = {
  clean: { component: Clean, label: 'Clean' },
  dark: { component: Dark, label: 'Dark' },
  mono: { component: Mono, label: 'Mono' },
}
