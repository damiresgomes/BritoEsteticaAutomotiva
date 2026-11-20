import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeaderAdmin from "../../../components/HeaderAdmin";
import Paginacao from "../../../components/Paginacao";
import styles from "../../../components/AdminCrud/styles.module.css";
import { useUsuario } from "../../../contexts/useUsuario";
import { userService, type Usuario } from "../../../services/users";
import { obterMensagemErro } from "../../../utils/erros";

const POR_PAGINA = 6;

export default function ListarUsuario() {
  const { usuario: usuarioAutenticado } = useUsuario();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [erro, setErro] = useState("");

  useEffect(() => {
    userService
      .listarPaginado(pagina, POR_PAGINA)
      .then((resposta) => {
        setUsuarios(resposta.dados);
        setTotalPaginas(resposta.paginacao.totalPaginas);
        setErro("");
      })
      .catch((erroApi: unknown) => setErro(obterMensagemErro(erroApi)));
  }, [pagina]);

  return (
    <section className={styles.pagina}>
      <HeaderAdmin
        titulo="USUÁRIOS"
        links={[
          { to: "/admin/usuario", label: "☰ LISTAR USUÁRIOS" },
          { to: "/admin/usuario/cadastrar", label: "+ CADASTRAR USUÁRIO" },
        ]}
      />
      {erro && <p className={styles.mensagem} role="alert">{erro}</p>}
      <div className={styles.divTabela}>
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {usuarios.map((item) => (
              <tr key={item.id}>
                <td>{item.nome}</td>
                <td>{item.email}</td>
                <td>
                  {usuarioAutenticado?.usuarioId === item.id ? (
                    <Link to={`/admin/usuario/editar/${item.id}`}>Editar</Link>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            {!usuarios.length && <tr><td colSpan={3}>Nenhum usuário cadastrado.</td></tr>}
          </tbody>
        </table>
      </div>
      <Paginacao pagina={pagina} totalPaginas={totalPaginas} aoMudarPagina={setPagina} />
    </section>
  );
}
