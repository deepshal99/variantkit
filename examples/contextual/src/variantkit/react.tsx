// VariantKit React helper — one reusable component instead of hand-writing a studio per
// project. Folds N elements into ONE DialKit panel (a folder each), routes each element's
// finalize, and optionally focuses the folder of the element you hover.
//
//   import { Studio } from './variantkit/react'
//   <Studio elements={[
//     { name: 'Hero', type: 'hero', keys: ['centered','split','minimal'], render: (variant, v) => <Hero .../> },
//   ]} focusOnHover />
//
// Requires <DialRoot/> mounted once in the app root (DialKit), plus dialkit/styles.css and
// (recommended) ./dialkit-clean.css.
import { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'motion/react'
import { useDialKit } from 'dialkit'
import { panelConfig, defaultsOf, regOf } from './configs'
import { buildDecision, copyDecision, type ParamValue } from './buildDecision'

export interface ElementDef {
  /** Component name — becomes the folder title and the decision's component. */
  name: string
  /** Contextual preset key (card, button, hero, badge, input, table, …) or 'generic'. */
  type: string
  /** Variant keys for this element. */
  keys: string[]
  /** Render the active variant from its resolved values. */
  render: (variant: string, values: Record<string, ParamValue>) => ReactNode
  /** Optional explicit config override (skip the preset). */
  config?: Record<string, unknown>
}

export interface StudioProps {
  elements: ElementDef[]
  /** Panel title. */
  name?: string
  /** Expand the folder of the element you hover; ring the focused element. */
  focusOnHover?: boolean
  /** Called after an element is finalized (decision already copied to clipboard). */
  onFinalize?: (decision: ReturnType<typeof buildDecision>) => void
}

const cfgFor = (e: ElementDef): Record<string, unknown> =>
  (e.config ?? panelConfig(e.type, e.keys, { component: e.name })) as Record<string, unknown>

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
  // Per-element "just finalized" flag — flips the finalize button's label to a check, then
  // reverts. In-button feedback (emil-design-eng "morphing feedback button"), not a toast.
  const [done, setDone] = useState<Record<string, boolean>>({})
  const elsRef = useRef(elements)
  elsRef.current = elements
  const doneTimer = useRef<ReturnType<typeof setTimeout>>()

  // One combined config: a folder per element, first open and the rest collapsed. The active
  // element's finalize label morphs to "✓ Copied" for ~1.5s after finalizing.
  const combined: Record<string, unknown> = {}
  elements.forEach((e, i) => {
    const base = cfgFor(e)
    const finalize = { ...(base.finalize as object), label: done[e.name] ? '✓  Copied' : `Finalize ${e.name}` }
    combined[e.name] = { ...base, finalize, _collapsed: i !== 0 }
  })

  const all = useDialKit(name, combined as never, {
    onAction: (path: string) => {
      const elName = path.split('.')[0]
      const e = elsRef.current.find((x) => x.name === elName)
      if (!e) return
      const slice = (all as Record<string, Record<string, ParamValue>>)[elName]
      const decision = buildDecision(elName, slice, defaultsOf(cfgFor(e)), regOf(e.keys))
      copyDecision(decision)
      onFinalize?.(decision)
      setDone((d) => ({ ...d, [elName]: true }))
      clearTimeout(doneTimer.current)
      doneTimer.current = setTimeout(() => setDone((d) => ({ ...d, [elName]: false })), 1600)
    },
  }) as Record<string, Record<string, ParamValue>>

  useEffect(() => {
    if (focusOnHover) focusFolder(focused)
  }, [focused, focusOnHover])

  return (
    <MotionConfig reducedMotion="user">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 56, alignItems: 'center' }}>
      {elements.map((e, i) => {
        const slice = all[e.name]
        if (!slice) return null
        const ring = focusOnHover && focused === e.name
        const variant = String(slice.variant)
        return (
          <section
            key={e.name}
            className="vk-section"
            onMouseEnter={focusOnHover ? () => setFocused(e.name) : undefined}
            style={{
              // @ts-expect-error CSS custom property for stagger index
              '--vk-i': i,
              position: 'relative',
              textAlign: 'center',
              borderRadius: 18,
              // Soft glow on focus (frequent action → subtle, no bounce).
              boxShadow: ring ? '0 0 0 2px rgba(31,94,84,.45), 0 10px 40px rgba(31,94,84,.12)' : '0 0 0 0 transparent',
              transition: 'box-shadow 220ms cubic-bezier(0.23,1,0.32,1)',
            }}
          >
            {/* Variant switch is frequent → keep the settle tiny and fast. */}
            <motion.div
              key={variant}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            >
              {e.render(variant, slice) as ReactElement}
            </motion.div>

            {/* Finalize is occasional → it earns a springy check badge. */}
            <AnimatePresence>
              {done[e.name] && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ type: 'spring', visualDuration: 0.42, bounce: 0.5 }}
                  style={{
                    position: 'absolute',
                    top: -14,
                    right: -14,
                    width: 38,
                    height: 38,
                    borderRadius: 999,
                    background: '#1F5E54',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: '0 8px 22px rgba(31,94,84,.4)',
                    zIndex: 5,
                  }}
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                    <motion.path
                      d="M4 12.5l5 5L20 6.5"
                      stroke="#fff"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.1, duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                    />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )
      })}
    </div>
    </MotionConfig>
  )
}

// ── Panel theme toggle ──────────────────────────────────────────────────────────────────
// DialKit ships light only; this manages the panel's light/dark theme AND injects a small
// sun/moon toggle into the panel header (DialKit has no slot for it, so we append one).
// Requires dialkit-dark.css imported. Returns { theme, setTheme } if you also want a custom UI.

const MOON =
  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
const SUN =
  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'

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

    const sync = () => {
      document.querySelectorAll('.dialkit-root').forEach((el) => el.setAttribute('data-theme', themeRef.current))
      // inject (once) a theme toggle into each panel header, then keep its icon in sync
      document.querySelectorAll<HTMLElement>('.dialkit-panel-header').forEach((hdr) => {
        let btn = hdr.querySelector<HTMLButtonElement>('.vk-theme-toggle')
        if (!btn) {
          btn = document.createElement('button')
          btn.className = 'vk-theme-toggle'
          btn.type = 'button'
          btn.setAttribute('aria-label', 'Toggle panel theme')
          Object.assign(btn.style, {
            marginLeft: '6px',
            width: '26px',
            height: '26px',
            display: 'inline-grid',
            placeItems: 'center',
            border: 'none',
            background: 'transparent',
            borderRadius: '7px',
            cursor: 'pointer',
            color: 'var(--dial-text-secondary)',
            flex: '0 0 auto',
          } satisfies Partial<CSSStyleDeclaration>)
          const stop = (e: Event) => e.stopPropagation()
          btn.addEventListener('pointerdown', stop)
          btn.addEventListener('mousedown', stop)
          btn.addEventListener('click', (e) => {
            e.stopPropagation()
            flip()
          })
          hdr.appendChild(btn)
        }
        btn.innerHTML = themeRef.current === 'dark' ? SUN : MOON
      })
    }

    sync()
    try {
      localStorage.setItem('vk-theme', theme)
    } catch {
      /* no storage */
    }
    const mo = new MutationObserver(sync)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => mo.disconnect()
  }, [theme])

  return { theme, setTheme }
}
