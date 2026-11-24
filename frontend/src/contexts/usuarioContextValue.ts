import { createContext } from "react";
import type { PerfilAdmin, PerfilCliente } from "../services/auth";

// Define e exporta o tipo 'UsuarioContextValue'.
export type UsuarioContextValue = {
  usuario: PerfilAdmin | null;
  cliente: PerfilCliente | null;
  carregando: boolean;
  erro: string;
  atualizarUsuario: (usuario: PerfilAdmin) => void;
  recarregar: () => void;
};

// Exporta a constante 'UsuarioContext'.
export const UsuarioContext = createContext<UsuarioContextValue | null>(null);

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Define o contrato/tipo do contexto de usuário/sessão.
