import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useUsuario } from "../../../contexts/useUsuario";
import { authService } from "../../../services/auth";
import { agendamentoService } from "../../../services/agendamentos";
import { servicoService } from "../../../services/services";
import type { Servico } from "../../../services/services";
import FormAgendamento, {
  type ResumoAgendamento,
} from "../../../components/FormAgendamento";
import {
  dataEhDomingo,
  dataLocalAtual,
  dataNaoEstaNoPassado,
} from "../../../utils/datas";
import { mascararPlaca, validarPlaca } from "../../../utils/placa";
import { obterMensagemErro } from "../../../utils/erros";

import styles from "./styles.module.css";

// Declara constante 'CATEGORIA_PRINCIPAL'.
const CATEGORIA_PRINCIPAL = 1;
// Declara constante 'CATEGORIA_EXTRA'.
const CATEGORIA_EXTRA = 2;

// Declara constante 'DADOS_INICIAIS_DO_FORMULARIO'.
const DADOS_INICIAIS_DO_FORMULARIO = {
  placa: "",
  veiculo: "",
  servico: "",
  data: "",
  horario: "",
  observacoes: "",
};

function mensagemErroDeAgendamento(erro: unknown): string {
  // Condição: axios.isAxiosError(erro).
  if (axios.isAxiosError(erro)) {
    // Condição: erro.response?.status === 401.
    if (erro.response?.status === 401) {
      // Retorna "Sua sessão expirou. Entre novamente para consultar os horários.".
      return "Sua sessão expirou. Entre novamente para consultar os horários.";
    }

    // Condição: erro.response?.status === 403.
    if (erro.response?.status === 403) {
      // Retorna "É necessário entrar com uma conta de cliente para consultar horários e agendar.".
      return "É necessário entrar com uma conta de cliente para consultar horários e agendar.";
    }
  }

  // Retorna obterMensagemErro(erro).
  return obterMensagemErro(erro);
}

