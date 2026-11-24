import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authService } from "../../services/auth";

type Props = {
  papel?: "cliente" | "admin";
};

// Define e exporta como padrão a função/componente ProtectedRoute.
export default function ProtectedRoute({ papel = "admin" }: Props) {
  // Hook useLocation: acessa URL/estado atual da navegação em 'location'.
  const location = useLocation();
  // Declara constante 'temSessao'.
  const temSessao = authService.isAuthenticated(papel);

  // Condição: !temSessao.
  if (!temSessao) {
    // Declara constante 'rotaLogin'.
    const rotaLogin = papel === "admin" ? "/autenticacao/LoginAdministrativo" : "/autenticacao/LoginCliente";
    // Retorna <Navigate to={rotaLogin} replace state={{ from: location }} />.
    return <Navigate to={rotaLogin} replace state={{ from: location }} />;
  }

  // Retorna <Outlet />.
  return <Outlet />;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Guarda de rotas: verifica token conforme papel (admin/cliente) e redireciona para login quando ausente.
