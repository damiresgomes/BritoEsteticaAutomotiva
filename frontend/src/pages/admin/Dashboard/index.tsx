import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { agendamentoService, type AgendamentoAdministrativo } from "../../../services/agendamentos";
import { obterMensagemErro } from "../../../utils/erros";
import styles from "./styles.module.css";

function dataLocalAtual(): string {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function formatarData(data: string): string {
  const [ano, mes, dia] = data.slice(0, 10).split("-");
  if (!ano || !mes || !dia) return data;

  return `${dia}/${mes}/${ano}`;
}

function classeStatus(status: AgendamentoAdministrativo["status"]): string {
  switch (status) {
    case "Pendente":
      return styles.statusPending;
    case "Confirmado":
      return styles.statusConfirmed;
    case "Cancelado":
      return styles.statusCancelled;
  }
}

function mensagemErroAgendamentos(erro: unknown): string {
  if (axios.isAxiosError(erro) && erro.response?.status === 404) {
    return "A rota administrativa GET /api/agendamentos/admin ainda não está disponível no backend.";
  }

  return obterMensagemErro(erro);
}

export default function Dashboard() {
  const [agendamentos, setAgendamentos] = useState<AgendamentoAdministrativo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  async function carregarAgendamentos() {
    setCarregando(true);
    setErro(null);

    try {
      setAgendamentos(await agendamentoService.listarAdmin());
    } catch (erroRequisicao) {
      setErro(mensagemErroAgendamentos(erroRequisicao));
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    let ativo = true;

    agendamentoService
      .listarAdmin()
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

      <div className={styles.metrics} aria-label="Resumo de agendamentos">
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Agendamentos hoje</span>
          <strong className={styles.metricValue}>
            {carregando ? "—" : agendamentosHoje}
          </strong>
          <span className={styles.metricHint}>Reservas para hoje</span>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Pendentes</span>
          <strong className={styles.metricValue}>
            {carregando ? "—" : pendentes}
          </strong>
          <span className={styles.metricHint}>Aguardando confirmação</span>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Confirmados</span>
          <strong className={styles.metricValue}>
            {carregando ? "—" : confirmados}
          </strong>
          <span className={styles.metricHint}>Agendamentos confirmados</span>
        </article>
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
                      <span className={`${styles.status} ${classeStatus(agendamento.status)}`}>
                        {agendamento.status}
                      </span>
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