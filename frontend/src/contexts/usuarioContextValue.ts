import { createContext } from "react";
import type { PerfilAdmin } from "../services/auth";

export type UsuarioContextValue = {
  usuario: PerfilAdmin | null;
  carregando: boolean;
  erro: string;
  atualizarUsuario: (usuario: PerfilAdmin) => void;
};

export const UsuarioContext = createContext<UsuarioContextValue | null>(null);
