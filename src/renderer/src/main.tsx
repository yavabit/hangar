import './shared/assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import ruRU from 'antd/locale/ru_RU'
import { NotificationProvider } from './app/providers/NotificationProvider'
import App from './app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider locale={ruRU}>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </ConfigProvider>
  </StrictMode>
)
