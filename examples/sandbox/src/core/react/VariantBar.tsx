'use client'
// VariantBar — VariantKit's own chrome: a slim bottom-center bar with variant tabs,
// compare toggle, and Finalize. Mount once next to <DialRoot/>. Dev-only (hidden in
// production builds).
//
// Zero wiring: it discovers variant sets straight from DialKit's documented store —
// a `variant` select paired with a `finalize` action, either at a panel's top level
// (the classic shell) or inside a folder (the Studio's one-folder-per-element layout).
// Tabs drive DialStore.updateValue; Finalize fires the shell's own finalize action via
// DialStore.triggerAction, so the decision path is identical to clicking it in the panel.
//
// Keys: 1..9 switch variants of the active set (ignored while typing).

import { useEffect, useReducer, useState, type CSSProperties } from 'react'
import { DialStore } from 'dialkit'
import { vkStore, IS_PROD } from './vkStore'

type Option = { value: string; label: string }

interface VariantSet {
  panelId: string
  name: string
  options: Option[]
  active: string
  variantPath: string
  finalizePath: string
}

type ControlNode = {
  type: string
  path: string
  label: string
  children?: ControlNode[]
  options?: (string | { value: string; label: string })[]
}

function setFrom(panelId: string, name: string, scope: ControlNode[], prefix: string, values: Record<string, unknown>): VariantSet | null {
  const variantPath = prefix ? `${prefix}.variant` : 'variant'
  const finalizePath = prefix ? `${prefix}.finalize` : 'finalize'
  const variant = scope.find((c) => c.path === variantPath && c.type === 'select')
  const finalize = scope.find((c) => c.path === finalizePath && c.type === 'action')
  if (!variant || !finalize || !variant.options) return null
  const options = variant.options.map((o) =>
    typeof o === 'string' ? { value: o, label: o } : { value: o.value, label: o.label },
  )
  return { panelId, name, options, active: String(values[variantPath] ?? ''), variantPath, finalizePath }
}

function findVariantSets(): VariantSet[] {
  const sets: VariantSet[] = []
  for (const panel of DialStore.getPanels()) {
    const controls = panel.controls as unknown as ControlNode[]
    const root = setFrom(panel.id, panel.name, controls, '', panel.values)
    if (root) sets.push(root)
    // Studio layout: one folder per element, each with its own variant+finalize.
    for (const c of controls) {
      if (c.type !== 'folder' || !c.children) continue
      const folder = setFrom(panel.id, c.label, c.children, c.path, panel.values)
      if (folder) sets.push(folder)
    }
  }
  return sets
}

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
}

const font = "system-ui, -apple-system, 'Segoe UI', sans-serif"

const barStyle: CSSProperties = {
  position: 'fixed',
  bottom: 16,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 99998,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: 4,
  borderRadius: 12,
  background: 'rgba(20, 20, 22, 0.92)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  boxShadow: '0 12px 32px rgba(0,0,0,0.32), 0 0 0 1px rgba(255,255,255,0.08)',
  fontFamily: font,
  fontSize: 12,
  fontVariantNumeric: 'tabular-nums',
  WebkitFontSmoothing: 'antialiased',
  color: '#d4d4d8',
  userSelect: 'none',
}

const tabStyle = (active: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 10px',
  borderRadius: 8, // concentric: bar 12 - padding 4
  border: 'none',
  cursor: 'pointer',
  fontFamily: font,
  fontSize: 12,
  fontWeight: 500,
  lineHeight: 1,
  background: active ? 'rgba(255,255,255,0.14)' : 'transparent',
  color: active ? '#fafafa' : '#a1a1aa',
  transition: 'background-color 0.15s ease, color 0.15s ease',
})

const keyHintStyle: CSSProperties = {
  fontSize: 10,
  opacity: 0.55,
  fontVariantNumeric: 'tabular-nums',
}

const dividerStyle: CSSProperties = {
  width: 1,
  height: 16,
  background: 'rgba(255,255,255,0.12)',
  margin: '0 2px',
}

export function VariantBar() {
  const [, force] = useReducer((c: number) => c + 1, 0)
  const [setIndex, setSetIndex] = useState(0)

  // Re-render on panel add/remove and on value changes of every variant panel.
  useEffect(() => DialStore.subscribeGlobal(force), [])
  const sets = findVariantSets()
  const panelKey = sets.map((s) => s.panelId + ':' + s.variantPath).join('|')
  useEffect(() => {
    const ids = Array.from(new Set(sets.map((s) => s.panelId)))
    const unsubs = ids.map((id) => DialStore.subscribe(id, force))
    return () => unsubs.forEach((u) => u())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelKey])

  const current = sets[Math.min(setIndex, Math.max(sets.length - 1, 0))]

  // Keyboard: 1..9 switch variants of the active set.
  useEffect(() => {
    if (!current) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return
      const n = Number(e.key)
      if (!Number.isInteger(n) || n < 1 || n > current.options.length) return
      DialStore.updateValue(current.panelId, current.variantPath, current.options[n - 1].value)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.panelId, current?.options.length])

  if (IS_PROD || !current) return null

  const comparing = vkStore.isCompare(current.name)

  return (
    <div style={barStyle}>
      {sets.length > 1 && (
        <button
          style={{ ...tabStyle(false), fontWeight: 600, color: '#fafafa' }}
          title="Switch variant set"
          onClick={() => setSetIndex((i) => (i + 1) % sets.length)}
        >
          {current.name} ▾
        </button>
      )}
      {sets.length > 1 && <div style={dividerStyle} />}
      {current.options.map((o, i) => (
        <button
          key={o.value}
          style={tabStyle(o.value === current.active)}
          onClick={() => DialStore.updateValue(current.panelId, current.variantPath, o.value)}
        >
          <span style={keyHintStyle}>{i + 1}</span>
          {o.label}
        </button>
      ))}
      <div style={dividerStyle} />
      <button
        style={tabStyle(comparing)}
        title="Compare all variants side by side"
        onClick={() => vkStore.toggleCompare(current.name)}
      >
        Compare
      </button>
      <button
        style={{
          ...tabStyle(false),
          background: '#fafafa',
          color: '#18181b',
          fontWeight: 600,
        }}
        title="Finalize this variant — writes the decision for your agent"
        onClick={() => DialStore.triggerAction(current.panelId, current.finalizePath)}
      >
        Finalize
      </button>
    </div>
  )
}

export default VariantBar
