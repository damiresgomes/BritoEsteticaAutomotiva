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
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : data;
}

function mensagemConfirmacao(dados: ResumoAgendamento): string {
  const nome = dados.nomeCliente.trim() || "cliente";
  const adicionais = dados.servicosExtras.length
    ? dados.servicosExtras.map((servico) => `- ${servico}`).join("\n")
    : "- Nenhum serviço adicional";
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
  const [mensagemEditada, setMensagemEditada] = useState<{
    id: number;
    texto: string;
  } | null>(null);
  const mensagemWhatsapp = resumoCriado
    ? mensagemEditada?.id === resumoCriado.id
      ? mensagemEditada.texto
      : mensagemConfirmacao(resumoCriado)
    : "";

  return (
    <form
      className={styles.cartao}
      onSubmit={onSubmit}
      inert={!autenticado && mostrarAviso}
      aria-hidden={!autenticado && mostrarAviso}
    >
      <div className={styles.linha}>
        <label className={styles.campo}>
          <span className={styles.rotulo}>Placa</span>
          <input
            className={styles.entrada}
            type="text"
            name="placa"
            placeholder="ABC-1234"
            maxLength={8}
            autoComplete="off"
            aria-label="Placa do veículo"
            value={dados.placa}
            onChange={onChange}
            required
          />
        </label>

        <label className={styles.campo}>
          <span className={styles.rotulo}>Veículo</span>
          <input
            className={styles.entrada}
            type="text"
            name="veiculo"
            placeholder="VW Golf"
            maxLength={50}
            value={dados.veiculo}
            onChange={onChange}
            required
          />
        </label>
      </div>

      <label className={styles.campo}>
        <span className={styles.rotulo}>Serviço</span>
        <select
          className={`${styles.entrada} ${styles.listaSuspensa}`}
          name="servico"
          value={dados.servico}
          onChange={onChange}
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
            acrescimos.map((acrescimo) => {
              const estaMarcado = acrescimosMarcados.includes(
                acrescimo.id_servico
              );

              return (
                <button
                  key={acrescimo.id_servico}
                  type="button"
                  className={`${styles.botaoAcrescimo} ${estaMarcado ? styles.marcado : ""}`}
                  aria-pressed={estaMarcado}
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
            className={styles.entrada}
            type="date"
            name="data"
            min={dataMinima}
            value={dados.data}
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
            className={`${styles.entrada} ${styles.listaSuspensa}`}
            name="horario"
            value={dados.horario}
            onChange={onChange}
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
          className={`${styles.entrada} ${styles.areaDeTexto}`}
          name="observacoes"
          rows={3}
          placeholder="Algum detalhe sobre o veículo ou serviço..."
          value={dados.observacoes}
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
              className={styles.mensagemWhatsapp}
              aria-label="Mensagem pronta para o WhatsApp"
              rows={11}
              value={mensagemWhatsapp}
              onChange={(evento) =>
                setMensagemEditada({
                  id: resumoCriado.id,
                  texto: evento.target.value,
                })
              }
            />
            <a
              className={`${styles.botaoEnviar} ${styles.botaoWhatsapp}`}
              href={urlWhatsapp(mensagemWhatsapp)}
              target="_blank"
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
          className={styles.botaoEnviar}
          type="submit"
          disabled={enviando || carregandoCatalogo || !servicos.length}
        >
          {enviando ? "Enviando..." : "Agendar horário"}
        </button>
      </div>
    </form>
  );
}
