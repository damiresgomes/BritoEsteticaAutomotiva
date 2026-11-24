import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useUsuario } from "../../contexts/useUsuario";
import { authService } from "../../services/auth";
import styles from "./styles.module.css";

// Declara constante 'links'.
const links = [
  { to: "/", label: "Home", end: true },
  { to: "/servico", label: "Serviços" },
  { to: "/sobre", label: "Sobre" },
  { to: "/agendamento", label: "Agendamento" },
];

function getIniciais(nome?: string) {
  if (!nome) return "?";
  // Declara constante 'partes'.
  const partes = nome.trim().split(/\s+/);
  // Retorna ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase().
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
}

export default function PublicNavBar() {
  const { cliente } = useUsuario();
  // Estado React: [aberto, setAberto] criado com useState; atualizar o setter causa re-render do componente.
  const [aberto, setAberto] = useState(false);

  // Define função 'fechar'.
  const fechar = () => setAberto(false);
  // Declara constante 'clienteLogado'.
  const clienteLogado = Boolean(cliente) || authService.isAuthenticated("cliente");
  // Efeito React: executa código colateral após render; dependências controlam quando reexecuta.
  useEffect(() => {
    if (!aberto) return;

    // Define função 'aoPressionar'.
    const aoPressionar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };

    // Chamada: window.addEventListener("keydown", aoPressionar);.
    window.addEventListener("keydown", aoPressionar);
    // Retorna () => window.removeEventListener("keydown", aoPressionar).
    return () => window.removeEventListener("keydown", aoPressionar);
  }, [aberto]);

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logoText} onClick={fechar}>
          Brito <span>Estética</span>
        </Link>

        <button
          // Atribuição: type="button".
          type="button"
          // Atribuição: className={`${styles.toggle} ${aberto ? styles.toggleAberto : ""}`}.
          className={`${styles.toggle} ${aberto ? styles.toggleAberto : ""}`}
          // Atribuição: onClick={() => setAberto((valorAtual) => !valorAtual)}.
          onClick={() => setAberto((valorAtual) => !valorAtual)}
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={aberto}
          aria-controls="menu-principal"
        >
          <span className={styles.toggleBarra} />
          <span className={styles.toggleBarra} />
          <span className={styles.toggleBarra} />
        </button>

        <nav
          // Atribuição: id="menu-principal".
          id="menu-principal"
          // Atribuição: className={`${styles.nav} ${aberto ? styles.navAberto : ""}`}.
          className={`${styles.nav} ${aberto ? styles.navAberto : ""}`}
        >
          {links.map(({ to, label, end }) => (
            <NavLink
              // Atribuição: key={to}.
              key={to}
              // Atribuição: to={to}.
              to={to}
              // Atribuição: end={end}.
              end={end}
              // Atribuição: onClick={fechar}.
              onClick={fechar}
              // Atribuição: className={({ isActive }) =>.
              className={({ isActive }) =>
                isActive ? `${styles.itemLink} ${styles.ativo}` : styles.itemLink
              }
            >
              {label}
            </NavLink>
          ))}

          {clienteLogado ? (
            <Link
              // Atribuição: to="/minha-conta".
              to="/minha-conta"
              // Atribuição: onClick={fechar}.
              onClick={fechar}
              // Atribuição: className={`${styles.itemLink} ${styles.perfilLink}`}.
              className={`${styles.itemLink} ${styles.perfilLink}`}
            >
              <span className={styles.avatar}>{getIniciais(cliente?.nome)}</span>
              <span>{cliente?.nome ?? "Meu perfil"}</span>
            </Link>
          ) : (
            <NavLink
              // Atribuição: to="/autenticacao/LoginCliente".
              to="/autenticacao/LoginCliente"
              // Atribuição: onClick={fechar}.
              onClick={fechar}
              // Atribuição: className={({ isActive }) =>.
              className={({ isActive }) =>
                isActive ? `${styles.itemLink} ${styles.ativo}` : styles.itemLink
              }
            >
              Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Componente React reutilizável (frontend/src/components/PublicNavBar/index.tsx) com sua lógica de apresentação.
