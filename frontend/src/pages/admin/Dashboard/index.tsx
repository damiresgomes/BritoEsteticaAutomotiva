import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  agendamentoService,
  type AgendamentoDashboard,
  type StatusAgendamentoCompleto,
} from "../../../services/agendamentos";
import { dataLocalAtual } from "../../../utils/datas";
import CardAdmin from "../../../components/CardAdmin";
import {
  classeStatus,
  formatarData,
  mensagemErroAgendamentos,
} from "./validators";
import styles from "./styles.module.css";

const OPCOES_STATUS: StatusAgendamentoCompleto[] = [
  "Pendente",
  "Confirmado",
  "Em atendimento",
  "Concluído",
  "Cancelado",
];

export default function Dashboard() {
  // Estado React: [agendamentos, setAgendamentos] criado com useState; atualizar o setter causa re-render do componente.
  const [agendamentos, setAgendamentos] = useState<AgendamentoDashboard[]>([]);
  // Estado React: [carregando, setCarregando] criado com useState; atualizar o setter causa re-render do componente.
  const [carregando, setCarregando] = useState(true);
  // Estado React: [erro, setErro] criado com useState; atualizar o setter causa re-render do componente.
  const [erro, setErro] = useState<string | null>(null);
  // Estado React: [mensagemSucesso, setMensagemSucesso] criado com useState; atualizar o setter causa re-render do componente.
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  // Estado React: [alterandoStatusId, setAlterandoStatusId] criado com useState; atualizar o setter causa re-render do componente.
  const [alterandoStatusId, setAlterandoStatusId] = useState<number | null>(null);

  async function carregarAgendamentos() {
    // Chamada: setCarregando(true);.
    setCarregando(true);
    // Chamada: setErro(null);.
    setErro(null);

    // Bloco try: captura erros de chamadas assíncronas/rede/validação.
    try {
      // Chamada: setAgendamentos(await agendamentoService.listarAdmin());.
      setAgendamentos(await agendamentoService.listarAdmin());
    } catch (erroRequisicao) {
      // Chamada: setErro(mensagemErroAgendamentos(erroRequisicao));.
      setErro(mensagemErroAgendamentos(erroRequisicao));
    } finally {
      // Chamada: setCarregando(false);.
      setCarregando(false);
    }
  }

  async function alterarStatus(
    agendamento: AgendamentoDashboard,
    novoStatus: StatusAgendamentoCompleto
  ) {
    if (novoStatus === agendamento.status) return;

    // Chamada: setAlterandoStatusId(agendamento.id);.
    setAlterandoStatusId(agendamento.id);
    // Chamada: setErro(null);.
    setErro(null);
    // Chamada: setMensagemSucesso("");.
    setMensagemSucesso("");

    // Bloco try: captura erros de chamadas assíncronas/rede/validação.
    try {
      // Aguarda operação assíncrona: agendamentoService.atualizarStatus(agendamento.id, novoStatus);.
      await agendamentoService.atualizarStatus(agendamento.id, novoStatus);
      // Chamada: setMensagemSucesso(`Status alterado para ${novoStatus}.`);.
      setMensagemSucesso(`Status alterado para ${novoStatus}.`);
      // Aguarda operação assíncrona: carregarAgendamentos();.
      await carregarAgendamentos();
    } catch (erroRequisicao) {
      // Chamada: setErro(mensagemErroAgendamentos(erroRequisicao));.
      setErro(mensagemErroAgendamentos(erroRequisicao));
    } finally {
      // Chamada: setAlterandoStatusId(null);.
      setAlterandoStatusId(null);
    }
  }
  // Efeito React: executa código colateral após render; dependências controlam quando reexecuta.
  useEffect(() => {
    let ativo = true;

    agendamentoService
      // Chamada: .listarAdminDashboard().
      .listarAdminDashboard()
      // Chamada: .then((dados) => {.
      .then((dados) => {
        if (ativo) setAgendamentos(dados);
      })
      // Chamada: .catch((erroRequisicao: unknown) => {.
      .catch((erroRequisicao: unknown) => {
        if (ativo) setErro(mensagemErroAgendamentos(erroRequisicao));
      })
      // Chamada: .finally(() => {.
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      // Atribuição: ativo = false;.
      ativo = false;
    };
  }, []);

  // Declara constante 'hoje'.
  const hoje = dataLocalAtual();
  // Declara constante 'agendamentosHoje'.
  const agendamentosHoje = agendamentos.filter(
    (agendamento) => agendamento.data.slice(0, 10) === hoje
  ).length;
  // Declara constante 'pendentes'.
  const pendentes = agendamentos.filter(
    (agendamento) => agendamento.status === "Pendente"
  ).length;
  // Declara constante 'confirmados'.
  const confirmados = agendamentos.filter(
    (agendamento) => agendamento.status === "Confirmado"
  ).length;
  // Declara constante 'proximosAgendamentos'.
  const proximosAgendamentos = agendamentos
    // Chamada: .filter(.
    .filter(
      (agendamento) =>
        // Chamada: agendamento.data.slice(0, 10) >= hoje &&.
        agendamento.data.slice(0, 10) >= hoje &&
        agendamento.status !== "Cancelado"
    )
    // Chamada: .sort((a, b) =>.
    .sort((a, b) =>
      `${a.data.slice(0, 10)} ${a.horario}`.localeCompare(
        `${b.data.slice(0, 10)} ${b.horario}`
      )
    )
    // Chamada: .slice(0, 6);.
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
          // Atribuição: className={styles.refreshButton}.
          className={styles.refreshButton}
          // Atribuição: type="button".
          type="button"
          // Atribuição: onClick={() => void carregarAgendamentos()}.
          onClick={() => void carregarAgendamentos()}
          // Atribuição: disabled={carregando}.
          disabled={carregando}
        >
          {carregando ? "Atualizando..." : "Atualizar"}
        </button>
      </header>

      {erro && (
        <div className={styles.errorMessage} role="alert">
          <span>{erro}</span>
          <button
            // Atribuição: type="button".
            type="button"
            // Atribuição: onClick={() => void carregarAgendamentos()}.
            onClick={() => void carregarAgendamentos()}
            // Atribuição: disabled={carregando}.
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
          // Atribuição: titulo="Agendamentos hoje".
          titulo="Agendamentos hoje"
          // Atribuição: valor={carregando ? "—" : agendamentosHoje}.
          valor={carregando ? "—" : agendamentosHoje}
          // Atribuição: descricao="Reservas para hoje".
          descricao="Reservas para hoje"
        />
        <CardAdmin
          // Atribuição: titulo="Pendentes".
          titulo="Pendentes"
          // Atribuição: valor={carregando ? "—" : pendentes}.
          valor={carregando ? "—" : pendentes}
          // Atribuição: descricao="Aguardando confirmação".
          descricao="Aguardando confirmação"
        />
        <CardAdmin
          // Atribuição: titulo="Confirmados".
          titulo="Confirmados"
          // Atribuição: valor={carregando ? "—" : confirmados}.
          valor={carregando ? "—" : confirmados}
          // Atribuição: descricao="Agendamentos confirmados".
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
                      <select
                        // Atribuição: className={`${styles.status} ${styles.statusSelect} ${classeStatus(agendamento.status)}`}.
                        className={`${styles.status} ${styles.statusSelect} ${classeStatus(agendamento.status)}`}
                        // Atribuição: value={agendamento.status}.
                        value={agendamento.status}
                        // Atribuição: onChange={(evento) =>.
                        onChange={(evento) =>
                          void alterarStatus(
                            agendamento,
                            evento.target.value as StatusAgendamentoCompleto
                          )
                        }
                        // Atribuição: disabled={alterandoStatusId === agendamento.id || carregando}.
                        disabled={alterandoStatusId === agendamento.id || carregando}
                        aria-label={`Status do agendamento de ${agendamento.cliente}`}
                      >
                        {OPCOES_STATUS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
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

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/admin/Dashboard/index.tsx) responsável por renderizar UI e orquestrar interações do usuário.
