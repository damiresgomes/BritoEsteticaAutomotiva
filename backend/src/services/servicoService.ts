import {
  buscarServicoPorNomeExato,
  buscarServico,
  listarServicos as listarServicosRepositorio,
  criarServico,
  atualizarServico as atualizarServicoRepositorio,
  excluirServico as excluirServicoRepositorio,
  FiltrosServico,
} from "../repositories/servicoRepository";
import { buscarCategoriaPorId } from "../repositories/categoriaRepository";
import { ConflitoError, RecursoNaoEncontradoError } from "../errors/AppError";
import { CadastroServicoInput } from "../schemas/servicoSchema";
import { Servico } from "../entities/servico";

// Exporta a função assíncrona 'cadastrarServico'(dados: CadastroServicoInput); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function cadastrarServico(dados: CadastroServicoInput): Promise<{ id: number }> {
  new Servico(0, dados.nome_servico, dados.descricao, dados.preco, dados.duracao_horas, dados.id_categoria);

  // Cria a constante local 'categoriaExiste'; usar const evita reatribuição acidental.
  const categoriaExiste = await buscarCategoriaPorId(dados.id_categoria);
  // Condição: se '!categoriaExiste' for verdadeira, o bloco abaixo é executado.
  if (!categoriaExiste) {
    // Lança 'RecursoNaoEncontradoError' com ("Categoria vinculada ao serviço não existe."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Categoria vinculada ao serviço não existe.");
  }

  // Cria a constante local 'nomeServicoJaCadastrado'; usar const evita reatribuição acidental.
  const nomeServicoJaCadastrado = await buscarServicoPorNomeExato(dados.nome_servico);
  // Condição: se 'nomeServicoJaCadastrado' for verdadeira, o bloco abaixo é executado.
  if (nomeServicoJaCadastrado) {
    // Lança 'ConflitoError' com ("Nome de serviço já cadastrado."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new ConflitoError("Nome de serviço já cadastrado.");
  }

  // Cria a constante local 'id'; usar const evita reatribuição acidental.
  const id = await criarServico({
    // Define a propriedade/campo 'nome_servico' no objeto/estrutura.
    nome_servico: dados.nome_servico,
    // Define a propriedade/campo 'descricao' no objeto/estrutura.
    descricao: dados.descricao,
    // Define a propriedade/campo 'preco' no objeto/estrutura.
    preco: dados.preco,
    // Define a propriedade/campo 'duracao_horas' no objeto/estrutura.
    duracao_horas: dados.duracao_horas,
    // Define a propriedade/campo 'id_categoria' no objeto/estrutura.
    id_categoria: dados.id_categoria,
  });

  // Retorna { id } para quem chamou esta função.
  return { id };
}

// Exporta a função assíncrona 'buscarServicoPorId'(id_servico: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function buscarServicoPorId(id_servico: number): Promise<Servico> {
  // Cria a constante local 'servico'; usar const evita reatribuição acidental.
  const servico = await buscarServico(id_servico);
  // Condição: se '!servico' for verdadeira, o bloco abaixo é executado.
  if (!servico) {
    // Lança 'RecursoNaoEncontradoError' com ("Serviço não encontrado."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Serviço não encontrado.");
  }
  // Retorna servico para quem chamou esta função.
  return servico;
}

export async function listarServicos(
  nome?: string,
  id_servico?: number,
  id_categoria?: number,
  pagina?: number,
  limite?: number
) {
  // Cria a constante local 'offset'; usar const evita reatribuição acidental.
  const offset = pagina !== undefined && limite !== undefined ? (pagina - 1) * limite : undefined;
  const filtros: FiltrosServico = {
    nome,
    id_servico,
    id_categoria,
    limite,
    offset,
  };

  // Retorna listarServicosRepositorio(filtros) para quem chamou esta função.
  return listarServicosRepositorio(filtros);
}

