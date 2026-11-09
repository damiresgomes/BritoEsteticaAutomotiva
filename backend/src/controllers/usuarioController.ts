import { Request, Response } from "express";
import { AcessoProibidoError, ConflitoError } from "../errors/AppError";
import { atualizacaoUsuarioSchema, cadastroUsuarioSchema } from "../schemas/usuarioSchema";
import { formatarRespostaListagem, paginacaoQuerySchema } from "../schemas/paginacaoSchema";
import { validarId } from "../validators/validaId";
import { cadastrar, listar, buscarUsuarioPorId, atualizar, excluir } from "../services/usuarioService";

export async function cadastrarUsuarioController(request: Request, response: Response): Promise<Response> {
  const dados = cadastroUsuarioSchema.parse(request.body);
  const { id } = await cadastrar(dados);

  return response.status(201).json({
    message: "Usuário cadastrado com sucesso",
    id,
  });
}

export async function listarUsuariosController(request: Request, response: Response): Promise<Response> {
  const { pagina, limite } = paginacaoQuerySchema.parse(request.query);
  const { usuarios, total } = await listar(pagina, limite);

  response.setHeader("X-Total-Count", total.toString());
  const resposta = formatarRespostaListagem(usuarios, total, pagina, limite);
  return response.status(200).json(resposta);
}

export async function buscarUsuarioPorIdController(request: Request, response: Response): Promise<Response> {
  const id = validarId(request.params.id, "usuário");
  const usuario = await buscarUsuarioPorId(id);
  return response.status(200).json(usuario);
}

export async function atualizarUsuarioController(request: Request, response: Response): Promise<Response> {
  const id = validarId(request.params.id, "usuário");

  if (request.usuario?.id !== id) {
    throw new AcessoProibidoError("Você só pode editar seu próprio usuário");
  }

  const dados = atualizacaoUsuarioSchema.parse(request.body);
  await atualizar(id, dados);

  return response.status(200).json({ message: "Usuário atualizado com sucesso" });
}

export async function desativarUsuarioController(request: Request, response: Response): Promise<Response> {
  const id = validarId(request.params.id, "usuário");

  if (request.usuario?.id === id) {
    throw new ConflitoError("Você não pode desativar o próprio usuário");
  }

  await excluir(id);
  return response.status(200).json({ message: "Usuário desativado com sucesso" });
}
