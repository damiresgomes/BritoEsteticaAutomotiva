import bcrypt from "bcrypt";
import { AppError, ConflitoError, RecursoNaoEncontradoError } from "../errors/AppError";
import {
  atualizarPerfilUsuario,
  atualizarUsuario,
  buscarPorCpf,
  buscarPorEmail,
  buscarPorId,
  buscarTodos,
  criarUsuario,
  desativarUsuario,
} from "../repositories/usuarioRepository";
import {
  AtualizacaoUsuarioInput,
  CadastroUsuarioInput,
  perfilAdminSchema,
} from "../schemas/usuarioSchema";
import { normalizarCpf } from "../validators/cpf";
import { Usuario } from "../entities/usuario";
import type { z } from "zod";

// Exporta a função assíncrona 'cadastrar'(dados: CadastroUsuarioInput); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function cadastrar(dados: CadastroUsuarioInput): Promise<{ id: number }> {
  // Cria a constante local 'cpfNormalizado'; usar const evita reatribuição acidental.
  const cpfNormalizado = normalizarCpf(dados.cpf);

  new Usuario(
    0,
    dados.nome,
    dados.email,
    "",
    cpfNormalizado,
    dados.salario,
    dados.datanascimento,
    "dummy-hash",
    true
  );

  // Condição: se 'await buscarPorEmail(dados.email)' for verdadeira, o bloco abaixo é executado.
  if (await buscarPorEmail(dados.email)) {
    // Lança 'ConflitoError' com ("E-mail já cadastrado"), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new ConflitoError("E-mail já cadastrado");
  }

  // Condição: se 'await buscarPorCpf(cpfNormalizado)' for verdadeira, o bloco abaixo é executado.
  if (await buscarPorCpf(cpfNormalizado)) {
    // Lança 'ConflitoError' com ("CPF já cadastrado"), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new ConflitoError("CPF já cadastrado");
  }

  // Cria a constante local 'senhaHash'; usar const evita reatribuição acidental.
  const senhaHash = await bcrypt.hash(dados.senha, 10);

  // Cria a constante local 'id'; usar const evita reatribuição acidental.
  const id = await criarUsuario({
    // Define a propriedade/campo 'nome' no objeto/estrutura.
    nome: dados.nome,
    // Define a propriedade/campo 'email' no objeto/estrutura.
    email: dados.email,
    senhaHash,
    // Define a propriedade/campo 'cpf' no objeto/estrutura.
    cpf: cpfNormalizado,
    // Define a propriedade/campo 'salario' no objeto/estrutura.
    salario: dados.salario,
    // Define a propriedade/campo 'datanascimento' no objeto/estrutura.
    datanascimento: dados.datanascimento,
  });

  // Retorna { id } para quem chamou esta função.
  return { id };
}

// Exporta a função assíncrona 'listar'(pagina?: number, limite?: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function listar(pagina?: number, limite?: number) {
  // Cria a constante local 'offset'; usar const evita reatribuição acidental.
  const offset = pagina !== undefined && limite !== undefined ? (pagina - 1) * limite : undefined;
  // Retorna buscarTodos(limite, offset) para quem chamou esta função.
  return buscarTodos(limite, offset);
}

// Exporta a função assíncrona 'buscarUsuarioPorId'(id: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function buscarUsuarioPorId(id: number): Promise<Usuario> {
  // Cria a constante local 'usuario'; usar const evita reatribuição acidental.
  const usuario = await buscarPorId(id);
  // Condição: se '!usuario' for verdadeira, o bloco abaixo é executado.
  if (!usuario) {
    // Lança 'RecursoNaoEncontradoError' com ("Usuário não encontrado"), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Usuário não encontrado");
  }
  // Retorna usuario para quem chamou esta função.
  return usuario;
}

