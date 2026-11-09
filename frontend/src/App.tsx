import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRouter";
import PublicLayout from "./layouts/RodapeLayout";
import AdminLayout from "./layouts/AdminLayout";

import HomeSite from "./pages/site/Home";
import SobreSite from "./pages/site/Sobre"
import ServicosSite from "./pages/site/Servicos";
import AgendamentoSite from "./pages/site/Agendamento";
import CadastroUsuario from "./pages/auth/Cadastro";
import Login from "./pages/auth/Login";

import LoginAdmin from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import ListarCategoria from "./pages/admin/Categoria/Listarcategoria";
import CadastrarCategoria from "./pages/admin/Categoria/CadastrarCategoria";
import EditarCategoria from "./pages/admin/Categoria/EditarCategoria";
import ListarServico from "./pages/admin/Servico/ListarServico";
import CadastrarServico from "./pages/admin/Servico/CadastrarServico";
import EditarServico from "./pages/admin/Servico/EditarServico";
import ListarAgendamento from "./pages/admin/Agendamento/ListarAgendamento";
import CadastrarAgendamento from "./pages/admin/Agendamento/CadastrarAgendamento";
import EditarAgendamento from "./pages/admin/Agendamento/EditarAgendamento";
import ListarUsuario from "./pages/admin/Usuario/ListarUsuario";
import CadastrarUsuario from "./pages/admin/Usuario/CadastrarUsuario";
import PerfilAdmin from "./pages/admin/Usuario/PerfilAdmin";
import ListarCliente from "./pages/admin/Cliente/ListarCliente";
import CadastrarCliente from "./pages/admin/Cliente/CadastrarCliente";
import EditarCliente from "./pages/admin/Cliente/EditarCliente";
import MinhaConta from "./pages/site/MinhaConta";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomeSite />} />
          <Route path="servico" element={<ServicosSite />} />
          <Route path="sobre" element={<SobreSite />} />
          <Route path="agendamento" element={<AgendamentoSite />} />
          <Route path="autenticacao/login" element={<Login />} />
          <Route path="autenticacao/cadastro" element={<CadastroUsuario />} />
          <Route element={<ProtectedRoute papel="cliente" />}>
            <Route path="minha-conta" element={<MinhaConta />} />
          </Route>
        </Route>

        <Route path="admin/login" element={<LoginAdmin />} />

        <Route element={<ProtectedRoute />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="categoria" element={<ListarCategoria />} />
            <Route path="categoria/cadastrar" element={<CadastrarCategoria />} />
            <Route path="categoria/editar/:id" element={<EditarCategoria />} />
            <Route path="servico" element={<ListarServico />} />
            <Route path="servico/cadastrar" element={<CadastrarServico />} />
            <Route path="servico/editar/:id" element={<EditarServico />} />
            <Route path="agendamento" element={<ListarAgendamento />} />
            <Route path="agendamento/cadastrar" element={<CadastrarAgendamento />} />
            <Route path="agendamento/editar/:id" element={<EditarAgendamento />} />
            <Route path="cliente" element={<ListarCliente />} />
            <Route path="cliente/cadastrar" element={<CadastrarCliente />} />
            <Route path="cliente/editar/:id" element={<EditarCliente />} />
            <Route path="usuario" element={<ListarUsuario />} />
            <Route path="usuario/cadastrar" element={<CadastrarUsuario />} />
            <Route path="perfil" element={<PerfilAdmin />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}