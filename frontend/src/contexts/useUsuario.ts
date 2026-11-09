import { useContext } from "react";
import { UsuarioContext } from "./usuarioContextValue";

export function useUsuario() {
  const contexto = useContext(UsuarioContext);
  if (!contexto) {
    throw new Error("useUsuario deve ser usado dentro de UsuarioProvider.");
  }
  return contexto;
}
