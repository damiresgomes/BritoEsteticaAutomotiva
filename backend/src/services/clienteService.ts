import bcrypt from "bcrypt";
import { AppError, ConflitoError, RecursoNaoEncontradoError } from "../errors/AppError";
import {
  atualizarCadastroCliente,
  atualizarCliente as atualizarClienteRepositorio,
  atualizarClienteAdmin,
  buscarClienteAdmin,
  buscarContaClientePorId,
  contarClientesAdmin,
  buscarPorId,
  criarCliente,
  criarClienteAdmin,
  desativarCliente,
  desativarClienteAdmin,
  listarClientesAdmin,
  reativarClienteAdmin,
  atualizarSenhaContaCliente,
  type DadosClienteAdmin,
} from "../repositories/clienteRepository";
import type { z } from "zod";
import {
  atualizacaoClienteAdminSchema,
  atualizarClienteSchema,
  AtualizarClienteInput,
  cadastroClienteAdminSchema,
  cadastroClienteSchema,
  CadastroClienteInput,
} from "../schemas/clienteSchema";
import { Cliente } from "../entities/cliente";
import { normalizarCpf } from "../validators/cpf";

interface ErroDeBanco {
  code?: string;
  errno?: number;
}

// Declara a função local 'emailDuplicado'(erro: unknown) para encapsular lógica reutilizável neste arquivo.
function emailDuplicado(erro: unknown): boolean {
  // Cria a constante local 'erroBanco'; usar const evita reatribuição acidental.
  const erroBanco = erro as ErroDeBanco | null;
  // Retorna erroBanco?.code === "ER_DUP_ENTRY" || erroBanco?.errno === 1062 para quem chamou esta função.
  return erroBanco?.code === "ER_DUP_ENTRY" || erroBanco?.errno === 1062;
}

// Exporta a função assíncrona 'listarClientes'(pagina?: number, limite?: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function listarClientes(pagina?: number, limite?: number) {
  // Cria a constante local 'offset'; usar const evita reatribuição acidental.
  const offset = pagina !== undefined && limite !== undefined ? (pagina - 1) * limite : undefined;
  const [clientes, total] = await Promise.all([
    // Executa: listarClientesAdmin(limite, offset),.
    listarClientesAdmin(limite, offset),
    // Executa: contarClientesAdmin(),.
    contarClientesAdmin(),
  ]);
  // Retorna { clientes, total } para quem chamou esta função.
  return { clientes, total };
}

// Exporta a função assíncrona 'buscarCliente'(id: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function buscarCliente(id: number) {
  // Cria a constante local 'cliente'; usar const evita reatribuição acidental.
  const cliente = await buscarClienteAdmin(id);
  if (!cliente) throw new AppError(404, "Cliente não encontrado.");
  // Retorna cliente para quem chamou esta função.
  return cliente;
}

// Exporta a função assíncrona 'buscarClientePorId'(id_cliente: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function buscarClientePorId(id_cliente: number): Promise<Cliente> {
  // Cria a constante local 'cliente'; usar const evita reatribuição acidental.
  const cliente = await buscarPorId(id_cliente);
  // Condição: se '!cliente' for verdadeira, o bloco abaixo é executado.
  if (!cliente) {
    // Lança 'RecursoNaoEncontradoError' com ("Cliente não encontrado."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Cliente não encontrado.");
  }
  // Retorna cliente para quem chamou esta função.
  return cliente;
}

// Exporta a função assíncrona 'buscarPerfilCliente'(id: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function buscarPerfilCliente(id: number): Promise<Cliente> {
  // Cria a constante local 'cliente'; usar const evita reatribuição acidental.
  const cliente = await buscarContaClientePorId(id);
  // Condição: se '!cliente' for verdadeira, o bloco abaixo é executado.
  if (!cliente) {
    // Lança 'RecursoNaoEncontradoError' com ("Cliente não encontrado."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Cliente não encontrado.");
  }
  // Retorna cliente para quem chamou esta função.
  return cliente;
}

