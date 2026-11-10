import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import HeaderAdmin from "../../../components/HeaderAdmin";
import Paginacao from "../../../components/Paginacao";
import styles from "../../../components/AdminCrud/styles.module.css";
import { agendamentoService, type AgendamentoAdministrativo } from "../../../services/agendamentos";
import { obterMensagemErro } from "../../../utils/erros";

export default function ListarAgendamento() {
  const [agendamentos, setAgendamentos] = useState<AgendamentoAdministrativo[]>([]);
  const [pagina, setPagina] = useState(1);
  const [erro, setErro] = useState("");
  const porPagina = 6;

  async function carregar() {
    try {
      setAgendamentos(await agendamentoService.listarAdmin());
      setErro("");
    } catch (erroApi) {
      setErro(obterMensagemErro(erroApi));
    }
  }

  useEffect(() => {
    agendamentoService
      .listarAdmin()
      .then(setAgendamentos)
      .catch((erroApi: unknown) => setErro(obterMensagemErro(erroApi)));
  }, []);

  const totalPaginas = Math.max(1, Math.ceil(agendamentos.length / porPagina));
  const visiveis = useMemo(
    () => agendamentos.slice((pagina - 1) * porPagina, pagina * porPagina),
    [agendamentos, pagina]
  );

  async function cancelar(id: number) {
    if (!window.confirm("Deseja cancelar este agendamento? O histórico será mantido.")) return;
    try {
      await agendamentoService.cancelarAdmin(id);
      await carregar();
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
      {erro && <p className={styles.menssagem} role="alert">{erro}</p>}
      <div className={styles.divTabela}>
        <table className={styles.tabela}>
          <thead><tr><th>Cliente</th><th>Serviços</th><th>Data</th><th>Horário</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>
            {visiveis.map((agendamento) => (
              <tr key={agendamento.id}>
                <td>{agendamento.cliente}</td>
                <td>{agendamento.servico}</td>
                <td>{agendamento.data}</td>
                <td>{agendamento.horario}</td>
                <td>{agendamento.status}</td>
                <td>
                  <Link to={`/admin/agendamento/editar/${agendamento.id}`}>Editar</Link>
                  {agendamento.status !== "Cancelado" && (
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