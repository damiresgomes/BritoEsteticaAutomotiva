import { Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { atualizacaoUsuarioSchema, cadastroUsuarioSchema } from "../schemas/usuarioSchema";
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
  const usuarios = await listar();

  return response.status(200).json(usuarios);
}

export async function buscarUsuarioPorIdController(request: Request, response: Response): Promise<Response> {
  const { id } = request.params;
  const usuario = await buscarUsuarioPorId(Number(id));

  return response.status(200).json(usuario);
}

export async function atualizarUsuarioController(request: Request, response: Response): Promise<Response> {
  const id = Number(request.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, "ID de usuário inválido");
  }

  if (request.usuario?.id !== id) {
    throw new AppError(403, "Você só pode editar seu próprio usuário");
  }

  const dados = atualizacaoUsuarioSchema.parse(request.body);
  await atualizar(id, dados);

  return response.status(200).json({ message: "Usuário atualizado com sucesso" });
}

export async function desativarUsuarioController(request: Request, response: Response): Promise<Response> {
  const id = Number(request.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, "ID de usuário inválido");
  }

  if (request.usuario?.id === id) {
    throw new AppError(409, "Você não pode desativar o próprio usuário");
  }

  await excluir(id);
  return response.status(200).json({ message: "Usuário desativado com sucesso" });
}

