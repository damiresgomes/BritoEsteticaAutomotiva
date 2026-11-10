import { Outlet } from "react-router-dom"
import styles from './styles.module.css'
import AdminNavBar from "../../components/AdminNavBar"
import { UsuarioProvider } from "../../contexts/UsuarioContext"

export default function AdminLayout () {
    return (
        <UsuarioProvider>
            <div className={styles.adminShell}>

                <AdminNavBar />
                
                <main className={styles.adminMain}>
                    <Outlet />
                </main>
            </div>
        </UsuarioProvider>
    )
}