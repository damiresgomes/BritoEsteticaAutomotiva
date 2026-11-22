import Chamada from "../../../../components/Chamada";
import Botao from "../../../../components/Botao";
import { WHATSAPP_URL } from "../../../../utils/contato";

export default function ChamadaAgendamento () {
    return (
        <Chamada
            titulo={<>PRONTO PARA O BRILHO?<br /><span>AGENDE EM 60 SEGUNDOS.</span></>}
            descricao="Escolha o horário, receba a confirmação na hora e tire dúvidas direto no WhatsApp."
            rodape={<><span>•</span> RESPOSTA EM MINUTOS</>}
            >
            <Botao to="/agendamento">AGENDAR AGORA</Botao>
            <Botao href={WHATSAPP_URL} variante="secundario">FALAR NO WHATSAPP</Botao>
        </Chamada>
    )
}