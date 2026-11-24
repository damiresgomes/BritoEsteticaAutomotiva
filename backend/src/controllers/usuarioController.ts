import { Request, Response } from "express";
import { AcessoProibidoError, ConflitoError } from "../errors/AppError";
import { atualizacaoUsuarioSchema, cadastroUsuarioSchema } from "../schemas/usuarioSchema";
import { formatarRespostaListagem, paginacaoQuerySchema } from "../schemas/paginacaoSchema";
import { validarId } from "../validators/validaId";
import {
  atualizar,
  buscarUsuarioPorId,
  cadastrar,
  excluir,
  listar,
} from "../services/usuarioService";

// Exporta a função assíncrona 'cadastrarUsuarioController'(request: Request, response: Response); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function cadastrarUsuarioController(request: Request, response: Response): Promise<Response> {
  // Cria a constante local 'dados'; usar const evita reatribuição acidental.
  const dados = cadastroUsuarioSchema.parse(request.body);
  const { id } = await cadastrar(dados);

  return response.status(201).json({
    // Define a propriedade/campo 'message' no objeto/estrutura.
    message: "Usuário cadastrado com sucesso",
    id,
  });
}

// Exporta a função assíncrona 'listarUsuariosController'(request: Request, response: Response); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function listarUsuariosController(request: Request, response: Response): Promise<Response> {
  const { pagina, limite } = paginacaoQuerySchema.parse(request.query);
  const { usuarios, total } = await listar(pagina, limite);

  // Executa: response.setHeader("X-Total-Count", total.toString());.
  response.setHeader("X-Total-Count", total.toString());
  // Cria a constante local 'resposta'; usar const evita reatribuição acidental.
  const resposta = formatarRespostaListagem(usuarios, total, pagina, limite);
  // Envia resposta HTTP ao cliente: response.status(200).json(resposta).
  return response.status(200).json(resposta);
}

// Exporta a função assíncrona 'buscarUsuarioPorIdController'(request: Request, response: Response); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function buscarUsuarioPorIdController(request: Request, response: Response): Promise<Response> {
  // Cria a constante local 'id'; usar const evita reatribuição acidental.
  const id = validarId(request.params.id, "usuário");
  // Cria a constante local 'usuario'; usar const evita reatribuição acidental.
  const usuario = await buscarUsuarioPorId(id);
  // Envia resposta HTTP ao cliente: response.status(200).json(usuario).
  return response.status(200).json(usuario);
}

// Exporta a função assíncrona 'atualizarUsuarioController'(request: Request, response: Response); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function atualizarUsuarioController(request: Request, response: Response): Promise<Response> {
  // Cria a constante local 'id'; usar const evita reatribuição acidental.
  const id = validarId(request.params.id, "usuário");

  // Cria a constante local 'idUsuarioAutenticado'; usar const evita reatribuição acidental.
  const idUsuarioAutenticado = request.usuario?.usuarioId ?? request.usuario?.id;
  // Condição: se 'idUsuarioAutenticado !== id' for verdadeira, o bloco abaixo é executado.
  if (idUsuarioAutenticado !== id) {
    // Lança 'AcessoProibidoError' com ("Você só pode editar seu próprio usuário"), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new AcessoProibidoError("Você só pode editar seu próprio usuário");
  }

  // Cria a constante local 'dados'; usar const evita reatribuição acidental.
  const dados = atualizacaoUsuarioSchema.parse(request.body);
  // Aguarda conclusão da operação assíncrona: atualizar(id, dados);.
  await atualizar(id, dados);

  // Envia resposta HTTP ao cliente: response.status(200).json({ message: "Usuário atualizado com sucesso" }).
  return response.status(200).json({ message: "Usuário atualizado com sucesso" });
}

// Exporta a função assíncrona 'desativarUsuarioController'(request: Request, response: Response); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function desativarUsuarioController(request: Request, response: Response): Promise<Response> {
  // Cria a constante local 'id'; usar const evita reatribuição acidental.
  const id = validarId(request.params.id, "usuário");

  // Cria a constante local 'idUsuarioAutenticado'; usar const evita reatribuição acidental.
  const idUsuarioAutenticado = request.usuario?.usuarioId ?? request.usuario?.id;
  // Condição: se 'idUsuarioAutenticado === id' for verdadeira, o bloco abaixo é executado.
  if (idUsuarioAutenticado === id) {
    // Lança 'ConflitoError' com ("Você não pode desativar o próprio usuário"), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new ConflitoError("Você não pode desativar o próprio usuário");
  }

  // Aguarda conclusão da operação assíncrona: excluir(id);.
  await excluir(id);
  // Envia resposta HTTP ao cliente: response.status(200).json({ message: "Usuário desativado com sucesso" }).
  return response.status(200).json({ message: "Usuário desativado com sucesso" });
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Controller CRUD/admin de usuários: lista, busca, cria, atualiza e desativa usuários conforme regras de permissão.
