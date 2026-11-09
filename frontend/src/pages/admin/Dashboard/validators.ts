import axios from "axios";
import type { AgendamentoAdministrativo } from "../../../services/agendamentos";
import { obterMensagemErro } from "../../../utils/erros";
import styles from "./styles.module.css";

export function formatarData(data: string): string {
  const [ano, mes, dia] = data.slice(0, 10).split("-");
  if (!ano || !mes || !dia) return data;

  return `${dia}/${mes}/${ano}`;
}

export function classeStatus(
  status: AgendamentoAdministrativo["status"]
): string {
  switch (status) {
    case "Pendente":
      return styles.statusPending;
    case "Confirmado":
      return styles.statusConfirmed;
    case "Cancelado":
      return styles.statusCancelled;
  }
}

export function mensagemErroAgendamentos(erro: unknown): string {
  if (axios.isAxiosError(erro) && erro.response?.status === 404) {
    return "A rota administrativa GET /api/agendamentos/admin ainda não está disponível no backend.";
  }

  return obterMensagemErro(erro);
}
