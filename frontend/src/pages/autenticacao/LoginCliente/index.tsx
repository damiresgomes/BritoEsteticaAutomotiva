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
  // Estado React: [email, setEmail] criado com useState; atualizar o setter causa re-render do componente.
  const [email, setEmail] = useState<string>("");
  // Estado React: [senha, setSenha] criado com useState; atualizar o setter causa re-render do componente.
  const [senha, setSenha] = useState<string>("");
  // Estado React: [erros, setErros] criado com useState; atualizar o setter causa re-render do componente.
  const [erros, setErros] = useState<Partial<Record<CampoLogin, string>>>({});
  // Estado React: [erro, setErro] criado com useState; atualizar o setter causa re-render do componente.
  const [erro, setErro] = useState<string>("");
  // Estado React: [carregando, setCarregando] criado com useState; atualizar o setter causa re-render do componente.
  const [carregando, setCarregando] = useState<boolean>(false);
  // Hook de navegação: 'navigate' permite redirecionar programaticamente.
  const navigate = useNavigate();
  // Hook useLocation: acessa URL/estado atual da navegação em 'location'.
  const location = useLocation();
  // Define função 'estado'.
  const estado = (location.state as EstadoNavegacao | null) ?? null;
  // Declara constante 'papelEsperado'.
  const papelEsperado = "cliente";

  // Define função 'handleChange'.
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === "email") setEmail(value);
    if (name === "senha") setSenha(value);
    // Chamada: setErros((atuais) => ({.
    setErros((atuais) => ({
      ...atuais,
      // Chamada: ...(name === "email" ? { email: undefined } : { senha: undefined }),.
      ...(name === "email" ? { email: undefined } : { senha: undefined }),
    }));
    // Chamada: setErro("");.
    setErro("");
  };

  // Define função assíncrona 'handleSubmit' (geralmente handler de evento/submit/fetch).
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    // Chamada: e.preventDefault();.
    e.preventDefault();
    // Chamada: setErro("");.
    setErro("");
    const novosErros: Partial<Record<CampoLogin, string>> = {};

    // Condição: !email.trim().
    if (!email.trim()) {
      // Atribuição: novosErros.email = "Informe seu email.";.
      novosErros.email = "Informe seu email.";
    } else if (!validarEmail(email)) {
      // Atribuição: novosErros.email = "Informe um email válido.";.
      novosErros.email = "Informe um email válido.";
    }

    // Condição: !senha.trim().
    if (!senha.trim()) {
      // Atribuição: novosErros.senha = "Informe sua senha.";.
      novosErros.senha = "Informe sua senha.";
    }

    // Chamada: setErros(novosErros);.
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    // Chamada: setCarregando(true);.
    setCarregando(true);

    // Bloco try: captura erros de chamadas assíncronas/rede/validação.
    try {
      // Aguarda operação assíncrona: authService.login({ email: email.trim(), senha }, papelEsperado);.
      await authService.login({ email: email.trim(), senha }, papelEsperado);

      // Condição: !authService.isAuthenticated(papelEsperado).
      if (!authService.isAuthenticated(papelEsperado)) {
        // Chamada: setErro("Resposta inválida do servidor.");.
        setErro("Resposta inválida do servidor.");
        return;
      }

      // Declara constante 'caminho'.
      const caminho = estado?.from?.pathname;
      // Declara constante 'destinoSolicitado'.
      const destinoSolicitado =
        caminho?.startsWith("/") &&
        !caminho.startsWith("//") &&
        !["/autenticacao/LoginCliente", "/autenticacao/CadastrarCliente", "/autenticacao/LoginAdministrativo", "/autenticacao/login", "/autenticacao/cadastro", "/admin/login"].includes(caminho)
          ? `${caminho}${estado?.from?.search ?? ""}${estado?.from?.hash ?? ""}`
          : undefined;
      // Declara constante 'destinoPadrao'.
      const destinoPadrao = "/minha-conta";

      // Chamada: navigate(destinoSolicitado ?? destinoPadrao, { replace: true });.
      navigate(destinoSolicitado ?? destinoPadrao, { replace: true });
    } catch (err) {
      // Condição: isAxiosError(err) && err.response.
      if (isAxiosError(err) && err.response) {
        // Chamada: setErro(err.response.data?.message ?? "Email ou senha incorretos.");.
        setErro(err.response.data?.message ?? "Email ou senha incorretos.");
      } else if (err instanceof Error) {
        // Chamada: setErro(err.message);.
        setErro(err.message);
      } else {
        // Chamada: setErro("Não foi possível conectar ao servidor. Tente novamente.");.
        setErro("Não foi possível conectar ao servidor. Tente novamente.");
      }
    } finally {
      // Chamada: setCarregando(false);.
      setCarregando(false);
    }
  };

  return (
    <AuthLogin
      // Atribuição: eyebrow="// ÁREA DE LOGIN".
      eyebrow="// ÁREA DE LOGIN"
      // Atribuição: subtitulo="Área exclusiva de usuários.".
      subtitulo="Área exclusiva de usuários."
      // Atribuição: tituloCartao="LOGIN".
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
            // Atribuição: id="email".
            id="email"
            // Atribuição: name="email".
            name="email"
            // Atribuição: className={authStyles.loginInput}.
            className={authStyles.loginInput}
            // Atribuição: type="email".
            type="email"
            // Atribuição: placeholder="Digite seu email".
            placeholder="Digite seu email"
            // Atribuição: value={email}.
            value={email}
            // Atribuição: onChange={handleChange}.
            onChange={handleChange}
            // Atribuição: autoComplete="email".
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
            // Atribuição: id="senha".
            id="senha"
            // Atribuição: name="senha".
            name="senha"
            // Atribuição: className={authStyles.loginInput}.
            className={authStyles.loginInput}
            // Atribuição: type="password".
            type="password"
            // Atribuição: placeholder="••••••••".
            placeholder="••••••••"
            // Atribuição: value={senha}.
            value={senha}
            // Atribuição: onChange={handleChange}.
            onChange={handleChange}
            // Atribuição: autoComplete="current-password".
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
            // Atribuição: className={authStyles.loginButton}.
            className={authStyles.loginButton}
            // Atribuição: type="submit".
            type="submit"
            // Atribuição: disabled={carregando}.
            disabled={carregando}
          >
            <LoginIcon />
            <span>{carregando ? "ENTRANDO..." : "ENTRAR"}</span>
          </button>
        </form>

        <p className={styles.cadastroLink}>
          Cadastrar uma conta?{" "}
          <Link to="/autenticacao/CadastrarCliente" state={{ from: estado?.from }}>
            Acesse o cadastro
          </Link>
        </p>
    </AuthLogin>
  );
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/autenticacao/LoginCliente/index.tsx) responsável por renderizar UI e orquestrar interações do usuário.
