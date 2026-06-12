// Types for vite-plugin.mjs — keeps strict vite.config.ts type-checks green without
// depending on vite's own types being installed.
declare function variantkit(): {
  name: string
  apply: 'serve'
  configureServer(server: unknown): void
}
export default variantkit
