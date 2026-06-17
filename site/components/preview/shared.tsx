'use client'
// Shared plumbing for the preview tabs. Every tab is a real component wired to the REAL
// VariantKit/DialKit panel: usePreview registers the panel (with shuffle/reset via
// usePanelActions) and, on Finalize, copies the decision + flashes the panel button to
// "✓ Copied" — exactly like the shipped product.
import { useDialKit, DialStore } from 'dialkit'
import { usePanelActions } from '../vk/usePanelActions'

export type PreviewValues = Record<string, number | string | boolean>

// Flash the panel's Finalize button to "✓ Copied" for 1.5s (panel-side feedback, no overlay).
function flashFinalized(label: string, text: string) {
  if (typeof document === 'undefined') return
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.dialkit-root .dialkit-button'))
  let btn = buttons.find((b) => b.textContent?.trim() === label)
  if (!btn && buttons.length === 1) btn = buttons[0]
  if (!btn || btn.dataset.vkFlashing) return
  const original = btn.textContent ?? ''
  btn.dataset.vkFlashing = '1'
  btn.textContent = text
  setTimeout(() => {
    if (btn!.dataset.vkFlashing) { btn!.textContent = original; delete btn!.dataset.vkFlashing }
  }, 1500)
}

// Read the panel's live values straight from the store (no stale closure), copy the decision
// JSON to the clipboard, and flash the button.
function finalizePanel(name: string, finalizeLabel: string) {
  const panel = (DialStore.getPanels() as Array<{ name: string; values?: PreviewValues }>).find((p) => p.name === name)
  const values = panel?.values ?? {}
  const decision = { component: name, values }
  try { navigator.clipboard?.writeText(JSON.stringify(decision, null, 2)) } catch { /* clipboard unavailable */ }
  flashFinalized(finalizeLabel, '✓  Copied')
}

// Register a panel + its shuffle/reset header actions, and wire Finalize. Returns live values.
export function usePreview(name: string, config: Record<string, unknown>, finalizeLabel: string): PreviewValues {
  usePanelActions(name, config)
  return useDialKit(name, config as never, {
    onAction: () => finalizePanel(name, finalizeLabel),
  }) as PreviewValues
}
