import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import './shared/assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { NotificationProvider } from './app/providers/NotificationProvider'
import { ThemeProvider } from './app/ThemeProvider'
import { getEffectiveTheme } from './app/theme'
import { removeSplash } from './app/splash'
import App from './app/App'
import { PaletteWindow } from './app/PaletteWindow/PaletteWindow'

const isPaletteWindow = new URLSearchParams(window.location.search).get('window') === 'palette'

document.documentElement.dataset.theme = getEffectiveTheme()
if (isPaletteWindow) {
  document.documentElement.classList.add('is-palette-window')
  removeSplash()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <NotificationProvider>{isPaletteWindow ? <PaletteWindow /> : <App />}</NotificationProvider>
    </ThemeProvider>
  </StrictMode>
)
