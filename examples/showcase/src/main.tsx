import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DialRoot } from 'dialkit'
import 'dialkit/styles.css'
// VariantKit's panel styling (dark theme support, panel cleanup + variant pills + brand mark,
// motion). Lives in src/variantkit/ — a copy of the canonical package; `npm run sync` refreshes it.
import './variantkit/dialkit-dark.css'
import './variantkit/dialkit-clean.css'
import './variantkit/motion.css'
import './demo.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* DialKit's host — mounted once. Every project's <Studio> registers its panel here. */}
    <DialRoot position="top-right" />
    <App />
  </StrictMode>,
)
