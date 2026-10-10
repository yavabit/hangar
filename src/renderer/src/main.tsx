import './shared/assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { NotificationProvider } from './app/providers/NotificationProvider'
import App from './app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </StrictMode>
)
