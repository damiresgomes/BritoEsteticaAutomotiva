import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { authService } from "../../../services/auth";
import { agendamentoService } from "../../../services/agendamentos";
import type { AgendamentoCriado } from "../../../services/agendamentos";
import { servicoService } from "../../../services/services";
import type { Servico } from "../../../services/services";
import {
  dataLocalAtual,
  dataNaoEstaNoPassado,
  mascararPlaca,
  validarPlaca,
} from "../../../utils/validadores";
import { obterMensagemErro } from "../../../utils/erros";

import styles from "./styles.module.css";

const CATEGORIA_PRINCIPAL = 1;
const CATEGORIA_EXTRA = 2;
const formatarPreco = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

function mensagemErroDeAgendamento(erro: unknown): string {
  if (axios.isAxiosError(erro)) {
    if (erro.response?.status === 401) {
      return "Sua sessão expirou. Entre novamente para consultar os horários.";
    }

    if (erro.response?.status === 403) {
      return "É necessário entrar com uma conta de cliente para consultar horários e agendar.";
    }
  }

  return obterMensagemErro(erro);
}

export default function BookingForm() {
  const location = useLocation();
  const [autenticado, setAutenticado] = useState(() =>
    authService.isAuthenticated("cliente")
  );
  const [mostrarAviso, setMostrarAviso] = useState(() => !autenticado);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [acrescimos, setAcrescimos] = useState<Servico[]>([]);
  const [carregandoCatalogo, setCarregandoCatalogo] = useState(true);
  const [erroCatalogo, setErroCatalogo] = useState("");
  const [horarios, setHorarios] = useState<string[]>([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [erroHorarios, setErroHorarios] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState("");
  const [agendamentoCriado, setAgendamentoCriado] =
    useState<AgendamentoCriado | null>(null);
  const [dadosDoFormulario, setDadosDoFormulario] = useState({
    placa: "",
    veiculo: "",
    servico: "",
    data: "",
    horario: "",
    observacoes: "",
  });

  const [acrescimosMarcados, setAcrescimosMarcados] = useState<number[]>([]);
  const servicoSelecionado = servicos.find(
    (servico) => servico.id_servico === Number(dadosDoFormulario.servico)
  );
  const acrescimosSelecionados = acrescimos.filter((acrescimo) =>
    acrescimosMarcados.includes(acrescimo.id_servico)
  );
  const totalEstimado = servicoSelecionado
    ? ([servicoSelecionado, ...acrescimosSelecionados].reduce(
        (totalEmCentavos, item) =>
          totalEmCentavos + Math.round(item.preco * 100),
        0
      ) /
        100)
    : null;

  useEffect(() => {
    let cancelado = false;

    Promise.all([
      servicoService.listarPorCategoria(CATEGORIA_PRINCIPAL),
      servicoService.listarPorCategoria(CATEGORIA_EXTRA),
    ])
      .then(([servicosDisponiveis, acrescimosDisponiveis]) => {
        if (cancelado) return;
        setServicos(servicosDisponiveis);
        setAcrescimos(acrescimosDisponiveis);
        setDadosDoFormulario((anterior) => ({
          ...anterior,
          servico: servicosDisponiveis[0]
            ? String(servicosDisponiveis[0].id_servico)
            : "",
        }));
      })
      .catch((erro: unknown) => {
        if (!cancelado) setErroCatalogo(obterMensagemErro(erro));
      })
      .finally(() => {
        if (!cancelado) setCarregandoCatalogo(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    if (!autenticado || !dadosDoFormulario.data) return;

    let cancelado = false;

    agendamentoService
      .listarHorarios(dadosDoFormulario.data)
      .then((horariosDisponiveis) => {
        if (!cancelado) {
          setHorarios(horariosDisponiveis);
          setCarregandoHorarios(false);
        }
      })
      .catch((erro: unknown) => {
        if (!cancelado) {
          setHorarios([]);
          setErroHorarios(mensagemErroDeAgendamento(erro));
          setCarregandoHorarios(false);
        }
      })

    return () => {
      cancelado = true;
    };
  }, [autenticado, dadosDoFormulario.data]);

  const aoMudarCampo = (
    evento: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = evento.target;
    if (name === "data") {
      setHorarios([]);
      setErroHorarios("");
      setCarregandoHorarios(Boolean(autenticado && value));
    }
    setDadosDoFormulario({
      ...dadosDoFormulario,
      [name]: name === "placa" ? mascararPlaca(value) : value,
      ...(name === "data" ? { horario: "" } : {}),
    });
    setErroEnvio("");
    setAgendamentoCriado(null);
  };

  const marcarOuDesmarcarAcrescimo = (idDoAcrescimo: number) => {
    if (acrescimosMarcados.includes(idDoAcrescimo)) {
      setAcrescimosMarcados(
        acrescimosMarcados.filter((id) => id !== idDoAcrescimo)
      );
    } else {
      setAcrescimosMarcados([...acrescimosMarcados, idDoAcrescimo]);
    }
  };

  const aoEnviarFormulario = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    if (!authService.isAuthenticated()) {
      setMostrarAviso(true);
      return;
    }

    if (!dataNaoEstaNoPassado(dadosDoFormulario.data)) {
      window.alert("Selecione uma data de hoje ou futura para o agendamento.");
      return;
    }

    if (!validarPlaca(dadosDoFormulario.placa)) {
      setErroEnvio("Informe uma placa válida (ex.: ABC-1234 ou ABC-1D23).");
      return;
    }

    setEnviando(true);
    setErroEnvio("");
    setAgendamentoCriado(null);

    try {
      const resultado = await agendamentoService.criar({
        placa: dadosDoFormulario.placa,
        veiculo: dadosDoFormulario.veiculo,
        servicoId: Number(dadosDoFormulario.servico),
        data: dadosDoFormulario.data,
        horario: dadosDoFormulario.horario,
        observacoes: dadosDoFormulario.observacoes,
        extras: acrescimosMarcados,
      });

      setAgendamentoCriado(resultado);
    } catch (erro: unknown) {
      setErroEnvio(obterMensagemErro(erro));

      if (axios.isAxiosError(erro) && erro.response?.status === 401) {
        authService.logout("cliente");
        setAutenticado(false);
        setMostrarAviso(true);
        setHorarios([]);
        setCarregandoHorarios(false);
      } else if (axios.isAxiosError(erro) && erro.response?.status === 403) {
        setErroEnvio(mensagemErroDeAgendamento(erro));
      }

      if (axios.isAxiosError(erro) && erro.response?.status === 409) {
        setDadosDoFormulario((anterior) => ({ ...anterior, horario: "" }));
        try {
          setHorarios(
            await agendamentoService.listarHorarios(dadosDoFormulario.data)
          );
        } catch (erroHorarios: unknown) {
          setHorarios([]);
          setErroHorarios(obterMensagemErro(erroHorarios));
        }
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <h1 className={styles.titulo}>Agende seu <span>horário</span></h1>
        <p className={styles.subtitulo}>
          Escolha os serviços e encontre o melhor horário para cuidar do seu veículo.
        </p>
      </header>

      <form
        className={styles.cartao}
        onSubmit={aoEnviarFormulario}
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
              value={dadosDoFormulario.placa}
              onChange={aoMudarCampo}
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
              value={dadosDoFormulario.veiculo}
              onChange={aoMudarCampo}
              required
            />
          </label>
        </div>

        <label className={styles.campo}>
          <span className={styles.rotulo}>Serviço</span>
          <select
            className={`${styles.entrada} ${styles.listaSuspensa}`}
            name="servico"
            value={dadosDoFormulario.servico}
            onChange={aoMudarCampo}
            disabled={carregandoCatalogo || servicos.length === 0}
            required
          >
            <option value="" disabled>
              {carregandoCatalogo
                ? "Carregando serviços..."
                : erroCatalogo || (servicos.length ? "Selecione" : "Nenhum serviço disponível")}
            </option>
            {servicos.map((servico) => (
              <option key={servico.id_servico} value={servico.id_servico}>
                {servico.nome_servico} — {formatarPreco(servico.preco)}
              </option>
            ))}
          </select>
        </label>
        {erroCatalogo && <p className={styles.mensagemErro} role="alert">{erroCatalogo}</p>}

        <fieldset className={`${styles.campo} ${styles.grupo}`}>
          <legend className={styles.rotulo}>Acréscimos opcionais</legend>

          <div className={styles.gradeDeAcrescimos}>
            {carregandoCatalogo ? (
              <p>Carregando acréscimos...</p>
            ) : erroCatalogo ? (
              <p>Não foi possível carregar os acréscimos.</p>
            ) : acrescimos.length === 0 ? (
              <p>Nenhum acréscimo disponível.</p>
            ) : acrescimos.map((acrescimo) => {
              const estaMarcado = acrescimosMarcados.includes(acrescimo.id_servico);

              return (
                <button
                  key={acrescimo.id_servico}
                  type="button"
                  className={`${styles.botaoAcrescimo} ${estaMarcado ? styles.marcado : ""}`}
                  aria-pressed={estaMarcado}
                  onClick={() => marcarOuDesmarcarAcrescimo(acrescimo.id_servico)}
                >
                  <span>{acrescimo.nome_servico}</span>
                  <span className={styles.precoDoAcrescimo}>
                    +{formatarPreco(acrescimo.preco)}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className={styles.linha}>
          <label className={styles.campo}>
            <span className={styles.rotulo}>Data</span>
            <input
              className={styles.entrada}
              type="date"
              name="data"
              min={dataLocalAtual()}
              value={dadosDoFormulario.data}
              onChange={aoMudarCampo}
              required
            />
          </label>

          <label className={styles.campo}>
            <span className={styles.rotulo}>Horário</span>
            <select
              className={`${styles.entrada} ${styles.listaSuspensa}`}
              name="horario"
              value={dadosDoFormulario.horario}
              onChange={aoMudarCampo}
              disabled={!dadosDoFormulario.data || carregandoHorarios || !horarios.length}
              required
            >
              <option value="" disabled>
                {!dadosDoFormulario.data
                  ? "Escolha uma data primeiro"
                  : !autenticado
                    ? "Entre para consultar os horários"
                  : carregandoHorarios
                    ? "Carregando horários..."
                    : erroHorarios || (horarios.length ? "Selecione" : "Sem horários disponíveis")}
              </option>
              {horarios.map((horario) => (
                <option key={horario} value={horario}>
                  {horario}
                </option>
              ))}
            </select>
          </label>
        </div>
        {erroHorarios && <p className={styles.mensagemErro} role="alert">{erroHorarios}</p>}
        {!autenticado && dadosDoFormulario.data && (
          <p className={styles.notaTotal}>
            <Link to="/autenticacao/login" state={{ from: location }}>
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
            value={dadosDoFormulario.observacoes}
            onChange={aoMudarCampo}
          />
        </label>

        {erroEnvio && <p className={styles.mensagemErro} role="alert">{erroEnvio}</p>}
        {agendamentoCriado && (
          <p className={styles.mensagemSucesso} role="status">
            Agendamento #{agendamentoCriado.id} realizado com sucesso. Total:{" "}
            {formatarPreco(agendamentoCriado.total)}.
          </p>
        )}

        <div className={styles.rodape}>
          {servicoSelecionado && (
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

      {!autenticado && mostrarAviso && (
        <div className={styles.sobreposicao}>
          <section
            className={styles.alerta}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="aviso-login-titulo"
            aria-describedby="aviso-login-descricao"
          >
            <button
              className={styles.fecharAviso}
              type="button"
              aria-label="Fechar aviso"
              onClick={() => setMostrarAviso(false)}
            >
              ×
            </button>
            <span className={styles.alertaEtiqueta}>SUA CONTA NA BRITO ESTÉTICA</span>
            <h2 id="aviso-login-titulo">Entre para agendar</h2>
            <p id="aviso-login-descricao">
              Para realizar um agendamento, entre na sua conta ou faça seu cadastro gratuito.
            </p>
            <div className={styles.acoesAviso}>
              <Link
                className={styles.botaoCadastro}
                to="/autenticacao/cadastro"
                state={{ from: location }}
              >
                Criar cadastro
              </Link>
              <Link
                className={styles.linkLogin}
                to="/autenticacao/login"
                state={{ from: location }}
              >
                Já tenho cadastro — Entrar
              </Link>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}