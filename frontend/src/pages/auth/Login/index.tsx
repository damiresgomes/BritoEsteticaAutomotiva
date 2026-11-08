import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { ChangeEvent, FormEvent } from "react";
import { isAxiosError } from "axios";
import { authService } from "../../../services/auth";
import styles from "./styles.module.css/styles.module.css";
import { validarEmail } from "../../../utils/validadores";

type EstadoNavegacao = {
  from?: {
    pathname?: string;
    search?: string;
    hash?: string;
  };
  registrado?: boolean;
};

type CampoLogin = "email" | "senha";

const ShieldIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const LockIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const LoginIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <path d="m10 17 5-5-5-5" />
    <path d="M15 12H3" />
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [erros, setErros] = useState<Partial<Record<CampoLogin, string>>>({});
  const [erro, setErro] = useState<string>("");
  const [carregando, setCarregando] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const estado = (location.state as EstadoNavegacao | null) ?? null;
  const papelEsperado = location.pathname === "/admin/login" ? "admin" : "cliente";

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === "email") setEmail(value);
    if (name === "senha") setSenha(value);
    setErros((atuais) => ({
      ...atuais,
      ...(name === "email" ? { email: undefined } : { senha: undefined }),
    }));
    setErro("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro("");
    const novosErros: Partial<Record<CampoLogin, string>> = {};

    if (!email.trim()) {
      novosErros.email = "Informe seu email.";
    } else if (!validarEmail(email)) {
      novosErros.email = "Informe um email válido.";
    }

    if (!senha.trim()) {
      novosErros.senha = "Informe sua senha.";
    }

    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setCarregando(true);

    try {
      await authService.login({ email: email.trim(), senha }, papelEsperado);

      if (!authService.isAuthenticated(papelEsperado)) {
        setErro("Resposta inválida do servidor.");
        return;
      }

      const caminho = estado?.from?.pathname;
      const destinoSolicitado =
        caminho?.startsWith("/") &&
        !caminho.startsWith("//") &&
        !["/autenticacao/login", "/autenticacao/cadastro", "/admin/login"].includes(caminho)
          ? `${caminho}${estado?.from?.search ?? ""}${estado?.from?.hash ?? ""}`
          : undefined;
      const destinoPadrao = papelEsperado === "admin" ? "/admin" : "/";

      navigate(destinoSolicitado ?? destinoPadrao, { replace: true });
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        setErro(err.response.data?.message ?? "Email ou senha incorretos.");
      } else if (err instanceof Error) {
        setErro(err.message);
      } else {
        setErro("Não foi possível conectar ao servidor. Tente novamente.");
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className={styles.loginPage}>
      <header className={styles.loginHeader}>
        <span className={styles.loginEyebrow}>
          <ShieldIcon />
          <span>// ÁREA DE LOGIN</span>
        </span>

        <h1 className={styles.loginTitle}>
          ENTRAR NO <span className={styles.loginTitleAccent}>PAINEL</span>
        </h1>

        <p className={styles.loginSubtitle}>Área exclusiva de usuários.</p>
      </header>

      <section className={styles.loginCard}>
        <div className={styles.loginCardHeader}>
          <div className={styles.loginCardIcon}>
            <LockIcon />
          </div>
          <div>
            <span className={styles.loginCardEyebrow}>// CREDENCIAIS</span>
            <h2 className={styles.loginCardTitle}>LOGIN</h2>
          </div>
        </div>

        {estado?.registrado && (
          <p className={styles.loginSuccess} role="status">
            Cadastro concluído. Entre com seus dados para continuar.
          </p>
        )}

        <form className={styles.loginForm} onSubmit={handleSubmit} noValidate>
          <label className={styles.loginLabel} htmlFor="email">
            EMAIL
          </label>
          <input
            id="email"
            name="email"
            className={styles.loginInput}
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={handleChange}
            autoComplete="email"
            aria-invalid={Boolean(erros.email)}
            aria-describedby={erros.email ? "login-email-erro" : undefined}
            required
          />
          {erros.email && (
            <p className={styles.fieldError} id="login-email-erro">
              {erros.email}
            </p>
          )}

          <label className={styles.loginLabel} htmlFor="senha">
            SENHA
          </label>
          <input
            id="senha"
            name="senha"
            className={styles.loginInput}
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={handleChange}
            autoComplete="current-password"
            aria-invalid={Boolean(erros.senha)}
            aria-describedby={erros.senha ? "login-senha-erro" : undefined}
            required
          />
          {erros.senha && (
            <p className={styles.fieldError} id="login-senha-erro">
              {erros.senha}
            </p>
          )}

          {erro && (
            <p className={styles.loginError} role="alert">
              {erro}
            </p>
          )}

          <button
            className={styles.loginButton}
            type="submit"
            disabled={carregando}
          >
            <LoginIcon />
            <span>{carregando ? "ENTRANDO..." : "ENTRAR"}</span>
          </button>
        </form>

        <p className={styles.cadastroLink}>
          Cadastrar uma conta?{" "}
          <Link to="/autenticacao/cadastro" state={{ from: estado?.from }}>
            Acesse o cadastro
          </Link>
        </p>
      </section>
    </main>
  );
}
