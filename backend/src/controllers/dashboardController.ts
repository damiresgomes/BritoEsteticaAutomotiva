import { Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { obterDashboardUsuario, obterDashboardCliente } from "../services/dashboardService";

export async function dashboardUsuarioController(_request: Request, response: Response): Promise<Response> {
  return response.status(200).json(await obterDashboardUsuario());
}

export async function dashboardClienteController(request: Request, response: Response): Promise<Response> {
  if (!request.cliente) throw new AppError(401, "Autenticação de cliente necessária.");
  return response.status(200).json(await obterDashboardCliente(request.cliente.id));
}
