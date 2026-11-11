import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import HeaderAdmin from "../../../components/HeaderAdmin";
import Paginacao from "../../../components/Paginacao";
import { categoriaService, type Categoria } from "../../../services/categories";
import { obterMensagemErro } from "../../../utils/erros";
import styles from "../../../components/AdminCrud/styles.module.css";

export default function ListarCategoria() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [pagina, setPagina] = useState(1);
  const [erro, setErro] = useState("");
  const porPagina = 6;

  useEffect(() => {
    categoriaService
      .listar()
      .then(setCategorias)
      .catch((erroApi: unknown) => setErro(obterMensagemErro(erroApi)));
  }, []);

  const totalPaginas = Math.max(1, Math.ceil(categorias.length / porPagina));
  const categoriasVisiveis = useMemo(
    () => categorias.slice((pagina - 1) * porPagina, pagina * porPagina),
    [categorias, pagina]
  );

  async function excluir(id: number) {
    if (!window.confirm("Deseja excluir esta categoria?")) return;
    try {
      await categoriaService.excluir(id);
      const atualizadas = await categoriaService.listar();
      setCategorias(atualizadas);
      setPagina((atual) =>
        Math.min(atual, Math.max(1, Math.ceil(atualizadas.length / porPagina)))
      );
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
            {categoriasVisiveis.map((categoria) => (
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