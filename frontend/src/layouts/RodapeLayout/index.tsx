import { Link, Outlet } from 'react-router-dom'
import PublicNavBar from '../../components/PublicNavBar'
import styles from './styles.module.css'

export default function PublicLayout () {
    return (
        <div className={styles.container}>
            <PublicNavBar />
            <Outlet />

            <footer className={styles.rodape}>
                <div>
                    <div className={styles.linhaRodape}>

                        <div className={styles.blocoEsquerdo}>
                            <Link className={styles.logoRodape} to='/'>
                                <span className={styles.logoBranco}>Brito</span>
                                <span className={styles.logoAzul}>Estética</span>
                            </Link>
                            <p className={styles.texto}>© 2026 — ESTÉTICA AUTOMOTIVA</p>
                        </div>

                        <div className={styles.blocoDireito}>
                            <a href="mailto:contato@britoestetica.com.br" className={styles.itemContato}>contato@britoestetica.com.br</a>
                            <a href="tel:19981339017" className={styles.itemContato}>(19) 98133-9017</a>
                            <a href="/admin/login" className={styles.itemAdmin}>admin</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}