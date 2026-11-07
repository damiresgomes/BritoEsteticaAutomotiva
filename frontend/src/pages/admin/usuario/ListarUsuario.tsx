import { Link } from 'react-router-dom'
import styles from './styles.module.css'

export default function ListarUsuario () {
    return (
        <div className={styles.wrapper}>
            <div className={styles.headerSection}>
                <span className={styles.breadcrumb}>// CADASTROS</span>
                <h1 className={styles.title}>USUÁRIOS</h1>
                
                <div className={styles.tabsContainer}>
                    <Link to="/admin/usuario" className={styles.tabItem}>
                        ☰ LISTAR USUÁRIOS
                    </Link>
                    <Link to="/admin/usuario/cadastrar" className={styles.tabItem}>
                        + CADASTRAR USUÁRIO
                    </Link>
                </div>
            </div>
        </div>
    )
}