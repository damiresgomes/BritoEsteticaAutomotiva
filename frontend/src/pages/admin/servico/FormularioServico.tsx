import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import HeaderAdmin from "../../../components/HeaderAdmin";
import styles from "../../../components/AdminCrud/styles.module.css";
import { categoriaService, type Categoria } from "../../../services/categories";
import { servicoService, type Servico } from "../../../services/services";
import { obterMensagemErro } from "../../../utils/erros";

type Props = { id?: number };

export default function FormularioServico({ id }: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState({
    nome_servico: "",
    descricao: "",
    preco: "",
    duracao_horas: "",
    id_categoria: "",
  });
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    categoriaService
      .listar()
      .then(setCategorias)
      .catch((erroApi: unknown) => setErro(obterMensagemErro(erroApi)));

    if (id === undefined) return;
    servicoService
      .listarTodos()
      .then((servicos) => {
        const servico = servicos.find((item) => item.id_servico === id);
        if (servico) {
          setForm({
            nome_servico: servico.nome_servico,
            descricao: servico.descricao,
            preco: String(servico.preco),
            duracao_horas: String(servico.duracao_horas),
            id_categoria: String(servico.id_categoria),
          });
        } else {
          setErro("Serviço não encontrado.");
        }
      })
      .catch((erroApi: unknown) => setErro(obterMensagemErro(erroApi)));
  }, [id]);

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");
    const dados: Omit<Servico, "id_servico"> = {
      nome_servico: form.nome_servico.trim(),
      descricao: form.descricao.trim(),
      preco: Number(form.preco),
      duracao_horas: Number(form.duracao_horas),
      id_categoria: Number(form.id_categoria),
    };

    try {
      if (id === undefined) await servicoService.criar(dados);
      else await servicoService.atualizar(id, dados);
      navigate("/admin/servico");
    } catch (erroApi) {
      setErro(obterMensagemErro(erroApi));
    }
  }

  return (
    <section className={styles.pagina}>
      <HeaderAdmin
        titulo={id === undefined ? "CADASTRAR SERVIÇO" : "EDITAR SERVIÇO"}
        links={[{ to: "/admin/servico", label: "← VOLTAR AOS SERVIÇOS" }]}
      />
      <form className={styles.formulario} onSubmit={salvar}>
        <label className={styles.campo}>
          Nome
          <input required maxLength={100} value={form.nome_servico} onChange={(e) => setForm({ ...form, nome_servico: e.target.value })} />
        </label>
        <label className={styles.campo}>
          Descrição
          <textarea required value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
        </label>
        <label className={styles.campo}>
          Preço
          <input required type="number" min="0.01" step="0.01" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} />
        </label>
        <label className={styles.campo}>
          Duração (horas)
          <input required type="number" min="0.01" step="0.01" value={form.duracao_horas} onChange={(e) => setForm({ ...form, duracao_horas: e.target.value })} />
        </label>
        <label className={styles.campo}>
          Categoria
          <select required value={form.id_categoria} onChange={(e) => setForm({ ...form, id_categoria: e.target.value })}>
            <option value="">Selecione</option>
            {categorias.map((categoria) => (
              <option key={categoria.id_categoria} value={categoria.id_categoria}>{categoria.nome_categoria}</option>
            ))}
          </select>
        </label>
        {erro && <p className={styles.mensagem} role="alert">{erro}</p>}
        <button type="submit">{id === undefined ? "Cadastrar" : "Salvar"}</button>
      </form>
    </section>
  );
}
