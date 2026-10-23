import { Link, NavLink, useNavigate } from 'react-router-dom'
import styles from "./styles.module.css"

export default function AdminNavBar () {
    const navigate = useNavigate()

    function handleLogout () {
        sessionStorage.removeItem('brito-admin-token')
        navigate('/admin/login', { replace: true})
    }

    return (
        <header className={styles.adminNavbar}>
            <Link className='logoName' to='/admin'>Brito Estética | Admin</Link>

            <nav className={styles.nav}>
                <NavLink to='/admin' end>Dashboard</NavLink>
                <NavLink to='/admin/categoria'>Categorias</NavLink>
                <NavLink to='/admin/categoria/cadastrar'>Cadastrar categoria</NavLink>
                <NavLink to='/admin/servico'>Serviços</NavLink>
                <NavLink to='/admin/servico/cadastrar'>Cadastrar serviço</NavLink>
                <NavLink to='/admin/agendamento'>Agendamentos</NavLink>
                <NavLink to='/admin/agendamento/cadastrar'>Cadastrar agendamento</NavLink>
                <NavLink to='/admin/usuario'>Usuários</NavLink>
                <NavLink to='/admin/usuario/cadastrar'>Cadastrar usuário</NavLink>

                <button className={styles.button} onClick={handleLogout}>Sair</button>
            </nav>
        </header>
    )
}