// Exporta a função assíncrona 'atualizar'(id: number, dados: AtualizacaoUsuarioInput); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function atualizar(id: number, dados: AtualizacaoUsuarioInput): Promise<void> {
  // Cria a constante local 'usuario'; usar const evita reatribuição acidental.
  const usuario = await buscarPorId(id);
  // Condição: se '!usuario' for verdadeira, o bloco abaixo é executado.
  if (!usuario) {
    // Lança 'RecursoNaoEncontradoError' com ("Usuário não encontrado"), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Usuário não encontrado");
  }

  // Cria a constante local 'cpfNormalizado'; usar const evita reatribuição acidental.
  const cpfNormalizado = normalizarCpf(dados.cpf);
  // Condição: se 'cpfNormalizado !== usuario.cpf' for verdadeira, o bloco abaixo é executado.
  if (cpfNormalizado !== usuario.cpf) {
    // Cria a constante local 'usuarioComMesmoCpf'; usar const evita reatribuição acidental.
    const usuarioComMesmoCpf = await buscarPorCpf(cpfNormalizado);
    // Condição: se 'usuarioComMesmoCpf && usuarioComMesmoCpf.id !== id' for verdadeira, o bloco abaixo é executado.
    if (usuarioComMesmoCpf && usuarioComMesmoCpf.id !== id) {
      // Lança 'ConflitoError' com ("CPF já cadastrado"), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
      throw new ConflitoError("CPF já cadastrado");
    }
  }

  // Cria a constante local 'senhaHash'; usar const evita reatribuição acidental.
  const senhaHash = await bcrypt.hash(dados.senha, 10);

  // Executa: usuario.atualizarDados({.
  usuario.atualizarDados({
    // Define a propriedade/campo 'nome' no objeto/estrutura.
    nome: dados.nome,
    // Define a propriedade/campo 'cpf' no objeto/estrutura.
    cpf: cpfNormalizado,
    // Define a propriedade/campo 'salario' no objeto/estrutura.
    salario: dados.salario,
    // Define a propriedade/campo 'dataDeNascimento' no objeto/estrutura.
    dataDeNascimento: dados.datanascimento,
    senhaHash,
  });

  // Cria a constante local 'linhasAfetadas'; usar const evita reatribuição acidental.
  const linhasAfetadas = await atualizarUsuario(id, {
    // Define a propriedade/campo 'nome' no objeto/estrutura.
    nome: usuario.nome,
    senhaHash,
    // Define a propriedade/campo 'cpf' no objeto/estrutura.
    cpf: usuario.cpf,
    // Define a propriedade/campo 'salario' no objeto/estrutura.
    salario: usuario.salario,
    // Define a propriedade/campo 'datanascimento' no objeto/estrutura.
    datanascimento: usuario.dataDeNascimento,
  });

  // Condição: se 'linhasAfetadas === 0' for verdadeira, o bloco abaixo é executado.
  if (linhasAfetadas === 0) {
    // Lança 'RecursoNaoEncontradoError' com ("Usuário não encontrado para atualização"), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Usuário não encontrado para atualização");
  }
}

// Exporta a função assíncrona 'excluir'(id: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function excluir(id: number): Promise<void> {
  // Cria a constante local 'usuario'; usar const evita reatribuição acidental.
  const usuario = await buscarPorId(id);
  // Condição: se '!usuario' for verdadeira, o bloco abaixo é executado.
  if (!usuario) {
    // Lança 'RecursoNaoEncontradoError' com ("Usuário não encontrado"), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Usuário não encontrado");
  }

  // Cria a constante local 'linhasAfetadas'; usar const evita reatribuição acidental.
  const linhasAfetadas = await desativarUsuario(id);
  // Condição: se 'linhasAfetadas === 0' for verdadeira, o bloco abaixo é executado.
  if (linhasAfetadas === 0) {
    // Lança 'RecursoNaoEncontradoError' com ("Usuário não encontrado para desativação"), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Usuário não encontrado para desativação");
  }
}

export async function atualizarPerfilAdministrador(
  // Define a propriedade/campo 'id' no objeto/estrutura.
  id: number,
  // Define a propriedade/campo 'dados' no objeto/estrutura.
  dados: z.infer<typeof perfilAdminSchema>
): Promise<void> {
  // Cria a constante local 'usuario'; usar const evita reatribuição acidental.
  const usuario = await buscarPorId(id);
  if (!usuario) throw new AppError(404, "Usuário não encontrado.");

  // Cria a constante local 'cpf'; usar const evita reatribuição acidental.
  const cpf = normalizarCpf(dados.cpf);
  // Condição: se 'cpf !== normalizarCpf(usuario.cpf) && (await buscarPorCpf(cpf))' for verdadeira, o bloco abaixo é executado.
  if (cpf !== normalizarCpf(usuario.cpf) && (await buscarPorCpf(cpf))) {
    // Lança 'AppError' com (409, "CPF já cadastrado."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new AppError(409, "CPF já cadastrado.");
  }

  // Aguarda conclusão da operação assíncrona: atualizarPerfilUsuario(id, {.
  await atualizarPerfilUsuario(id, {
    // Define a propriedade/campo 'nome' no objeto/estrutura.
    nome: dados.nome,
    cpf,
    // Executa: ...(dados.senha ? { senhaHash: await bcrypt.hash(dados.senha, 10) } : {}),.
    ...(dados.senha ? { senhaHash: await bcrypt.hash(dados.senha, 10) } : {}),
    // Define a propriedade/campo 'salario' no objeto/estrutura.
    salario: dados.salario,
    // Define a propriedade/campo 'datanascimento' no objeto/estrutura.
    datanascimento: dados.datanascimento,
  });
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Regras de negócio de usuários: validações, criação/edição, consulta e desativação, delegando SQL ao repository.
