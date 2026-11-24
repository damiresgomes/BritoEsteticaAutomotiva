import { Outlet } from "react-router-dom"
// Importa styles de './styles.module.css'.
import styles from './styles.module.css'
import AdminNavBar from "../../components/AdminNavBar"

export default function AdminLayout () {
    return (
        <div className={styles.adminShell}>

            <AdminNavBar />
            
            <main className={styles.adminMain}>
                <Outlet />
            </main>
        </div>
    )
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Layout React (frontend/src/layouts/AdminLayout/index.tsx) que organiza estrutura visual compartilhada.
