import { z } from "zod";

const PLACA_VALIDA = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

function limparPlaca(valor: string): string {
  return valor.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

function normalizarPlaca(valor: string): string {
  const placa = limparPlaca(valor);
  return `${placa.slice(0, 3)}-${placa.slice(3)}`;
}

function dataExiste(valor: string): boolean {
  const [ano, mes, dia] = valor.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  return (
    data.getUTCFullYear() === ano &&
    data.getUTCMonth() === mes - 1 &&
    data.getUTCDate() === dia
  );
}

const dataSchema = z
  .string({ error: "Data é obrigatória" })
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")
  .refine(dataExiste, "Data inválida");

export const cadastroAgendamentoSchema = z.object({
  placa: z
    .string({ error: "Placa é obrigatória" })
    .refine((valor) => PLACA_VALIDA.test(limparPlaca(valor)), "Placa inválida")
    .transform(normalizarPlaca),
  veiculo: z
    .string({ error: "Veículo é obrigatório" })
    .trim()
    .min(1, "Veículo é obrigatório")
    .max(50, "Veículo deve ter no máximo 50 caracteres"),
  servicoId: z
    .number({ error: "Serviço é obrigatório" })
    .int("Serviço inválido")
    .positive("Serviço inválido"),
  data: dataSchema,
  horario: z
    .string({ error: "Horário é obrigatório" })
    .regex(/^\d{2}:\d{2}$/, "Horário inválido"),
  observacoes: z
    .string()
    .trim()
    .max(500, "Observações devem ter no máximo 500 caracteres")
    .optional(),
  extras: z
    .array(z.number().int().positive())
    .max(20, "Acréscimos demais")
    .default([]),
});

export const horariosQuerySchema = z.object({
  data: dataSchema,
});

export const cadastroAgendamentoAdminSchema = cadastroAgendamentoSchema.extend({
  clienteId: z.number({ error: "Cliente é obrigatório" }).int().positive(),
});

export const atualizarAgendamentoAdminSchema = cadastroAgendamentoSchema.extend({
  clienteId: z.number({ error: "Cliente é obrigatório" }).int().positive(),
  status: z.enum(["Pendente", "Confirmado", "Cancelado"]),
}).strict();

export const criarAgendamentoSchema = z.object({
  data_hora: z.string().datetime({ offset: true }).refine(
    (valor) => new Date(valor).getTime() > Date.now(),
    "O agendamento precisa ser em uma data futura."
  ),
  placa_veiculo: z.string().trim().min(5).max(10),
  modelo_veiculo: z.string().trim().min(2).max(50),
  servicos: z.array(z.number().int().positive()).min(1).max(10)
    .refine((ids) => new Set(ids).size === ids.length, "Não repita serviços no mesmo agendamento."),
});

export const atualizarStatusAgendamentoSchema = z.object({
  status: z.enum(["Pendente", "Confirmado", "Em atendimento", "Concluído", "Cancelado"]),
});

export type CriarAgendamentoInput = z.infer<typeof criarAgendamentoSchema>;
export type StatusAgendamento = z.infer<typeof atualizarStatusAgendamentoSchema>["status"];

export type CadastroAgendamentoInput = z.infer<typeof cadastroAgendamentoSchema>;
