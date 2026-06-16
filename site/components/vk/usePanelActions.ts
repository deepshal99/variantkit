'use client'
// Ported verbatim from variantkit/react.tsx — injects the Shuffle + Reset icon buttons into the
// DialKit panel header (right after the element name), exactly as the shipped VariantKit panel
// does. Shuffle randomizes every slider/select/toggle (and the variant); Reset restores authored
// defaults. Both drive the live panel through DialKit's store, so controls update in place.
import { useEffect, useRef } from 'react'
import { DialStore } from 'dialkit'

type PanelConfig = Record<string, unknown>

const SHUFFLE =
  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>'
const RESET =
  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>'

interface ControlMeta {
  type: string
  path: string
  min?: number
  max?: number
  step?: number
  options?: (string | { value: string; label: string })[]
  children?: ControlMeta[]
}

// A random *valid* value for a single control, or undefined to leave it untouched.
function randomValue(meta: ControlMeta): number | string | boolean | undefined {
  if (meta.type === 'slider') {
    const min = meta.min ?? 0
    const max = meta.max ?? 1
    const step = meta.step ?? (Number.isInteger(min) && Number.isInteger(max) ? 1 : (max - min) / 100 || 1)
    const steps = Math.max(1, Math.round((max - min) / step))
    return +(min + Math.floor(Math.random() * (steps + 1)) * step).toFixed(4)
  }
  if (meta.type === 'toggle') return Math.random() < 0.5
  if (meta.type === 'select') {
    const opts = (meta.options ?? []).map((o) => (typeof o === 'string' ? o : o.value))
    return opts.length ? opts[Math.floor(Math.random() * opts.length)] : undefined
  }
  return undefined // color / text / spring / transition / action / folder — left as-is
}

// Flatten a (possibly nested) config into the path→default map DialKit addresses values by.
function flatDefaults(cfg: PanelConfig, prefix = ''): Record<string, number | string | boolean> {
  const out: Record<string, number | string | boolean> = {}
  for (const [key, c] of Object.entries(cfg)) {
    if (key.startsWith('_') || c == null) continue
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof c === 'number' || typeof c === 'string' || typeof c === 'boolean') {
      out[path] = c
    } else if (Array.isArray(c)) {
      out[path] = c[0] as number
    } else if (typeof c === 'object') {
      const o = c as { type?: string; default?: unknown }
      if (o.type === 'action') continue
      if (o.type) {
        if (o.default !== undefined) out[path] = o.default as number | string | boolean
      } else {
        Object.assign(out, flatDefaults(c as PanelConfig, path))
      }
    }
  }
  return out
}

export function usePanelActions(panelName: string, config: PanelConfig) {
  const cfgRef = useRef(config)
  cfgRef.current = config

  useEffect(() => {
    const panelId = () =>
      (DialStore.getPanels() as Array<{ id: string; name: string }>).find((p) => p.name === panelName)?.id

    const reset = () => {
      const id = panelId()
      if (!id) return
      for (const [path, value] of Object.entries(flatDefaults(cfgRef.current))) {
        DialStore.updateValue(id, path, value as never)
      }
    }

    const shuffle = () => {
      const id = panelId()
      if (!id) return
      const panel = DialStore.getPanel(id) as { controls: ControlMeta[] } | undefined
      if (!panel) return
      const walk = (controls: ControlMeta[]) => {
        for (const c of controls) {
          if (c.children?.length) walk(c.children)
          const v = randomValue(c)
          if (v !== undefined) DialStore.updateValue(id, c.path, v as never)
        }
      }
      walk(panel.controls)
    }

    const make = (cls: string, label: string, svg: string, onClick: () => void, flash: string) => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = `vk-action-btn ${cls}`
      btn.setAttribute('aria-label', label)
      btn.title = label
      btn.innerHTML = svg
      const stop = (e: Event) => e.stopPropagation()
      btn.addEventListener('pointerdown', stop)
      btn.addEventListener('mousedown', stop)
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        onClick()
        btn.setAttribute(flash, '')
        setTimeout(() => btn.removeAttribute(flash), 480)
      })
      return btn
    }

    const sync = () => {
      const valid = new Set<Element>()
      document.querySelectorAll<HTMLElement>('.dialkit-panel-header .dialkit-folder-title-row').forEach((row) => {
        let bar = row.querySelector<HTMLElement>(':scope > .vk-actions')
        if (!bar) {
          bar = document.createElement('div')
          bar.className = 'vk-actions'
          bar.appendChild(make('vk-shuffle', 'Shuffle all controls', SHUFFLE, shuffle, 'data-shuffling'))
          bar.appendChild(make('vk-reset', 'Reset to defaults', RESET, reset, 'data-spinning'))
          row.appendChild(bar)
        }
        valid.add(bar)
      })
      document.querySelectorAll('.vk-actions').forEach((b) => {
        if (!valid.has(b)) b.remove()
      })
    }

    let frame = 0
    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        sync()
      })
    }
    const mo = new MutationObserver(schedule)
    sync()
    schedule()
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      mo.disconnect()
      document.querySelectorAll('.vk-actions').forEach((el) => el.remove())
    }
  }, [panelName])
}
