import React from 'react'
import ReactDOM from 'react-dom/client'
import { DialRoot } from 'dialkit'
import 'dialkit/styles.css'
import '../../../variantkit/dialkit-clean.css' // hides DialKit's preset toolbar + renders variant pills
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <DialRoot />
  </React.StrictMode>,
)