// Exporta a função assíncrona 'cadastrarCliente'(dados: CadastroClienteInput); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function cadastrarCliente(dados: CadastroClienteInput): Promise<{ id: number }> {
  // Cria a constante local 'cpf'; usar const evita reatribuição acidental.
  const cpf = normalizarCpf(dados.cpf);
  new Cliente(0, dados.nome, dados.email, dados.telefone, true);
  // Cria a constante local 'senhaHash'; usar const evita reatribuição acidental.
  const senhaHash = await bcrypt.hash(dados.senha, 10);
  // Inicia bloco try: código que pode lançar exceção fica aqui para ser tratado no catch.
  try {
    // Cria a constante local 'id'; usar const evita reatribuição acidental.
    const id = await criarCliente({ ...dados, cpf, senhaHash });
    // Retorna { id } para quem chamou esta função.
    return { id };
  } catch (erro) {
    // Condição: se '(erro as { code?: string })?.code === "ER_DUP_ENTRY"' for verdadeira, o bloco abaixo é executado.
    if ((erro as { code?: string })?.code === "ER_DUP_ENTRY") {
      // Lança 'ConflitoError' com ("E-mail já cadastrado."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
      throw new ConflitoError("E-mail já cadastrado.");
    }
    // Lança exceção/valor: erro;.
    throw erro;
  }
}

export async function cadastrarClienteAdmin(
  // Define a propriedade/campo 'dados' no objeto/estrutura.
  dados: z.infer<typeof cadastroClienteAdminSchema>
): Promise<number> {
  // Cria a constante local 'senhaHash'; usar const evita reatribuição acidental.
  const senhaHash = await bcrypt.hash(dados.senha, 10);
  // Inicia bloco try: código que pode lançar exceção fica aqui para ser tratado no catch.
  try {
    // Cria a constante local 'id'; usar const evita reatribuição acidental.
    const id = await criarClienteAdmin({ ...dados, senhaHash });
    if (id === "email-em-uso") throw new AppError(409, "E-mail já cadastrado.");
    // Retorna id para quem chamou esta função.
    return id;
  } catch (erro) {
    if (emailDuplicado(erro)) throw new AppError(409, "E-mail ou CPF já cadastrado.");
    // Lança exceção/valor: erro;.
    throw erro;
  }
}

// Exporta a função assíncrona 'atualizarMeuCadastroCliente'(id: number, dados: AtualizarClienteInput); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function atualizarMeuCadastroCliente(id: number, dados: AtualizarClienteInput): Promise<void> {
  // Cria a constante local 'cliente'; usar const evita reatribuição acidental.
  const cliente = await buscarPorId(id);
  // Condição: se '!cliente' for verdadeira, o bloco abaixo é executado.
  if (!cliente) {
    // Lança 'RecursoNaoEncontradoError' com ("Cliente não encontrado."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Cliente não encontrado.");
  }

  // Cria a constante local 'senhaHash'; usar const evita reatribuição acidental.
  const senhaHash = dados.senha ? await bcrypt.hash(dados.senha, 10) : undefined;
  // Executa: cliente.atualizarCadastro(dados.nome, dados.telefone, senhaHash);.
  cliente.atualizarCadastro(dados.nome, dados.telefone, senhaHash);

  // Cria a constante local 'atualizado'; usar const evita reatribuição acidental.
  const atualizado = await atualizarCadastroCliente(id, {
    // Define a propriedade/campo 'nome' no objeto/estrutura.
    nome: cliente.nome,
    senhaHash,
    // Define a propriedade/campo 'telefone' no objeto/estrutura.
    telefone: cliente.telefone,
    // Define a propriedade/campo 'cpf' no objeto/estrutura.
    cpf: normalizarCpf(dados.cpf),
  });

  // Condição: se 'atualizado === 0' for verdadeira, o bloco abaixo é executado.
  if (atualizado === 0) {
    // Lança 'RecursoNaoEncontradoError' com ("Cliente não encontrado para atualização."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Cliente não encontrado para atualização.");
  }

  // Condição: se 'senhaHash' for verdadeira, o bloco abaixo é executado.
  if (senhaHash) {
    // Aguarda conclusão da operação assíncrona: atualizarSenhaContaCliente(id, senhaHash);.
    await atualizarSenhaContaCliente(id, senhaHash);
  }
}

export async function clienteAtualizar(
  // Define a propriedade/campo 'id_cliente' no objeto/estrutura.
  id_cliente: number,
  // Define a propriedade/campo 'dados' no objeto/estrutura.
  dados: { nome: string; email: string; telefone: string }
): Promise<number> {
  // Cria a constante local 'cliente'; usar const evita reatribuição acidental.
  const cliente = await buscarPorId(id_cliente);
  // Condição: se '!cliente' for verdadeira, o bloco abaixo é executado.
  if (!cliente) {
    // Lança 'RecursoNaoEncontradoError' com ("Cliente não encontrado para atualização."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Cliente não encontrado para atualização.");
  }

  // Cria a constante local 'clienteAtualizado'; usar const evita reatribuição acidental.
  const clienteAtualizado = await atualizarClienteRepositorio(id_cliente, dados);
  // Condição: se 'clienteAtualizado === 0' for verdadeira, o bloco abaixo é executado.
  if (clienteAtualizado === 0) {
    // Lança 'RecursoNaoEncontradoError' com ("Cliente não encontrado para atualização."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Cliente não encontrado para atualização.");
  }

  // Retorna clienteAtualizado para quem chamou esta função.
  return clienteAtualizado;
}

