import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { ChangeEvent, FormEvent } from "react";
import { isAxiosError } from "axios";
import { authService } from "../../../services/auth";
import AuthLogin, { LoginIcon } from "../../../components/AuthLogin";
import authStyles from "../../../components/AuthLogin/styles.module.css";
import styles from "./styles.module.css";
import { validarEmail } from "../../../utils/validarEmail";

type EstadoNavegacao = {
  from?: {
    pathname?: string;
    search?: string;
    hash?: string;
  };
  registrado?: boolean;
};

type CampoLogin = "email" | "senha";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [erros, setErros] = useState<Partial<Record<CampoLogin, string>>>({});
  const [erro, setErro] = useState<string>("");
  const [carregando, setCarregando] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const estado = (location.state as EstadoNavegacao | null) ?? null;
  const papelEsperado = "cliente";

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
      const destinoPadrao = "/minha-conta";

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
    <AuthLogin
      eyebrow="// ÁREA DE LOGIN"
      subtitulo="Área exclusiva de usuários."
      tituloCartao="LOGIN"
    >
        {estado?.registrado && (
          <p className={styles.loginSuccess} role="status">
            Cadastro concluído. Entre com seus dados para continuar.
          </p>
        )}

        <form className={authStyles.loginForm} onSubmit={handleSubmit} noValidate>
          <label className={authStyles.loginLabel} htmlFor="email">
            EMAIL
          </label>
          <input
            id="email"
            name="email"
            className={authStyles.loginInput}
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

          <label className={authStyles.loginLabel} htmlFor="senha">
            SENHA
          </label>
          <input
            id="senha"
            name="senha"
            className={authStyles.loginInput}
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
            className={authStyles.loginButton}
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
    </AuthLogin>
  );
}
