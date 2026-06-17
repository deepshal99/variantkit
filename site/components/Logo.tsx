// VariantKit mark — three "variant" bars on a shared baseline (comparing takes), the tallest
// one solid: the variant you keep. Monochrome, inherits currentColor, squares cleanly for the
// favicon. Used in the site nav; the same glyph drives app/icon.svg and the OG image.
export function LogoMark({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="3.2" y="9.5" width="3.6" height="11" rx="1.8" fillOpacity="0.4" />
      <rect x="10.2" y="3.5" width="3.6" height="17" rx="1.8" />
      <rect x="17.2" y="6.5" width="3.6" height="14" rx="1.8" fillOpacity="0.4" />
    </svg>
  )
}
