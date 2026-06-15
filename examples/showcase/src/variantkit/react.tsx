// VariantKit React helper — one reusable component instead of hand-writing a studio per
// project. Folds N elements into ONE DialKit panel (a folder each), routes each element's
// finalize, and optionally focuses the folder of the element you hover (panel-side only —
// nothing is ever drawn over the project's UI).
//
//   import { Studio } from './variantkit/react'
//   <Studio elements={[
//     { name: 'Hero', keys: ['centered','split','minimal'],
//       controls: { headline: 'Ship faster', align: { type: 'select', options: ['left','center'], default: 'left' } },
//       render: (variant, v) => <Hero .../> },
//   ]} focusOnHover />
//
// `controls` is authored per element by whoever builds it — any controls DialKit supports
// (slider, select, toggle, color, text, spring, nested folders…), with defaults taken from
// the project's own design system. VariantKit only adds the variant select (when there are
// 2+ variants) and the finalize action.
//
// Requires <DialRoot/> mounted once in the app root (DialKit), plus dialkit/styles.css and
// (recommended) ./dialkit-clean.css.
import { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react'
import { motion, MotionConfig } from 'motion/react'
import { useDialKit, DialStore } from 'dialkit'
import { panelConfig, defaultsOf, regOf, flatDefaults, type PanelConfig } from './configs'
import { buildDecision, submitDecision, type ParamValue } from './buildDecision'

export interface ElementDef {
  /** Component name — becomes the folder title and the decision's component. */
  name: string
  /** Variant keys. A single key renders no variant dropdown — just the controls. */
  keys: string[]
  /**
   * The element's own controls — contextual, authored for THIS element (any DialKit control:
   * slider, select, boolean toggle, color, text, spring, nested folder groups…). VariantKit
   * adds `variant` + `finalize` around them; it never decides what these are.
   *
   * Pass a plain object for controls shared by every variant, OR a function of the active variant
   * to make the control set DEPEND on the variant — different takes often need different knobs (a
   * "split" hero has a media control a "minimal" one doesn't; a "vinyl" player has spin speed).
   * Switch the variant and the panel swaps its controls; shared keys keep their values.
   */
  controls?: PanelConfig | ((variant: string) => PanelConfig)
  /** Render the active variant from its resolved values. */
  render: (variant: string, values: Record<string, ParamValue>) => ReactNode
  /** Optional full config override (replaces the assembled variant+controls+finalize). */
  config?: PanelConfig
}

export interface StudioProps {
  elements: ElementDef[]
  /** Panel title. */
  name?: string
  /** Expand the panel folder of the element you hover (panel-side only; no overlay on the UI). */
  focusOnHover?: boolean
  /** Called after an element is finalized (decision already submitted/copied). */
  onFinalize?: (decision: ReturnType<typeof buildDecision>) => void
}

// Match DialKit's humanized folder title ("Pricing Card") back to an element name.
const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase()

function focusFolder(name: string | null) {
  if (!name) return
  // NEVER touch the root folder — clicking its header collapses the whole panel. Only the
  // per-element folders (the ones with a title) are toggled.
  document.querySelectorAll('.dialkit-folder:not(.dialkit-folder-root)').forEach((f) => {
    const title = f.querySelector('.dialkit-folder-title')?.textContent?.trim()
    if (!title) return
    const header = f.querySelector<HTMLElement>('.dialkit-folder-header')
    if (!header) return
    const expanded = !!f.querySelector('.dialkit-folder-content')
    const shouldExpand = norm(title) === norm(name)
    if (shouldExpand && !expanded) header.click()
    else if (!shouldExpand && expanded) header.click()
  })
}

export function Studio({ elements, name = 'VariantKit', focusOnHover, onFinalize }: StudioProps) {
  const [focused, setFocused] = useState<string | null>(null)
  const elsRef = useRef(elements)
  elsRef.current = elements

  const single = elements.length === 1

  // Each element's active variant — seeds the variant-specific control resolution below. Seeded
  // with the first key, then synced from the live panel after each render (see the effect). When
  // a variant changes, this updates → the config rebuilds → the panel swaps that variant's
  // controls. (Studio is remounted per element set, so this reseeds correctly.)
  const [variants, setVariants] = useState<Record<string, string>>(() =>
    Object.fromEntries(elements.map((e) => [e.name, e.keys[0]])),
  )

  // Resolve an element's controls for its active variant: a function `controls` is called with the
  // variant, a plain object is shared across all variants.
  const controlsOf = (e: ElementDef): PanelConfig => {
    const v = variants[e.name] ?? e.keys[0]
    return typeof e.controls === 'function' ? e.controls(v) : e.controls ?? {}
  }
  const cfgForE = (e: ElementDef): PanelConfig =>
    e.config ?? panelConfig(controlsOf(e), e.keys, { component: e.name })

  // Build the combined config. With ONE element, a per-element folder is pure redundancy —
  // the panel title already names it, so a "Button" folder under "Button Lab" just adds a
  // confusing second hierarchy level. So flatten: the lone element's controls sit at the panel
  // root. With 2+ elements, give each its own folder (first open, rest collapsed) — that's
  // where the grouping earns its keep. The finalize button's "✓ Copied" feedback is handled
  // inside copyDecision (panel-side), so the label stays a plain "Finalize <name>".
  const combined: Record<string, unknown> = {}
  if (single) {
    const e = elements[0]
    const base = cfgForE(e)
    Object.assign(combined, base, {
      finalize: { ...(base.finalize as object), label: `Finalize ${e.name}` },
    })
  } else {
    elements.forEach((e, i) => {
      const base = cfgForE(e)
      const finalize = { ...(base.finalize as object), label: `Finalize ${e.name}` }
      combined[e.name] = { ...base, finalize, _collapsed: i !== 0 }
    })
  }

  const all = useDialKit(name, combined as never, {
    onAction: (path: string) => {
      // Single element → its finalize lives at the root (path === 'finalize'), and its values
      // ARE `all`. Multiple → the element name prefixes the path and `all[name]` is its slice.
      const e = single ? elsRef.current[0] : elsRef.current.find((x) => x.name === path.split('.')[0])
      if (!e) return
      const slice = (single ? all : (all as Record<string, Record<string, ParamValue>>)[e.name]) as Record<
        string,
        ParamValue
      >
      const decision = buildDecision(e.name, slice, defaultsOf(cfgForE(e)), regOf(e.keys))
      // Dev transport first ("✓ Saved" -> .variantkit/decisions/), clipboard fallback ("✓ Copied").
      submitDecision(decision)
      onFinalize?.(decision)
    },
  }) as Record<string, Record<string, ParamValue>>

  // Keep `variants` in step with the live panel so variant-specific controls swap in when you
  // pick a different take. Runs after every commit; setVariants no-ops when nothing changed, so
  // it settles in one extra render and never loops.
  useEffect(() => {
    setVariants((prev) => {
      let changed = false
      const next = { ...prev }
      for (const e of elsRef.current) {
        if (e.keys.length < 2) continue
        const live = single
          ? (all as unknown as Record<string, ParamValue>).variant
          : (all as Record<string, Record<string, ParamValue>>)[e.name]?.variant
        if (live != null && String(live) !== prev[e.name]) {
          next[e.name] = String(live)
          changed = true
        }
      }
      return changed ? next : prev
    })
  })

  useEffect(() => {
    // Focus-on-hover only applies to the multi-element layout (it toggles per-element folders).
    // With a single flattened element there are no element folders to focus.
    if (focusOnHover && !single) focusFolder(focused)
  }, [focused, focusOnHover, single])

  // Shuffle (randomize every knob — and the take) + Reset (back to defaults), in the header.
  usePanelActions(name, combined as PanelConfig)

  // Render the elements as-is — VariantKit adds no layout, spacing, alignment, rings, or
  // badges around the project's UI. The host page owns presentation entirely.
  return (
    <MotionConfig reducedMotion="user">
      {elements.map((e) => {
        const slice = single ? (all as unknown as Record<string, ParamValue>) : all[e.name]
        if (!slice) return null
        const variant = e.keys.length > 1 ? String(slice.variant) : e.keys[0]
        return (
          <section
            key={e.name}
            className="vk-section"
            onMouseEnter={focusOnHover ? () => setFocused(e.name) : undefined}
            style={{ display: 'contents' }}
          >
            {/* Variant switch is frequent → keep the settle tiny and fast. (This div is the
                only wrapper box VariantKit adds; it carries zero styling of its own.) */}
            <motion.div
              key={variant}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            >
              {e.render(variant, slice) as ReactElement}
            </motion.div>
          </section>
        )
      })}
    </MotionConfig>
  )
}

// ── Panel theme toggle ──────────────────────────────────────────────────────────────────
// DialKit ships light only; this manages the panel's light/dark theme AND injects a small
// sun/moon toggle into the panel header (DialKit has no slot for it, so we append one).
// Requires dialkit-dark.css imported. Returns { theme, setTheme } if you also want a custom UI.

const MOON =
  '<svg class="vk-swap" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
const SUN =
  '<svg class="vk-swap" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'

export function useDialkitTheme(initial: 'light' | 'dark' = 'light') {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const s = localStorage.getItem('vk-theme')
      if (s === 'light' || s === 'dark') return s
    } catch {
      /* no storage */
    }
    return initial
  })
  const themeRef = useRef(theme)
  themeRef.current = theme

  useEffect(() => {
    const flip = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

    // The actual DOM work. Guarded two ways so it can NEVER cause a runaway observer loop:
    // (1) it only writes when something actually differs, (2) the observer is paused around
    // these writes (see below) so our own mutations don't retrigger it.
    const sync = () => {
      document.querySelectorAll('.dialkit-root').forEach((el) => {
        if (el.getAttribute('data-theme') !== themeRef.current) el.setAttribute('data-theme', themeRef.current)
      })
      document.querySelectorAll<HTMLElement>('.dialkit-panel-header').forEach((hdr) => {
        // Theme is PANEL chrome, so it lives in the header on the right (CSS pins it just left of
        // the collapse icon) — deliberately apart from the element actions (shuffle/reset, left).
        const titleRow = hdr.querySelector<HTMLElement>('.dialkit-folder-header-top') ?? hdr
        // Keep exactly one toggle (hot-reload can leave a stale node behind).
        const existing = titleRow.querySelectorAll<HTMLButtonElement>('.vk-theme-toggle')
        for (let i = 1; i < existing.length; i++) existing[i].remove()
        let btn = existing[0] ?? null
        if (!btn) {
          btn = document.createElement('button')
          btn.className = 'vk-theme-toggle'
          btn.type = 'button'
          btn.setAttribute('aria-label', 'Toggle panel theme')
          const stop = (e: Event) => e.stopPropagation()
          btn.addEventListener('pointerdown', stop)
          btn.addEventListener('mousedown', stop)
          btn.addEventListener('click', (e) => {
            e.stopPropagation()
            flip()
          })
          titleRow.appendChild(btn)
        }
        if (btn.dataset.vkTheme !== themeRef.current) {
          btn.dataset.vkTheme = themeRef.current
          btn.innerHTML = themeRef.current === 'dark' ? SUN : MOON // fresh <svg class="vk-swap"> animates in
        }
      })
    }

    // Coalesce mutation bursts into one sync per frame. sync() is idempotent (it only writes when
    // a value actually differs and only appends the toggle when it's missing), so we stay
    // connected rather than disconnecting around our own writes — the same reason as the action
    // cluster: disconnecting opened a window where the panel-swap mutation landed unobserved and
    // the toggle never got (re)appended into the freshly-built cluster.
    let frame = 0
    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        sync()
      })
    }
    const mo = new MutationObserver(schedule)

    // Delightful theme switch: add `.vk-theming` so the panel cross-fades its colors (the
    // class scopes a transition that only exists during the switch — see motion.css), then
    // flip the value via sync(). First mount sets the same value, so nothing animates.
    const panels = document.querySelectorAll('.dialkit-root')
    panels.forEach((p) => p.classList.add('vk-theming'))
    sync()
    schedule() // catch the action cluster if it commits a frame after this effect
    const settle = setTimeout(() => panels.forEach((p) => p.classList.remove('vk-theming')), 420)
    mo.observe(document.body, { childList: true, subtree: true })
    try {
      localStorage.setItem('vk-theme', theme)
    } catch {
      /* no storage */
    }
    return () => {
      if (frame) cancelAnimationFrame(frame)
      clearTimeout(settle)
      mo.disconnect()
    }
  }, [theme])

  return { theme, setTheme }
}

