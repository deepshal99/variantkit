import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Studio, useDialkitTheme } from './variantkit/react'
import { PROJECTS } from './projects'

// One URL, many "projects". The switcher swaps both the staged element AND the VariantKit panel:
// each project mounts its own <Studio> (keyed by id), so DialKit re-registers a fresh panel — its
// own title, its own contextual controls, its own variant pills — while the panel chrome (theme
// toggle, shuffle, reset, brand mark) persists across all of them.
export default function App() {
  const [active, setActive] = useState(0)
  const project = PROJECTS[active]

  // The VariantKit panel's own light/dark theme (independent of each project's canvas). Mounted
  // once here so it survives project switches.
  useDialkitTheme('light')

  // 1–5 jump straight to a project.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const n = Number(e.key)
      if (n >= 1 && n <= PROJECTS.length) setActive(n - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="shell" style={{ background: project.bg }}>
      <div className={`switcher${project.darkChrome ? ' dark' : ''}`}>
        <div className="switcher-brand">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden>
            <rect x="2.2" y="4.4" width="5.2" height="7.2" rx="1.7" fill="currentColor" />
            <rect x="8.6" y="4.4" width="5.2" height="7.2" rx="1.7" fill="none" stroke="currentColor" strokeWidth="1.3" opacity="0.5" />
          </svg>
          VariantKit
        </div>

        <div className="switcher-tabs" role="tablist">
          {PROJECTS.map((p, i) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={i === active}
              className="switcher-tab"
              data-active={i === active}
              onClick={() => setActive(i)}
            >
              {i === active && <motion.span layoutId="switcher-pill" className="switcher-pill" transition={{ type: 'spring', stiffness: 480, damping: 38 }} />}
              {p.label}
            </button>
          ))}
        </div>

        <div className="switcher-hint">
          Press <kbd>1</kbd>–<kbd>{PROJECTS.length}</kbd> to switch
        </div>
      </div>

      <div className="stage">
        <div className="stage-meta">
          <h2 style={{ color: project.darkChrome ? '#e2e8f0' : '#0a0a0a' }}>{project.label}</h2>
          <p style={{ color: project.darkChrome ? 'rgba(226,232,240,0.6)' : 'rgba(10,10,10,0.5)' }}>{project.blurb}</p>
        </div>

        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 14, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.42, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Re-key Studio per project so DialKit mounts a fresh panel for that element. */}
          <Studio key={project.id} name={project.element.name} elements={[project.element]} />
        </motion.div>
      </div>
    </div>
  )
}
