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

import Dashboard from "./pages/admin/Dashboard";
import ListarCategoria from "./pages/admin/categoria/Listarcategoria";
import CadastrarCategoria from "./pages/admin/categoria/CadastrarCategoria";
import ExcluirCategoria from "./pages/admin/categoria/EditarCategoria";
import ListarServico from "./pages/admin/servico/ListarServico";
import CadastrarServico from "./pages/admin/servico/CadastrarServico";
import ExcluirServico from "./pages/admin/servico/EditarServico";
import ListarAgendamento from "./pages/admin/agendamento/ListarAgendamento";
import CadastrarAgendamento from "./pages/admin/agendamento/CadastrarAgendamento";
import ExcluirAgendamento from "./pages/admin/agendamento/EditarAgendamento";
import ListarUsuario from "./pages/admin/usuario/ListarUsuario";
import CadastrarUsuario from "./pages/admin/usuario/CadastrarUsuario";

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
        </Route>

        <Route path="admin/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="categoria" element={<ListarCategoria />} />
            <Route path="categoria/cadastrar" element={<CadastrarCategoria />} />
            <Route path="categoria/excluir" element={<ExcluirCategoria />} />
            <Route path="servico" element={<ListarServico />} />
            <Route path="servico/cadastrar" element={<CadastrarServico />} />
            <Route path="servico/excluir" element={<ExcluirServico />} />
            <Route path="agendamento" element={<ListarAgendamento />} />
            <Route path="agendamento/cadastrar" element={<CadastrarAgendamento />} />
            <Route path="agendamento/excluir" element={<ExcluirAgendamento />} />
            <Route path="usuario" element={<ListarUsuario />} />
            <Route path="usuario/cadastrar" element={<CadastrarUsuario />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}