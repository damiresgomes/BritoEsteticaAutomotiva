import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { servicoService, type Servico } from "../../../services/services";
import { obterMensagemErro } from "../../../utils/erros";
import styles from "./styles.module.css";

const formatarPreco = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

const CATEGORIA_PRINCIPAL = 1;

function imagemDoServico(nome: string): string {
  const nomeNormalizado = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");

  if (nomeNormalizado.includes("lavagem")) return "/serv-lavagem.jpg";
  if (nomeNormalizado.includes("higienizacao")) return "/serv-higienizacao.jpg";
  if (nomeNormalizado.includes("polimento")) return "/serv-polimento.jpg";
  if (
    ["vitrificacao", "cristalizacao", "cera", "farol"].some((termo) =>
      nomeNormalizado.includes(termo)
    )
  ) {
    return "/serv-vitrificacao.jpg";
  }
  if (["chassi", "motor"].some((termo) => nomeNormalizado.includes(termo))) {
    return "/serv-chassi.jpg";
  }

  return "/serv-lavagem.jpg";
}

export default function ServicosSite() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let cancelado = false;

    servicoService
      .listarPorCategoria(CATEGORIA_PRINCIPAL)
      .then((resultado) => {
        if (!cancelado) {
          setServicos(
            resultado.filter(
              (servico) => servico.id_categoria === CATEGORIA_PRINCIPAL
            )
          );
        }
      })
      .catch((erroRequisicao: unknown) => {
        if (!cancelado) setErro(obterMensagemErro(erroRequisicao));
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [tentativa]);

  const servicosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    if (!termo) return servicos;

    return servicos.filter((servico) =>
      `${servico.nome_servico} ${servico.descricao}`
        .toLocaleLowerCase("pt-BR")
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
            className={styles.iconeBusca}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Buscar serviço..."
            value={busca}
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
            type="button"
            onClick={() => {
              setCarregando(true);
              setErro("");
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
              className={styles.cartao}
              key={servico.id_servico}
              to={`/agendamento?servicoId=${servico.id_servico}`}
              aria-label={`Agendar ${servico.nome_servico}`}
            >
              <div className={styles.imagemCartao}>
                <img
                  className={styles.imagem}
                  src={imagemDoServico(servico.nome_servico)}
                  alt={`Imagem ilustrativa: ${servico.nome_servico}`}
                  loading="lazy"
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
