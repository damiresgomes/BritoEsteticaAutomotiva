import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  agendamentoService,
  type AgendamentoDashboard,
} from "../../../services/agendamentos";
import { dataLocalAtual } from "../../../utils/datas";
import CardAdmin from "../../../components/CardAdmin";
import {
  classeStatus,
  formatarData,
  mensagemErroAgendamentos,
  proximoStatus,
} from "./validators";
import styles from "./styles.module.css";

export default function Dashboard() {
  const [agendamentos, setAgendamentos] = useState<AgendamentoDashboard[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [alterandoStatusId, setAlterandoStatusId] = useState<number | null>(null);

  async function carregarAgendamentos() {
    setCarregando(true);
    setErro(null);

    try {
      setAgendamentos(await agendamentoService.listarAdminDashboard());
    } catch (erroRequisicao) {
      setErro(mensagemErroAgendamentos(erroRequisicao));
    } finally {
      setCarregando(false);
    }
  }

  async function alterarStatus(agendamento: AgendamentoDashboard) {
    const proximo = proximoStatus(agendamento.status);
    if (!proximo) return;

    setAlterandoStatusId(agendamento.id);
    setErro(null);
    setMensagemSucesso("");

    try {
      await agendamentoService.atualizarStatus(agendamento.id, proximo);
      setMensagemSucesso(`Status alterado para ${proximo}.`);
      await carregarAgendamentos();
    } catch (erroRequisicao) {
      setErro(mensagemErroAgendamentos(erroRequisicao));
    } finally {
      setAlterandoStatusId(null);
    }
  }

  useEffect(() => {
    let ativo = true;

    agendamentoService
      .listarAdminDashboard()
      .then((dados) => {
        if (ativo) setAgendamentos(dados);
      })
      .catch((erroRequisicao: unknown) => {
        if (ativo) setErro(mensagemErroAgendamentos(erroRequisicao));
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const hoje = dataLocalAtual();
  const agendamentosHoje = agendamentos.filter(
    (agendamento) => agendamento.data.slice(0, 10) === hoje
  ).length;
  const pendentes = agendamentos.filter(
    (agendamento) => agendamento.status === "Pendente"
  ).length;
  const confirmados = agendamentos.filter(
    (agendamento) => agendamento.status === "Confirmado"
  ).length;
  const proximosAgendamentos = agendamentos
    .filter(
      (agendamento) =>
        agendamento.data.slice(0, 10) >= hoje &&
        agendamento.status !== "Cancelado"
    )
    .sort((a, b) =>
      `${a.data.slice(0, 10)} ${a.horario}`.localeCompare(
        `${b.data.slice(0, 10)} ${b.horario}`
      )
    )
    .slice(0, 6);

  return (
    <section className={styles.dashboard}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>PAINEL ADMINISTRATIVO</span>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            Acompanhe os agendamentos e a movimentação da Brito Estética.
          </p>
        </div>
        <button
          className={styles.refreshButton}
          type="button"
          onClick={() => void carregarAgendamentos()}
          disabled={carregando}
        >
          {carregando ? "Atualizando..." : "Atualizar"}
        </button>
      </header>

      {erro && (
        <div className={styles.errorMessage} role="alert">
          <span>{erro}</span>
          <button
            type="button"
            onClick={() => void carregarAgendamentos()}
            disabled={carregando}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {mensagemSucesso && (
        <p className={styles.successMessage} role="status">
          {mensagemSucesso}
        </p>
      )}

      <div className={styles.metrics} aria-label="Resumo de agendamentos">
        <CardAdmin
          titulo="Agendamentos hoje"
          valor={carregando ? "—" : agendamentosHoje}
          descricao="Reservas para hoje"
        />
        <CardAdmin
          titulo="Pendentes"
          valor={carregando ? "—" : pendentes}
          descricao="Aguardando confirmação"
        />
        <CardAdmin
          titulo="Confirmados"
          valor={carregando ? "—" : confirmados}
          descricao="Agendamentos confirmados"
        />
      </div>

      <section className={styles.appointmentsSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Próximos agendamentos</h2>
            <p>Os próximos horários registrados no sistema.</p>
          </div>
          <Link to="/admin/agendamento">Ver agendamentos</Link>
        </div>

        {carregando ? (
          <p className={styles.emptyState} role="status">
            Carregando agendamentos...
          </p>
        ) : proximosAgendamentos.length === 0 ? (
          <p className={styles.emptyState}>
            {erro
              ? "Os agendamentos serão exibidos quando a API administrativa estiver disponível."
              : "Não há próximos agendamentos."}
          </p>
        ) : (
          <div className={styles.tableScroller}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Serviço</th>
                  <th>Data</th>
                  <th>Horário</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {proximosAgendamentos.map((agendamento) => (
                  <tr key={agendamento.id}>
                    <td>{agendamento.cliente}</td>
                    <td>{agendamento.servico}</td>
                    <td>{formatarData(agendamento.data)}</td>
                    <td>{agendamento.horario}</td>
                    <td>
                      {proximoStatus(agendamento.status) ? (
                        <button
                          type="button"
                          className={`${styles.status} ${styles.statusButton} ${classeStatus(agendamento.status)}`}
                          onClick={() => void alterarStatus(agendamento)}
                          disabled={alterandoStatusId === agendamento.id || carregando}
                          title={`Alterar status para ${proximoStatus(agendamento.status)}`}
                        >
                          {agendamento.status}
                        </button>
                      ) : (
                        <span className={`${styles.status} ${classeStatus(agendamento.status)}`}>
                          {agendamento.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}