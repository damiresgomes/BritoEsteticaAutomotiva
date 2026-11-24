import { useParams } from "react-router-dom";
import FormularioCliente from "./FormularioCliente";

export default function EditarCliente() {
  const { id } = useParams();
  // Declara constante 'clienteId'.
  const clienteId = Number(id);

  // Condição: !Number.isInteger(clienteId) || clienteId < 1.
  if (!Number.isInteger(clienteId) || clienteId < 1) {
    // Retorna <p>Cliente não encontrado.</p>.
    return <p>Cliente não encontrado.</p>;
  }

  // Retorna <FormularioCliente id={clienteId} />.
  return <FormularioCliente id={clienteId} />;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/admin/Cliente/EditarCliente.tsx) responsável por renderizar UI e orquestrar interações do usuário.
