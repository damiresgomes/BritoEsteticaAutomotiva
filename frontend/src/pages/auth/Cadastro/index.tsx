import styles from "./styles.module.css";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../../services/auth";
import { validarEmail } from "../../../utils/validadores";
import { obterMensagemErro } from "../../../utils/erros";

type FormularioCadastro = {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  confirmarSenha: string;
};

type ErrosFormulario = Partial<Record<keyof FormularioCadastro, string>>;

function mascararTelefone(valor: string): string {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);
  if (numeros.length <= 2) return numeros ? `(${numeros}` : "";
  if (numeros.length <= 6) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  if (numeros.length <= 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
  }
  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
}

export default function CadastroUsuario() {
  const navigate = useNavigate();
  const location = useLocation();
  const estado = location.state as {
    from?: { pathname?: string; search?: string; hash?: string };
  } | null;

  const [form, setForm] = useState<FormularioCadastro>({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    confirmarSenha: "",
  });

  const [erros, setErros] = useState<ErrosFormulario>({});
  const [erroApi, setErroApi] = useState("");
  const [carregando, setCarregando] = useState(false);

  function mudancaInput(evento: ChangeEvent<HTMLInputElement>) {
    const { name, value } = evento.target;
    const novoValor = name === "telefone" ? mascararTelefone(value) : value;

    setForm((anterior) => ({ ...anterior, [name]: novoValor }));
    setErros((anterior) => ({ ...anterior, [name]: undefined }));
  }

  function validar(): ErrosFormulario {
    const novosErros: ErrosFormulario = {};

    if (!form.nome.trim()) {
      novosErros.nome = "Informe seu nome.";
    } else if (form.nome.trim().length > 100) {
      novosErros.nome = "O nome deve ter no máximo 100 caracteres.";
    }

    if (!form.email.trim()) {
      novosErros.email = "Informe seu email.";
    } else if (!validarEmail(form.email)) {
      novosErros.email = "Email inválido.";
    }

    const telefoneNumerico = form.telefone.replace(/\D/g, "");
    if (!telefoneNumerico) {
      novosErros.telefone = "Informe seu telefone.";
    } else if (![10, 11].includes(telefoneNumerico.length)) {
      novosErros.telefone = "Informe um telefone com DDD e 10 ou 11 dígitos.";
    }

    if (!form.senha) {
      novosErros.senha = "Informe uma senha.";
    } else if (form.senha.length < 8) {
      novosErros.senha = "A senha deve ter no mínimo 8 caracteres.";
    } else if (!/[A-Z]/.test(form.senha)) {
      novosErros.senha = "A senha deve conter uma letra maiúscula.";
    } else if (!/[a-z]/.test(form.senha)) {
      novosErros.senha = "A senha deve conter uma letra minúscula.";
    } else if (!/[0-9]/.test(form.senha)) {
      novosErros.senha = "A senha deve conter um número.";
    } else if (!/[^A-Za-z0-9]/.test(form.senha)) {
      novosErros.senha = "A senha deve conter um símbolo.";
    }

    if (!form.confirmarSenha) {
      novosErros.confirmarSenha = "Confirme sua senha.";
    } else if (form.senha !== form.confirmarSenha) {
      novosErros.confirmarSenha = "As senhas não coincidem.";
    }

    return novosErros;
  }

  async function mudancaBotao(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErroApi("");

    const novosErros = validar();
    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) return;

    setCarregando(true);

    try {
      await authService.cadastrarCliente({
        nome: form.nome.trim(),
        email: form.email.trim(),
        senha: form.senha,
        telefone: form.telefone,
      });

      navigate("/autenticacao/login", {
        replace: true,
        state: { registrado: true, from: estado?.from },
      });
    } catch (erro) {
      setErroApi(obterMensagemErro(erro));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="cadastro-title">
        <p className={styles.eyebrow}>// NOVA CONTA</p>
        <h1 className={styles.title} id="cadastro-title">
          CRIAR CONTA
        </h1>
        <p className={styles.subtitle}>
          Preencha seus dados para se cadastrar.
        </p>

        <form className={styles.form} onSubmit={mudancaBotao} noValidate>
          <div className={styles.field}>
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              name="nome"
              autoComplete="name"
              value={form.nome}
              onChange={mudancaInput}
              aria-invalid={Boolean(erros.nome)}
              aria-describedby={erros.nome ? "nome-erro" : undefined}
              required
            />
            {erros.nome && (
              <span className={styles.fieldError} id="nome-erro">
                {erros.nome}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={mudancaInput}
              aria-invalid={Boolean(erros.email)}
              aria-describedby={erros.email ? "email-erro" : undefined}
              required
            />
            {erros.email && (
              <span className={styles.fieldError} id="email-erro">
                {erros.email}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="telefone">Telefone</label>
            <input
              id="telefone"
              name="telefone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={16}
              placeholder="(19) 98765-4321"
              value={form.telefone}
              onChange={mudancaInput}
              aria-invalid={Boolean(erros.telefone)}
              aria-describedby={erros.telefone ? "telefone-erro" : undefined}
              required
            />
            {erros.telefone && (
              <span className={styles.fieldError} id="telefone-erro">
                {erros.telefone}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              name="senha"
              type="password"
              autoComplete="new-password"
              maxLength={72}
              value={form.senha}
              onChange={mudancaInput}
              aria-invalid={Boolean(erros.senha)}
              aria-describedby={erros.senha ? "senha-erro" : undefined}
              required
            />
            {erros.senha && (
              <span className={styles.fieldError} id="senha-erro">
                {erros.senha}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmarSenha">Confirme sua senha</label>
            <input
              id="confirmarSenha"
              name="confirmarSenha"
              type="password"
              autoComplete="new-password"
              value={form.confirmarSenha}
              onChange={mudancaInput}
              aria-invalid={Boolean(erros.confirmarSenha)}
              aria-describedby={
                erros.confirmarSenha ? "confirmarSenha-erro" : undefined
              }
              required
            />
            {erros.confirmarSenha && (
              <span className={styles.fieldError} id="confirmarSenha-erro">
                {erros.confirmarSenha}
              </span>
            )}
          </div>

          {erroApi && (
            <p className={styles.apiError} role="alert">
              {erroApi}
            </p>
          )}

          <button
            className={styles.submitButton}
            type="submit"
            disabled={carregando}
          >
            {carregando ? "CADASTRANDO..." : "CADASTRAR"}
          </button>
        </form>

        <p className={styles.loginLink}>
          Já tem uma conta?{" "}
          <Link to="/autenticacao/login" state={{ from: estado?.from }}>
            Acesse o login
          </Link>
        </p>
      </section>
    </main>
  );
}
