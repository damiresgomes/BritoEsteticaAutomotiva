import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import HeaderAdmin from "../../../components/HeaderAdmin";
import styles from "../../../components/AdminCrud/styles.module.css";
import { userService } from "../../../services/users";
import { obterMensagemErro } from "../../../utils/erros";

type PropriedadesFormulario = { id?: number };

export default function FormularioUsuario({ id }: PropriedadesFormulario) {
  const [formulario, definirFormulario] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  const [carregando, definirCarregando] = useState(id !== undefined);
  const [erro, definirErro] = useState("");
  const [salvando, definirSalvando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id === undefined) return;
    userService.buscarPorId(id)
      .then((usuario) => {
        definirFormulario({
          nome: usuario.nome,
          email: usuario.email,
          senha: "",
          confirmarSenha: "",
        });
      })
      .catch((erroApi: unknown) => {
        definirErro(obterMensagemErro(erroApi));
      })
      .finally(() => definirCarregando(false));
  }, [id]);

  function atualizarCampo(evento: ChangeEvent<HTMLInputElement>) {
    const { name, value } = evento.target;
    definirFormulario((atual) => ({ ...atual, [name]: value }));
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    definirErro("");

    if (formulario.senha && formulario.senha !== formulario.confirmarSenha) {
      definirErro("As senhas não coincidem.");
      return;
    }

    definirSalvando(true);

    try {
      const dadosEnvio = {
        nome: formulario.nome.trim(),
        email: formulario.email.trim(),
        ...(formulario.senha ? { senha: formulario.senha } : {}),
      };

      if (id === undefined) {
        await userService.criar(dadosEnvio);
      } else {
        await userService.atualizar(id, dadosEnvio);
      }
      
      navigate("/admin/usuario");
    } catch (erroApi) {
      definirErro(obterMensagemErro(erroApi));
    } finally {
      definirSalvando(false);
    }
  }

  if (carregando) {
    return <section className={styles.pagina}><p>Carregando usuário...</p></section>;
  }

  return (
    <section className={styles.pagina}>
      <HeaderAdmin
        titulo={id === undefined ? "CADASTRAR USUÁRIO" : "EDITAR USUÁRIO"}
        links={[{ to: "/admin/usuario", label: "← VOLTAR AOS USUÁRIOS" }]}
      />
      <form className={styles.formulario} onSubmit={salvar}>
        <label className={styles.campo}>
          Nome
          <input
            required
            maxLength={100}
            name="nome"
            value={formulario.nome}
            onChange={atualizarCampo}
          />
        </label>

        <label className={styles.campo}>
          E-mail
          <input
            required
            type="email"
            maxLength={100}
            name="email"
            value={formulario.email}
            onChange={atualizarCampo}
          />
        </label>

        <label className={styles.campo}>
          {id === undefined ? "Senha" : "Nova senha (opcional)"}
          <input
            required={id === undefined}
            type="password"
            minLength={8}
            maxLength={72}
            name="senha"
            value={formulario.senha}
            onChange={atualizarCampo}
          />
        </label>

        <label className={styles.campo}>
          Confirme a senha
          <input
            required={id === undefined || Boolean(formulario.senha)}
            type="password"
            name="confirmarSenha"
            value={formulario.confirmarSenha}
            onChange={atualizarCampo}
          />
        </label>

        {id !== undefined && (
          <p>Deixe a senha vazia para manter a senha atual.</p>
        )}

        {erro && <p className={styles.mensagem} role="alert">{erro}</p>}

        <button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : id === undefined ? "Cadastrar usuário" : "Salvar alterações"}
        </button>
      </form>
    </section>
  );
}