// Exporta a função assíncrona 'atualizarServico'(id_servico: number, dados: CadastroServicoInput); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function atualizarServico(id_servico: number, dados: CadastroServicoInput): Promise<void> {
  // Cria a constante local 'servico'; usar const evita reatribuição acidental.
  const servico = await buscarServico(id_servico);
  // Condição: se '!servico' for verdadeira, o bloco abaixo é executado.
  if (!servico) {
    // Lança 'RecursoNaoEncontradoError' com ("Serviço não encontrado para atualização."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Serviço não encontrado para atualização.");
  }

  // Cria a constante local 'categoriaExiste'; usar const evita reatribuição acidental.
  const categoriaExiste = await buscarCategoriaPorId(dados.id_categoria);
  // Condição: se '!categoriaExiste' for verdadeira, o bloco abaixo é executado.
  if (!categoriaExiste) {
    // Lança 'RecursoNaoEncontradoError' com ("Categoria vinculada ao serviço não existe."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Categoria vinculada ao serviço não existe.");
  }
  // Executa: servico.atualizarDados({.
  servico.atualizarDados({
    // Define a propriedade/campo 'nome' no objeto/estrutura.
    nome: dados.nome_servico,
    // Define a propriedade/campo 'descricao' no objeto/estrutura.
    descricao: dados.descricao,
    // Define a propriedade/campo 'preco' no objeto/estrutura.
    preco: dados.preco,
    // Define a propriedade/campo 'duracaoHoras' no objeto/estrutura.
    duracaoHoras: dados.duracao_horas,
    // Define a propriedade/campo 'idCategoria' no objeto/estrutura.
    idCategoria: dados.id_categoria,
  });

  // Cria a constante local 'servicoComMesmoNome'; usar const evita reatribuição acidental.
  const servicoComMesmoNome = await buscarServicoPorNomeExato(dados.nome_servico);
  // Condição: se 'servicoComMesmoNome && servicoComMesmoNome.id !== id_servico' for verdadeira, o bloco abaixo é executado.
  if (servicoComMesmoNome && servicoComMesmoNome.id !== id_servico) {
    // Lança 'ConflitoError' com ("Já existe outro serviço com esse nome."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new ConflitoError("Já existe outro serviço com esse nome.");
  }

  // Cria a constante local 'linhasAfetadas'; usar const evita reatribuição acidental.
  const linhasAfetadas = await atualizarServicoRepositorio(id_servico, {
    // Define a propriedade/campo 'nome_servico' no objeto/estrutura.
    nome_servico: servico.nome,
    // Define a propriedade/campo 'descricao' no objeto/estrutura.
    descricao: servico.descricao,
    // Define a propriedade/campo 'preco' no objeto/estrutura.
    preco: servico.preco,
    // Define a propriedade/campo 'duracao_horas' no objeto/estrutura.
    duracao_horas: servico.duracaoHoras,
    // Define a propriedade/campo 'id_categoria' no objeto/estrutura.
    id_categoria: servico.idCategoria,
  });

  // Condição: se 'linhasAfetadas === 0' for verdadeira, o bloco abaixo é executado.
  if (linhasAfetadas === 0) {
    // Lança 'RecursoNaoEncontradoError' com ("Serviço não encontrado para atualização."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Serviço não encontrado para atualização.");
  }
}

// Exporta a função assíncrona 'excluirServico'(id_servico: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function excluirServico(id_servico: number): Promise<void> {
  // Cria a constante local 'servico'; usar const evita reatribuição acidental.
  const servico = await buscarServico(id_servico);
  // Condição: se '!servico' for verdadeira, o bloco abaixo é executado.
  if (!servico) {
    // Lança 'RecursoNaoEncontradoError' com ("Serviço não encontrado para exclusão."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Serviço não encontrado para exclusão.");
  }

  // Cria a constante local 'linhasAfetadas'; usar const evita reatribuição acidental.
  const linhasAfetadas = await excluirServicoRepositorio(id_servico);
  // Condição: se 'linhasAfetadas === 0' for verdadeira, o bloco abaixo é executado.
  if (linhasAfetadas === 0) {
    // Lança 'RecursoNaoEncontradoError' com ("Serviço não encontrado para exclusão."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Serviço não encontrado para exclusão.");
  }
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Regras de negócio de serviços: cadastro, edição, listagem e validações de integridade.
