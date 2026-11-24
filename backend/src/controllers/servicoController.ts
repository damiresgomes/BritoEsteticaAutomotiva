import { Request, Response } from "express";
import { cadastroServicoSchema } from "../schemas/servicoSchema";
import { formatarRespostaListagem, paginacaoQuerySchema } from "../schemas/paginacaoSchema";
import { validarId } from "../validators/validaId";
import {
  cadastrarServico,
  excluirServico,
  atualizarServico,
  buscarServicoPorId,
  listarServicos,
} from "../services/servicoService";

// Exporta a função assíncrona 'cadastrarServicoController'(request: Request, response: Response); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function cadastrarServicoController(request: Request, response: Response): Promise<Response> {
  // Cria a constante local 'dados'; usar const evita reatribuição acidental.
  const dados = cadastroServicoSchema.parse(request.body);
  const { id } = await cadastrarServico(dados);

  return response.status(201).json({
    // Define a propriedade/campo 'message' no objeto/estrutura.
    message: "Serviço cadastrado com sucesso",
    id,
  });
}

// Exporta a função assíncrona 'listarServicosController'(request: Request, response: Response); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function listarServicosController(request: Request, response: Response): Promise<Response> {
  const { pagina, limite } = paginacaoQuerySchema.parse(request.query);
  // Cria a constante local 'nome'; usar const evita reatribuição acidental.
  const nome = typeof request.query.nome === "string" && request.query.nome.trim().length > 0
    ? request.query.nome.trim()
    : undefined;

  // Cria a constante local 'idInformado'; usar const evita reatribuição acidental.
  const idInformado = typeof request.query.id === "string" ? Number(request.query.id) : undefined;
  // Cria a constante local 'id'; usar const evita reatribuição acidental.
  const id = idInformado !== undefined && Number.isInteger(idInformado) && idInformado > 0 ? idInformado : undefined;

  // Cria a constante local 'categoriaInformada'; usar const evita reatribuição acidental.
  const categoriaInformada = typeof request.query.categoria === "string" ? Number(request.query.categoria) : undefined;
  // Cria a constante local 'idCategoria'; usar const evita reatribuição acidental.
  const idCategoria = categoriaInformada !== undefined && Number.isInteger(categoriaInformada) && categoriaInformada > 0
    ? categoriaInformada
    : undefined;

  const { servicos, total } = await listarServicos(nome, id, idCategoria, pagina, limite);

  // Executa: response.setHeader("X-Total-Count", total.toString());.
  response.setHeader("X-Total-Count", total.toString());
  // Cria a constante local 'resposta'; usar const evita reatribuição acidental.
  const resposta = formatarRespostaListagem(servicos, total, pagina, limite);
  // Envia resposta HTTP ao cliente: response.status(200).json(resposta).
  return response.status(200).json(resposta);
}

// Exporta a função assíncrona 'buscarServicoPorIdController'(request: Request, response: Response); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function buscarServicoPorIdController(request: Request, response: Response): Promise<Response> {
  // Cria a constante local 'id'; usar const evita reatribuição acidental.
  const id = validarId(request.params.id, "serviço");
  // Cria a constante local 'servico'; usar const evita reatribuição acidental.
  const servico = await buscarServicoPorId(id);
  // Envia resposta HTTP ao cliente: response.status(200).json(servico).
  return response.status(200).json(servico);
}

// Exporta a função assíncrona 'excluirServicoController'(request: Request, response: Response); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function excluirServicoController(request: Request, response: Response): Promise<Response> {
  // Cria a constante local 'id'; usar const evita reatribuição acidental.
  const id = validarId(request.params.id, "serviço");
  // Aguarda conclusão da operação assíncrona: excluirServico(id);.
  await excluirServico(id);
  // Envia resposta HTTP ao cliente: response.status(200).json({ message: "Serviço excluído com sucesso" }).
  return response.status(200).json({ message: "Serviço excluído com sucesso" });
}

// Exporta a função assíncrona 'atualizarServicoController'(request: Request, response: Response); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function atualizarServicoController(request: Request, response: Response): Promise<Response> {
  // Cria a constante local 'id'; usar const evita reatribuição acidental.
  const id = validarId(request.params.id, "serviço");
  // Cria a constante local 'dados'; usar const evita reatribuição acidental.
  const dados = cadastroServicoSchema.parse(request.body);
  // Aguarda conclusão da operação assíncrona: atualizarServico(id, dados);.
  await atualizarServico(id, dados);

  // Envia resposta HTTP ao cliente: response.status(200).json({ message: "Serviço atualizado com sucesso" }).
  return response.status(200).json({ message: "Serviço atualizado com sucesso" });
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Controller de serviços: endpoints de listagem/cadastro/edição/exclusão e consultas usadas pelo admin/site.
