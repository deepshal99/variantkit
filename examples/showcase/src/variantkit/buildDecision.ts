// VariantKit core — pure, no React imports. Builds the finalize decision (winner +
// override diff + prune list) and ships it to your agent so it can prune the variant
// set down to the winner. See AGENT.md for the contract.
//
//   live values (nested folders ok) + defaults
//            │
//            ▼
//   buildDecision ── finalized (winner key)
//                ├── values (dot-path flattened final params to inline)
//                ├── overridesFromDefault (only-changed; the taste signal)
//                └── prune (every registry key except the winner)
//
// Decision schema 2: values/overrides are dot-path flattened ("surface.radius": 12)
// so folder-grouped configurations produce flat, inlineable decisions.

export type ParamValue = number | string | boolean

// A control-output object (spring, easing) — carries a string `type` and is treated
// as a single leaf value. Plain objects WITHOUT `type` are folders and get flattened.
export interface ControlObject {
  type: string
  [key: string]: unknown
}

export type LeafValue = ParamValue | ControlObject
// Loose on purpose: accepts both resolved DialKit values and raw config objects
// (defaultsFromConfig walks configs, which contain slider tuples, selects, actions).
export type NestedValues = Record<string, unknown>

export interface Override {
  from: LeafValue
  to: LeafValue
}

export interface Decision {
  schema: 2
  component: string
  finalized: string
  values: Record<string, LeafValue>
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

function isControlObject(v: unknown): v is ControlObject {
  return typeof v === 'object' && v !== null && !Array.isArray(v) && typeof (v as ControlObject).type === 'string'
}

function isFolder(v: unknown): v is NestedValues {
  return typeof v === 'object' && v !== null && !Array.isArray(v) && !isControlObject(v)
}

// Equality that treats #FFF and #ffffff as the same color. Control objects (spring,
// easing) compare on the keys present in `a` (the default) so library-filled extras
// in the live value don't read as user overrides. Everything else strict.
export function valuesEqual(a: LeafValue, b: LeafValue): boolean {
  if (typeof a === 'string' && typeof b === 'string' && HEX.test(a) && HEX.test(b)) {
    return normalizeHex(a) === normalizeHex(b)
  }
  if (isControlObject(a) && isControlObject(b)) {
    for (const k of Object.keys(a)) {
      if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) return false
    }
    return true
  }
  return a === b
}

// Flatten nested folder values to dot-paths. Skips reserved keys (variant/finalize at
// any depth — folder-per-element configs nest them), config-only keys (_collapsed),
// and DialKit internals (__mode).
export function flattenValues(nested: NestedValues, prefix = ''): Record<string, LeafValue> {
  const out: Record<string, LeafValue> = {}
  for (const k of Object.keys(nested)) {
    if (k.startsWith('_')) continue
    if (k.endsWith('__mode')) continue
    if (RESERVED.has(k)) continue
    const v = nested[k]
    if (v === undefined) continue
    const path = prefix ? `${prefix}.${k}` : k
    if (isFolder(v)) {
      Object.assign(out, flattenValues(v as NestedValues, path))
    } else {
      out[path] = v as LeafValue
    }
  }
  return out
}

// Derive the frozen defaults from a DialKit config object — the reference the
// override diff is measured against. Walks folders; one default per control:
//   number/string/boolean -> itself      [def, min, max, step?] -> def
//   select -> default ?? first option    color/text -> default
//   spring/easing -> the config object   action -> skipped (no value)
export function defaultsFromConfig(config: NestedValues): NestedValues {
  const out: NestedValues = {}
  for (const k of Object.keys(config)) {
    if (k.startsWith('_')) continue
    if (RESERVED.has(k)) continue
    const v = config[k]
    if (v === undefined) continue
    if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') {
      out[k] = v
    } else if (Array.isArray(v)) {
      out[k] = v[0] as ParamValue
    } else if (isControlObject(v)) {
      if (v.type === 'action') continue
      if (v.type === 'select') {
        const opts = (v as { options?: unknown[] }).options ?? []
        const first = opts[0]
        const firstValue = typeof first === 'object' && first !== null ? (first as { value: string }).value : (first as string)
        out[k] = ((v as { default?: string }).default ?? firstValue) as ParamValue
      } else if (v.type === 'color' || v.type === 'text') {
        out[k] = ((v as { default?: string }).default ?? '') as ParamValue
      } else {
        out[k] = v // spring / easing / unknown control: the object IS the default
      }
    } else if (isFolder(v)) {
      out[k] = defaultsFromConfig(v as NestedValues)
    }
  }
  return out
}

