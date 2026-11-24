import { useCallback, useEffect, useState, type ReactNode } from "react";
import { authService, type PerfilAdmin, type PerfilCliente } from "../services/auth";
import { lerToken } from "../services/authStorage";
import { obterMensagemErro } from "../utils/erros";
import { UsuarioContext } from "./usuarioContextValue";

// Exporta a função/componente 'UsuarioProvider' para uso em rotas ou outros componentes.
export function UsuarioProvider({ children }: { children: ReactNode }) {
  // Estado React: [usuario, setUsuario] criado com useState; atualizar o setter causa re-render do componente.
  const [usuario, setUsuario] = useState<PerfilAdmin | null>(null);
  // Estado React: [cliente, setCliente] criado com useState; atualizar o setter causa re-render do componente.
  const [cliente, setCliente] = useState<PerfilCliente | null>(null);
  // Estado React: [carregando, setCarregando] criado com useState; atualizar o setter causa re-render do componente.
  const [carregando, setCarregando] = useState(true);
  // Estado React: [erro, setErro] criado com useState; atualizar o setter causa re-render do componente.
  const [erro, setErro] = useState("");

  // Chama hook React/customizado e armazena resultado em 'recarregar'.
  const recarregar = useCallback(() => {
    void Promise.resolve().then(() => setCarregando(true));
    const consultas: Promise<void>[] = [];

    // Condição: lerToken("admin").
    if (lerToken("admin")) {
      // Chamada: consultas.push(.
      consultas.push(
        authService
          // Chamada: .buscarPerfil().
          .buscarPerfil()
          // Chamada: .then(setUsuario).
          .then(setUsuario)
          // Chamada: .catch((erroApi: unknown) => {.
          .catch((erroApi: unknown) => {
            // Chamada: setUsuario(null);.
            setUsuario(null);
            // Chamada: setErro(obterMensagemErro(erroApi));.
            setErro(obterMensagemErro(erroApi));
          })
      );
    } else {
      // Chamada: consultas.push(Promise.resolve().then(() => setUsuario(null)));.
      consultas.push(Promise.resolve().then(() => setUsuario(null)));
    }

    // Condição: lerToken("cliente").
    if (lerToken("cliente")) {
      // Chamada: consultas.push(.
      consultas.push(
        authService
          // Chamada: .buscarPerfilCliente().
          .buscarPerfilCliente()
          // Chamada: .then(setCliente).
          .then(setCliente)
          // Chamada: .catch(() => setCliente(null)).
          .catch(() => setCliente(null))
      );
    } else {
      // Chamada: consultas.push(Promise.resolve().then(() => setCliente(null)));.
      consultas.push(Promise.resolve().then(() => setCliente(null)));
    }

    void Promise.all(consultas).then(() => setCarregando(false));
  }, []);

  // Efeito React: executa código colateral após render; dependências controlam quando reexecuta.
  useEffect(() => {
    // Chamada: recarregar();.
    recarregar();
    // Chamada: window.addEventListener("brito:sessao", recarregar);.
    window.addEventListener("brito:sessao", recarregar);
    // Retorna () => window.removeEventListener("brito:sessao", recarregar).
    return () => window.removeEventListener("brito:sessao", recarregar);
  }, [recarregar]);

  return (
    <UsuarioContext.Provider
      // Atribuição: value={{ usuario, cliente, carregando, erro, atualizarUsuario: setUsuario, recarregar }}.
      value={{ usuario, cliente, carregando, erro, atualizarUsuario: setUsuario, recarregar }}
    >
      {children}
    </UsuarioContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Provider que carrega sessão atual, expõe usuario/cliente/recarregar e reage ao evento brito:sessao.
