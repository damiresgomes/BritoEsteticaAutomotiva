import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeaderAdmin from "../../../components/HeaderAdmin";
import Paginacao from "../../../components/Paginacao";
import { categoriaService, type Categoria } from "../../../services/categories";
import { obterMensagemErro } from "../../../utils/erros";
import styles from "../../../components/AdminCrud/styles.module.css";

export default function ListarCategoria() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [erro, setErro] = useState("");
  const porPagina = 6;

  async function carregar(paginaAtual: number) {
    try {
      const resposta = await categoriaService.listarPaginado(paginaAtual, porPagina);
      setCategorias(resposta.dados);
      setTotalPaginas(resposta.paginacao.totalPaginas);
      setErro("");
    } catch (erroApi) {
      setErro(obterMensagemErro(erroApi));
    }
  }

  useEffect(() => {
    categoriaService
      .listarPaginado(pagina, porPagina)
      .then((resposta) => {
        setCategorias(resposta.dados);
        setTotalPaginas(resposta.paginacao.totalPaginas);
        setErro("");
      })
      .catch((erroApi: unknown) => setErro(obterMensagemErro(erroApi)));
  }, [pagina]);

  async function excluir(id: number) {
    if (!window.confirm("Deseja excluir esta categoria?")) return;
    try {
      await categoriaService.excluir(id);
      setPagina(1);
      await carregar(1);
    } catch (erroApi) {
      setErro(obterMensagemErro(erroApi));
    }
  }

  return (
    <section className={styles.pagina}>
      <HeaderAdmin
        titulo="CATEGORIA"
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
