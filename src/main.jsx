import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AdminProvider } from './context/AdminContext'
import App from './App'
import './styles/globals.css'
import './styles/components.css'
import './styles/admin.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <AdminProvider>
          <App />
        </AdminProvider>
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
)

