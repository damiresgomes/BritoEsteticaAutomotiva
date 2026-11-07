import { Outlet } from "react-router-dom"
import styles from './styles.module.css'
import AdminNavBar from "../../componentes/AdminNavBar"

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