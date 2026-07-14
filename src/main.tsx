import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Fonts are self hosted (Fontsource) instead of the Google Fonts CDN:
// German courts treat loading fonts from Google servers as a GDPR violation.
import '@fontsource-variable/inter/index.css'
import '@fontsource/instrument-serif/400-italic.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
