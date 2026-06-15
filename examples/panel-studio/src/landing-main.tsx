import React from 'react'
import ReactDOM from 'react-dom/client'
import { DialRoot } from 'dialkit'
import 'dialkit/styles.css'
import '../../../variantkit/dialkit-clean.css' // preset toolbar hidden + variant pills
import LandingHero from './LandingHero'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LandingHero />
    <DialRoot />
  </React.StrictMode>,
)