export default function BookingForm() {
  // Hook useLocation: acessa URL/estado atual da navegação em 'location'.
  const location = useLocation();
  const { cliente } = useUsuario();
  // Declara constante 'servicoSolicitado'.
  const servicoSolicitado = Number(
    new URLSearchParams(location.search).get("servicoId")
  );
  // Estado React: [autenticado, setAutenticado] criado com useState; atualizar o setter causa re-render do componente.
  const [autenticado, setAutenticado] = useState(() =>
    // Chamada: authService.isAuthenticated("cliente").
    authService.isAuthenticated("cliente")
  );
  // Estado React: [mostrarAviso, setMostrarAviso] criado com useState; atualizar o setter causa re-render do componente.
  const [mostrarAviso, setMostrarAviso] = useState(() => !autenticado);
  // Estado React: [servicos, setServicos] criado com useState; atualizar o setter causa re-render do componente.
  const [servicos, setServicos] = useState<Servico[]>([]);
  // Estado React: [acrescimos, setAcrescimos] criado com useState; atualizar o setter causa re-render do componente.
  const [acrescimos, setAcrescimos] = useState<Servico[]>([]);
  // Estado React: [carregandoCatalogo, setCarregandoCatalogo] criado com useState; atualizar o setter causa re-render do componente.
  const [carregandoCatalogo, setCarregandoCatalogo] = useState(true);
  // Estado React: [erroCatalogo, setErroCatalogo] criado com useState; atualizar o setter causa re-render do componente.
  const [erroCatalogo, setErroCatalogo] = useState("");
  // Estado React: [horarios, setHorarios] criado com useState; atualizar o setter causa re-render do componente.
  const [horarios, setHorarios] = useState<string[]>([]);
  // Estado React: [carregandoHorarios, setCarregandoHorarios] criado com useState; atualizar o setter causa re-render do componente.
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  // Estado React: [erroHorarios, setErroHorarios] criado com useState; atualizar o setter causa re-render do componente.
  const [erroHorarios, setErroHorarios] = useState("");
  // Estado React: [enviando, setEnviando] criado com useState; atualizar o setter causa re-render do componente.
  const [enviando, setEnviando] = useState(false);
  // Estado React: [erroEnvio, setErroEnvio] criado com useState; atualizar o setter causa re-render do componente.
  const [erroEnvio, setErroEnvio] = useState("");
  // Estado React: [resumoCriado, setResumoCriado] criado com useState; atualizar o setter causa re-render do componente.
  const [resumoCriado, setResumoCriado] = useState<ResumoAgendamento | null>(
    null
  );
  // Estado React: [dadosDoFormulario, setDadosDoFormulario] criado com useState; atualizar o setter causa re-render do componente.
  const [dadosDoFormulario, setDadosDoFormulario] = useState(
    DADOS_INICIAIS_DO_FORMULARIO
  );

  // Estado React: [acrescimosMarcados, setAcrescimosMarcados] criado com useState; atualizar o setter causa re-render do componente.
  const [acrescimosMarcados, setAcrescimosMarcados] = useState<number[]>([]);
  // Declara constante 'servicoSelecionado'.
  const servicoSelecionado = servicos.find(
    (servico) => servico.id_servico === Number(dadosDoFormulario.servico)
  );
  // Declara constante 'acrescimosSelecionados'.
  const acrescimosSelecionados = acrescimos.filter((acrescimo) =>
    // Chamada: acrescimosMarcados.includes(acrescimo.id_servico).
    acrescimosMarcados.includes(acrescimo.id_servico)
  );
  // Declara constante 'totalEstimado'.
  const totalEstimado = servicoSelecionado
    ? ([servicoSelecionado, ...acrescimosSelecionados].reduce(
        (totalEmCentavos, item) =>
          totalEmCentavos + Math.round(item.preco * 100),
        0
      ) /
        100)
    : null;

  // Efeito React: executa código colateral após render; dependências controlam quando reexecuta.
  useEffect(() => {
    let cancelado = false;

    // Chamada: Promise.all([.
    Promise.all([
      // Chamada: servicoService.listarPorCategoria(CATEGORIA_PRINCIPAL),.
      servicoService.listarPorCategoria(CATEGORIA_PRINCIPAL),
      // Chamada: servicoService.listarPorCategoria(CATEGORIA_EXTRA),.
      servicoService.listarPorCategoria(CATEGORIA_EXTRA),
    ])
      // Chamada: .then(([servicosDisponiveis, acrescimosDisponiveis]) => {.
      .then(([servicosDisponiveis, acrescimosDisponiveis]) => {
        if (cancelado) return;
        // Chamada: setServicos(servicosDisponiveis);.
        setServicos(servicosDisponiveis);
        // Chamada: setAcrescimos(acrescimosDisponiveis);.
        setAcrescimos(acrescimosDisponiveis);
        // Declara constante 'servicoInicial'.
        const servicoInicial =
          // Chamada: servicosDisponiveis.find(.
          servicosDisponiveis.find(
            (servico) => servico.id_servico === servicoSolicitado
          ) ?? servicosDisponiveis[0];
        // Chamada: setDadosDoFormulario((anterior) => ({.
        setDadosDoFormulario((anterior) => ({
          ...anterior,
          servico: servicoInicial ? String(servicoInicial.id_servico) : "",
        }));
      })
      // Chamada: .catch((erro: unknown) => {.
      .catch((erro: unknown) => {
        if (!cancelado) setErroCatalogo(obterMensagemErro(erro));
      })
      // Chamada: .finally(() => {.
      .finally(() => {
        if (!cancelado) setCarregandoCatalogo(false);
      });

    return () => {
      // Atribuição: cancelado = true;.
      cancelado = true;
    };
  }, [servicoSolicitado]);

  // Efeito React: executa código colateral após render; dependências controlam quando reexecuta.
  useEffect(() => {
    if (!autenticado || !dadosDoFormulario.data) return;

    let cancelado = false;

    agendamentoService
      // Chamada: .listarHorarios(dadosDoFormulario.data).
      .listarHorarios(dadosDoFormulario.data)
      // Chamada: .then((horariosDisponiveis) => {.
      .then((horariosDisponiveis) => {
        // Condição: !cancelado.
        if (!cancelado) {
          // Chamada: setHorarios(horariosDisponiveis);.
          setHorarios(horariosDisponiveis);
          // Chamada: setCarregandoHorarios(false);.
          setCarregandoHorarios(false);
        }
      })
      // Chamada: .catch((erro: unknown) => {.
      .catch((erro: unknown) => {
        // Condição: !cancelado.
        if (!cancelado) {
          // Chamada: setHorarios([]);.
          setHorarios([]);
          // Chamada: setErroHorarios(mensagemErroDeAgendamento(erro));.
          setErroHorarios(mensagemErroDeAgendamento(erro));
          // Chamada: setCarregandoHorarios(false);.
          setCarregandoHorarios(false);
        }
      })

    return () => {
      // Atribuição: cancelado = true;.
      cancelado = true;
    };
  }, [autenticado, dadosDoFormulario.data]);

  // Define função 'aoMudarCampo'.
  const aoMudarCampo = (
    evento: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = evento.target;
    // Condição: name === "data".
    if (name === "data") {
      // Chamada: setHorarios([]);.
      setHorarios([]);
      // Chamada: setErroEnvio("");.
      setErroEnvio("");
      // Chamada: setResumoCriado(null);.
      setResumoCriado(null);
      // Condição: dataEhDomingo(value).
      if (dataEhDomingo(value)) {
        // Chamada: setErroHorarios("A empresa não abre aos domingos. Escolha outra data.");.
        setErroHorarios("A empresa não abre aos domingos. Escolha outra data.");
        // Chamada: setCarregandoHorarios(false);.
        setCarregandoHorarios(false);
        return;
      }
      // Chamada: setErroHorarios("");.
      setErroHorarios("");
      // Chamada: setCarregandoHorarios(Boolean(autenticado && value));.
      setCarregandoHorarios(Boolean(autenticado && value));
    }
    // Chamada: setDadosDoFormulario({.
    setDadosDoFormulario({
      ...dadosDoFormulario,
      [name]: name === "placa" ? mascararPlaca(value) : value,
      // Chamada: ...(name === "data" ? { horario: "" } : {}),.
      ...(name === "data" ? { horario: "" } : {}),
    });
    // Chamada: setErroEnvio("");.
    setErroEnvio("");
    // Chamada: setResumoCriado(null);.
    setResumoCriado(null);
  };

  // Define função 'marcarOuDesmarcarAcrescimo'.
  const marcarOuDesmarcarAcrescimo = (idDoAcrescimo: number) => {
    // Condição: acrescimosMarcados.includes(idDoAcrescimo).
    if (acrescimosMarcados.includes(idDoAcrescimo)) {
      // Chamada: setAcrescimosMarcados(.
      setAcrescimosMarcados(
        // Chamada: acrescimosMarcados.filter((id) => id !== idDoAcrescimo).
        acrescimosMarcados.filter((id) => id !== idDoAcrescimo)
      );
    } else {
      // Chamada: setAcrescimosMarcados([...acrescimosMarcados, idDoAcrescimo]);.
      setAcrescimosMarcados([...acrescimosMarcados, idDoAcrescimo]);
    }
  };

  // Define função 'limparFormulario'.
  const limparFormulario = () => {
    // Chamada: setDadosDoFormulario(DADOS_INICIAIS_DO_FORMULARIO);.
    setDadosDoFormulario(DADOS_INICIAIS_DO_FORMULARIO);
    // Chamada: setAcrescimosMarcados([]);.
    setAcrescimosMarcados([]);
    // Chamada: setHorarios([]);.
    setHorarios([]);
    // Chamada: setErroHorarios("");.
    setErroHorarios("");
  };

  // Define função assíncrona 'aoEnviarFormulario' (geralmente handler de evento/submit/fetch).
  const aoEnviarFormulario = async (evento: FormEvent<HTMLFormElement>) => {
    // Chamada: evento.preventDefault();.
    evento.preventDefault();

    // Condição: !authService.isAuthenticated().
    if (!authService.isAuthenticated()) {
      // Chamada: setMostrarAviso(true);.
      setMostrarAviso(true);
      return;
    }

    // Condição: !dataNaoEstaNoPassado(dadosDoFormulario.data).
    if (!dataNaoEstaNoPassado(dadosDoFormulario.data)) {
      // Chamada: window.alert("Selecione uma data de hoje ou futura para o agendamento.");.
      window.alert("Selecione uma data de hoje ou futura para o agendamento.");
      return;
    }

    // Condição: dataEhDomingo(dadosDoFormulario.data).
    if (dataEhDomingo(dadosDoFormulario.data)) {
      // Chamada: setErroEnvio("A empresa não abre aos domingos. Escolha outra data.");.
      setErroEnvio("A empresa não abre aos domingos. Escolha outra data.");
      return;
    }

    // Condição: !validarPlaca(dadosDoFormulario.placa).
    if (!validarPlaca(dadosDoFormulario.placa)) {
      // Chamada: setErroEnvio("Informe uma placa válida (ex.: ABC-1234 ou ABC-1D23).");.
      setErroEnvio("Informe uma placa válida (ex.: ABC-1234 ou ABC-1D23).");
      return;
    }

    // Chamada: setEnviando(true);.
    setEnviando(true);
    // Chamada: setErroEnvio("");.
    setErroEnvio("");
    // Chamada: setResumoCriado(null);.
    setResumoCriado(null);

    // Bloco try: captura erros de chamadas assíncronas/rede/validação.
    try {
      // Declara constante 'resultado'.
      const resultado = await agendamentoService.criar({
        placa: dadosDoFormulario.placa,
        veiculo: dadosDoFormulario.veiculo,
        servicoId: Number(dadosDoFormulario.servico),
        data: dadosDoFormulario.data,
        horario: dadosDoFormulario.horario,
        observacoes: dadosDoFormulario.observacoes,
        extras: acrescimosMarcados,
      });

      // Chamada: setResumoCriado({.
      setResumoCriado({
        id: resultado.id,
        total: resultado.total,
        nomeCliente: cliente?.nome ?? "",
        placa: dadosDoFormulario.placa,
        veiculo: dadosDoFormulario.veiculo,
        servicoPrincipal: servicoSelecionado?.nome_servico ?? "Serviço selecionado",
        servicosExtras: acrescimosSelecionados.map((acrescimo) => acrescimo.nome_servico),
        data: dadosDoFormulario.data,
        horario: dadosDoFormulario.horario,
        observacoes: dadosDoFormulario.observacoes,
      });
      // Chamada: limparFormulario();.
      limparFormulario();
    } catch (erro: unknown) {
      // Chamada: setErroEnvio(obterMensagemErro(erro));.
      setErroEnvio(obterMensagemErro(erro));

      // Condição: axios.isAxiosError(erro) && erro.response?.status === 401.
      if (axios.isAxiosError(erro) && erro.response?.status === 401) {
        // Chamada: authService.logout("cliente");.
        authService.logout("cliente");
        // Chamada: setAutenticado(false);.
        setAutenticado(false);
        // Chamada: setMostrarAviso(true);.
        setMostrarAviso(true);
        // Chamada: setHorarios([]);.
        setHorarios([]);
        // Chamada: setCarregandoHorarios(false);.
        setCarregandoHorarios(false);
      } else if (axios.isAxiosError(erro) && erro.response?.status === 403) {
        // Chamada: setErroEnvio(mensagemErroDeAgendamento(erro));.
        setErroEnvio(mensagemErroDeAgendamento(erro));
      }

      // Condição: axios.isAxiosError(erro) && erro.response?.status === 409.
      if (axios.isAxiosError(erro) && erro.response?.status === 409) {
        // Chamada: setDadosDoFormulario((anterior) => ({ ...anterior, horario: "" }));.
        setDadosDoFormulario((anterior) => ({ ...anterior, horario: "" }));
        // Bloco try: captura erros de chamadas assíncronas/rede/validação.
        try {
          // Chamada: setHorarios(.
          setHorarios(
            // Aguarda operação assíncrona: agendamentoService.listarHorarios(dadosDoFormulario.data).
            await agendamentoService.listarHorarios(dadosDoFormulario.data)
          );
        } catch (erroHorarios: unknown) {
          // Chamada: setHorarios([]);.
          setHorarios([]);
          // Chamada: setErroHorarios(obterMensagemErro(erroHorarios));.
          setErroHorarios(obterMensagemErro(erroHorarios));
        }
      }
    } finally {
      // Chamada: setEnviando(false);.
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

      <FormAgendamento
        // Atribuição: autenticado={autenticado}.
        autenticado={autenticado}
        // Atribuição: mostrarAviso={mostrarAviso}.
        mostrarAviso={mostrarAviso}
        // Atribuição: dados={dadosDoFormulario}.
        dados={dadosDoFormulario}
        // Atribuição: servicos={servicos}.
        servicos={servicos}
        // Atribuição: acrescimos={acrescimos}.
        acrescimos={acrescimos}
        // Atribuição: acrescimosMarcados={acrescimosMarcados}.
        acrescimosMarcados={acrescimosMarcados}
        // Atribuição: horarios={horarios}.
        horarios={horarios}
        // Atribuição: carregandoCatalogo={carregandoCatalogo}.
        carregandoCatalogo={carregandoCatalogo}
        // Atribuição: carregandoHorarios={carregandoHorarios}.
        carregandoHorarios={carregandoHorarios}
        // Atribuição: enviando={enviando}.
        enviando={enviando}
        // Atribuição: erroCatalogo={erroCatalogo}.
        erroCatalogo={erroCatalogo}
        // Atribuição: erroHorarios={erroHorarios}.
        erroHorarios={erroHorarios}
        // Atribuição: erroEnvio={erroEnvio}.
        erroEnvio={erroEnvio}
        // Atribuição: resumoCriado={resumoCriado}.
        resumoCriado={resumoCriado}
        // Atribuição: temServicoSelecionado={Boolean(servicoSelecionado)}.
        temServicoSelecionado={Boolean(servicoSelecionado)}
        // Atribuição: totalEstimado={totalEstimado}.
        totalEstimado={totalEstimado}
        // Atribuição: dataMinima={dataLocalAtual()}.
        dataMinima={dataLocalAtual()}
        // Atribuição: from={location}.
        from={location}
        // Atribuição: onChange={aoMudarCampo}.
        onChange={aoMudarCampo}
        // Atribuição: onToggleAcrescimo={marcarOuDesmarcarAcrescimo}.
        onToggleAcrescimo={marcarOuDesmarcarAcrescimo}
        // Atribuição: onSubmit={aoEnviarFormulario}.
        onSubmit={aoEnviarFormulario}
      />

      {!autenticado && mostrarAviso && (
        <div className={styles.sobreposicao}>
          <section
            // Atribuição: className={styles.alerta}.
            className={styles.alerta}
            // Atribuição: role="alertdialog".
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="aviso-login-titulo"
            aria-describedby="aviso-login-descricao"
          >
            <button
              // Atribuição: className={styles.fecharAviso}.
              className={styles.fecharAviso}
              // Atribuição: type="button".
              type="button"
              aria-label="Fechar aviso"
              // Atribuição: onClick={() => setMostrarAviso(false)}.
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
                // Atribuição: className={styles.botaoCadastro}.
                className={styles.botaoCadastro}
                // Atribuição: to="/autenticacao/CadastrarCliente".
                to="/autenticacao/CadastrarCliente"
                // Atribuição: state={{ from: location }}.
                state={{ from: location }}
              >
                Criar cadastro
              </Link>
              <Link
                // Atribuição: className={styles.linkLogin}.
                className={styles.linkLogin}
                // Atribuição: to="/autenticacao/LoginCliente".
                to="/autenticacao/LoginCliente"
                // Atribuição: state={{ from: location }}.
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

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/site/Agendamento/index.tsx) responsável por renderizar UI e orquestrar interações do usuário.
