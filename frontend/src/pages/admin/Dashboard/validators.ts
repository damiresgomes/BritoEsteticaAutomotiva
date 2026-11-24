import axios from "axios";
import type { StatusAgendamentoCompleto } from "../../../services/agendamentos";
import { obterMensagemErro } from "../../../utils/erros";
import styles from "./styles.module.css";

const PROXIMO_STATUS: Partial<
  Record<StatusAgendamentoCompleto, StatusAgendamentoCompleto>
> = {
  Pendente: "Confirmado",
  Confirmado: "Em atendimento",
  "Em atendimento": "Concluído",
};

// Exporta a função/componente 'formatarData' para uso em rotas ou outros componentes.
export function formatarData(data: string): string {
  const [ano, mes, dia] = data.slice(0, 10).split("-");
  if (!ano || !mes || !dia) return data;

  // Retorna `${dia}/${mes}/${ano}`.
  return `${dia}/${mes}/${ano}`;
}

// Exporta a função/componente 'classeStatus' para uso em rotas ou outros componentes.
export function classeStatus(status: StatusAgendamentoCompleto): string {
  switch (status) {
    case "Pendente":
      // Retorna styles.statusPending.
      return styles.statusPending;
    case "Confirmado":
      // Retorna styles.statusConfirmed.
      return styles.statusConfirmed;
    case "Em atendimento":
      // Retorna styles.statusInProgress.
      return styles.statusInProgress;
    case "Concluído":
      // Retorna styles.statusDone.
      return styles.statusDone;
    case "Cancelado":
      // Retorna styles.statusCancelled.
      return styles.statusCancelled;
  }
}

// Exporta a função/componente 'proximoStatus' para uso em rotas ou outros componentes.
export function proximoStatus(
  status: StatusAgendamentoCompleto
): StatusAgendamentoCompleto | null {
  // Retorna PROXIMO_STATUS[status] ?? null.
  return PROXIMO_STATUS[status] ?? null;
}

// Exporta a função/componente 'mensagemErroAgendamentos' para uso em rotas ou outros componentes.
export function mensagemErroAgendamentos(erro: unknown): string {
  // Condição: axios.isAxiosError(erro) && erro.response?.status === 404.
  if (axios.isAxiosError(erro) && erro.response?.status === 404) {
    // Retorna "A rota administrativa GET /api/agendamentos/admin ainda não está disponível no backend.".
    return "A rota administrativa GET /api/agendamentos/admin ainda não está disponível no backend.";
  }

  // Retorna obterMensagemErro(erro).
  return obterMensagemErro(erro);
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/admin/Dashboard/validators.ts) responsável por renderizar UI e orquestrar interações do usuário.
