import { RequisicaoInvalidaError } from "../errors/AppError";

// Exporta a função 'validarId'(id: unknown, entidade?: string) para ser reutilizada em outras camadas.
export function validarId(id: unknown, entidade?: string): number {
  // Cria a constante local 'numeroId'; usar const evita reatribuição acidental.
  const numeroId = typeof id === "string" ? Number(id) : id;

  if (
    typeof numeroId !== "number" ||
    // Executa: Number.isNaN(numeroId) ||.
    Number.isNaN(numeroId) ||
    !Number.isInteger(numeroId) ||
    numeroId <= 0
  ) {
    // Cria a constante local 'mensagem'; usar const evita reatribuição acidental.
    const mensagem = entidade ? `ID de ${entidade} inválido.` : "ID inválido.";
    // Lança 'RequisicaoInvalidaError' com (mensagem), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RequisicaoInvalidaError(mensagem);
  }

  // Retorna numeroId para quem chamou esta função.
  return numeroId;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Valida IDs numéricos/positivos recebidos por rota/query.
