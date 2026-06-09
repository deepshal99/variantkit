// VariantKit core — pure. Builds the finalize decision (winner + override diff + prune list).
export type ParamValue = number | string | boolean
export interface Override { from: ParamValue; to: ParamValue }
export interface Decision {
  component: string
  finalized: string
  values: Record<string, ParamValue>
  overridesFromDefault: Record<string, Override>
  prune: string[]
  note: string
  status: 'pending'
  timestamp: string
}

const RESERVED = new Set(['variant', 'finalize'])
const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

function normalizeHex(s: string): string {
  let h = s.toLowerCase()
  if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]
  return h
}

export function valuesEqual(a: ParamValue, b: ParamValue): boolean {
  if (typeof a === 'string' && typeof b === 'string' && HEX.test(a) && HEX.test(b)) {
    return normalizeHex(a) === normalizeHex(b)
  }
  return a === b
}

export function buildDecision(
  component: string,
  liveValues: Record<string, ParamValue>,
  defaults: Record<string, ParamValue>,
  registry: Record<string, unknown>,
  opts?: { now?: string; note?: string },
): Decision {
  const finalized = String(liveValues.variant)
  const values: Record<string, ParamValue> = {}
  for (const k of Object.keys(liveValues)) {
    if (RESERVED.has(k)) continue
    values[k] = liveValues[k]
  }
  const overridesFromDefault: Record<string, Override> = {}
  for (const k of Object.keys(values)) {
    if (!(k in defaults)) continue
    if (!valuesEqual(values[k], defaults[k])) overridesFromDefault[k] = { from: defaults[k], to: values[k] }
  }
  const prune = Object.keys(registry).filter((k) => k !== finalized)
  return {
    component,
    finalized,
    values,
    overridesFromDefault,
    prune,
    note: opts?.note ?? '',
    status: 'pending',
    timestamp: opts?.now ?? new Date().toISOString(),
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
    throw new Error('no clipboard')
  } catch {
    if (typeof document === 'undefined') return false
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    document.body.removeChild(ta)
    return ok
  }
}