export async function atualizarCliente(
  // Define a propriedade/campo 'id' no objeto/estrutura.
  id: number,
  // Define a propriedade/campo 'dados' no objeto/estrutura.
  dados: z.infer<typeof atualizacaoClienteAdminSchema>
): Promise<void> {
  // Cria a constante local 'senhaHash'; usar const evita reatribuição acidental.
  const senhaHash = dados.senha ? await bcrypt.hash(dados.senha, 10) : undefined;
  const dadosCliente: DadosClienteAdmin = {
    // Define a propriedade/campo 'nome' no objeto/estrutura.
    nome: dados.nome,
    // Define a propriedade/campo 'email' no objeto/estrutura.
    email: dados.email,
    // Define a propriedade/campo 'cpf' no objeto/estrutura.
    cpf: dados.cpf,
    // Define a propriedade/campo 'telefone' no objeto/estrutura.
    telefone: dados.telefone,
    // Executa: ...(senhaHash ? { senhaHash } : {}),.
    ...(senhaHash ? { senhaHash } : {}),
  };

  // Inicia bloco try: código que pode lançar exceção fica aqui para ser tratado no catch.
  try {
    // Cria a constante local 'resultado'; usar const evita reatribuição acidental.
    const resultado = await atualizarClienteAdmin(id, dadosCliente);
    if (resultado === "nao-encontrado") throw new AppError(404, "Cliente não encontrado.");
    if (resultado === "email-em-uso") throw new AppError(409, "E-mail já cadastrado.");
    // Condição: se 'resultado === "senha-obrigatoria"' for verdadeira, o bloco abaixo é executado.
    if (resultado === "senha-obrigatoria") {
      // Lança 'AppError' com (400, "Informe uma senha inicial para criar o acesso deste cliente."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
      throw new AppError(400, "Informe uma senha inicial para criar o acesso deste cliente.");
    }
  } catch (erro) {
    if (erro instanceof AppError) throw erro;
    if (emailDuplicado(erro)) throw new AppError(409, "E-mail ou CPF já cadastrado.");
    // Lança exceção/valor: erro;.
    throw erro;
  }
}

// Exporta a função assíncrona 'excluirCliente'(id: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function excluirCliente(id: number): Promise<string | number> {
  // Inicia bloco try: código que pode lançar exceção fica aqui para ser tratado no catch.
  try {
    // Cria a constante local 'resultado'; usar const evita reatribuição acidental.
    const resultado = await desativarClienteAdmin(id);
    if (resultado === "nao-encontrado") throw new AppError(404, "Cliente não encontrado.");
    // Condição: se 'resultado === "historico-sem-conta"' for verdadeira, o bloco abaixo é executado.
    if (resultado === "historico-sem-conta") {
      // Lança exceção/valor: new AppError(.
      throw new AppError(
        409,
        "Este cliente tem agendamentos históricos, mas não possui conta para desativar. Crie o acesso do cliente antes de removê-lo."
      );
    }
    // Retorna resultado para quem chamou esta função.
    return resultado;
  } catch (erro) {
    if (erro instanceof AppError) throw erro;
    // Cria a constante local 'linhasAfetadas'; usar const evita reatribuição acidental.
    const linhasAfetadas = await desativarCliente(id);
    // Condição: se 'linhasAfetadas === 0' for verdadeira, o bloco abaixo é executado.
    if (linhasAfetadas === 0) {
      // Lança 'RecursoNaoEncontradoError' com ("Cliente não encontrado."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
      throw new RecursoNaoEncontradoError("Cliente não encontrado.");
    }
    // Retorna linhasAfetadas para quem chamou esta função.
    return linhasAfetadas;
  }
}

// Exporta a função assíncrona 'ativarCliente'(id: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function ativarCliente(id: number): Promise<void> {
  // Condição: se '!(await reativarClienteAdmin(id))' for verdadeira, o bloco abaixo é executado.
  if (!(await reativarClienteAdmin(id))) {
    // Lança 'AppError' com (404, "Conta de cliente não encontrada."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new AppError(404, "Conta de cliente não encontrada.");
  }
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Regras de negócio de clientes no contexto administrativo: listar, obter, cadastrar, editar e remover/desativar.
