import type { ChangeEvent, FormEvent } from "react";
import { Link, type Location } from "react-router-dom";
import type { AgendamentoCriado } from "../../services/agendamentos";
import type { Servico } from "../../services/services";
import styles from "../../pages/site/Agendamento/styles.module.css";

type DadosAgendamento = {
  placa: string;
  veiculo: string;
  servico: string;
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
  agendamentoCriado: AgendamentoCriado | null;
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
  agendamentoCriado,
  temServicoSelecionado,
  totalEstimado,
  dataMinima,
  from,
  onChange,
  onToggleAcrescimo,
  onSubmit,
}: FormAgendamentoProps) {
  
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
          <Link to="/autenticacao/login" state={{ from }}>
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
      {agendamentoCriado && (
        <p className={styles.mensagemSucesso} role="status">
          Agendamento #{agendamentoCriado.id} realizado com sucesso. Total:{" "}
          {formatarPreco(agendamentoCriado.total)}.
        </p>
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
