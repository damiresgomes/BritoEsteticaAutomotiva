import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeaderAdmin from "../../../components/HeaderAdmin";
import Paginacao from "../../../components/Paginacao";
import { servicoService, type Servico } from "../../../services/services";
import { obterMensagemErro } from "../../../utils/erros";
import styles from "../../../components/AdminCrud/styles.module.css";

export default function ListarServico() {
  // Estado React: [servicos, setServicos] criado com useState; atualizar o setter causa re-render do componente.
  const [servicos, setServicos] = useState<Servico[]>([]);
  // Estado React: [pagina, setPagina] criado com useState; atualizar o setter causa re-render do componente.
  const [pagina, setPagina] = useState(1);
  // Estado React: [totalPaginas, setTotalPaginas] criado com useState; atualizar o setter causa re-render do componente.
  const [totalPaginas, setTotalPaginas] = useState(1);
  // Estado React: [erro, setErro] criado com useState; atualizar o setter causa re-render do componente.
  const [erro, setErro] = useState("");
  // Declara constante 'porPagina'.
  const porPagina = 6;

  async function carregar(paginaAtual: number) {
    // Bloco try: captura erros de chamadas assíncronas/rede/validação.
    try {
      // Declara constante 'resposta'.
      const resposta = await servicoService.listarPaginado(paginaAtual, porPagina);
      // Chamada: setServicos(resposta.dados);.
      setServicos(resposta.dados);
      // Chamada: setTotalPaginas(resposta.paginacao.totalPaginas);.
      setTotalPaginas(resposta.paginacao.totalPaginas);
      // Chamada: setErro("");.
      setErro("");
    } catch (erroApi) {
      // Chamada: setErro(obterMensagemErro(erroApi));.
      setErro(obterMensagemErro(erroApi));
    }
  }

  // Efeito React: executa código colateral após render; dependências controlam quando reexecuta.
  useEffect(() => {
    servicoService
      // Chamada: .listarPaginado(pagina, porPagina).
      .listarPaginado(pagina, porPagina)
      // Chamada: .then((resposta) => {.
      .then((resposta) => {
        // Chamada: setServicos(resposta.dados);.
        setServicos(resposta.dados);
        // Chamada: setTotalPaginas(resposta.paginacao.totalPaginas);.
        setTotalPaginas(resposta.paginacao.totalPaginas);
        // Chamada: setErro("");.
        setErro("");
      })
      // Chamada: .catch((erroApi: unknown) => setErro(obterMensagemErro(erroApi)));.
      .catch((erroApi: unknown) => setErro(obterMensagemErro(erroApi)));
  }, [pagina]);

  async function excluir(id: number) {
    if (!window.confirm("Deseja excluir este serviço?")) return;
    // Bloco try: captura erros de chamadas assíncronas/rede/validação.
    try {
      // Aguarda operação assíncrona: servicoService.excluir(id);.
      await servicoService.excluir(id);
      // Chamada: setPagina(1);.
      setPagina(1);
      // Aguarda operação assíncrona: carregar(1);.
      await carregar(1);
    } catch (erroApi) {
      // Chamada: setErro(obterMensagemErro(erroApi));.
      setErro(obterMensagemErro(erroApi));
    }
  }

  return (
    <section className={styles.pagina}>
      <HeaderAdmin
        // Atribuição: titulo="SERVIÇOS".
        titulo="SERVIÇOS"
        // Atribuição: links={[.
        links={[
          { to: "/admin/servico", label: "☰ LISTAR SERVIÇOS" },
          { to: "/admin/servico/cadastrar", label: "+ CADASTRAR SERVIÇO" },
        ]}
      />
      {erro && <p className={styles.mensagem} role="alert">{erro}</p>}
      <div className={styles.divTabela}>
        <table className={styles.tabela}>
          <thead><tr><th>Serviço</th><th>Preço</th><th>Categoria</th><th>Ações</th></tr></thead>
          <tbody>
            {servicos.map((servico) => (
              <tr key={servico.id_servico}>
                <td>{servico.nome_servico}</td>
                <td>{servico.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                <td>{servico.id_categoria}</td>
                <td>
                  <Link to={`/admin/servico/editar/${servico.id_servico}`}>Editar</Link>
                  <button type="button" onClick={() => void excluir(servico.id_servico)}>Excluir</button>
                </td>
              </tr>
            ))}
            {!servicos.length && <tr><td colSpan={4}>Nenhum serviço cadastrado.</td></tr>}
          </tbody>
        </table>
      </div>
      <Paginacao pagina={pagina} totalPaginas={totalPaginas} aoMudarPagina={setPagina} />
    </section>
  );
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/admin/Servico/ListarServico.tsx) responsável por renderizar UI e orquestrar interações do usuário.
