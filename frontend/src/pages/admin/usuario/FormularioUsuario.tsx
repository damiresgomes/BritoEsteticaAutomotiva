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
  // Estado React: [formulario, definirFormulario] criado com useState; atualizar o setter causa re-render do componente.
  const [formulario, definirFormulario] = useState({
    nome: "",
    email: "",
    cpf: "",
    salario: "",
    datanascimento: "",
    senha: "",
    confirmarSenha: "",
  });

  // Estado React: [carregando, definirCarregando] criado com useState; atualizar o setter causa re-render do componente.
  const [carregando, definirCarregando] = useState(id !== undefined);
  // Estado React: [erro, definirErro] criado com useState; atualizar o setter causa re-render do componente.
  const [erro, definirErro] = useState("");
  // Estado React: [salvando, definirSalvando] criado com useState; atualizar o setter causa re-render do componente.
  const [salvando, definirSalvando] = useState(false);
  // Hook de navegação: 'navigate' permite redirecionar programaticamente.
  const navigate = useNavigate();

  // Efeito React: executa código colateral após render; dependências controlam quando reexecuta.
  useEffect(() => {
    if (id === undefined) return;
    // Chamada: userService.buscarPorId(id).
    userService.buscarPorId(id)
      // Chamada: .then((usuario) => {.
      .then((usuario) => {
        // Chamada: definirFormulario({.
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
      // Chamada: .catch((erroApi: unknown) => {.
      .catch((erroApi: unknown) => {
        // Chamada: definirErro(obterMensagemErro(erroApi));.
        definirErro(obterMensagemErro(erroApi));
      })
      // Chamada: .finally(() => definirCarregando(false));.
      .finally(() => definirCarregando(false));
  }, [id]);

  function atualizarCampo(evento: ChangeEvent<HTMLInputElement>) {
    const { name, value } = evento.target;
    // Chamada: definirFormulario((atual) => ({ ...atual, [name]: value }));.
    definirFormulario((atual) => ({ ...atual, [name]: value }));
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    // Chamada: evento.preventDefault();.
    evento.preventDefault();
    // Chamada: definirErro("");.
    definirErro("");

    // Condição: !formulario.nome.trim().
    if (!formulario.nome.trim()) {
      // Chamada: definirErro("Informe o nome.");.
      definirErro("Informe o nome.");
      return;
    }
    // Condição: !validarEmail(formulario.email).
    if (!validarEmail(formulario.email)) {
      // Chamada: definirErro("Informe um e-mail válido.");.
      definirErro("Informe um e-mail válido.");
      return;
    }
    // Condição: !validarCpf(formulario.cpf).
    if (!validarCpf(formulario.cpf)) {
      // Chamada: definirErro("Informe um CPF válido.");.
      definirErro("Informe um CPF válido.");
      return;
    }
    // Condição: formulario.salario === "" || Number(formulario.salario) < 0.
    if (formulario.salario === "" || Number(formulario.salario) < 0) {
      // Chamada: definirErro("Informe um salário válido.");.
      definirErro("Informe um salário válido.");
      return;
    }
    // Condição: !formulario.datanascimento.
    if (!formulario.datanascimento) {
      // Chamada: definirErro("Informe a data de nascimento.");.
      definirErro("Informe a data de nascimento.");
      return;
    }
    // Declara constante 'erroSenha'.
    const erroSenha = validarNivelSenha(formulario.senha);
    // Condição: erroSenha.
    if (erroSenha) {
      // Chamada: definirErro(erroSenha);.
      definirErro(erroSenha);
      return;
    }
    // Condição: formulario.senha !== formulario.confirmarSenha.
    if (formulario.senha !== formulario.confirmarSenha) {
      // Chamada: definirErro("As senhas não coincidem.");.
      definirErro("As senhas não coincidem.");
      return;
    }

    // Chamada: definirSalvando(true);.
    definirSalvando(true);

    // Declara constante 'dados'.
    const dados = {
      nome: formulario.nome.trim(),
      cpf: formulario.cpf,
      salario: Number(formulario.salario),
      datanascimento: formulario.datanascimento,
      senha: formulario.senha,
    };

    // Bloco try: captura erros de chamadas assíncronas/rede/validação.
    try {
      // Condição: id === undefined.
      if (id === undefined) {
        // Aguarda operação assíncrona: userService.criar({ ...dados, email: formulario.email.trim() });.
        await userService.criar({ ...dados, email: formulario.email.trim() });
      } else {
        // Aguarda operação assíncrona: userService.atualizar(id, dados);.
        await userService.atualizar(id, dados);
      }
      // Chamada: navigate("/admin/usuario");.
      navigate("/admin/usuario");
    } catch (erroApi) {
      // Chamada: definirErro(obterMensagemErro(erroApi));.
      definirErro(obterMensagemErro(erroApi));
    } finally {
      // Chamada: definirSalvando(false);.
      definirSalvando(false);
    }
  }

  // Condição: carregando.
  if (carregando) {
    // Retorna <section className={styles.pagina}><p>Carregando usuário...</p></section>.
    return <section className={styles.pagina}><p>Carregando usuário...</p></section>;
  }

  return (
    <section className={styles.pagina}>
      <HeaderAdmin
        // Atribuição: titulo={id === undefined ? "CADASTRAR USUÁRIO" : "EDITAR USUÁRIO"}.
        titulo={id === undefined ? "CADASTRAR USUÁRIO" : "EDITAR USUÁRIO"}
        // Atribuição: links={[{ to: "/admin/usuario", label: "← VOLTAR AOS USUÁRIOS" }]}.
        links={[{ to: "/admin/usuario", label: "← VOLTAR AOS USUÁRIOS" }]}
      />
      <form className={styles.formulario} onSubmit={salvar}>
        <label className={styles.campo}>
          Nome
          <input
            required
            // Atribuição: maxLength={100}.
            maxLength={100}
            // Atribuição: name="nome".
            name="nome"
            // Atribuição: value={formulario.nome}.
            value={formulario.nome}
            // Atribuição: onChange={atualizarCampo}.
            onChange={atualizarCampo}
          />
        </label>

        <label className={styles.campo}>
          E-mail
          <input
            required
            // Atribuição: type="email".
            type="email"
            // Atribuição: maxLength={100}.
            maxLength={100}
            // Atribuição: name="email".
            name="email"
            // Atribuição: value={formulario.email}.
            value={formulario.email}
            // Atribuição: onChange={atualizarCampo}.
            onChange={atualizarCampo}
            // Atribuição: readOnly={id !== undefined}.
            readOnly={id !== undefined}
          />
        </label>
        {id !== undefined && <p>O e-mail não pode ser alterado.</p>}

        <label className={styles.campo}>
          CPF
          <input
            required
            // Atribuição: inputMode="numeric".
            inputMode="numeric"
            // Atribuição: maxLength={14}.
            maxLength={14}
            // Atribuição: name="cpf".
            name="cpf"
            // Atribuição: value={formulario.cpf}.
            value={formulario.cpf}
            // Atribuição: onChange={(evento) =>.
            onChange={(evento) =>
              // Chamada: definirFormulario((atual) => ({.
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
            // Atribuição: type="number".
            type="number"
            // Atribuição: min="0".
            min="0"
            // Atribuição: step="0.01".
            step="0.01"
            // Atribuição: name="salario".
            name="salario"
            // Atribuição: value={formulario.salario}.
            value={formulario.salario}
            // Atribuição: onChange={atualizarCampo}.
            onChange={atualizarCampo}
          />
        </label>

        <label className={styles.campo}>
          Data de nascimento
          <input
            required
            // Atribuição: type="date".
            type="date"
            // Atribuição: name="datanascimento".
            name="datanascimento"
            // Atribuição: value={formulario.datanascimento}.
            value={formulario.datanascimento}
            // Atribuição: onChange={atualizarCampo}.
            onChange={atualizarCampo}
          />
        </label>

        <label className={styles.campo}>
          Senha
          <input
            required
            // Atribuição: type="password".
            type="password"
            // Atribuição: minLength={8}.
            minLength={8}
            // Atribuição: maxLength={72}.
            maxLength={72}
            // Atribuição: name="senha".
            name="senha"
            // Atribuição: value={formulario.senha}.
            value={formulario.senha}
            // Atribuição: onChange={atualizarCampo}.
            onChange={atualizarCampo}
          />
          <small>Use no mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo.</small>
        </label>

        <label className={styles.campo}>
          Confirme a senha
          <input
            required
            // Atribuição: type="password".
            type="password"
            // Atribuição: name="confirmarSenha".
            name="confirmarSenha"
            // Atribuição: value={formulario.confirmarSenha}.
            value={formulario.confirmarSenha}
            // Atribuição: onChange={atualizarCampo}.
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

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/admin/Usuario/FormularioUsuario.tsx) responsável por renderizar UI e orquestrar interações do usuário.
