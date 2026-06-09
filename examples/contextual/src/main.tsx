import React from 'react'
import ReactDOM from 'react-dom/client'
import { DialRoot } from 'dialkit'
import 'dialkit/styles.css'
import './dialkit-dark.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <DialRoot />
  </React.StrictMode>,
)
