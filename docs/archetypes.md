# Archetype gallery

An archetype is a full configuration panel for one element type — composed from section
builders plus the element's own controls. The agent picks the closest one and seeds it
with the values from your code, so the panel opens matching what's on screen
(`AGENT.md §7`). Source: `variantkit/schemas/archetypes.ts`.

## Sections (the shared vocabulary)

| Section | Controls |
|---|---|
| `layout` | padding, gap, align, direction, maxWidth |
| `surface` | bg, radius, borderWidth, borderColor, shadow (none→xl tokens) |
| `typography` | size, weight, tracking, lineHeight, family (system/sans/serif/mono) |
| `color` | accent, fg, bg, muted |
| `motion` | spring, hoverScale, duration |
| `states` | hoverBg, hoverShadow, activeScale |

Selects return tokens; the shell resolves them to CSS via `SHADOWS` / `FONT_STACKS` so
variants stay self-contained. Drop a control a variant owns structurally by destructuring
(`const { bg: _bg, ...surface } = sections.surface`).

## Archetypes

| Archetype | Own controls | Sections |
|---|---|---|
| `button` | size, iconPosition, fullWidth | surface, typography, color, states, motion |
| `card` | media, density | layout, surface, typography, color, states, motion |
| `hero` | alignment, ctaStyle, minHeight | layout, typography, color, motion |
| `navbar` | height, sticky, blur, linkGap | surface, typography, color, motion |
| `modal` | width, overlayOpacity, backdropBlur | layout, surface, typography, color, motion |
| `form` | labelPosition, fieldGap, inputRadius | layout, surface, typography, color, states |
| `table` | density, rowHeight, striped, dividers | surface, typography, color, states |
| `list` | marker, itemGap, dense | layout, typography, color, states |
| `badge` | size, pill, tone | surface, typography, color |
| `pricing` | priceSize, featured, ctaStyle | layout, surface, typography, color, states, motion |
| `section` | paddingY | layout, surface, typography, color |

Every archetype accepts overrides per section plus `extra` for bespoke top-level controls:

```ts
pricingArchetype({
  surface: { radius: 18, shadow: 'lg' },
  color: { accent: '#1F5E54' },
  priceSize: 40,
  extra: { badgeText: { type: 'text', default: 'Most popular' } },
})
```

Nothing fits? Compose sections directly — same files, same shapes. Never invent control
types: DialKit supports slider `[def,min,max,step?]`, boolean, text, color (hex), select,
spring, easing, action, and nested folders (`_collapsed: true`).
