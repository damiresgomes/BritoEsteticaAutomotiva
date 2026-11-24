import { z } from "zod";

// Cria a constante local 'PLACA_VALIDA'; usar const evita reatribuição acidental.
const PLACA_VALIDA = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

// Declara a função local 'limparPlaca'(valor: string) para encapsular lógica reutilizável neste arquivo.
function limparPlaca(valor: string): string {
  // Retorna valor.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() para quem chamou esta função.
  return valor.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

// Declara a função local 'normalizarPlaca'(valor: string) para encapsular lógica reutilizável neste arquivo.
function normalizarPlaca(valor: string): string {
  // Cria a constante local 'placa'; usar const evita reatribuição acidental.
  const placa = limparPlaca(valor);
  // Retorna `${placa.slice(0, 3)}-${placa.slice(3)}` para quem chamou esta função.
  return `${placa.slice(0, 3)}-${placa.slice(3)}`;
}

// Declara a função local 'dataExiste'(valor: string) para encapsular lógica reutilizável neste arquivo.
function dataExiste(valor: string): boolean {
  const [ano, mes, dia] = valor.split("-").map(Number);
  // Cria a constante local 'data'; usar const evita reatribuição acidental.
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  return (
    // Executa: data.getUTCFullYear() === ano &&.
    data.getUTCFullYear() === ano &&
    // Executa: data.getUTCMonth() === mes - 1 &&.
    data.getUTCMonth() === mes - 1 &&
    // Executa: data.getUTCDate() === dia.
    data.getUTCDate() === dia
  );
}

// Declara a função local 'naoEhDomingo'(valor: string) para encapsular lógica reutilizável neste arquivo.
function naoEhDomingo(valor: string): boolean {
  const [ano, mes, dia] = valor.split("-").map(Number);
  // Retorna new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay() !== 0 para quem chamou esta função.
  return new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay() !== 0;
}

// Cria a constante local 'dataSchema'; usar const evita reatribuição acidental.
const dataSchema = z
  // Executa: .string({ error: "Data é obrigatória" }).
  .string({ error: "Data é obrigatória" })
  // Executa: .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida").
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")
  // Executa: .refine(dataExiste, "Data inválida").
  .refine(dataExiste, "Data inválida")
  // Executa: .refine(naoEhDomingo, "Não é possível realizar agendamentos aos domingos.");.
  .refine(naoEhDomingo, "Não é possível realizar agendamentos aos domingos.");

// Exporta a constante 'cadastroAgendamentoSchema'; seu valor é calculado na inicialização do módulo e pode ser importado por outros arquivos.
export const cadastroAgendamentoSchema = z.object({
  // Define a propriedade/campo 'placa' no objeto/estrutura.
  placa: z
    // Executa: .string({ error: "Placa é obrigatória" }).
    .string({ error: "Placa é obrigatória" })
    // Executa: .refine((valor) => PLACA_VALIDA.test(limparPlaca(valor)), "Placa inválida").
    .refine((valor) => PLACA_VALIDA.test(limparPlaca(valor)), "Placa inválida")
    // Executa: .transform(normalizarPlaca),.
    .transform(normalizarPlaca),
  // Define a propriedade/campo 'veiculo' no objeto/estrutura.
  veiculo: z
    // Executa: .string({ error: "Veículo é obrigatório" }).
    .string({ error: "Veículo é obrigatório" })
    // Executa: .trim().
    .trim()
    // Executa: .min(1, "Veículo é obrigatório").
    .min(1, "Veículo é obrigatório")
    // Executa: .max(50, "Veículo deve ter no máximo 50 caracteres"),.
    .max(50, "Veículo deve ter no máximo 50 caracteres"),
  // Define a propriedade/campo 'servicoId' no objeto/estrutura.
  servicoId: z
    // Executa: .number({ error: "Serviço é obrigatório" }).
    .number({ error: "Serviço é obrigatório" })
    // Executa: .int("Serviço inválido").
    .int("Serviço inválido")
    // Executa: .positive("Serviço inválido"),.
    .positive("Serviço inválido"),
  // Define a propriedade/campo 'data' no objeto/estrutura.
  data: dataSchema,
  // Define a propriedade/campo 'horario' no objeto/estrutura.
  horario: z
    // Executa: .string({ error: "Horário é obrigatório" }).
    .string({ error: "Horário é obrigatório" })
    // Executa: .regex(/^\d{2}:\d{2}$/, "Horário inválido"),.
    .regex(/^\d{2}:\d{2}$/, "Horário inválido"),
  // Define a propriedade/campo 'observacoes' no objeto/estrutura.
  observacoes: z
    // Executa: .string().
    .string()
    // Executa: .trim().
    .trim()
    // Executa: .max(500, "Observações devem ter no máximo 500 caracteres").
    .max(500, "Observações devem ter no máximo 500 caracteres")
    // Executa: .optional(),.
    .optional(),
  // Define a propriedade/campo 'extras' no objeto/estrutura.
  extras: z
    // Executa: .array(z.number().int().positive()).
    .array(z.number().int().positive())
    // Executa: .max(20, "Acréscimos demais").
    .max(20, "Acréscimos demais")
    // Executa: .default([]),.
    .default([]),
});

// Exporta a constante 'horariosQuerySchema'; seu valor é calculado na inicialização do módulo e pode ser importado por outros arquivos.
export const horariosQuerySchema = z.object({
  // Define a propriedade/campo 'data' no objeto/estrutura.
  data: dataSchema,
});

// Exporta a constante 'cadastroAgendamentoAdminSchema'; seu valor é calculado na inicialização do módulo e pode ser importado por outros arquivos.
export const cadastroAgendamentoAdminSchema = cadastroAgendamentoSchema.extend({
  // Define a propriedade/campo 'clienteId' no objeto/estrutura.
  clienteId: z.number({ error: "Cliente é obrigatório" }).int().positive(),
});

// Exporta a constante 'atualizarAgendamentoAdminSchema'; seu valor é calculado na inicialização do módulo e pode ser importado por outros arquivos.
export const atualizarAgendamentoAdminSchema = cadastroAgendamentoSchema.extend({
  // Define a propriedade/campo 'clienteId' no objeto/estrutura.
  clienteId: z.number({ error: "Cliente é obrigatório" }).int().positive(),
  // Define a propriedade/campo 'status' no objeto/estrutura.
  status: z.enum(["Pendente", "Confirmado", "Cancelado"]),
}).strict();

// Exporta a constante 'criarAgendamentoSchema'; seu valor é calculado na inicialização do módulo e pode ser importado por outros arquivos.
export const criarAgendamentoSchema = z.object({
  // Define a propriedade/campo 'data_hora' no objeto/estrutura.
  data_hora: z
    // Executa: .string().
    .string()
    // Executa: .datetime({ offset: true }).
    .datetime({ offset: true })
    // Executa: .refine(.
    .refine(
      (valor) => new Date(valor).getTime() > Date.now(),
      "O agendamento precisa ser em uma data futura."
    )
    // Executa: .refine(.
    .refine(
      (valor) => naoEhDomingo(valor.slice(0, 10)),
      "Não é possível realizar agendamentos aos domingos."
    ),
  // Define a propriedade/campo 'placa_veiculo' no objeto/estrutura.
  placa_veiculo: z
    // Executa: .string({ error: "Placa é obrigatória" }).
    .string({ error: "Placa é obrigatória" })
    // Executa: .trim().
    .trim()
    // Executa: .refine((valor) => PLACA_VALIDA.test(limparPlaca(valor)), "Placa inválida").
    .refine((valor) => PLACA_VALIDA.test(limparPlaca(valor)), "Placa inválida")
    // Executa: .transform(normalizarPlaca),.
    .transform(normalizarPlaca),
  // Define a propriedade/campo 'modelo_veiculo' no objeto/estrutura.
  modelo_veiculo: z.string().trim().min(2).max(50),
  // Define a propriedade/campo 'servicos' no objeto/estrutura.
  servicos: z.array(z.number().int().positive()).min(1).max(10)
    // Executa: .refine((ids) => new Set(ids).size === ids.length, "Não repita serviços no mesmo agendamento."),.
    .refine((ids) => new Set(ids).size === ids.length, "Não repita serviços no mesmo agendamento."),
});

// Exporta a constante 'atualizarStatusAgendamentoSchema'; seu valor é calculado na inicialização do módulo e pode ser importado por outros arquivos.
export const atualizarStatusAgendamentoSchema = z.object({
  // Define a propriedade/campo 'status' no objeto/estrutura.
  status: z.enum(["Pendente", "Confirmado", "Em atendimento", "Concluído", "Cancelado"]),
});

// Declara o alias de tipo 'CriarAgendamentoInput' para nomear uma estrutura de tipo reutilizável.
export type CriarAgendamentoInput = z.infer<typeof criarAgendamentoSchema>;
// Declara o alias de tipo 'StatusAgendamento' para nomear uma estrutura de tipo reutilizável.
export type StatusAgendamento = z.infer<typeof atualizarStatusAgendamentoSchema>["status"];

// Declara o alias de tipo 'CadastroAgendamentoInput' para nomear uma estrutura de tipo reutilizável.
export type CadastroAgendamentoInput = z.infer<typeof cadastroAgendamentoSchema>;

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Schemas Zod para agendamento.
