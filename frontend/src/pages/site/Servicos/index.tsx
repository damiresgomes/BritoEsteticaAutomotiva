import "./Services.css";

export default function ServicosSite() {
  return (
    <section className="secao-catalogo">
      <header className="cabecalho-catalogo">
        <span className="tag-mono texto-ciano">CATÁLOGO</span>
        <h1 className="titulo-principal">NOSSOS SERVIÇOS</h1>
        <p className="descricao">
          Escolha o cuidado ideal para o seu veículo. Toque no{" "}
          <span className="icone-mais">+</span> para ver os acréscimos
          disponíveis.
        </p>
      </header>

      <div className="barra-topo-galeria">
        <div className="controles-topo">
          <div className="espaco-vazio"></div>
          <div className="caixa-busca">
            <svg
              className="icone-lupa"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Buscar serviço..."
              className="input-busca"
            />
          </div>
        </div>
      </div>

      <div className="carrossel-wrapper">
        <button
          className="botao-navegacao botao-anterior"
          aria-label="Anterior"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="carrossel-container-visivel">
          <div className="carrossel-trilha" style={{}}>
            <div className="carrossel-slide">
              <article className="cartao-servico">
                <img
                  className="cartao-imagem"
                />
                <div className="cartao-sobreposicao" />

                <div className="cartao-conteudo">
                  <span className="tag-mono cartao-codigo">
                  </span>
                  <h3 className="cartao-titulo"></h3>
                  <p className="cartao-preco">
                    a partir de{" "}
                    <span className="valor-preco">R$</span>
                  </p>
                </div>
              </article>
            </div>

            <div className="nenhum-resultado">Nenhum serviço encontrado.</div>
          </div>
        </div>

        <button
          className="botao-navegacao botao-proximo"
          aria-label="Próximo"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
}
