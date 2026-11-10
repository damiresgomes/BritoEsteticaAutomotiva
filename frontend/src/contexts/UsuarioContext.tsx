import { useEffect, useState, type ReactNode } from "react";
import { authService, type PerfilAdmin } from "../services/auth";
import { obterMensagemErro } from "../utils/erros";
import { UsuarioContext } from "./usuarioContextValue";

export function UsuarioProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<PerfilAdmin | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    authService
      .buscarPerfil()
      .then(setUsuario)
      .catch((erroApi: unknown) => setErro(obterMensagemErro(erroApi)))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <UsuarioContext.Provider
      value={{ usuario, carregando, erro, atualizarUsuario: setUsuario }}
    >
      {children}
    </UsuarioContext.Provider>
  );
}
