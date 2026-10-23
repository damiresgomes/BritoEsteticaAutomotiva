import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './Route.tsx'
import './index.css'
import './site.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Elemento #root não encontrado no index.html')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)