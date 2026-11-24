import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import HeaderAdmin from "../../../components/HeaderAdmin";
import styles from "../../../components/AdminCrud/styles.module.css";
import { categoriaService } from "../../../services/categories";
import { obterMensagemErro } from "../../../utils/erros";

type Props = { id?: number };

export default function FormularioCategoria({ id }: Props) {
  // Estado React: [nome, setNome] criado com useState; atualizar o setter causa re-render do componente.
  const [nome, setNome] = useState("");
  // Estado React: [erro, setErro] criado com useState; atualizar o setter causa re-render do componente.
  const [erro, setErro] = useState("");
  // Hook de navegação: 'navigate' permite redirecionar programaticamente.
  const navigate = useNavigate();

  // Efeito React: executa código colateral após render; dependências controlam quando reexecuta.
  useEffect(() => {
    if (id === undefined) return;

    categoriaService
      // Chamada: .listar().
      .listar()
      // Chamada: .then((categorias) => {.
      .then((categorias) => {
        // Declara constante 'categoria'.
        const categoria = categorias.find((item) => item.id_categoria === id);
        if (categoria) setNome(categoria.nome_categoria);
        // Caminho alternativo quando condições anteriores não são atendidas.
        else setErro("Categoria não encontrada.");
      })
      // Chamada: .catch((erroApi: unknown) => setErro(obterMensagemErro(erroApi)));.
      .catch((erroApi: unknown) => setErro(obterMensagemErro(erroApi)));
  }, [id]);

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    // Chamada: evento.preventDefault();.
    evento.preventDefault();
    // Chamada: setErro("");.
    setErro("");
    // Bloco try: captura erros de chamadas assíncronas/rede/validação.
    try {
      if (id === undefined) await categoriaService.criar(nome.trim());
      // Caminho alternativo quando condições anteriores não são atendidas.
      else await categoriaService.atualizar(id, nome.trim());
      // Chamada: navigate("/admin/categoria");.
      navigate("/admin/categoria");
    } catch (erroApi) {
      // Chamada: setErro(obterMensagemErro(erroApi));.
      setErro(obterMensagemErro(erroApi));
    }
  }

  return (
    <section className={styles.pagina}>
      <HeaderAdmin
        // Atribuição: titulo={id === undefined ? "CADASTRAR CATEGORIA" : "EDITAR CATEGORIA"}.
        titulo={id === undefined ? "CADASTRAR CATEGORIA" : "EDITAR CATEGORIA"}
        // Atribuição: links={[{ to: "/admin/categoria", label: "← VOLTAR ÀS CATEGORIAS" }]}.
        links={[{ to: "/admin/categoria", label: "← VOLTAR ÀS CATEGORIAS" }]}
      />
      <form className={styles.formulario} onSubmit={salvar}>
        <label className={styles.campo}>
          Nome da categoria
          <input
            // Atribuição: value={nome}.
            value={nome}
            // Atribuição: onChange={(evento) => setNome(evento.target.value)}.
            onChange={(evento) => setNome(evento.target.value)}
            // Atribuição: maxLength={100}.
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

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/admin/Categoria/FormularioCategoria.tsx) responsável por renderizar UI e orquestrar interações do usuário.
