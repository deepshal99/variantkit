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
