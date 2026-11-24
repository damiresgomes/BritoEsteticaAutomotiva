import { Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { obterDashboardUsuario, obterDashboardCliente } from "../services/dashboardService";

// Exporta a função assíncrona 'dashboardUsuarioController'(_request: Request, response: Response); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function dashboardUsuarioController(_request: Request, response: Response): Promise<Response> {
  // Envia resposta HTTP ao cliente: response.status(200).json(await obterDashboardUsuario()).
  return response.status(200).json(await obterDashboardUsuario());
}

// Exporta a função assíncrona 'dashboardClienteController'(request: Request, response: Response); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function dashboardClienteController(request: Request, response: Response): Promise<Response> {
  if (!request.cliente) throw new AppError(401, "Autenticação de cliente necessária.");
  // Envia resposta HTTP ao cliente: response.status(200).json(await obterDashboardCliente(request.cliente.id)).
  return response.status(200).json(await obterDashboardCliente(request.cliente.id));
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Controller do dashboard: entrega dados agregados para telas administrativas.
