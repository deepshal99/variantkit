import React from 'react'
import ReactDOM from 'react-dom/client'
import { DialRoot } from 'dialkit'
import 'dialkit/styles.css'
import './core/dialkit-clean.css'
import './core/motion.css'
import { VariantBar } from './core/react/VariantBar'
import App from './App'

// DialRoot/VariantBar are SIBLINGS of the app, not wrappers (DialKit convention).
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <DialRoot />
    <VariantBar />
  </React.StrictMode>,
)
