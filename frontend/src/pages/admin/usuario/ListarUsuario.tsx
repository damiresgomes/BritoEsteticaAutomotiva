import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import HeaderAdmin from "../../../components/HeaderAdmin";
import Paginacao from "../../../components/Paginacao";
import styles from "../../../components/AdminCrud/styles.module.css";
import { userService, type Usuario } from "../../../services/users";
import { obterMensagemErro } from "../../../utils/erros";

export default function ListarUsuario() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [pagina, setPagina] = useState(1);
  const [erro, setErro] = useState("");
  const itensPorPagina = 6;

  useEffect(() => {
    userService.listar()
      .then(setUsuarios)
      .catch((erroApi: unknown) => setErro(obterMensagemErro(erroApi)));
  }, []);

  const totalPaginas = Math.max(1, Math.ceil(usuarios.length / itensPorPagina));
  const usuariosVisiveis = useMemo(
    () => usuarios.slice((pagina - 1) * itensPorPagina, pagina * itensPorPagina),
    [usuarios, pagina]
  );

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
              <th>Email</th>
            </tr>
          </thead>

          <tbody>
            {usuariosVisiveis.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.nome}</td>
                <td>{usuario.email}</td>
                <td>
                <Link to={`/admin/usuario/editar/${usuario.id}`}>Editar</Link>
              </td>
              </tr>
            ))}
            {!usuarios.length && <tr><td colSpan={2}>Nenhum usuário cadastrado.</td></tr>}
          </tbody>
        </table>
      </div>
      <Paginacao pagina={pagina} totalPaginas={totalPaginas} aoMudarPagina={setPagina} />
    </section>
  );
}