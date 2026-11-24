import Chamada from "../../../../components/Chamada";
import Botao from "../../../../components/Botao";
import { WHATSAPP_URL } from "../../../../utils/contato";

export default function ChamadaAgendamento () {
    return (
        <Chamada
            // Atribuição: titulo={<>PRONTO PARA O BRILHO?<br /><span>AGENDE EM 60 SEGUNDOS.</span></>}.
            titulo={<>PRONTO PARA O BRILHO?<br /><span>AGENDE EM 60 SEGUNDOS.</span></>}
            // Atribuição: descricao="Escolha o horário, receba a confirmação na hora e tire dúvidas direto no WhatsApp.".
            descricao="Escolha o horário, receba a confirmação na hora e tire dúvidas direto no WhatsApp."
            // Atribuição: rodape={<><span>•</span> RESPOSTA EM MINUTOS</>}.
            rodape={<><span>•</span> RESPOSTA EM MINUTOS</>}
            >
            <Botao to="/agendamento">AGENDAR AGORA</Botao>
            <Botao href={WHATSAPP_URL} variante="secundario">FALAR NO WHATSAPP</Botao>
        </Chamada>
    )
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/site/Home/components/ChamadaAgendamento.tsx) responsável por renderizar UI e orquestrar interações do usuário.