export function buildDecision(
  component: string,
  liveValues: NestedValues,
  defaults: NestedValues,
  registry: Record<string, unknown>,
  opts?: { now?: string; note?: string },
): Decision {
  // No `variant` in the live values means a single-variant set (no dropdown was rendered):
  // the winner is the registry's only key.
  const finalized = liveValues.variant !== undefined ? String(liveValues.variant) : (Object.keys(registry)[0] ?? '')

  const values = flattenValues(liveValues)
  const flatDefaults = flattenValues(defaults)

  const overridesFromDefault: Record<string, Override> = {}
  for (const k of Object.keys(values)) {
    if (!(k in flatDefaults)) continue
    if (!valuesEqual(flatDefaults[k], values[k])) {
      overridesFromDefault[k] = { from: flatDefaults[k], to: values[k] }
    }
  }

  const prune = Object.keys(registry).filter((k) => k !== finalized)

  return {
    schema: 2,
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

// Briefly morph the element's Finalize button (e.g. to "✓ Copied"), in the PANEL only —
// never an overlay on the app UI. Runs from copyDecision/submitDecision so EVERY finalize
// gets feedback, however it was wired. DialKit renders an action as
// `<button class="dialkit-button">Finalize X</button>` and does not re-render on an action
// (no value changed), so a direct text swap sticks until we revert it.
function flashFinalized(component: string, text: string): void {
  if (typeof document === 'undefined') return
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.dialkit-root .dialkit-button'))
  // Prefer the exact "Finalize <component>" button; fall back to the sole action button.
  let btn = buttons.find((b) => b.textContent?.trim() === `Finalize ${component}`)
  if (!btn && buttons.length === 1) btn = buttons[0]
  if (!btn || btn.dataset.vkFlashing) return
  const original = btn.textContent ?? ''
  btn.dataset.vkFlashing = '1'
  btn.textContent = text
  setTimeout(() => {
    if (btn!.dataset.vkFlashing) {
      btn!.textContent = original
      delete btn!.dataset.vkFlashing
    }
  }, 1500)
}

// Ship the decision to the dev server (vite plugin / Next route) so it lands in
// .variantkit/decisions/ and the agent can apply it with zero copy-paste. Falls back to
// the clipboard when no transport is running. NEVER fails silently.
const TRANSPORT_ENDPOINTS = ['/__variantkit/decision', '/api/__variantkit/decision']

export async function submitDecision(decision: Decision): Promise<void> {
  if (typeof fetch !== 'undefined') {
    for (const endpoint of TRANSPORT_ENDPOINTS) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(decision),
        })
        if (res.ok) {
          flashFinalized(decision.component, '✓  Saved')
          console.info(`[variantkit] decision saved to .variantkit/decisions/${decision.component}.json — tell your agent: "apply decision".`)
          return
        }
      } catch {
        // endpoint not running — try the next, then the clipboard
      }
    }
  }
  await copyDecision(decision)
}

// Copy the decision JSON to the clipboard. NEVER fail silently: if the Clipboard API is
// unavailable (insecure context, old webview), fall back to execCommand, then to a log.
// Also flashes the Finalize button to "✓ Copied" (panel-side feedback, no toast/overlay).
export async function copyDecision(decision: Decision): Promise<void> {
  flashFinalized(decision.component, '✓  Copied')
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
