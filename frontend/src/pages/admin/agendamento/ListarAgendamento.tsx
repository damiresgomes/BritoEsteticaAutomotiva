import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeaderAdmin from "../../../components/HeaderAdmin";
import Paginacao from "../../../components/Paginacao";
import styles from "../../../components/AdminCrud/styles.module.css";
import { agendamentoService, type AgendamentoAdministrativo } from "../../../services/agendamentos";
import { obterMensagemErro } from "../../../utils/erros";

const POR_PAGINA = 6;

export default function ListarAgendamento() {
  const [agendamentos, setAgendamentos] = useState<AgendamentoAdministrativo[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [erro, setErro] = useState("");

  async function carregar(paginaAtual: number) {
    try {
      const resposta = await agendamentoService.listarAdminPaginado(paginaAtual, POR_PAGINA);
      setAgendamentos(resposta.dados);
      setTotalPaginas(resposta.paginacao.totalPaginas);
      setErro("");
    } catch (erroApi) {
      setErro(obterMensagemErro(erroApi));
    }
  }

  useEffect(() => {
    agendamentoService
      .listarAdminPaginado(pagina, POR_PAGINA)
      .then((resposta) => {
        setAgendamentos(resposta.dados);
        setTotalPaginas(resposta.paginacao.totalPaginas);
        setErro("");
      })
      .catch((erroApi: unknown) => setErro(obterMensagemErro(erroApi)));
  }, [pagina]);

  async function cancelar(id: number) {
    if (!window.confirm("Deseja cancelar este agendamento? O histórico será mantido.")) return;
    try {
      await agendamentoService.cancelarAdmin(id);
      setPagina(1);
      await carregar(1);
    } catch (erroApi) {
      setErro(obterMensagemErro(erroApi));
    }
  }

  return (
    <section className={styles.pagina}>
      <HeaderAdmin
        titulo="AGENDAMENTOS"
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
