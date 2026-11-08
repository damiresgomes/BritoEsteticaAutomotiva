import { Link } from 'react-router-dom'
import styles from '../usuario/styles.module.css'

export default function ListarAgendamento () {
    return (
        <div className={styles.wrapper}>
            <div className={styles.headerSection}>
                <span className={styles.breadcrumb}>// CADASTROS</span>
                <h1 className={styles.title}>USUÁRIOS</h1>
                
                <div className={styles.tabsContainer}>
                    <Link to="/admin/agendamento" className={styles.tabItem}>
                        ☰ LISTAR AGENDAMENTOS
                    </Link>
                    <Link to="/admin/agendamento/cadastrar" className={styles.tabItem}>
                        + CADASTRAR AGENDAMENTO
                    </Link>
                    <Link to="/admin/agendamento/excluir" className={styles.tabItem}>
                        + EXCLUIR AGENDAMENTO
                    </Link>
                </div>
            </div>
        </div>
    )
}