// ── Element actions: Shuffle + Reset ──────────────────────────────────────────────────────
// Two icon buttons injected right after the element name in the header title row — they act on
// the ELEMENT (randomize / restore its controls), so they read as the element's own controls
// (panel chrome — theme + collapse — stays on the far right). They drive the live panel through
// DialKit's store, so every control and the variant pills update in place, as if you'd dragged
// them.
//   Shuffle → a fresh random valid value for every slider/select/toggle (and the variant), so
//             "surprise me" lands a whole new combination. Color/text/spring are left alone —
//             random hex or copy is noise, not exploration.
//   Reset   → every control (incl. the variant) back to its authored default.

const SHUFFLE =
  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>'
const RESET =
  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>'

// A DialKit control's metadata (the shape we read from the live store). Loosely typed — we only
// touch the fields we need and ignore the rest of DialKit's union.
interface ControlMeta {
  type: string
  path: string
  min?: number
  max?: number
  step?: number
  options?: (string | { value: string; label: string })[]
  children?: ControlMeta[]
}

// A random *valid* value for a single control, or undefined to leave it untouched. Sliders snap
// to their step; selects/variant pick an option; toggles flip a coin. Anything else is skipped.
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

function usePanelActions(panelName: string, config: PanelConfig) {
  const cfgRef = useRef(config)
  cfgRef.current = config

  useEffect(() => {
    const panelId = () => DialStore.getPanels().find((p) => p.name === panelName)?.id

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
      const panel = DialStore.getPanel(id)
      if (!panel) return
      const walk = (controls: ControlMeta[]) => {
        for (const c of controls) {
          if (c.children?.length) walk(c.children)
          const v = randomValue(c)
          if (v !== undefined) DialStore.updateValue(id, c.path, v as never)
        }
      }
      walk(panel.controls as unknown as ControlMeta[])
    }

    // Build an icon button once; the spin/pop feedback comes from a data attribute the CSS keys
    // off. `label` is the accessible/tooltip description (the button itself is icon-only).
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
      // Ensure the panel header's title row (the element name, only present when expanded) carries
      // exactly one shuffle/reset pair, appended after the title — robust against React re-renders.
      // Then sweep any orphaned pairs (panel collapsed, element swapped, hot-reload).
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

    // Frame-coalesced sync on any DOM change. sync() is idempotent — it injects the cluster only
    // when it's missing and bails when it's already there — so we DON'T disconnect the observer
    // around our own writes: our injection fires one more (no-op) sync and then goes quiet. The
    // old disconnect/reconnect dance opened a window where the panel-swap mutation (on project
    // switch) landed unobserved, leaving the cluster un-injected. Staying connected closes it.
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
    schedule() // catch panel DOM that commits the frame after mount
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      mo.disconnect()
      document.querySelectorAll('.vk-actions').forEach((el) => el.remove())
    }
  }, [panelName])
}
