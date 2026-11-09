import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLogin, { LoginIcon } from "../../../components/AuthLogin";
import authStyles from "../../../components/AuthLogin/styles.module.css";
import { authService } from "../../../services/auth";
import { obterMensagemErro } from "../../../utils/erros";
import { validarEmail } from "../../../utils/validarEmail";
import styles from "./styles.module.css";

type EstadoNavegacao = {
  from?: {
    pathname?: string;
    search?: string;
    hash?: string;
  };
};

type CampoLogin = "email" | "senha";

export default function LoginAdmin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState<Partial<Record<CampoLogin, string>>>({});
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const estado = (location.state as EstadoNavegacao | null) ?? null;

  function handleChange(campo: CampoLogin, valor: string) {
    if (campo === "email") setEmail(valor);
    else setSenha(valor);

    setErros((atuais) => ({ ...atuais, [campo]: undefined }));
    setErro("");
  }

  async function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");

    const novosErros: Partial<Record<CampoLogin, string>> = {};
    if (!email.trim()) {
      novosErros.email = "Informe seu email.";
    } else if (!validarEmail(email)) {
      novosErros.email = "Informe um email válido.";
    }

    if (!senha) novosErros.senha = "Informe sua senha.";

    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setCarregando(true);
    try {
      await authService.login(
        { email: email.trim(), senha },
        "admin"
      );

      if (!authService.isAuthenticated("admin")) {
        setErro("Não foi possível iniciar a sessão administrativa.");
        return;
      }

      const caminho = estado?.from?.pathname;
      const destinoSolicitado =
        caminho?.startsWith("/") &&
        !caminho.startsWith("//") &&
        caminho !== "/admin/login"
          ? `${caminho}${estado?.from?.search ?? ""}${estado?.from?.hash ?? ""}`
          : undefined;

      navigate(destinoSolicitado ?? "/admin", { replace: true });
    } catch (erroLogin) {
      setErro(obterMensagemErro(erroLogin));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <AuthLogin
      eyebrow="// ÁREA ADMINISTRATIVA"
      subtitulo="Área exclusiva do administrador para gerenciar agendamentos."
      tituloCartao="LOGIN ADMIN"
    >
      <form className={authStyles.loginForm} onSubmit={handleSubmit} noValidate>
        <label className={authStyles.loginLabel} htmlFor="admin-email">
          EMAIL
        </label>
        <input
          id="admin-email"
          name="email"
          className={authStyles.loginInput}
          type="email"
          autoComplete="username"
          value={email}
          onChange={(evento) => handleChange("email", evento.target.value)}
          aria-invalid={Boolean(erros.email)}
          aria-describedby={erros.email ? "admin-email-erro" : undefined}
          required
        />
        {erros.email && (
          <p className={styles.fieldError} id="admin-email-erro">
            {erros.email}
          </p>
        )}

        <label className={authStyles.loginLabel} htmlFor="admin-senha">
          SENHA
        </label>
        <input
          id="admin-senha"
          name="senha"
          className={authStyles.loginInput}
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(evento) => handleChange("senha", evento.target.value)}
          aria-invalid={Boolean(erros.senha)}
          aria-describedby={erros.senha ? "admin-senha-erro" : undefined}
          required
        />
        {erros.senha && (
          <p className={styles.fieldError} id="admin-senha-erro">
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

      <a href="/" className={authStyles.voltar}>
        ← Voltar pro site
      </a>
    </AuthLogin>
  );
}
