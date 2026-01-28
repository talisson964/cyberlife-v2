import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import { registerServiceWorker } from './pwa'

// Registrar o service worker para funcionalidades PWA
registerServiceWorker()

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
