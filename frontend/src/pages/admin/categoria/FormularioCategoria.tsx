import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import HeaderAdmin from "../../../components/HeaderAdmin";
import styles from "../../../components/AdminCrud/styles.module.css";
import { categoriaService } from "../../../services/categories";
import { obterMensagemErro } from "../../../utils/erros";

type Props = { id?: number };

export default function FormularioCategoria({ id }: Props) {
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (id === undefined) return;

    categoriaService
      .listar()
      .then((categorias) => {
        const categoria = categorias.find((item) => item.id_categoria === id);
        if (categoria) setNome(categoria.nome_categoria);
        else setErro("Categoria não encontrada.");
      })
      .catch((erroApi: unknown) => setErro(obterMensagemErro(erroApi)));
  }, [id]);

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");
    try {
      if (id === undefined) await categoriaService.criar(nome.trim());
      else await categoriaService.atualizar(id, nome.trim());
      navigate("/admin/categoria");
    } catch (erroApi) {
      setErro(obterMensagemErro(erroApi));
    }
  }

  return (
    <section className={styles.pagina}>
      <HeaderAdmin
        titulo={id === undefined ? "CADASTRAR CATEGORIA" : "EDITAR CATEGORIA"}
        links={[{ to: "/admin/categoria", label: "← VOLTAR ÀS CATEGORIAS" }]}
      />
      <form className={styles.formulario} onSubmit={salvar}>
        <label className={styles.campo}>
          Nome da categoria
          <input
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
            maxLength={100}
            required
          />
        </label>
        {erro && <p className={styles.mensagem} role="alert">{erro}</p>}
        <button type="submit">{id === undefined ? "Cadastrar" : "Salvar"}</button>
      </form>
    </section>
  );
}
