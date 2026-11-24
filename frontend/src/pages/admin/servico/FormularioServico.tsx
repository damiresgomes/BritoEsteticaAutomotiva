import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import HeaderAdmin from "../../../components/HeaderAdmin";
import styles from "../../../components/AdminCrud/styles.module.css";
import { categoriaService, type Categoria } from "../../../services/categories";
import { servicoService, type Servico } from "../../../services/services";
import { obterMensagemErro } from "../../../utils/erros";

type Props = { id?: number };

export default function FormularioServico({ id }: Props) {
  // Estado React: [categorias, setCategorias] criado com useState; atualizar o setter causa re-render do componente.
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  // Estado React: [form, setForm] criado com useState; atualizar o setter causa re-render do componente.
  const [form, setForm] = useState({
    nome_servico: "",
    descricao: "",
    preco: "",
    duracao_horas: "",
    id_categoria: "",
  });
  // Estado React: [erro, setErro] criado com useState; atualizar o setter causa re-render do componente.
  const [erro, setErro] = useState("");
  // Hook de navegação: 'navigate' permite redirecionar programaticamente.
  const navigate = useNavigate();

  // Efeito React: executa código colateral após render; dependências controlam quando reexecuta.
  useEffect(() => {
    categoriaService
      // Chamada: .listar().
      .listar()
      // Chamada: .then(setCategorias).
      .then(setCategorias)
      // Chamada: .catch((erroApi: unknown) => setErro(obterMensagemErro(erroApi)));.
      .catch((erroApi: unknown) => setErro(obterMensagemErro(erroApi)));

    if (id === undefined) return;
    servicoService
      // Chamada: .listarTodos().
      .listarTodos()
      // Chamada: .then((servicos) => {.
      .then((servicos) => {
        // Declara constante 'servico'.
        const servico = servicos.find((item) => item.id_servico === id);
        // Condição: servico.
        if (servico) {
          // Chamada: setForm({.
          setForm({
            nome_servico: servico.nome_servico,
            descricao: servico.descricao,
            preco: String(servico.preco),
            duracao_horas: String(servico.duracao_horas),
            id_categoria: String(servico.id_categoria),
          });
        } else {
          // Chamada: setErro("Serviço não encontrado.");.
          setErro("Serviço não encontrado.");
        }
      })
      // Chamada: .catch((erroApi: unknown) => setErro(obterMensagemErro(erroApi)));.
      .catch((erroApi: unknown) => setErro(obterMensagemErro(erroApi)));
  }, [id]);

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    // Chamada: evento.preventDefault();.
    evento.preventDefault();
    // Chamada: setErro("");.
    setErro("");
    const dados: Omit<Servico, "id_servico"> = {
      nome_servico: form.nome_servico.trim(),
      descricao: form.descricao.trim(),
      preco: Number(form.preco),
      duracao_horas: Number(form.duracao_horas),
      id_categoria: Number(form.id_categoria),
    };

    // Bloco try: captura erros de chamadas assíncronas/rede/validação.
    try {
      if (id === undefined) await servicoService.criar(dados);
      // Caminho alternativo quando condições anteriores não são atendidas.
      else await servicoService.atualizar(id, dados);
      // Chamada: navigate("/admin/servico");.
      navigate("/admin/servico");
    } catch (erroApi) {
      // Chamada: setErro(obterMensagemErro(erroApi));.
      setErro(obterMensagemErro(erroApi));
    }
  }

  return (
    <section className={styles.pagina}>
      <HeaderAdmin
        // Atribuição: titulo={id === undefined ? "CADASTRAR SERVIÇO" : "EDITAR SERVIÇO"}.
        titulo={id === undefined ? "CADASTRAR SERVIÇO" : "EDITAR SERVIÇO"}
        // Atribuição: links={[{ to: "/admin/servico", label: "← VOLTAR AOS SERVIÇOS" }]}.
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

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/admin/Servico/FormularioServico.tsx) responsável por renderizar UI e orquestrar interações do usuário.
