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

// Define e exporta como padrão a função/componente LoginAdmin.
export default function LoginAdmin() {
  // Estado React: [email, setEmail] criado com useState; atualizar o setter causa re-render do componente.
  const [email, setEmail] = useState("");
  // Estado React: [senha, setSenha] criado com useState; atualizar o setter causa re-render do componente.
  const [senha, setSenha] = useState("");
  // Estado React: [erros, setErros] criado com useState; atualizar o setter causa re-render do componente.
  const [erros, setErros] = useState<Partial<Record<CampoLogin, string>>>({});
  // Estado React: [erro, setErro] criado com useState; atualizar o setter causa re-render do componente.
  const [erro, setErro] = useState("");
  // Estado React: [carregando, setCarregando] criado com useState; atualizar o setter causa re-render do componente.
  const [carregando, setCarregando] = useState(false);
  // Hook de navegação: 'navigate' permite redirecionar programaticamente.
  const navigate = useNavigate();
  // Hook useLocation: acessa URL/estado atual da navegação em 'location'.
  const location = useLocation();
  // Define função 'estado'.
  const estado = (location.state as EstadoNavegacao | null) ?? null;

  function handleChange(campo: CampoLogin, valor: string) {
    if (campo === "email") setEmail(valor);
    // Caminho alternativo quando condições anteriores não são atendidas.
    else setSenha(valor);

    // Chamada: setErros((atuais) => ({ ...atuais, [campo]: undefined }));.
    setErros((atuais) => ({ ...atuais, [campo]: undefined }));
    // Chamada: setErro("");.
    setErro("");
  }

  async function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    // Chamada: evento.preventDefault();.
    evento.preventDefault();
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

    if (!senha) novosErros.senha = "Informe sua senha.";

    // Chamada: setErros(novosErros);.
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    // Chamada: setCarregando(true);.
    setCarregando(true);
    // Bloco try: captura erros de chamadas assíncronas/rede/validação.
    try {
      // Aguarda operação assíncrona: authService.login(.
      await authService.login(
        { email: email.trim(), senha },
        "admin"
      );

      // Condição: !authService.isAuthenticated("admin").
      if (!authService.isAuthenticated("admin")) {
        // Chamada: setErro("Não foi possível iniciar a sessão administrativa.");.
        setErro("Não foi possível iniciar a sessão administrativa.");
        return;
      }

      // Declara constante 'caminho'.
      const caminho = estado?.from?.pathname;
      // Declara constante 'destinoSolicitado'.
      const destinoSolicitado =
        caminho?.startsWith("/") &&
        !caminho.startsWith("//") &&
        caminho !== "/autenticacao/LoginAdministrativo" && caminho !== "/admin/login"
          ? `${caminho}${estado?.from?.search ?? ""}${estado?.from?.hash ?? ""}`
          : undefined;

      // Chamada: navigate(destinoSolicitado ?? "/admin", { replace: true });.
      navigate(destinoSolicitado ?? "/admin", { replace: true });
    } catch (erroLogin) {
      // Chamada: setErro(obterMensagemErro(erroLogin));.
      setErro(obterMensagemErro(erroLogin));
    } finally {
      // Chamada: setCarregando(false);.
      setCarregando(false);
    }
  }

  return (
    <AuthLogin
      // Atribuição: eyebrow="// ÁREA ADMINISTRATIVA".
      eyebrow="// ÁREA ADMINISTRATIVA"
      // Atribuição: subtitulo="Área exclusiva do administrador para gerenciar agendamentos.".
      subtitulo="Área exclusiva do administrador para gerenciar agendamentos."
      // Atribuição: tituloCartao="LOGIN ADMIN".
      tituloCartao="LOGIN ADMIN"
    >
      <form className={authStyles.loginForm} onSubmit={handleSubmit} noValidate>
        <label className={authStyles.loginLabel} htmlFor="admin-email">
          EMAIL
        </label>
        <input
          // Atribuição: id="admin-email".
          id="admin-email"
          // Atribuição: name="email".
          name="email"
          // Atribuição: className={authStyles.loginInput}.
          className={authStyles.loginInput}
          // Atribuição: type="email".
          type="email"
          // Atribuição: autoComplete="username".
          autoComplete="username"
          // Atribuição: value={email}.
          value={email}
          // Atribuição: onChange={(evento) => handleChange("email", evento.target.value)}.
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
          // Atribuição: id="admin-senha".
          id="admin-senha"
          // Atribuição: name="senha".
          name="senha"
          // Atribuição: className={authStyles.loginInput}.
          className={authStyles.loginInput}
          // Atribuição: type="password".
          type="password"
          // Atribuição: autoComplete="current-password".
          autoComplete="current-password"
          // Atribuição: value={senha}.
          value={senha}
          // Atribuição: onChange={(evento) => handleChange("senha", evento.target.value)}.
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

      <a href="/" className={authStyles.voltar}>
        ← Voltar pro site
      </a>
    </AuthLogin>
  );
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/autenticacao/LoginAdministrativo/index.tsx) responsável por renderizar UI e orquestrar interações do usuário.
