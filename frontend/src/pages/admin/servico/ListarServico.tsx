import { Link } from 'react-router-dom'
import styles from '../Usuario/styles.module.css'

export default function ListarServico () {
    return (
        <div className={styles.wrapper}>
            <div className={styles.headerSection}>
                <span className={styles.breadcrumb}>// CADASTROS</span>
                <h1 className={styles.title}>SERVIÇOS</h1>
                
                <div className={styles.tabsContainer}>
                    <Link to="/admin/servico" className={styles.tabItem}>
                        ☰ LISTAR SERVIÇOS
                    </Link>
                    <Link to="/admin/servico/cadastrar" className={styles.tabItem}>
                        + CADASTRAR SERVIÇO
                    </Link>
                    <Link to="/admin/servico/excluir" className={styles.tabItem}>
                        + EXCLUIR SERVIÇO
                    </Link>
                </div>
            </div>
        </div>
    )
}