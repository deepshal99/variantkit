// VariantKit core — the only runtime file you copy into a project. Pure, no React imports.
// Builds the finalize decision (winner + override diff + prune list) and copies it so your
// agent can prune the variant set down to the winner. See AGENT.md for the contract.
//
//   live values + frozen defaults
//            │
//            ▼
//   buildDecision ── finalized (winner key)
//                ├── values (final params to inline)
//                ├── overridesFromDefault (only-changed; the taste signal)
//                └── prune (every registry key except the winner)

export type ParamValue = number | string | boolean

export interface Override {
  from: ParamValue
  to: ParamValue
}

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

// Keys present in the DialKit values object that are NOT design params.
const RESERVED = new Set(['variant', 'finalize'])

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

function normalizeHex(s: string): string {
  let h = s.toLowerCase()
  if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]
  return h
}

// Equality that treats #FFF and #ffffff as the same color, everything else strict.
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
    if (!valuesEqual(values[k], defaults[k])) {
      overridesFromDefault[k] = { from: defaults[k], to: values[k] }
    }
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

// Copy the decision JSON to the clipboard. NEVER fail silently: if the Clipboard API is
// unavailable (insecure context, old webview), fall back to execCommand, then to a log.
export async function copyDecision(decision: Decision): Promise<void> {
  const json = JSON.stringify(decision, null, 2)
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(json)
      console.info('[variantkit] decision copied. Paste it to your agent to prune.')
      return
    }
    throw new Error('clipboard API unavailable')
  } catch {
    fallbackCopy(json)
  }
}

function fallbackCopy(json: string): void {
  if (typeof document === 'undefined') {
    console.warn('[variantkit] no clipboard + no DOM. Decision:\n' + json)
    return
  }
  const ta = document.createElement('textarea')
  ta.value = json
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.focus()
  ta.select()
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  document.body.removeChild(ta)
  if (ok) console.info('[variantkit] decision copied via fallback. Paste it to your agent.')
  else console.warn('[variantkit] could not copy automatically. Decision:\n' + json)
}
