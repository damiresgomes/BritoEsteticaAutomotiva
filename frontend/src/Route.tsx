import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRouter";
import PublicLayout from "./layouts/RodapeLayout";
import HomeSite from "./pages/site/Home";
import SobreSite from "./pages/site/Sobre"
import ServicosSite from "./pages/site/Servicos";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import CadastrarAgendamento from "./pages/admin/agendamento/CadastrarAgendamento";
import ListarAgendamento from "./pages/admin/agendamento/ListarAgendamento";
import CadastrarCategoria from "./pages/admin/Categoria/CadastrarCategoria";
import ListarCategoria from "./pages/admin/Categoria/ListarCategoria";
import CadastrarServico from "./pages/admin/servico/CadastrarServico";
import ListarServico from "./pages/admin/servico/ListarServico";
import CadastrarUsuario from "./pages/admin/usuario/CadastrarUsuario";
import ListarUsuario from "./pages/admin/usuario/ListarUsuario";
import AdminLayout from "./layouts/AdminLayout";

export default function PublicNavBar () {
    return (
        <BrowserRouter>
        <Routes>
            <Route element={<PublicLayout />}>
                <Route index element={<HomeSite />} />
                <Route path="servicos" element={<ServicosSite />} />
                <Route path="sobre" element={<SobreSite />} />
            </Route>
            <Route path="admin/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
                <Route path="admin" element={<AdminLayout />} >
                    <Route index element={<Dashboard />} />
                    <Route path="categoria/cadastrar" element={<CadastrarCategoria />} />
                    <Route path="categoria/listar" element={<ListarCategoria />} />
                    <Route path="agendamento/cadastrar" element={<CadastrarAgendamento />} />
                    <Route path="agendamento/listar" element={<ListarAgendamento />} />
                    <Route path="servico/cadastrar" element={<CadastrarServico />} />
                    <Route path="servico/listar" element={<ListarServico />} />
                    <Route path="usuario/cadastrar" element={<CadastrarUsuario/>} />
                    <Route path="usuario/listar" element={<ListarUsuario />} />
                    <Route path="usuario/listar" element={<ListarUsuario />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to='/' replace />} />
        </Routes>
        </BrowserRouter>
    )
}