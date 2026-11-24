// Importa StrictMode de 'react'.
import { StrictMode } from 'react'
// Importa createRoot de 'react-dom/client'.
import { createRoot } from 'react-dom/client'
// Importa App de './App.tsx'.
import App from './App.tsx'
// Importa UsuarioProvider de './contexts/UsuarioContext'.
import { UsuarioProvider } from './contexts/UsuarioContext'
// Importa './index.css' para aplicar efeitos colaterais (CSS/registro).
import './index.css'

// Declara constante 'rootElement'.
const rootElement = document.getElementById('root')

// Condição: !rootElement.
if (!rootElement) {
  // Lança erro: new Error('Elemento #root não encontrado no index.html').
  throw new Error('Elemento #root não encontrado no index.html')
}

// Chamada: createRoot(rootElement!).render(.
createRoot(rootElement!).render(
    <StrictMode>
      <UsuarioProvider>
        <App />
      </UsuarioProvider>
    </StrictMode>,
)

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Ponto de entrada do React: importa estilos globais, cria root e renderiza App dentro do UsuarioProvider.
