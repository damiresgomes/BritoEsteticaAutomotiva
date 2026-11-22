import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authService } from "../../services/auth";

type Props = {
  papel?: "cliente" | "admin";
};

export default function ProtectedRoute({ papel = "admin" }: Props) {
  const location = useLocation();
  const temSessao = authService.isAuthenticated(papel);

  if (!temSessao) {
    const rotaLogin = papel === "admin" ? "/autenticacao/LoginAdministrativo" : "/autenticacao/LoginCliente";
    return <Navigate to={rotaLogin} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
