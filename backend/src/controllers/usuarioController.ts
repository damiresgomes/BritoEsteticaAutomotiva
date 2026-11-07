import { Request, Response } from "express";
import { cadastroUsuarioSchema } from "../schemas/usuarioSchema";
import { cadastrar, listar, buscarUsuarioPorId, atualizar } from "../services/usuarioService";

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

export async function atualizarUsuarioController(request: Request, response: Response):Promise<Response> {
  const { id } = request.params;
  const usuario = await atualizar(Number(id), request.body);

  return response.status(200).json(usuario);
}
