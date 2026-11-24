import { useState, type FormEvent } from "react";
import HeaderAdmin from "../../../components/HeaderAdmin";
import styles from "../../../components/AdminCrud/styles.module.css";
import { useUsuario } from "../../../contexts/useUsuario";
import { authService, type PerfilAdmin } from "../../../services/auth";
import { mascararCPF, validarNivelSenha } from "../../../utils/cadastro";
import { obterMensagemErro } from "../../../utils/erros";
import { validarCpf } from "../../../utils/cpf";

export default function PerfilAdmin() {
  const { usuario, carregando, erro } = useUsuario();

  if (carregando) return <p className={styles.page}>Carregando perfil...</p>;
  // Condição: !usuario.
  if (!usuario) {
    // Retorna <p className={styles.page} role="alert">{erro || "Perfil indisponível."}</p>.
    return <p className={styles.page} role="alert">{erro || "Perfil indisponível."}</p>;
  }
  // Retorna <FormularioPerfil usuario={usuario} />.
  return <FormularioPerfil usuario={usuario} />;
}

function FormularioPerfil({ usuario }: { usuario: PerfilAdmin }) {
  const { atualizarUsuario } = useUsuario();
  // Estado React: [form, setForm] criado com useState; atualizar o setter causa re-render do componente.
  const [form, setForm] = useState({
    nome: usuario.nome,
    cpf: usuario.cpf ?? "",
    salario: usuario.salario === null ? "" : String(usuario.salario),
    datanascimento: usuario.datanascimento?.slice(0, 10) ?? "",
    senha: "",
    confirmarSenha: "",
  });
  // Estado React: [erro, setErro] criado com useState; atualizar o setter causa re-render do componente.
  const [erro, setErro] = useState("");
  // Estado React: [sucesso, setSucesso] criado com useState; atualizar o setter causa re-render do componente.
  const [sucesso, setSucesso] = useState("");

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    // Chamada: evento.preventDefault();.
    evento.preventDefault();
    // Chamada: setErro("");.
    setErro("");
    // Chamada: setSucesso("");.
    setSucesso("");

    // Condição: !usuario.usuarioId.
    if (!usuario.usuarioId) {
      // Chamada: setErro("Não foi possível identificar o perfil administrativo.");.
      setErro("Não foi possível identificar o perfil administrativo.");
      return;
    }
    // Condição: !form.nome.trim() || !form.datanascimento || !form.salario.
    if (!form.nome.trim() || !form.datanascimento || !form.salario) {
      // Chamada: setErro("Preencha todos os campos obrigatórios.");.
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }
    // Condição: !validarCpf(form.cpf).
    if (!validarCpf(form.cpf)) {
      // Chamada: setErro("Informe um CPF válido.");.
      setErro("Informe um CPF válido.");
      return;
    }
    // Condição: form.senha || form.confirmarSenha.
    if (form.senha || form.confirmarSenha) {
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

    // Bloco try: captura erros de chamadas assíncronas/rede/validação.
    try {
      // Aguarda operação assíncrona: authService.atualizarPerfilAdmin({.
      await authService.atualizarPerfilAdmin({
        nome: form.nome.trim(),
        cpf: form.cpf,
        salario: Number(form.salario),
        datanascimento: form.datanascimento,
        // Chamada: ...(form.senha ? { senha: form.senha } : {}),.
        ...(form.senha ? { senha: form.senha } : {}),
      });
      // Chamada: atualizarUsuario(await authService.buscarPerfil());.
      atualizarUsuario(await authService.buscarPerfil());
      // Chamada: setSucesso("Perfil atualizado com sucesso.");.
      setSucesso("Perfil atualizado com sucesso.");
      // Chamada: setForm((atual) => ({ ...atual, senha: "", confirmarSenha: "" }));.
      setForm((atual) => ({ ...atual, senha: "", confirmarSenha: "" }));
    } catch (erroApi) {
      // Chamada: setErro(obterMensagemErro(erroApi));.
      setErro(obterMensagemErro(erroApi));
    }
  }

  return (
    <section className={styles.pagina}>
      <HeaderAdmin titulo="MEU PERFIL" links={[]} />
      <form className={styles.formulario} onSubmit={salvar}>
        <label className={styles.campo}>
          Nome
          <input required maxLength={100} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        </label>
        <label className={styles.campo}>
          Email (não pode ser alterado)
          <input value={usuario.email} readOnly />
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
            // Atribuição: onChange={(e) => setForm({ ...form, cpf: mascararCPF(e.target.value) })}.
            onChange={(e) => setForm({ ...form, cpf: mascararCPF(e.target.value) })}
          />
        </label>
        <label className={styles.campo}>
          Salário
          <input required type="number" min="0" step="0.01" value={form.salario} onChange={(e) => setForm({ ...form, salario: e.target.value })} />
        </label>
        <label className={styles.campo}>
          Data de nascimento
          <input required type="date" value={form.datanascimento} onChange={(e) => setForm({ ...form, datanascimento: e.target.value })} />
        </label>
        <label className={styles.campo}>
          Nova senha (opcional)
          <input type="password" autoComplete="new-password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} />
        </label>
        <label className={styles.campo}>
          Confirme a nova senha
          <input type="password" autoComplete="new-password" value={form.confirmarSenha} onChange={(e) => setForm({ ...form, confirmarSenha: e.target.value })} />
        </label>
        {erro && <p className={styles.mensagem} role="alert">{erro}</p>}
        {sucesso && <p role="status">{sucesso}</p>}
        <button type="submit">Salvar perfil</button>
      </form>
    </section>
  );
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/admin/Usuario/PerfilAdmin.tsx) responsável por renderizar UI e orquestrar interações do usuário.
