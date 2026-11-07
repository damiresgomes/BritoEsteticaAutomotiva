import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./componentes/ProtecaoRotas";
import PublicLayout from "./layouts/RodapeLayout";
import AdminLayout from "./layouts/AdminLayout";

import HomeSite from "./pages/site/Home";
import SobreSite from "./pages/site/Sobre"
import ServicosSite from "./pages/site/Servicos";
import AgendamentoSite from "./pages/site/Agendamento";
import CadastroUsuario from "./pages/autenticacao/Cadastro";
import Login from "./pages/autenticacao/Login";

import LoginAdmin from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import ListarCategoria from "./pages/admin/Categoria/ListarCategoria";
import CadastrarCategoria from "./pages/admin/Categoria/CadastrarCategoria";
import ExcluirCategoria from "./pages/admin/Categoria/EditarCategoria";
import ListarServico from "./pages/admin/Servico/ListarServico";
import CadastrarServico from "./pages/admin/Servico/CadastrarServico";
import ExcluirServico from "./pages/admin/Servico/EditarServico";
import ListarAgendamento from "./pages/admin/Agendamento/ListarAgendamento";
import CadastrarAgendamento from "./pages/admin/Agendamento/CadastrarAgendamento";
import ExcluirAgendamento from "./pages/admin/Agendamento/EditarAgendamento";
import ListarUsuario from "./pages/admin/Usuario/ListarUsuario";
import CadastrarUsuario from "./pages/admin/Usuario/CadastrarUsuario";

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
            <Route path="/admin/login" element={<LoginAdmin />} />
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