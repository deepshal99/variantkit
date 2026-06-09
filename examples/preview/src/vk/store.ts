// Minimal external store for the preview panel. One variant set, framework-agnostic shape.
// The floating panel and the rendered component both read from here via useSyncExternalStore.
import { useSyncExternalStore } from 'react'
import type { ParamValue } from './buildDecision'

export interface VariantDef {
  key: string
  label: string
}

export interface SetState {
  name: string
  variants: VariantDef[]
  active: string
  removed: string[]
  defaults: Record<string, ParamValue>
  params: Record<string, Record<string, ParamValue>> // per-variant live values
}

let state: SetState = {
  name: 'PricingCard',
  variants: [
    { key: 'ledger', label: 'Ledger' },
    { key: 'slab', label: 'Slab' },
    { key: 'inverse', label: 'Inverse' },
  ],
  active: 'slab',
  removed: [],
  defaults: { radius: 18, accent: '#1F5E54' },
  params: {
    ledger: { radius: 18, accent: '#1F5E54' },
    slab: { radius: 18, accent: '#1F5E54' },
    inverse: { radius: 18, accent: '#1F5E54' },
  },
}

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}
export function getState(): SetState {
  return state
}

export function liveVariants(s: SetState): VariantDef[] {
  return s.variants.filter((v) => !s.removed.includes(v.key))
}

export function setActive(key: string) {
  state = { ...state, active: key }
  emit()
}

export function setParam(key: string, path: string, value: ParamValue) {
  state = { ...state, params: { ...state.params, [key]: { ...state.params[key], [path]: value } } }
  emit()
}

export function removeVariant(key: string) {
  const live = liveVariants(state)
  if (live.length <= 1) return // last survivor stays
  const removed = [...state.removed, key]
  let active = state.active
  if (active === key) {
    active = state.variants.find((v) => !removed.includes(v.key))!.key
  }
  state = { ...state, removed, active }
  emit()
}

export function restoreRemoved() {
  state = { ...state, removed: [] }
  emit()
}

export function resetParams() {
  const params: SetState['params'] = {}
  for (const v of state.variants) params[v.key] = { ...state.defaults }
  state = { ...state, params }
  emit()
}

export function useVK(): SetState {
  return useSyncExternalStore(subscribe, getState, getState)
}
