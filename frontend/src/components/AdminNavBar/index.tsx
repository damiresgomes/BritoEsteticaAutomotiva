import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import styles from "./styles.module.css";
import { useUsuario } from "../../contexts/useUsuario";
import { authService } from "../../services/auth";

// Declara constante 'links'.
const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/categoria", label: "Categorias" },
  { to: "/admin/servico", label: "Serviços" },
  { to: "/admin/agendamento", label: "Agendamentos" },
  { to: "/admin/cliente", label: "Clientes" },
  { to: "/admin/usuario", label: "Usuários" },
];

function getIniciais(nome?: string) {
  if (!nome) return "?";
  // Declara constante 'partes'.
  const partes = nome.trim().split(/\s+/);
  // Retorna ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase().
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
}

export default function AdminNavBar() {
  // Hook de navegação: 'navigate' permite redirecionar programaticamente.
  const navigate = useNavigate();
  const { usuario } = useUsuario();
  // Estado React: [menuAberto, setMenuAberto] criado com useState; atualizar o setter causa re-render do componente.
  const [menuAberto, setMenuAberto] = useState(false);

  async function handleLogout() {
    // Aguarda operação assíncrona: authService.logoutAdmin();.
    await authService.logoutAdmin();
    // Chamada: navigate("/autenticacao/LoginAdministrativo", { replace: true });.
    navigate("/autenticacao/LoginAdministrativo", { replace: true });
  }

  return (
    <header className={styles.barraAdmin}>
      <div className={styles.conteiner}>
        <Link className={styles.marca} to="/admin" aria-label="Brito Estética, painel administrativo">
          <span className={styles.marcaLogo}>B</span>
          <span className={styles.marcaTexto}>
            <strong>Brito Estética</strong>
            <small>Painel administrativo</small>
          </span>
        </Link>

        <button
          // Atribuição: type="button".
          type="button"
          // Atribuição: className={styles.alternador}.
          className={styles.alternador}
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
          aria-controls="admin-menu"
          // Atribuição: onClick={() => setMenuAberto((aberto) => !aberto)}.
          onClick={() => setMenuAberto((aberto) => !aberto)}
        >
          <span className={`${styles.hamburguer} ${menuAberto ? styles.hamburguerAberto : ""}`} />
        </button>

        <div id="admin-menu" className={`${styles.menu} ${menuAberto ? styles.menuAtivo : ""}`}>
          <nav className={styles.navegacao} aria-label="Navegação principal">
            {links.map(({ to, label, end }) => (
              <NavLink
                // Atribuição: key={to}.
                key={to}
                // Atribuição: to={to}.
                to={to}
                // Atribuição: end={end}.
                end={end}
                // Atribuição: onClick={() => setMenuAberto(false)}.
                onClick={() => setMenuAberto(false)}
                // Atribuição: className={({ isActive }) =>.
                className={({ isActive }) =>
                  `${styles.item} ${isActive ? styles.ativo : ""}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className={styles.conta}>
            <NavLink
              // Atribuição: to="/admin/perfil".
              to="/admin/perfil"
              // Atribuição: onClick={() => setMenuAberto(false)}.
              onClick={() => setMenuAberto(false)}
              // Atribuição: className={({ isActive }) =>.
              className={({ isActive }) =>
                `${styles.perfil} ${isActive ? styles.perfilAtivo : ""}`
              }
            >
              <span className={styles.avatar}>{getIniciais(usuario?.nome)}</span>
              <span className={styles.perfilNome}>{usuario?.nome ?? "Meu perfil"}</span>
            </NavLink>

            <button type="button" className={styles.sair} onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Componente React reutilizável (frontend/src/components/AdminNavBar/index.tsx) com sua lógica de apresentação.
