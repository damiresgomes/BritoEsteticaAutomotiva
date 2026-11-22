import { useCallback, useEffect, useState, type ReactNode } from "react";
import { authService, type PerfilAdmin, type PerfilCliente } from "../services/auth";
import { lerToken } from "../services/authStorage";
import { obterMensagemErro } from "../utils/erros";
import { UsuarioContext } from "./usuarioContextValue";

export function UsuarioProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<PerfilAdmin | null>(null);
  const [cliente, setCliente] = useState<PerfilCliente | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const recarregar = useCallback(() => {
    void Promise.resolve().then(() => setCarregando(true));
    const consultas: Promise<void>[] = [];

    if (lerToken("admin")) {
      consultas.push(
        authService
          .buscarPerfil()
          .then(setUsuario)
          .catch((erroApi: unknown) => {
            setUsuario(null);
            setErro(obterMensagemErro(erroApi));
          })
      );
    } else {
      consultas.push(Promise.resolve().then(() => setUsuario(null)));
    }

    if (lerToken("cliente")) {
      consultas.push(
        authService
          .buscarPerfilCliente()
          .then(setCliente)
          .catch(() => setCliente(null))
      );
    } else {
      consultas.push(Promise.resolve().then(() => setCliente(null)));
    }

    void Promise.all(consultas).then(() => setCarregando(false));
  }, []);

  useEffect(() => {
    recarregar();
    window.addEventListener("brito:sessao", recarregar);
    return () => window.removeEventListener("brito:sessao", recarregar);
  }, [recarregar]);

  return (
    <UsuarioContext.Provider
      value={{ usuario, cliente, carregando, erro, atualizarUsuario: setUsuario, recarregar }}
    >
      {children}
    </UsuarioContext.Provider>
  );
}
