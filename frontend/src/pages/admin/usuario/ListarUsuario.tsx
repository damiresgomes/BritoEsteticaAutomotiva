import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeaderAdmin from "../../../components/HeaderAdmin";
import Paginacao from "../../../components/Paginacao";
import styles from "../../../components/AdminCrud/styles.module.css";
import { useUsuario } from "../../../contexts/useUsuario";
import { userService, type Usuario } from "../../../services/users";
import { obterMensagemErro } from "../../../utils/erros";

// Declara constante 'POR_PAGINA'.
const POR_PAGINA = 6;

export default function ListarUsuario() {
  const { usuario: usuarioAutenticado } = useUsuario();
  // Estado React: [usuarios, setUsuarios] criado com useState; atualizar o setter causa re-render do componente.
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  // Estado React: [pagina, setPagina] criado com useState; atualizar o setter causa re-render do componente.
  const [pagina, setPagina] = useState(1);
  // Estado React: [totalPaginas, setTotalPaginas] criado com useState; atualizar o setter causa re-render do componente.
  const [totalPaginas, setTotalPaginas] = useState(1);
  // Estado React: [erro, setErro] criado com useState; atualizar o setter causa re-render do componente.
  const [erro, setErro] = useState("");

  // Efeito React: executa código colateral após render; dependências controlam quando reexecuta.
  useEffect(() => {
    userService
      // Chamada: .listarPaginado(pagina, POR_PAGINA).
      .listarPaginado(pagina, POR_PAGINA)
      // Chamada: .then((resposta) => {.
      .then((resposta) => {
        // Chamada: setUsuarios(resposta.dados);.
        setUsuarios(resposta.dados);
        // Chamada: setTotalPaginas(resposta.paginacao.totalPaginas);.
        setTotalPaginas(resposta.paginacao.totalPaginas);
        // Chamada: setErro("");.
        setErro("");
      })
      // Chamada: .catch((erroApi: unknown) => setErro(obterMensagemErro(erroApi)));.
      .catch((erroApi: unknown) => setErro(obterMensagemErro(erroApi)));
  }, [pagina]);

  return (
    <section className={styles.pagina}>
      <HeaderAdmin
        // Atribuição: titulo="USUÁRIOS".
        titulo="USUÁRIOS"
        // Atribuição: links={[.
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

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/admin/Usuario/ListarUsuario.tsx) responsável por renderizar UI e orquestrar interações do usuário.
