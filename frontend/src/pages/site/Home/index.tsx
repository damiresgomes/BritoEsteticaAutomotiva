import Hero from "./components/Hero";
import Diferenciais from "./components/Diferenciais";
import ChamadaAgendamento from "./components/ChamadaAgendamento";

export default function HomeSite() {
  return (
    <div className="home">
      <Hero />
      <Diferenciais />
      <ChamadaAgendamento />
    </div>
  );
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/site/Home/index.tsx) responsável por renderizar UI e orquestrar interações do usuário.
