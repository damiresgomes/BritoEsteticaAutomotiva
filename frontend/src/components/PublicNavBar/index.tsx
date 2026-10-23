import { NavLink } from 'react-router-dom'
import styles from './styles.module.css'

export default function PublicNavBar () {
    return (
        <header className={styles.navbar}>
            <div className={styles.container}>
                <a href='home' className={styles.logoText}>Brito <span>Estética</span></a>

                <nav>
                    <NavLink className={styles.itemLink} to='/' end>Home</NavLink>
                    <NavLink className={styles.itemLink} to='/servico'>Serviços</NavLink>
                    <NavLink className={styles.itemLink} to='/sobre'>Sobre</NavLink>
                    <NavLink className={styles.itemLink} to='/contato'>Contato</NavLink>
                    <NavLink className={styles.itemLink} to='/agendamento'>Agendamento</NavLink>
                </nav>
            </div>
        </header>
    )
}