// Importa Link, Outlet de 'react-router-dom'.
import { Link, Outlet } from 'react-router-dom'
// Importa PublicNavBar de '../../components/PublicNavBar'.
import PublicNavBar from '../../components/PublicNavBar'
// Importa TELEFONE_CONTATO, TELEFONE_CONTATO_LINK de '../../utils/contato'.
import { TELEFONE_CONTATO, TELEFONE_CONTATO_LINK } from '../../utils/contato'
// Importa styles de './styles.module.css'.
import styles from './styles.module.css'

export default function PublicLayout () {
    return (
        <div className={styles.container}>

            <PublicNavBar />
            
            <main>
                <Outlet />
            </main>

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
                            <a href={`tel:${TELEFONE_CONTATO_LINK}`} className={styles.itemContato}>{TELEFONE_CONTATO}</a>
                            <a href="/autenticacao/LoginAdministrativo" className={styles.itemAdmin}>admin</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Layout React (frontend/src/layouts/RodapeLayout/index.tsx) que organiza estrutura visual compartilhada.
