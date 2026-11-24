import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeaderAdmin from "../../../components/HeaderAdmin";
import Paginacao from "../../../components/Paginacao";
import styles from "../../../components/AdminCrud/styles.module.css";
import { clienteService, type ClienteAdmin } from "../../../services/clients";
import { obterMensagemErro } from "../../../utils/erros";

// Declara constante 'POR_PAGINA'.
const POR_PAGINA = 8;

export default function ListarCliente() {
  // Estado React: [clientes, setClientes] criado com useState; atualizar o setter causa re-render do componente.
  const [clientes, setClientes] = useState<ClienteAdmin[]>([]);
  // Estado React: [pagina, setPagina] criado com useState; atualizar o setter causa re-render do componente.
  const [pagina, setPagina] = useState(1);
  // Estado React: [totalPaginas, setTotalPaginas] criado com useState; atualizar o setter causa re-render do componente.
  const [totalPaginas, setTotalPaginas] = useState(1);
  // Estado React: [carregando, setCarregando] criado com useState; atualizar o setter causa re-render do componente.
  const [carregando, setCarregando] = useState(true);
  // Estado React: [erro, setErro] criado com useState; atualizar o setter causa re-render do componente.
  const [erro, setErro] = useState("");

  async function carregar(paginaAtual: number) {
    // Chamada: setCarregando(true);.
    setCarregando(true);
    // Bloco try: captura erros de chamadas assíncronas/rede/validação.
    try {
      // Declara constante 'resposta'.
      const resposta = await clienteService.listarPaginado(paginaAtual, POR_PAGINA);
      // Chamada: setClientes(resposta.dados);.
      setClientes(resposta.dados);
      // Chamada: setTotalPaginas(resposta.paginacao.totalPaginas);.
      setTotalPaginas(resposta.paginacao.totalPaginas);
      // Chamada: setErro("");.
      setErro("");
    } catch (erroApi) {
      // Chamada: setErro(obterMensagemErro(erroApi));.
      setErro(obterMensagemErro(erroApi));
    } finally {
      // Chamada: setCarregando(false);.
      setCarregando(false);
    }
  }

  // Efeito React: executa código colateral após render; dependências controlam quando reexecuta.
  useEffect(() => {
    clienteService
      // Chamada: .listarPaginado(pagina, POR_PAGINA).
      .listarPaginado(pagina, POR_PAGINA)
      // Chamada: .then((resposta) => {.
      .then((resposta) => {
        // Chamada: setClientes(resposta.dados);.
        setClientes(resposta.dados);
        // Chamada: setTotalPaginas(resposta.paginacao.totalPaginas);.
        setTotalPaginas(resposta.paginacao.totalPaginas);
        // Chamada: setErro("");.
        setErro("");
        // Chamada: setCarregando(false);.
        setCarregando(false);
      })
      // Chamada: .catch((erroApi: unknown) => {.
      .catch((erroApi: unknown) => {
        // Chamada: setErro(obterMensagemErro(erroApi));.
        setErro(obterMensagemErro(erroApi));
        // Chamada: setCarregando(false);.
        setCarregando(false);
      });
  }, [pagina]);

  async function excluir(cliente: ClienteAdmin) {
    // Declara constante 'acao'.
    const acao = cliente.status === "Sem conta" ? "remover" : "desativar o acesso de";
    if (!window.confirm(`Deseja ${acao} ${cliente.nome}? O histórico de agendamentos será preservado.`)) return;
    // Bloco try: captura erros de chamadas assíncronas/rede/validação.
    try {
      // Aguarda operação assíncrona: clienteService.excluir(cliente.id);.
      await clienteService.excluir(cliente.id);
      // Chamada: setPagina(1);.
      setPagina(1);
      // Aguarda operação assíncrona: carregar(1);.
      await carregar(1);
    } catch (erroApi) {
      // Chamada: setErro(obterMensagemErro(erroApi));.
      setErro(obterMensagemErro(erroApi));
    }
  }

  async function ativar(cliente: ClienteAdmin) {
    // Bloco try: captura erros de chamadas assíncronas/rede/validação.
    try {
      // Aguarda operação assíncrona: clienteService.ativar(cliente.id);.
      await clienteService.ativar(cliente.id);
      // Chamada: setPagina(1);.
      setPagina(1);
      // Aguarda operação assíncrona: carregar(1);.
      await carregar(1);
    } catch (erroApi) {
      // Chamada: setErro(obterMensagemErro(erroApi));.
      setErro(obterMensagemErro(erroApi));
    }
  }

  return (
    <section className={styles.pagina}>
      <HeaderAdmin
        // Atribuição: titulo="CLIENTES".
        titulo="CLIENTES"
        // Atribuição: links={[.
        links={[
          { to: "/admin/cliente", label: "☰ LISTAR CLIENTES" },
          { to: "/admin/cliente/cadastrar", label: "+ CADASTRAR CLIENTE" },
        ]}
      />
      {erro && <p className={styles.mensagem} role="alert">{erro}</p>}
      {carregando ? (
        <p>Carregando clientes...</p>
      ) : (
        <>
          <div className={styles.divTabela}>
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Telefone</th>
                  <th>Acesso</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>{cliente.nome}</td>
                    <td>{cliente.email ?? "—"}</td>
                    <td>{cliente.telefone ?? "—"}</td>
                    <td>{cliente.status}</td>
                    <td>
                      <Link to={`/admin/cliente/editar/${cliente.id}`}>Editar</Link>
                      {cliente.status === "Inativo" ? (
                        <button type="button" onClick={() => void ativar(cliente)}>Ativar</button>
                      ) : (
                        <button type="button" onClick={() => void excluir(cliente)}>
                          {cliente.status === "Sem conta" ? "Remover" : "Desativar"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!clientes.length && (
                  <tr>
                    <td colSpan={5}>
                      {erro ? "Não foi possível carregar os clientes." : "Nenhum cliente cadastrado."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Paginacao pagina={pagina} totalPaginas={totalPaginas} aoMudarPagina={setPagina} />
        </>
      )}
    </section>
  );
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/admin/Cliente/ListarCliente.tsx) responsável por renderizar UI e orquestrar interações do usuário.
