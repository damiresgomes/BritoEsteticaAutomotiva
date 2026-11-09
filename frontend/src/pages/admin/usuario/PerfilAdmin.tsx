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
  if (!usuario) {
    return <p className={styles.page} role="alert">{erro || "Perfil indisponível."}</p>;
  }
  return <FormularioPerfil usuario={usuario} />;
}

function FormularioPerfil({ usuario }: { usuario: PerfilAdmin }) {
  const { atualizarUsuario } = useUsuario();
  const [form, setForm] = useState({
    nome: usuario.nome,
    cpf: usuario.cpf ?? "",
    salario: usuario.salario === null ? "" : String(usuario.salario),
    datanascimento: usuario.datanascimento?.slice(0, 10) ?? "",
    senha: "",
    confirmarSenha: "",
  });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");
    setSucesso("");

    if (!usuario.usuarioId) {
      setErro("Não foi possível identificar o perfil administrativo.");
      return;
    }
    if (!form.nome.trim() || !form.datanascimento || !form.salario) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }
    if (!validarCpf(form.cpf)) {
      setErro("Informe um CPF válido.");
      return;
    }
    if (form.senha || form.confirmarSenha) {
      const erroSenha = validarNivelSenha(form.senha);
      if (erroSenha) {
        setErro(erroSenha);
        return;
      }
      if (form.senha !== form.confirmarSenha) {
        setErro("As senhas não coincidem.");
        return;
      }
    }

    try {
      await authService.atualizarPerfilAdmin({
        nome: form.nome.trim(),
        cpf: form.cpf,
        salario: Number(form.salario),
        datanascimento: form.datanascimento,
        ...(form.senha ? { senha: form.senha } : {}),
      });
      atualizarUsuario(await authService.buscarPerfil());
      setSucesso("Perfil atualizado com sucesso.");
      setForm((atual) => ({ ...atual, senha: "", confirmarSenha: "" }));
    } catch (erroApi) {
      setErro(obterMensagemErro(erroApi));
    }
  }

  return (
    <section className={styles.page}>
      <HeaderAdmin titulo="MEU PERFIL" links={[]} />
      <form className={styles.form} onSubmit={salvar}>
        <label className={styles.field}>
          Nome
          <input required maxLength={100} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        </label>
        <label className={styles.field}>
          Email (não pode ser alterado)
          <input value={usuario.email} readOnly />
        </label>
        <label className={styles.field}>
          CPF
          <input
            required
            inputMode="numeric"
            autoComplete="tax-id"
            maxLength={14}
            placeholder="000.000.000-00"
            value={form.cpf}
            onChange={(e) => setForm({ ...form, cpf: mascararCPF(e.target.value) })}
          />
        </label>
        <label className={styles.field}>
          Salário
          <input required type="number" min="0" step="0.01" value={form.salario} onChange={(e) => setForm({ ...form, salario: e.target.value })} />
        </label>
        <label className={styles.field}>
          Data de nascimento
          <input required type="date" value={form.datanascimento} onChange={(e) => setForm({ ...form, datanascimento: e.target.value })} />
        </label>
        <label className={styles.field}>
          Nova senha (opcional)
          <input type="password" autoComplete="new-password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} />
        </label>
        <label className={styles.field}>
          Confirme a nova senha
          <input type="password" autoComplete="new-password" value={form.confirmarSenha} onChange={(e) => setForm({ ...form, confirmarSenha: e.target.value })} />
        </label>
        {erro && <p className={styles.message} role="alert">{erro}</p>}
        {sucesso && <p role="status">{sucesso}</p>}
        <button type="submit">Salvar perfil</button>
      </form>
    </section>
  );
}
