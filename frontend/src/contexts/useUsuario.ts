import { useContext } from "react";
import { UsuarioContext } from "./usuarioContextValue";

// Exporta a função/componente 'useUsuario' para uso em rotas ou outros componentes.
export function useUsuario() {
  // Chama hook React/customizado e armazena resultado em 'contexto'.
  const contexto = useContext(UsuarioContext);
  
  // Condição: !contexto.
  if (!contexto) {
    // Lança erro: new Error("useUsuario deve ser usado dentro de UsuarioProvider.");.
    throw new Error("useUsuario deve ser usado dentro de UsuarioProvider.");
  }
  // Retorna contexto.
  return contexto;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Hook para consumir o UsuarioContext com segurança.
