// Tiny module-level store shared by VariantBar and VariantStage (same import instance
// inside the project). Tracks which variant sets are in compare mode.

type Listener = () => void

const compare = new Set<string>()
const listeners = new Set<Listener>()

function emit(): void {
  for (const l of listeners) l()
}

export const vkStore = {
  isCompare(name: string): boolean {
    return compare.has(name)
  },
  toggleCompare(name: string): void {
    if (compare.has(name)) compare.delete(name)
    else compare.add(name)
    emit()
  },
  subscribe(l: Listener): () => void {
    listeners.add(l)
    return () => listeners.delete(l)
  },
}

// Production guard shared by the dev chrome. Vite/Next statically replace
// process.env.NODE_ENV; plain browsers without `process` land in the catch.
export const IS_PROD: boolean = (() => {
  try {
    // @ts-ignore -- `process` may be untyped in browser-only projects; bundlers
    // statically replace process.env.NODE_ENV so the prod check still inlines.
    return process.env.NODE_ENV === 'production'
  } catch {
    return false
  }
})()
