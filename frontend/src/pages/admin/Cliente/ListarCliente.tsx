import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import HeaderAdmin from "../../../components/HeaderAdmin";
import Paginacao from "../../../components/Paginacao";
import styles from "../../../components/AdminCrud/styles.module.css";
import { clienteService, type ClienteAdmin } from "../../../services/clients";
import { obterMensagemErro } from "../../../utils/erros";

const POR_PAGINA = 8;

export default function ListarCliente() {
  const [clientes, setClientes] = useState<ClienteAdmin[]>([]);
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  function carregar() {
    clienteService.listar()
      .then((lista) => {
        setClientes(lista);
        setErro("");
      })
      .catch((erroApi: unknown) => setErro(obterMensagemErro(erroApi)))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar();
  }, []);

  const totalPaginas = Math.max(1, Math.ceil(clientes.length / POR_PAGINA));
  const visiveis = useMemo(
    () => clientes.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA),
    [clientes, pagina]
  );

  async function excluir(cliente: ClienteAdmin) {
    const acao = cliente.status === "Sem conta" ? "remover" : "desativar o acesso de";
    if (!window.confirm(`Deseja ${acao} ${cliente.nome}? O histórico de agendamentos será preservado.`)) return;
    setErro("");
    try {
      await clienteService.excluir(cliente.id);
      carregar();
    } catch (erroApi) {
      setErro(obterMensagemErro(erroApi));
    }
  }

  async function ativar(cliente: ClienteAdmin) {
    setErro("");
    try {
      await clienteService.ativar(cliente.id);
      carregar();
    } catch (erroApi) {
      setErro(obterMensagemErro(erroApi));
    }
  }

  return (
    <section className={styles.pagina}>
      <HeaderAdmin
        titulo="CLIENTES"
        links={[
          { to: "/admin/cliente", label: "☰ LISTAR CLIENTES" },
          { to: "/admin/cliente/cadastrar", label: "+ CADASTRAR CLIENTE" },
        ]}
      />
      {erro && <p className={styles.mensagem} role="alert">{erro}</p>}
      {carregando ? (
        <p>Carregando clientes...</p>
      ) : (
        <>
          <div className={styles.divTabela}>
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Telefone</th>
                  <th>Acesso</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>{cliente.nome}</td>
                    <td>{cliente.email ?? "—"}</td>
                    <td>{cliente.telefone ?? "—"}</td>
                    <td>{cliente.status}</td>
                    <td>
                      <Link to={`/admin/cliente/editar/${cliente.id}`}>Editar</Link>
                      {cliente.status === "Inativo" ? (
                        <button type="button" onClick={() => void ativar(cliente)}>Ativar</button>
                      ) : (
                        <button type="button" onClick={() => void excluir(cliente)}>
                          {cliente.status === "Sem conta" ? "Remover" : "Desativar"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!clientes.length && (
                  <tr>
                    <td colSpan={5}>
                      {erro ? "Não foi possível carregar os clientes." : "Nenhum cliente cadastrado."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Paginacao pagina={pagina} totalPaginas={totalPaginas} aoMudarPagina={setPagina} />
        </>
      )}
    </section>
  );
}
