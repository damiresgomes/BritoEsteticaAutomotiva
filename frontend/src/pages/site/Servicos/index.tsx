import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { servicoService, type Servico } from "../../../services/services";
import { obterMensagemErro } from "../../../utils/erros";
import styles from "./styles.module.css";

// Define função 'formatarPreco'.
const formatarPreco = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

// Declara constante 'CATEGORIA_PRINCIPAL'.
const CATEGORIA_PRINCIPAL = 1;

function imagemDoServico(nome: string): string {
  // Declara constante 'nomeNormalizado'.
  const nomeNormalizado = nome
    // Chamada: .normalize("NFD").
    .normalize("NFD")
    // Chamada: .replace(/[\u0300-\u036f]/g, "").
    .replace(/[\u0300-\u036f]/g, "")
    // Chamada: .toLocaleLowerCase("pt-BR");.
    .toLocaleLowerCase("pt-BR");

  if (nomeNormalizado.includes("lavagem")) return "/serv-lavagem.jpg";
  if (nomeNormalizado.includes("higienizacao")) return "/serv-higienizacao.jpg";
  if (nomeNormalizado.includes("polimento")) return "/serv-polimento.jpg";
  if (
    ["vitrificacao", "cristalizacao", "cera", "farol"].some((termo) =>
      // Chamada: nomeNormalizado.includes(termo).
      nomeNormalizado.includes(termo)
    )
  ) {
    // Retorna "/serv-vitrificacao.jpg".
    return "/serv-vitrificacao.jpg";
  }
  // Condição: ["chassi", "motor"].some((termo) => nomeNormalizado.includes(termo)).
  if (["chassi", "motor"].some((termo) => nomeNormalizado.includes(termo))) {
    // Retorna "/serv-chassi.jpg".
    return "/serv-chassi.jpg";
  }

  // Retorna "/serv-lavagem.jpg".
  return "/serv-lavagem.jpg";
}

