import { createContext } from "react";
import type { PerfilAdmin, PerfilCliente } from "../services/auth";

export type UsuarioContextValue = {
  usuario: PerfilAdmin | null;
  cliente: PerfilCliente | null;
  carregando: boolean;
  erro: string;
  atualizarUsuario: (usuario: PerfilAdmin) => void;
  recarregar: () => void;
};

export const UsuarioContext = createContext<UsuarioContextValue | null>(null);
