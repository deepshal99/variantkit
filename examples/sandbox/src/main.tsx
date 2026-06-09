import React from 'react'
import ReactDOM from 'react-dom/client'
import { DialRoot } from 'dialkit'
import 'dialkit/styles.css'
import App from './App'

// DialRoot is a SIBLING of the app, not a wrapper (DialKit convention).
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <DialRoot />
  </React.StrictMode>,
)
