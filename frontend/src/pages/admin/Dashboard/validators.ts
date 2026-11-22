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

export function formatarData(data: string): string {
  const [ano, mes, dia] = data.slice(0, 10).split("-");
  if (!ano || !mes || !dia) return data;

  return `${dia}/${mes}/${ano}`;
}

export function classeStatus(status: StatusAgendamentoCompleto): string {
  switch (status) {
    case "Pendente":
      return styles.statusPending;
    case "Confirmado":
      return styles.statusConfirmed;
    case "Em atendimento":
      return styles.statusInProgress;
    case "Concluído":
      return styles.statusDone;
    case "Cancelado":
      return styles.statusCancelled;
  }
}

export function proximoStatus(
  status: StatusAgendamentoCompleto
): StatusAgendamentoCompleto | null {
  return PROXIMO_STATUS[status] ?? null;
}

export function mensagemErroAgendamentos(erro: unknown): string {
  if (axios.isAxiosError(erro) && erro.response?.status === 404) {
    return "A rota administrativa GET /api/agendamentos/admin ainda não está disponível no backend.";
  }

  return obterMensagemErro(erro);
}
