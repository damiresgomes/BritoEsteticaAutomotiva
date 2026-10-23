import { Request, Response } from "express";
import { cadastroUsuarioSchema } from "../schemas/usuarioSchema";
import { UsuarioService } from "../services/usuarioService";

export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  async cadastrarUsuario(request: Request, response: Response): Promise<Response> {
    const dados = cadastroUsuarioSchema.parse(request.body);
    const { id } = await this.usuarioService.cadastrar(dados);

    return response.status(201).json({
      message: "Usuário cadastrado com sucesso",
      id,
    });
  }

  async listarUsuarios(request: Request, response: Response): Promise<Response> {
    const usuarios = await this.usuarioService.listar();
    return response.status(200).json(usuarios);
  }
}
