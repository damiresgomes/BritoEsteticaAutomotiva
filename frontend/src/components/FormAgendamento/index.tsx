import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, type Location } from "react-router-dom";
import type { Servico } from "../../services/services";
import { urlWhatsapp } from "../../utils/contato";
import styles from "../../pages/site/Agendamento/styles.module.css";

type DadosAgendamento = {
  placa: string;
  veiculo: string;
  servico: string;
  data: string;
  horario: string;
  observacoes: string;
};

// Define e exporta o tipo 'ResumoAgendamento'.
export type ResumoAgendamento = {
  id: number;
  total: number;
  nomeCliente: string;
  placa: string;
  veiculo: string;
  servicoPrincipal: string;
  servicosExtras: string[];
  data: string;
  horario: string;
  observacoes: string;
};

type FormAgendamentoProps = {
  autenticado: boolean;
  mostrarAviso: boolean;
  dados: DadosAgendamento;
  servicos: Servico[];
  acrescimos: Servico[];
  acrescimosMarcados: number[];
  horarios: string[];
  carregandoCatalogo: boolean;
  carregandoHorarios: boolean;
  enviando: boolean;
  erroCatalogo: string;
  erroHorarios: string;
  erroEnvio: string;
  resumoCriado: ResumoAgendamento | null;
  temServicoSelecionado: boolean;
  totalEstimado: number | null;
  dataMinima: string;
  from: Location;
  onChange: (
    evento: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  onToggleAcrescimo: (id: number) => void;
  onSubmit: (evento: FormEvent<HTMLFormElement>) => void;
};

function formatarPreco(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function formatarData(data: string): string {
  const [ano, mes, dia] = data.split("-");
  // Retorna ano && mes && dia ? `${dia}/${mes}/${ano}` : data.
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : data;
}

function mensagemConfirmacao(dados: ResumoAgendamento): string {
  // Declara constante 'nome'.
  const nome = dados.nomeCliente.trim() || "cliente";
  // Declara constante 'adicionais'.
  const adicionais = dados.servicosExtras.length
    ? dados.servicosExtras.map((servico) => `- ${servico}`).join("\n")
    : "- Nenhum serviço adicional";
  // Declara constante 'observacoes'.
  const observacoes = dados.observacoes.trim() || "Nenhuma observação informada.";

  return `Olá, equipe Brito! Tudo bem?

Eu sou ${nome} e acabei de agendar um horário pelo site. Segue o resumo certinho para vocês confirmarem:

Agendamento: #${dados.id}
Serviço principal: ${dados.servicoPrincipal}
Serviços adicionais:
${adicionais}
Data e horário: ${formatarData(dados.data)} às ${dados.horario}
Veículo: ${dados.veiculo}
Placa: ${dados.placa}
Observações: ${observacoes}
Total previsto: ${formatarPreco(dados.total)}

Fico no aguardo da confirmação. Muito obrigado!
`;
}

export default function FormAgendamento({
  autenticado,
  mostrarAviso,
  dados,
  servicos,
  acrescimos,
  acrescimosMarcados,
  horarios,
  carregandoCatalogo,
  carregandoHorarios,
  enviando,
  erroCatalogo,
  erroHorarios,
  erroEnvio,
  resumoCriado,
  temServicoSelecionado,
  totalEstimado,
  dataMinima,
  from,
  onChange,
  onToggleAcrescimo,
  onSubmit,
}: FormAgendamentoProps) {
  // Estado React: [mensagemEditada, setMensagemEditada] criado com useState; atualizar o setter causa re-render do componente.
  const [mensagemEditada, setMensagemEditada] = useState<{
    id: number;
    texto: string;
  } | null>(null);
  // Declara constante 'mensagemWhatsapp'.
  const mensagemWhatsapp = resumoCriado
    ? mensagemEditada?.id === resumoCriado.id
      ? mensagemEditada.texto
      : mensagemConfirmacao(resumoCriado)
    : "";

  return (
    <form
      // Atribuição: className={styles.cartao}.
      className={styles.cartao}
      // Atribuição: onSubmit={onSubmit}.
      onSubmit={onSubmit}
      // Atribuição: inert={!autenticado && mostrarAviso}.
      inert={!autenticado && mostrarAviso}
      aria-hidden={!autenticado && mostrarAviso}
    >
      <div className={styles.linha}>
        <label className={styles.campo}>
          <span className={styles.rotulo}>Placa</span>
          <input
            // Atribuição: className={styles.entrada}.
            className={styles.entrada}
            // Atribuição: type="text".
            type="text"
            // Atribuição: name="placa".
            name="placa"
            // Atribuição: placeholder="ABC-1234".
            placeholder="ABC-1234"
            // Atribuição: maxLength={8}.
            maxLength={8}
            // Atribuição: autoComplete="off".
            autoComplete="off"
            aria-label="Placa do veículo"
            // Atribuição: value={dados.placa}.
            value={dados.placa}
            // Atribuição: onChange={onChange}.
            onChange={onChange}
            required
          />
        </label>

        <label className={styles.campo}>
          <span className={styles.rotulo}>Veículo</span>
          <input
            // Atribuição: className={styles.entrada}.
            className={styles.entrada}
            // Atribuição: type="text".
            type="text"
            // Atribuição: name="veiculo".
            name="veiculo"
            // Atribuição: placeholder="VW Golf".
            placeholder="VW Golf"
            // Atribuição: maxLength={50}.
            maxLength={50}
            // Atribuição: value={dados.veiculo}.
            value={dados.veiculo}
            // Atribuição: onChange={onChange}.
            onChange={onChange}
            required
          />
        </label>
      </div>

      <label className={styles.campo}>
        <span className={styles.rotulo}>Serviço</span>
        <select
          // Atribuição: className={`${styles.entrada} ${styles.listaSuspensa}`}.
          className={`${styles.entrada} ${styles.listaSuspensa}`}
          // Atribuição: name="servico".
          name="servico"
          // Atribuição: value={dados.servico}.
          value={dados.servico}
          // Atribuição: onChange={onChange}.
          onChange={onChange}
          // Atribuição: disabled={carregandoCatalogo || servicos.length === 0}.
          disabled={carregandoCatalogo || servicos.length === 0}
          required
        >
          <option value="" disabled>
            {carregandoCatalogo
              ? "Carregando serviços..."
              : erroCatalogo ||
                (servicos.length ? "Selecione" : "Nenhum serviço disponível")}
          </option>
          {servicos.map((servico) => (
            <option key={servico.id_servico} value={servico.id_servico}>
              {servico.nome_servico} — {formatarPreco(servico.preco)}
            </option>
          ))}
        </select>
      </label>
      {erroCatalogo && (
        <p className={styles.mensagemErro} role="alert">
          {erroCatalogo}
        </p>
      )}

      <fieldset className={`${styles.campo} ${styles.grupo}`}>
        <legend className={styles.rotulo}>Acréscimos opcionais</legend>
        <div className={styles.gradeDeAcrescimos}>
          {carregandoCatalogo ? (
            <p>Carregando acréscimos...</p>
          ) : erroCatalogo ? (
            <p>Não foi possível carregar os acréscimos.</p>
          ) : acrescimos.length === 0 ? (
            <p>Nenhum acréscimo disponível.</p>
          ) : (
            // Chamada: acrescimos.map((acrescimo) => {.
            acrescimos.map((acrescimo) => {
              // Declara constante 'estaMarcado'.
              const estaMarcado = acrescimosMarcados.includes(
                acrescimo.id_servico
              );

              return (
                <button
                  // Atribuição: key={acrescimo.id_servico}.
                  key={acrescimo.id_servico}
                  // Atribuição: type="button".
                  type="button"
                  // Atribuição: className={`${styles.botaoAcrescimo} ${estaMarcado ? styles.marcado : ""}`}.
                  className={`${styles.botaoAcrescimo} ${estaMarcado ? styles.marcado : ""}`}
                  aria-pressed={estaMarcado}
                  // Atribuição: onClick={() => onToggleAcrescimo(acrescimo.id_servico)}.
                  onClick={() => onToggleAcrescimo(acrescimo.id_servico)}
                >
                  <span>{acrescimo.nome_servico}</span>
                  <span className={styles.precoDoAcrescimo}>
                    +{formatarPreco(acrescimo.preco)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </fieldset>

      <div className={styles.linha}>
        <label className={styles.campo}>
          <span className={styles.rotulo}>Data</span>
          <input
            // Atribuição: className={styles.entrada}.
            className={styles.entrada}
            // Atribuição: type="date".
            type="date"
            // Atribuição: name="data".
            name="data"
            // Atribuição: min={dataMinima}.
            min={dataMinima}
            // Atribuição: value={dados.data}.
            value={dados.data}
            // Atribuição: onChange={onChange}.
            onChange={onChange}
            required
          />
          <span className={styles.notaTotal}>
            A empresa não abre aos domingos.
          </span>
        </label>

        <label className={styles.campo}>
          <span className={styles.rotulo}>Horário</span>
          <select
            // Atribuição: className={`${styles.entrada} ${styles.listaSuspensa}`}.
            className={`${styles.entrada} ${styles.listaSuspensa}`}
            // Atribuição: name="horario".
            name="horario"
            // Atribuição: value={dados.horario}.
            value={dados.horario}
            // Atribuição: onChange={onChange}.
            onChange={onChange}
            // Atribuição: disabled={.
            disabled={
              !dados.data || carregandoHorarios || !horarios.length
            }
            required
          >
            <option value="" disabled>
              {!dados.data
                ? "Escolha uma data primeiro"
                : !autenticado
                  ? "Entre para consultar os horários"
                  : carregandoHorarios
                    ? "Carregando horários..."
                    : erroHorarios ||
                      (horarios.length ? "Selecione" : "Sem horários disponíveis")}
            </option>
            {horarios.map((horario) => (
              <option key={horario} value={horario}>
                {horario}
              </option>
            ))}
          </select>
        </label>
      </div>
      {erroHorarios && (
        <p className={styles.mensagemErro} role="alert">
          {erroHorarios}
        </p>
      )}
      {!autenticado && dados.data && (
        <p className={styles.notaTotal}>
          <Link to="/autenticacao/LoginCliente" state={{ from }}>
            Entre com uma conta de cliente
          </Link>{" "}
          para consultar horários disponíveis.
        </p>
      )}

      <label className={styles.campo}>
        <span className={styles.rotulo}>Observações (opcional)</span>
        <textarea
          // Atribuição: className={`${styles.entrada} ${styles.areaDeTexto}`}.
          className={`${styles.entrada} ${styles.areaDeTexto}`}
          // Atribuição: name="observacoes".
          name="observacoes"
          // Atribuição: rows={3}.
          rows={3}
          // Atribuição: placeholder="Algum detalhe sobre o veículo ou serviço...".
          placeholder="Algum detalhe sobre o veículo ou serviço..."
          // Atribuição: value={dados.observacoes}.
          value={dados.observacoes}
          // Atribuição: onChange={onChange}.
          onChange={onChange}
        />
      </label>

      {erroEnvio && (
        <p className={styles.mensagemErro} role="alert">
          {erroEnvio}
        </p>
      )}
      {resumoCriado && (
        <>
          <p className={styles.mensagemSucesso} role="status">
            Agendamento #{resumoCriado.id} realizado com sucesso. Total:{" "}
            {formatarPreco(resumoCriado.total)}.
          </p>
          <section className={styles.confirmacaoWhatsapp}>
            <h2>Mensagem pronta para o WhatsApp</h2>
            <p>
              Confira ou ajuste o texto antes de enviar. Assim a equipe já recebe
              todos os detalhes do seu agendamento.
            </p>
            <textarea
              // Atribuição: className={styles.mensagemWhatsapp}.
              className={styles.mensagemWhatsapp}
              aria-label="Mensagem pronta para o WhatsApp"
              // Atribuição: rows={11}.
              rows={11}
              // Atribuição: value={mensagemWhatsapp}.
              value={mensagemWhatsapp}
              // Atribuição: onChange={(evento) =>.
              onChange={(evento) =>
                // Chamada: setMensagemEditada({.
                setMensagemEditada({
                  id: resumoCriado.id,
                  texto: evento.target.value,
                })
              }
            />
            <a
              // Atribuição: className={`${styles.botaoEnviar} ${styles.botaoWhatsapp}`}.
              className={`${styles.botaoEnviar} ${styles.botaoWhatsapp}`}
              // Atribuição: href={urlWhatsapp(mensagemWhatsapp)}.
              href={urlWhatsapp(mensagemWhatsapp)}
              // Atribuição: target="_blank".
              target="_blank"
              // Atribuição: rel="noopener noreferrer".
              rel="noopener noreferrer"
            >
              Abrir WhatsApp com a mensagem
            </a>
          </section>
        </>
      )}

      <div className={styles.rodape}>
        {temServicoSelecionado && (
          <div className={styles.total} aria-live="polite">
            <strong>Total: {formatarPreco(totalEstimado ?? 0)}</strong>
          </div>
        )}
        <button
          // Atribuição: className={styles.botaoEnviar}.
          className={styles.botaoEnviar}
          // Atribuição: type="submit".
          type="submit"
          // Atribuição: disabled={enviando || carregandoCatalogo || !servicos.length}.
          disabled={enviando || carregandoCatalogo || !servicos.length}
        >
          {enviando ? "Enviando..." : "Agendar horário"}
        </button>
      </div>
    </form>
  );
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Componente React reutilizável (frontend/src/components/FormAgendamento/index.tsx) com sua lógica de apresentação.
