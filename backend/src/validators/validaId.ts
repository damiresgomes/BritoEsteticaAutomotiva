import { RequisicaoInvalidaError } from "../errors/AppError";

export function validarId(id: unknown, entidade?: string): number {
  const numeroId = typeof id === "string" ? Number(id) : id;

  if (
    typeof numeroId !== "number" ||
    Number.isNaN(numeroId) ||
    !Number.isInteger(numeroId) ||
    numeroId <= 0
  ) {
    const mensagem = entidade ? `ID de ${entidade} inválido.` : "ID inválido.";
    throw new RequisicaoInvalidaError(mensagem);
  }

  return numeroId;
}
