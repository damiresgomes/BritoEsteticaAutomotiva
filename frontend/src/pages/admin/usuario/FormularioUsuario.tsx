import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import HeaderAdmin from "../../../components/HeaderAdmin";
import styles from "../../../components/AdminCrud/styles.module.css";
import { userService } from "../../../services/users";
import { validarNivelSenha } from "../../../utils/cadastro";
import { mascararCPF, validarCpf } from "../../../utils/cpf";
import { obterMensagemErro } from "../../../utils/erros";
import { validarEmail } from "../../../utils/validarEmail";

type PropriedadesFormulario = { id?: number };

export default function FormularioUsuario({ id }: PropriedadesFormulario) {
  const [formulario, definirFormulario] = useState({
    nome: "",
    email: "",
    cpf: "",
    salario: "",
    datanascimento: "",
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
          cpf: usuario.cpf ?? "",
          salario: usuario.salario !== undefined ? String(usuario.salario) : "",
          datanascimento: usuario.datanascimento ?? "",
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

    if (!formulario.nome.trim()) {
      definirErro("Informe o nome.");
      return;
    }
    if (!validarEmail(formulario.email)) {
      definirErro("Informe um e-mail válido.");
      return;
    }
    if (!validarCpf(formulario.cpf)) {
      definirErro("Informe um CPF válido.");
      return;
    }
    if (formulario.salario === "" || Number(formulario.salario) < 0) {
      definirErro("Informe um salário válido.");
      return;
    }
    if (!formulario.datanascimento) {
      definirErro("Informe a data de nascimento.");
      return;
    }
    const erroSenha = validarNivelSenha(formulario.senha);
    if (erroSenha) {
      definirErro(erroSenha);
      return;
    }
    if (formulario.senha !== formulario.confirmarSenha) {
      definirErro("As senhas não coincidem.");
      return;
    }

    definirSalvando(true);

    const dados = {
      nome: formulario.nome.trim(),
      cpf: formulario.cpf,
      salario: Number(formulario.salario),
      datanascimento: formulario.datanascimento,
      senha: formulario.senha,
    };

    try {
      if (id === undefined) {
        await userService.criar({ ...dados, email: formulario.email.trim() });
      } else {
        await userService.atualizar(id, dados);
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
            readOnly={id !== undefined}
          />
        </label>
        {id !== undefined && <p>O e-mail não pode ser alterado.</p>}

        <label className={styles.campo}>
          CPF
          <input
            required
            inputMode="numeric"
            maxLength={14}
            name="cpf"
            value={formulario.cpf}
            onChange={(evento) =>
              definirFormulario((atual) => ({
                ...atual,
                cpf: mascararCPF(evento.target.value),
              }))
            }
          />
        </label>

        <label className={styles.campo}>
          Salário
          <input
            required
            type="number"
            min="0"
            step="0.01"
            name="salario"
            value={formulario.salario}
            onChange={atualizarCampo}
          />
        </label>

        <label className={styles.campo}>
          Data de nascimento
          <input
            required
            type="date"
            name="datanascimento"
            value={formulario.datanascimento}
            onChange={atualizarCampo}
          />
        </label>

        <label className={styles.campo}>
          Senha
          <input
            required
            type="password"
            minLength={8}
            maxLength={72}
            name="senha"
            value={formulario.senha}
            onChange={atualizarCampo}
          />
          <small>Use no mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo.</small>
        </label>

        <label className={styles.campo}>
          Confirme a senha
          <input
            required
            type="password"
            name="confirmarSenha"
            value={formulario.confirmarSenha}
            onChange={atualizarCampo}
          />
        </label>

        {erro && <p className={styles.mensagem} role="alert">{erro}</p>}

        <button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : id === undefined ? "Cadastrar usuário" : "Salvar alterações"}
        </button>
      </form>
    </section>
  );
}
