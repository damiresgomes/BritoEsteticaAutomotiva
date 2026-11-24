import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeaderAdmin from "../../../components/HeaderAdmin";
import Paginacao from "../../../components/Paginacao";
import { categoriaService, type Categoria } from "../../../services/categories";
import { obterMensagemErro } from "../../../utils/erros";
import styles from "../../../components/AdminCrud/styles.module.css";

export default function ListarCategoria() {
  // Estado React: [categorias, setCategorias] criado com useState; atualizar o setter causa re-render do componente.
  const [categorias, setCategorias] = useState<Categoria[]>([]);
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
      const resposta = await categoriaService.listarPaginado(paginaAtual, porPagina);
      // Chamada: setCategorias(resposta.dados);.
      setCategorias(resposta.dados);
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
    categoriaService
      // Chamada: .listarPaginado(pagina, porPagina).
      .listarPaginado(pagina, porPagina)
      // Chamada: .then((resposta) => {.
      .then((resposta) => {
        // Chamada: setCategorias(resposta.dados);.
        setCategorias(resposta.dados);
        // Chamada: setTotalPaginas(resposta.paginacao.totalPaginas);.
        setTotalPaginas(resposta.paginacao.totalPaginas);
        // Chamada: setErro("");.
        setErro("");
      })
      // Chamada: .catch((erroApi: unknown) => setErro(obterMensagemErro(erroApi)));.
      .catch((erroApi: unknown) => setErro(obterMensagemErro(erroApi)));
  }, [pagina]);

  async function excluir(id: number) {
    if (!window.confirm("Deseja excluir esta categoria?")) return;
    // Bloco try: captura erros de chamadas assíncronas/rede/validação.
    try {
      // Aguarda operação assíncrona: categoriaService.excluir(id);.
      await categoriaService.excluir(id);
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
        // Atribuição: titulo="CATEGORIA".
        titulo="CATEGORIA"
        // Atribuição: links={[.
        links={[
          { to: "/admin/categoria", label: "☰ LISTAR CATEGORIAS" },
          { to: "/admin/categoria/cadastrar", label: "+ CADASTRAR CATEGORIA" },
        ]}
      />
      {erro && <p className={styles.mensagem} role="alert">{erro}</p>}
      <div className={styles.divTabela}>
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {categorias.map((categoria) => (
              <tr key={categoria.id_categoria}>
                <td>{categoria.nome_categoria}</td>
                <td>
                  <Link to={`/admin/categoria/editar/${categoria.id_categoria}`}>Editar</Link>
                  <button type="button" onClick={() => void excluir(categoria.id_categoria)}>Excluir</button>
                </td>
              </tr>
            ))}
            {!categorias.length && <tr><td colSpan={2}>Nenhuma categoria cadastrada.</td></tr>}
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
// Página/componente de tela React (frontend/src/pages/admin/Categoria/Listarcategoria.tsx) responsável por renderizar UI e orquestrar interações do usuário.
