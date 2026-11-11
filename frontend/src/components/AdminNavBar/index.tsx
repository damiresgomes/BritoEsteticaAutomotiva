import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import styles from "./styles.module.css";
import { useUsuario } from "../../contexts/useUsuario";
import { authService } from "../../services/auth";

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
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
}

export default function AdminNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useUsuario();
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    setMenuAberto(false);
  }, [location.pathname]);

  function handleLogout() {
    authService.logout("admin");
    navigate("/admin/login", { replace: true });
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
          type="button"
          className={styles.alternador}
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
          aria-controls="admin-menu"
          onClick={() => setMenuAberto((aberto) => !aberto)}
        >
          <span className={`${styles.hamburguer} ${menuAberto ? styles.hamburguerAberto : ""}`} />
        </button>

        <div id="admin-menu" className={`${styles.menu} ${menuAberto ? styles.menuAtivo : ""}`}>
          <nav className={styles.navegacao} aria-label="Navegação principal">
            {links.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
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
              to="/admin/perfil"
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