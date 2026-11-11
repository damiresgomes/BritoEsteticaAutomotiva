import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import HeaderAdmin from "../../../components/HeaderAdmin";
import Paginacao from "../../../components/Paginacao";
import { servicoService, type Servico } from "../../../services/services";
import { obterMensagemErro } from "../../../utils/erros";
import styles from "../../../components/AdminCrud/styles.module.css";

export default function ListarServico() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [pagina, setPagina] = useState(1);
  const [erro, setErro] = useState("");
  const porPagina = 6;

  useEffect(() => {
    servicoService
      .listarTodos()
      .then(setServicos)
      .catch((erroApi: unknown) => setErro(obterMensagemErro(erroApi)));
  }, []);

  const totalPaginas = Math.max(1, Math.ceil(servicos.length / porPagina));
  const servicosVisiveis = useMemo(
    () => servicos.slice((pagina - 1) * porPagina, pagina * porPagina),
    [servicos, pagina]
  );

  async function excluir(id: number) {
    if (!window.confirm("Deseja excluir este serviço?")) return;
    try {
      await servicoService.excluir(id);
      const atualizados = await servicoService.listarTodos();
      setServicos(atualizados);
      setPagina((atual) =>
        Math.min(atual, Math.max(1, Math.ceil(atualizados.length / porPagina)))
      );
    } catch (erroApi) {
      setErro(obterMensagemErro(erroApi));
    }
  }

  return (
    <section className={styles.pagina}>
      <HeaderAdmin
        titulo="SERVIÇOS"
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
            {servicosVisiveis.map((servico) => (
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