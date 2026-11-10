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

export async function cadastrarServico(dados: CadastroServicoInput): Promise<{ id: number }> {
  // Dispara validações de domínio no construtor da entidade
  new Servico(0, dados.nome_servico, dados.descricao, dados.preco, dados.duracao_horas, dados.id_categoria);

  const categoriaExiste = await buscarCategoriaPorId(dados.id_categoria);
  if (!categoriaExiste) {
    throw new RecursoNaoEncontradoError("Categoria vinculada ao serviço não existe.");
  }

  const nomeServicoJaCadastrado = await buscarServicoPorNomeExato(dados.nome_servico);
  if (nomeServicoJaCadastrado) {
    throw new ConflitoError("Nome de serviço já cadastrado.");
  }

  const id = await criarServico({
    nome_servico: dados.nome_servico,
    descricao: dados.descricao,
    preco: dados.preco,
    duracao_horas: dados.duracao_horas,
    id_categoria: dados.id_categoria,
  });

  return { id };
}

export async function buscarServicoPorId(id_servico: number): Promise<Servico> {
  const servico = await buscarServico(id_servico);
  if (!servico) {
    throw new RecursoNaoEncontradoError("Serviço não encontrado.");
  }
  return servico;
}

export async function listarServicos(
  nome?: string,
  id_servico?: number,
  id_categoria?: number,
  pagina?: number,
  limite?: number
) {
  const offset = pagina !== undefined && limite !== undefined ? (pagina - 1) * limite : undefined;
  const filtros: FiltrosServico = {
    nome,
    id_servico,
    id_categoria,
    limite,
    offset,
  };

  return listarServicosRepositorio(filtros);
}

export async function atualizarServico(id_servico: number, dados: CadastroServicoInput): Promise<void> {
  const servico = await buscarServico(id_servico);
  if (!servico) {
    throw new RecursoNaoEncontradoError("Serviço não encontrado para atualização.");
  }

  const categoriaExiste = await buscarCategoriaPorId(dados.id_categoria);
  if (!categoriaExiste) {
    throw new RecursoNaoEncontradoError("Categoria vinculada ao serviço não existe.");
  }

  // Executa validações de domínio da entidade
  servico.atualizarDados({
    nome: dados.nome_servico,
    descricao: dados.descricao,
    preco: dados.preco,
    duracaoHoras: dados.duracao_horas,
    idCategoria: dados.id_categoria,
  });

  const servicoComMesmoNome = await buscarServicoPorNomeExato(dados.nome_servico);
  if (servicoComMesmoNome && servicoComMesmoNome.id !== id_servico) {
    throw new ConflitoError("Já existe outro serviço com esse nome.");
  }

  const linhasAfetadas = await atualizarServicoRepositorio(id_servico, {
    nome_servico: servico.nome,
    descricao: servico.descricao,
    preco: servico.preco,
    duracao_horas: servico.duracaoHoras,
    id_categoria: servico.idCategoria,
  });

  if (linhasAfetadas === 0) {
    throw new RecursoNaoEncontradoError("Serviço não encontrado para atualização.");
  }
}

export async function excluirServico(id_servico: number): Promise<void> {
  const servico = await buscarServico(id_servico);
  if (!servico) {
    throw new RecursoNaoEncontradoError("Serviço não encontrado para exclusão.");
  }

  const linhasAfetadas = await excluirServicoRepositorio(id_servico);
  if (linhasAfetadas === 0) {
    throw new RecursoNaoEncontradoError("Serviço não encontrado para exclusão.");
  }
}
