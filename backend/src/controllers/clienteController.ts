import { Request, Response } from "express";
import { formatarRespostaListagem, paginacaoQuerySchema } from "../schemas/paginacaoSchema";
import {
  atualizacaoClienteAdminSchema,
  cadastroClienteAdminSchema,
  idClienteSchema,
} from "../schemas/clienteSchema";
import {
  ativarCliente,
  atualizarCliente,
  buscarCliente,
  cadastrarClienteAdmin,
  excluirCliente,
  listarClientes,
} from "../services/clienteService";

export async function listarClientesController(
  // Define a propriedade/campo 'request' no objeto/estrutura.
  request: Request,
  // Define a propriedade/campo 'response' no objeto/estrutura.
  response: Response
): Promise<Response> {
  const { pagina, limite } = paginacaoQuerySchema.parse(request.query);
  const { clientes, total } = await listarClientes(pagina, limite);

  // Executa: response.setHeader("X-Total-Count", total.toString());.
  response.setHeader("X-Total-Count", total.toString());
  // Envia resposta HTTP ao cliente: response.status(200).json(formatarRespostaListagem(clientes, total, pagina, limite)).
  return response.status(200).json(formatarRespostaListagem(clientes, total, pagina, limite));
}

export async function buscarClienteController(
  // Define a propriedade/campo 'request' no objeto/estrutura.
  request: Request,
  // Define a propriedade/campo 'response' no objeto/estrutura.
  response: Response
): Promise<Response> {
  // Cria a constante local 'id'; usar const evita reatribuição acidental.
  const id = idClienteSchema.parse(request.params.id);
  // Envia resposta HTTP ao cliente: response.status(200).json(await buscarCliente(id)).
  return response.status(200).json(await buscarCliente(id));
}

export async function cadastrarClienteController(
  // Define a propriedade/campo 'request' no objeto/estrutura.
  request: Request,
  // Define a propriedade/campo 'response' no objeto/estrutura.
  response: Response
): Promise<Response> {
  // Cria a constante local 'dados'; usar const evita reatribuição acidental.
  const dados = cadastroClienteAdminSchema.parse(request.body);
  // Cria a constante local 'id'; usar const evita reatribuição acidental.
  const id = await cadastrarClienteAdmin(dados);
  // Envia resposta HTTP ao cliente: response.status(201).json({ message: "Cliente cadastrado com sucesso.", id }).
  return response.status(201).json({ message: "Cliente cadastrado com sucesso.", id });
}

export async function atualizarClienteController(
  // Define a propriedade/campo 'request' no objeto/estrutura.
  request: Request,
  // Define a propriedade/campo 'response' no objeto/estrutura.
  response: Response
): Promise<Response> {
  // Cria a constante local 'id'; usar const evita reatribuição acidental.
  const id = idClienteSchema.parse(request.params.id);
  // Cria a constante local 'dados'; usar const evita reatribuição acidental.
  const dados = atualizacaoClienteAdminSchema.parse(request.body);
  // Aguarda conclusão da operação assíncrona: atualizarCliente(id, dados);.
  await atualizarCliente(id, dados);
  // Envia resposta HTTP ao cliente: response.status(200).json({ message: "Cliente atualizado com sucesso." }).
  return response.status(200).json({ message: "Cliente atualizado com sucesso." });
}

export async function excluirClienteController(
  // Define a propriedade/campo 'request' no objeto/estrutura.
  request: Request,
  // Define a propriedade/campo 'response' no objeto/estrutura.
  response: Response
): Promise<Response> {
  // Cria a constante local 'id'; usar const evita reatribuição acidental.
  const id = idClienteSchema.parse(request.params.id);
  // Cria a constante local 'resultado'; usar const evita reatribuição acidental.
  const resultado = await excluirCliente(id);
  // Cria a constante local 'message'; usar const evita reatribuição acidental.
  const message = resultado === "desativado"
    ? "Acesso do cliente desativado. Os dados e o histórico foram preservados."
    : "Cliente removido.";
  // Envia resposta HTTP ao cliente: response.status(200).json({ message }).
  return response.status(200).json({ message });
}

export async function ativarClienteController(
  // Define a propriedade/campo 'request' no objeto/estrutura.
  request: Request,
  // Define a propriedade/campo 'response' no objeto/estrutura.
  response: Response
): Promise<Response> {
  // Cria a constante local 'id'; usar const evita reatribuição acidental.
  const id = idClienteSchema.parse(request.params.id);
  // Aguarda conclusão da operação assíncrona: ativarCliente(id);.
  await ativarCliente(id);
  // Envia resposta HTTP ao cliente: response.status(200).json({ message: "Acesso do cliente reativado." }).
  return response.status(200).json({ message: "Acesso do cliente reativado." });
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Controller administrativo de clientes: listagem, consulta, criação, atualização e remoção/desativação.