export default function ServicosSite() {
  // Estado React: [servicos, setServicos] criado com useState; atualizar o setter causa re-render do componente.
  const [servicos, setServicos] = useState<Servico[]>([]);
  // Estado React: [busca, setBusca] criado com useState; atualizar o setter causa re-render do componente.
  const [busca, setBusca] = useState("");
  // Estado React: [carregando, setCarregando] criado com useState; atualizar o setter causa re-render do componente.
  const [carregando, setCarregando] = useState(true);
  // Estado React: [erro, setErro] criado com useState; atualizar o setter causa re-render do componente.
  const [erro, setErro] = useState("");
  // Estado React: [tentativa, setTentativa] criado com useState; atualizar o setter causa re-render do componente.
  const [tentativa, setTentativa] = useState(0);

  // Efeito React: executa código colateral após render; dependências controlam quando reexecuta.
  useEffect(() => {
    let cancelado = false;

    servicoService
      // Chamada: .listarPorCategoria(CATEGORIA_PRINCIPAL).
      .listarPorCategoria(CATEGORIA_PRINCIPAL)
      // Chamada: .then((resultado) => {.
      .then((resultado) => {
        // Condição: !cancelado.
        if (!cancelado) {
          // Chamada: setServicos(.
          setServicos(
            // Chamada: resultado.filter(.
            resultado.filter(
              (servico) => servico.id_categoria === CATEGORIA_PRINCIPAL
            )
          );
        }
      })
      // Chamada: .catch((erroRequisicao: unknown) => {.
      .catch((erroRequisicao: unknown) => {
        if (!cancelado) setErro(obterMensagemErro(erroRequisicao));
      })
      // Chamada: .finally(() => {.
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      // Atribuição: cancelado = true;.
      cancelado = true;
    };
  }, [tentativa]);

  // Chama hook React/customizado e armazena resultado em 'servicosFiltrados'.
  const servicosFiltrados = useMemo(() => {
    // Declara constante 'termo'.
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    if (!termo) return servicos;

    return servicos.filter((servico) =>
      `${servico.nome_servico} ${servico.descricao}`
        // Chamada: .toLocaleLowerCase("pt-BR").
        .toLocaleLowerCase("pt-BR")
        // Chamada: .includes(termo).
        .includes(termo)
    );
  }, [busca, servicos]);

  return (
    <section className={styles.catalogo}>
      <header className={styles.cabecalho}>
        <span className={styles.etiqueta}>CATÁLOGO</span>
        <h1 className={styles.titulo}>NOSSOS SERVIÇOS</h1>
        <p className={styles.descricao}>
          Conheça os cuidados disponíveis para o seu veículo.
        </p>
      </header>

      <div className={styles.controles}>
        <label className={styles.busca}>
          <span className={styles.visuallyHidden}>Buscar serviço</span>
          <svg
            // Atribuição: className={styles.iconeBusca}.
            className={styles.iconeBusca}
            // Atribuição: width="18".
            width="18"
            // Atribuição: height="18".
            height="18"
            // Atribuição: viewBox="0 0 24 24".
            viewBox="0 0 24 24"
            // Atribuição: fill="none".
            fill="none"
            // Atribuição: stroke="currentColor".
            stroke="currentColor"
            // Atribuição: strokeWidth="2".
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            // Atribuição: type="search".
            type="search"
            // Atribuição: placeholder="Buscar serviço...".
            placeholder="Buscar serviço..."
            // Atribuição: value={busca}.
            value={busca}
            // Atribuição: onChange={(evento) => setBusca(evento.target.value)}.
            onChange={(evento) => setBusca(evento.target.value)}
          />
        </label>
      </div>

      {carregando ? (
        <p className={styles.estado} role="status">
          Carregando serviços...
        </p>
      ) : erro ? (
        <div className={styles.estadoErro} role="alert">
          <p>{erro}</p>
          <button
            // Atribuição: type="button".
            type="button"
            // Atribuição: onClick={() => {.
            onClick={() => {
              // Chamada: setCarregando(true);.
              setCarregando(true);
              // Chamada: setErro("");.
              setErro("");
              // Chamada: setTentativa((valor) => valor + 1);.
              setTentativa((valor) => valor + 1);
            }}
          >
            Tentar novamente
          </button>
        </div>
      ) : servicosFiltrados.length === 0 ? (
        <p className={styles.estado}>
          {servicos.length === 0
            ? "Nenhum serviço disponível no momento."
            : "Nenhum serviço encontrado para essa busca."}
        </p>
      ) : (
        <div className={styles.grade} aria-live="polite">
          {servicosFiltrados.map((servico) => (
            <Link
              // Atribuição: className={styles.cartao}.
              className={styles.cartao}
              // Atribuição: key={servico.id_servico}.
              key={servico.id_servico}
              // Atribuição: to={`/agendamento?servicoId=${servico.id_servico}`}.
              to={`/agendamento?servicoId=${servico.id_servico}`}
              aria-label={`Agendar ${servico.nome_servico}`}
            >
              <div className={styles.imagemCartao}>
                <img
                  // Atribuição: className={styles.imagem}.
                  className={styles.imagem}
                  // Atribuição: src={imagemDoServico(servico.nome_servico)}.
                  src={imagemDoServico(servico.nome_servico)}
                  // Atribuição: alt={`Imagem ilustrativa: ${servico.nome_servico}`}.
                  alt={`Imagem ilustrativa: ${servico.nome_servico}`}
                  // Atribuição: loading="lazy".
                  loading="lazy"
                  // Atribuição: decoding="async".
                  decoding="async"
                />
                <span className={styles.codigo}>
                  SERVIÇO #{String(servico.id_servico).padStart(3, "0")}
                </span>
              </div>
              <div className={styles.conteudoCartao}>
                <h2 className={styles.nome}>{servico.nome_servico}</h2>
                <p className={styles.detalhe}>{servico.descricao}</p>
                <div className={styles.rodapeCartao}>
                  <p className={styles.preco}>
                    <span>A partir de</span>
                    <strong>{formatarPreco(Number(servico.preco))}</strong>
                  </p>
                  <span className={styles.duracao}>
                    {servico.duracao_horas} h
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/site/Servicos/index.tsx) responsável por renderizar UI e orquestrar interações do usuário.
