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