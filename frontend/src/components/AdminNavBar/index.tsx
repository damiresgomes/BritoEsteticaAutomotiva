import { Link, NavLink, useNavigate } from "react-router-dom";
import styles from "./styles.module.css";
import { useUsuario } from "../../contexts/useUsuario";
import { authService } from "../../services/auth";


export default function AdminNavBar() {
  const navigate = useNavigate();
  const { usuario } = useUsuario();

  function handleLogout() {
    authService.logout("admin");
    navigate("/admin/login", { replace: true });
  }

  return (
    <header className={styles.adminNavbar}>
      <Link className={styles.logoName} to="/admin">Brito Estética | Admin</Link>

      <nav className={styles.nav}>
        <NavLink to="/admin" end>Dashboard</NavLink>
        <NavLink to="/admin/categoria">Categorias</NavLink>
        <NavLink to="/admin/servico">Serviços</NavLink>
        <NavLink to="/admin/agendamento">Agendamentos</NavLink>
        <NavLink to="/admin/cliente">Clientes</NavLink>
        <NavLink to="/admin/usuario">Usuários</NavLink>
        <NavLink to="/admin/perfil">Meu perfil{usuario ? `: ${usuario.nome}` : ""}</NavLink>

        <button className={styles.button} onClick={handleLogout}>Sair</button>
      </nav>
    </header>
  );
}