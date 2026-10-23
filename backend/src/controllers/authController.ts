import { Request, Response } from "express";
import { loginSchema } from "../schemas/authSchema";
import { AuthService } from "../services/authService";
import { revogarToken } from "../services/revogacaoService";
import { AppError } from "../errors/AppError";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async login(request: Request, response: Response): Promise<Response> {
    const dados = loginSchema.parse(request.body);
    const { token } = await this.authService.login(dados);

    return response.status(200).json({ token });
  }

  async logout(request: Request, response: Response): Promise<Response> {
    const sessao = request.usuario;

    if (!sessao) {
      throw new AppError(401, "Token não informado");
    }

    revogarToken(sessao.jti, sessao.exp ?? 3600);

    return response.status(200).json({ message: "Sessão encerrada com sucesso" });
  }

  async perfil(request: Request, response: Response): Promise<Response> {
    const sessao = request.usuario;

    if (!sessao) {
      throw new AppError(401, "Token não informado");
    }

    const usuario = await this.authService.buscarPerfil(sessao.id);

    return response.status(200).json(usuario);
  }

  async teste(request: Request, response: Response): Promise<Response> {
    return response.status(200).json({ usuario: request.usuario });
  }
}
