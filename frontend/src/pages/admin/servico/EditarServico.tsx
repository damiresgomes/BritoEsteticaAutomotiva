import { Navigate, useParams } from "react-router-dom";
import FormularioServico from "./FormularioServico";

export default function EditarServico() {
  const { id } = useParams();
  // Declara constante 'servicoId'.
  const servicoId = Number(id);

  // Condição: !Number.isInteger(servicoId) || servicoId <= 0.
  if (!Number.isInteger(servicoId) || servicoId <= 0) {
    // Retorna <Navigate to="/admin/servico" replace />.
    return <Navigate to="/admin/servico" replace />;
  }

  // Retorna <FormularioServico id={servicoId} />.
  return <FormularioServico id={servicoId} />;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/admin/Servico/EditarServico.tsx) responsável por renderizar UI e orquestrar interações do usuário.
