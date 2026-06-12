import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { buildDecision, valuesEqual, flattenValues, defaultsFromConfig } from './buildDecision'
import { pricingArchetype } from './schemas/archetypes'

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
  it('compares control objects (spring) on the default keys only', () => {
    const def = { type: 'spring', visualDuration: 0.3, bounce: 0.15 }
    expect(valuesEqual(def, { type: 'spring', visualDuration: 0.3, bounce: 0.15, stiffness: 300 })).toBe(true)
    expect(valuesEqual(def, { type: 'spring', visualDuration: 0.5, bounce: 0.15 })).toBe(false)
  })
})

describe('flattenValues', () => {
  it('flattens folders to dot-paths and skips reserved/internal keys', () => {
    const flat = flattenValues({
      variant: 'slab',
      finalize: true,
      priceSize: 40,
      surface: { _collapsed: true, radius: 12, shadow: 'lg' },
      motion: { duration: 0.25, 'spring.__mode': 'simple' },
    })
    expect(flat).toEqual({
      priceSize: 40,
      'surface.radius': 12,
      'surface.shadow': 'lg',
      'motion.duration': 0.25,
    })
  })
  it('treats control-output objects (type field) as leaves', () => {
    const flat = flattenValues({ motion: { spring: { type: 'spring', bounce: 0.2 } } })
    expect(flat).toEqual({ 'motion.spring': { type: 'spring', bounce: 0.2 } })
  })
})

describe('defaultsFromConfig', () => {
  it('extracts one default per control across folders', () => {
    const d = defaultsFromConfig({
      variant: { type: 'select', options: ['a', 'b'], default: 'b' }, // reserved -> skipped
      finalize: { type: 'action', label: 'Go' }, // action -> skipped
      radius: [18, 0, 32],
      featured: false,
      label: 'Pro',
      surface: {
        bg: { type: 'color', default: '#ffffff' },
        shadow: { type: 'select', options: [{ value: 'sm', label: 'Small' }, 'md'] },
      },
      spring: { type: 'spring', bounce: 0.15 },
    })
    expect(d).toEqual({
      radius: 18,
      featured: false,
      label: 'Pro',
      surface: { bg: '#ffffff', shadow: 'sm' },
      spring: { type: 'spring', bounce: 0.15 },
    })
  })

  it('mirrors a real archetype: every control yields a default, no actions leak', () => {
    const d = defaultsFromConfig(pricingArchetype())
    const flat = flattenValues(d)
    expect(flat['layout.padding']).toBe(28)
    expect(flat['surface.shadow']).toBe('sm')
    expect(flat['typography.weight']).toBe('500')
    expect(Object.keys(flat).length).toBeGreaterThanOrEqual(20)
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
      { variant: 'slab', radius: 12, accent: '#175048', finalize: true },
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

  it('flattens nested folder values to dot-paths (schema 2)', () => {
    const live = {
      variant: 'slab',
      priceSize: 44,
      surface: { radius: 12, shadow: 'lg' },
      color: { accent: '#175048' },
    }
    const defaults = {
      priceSize: 40,
      surface: { radius: 18, shadow: 'lg' },
      color: { accent: '#1F5E54' },
    }
    const d = buildDecision('PricingCard', live, defaults, registry, { now: NOW })
    expect(d.schema).toBe(2)
    expect(d.values).toEqual({
      priceSize: 44,
      'surface.radius': 12,
      'surface.shadow': 'lg',
      'color.accent': '#175048',
    })
    expect(d.overridesFromDefault).toEqual({
      priceSize: { from: 40, to: 44 },
      'surface.radius': { from: 18, to: 12 },
      'color.accent': { from: '#1F5E54', to: '#175048' },
    })
  })

  it('round-trips an archetype config: untouched values produce zero overrides', () => {
    const config = pricingArchetype()
    const defaults = defaultsFromConfig(config)
    // Simulate DialKit returning exactly the defaults (untouched panel).
    const live = { variant: 'slab', ...JSON.parse(JSON.stringify(defaults)) }
    const d = buildDecision('PricingCard', live, defaults, registry, { now: NOW })
    expect(d.overridesFromDefault).toEqual({})
    expect(d.finalized).toBe('slab')
  })

  it('single-variant set (no variant select rendered): winner = the only registry key, empty prune', () => {
    const d = buildDecision('Footer', { radius: 12 }, { radius: 12 }, { terminal: true }, { now: NOW })
    expect(d.finalized).toBe('terminal')
    expect(d.prune).toEqual([])
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
