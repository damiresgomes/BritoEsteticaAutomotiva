import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeaderAdmin from "../../../components/HeaderAdmin";
import Paginacao from "../../../components/Paginacao";
import styles from "../../../components/AdminCrud/styles.module.css";
import { agendamentoService, type AgendamentoAdministrativo } from "../../../services/agendamentos";
import { obterMensagemErro } from "../../../utils/erros";

// Declara constante 'POR_PAGINA'.
const POR_PAGINA = 6;

export default function ListarAgendamento() {
  // Estado React: [agendamentos, setAgendamentos] criado com useState; atualizar o setter causa re-render do componente.
  const [agendamentos, setAgendamentos] = useState<AgendamentoAdministrativo[]>([]);
  // Estado React: [pagina, setPagina] criado com useState; atualizar o setter causa re-render do componente.
  const [pagina, setPagina] = useState(1);
  // Estado React: [totalPaginas, setTotalPaginas] criado com useState; atualizar o setter causa re-render do componente.
  const [totalPaginas, setTotalPaginas] = useState(1);
  // Estado React: [erro, setErro] criado com useState; atualizar o setter causa re-render do componente.
  const [erro, setErro] = useState("");

  async function carregar(paginaAtual: number) {
    // Bloco try: captura erros de chamadas assíncronas/rede/validação.
    try {
      // Declara constante 'resposta'.
      const resposta = await agendamentoService.listarAdminPaginado(paginaAtual, POR_PAGINA);
      // Chamada: setAgendamentos(resposta.dados);.
      setAgendamentos(resposta.dados);
      // Chamada: setTotalPaginas(resposta.paginacao.totalPaginas);.
      setTotalPaginas(resposta.paginacao.totalPaginas);
      // Chamada: setErro("");.
      setErro("");
    } catch (erroApi) {
      // Chamada: setErro(obterMensagemErro(erroApi));.
      setErro(obterMensagemErro(erroApi));
    }
  }

  // Efeito React: executa código colateral após render; dependências controlam quando reexecuta.
  useEffect(() => {
    agendamentoService
      // Chamada: .listarAdminPaginado(pagina, POR_PAGINA).
      .listarAdminPaginado(pagina, POR_PAGINA)
      // Chamada: .then((resposta) => {.
      .then((resposta) => {
        // Chamada: setAgendamentos(resposta.dados);.
        setAgendamentos(resposta.dados);
        // Chamada: setTotalPaginas(resposta.paginacao.totalPaginas);.
        setTotalPaginas(resposta.paginacao.totalPaginas);
        // Chamada: setErro("");.
        setErro("");
      })
      // Chamada: .catch((erroApi: unknown) => setErro(obterMensagemErro(erroApi)));.
      .catch((erroApi: unknown) => setErro(obterMensagemErro(erroApi)));
  }, [pagina]);

  async function cancelar(id: number) {
    if (!window.confirm("Deseja cancelar este agendamento? O histórico será mantido.")) return;
    // Bloco try: captura erros de chamadas assíncronas/rede/validação.
    try {
      // Aguarda operação assíncrona: agendamentoService.cancelarAdmin(id);.
      await agendamentoService.cancelarAdmin(id);
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
        // Atribuição: titulo="AGENDAMENTOS".
        titulo="AGENDAMENTOS"
        // Atribuição: links={[.
        links={[
          { to: "/admin/agendamento", label: "☰ LISTAR AGENDAMENTOS" },
          {
            to: "/admin/agendamento/cadastrar",
            label: "+ CADASTRAR AGENDAMENTO",
          },
        ]}
      />
      {erro && <p className={styles.mensagem} role="alert">{erro}</p>}
      <div className={styles.divTabela}>
        <table className={styles.tabela}>
          <thead><tr><th>Cliente</th><th>Serviços</th><th>Data</th><th>Horário</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>
            {agendamentos.map((agendamento) => (
              <tr key={agendamento.id}>
                <td>{agendamento.cliente}</td>
                <td>{agendamento.servico}</td>
                <td>{agendamento.data}</td>
                <td>{agendamento.horario}</td>
                <td>{agendamento.status}</td>
                <td>
                  <Link to={`/admin/agendamento/editar/${agendamento.id}`}>Editar</Link>
                  {agendamento.status === "Pendente" && (
                    <button type="button" onClick={() => void cancelar(agendamento.id)}>Cancelar</button>
                  )}
                </td>
              </tr>
            ))}
            {!agendamentos.length && <tr><td colSpan={6}>Nenhum agendamento encontrado.</td></tr>}
          </tbody>
        </table>
      </div>
      <Paginacao pagina={pagina} totalPaginas={totalPaginas} aoMudarPagina={setPagina} />
    </section>
  );
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/admin/Agendamento/ListarAgendamento.tsx) responsável por renderizar UI e orquestrar interações do usuário.
