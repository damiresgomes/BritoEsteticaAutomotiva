import { Link } from 'react-router-dom'
import styles from '../Usuario/styles.module.css'

export default function ListarCategoria () {
    return (
        <div className={styles.wrapper}>
            <div className={styles.headerSection}>
                <span className={styles.breadcrumb}>// CADASTROS</span>
                <h1 className={styles.title}>CATEGORIA</h1>
                
                <div className={styles.tabsContainer}>
                    <Link to="/admin/categoria" className={styles.tabItem}>
                        ☰ LISTAR CATEGORIAS
                    </Link>
                    <Link to="/admin/categoria/cadastrar" className={styles.tabItem}>
                        + CADASTRAR CATEGORIA
                    </Link>
                    <Link to="/admin/categoria/excluir" className={styles.tabItem}>
                        + EXCLUIR CATEGORIA
                    </Link>
                </div>
            </div>
        </div>
    )
}