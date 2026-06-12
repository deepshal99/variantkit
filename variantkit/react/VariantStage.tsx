'use client'
// VariantStage — renders the active variant normally, or ALL variants in a live
// side-by-side grid when compare mode is on (toggled from VariantBar). Every cell
// reacts to panel tweaks in real time; clicking a cell selects that variant.
//
// The shell renders it in place of the bare <Active/>:
//
//   <VariantStage name="PricingCard" registry={registry} active={String(v.variant)}
//     props={variantProps} />
//
// Lives only in the shell, so it prunes away with the rest of the wiring.

import { useEffect, useReducer, type ComponentType, type CSSProperties } from 'react'
import { DialStore } from 'dialkit'
import { vkStore, IS_PROD } from './vkStore'

const font = "system-ui, -apple-system, 'Segoe UI', sans-serif"

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 24,
  alignItems: 'start',
  width: '100%',
}

const cellStyle = (active: boolean): CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  padding: 12,
  borderRadius: 14,
  cursor: 'pointer',
  outline: active ? '2px solid #18181b' : '1px solid rgba(0,0,0,0.08)',
  outlineOffset: 2,
  transition: 'outline-color 0.15s ease',
})

const captionStyle = (active: boolean): CSSProperties => ({
  fontFamily: font,
  fontSize: 12,
  fontWeight: active ? 600 : 500,
  color: active ? '#18181b' : '#71717a',
  WebkitFontSmoothing: 'antialiased',
})

function selectVariant(name: string, key: string): void {
  const panel = DialStore.getPanels().find(
    (p) => p.name === name && p.controls.some((c) => c.path === 'variant' && c.type === 'select'),
  )
  if (panel) DialStore.updateValue(panel.id, 'variant', key)
}

export function VariantStage<P extends object>({
  name,
  registry,
  active,
  props,
}: {
  name: string
  registry: Record<string, { component: ComponentType<P>; label: string }>
  active: string
  props: P
}) {
  const [, force] = useReducer((c: number) => c + 1, 0)
  useEffect(() => vkStore.subscribe(force), [])

  const entries = Object.entries(registry)
  const comparing = !IS_PROD && vkStore.isCompare(name)

  if (!comparing) {
    const Active = registry[active]?.component
    return Active ? <Active {...props} /> : null
  }

  return (
    <div style={gridStyle}>
      {entries.map(([key, { component, label }]) => {
        const C = component
        const isActive = key === active
        return (
          <div key={key} style={cellStyle(isActive)} onClick={() => selectVariant(name, key)}>
            <span style={captionStyle(isActive)}>{label}</span>
            <C {...props} />
          </div>
        )
      })}
    </div>
  )
}

export default VariantStage
