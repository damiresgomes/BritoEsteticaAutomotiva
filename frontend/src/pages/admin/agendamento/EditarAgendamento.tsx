import { useParams } from "react-router-dom";
import FormularioAgendamento from "./FormularioAgendamento";

export default function EditarAgendamento() {
  const { id } = useParams();
  // Declara constante 'clienteId'.
  const clienteId = Number(id);
  
  // Condição: !Number.isInteger(clienteId) || clienteId < 1.
  if (!Number.isInteger(clienteId) || clienteId < 1) {
    // Retorna <p>Agendamento não encontrado.</p>.
    return <p>Agendamento não encontrado.</p>;
  }
  // Retorna <FormularioAgendamento id={clienteId} />.
  return <FormularioAgendamento id={clienteId} />;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/admin/Agendamento/EditarAgendamento.tsx) responsável por renderizar UI e orquestrar interações do usuário.
