import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { buildDecision, valuesEqual } from './buildDecision'

const here = dirname(fileURLToPath(import.meta.url))
// repo root is examples/sandbox/src/core -> up 4
const FIXTURE = resolve(here, '../../../../fixture/before/decisions/PricingCard.json')

const DEFAULTS = { radius: 18, accent: '#1F5E54' }
const registry = { ledger: {}, slab: {}, inverse: {} }
const NOW = '2026-06-09T00:00:00Z'

describe('valuesEqual', () => {
  it('treats #FFF and #ffffff as equal', () => {
    expect(valuesEqual('#FFF', '#ffffff')).toBe(true)
    expect(valuesEqual('#1F5E54', '#1f5e54')).toBe(true)
  })
  it('treats different colors as not equal', () => {
    expect(valuesEqual('#fff', '#000')).toBe(false)
  })
  it('compares numbers strictly', () => {
    expect(valuesEqual(12, 12)).toBe(true)
    expect(valuesEqual(12, 18)).toBe(false)
  })
})

describe('buildDecision', () => {
  it('records only changed keys in overridesFromDefault', () => {
    const d = buildDecision(
      'PricingCard',
      { variant: 'slab', radius: 12, accent: '#1F5E54' }, // radius changed, accent unchanged
      DEFAULTS,
      registry,
      { now: NOW },
    )
    expect(Object.keys(d.overridesFromDefault)).toEqual(['radius'])
    expect(d.overridesFromDefault.radius).toEqual({ from: 18, to: 12 })
  })

  it('emits empty overrides when nothing changed', () => {
    const d = buildDecision(
      'PricingCard',
      { variant: 'slab', radius: 18, accent: '#1f5e54' }, // accent differs only by case
      DEFAULTS,
      registry,
      { now: NOW },
    )
    expect(d.overridesFromDefault).toEqual({})
  })

  it('excludes reserved keys (variant, finalize) from values', () => {
    const d = buildDecision(
      'PricingCard',
      { variant: 'slab', radius: 12, accent: '#175048', finalize: true as unknown as string },
      DEFAULTS,
      registry,
      { now: NOW },
    )
    expect(d.values).toEqual({ radius: 12, accent: '#175048' })
    expect('variant' in d.values).toBe(false)
    expect('finalize' in d.values).toBe(false)
  })

  it('prunes every registry key except the winner, in registry order', () => {
    const d = buildDecision('PricingCard', { variant: 'slab', radius: 12, accent: '#175048' }, DEFAULTS, registry, { now: NOW })
    expect(d.prune).toEqual(['ledger', 'inverse'])
  })

  it('regression: reproduces the committed Phase C fixture decision exactly', () => {
    const expected = JSON.parse(readFileSync(FIXTURE, 'utf8'))
    const d = buildDecision(
      'PricingCard',
      { variant: 'slab', radius: 12, accent: '#175048' },
      DEFAULTS,
      registry,
      { now: expected.timestamp },
    )
    expect(d).toEqual(expected)
  })
})
