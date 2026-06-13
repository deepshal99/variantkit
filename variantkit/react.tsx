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
import { useDialKit } from 'dialkit'
import { panelConfig, defaultsOf, regOf, type PanelConfig } from './configs'
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
   */
  controls?: PanelConfig
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

const cfgFor = (e: ElementDef): PanelConfig =>
  e.config ?? panelConfig(e.controls ?? {}, e.keys, { component: e.name })

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

  // Build the combined config. With ONE element, a per-element folder is pure redundancy —
  // the panel title already names it, so a "Button" folder under "Button Lab" just adds a
  // confusing second hierarchy level. So flatten: the lone element's controls sit at the panel
  // root. With 2+ elements, give each its own folder (first open, rest collapsed) — that's
  // where the grouping earns its keep. The finalize button's "✓ Copied" feedback is handled
  // inside copyDecision (panel-side), so the label stays a plain "Finalize <name>".
  const single = elements.length === 1
  const combined: Record<string, unknown> = {}
  if (single) {
    const e = elements[0]
    const base = cfgFor(e)
    Object.assign(combined, base, {
      finalize: { ...(base.finalize as object), label: `Finalize ${e.name}` },
    })
  } else {
    elements.forEach((e, i) => {
      const base = cfgFor(e)
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
      const decision = buildDecision(e.name, slice, defaultsOf(cfgFor(e)), regOf(e.keys))
      // Dev transport first ("✓ Saved" -> .variantkit/decisions/), clipboard fallback ("✓ Copied").
      submitDecision(decision)
      onFinalize?.(decision)
    },
  }) as Record<string, Record<string, ParamValue>>

  useEffect(() => {
    // Focus-on-hover only applies to the multi-element layout (it toggles per-element folders).
    // With a single flattened element there are no element folders to focus.
    if (focusOnHover && !single) focusFolder(focused)
  }, [focused, focusOnHover, single])

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
        const titleRow = hdr.querySelector<HTMLElement>('.dialkit-folder-header-top') ?? hdr
        // Keep exactly one toggle (hot-reload can leave a stale node behind).
        const existing = titleRow.querySelectorAll<HTMLButtonElement>('.vk-theme-toggle')
        for (let i = 1; i < existing.length; i++) existing[i].remove()
        let btn = existing[0] ?? null
        if (!btn) {
          btn = document.createElement('button')
          // Absolute, just left of DialKit's settings icon (which is absolute at right:12).
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

    // Coalesce mutation bursts into one sync per frame, and pause the observer while WE write,
    // so our own DOM changes can't re-trigger it. Belt and suspenders against the freeze.
    let frame = 0
    const mo = new MutationObserver(() => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        mo.disconnect()
        sync()
        mo.observe(document.body, { childList: true, subtree: true })
      })
    })

    // Delightful theme switch: add `.vk-theming` so the panel cross-fades its colors (the
    // class scopes a transition that only exists during the switch — see motion.css), then
    // flip the value via sync(). First mount sets the same value, so nothing animates.
    const panels = document.querySelectorAll('.dialkit-root')
    panels.forEach((p) => p.classList.add('vk-theming'))
    sync()
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
