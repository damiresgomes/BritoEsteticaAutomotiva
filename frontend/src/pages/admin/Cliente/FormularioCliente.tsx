import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import HeaderAdmin from "../../../components/HeaderAdmin";
import styles from "../../../components/AdminCrud/styles.module.css";
import { clienteService } from "../../../services/clients";
import { validarNivelSenha } from "../../../utils/cadastro";
import { mascararCPF, validarCpf } from "../../../utils/cpf";
import { obterMensagemErro } from "../../../utils/erros";
import { validarEmail } from "../../../utils/validarEmail";

type Props = { id?: number };

export default function FormularioCliente({ id }: Props) {
  // Estado React: [form, setForm] criado com useState; atualizar o setter causa re-render do componente.
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    senha: "",
    confirmarSenha: "",
  });
  // Estado React: [temConta, setTemConta] criado com useState; atualizar o setter causa re-render do componente.
  const [temConta, setTemConta] = useState(id === undefined);
  // Estado React: [carregando, setCarregando] criado com useState; atualizar o setter causa re-render do componente.
  const [carregando, setCarregando] = useState(id !== undefined);
  // Estado React: [falhaCarregamento, setFalhaCarregamento] criado com useState; atualizar o setter causa re-render do componente.
  const [falhaCarregamento, setFalhaCarregamento] = useState(false);
  // Estado React: [erro, setErro] criado com useState; atualizar o setter causa re-render do componente.
  const [erro, setErro] = useState("");
  // Hook de navegação: 'navigate' permite redirecionar programaticamente.
  const navigate = useNavigate();
  // Declara constante 'senhaObrigatoria'.
  const senhaObrigatoria = id === undefined || !temConta;

  // Efeito React: executa código colateral após render; dependências controlam quando reexecuta.
  useEffect(() => {
    if (id === undefined) return;
    // Chamada: clienteService.buscarPorId(id).
    clienteService.buscarPorId(id)
      // Chamada: .then((cliente) => {.
      .then((cliente) => {
        // Chamada: setForm({.
        setForm({
          nome: cliente.nome,
          cpf: cliente.cpf ?? "",
          email: cliente.email ?? "",
          telefone: cliente.telefone ?? "",
          senha: "",
          confirmarSenha: "",
        });
        // Chamada: setTemConta(cliente.status !== "Sem conta");.
        setTemConta(cliente.status !== "Sem conta");
      })
      // Chamada: .catch((erroApi: unknown) => {.
      .catch((erroApi: unknown) => {
        // Chamada: setErro(obterMensagemErro(erroApi));.
        setErro(obterMensagemErro(erroApi));
        // Chamada: setFalhaCarregamento(true);.
        setFalhaCarregamento(true);
      })
      // Chamada: .finally(() => setCarregando(false));.
      .finally(() => setCarregando(false));
  }, [id]);

  function atualizarCampo(campo: keyof typeof form, valor: string) {
    // Chamada: setForm((atual) => ({ ...atual, [campo]: valor }));.
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    // Chamada: evento.preventDefault();.
    evento.preventDefault();
    // Chamada: setErro("");.
    setErro("");

    // Condição: !form.nome.trim().
    if (!form.nome.trim()) {
      // Chamada: setErro("Informe o nome.");.
      setErro("Informe o nome.");
      return;
    }
    // Condição: !validarCpf(form.cpf).
    if (!validarCpf(form.cpf)) {
      // Chamada: setErro("Informe um CPF válido.");.
      setErro("Informe um CPF válido.");
      return;
    }
    // Condição: !validarEmail(form.email).
    if (!validarEmail(form.email)) {
      // Chamada: setErro("Informe um e-mail válido.");.
      setErro("Informe um e-mail válido.");
      return;
    }
    // Condição: form.telefone.replace(/\D/g, "").length < 10.
    if (form.telefone.replace(/\D/g, "").length < 10) {
      // Chamada: setErro("Informe um telefone com DDD.");.
      setErro("Informe um telefone com DDD.");
      return;
    }

    // Condição: senhaObrigatoria || form.senha.
    if (senhaObrigatoria || form.senha) {
      // Declara constante 'erroSenha'.
      const erroSenha = validarNivelSenha(form.senha);
      // Condição: erroSenha.
      if (erroSenha) {
        // Chamada: setErro(erroSenha);.
        setErro(erroSenha);
        return;
      }
      // Condição: form.senha !== form.confirmarSenha.
      if (form.senha !== form.confirmarSenha) {
        // Chamada: setErro("As senhas não coincidem.");.
        setErro("As senhas não coincidem.");
        return;
      }
    }

    // Declara constante 'dados'.
    const dados = {
      nome: form.nome.trim(),
      cpf: form.cpf,
      email: form.email.trim(),
      telefone: form.telefone,
      // Chamada: ...(form.senha ? { senha: form.senha } : {}),.
      ...(form.senha ? { senha: form.senha } : {}),
    };

    // Bloco try: captura erros de chamadas assíncronas/rede/validação.
    try {
      if (id === undefined) await clienteService.criar(dados);
      // Caminho alternativo quando condições anteriores não são atendidas.
      else await clienteService.atualizar(id, dados);
      // Chamada: navigate("/admin/cliente");.
      navigate("/admin/cliente");
    } catch (erroApi) {
      // Chamada: setErro(obterMensagemErro(erroApi));.
      setErro(obterMensagemErro(erroApi));
    }
  }

  // Condição: carregando.
  if (carregando) {
    // Retorna <section className={styles.pagina}><p>Carregando cliente...</p></section>.
    return <section className={styles.pagina}><p>Carregando cliente...</p></section>;
  }

  // Condição: falhaCarregamento.
  if (falhaCarregamento) {
    return (
      <section className={styles.pagina}>
        <HeaderAdmin
          // Atribuição: titulo="EDITAR CLIENTE".
          titulo="EDITAR CLIENTE"
          // Atribuição: links={[{ to: "/admin/cliente", label: "← VOLTAR AOS CLIENTES" }]}.
          links={[{ to: "/admin/cliente", label: "← VOLTAR AOS CLIENTES" }]}
        />
        <p className={styles.mensagem} role="alert">{erro}</p>
      </section>
    );
  }

  return (
    <section className={styles.pagina}>
      <HeaderAdmin
        // Atribuição: titulo={id === undefined ? "CADASTRAR CLIENTE" : "EDITAR CLIENTE"}.
        titulo={id === undefined ? "CADASTRAR CLIENTE" : "EDITAR CLIENTE"}
        // Atribuição: links={[{ to: "/admin/cliente", label: "← VOLTAR AOS CLIENTES" }]}.
        links={[{ to: "/admin/cliente", label: "← VOLTAR AOS CLIENTES" }]}
      />
      <form className={styles.formulario} onSubmit={salvar}>
        <label className={styles.campo}>
          Nome
          <input
            required
            // Atribuição: maxLength={100}.
            maxLength={100}
            // Atribuição: value={form.nome}.
            value={form.nome}
            // Atribuição: onChange={(evento) => atualizarCampo("nome", evento.target.value)}.
            onChange={(evento) => atualizarCampo("nome", evento.target.value)}
          />
        </label>
        <label className={styles.campo}>
          CPF
          <input
            required
            // Atribuição: inputMode="numeric".
            inputMode="numeric"
            // Atribuição: autoComplete="tax-id".
            autoComplete="tax-id"
            // Atribuição: maxLength={14}.
            maxLength={14}
            // Atribuição: placeholder="000.000.000-00".
            placeholder="000.000.000-00"
            // Atribuição: value={form.cpf}.
            value={form.cpf}
            // Atribuição: onChange={(evento) => atualizarCampo("cpf", mascararCPF(evento.target.value))}.
            onChange={(evento) => atualizarCampo("cpf", mascararCPF(evento.target.value))}
          />
        </label>
        <label className={styles.campo}>
          E-mail de acesso
          <input
            required
            // Atribuição: type="email".
            type="email"
            // Atribuição: maxLength={100}.
            maxLength={100}
            // Atribuição: value={form.email}.
            value={form.email}
            // Atribuição: onChange={(evento) => atualizarCampo("email", evento.target.value)}.
            onChange={(evento) => atualizarCampo("email", evento.target.value)}
          />
        </label>
        <label className={styles.campo}>
          Telefone
          <input
            required
            // Atribuição: type="tel".
            type="tel"
            // Atribuição: maxLength={20}.
            maxLength={20}
            // Atribuição: value={form.telefone}.
            value={form.telefone}
            // Atribuição: onChange={(evento) => atualizarCampo("telefone", evento.target.value)}.
            onChange={(evento) => atualizarCampo("telefone", evento.target.value)}
          />
        </label>
        <label className={styles.campo}>
          {id === undefined || !temConta ? "Senha inicial" : "Nova senha (opcional)"}
          <input
            // Atribuição: required={senhaObrigatoria}.
            required={senhaObrigatoria}
            // Atribuição: type="password".
            type="password"
            // Atribuição: minLength={8}.
            minLength={8}
            // Atribuição: maxLength={72}.
            maxLength={72}
            // Atribuição: autoComplete="new-password".
            autoComplete="new-password"
            // Atribuição: value={form.senha}.
            value={form.senha}
            // Atribuição: onChange={(evento) => atualizarCampo("senha", evento.target.value)}.
            onChange={(evento) => atualizarCampo("senha", evento.target.value)}
          />
          <small>
            Use no mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo.
          </small>
        </label>
        <label className={styles.campo}>
          Confirme a senha
          <input
            // Atribuição: required={senhaObrigatoria || Boolean(form.senha)}.
            required={senhaObrigatoria || Boolean(form.senha)}
            // Atribuição: type="password".
            type="password"
            // Atribuição: autoComplete="new-password".
            autoComplete="new-password"
            // Atribuição: value={form.confirmarSenha}.
            value={form.confirmarSenha}
            // Atribuição: onChange={(evento) => atualizarCampo("confirmarSenha", evento.target.value)}.
            onChange={(evento) => atualizarCampo("confirmarSenha", evento.target.value)}
          />
        </label>
        {id !== undefined && !temConta && (
          <p>Este cliente ainda não tem conta. Informe e-mail e senha para criar o acesso.</p>
        )}
        {id !== undefined && temConta && (
          <p>Deixe a senha vazia para manter a senha atual.</p>
        )}
        {erro && <p className={styles.mensagem} role="alert">{erro}</p>}
        <button type="submit">{id === undefined ? "Cadastrar cliente" : "Salvar alterações"}</button>
      </form>
    </section>
  );
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/admin/Cliente/FormularioCliente.tsx) responsável por renderizar UI e orquestrar interações do usuário.
