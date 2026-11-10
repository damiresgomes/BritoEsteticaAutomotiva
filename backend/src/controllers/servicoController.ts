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

export async function cadastrarServicoController(request: Request, response: Response): Promise<Response> {
  const dados = cadastroServicoSchema.parse(request.body);
  const { id } = await cadastrarServico(dados);

  return response.status(201).json({
    message: "Serviço cadastrado com sucesso",
    id,
  });
}

export async function listarServicosController(request: Request, response: Response): Promise<Response> {
  const { pagina, limite } = paginacaoQuerySchema.parse(request.query);
  const nome = typeof request.query.nome === "string" && request.query.nome.trim().length > 0
    ? request.query.nome.trim()
    : undefined;

  const idInformado = typeof request.query.id === "string" ? Number(request.query.id) : undefined;
  const id = idInformado !== undefined && Number.isInteger(idInformado) && idInformado > 0 ? idInformado : undefined;

  const categoriaInformada = typeof request.query.categoria === "string" ? Number(request.query.categoria) : undefined;
  const idCategoria = categoriaInformada !== undefined && Number.isInteger(categoriaInformada) && categoriaInformada > 0
    ? categoriaInformada
    : undefined;

  const { servicos, total } = await listarServicos(nome, id, idCategoria, pagina, limite);

  response.setHeader("X-Total-Count", total.toString());
  const resposta = formatarRespostaListagem(servicos, total, pagina, limite);
  return response.status(200).json(resposta);
}

export async function buscarServicoPorIdController(request: Request, response: Response): Promise<Response> {
  const id = validarId(request.params.id, "serviço");
  const servico = await buscarServicoPorId(id);
  return response.status(200).json(servico);
}

export async function excluirServicoController(request: Request, response: Response): Promise<Response> {
  const id = validarId(request.params.id, "serviço");
  await excluirServico(id);
  return response.status(200).json({ message: "Serviço excluído com sucesso" });
}

export async function atualizarServicoController(request: Request, response: Response): Promise<Response> {
  const id = validarId(request.params.id, "serviço");
  const dados = cadastroServicoSchema.parse(request.body);
  await atualizarServico(id, dados);

  return response.status(200).json({ message: "Serviço atualizado com sucesso" });
}
