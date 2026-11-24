import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUsuario } from "../../contexts/useUsuario";
import {
  agendamentoService,
  type AtualizarMeuAgendamento,
  type MeuAgendamento,
  type StatusMeuAgendamento,
} from "../../services/agendamentos";
import { authService, type PerfilCliente } from "../../services/auth";
import { servicoService, type Servico } from "../../services/services";
import {
  mascararCPF,
  mascararTelefone,
  validarNivelSenha,
} from "../../utils/cadastro";
import { urlWhatsapp } from "../../utils/contato";
import { validarCpf } from "../../utils/cpf";
import { dataEhDomingo } from "../../utils/datas";
import { obterMensagemErro } from "../../utils/erros";
import { mascararPlaca, validarPlaca } from "../../utils/placa";
import styles from "./MinhaConta.module.css";

function formatarDataHora(valor: string): string {
  const [data, hora] = valor.split(" ");
  const [ano, mes, dia] = (data ?? "").split("-");
  if (!ano || !mes || !dia) return valor;
  // Retorna `${dia}/${mes}/${ano}${hora ? ` às ${hora.slice(0, 5)}` : ""}`.
  return `${dia}/${mes}/${ano}${hora ? ` às ${hora.slice(0, 5)}` : ""}`;
}

function classeStatus(status: StatusMeuAgendamento): string {
  switch (status) {
    case "Pendente":
      // Retorna styles.statusPendente.
      return styles.statusPendente;
    case "Confirmado":
      // Retorna styles.statusConfirmado.
      return styles.statusConfirmado;
    case "Em atendimento":
      // Retorna styles.statusAtendimento.
      return styles.statusAtendimento;
    case "Concluído":
      // Retorna styles.statusConcluido.
      return styles.statusConcluido;
    case "Cancelado":
      // Retorna styles.statusCancelado.
      return styles.statusCancelado;
  }
}

function podeEditar(status: StatusMeuAgendamento): boolean {
  // Retorna status === "Pendente".
  return status === "Pendente";
}

function precisaContato(status: StatusMeuAgendamento): boolean {
  // Retorna status === "Confirmado" || status === "Em atendimento".
  return status === "Confirmado" || status === "Em atendimento";
}

function mensagemWhatsapp(
  agendamento: MeuAgendamento,
  acao: "editar" | "cancelar"
): string {
  // Declara constante 'servicos'.
  const servicos = agendamento.servicos
    // Chamada: .map((servico) => servico.nome_servico).
    .map((servico) => servico.nome_servico)
    // Chamada: .join(", ");.
    .join(", ");
  // Declara constante 'verbo'.
  const verbo = acao === "editar" ? "editar" : "cancelar";

  // Retorna `Olá! Gostaria de ${verbo} o agendamento #${agendamento.id_agendamento} de ${formatarDataHora(agendamento.data_hora)} (${agendamento.modelo_.
  return `Olá! Gostaria de ${verbo} o agendamento #${agendamento.id_agendamento} de ${formatarDataHora(agendamento.data_hora)} (${agendamento.modelo_veiculo}, placa ${agendamento.placa_veiculo}). Serviços: ${servicos}. Status atual: ${agendamento.status}.`;
}

export default function MinhaConta() {
  const { cliente, carregando, erro, recarregar } = useUsuario();
  // Hook de navegação: 'navigate' permite redirecionar programaticamente.
  const navigate = useNavigate();
  // Declara constante 'idCliente'.
  const idCliente = cliente?.id_cliente;
  // Estado React: [saindo, setSaindo] criado com useState; atualizar o setter causa re-render do componente.
  const [saindo, setSaindo] = useState(false);
  // Estado React: [agendamentos, setAgendamentos] criado com useState; atualizar o setter causa re-render do componente.
  const [agendamentos, setAgendamentos] = useState<MeuAgendamento[]>([]);
  // Estado React: [carregandoAgendamentos, setCarregandoAgendamentos] criado com useState; atualizar o setter causa re-render do componente.
  const [carregandoAgendamentos, setCarregandoAgendamentos] = useState(true);
  // Estado React: [erroAgendamentos, setErroAgendamentos] criado com useState; atualizar o setter causa re-render do componente.
  const [erroAgendamentos, setErroAgendamentos] = useState("");
  // Estado React: [mensagemSucesso, setMensagemSucesso] criado com useState; atualizar o setter causa re-render do componente.
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  // Estado React: [editandoId, setEditandoId] criado com useState; atualizar o setter causa re-render do componente.
  const [editandoId, setEditandoId] = useState<number | null>(null);
  // Estado React: [cancelandoId, setCancelandoId] criado com useState; atualizar o setter causa re-render do componente.
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);

  // Chama hook React/customizado e armazena resultado em 'carregarAgendamentos'.
  const carregarAgendamentos = useCallback(async () => {
    // Chamada: setCarregandoAgendamentos(true);.
    setCarregandoAgendamentos(true);
    // Chamada: setErroAgendamentos("");.
    setErroAgendamentos("");
    // Bloco try: captura erros de chamadas assíncronas/rede/validação.
    try {
      // Chamada: setAgendamentos(await agendamentoService.listarMeus());.
      setAgendamentos(await agendamentoService.listarMeus());
    } catch (erroApi) {
      // Chamada: setErroAgendamentos(obterMensagemErro(erroApi));.
      setErroAgendamentos(obterMensagemErro(erroApi));
    } finally {
      // Chamada: setCarregandoAgendamentos(false);.
      setCarregandoAgendamentos(false);
    }
  }, []);

  // Efeito React: executa código colateral após render; dependências controlam quando reexecuta.
  useEffect(() => {
    if (!idCliente) return;
    void Promise.resolve().then(carregarAgendamentos);
  }, [idCliente, carregarAgendamentos]);

  async function sair() {
    // Chamada: setSaindo(true);.
    setSaindo(true);
    // Aguarda operação assíncrona: authService.logoutCliente();.
    await authService.logoutCliente();
    // Chamada: navigate("/autenticacao/LoginCliente", { replace: true });.
    navigate("/autenticacao/LoginCliente", { replace: true });
  }

  async function cancelar(id: number) {
    if (!window.confirm("Deseja cancelar este agendamento?")) return;

    // Chamada: setCancelandoId(id);.
    setCancelandoId(id);
    // Chamada: setErroAgendamentos("");.
    setErroAgendamentos("");
    // Chamada: setMensagemSucesso("");.
    setMensagemSucesso("");
    // Bloco try: captura erros de chamadas assíncronas/rede/validação.
    try {
      // Aguarda operação assíncrona: agendamentoService.cancelarMeu(id);.
      await agendamentoService.cancelarMeu(id);
      // Chamada: setMensagemSucesso("Agendamento cancelado com sucesso.");.
      setMensagemSucesso("Agendamento cancelado com sucesso.");
      // Aguarda operação assíncrona: carregarAgendamentos();.
      await carregarAgendamentos();
    } catch (erroApi) {
      // Chamada: setErroAgendamentos(obterMensagemErro(erroApi));.
      setErroAgendamentos(obterMensagemErro(erroApi));
    } finally {
      // Chamada: setCancelandoId(null);.
      setCancelandoId(null);
    }
  }

  function aoSalvarEdicao() {
    // Chamada: setEditandoId(null);.
    setEditandoId(null);
    // Chamada: setMensagemSucesso("Agendamento atualizado com sucesso.");.
    setMensagemSucesso("Agendamento atualizado com sucesso.");
    void carregarAgendamentos();
  }

  // Condição: carregando && !cliente.
  if (carregando && !cliente) {
    // Retorna <main className={styles.page}><p>Carregando sua conta...</p></main>.
    return <main className={styles.page}><p>Carregando sua conta...</p></main>;
  }

  // Condição: erro || !cliente.
  if (erro || !cliente) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <p className={styles.eyebrow}>// ÁREA DO CLIENTE</p>
          <h1>Minha conta</h1>
          <p role="alert">
            {erro || "Entre na sua conta para acompanhar seus agendamentos."}
          </p>
          <div className={styles.actions}>
            <Link to="/autenticacao/LoginCliente">Entrar</Link>
            <Link to="/">Voltar para o site</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <header className={styles.cabecalho}>
          <div>
            <p className={styles.eyebrow}>// ÁREA DO CLIENTE</p>
            <h1>Olá, {cliente.nome}</h1>
          </div>
          <Link to="/agendamento" className={styles.linkAgendar}>
            Novo agendamento
          </Link>
        </header>

        <section className={styles.secao}>
          <h2>Meus agendamentos</h2>
          {mensagemSucesso && (
            <p className={styles.mensagemSucesso} role="status">
              {mensagemSucesso}
            </p>
          )}
          {carregandoAgendamentos ? (
            <p>Carregando agendamentos...</p>
          ) : erroAgendamentos ? (
            <p className={styles.mensagemErro} role="alert">{erroAgendamentos}</p>
          ) : agendamentos.length === 0 ? (
            <p>Você ainda não possui agendamentos.</p>
          ) : (
            <ul className={styles.lista}>
              {agendamentos.map((agendamento) => {
                // Declara constante 'servicoPrincipal'.
                const servicoPrincipal = agendamento.servicos.find(
                  (servico) => servico.id_categoria === 1
                );
                // Declara constante 'servicosExtras'.
                const servicosExtras = agendamento.servicos.filter(
                  (servico) => servico.id_categoria === 2
                );

                return (
                  <li key={agendamento.id_agendamento} className={styles.agendamento}>
                    <div className={styles.agendamentoTopo}>
                      <strong>{formatarDataHora(agendamento.data_hora)}</strong>
                      <span className={`${styles.status} ${classeStatus(agendamento.status)}`}>
                        {agendamento.status}
                      </span>
                    </div>
                    <p>{agendamento.modelo_veiculo} · {agendamento.placa_veiculo}</p>
                    {agendamento.servicos.length > 0 && (
                      <>
                        <p className={styles.servicos}>
                          <strong>Serviço principal:</strong>{" "}
                          {servicoPrincipal?.nome_servico ?? "Não informado"}
                        </p>
                        {servicosExtras.length > 0 && (
                          <p className={styles.servicosExtras}>
                            <strong>Adicionais:</strong>{" "}
                            {servicosExtras.map((servico) => servico.nome_servico).join(", ")}
                          </p>
                        )}
                      </>
                    )}
                    {podeEditar(agendamento.status) && (
                      <div className={styles.acoesAgendamento}>
                        <button
                          // Atribuição: type="button".
                          type="button"
                          // Atribuição: className={styles.botaoAcao}.
                          className={styles.botaoAcao}
                          // Atribuição: onClick={() => {.
                          onClick={() => {
                            // Chamada: setMensagemSucesso("");.
                            setMensagemSucesso("");
                            // Chamada: setEditandoId(agendamento.id_agendamento);.
                            setEditandoId(agendamento.id_agendamento);
                          }}
                        >
                          Editar
                        </button>
                        <button
                          // Atribuição: type="button".
                          type="button"
                          // Atribuição: className={`${styles.botaoAcao} ${styles.botaoCancelar}`}.
                          className={`${styles.botaoAcao} ${styles.botaoCancelar}`}
                          // Atribuição: onClick={() => cancelar(agendamento.id_agendamento)}.
                          onClick={() => cancelar(agendamento.id_agendamento)}
                          // Atribuição: disabled={cancelandoId === agendamento.id_agendamento}.
                          disabled={cancelandoId === agendamento.id_agendamento}
                        >
                          {cancelandoId === agendamento.id_agendamento
                            ? "Cancelando..."
                            : "Cancelar"}
                        </button>
                      </div>
                    )}
                    {precisaContato(agendamento.status) && (
                      <>
                        <p className={styles.contatoAviso}>
                          Este agendamento não pode ser alterado por aqui. Fale com a Brito pelo WhatsApp:
                        </p>
                        <div className={styles.acoesAgendamento}>
                          <a
                            // Atribuição: className={`${styles.botaoAcao} ${styles.botaoWhatsapp}`}.
                            className={`${styles.botaoAcao} ${styles.botaoWhatsapp}`}
                            // Atribuição: href={urlWhatsapp(mensagemWhatsapp(agendamento, "editar"))}.
                            href={urlWhatsapp(mensagemWhatsapp(agendamento, "editar"))}
                            // Atribuição: target="_blank".
                            target="_blank"
                            // Atribuição: rel="noopener noreferrer".
                            rel="noopener noreferrer"
                          >
                            Solicitar edição
                          </a>
                          <a
                            // Atribuição: className={`${styles.botaoAcao} ${styles.botaoWhatsapp}`}.
                            className={`${styles.botaoAcao} ${styles.botaoWhatsapp}`}
                            // Atribuição: href={urlWhatsapp(mensagemWhatsapp(agendamento, "cancelar"))}.
                            href={urlWhatsapp(mensagemWhatsapp(agendamento, "cancelar"))}
                            // Atribuição: target="_blank".
                            target="_blank"
                            // Atribuição: rel="noopener noreferrer".
                            rel="noopener noreferrer"
                          >
                            Solicitar cancelamento
                          </a>
                        </div>
                      </>
                    )}
                    {editandoId === agendamento.id_agendamento && (
                      <FormularioEdicaoAgendamento
                        // Atribuição: agendamento={agendamento}.
                        agendamento={agendamento}
                        // Atribuição: onSalvo={aoSalvarEdicao}.
                        onSalvo={aoSalvarEdicao}
                        // Atribuição: onCancelarEdicao={() => setEditandoId(null)}.
                        onCancelarEdicao={() => setEditandoId(null)}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <FormularioPerfilCliente cliente={cliente} recarregar={recarregar} />

        <section className={styles.secao}>
          <h2>Sair da conta</h2>
          <p className={styles.textoEncerramento}>Encerre sua sessão neste dispositivo.</p>
          <div className={styles.actions}>
            <button type="button" onClick={sair} disabled={saindo}>
              {saindo ? "Saindo..." : "Sair"}
            </button>
            <Link to="/">Voltar para o site</Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function FormularioEdicaoAgendamento({
  agendamento,
  onSalvo,
  onCancelarEdicao,
}: {
  agendamento: MeuAgendamento;
  onSalvo: () => void;
  onCancelarEdicao: () => void;
}) {
  // Declara constante 'horarioInicial'.
  const horarioInicial = agendamento.data_hora.slice(11, 16);
  // Estado React: [form, setForm] criado com useState; atualizar o setter causa re-render do componente.
  const [form, setForm] = useState({
    data: agendamento.data_hora.slice(0, 10),
    horario: horarioInicial,
    placa: agendamento.placa_veiculo,
    modelo: agendamento.modelo_veiculo,
  });
  // Estado React: [horarios, setHorarios] criado com useState; atualizar o setter causa re-render do componente.
  const [horarios, setHorarios] = useState<string[]>([horarioInicial]);
  // Estado React: [servicosPrincipais, setServicosPrincipais] criado com useState; atualizar o setter causa re-render do componente.
  const [servicosPrincipais, setServicosPrincipais] = useState<Servico[]>([]);
  // Estado React: [servicosExtrasDisponiveis, setServicosExtrasDisponiveis] criado com useState; atualizar o setter causa re-render do componente.
  const [servicosExtrasDisponiveis, setServicosExtrasDisponiveis] = useState<Servico[]>([]);
  // Estado React: [principalId, setPrincipalId] criado com useState; atualizar o setter causa re-render do componente.
  const [principalId, setPrincipalId] = useState(
    // Chamada: agendamento.servicos.find((servico) => servico.id_categoria === 1)?.id_servico ?? 0.
    agendamento.servicos.find((servico) => servico.id_categoria === 1)?.id_servico ?? 0
  );
  // Estado React: [extrasSelecionados, setExtrasSelecionados] criado com useState; atualizar o setter causa re-render do componente.
  const [extrasSelecionados, setExtrasSelecionados] = useState<number[]>(
    agendamento.servicos
      // Chamada: .filter((servico) => servico.id_categoria === 2).
      .filter((servico) => servico.id_categoria === 2)
      // Chamada: .map((servico) => servico.id_servico).
      .map((servico) => servico.id_servico)
  );
  // Estado React: [salvando, setSalvando] criado com useState; atualizar o setter causa re-render do componente.
  const [salvando, setSalvando] = useState(false);
  // Estado React: [erro, setErro] criado com useState; atualizar o setter causa re-render do componente.
  const [erro, setErro] = useState("");

  // Efeito React: executa código colateral após render; dependências controlam quando reexecuta.
  useEffect(() => {
    void Promise.resolve()
      // Chamada: .then(() =>.
      .then(() =>
        // Chamada: Promise.all([.
        Promise.all([
          // Chamada: servicoService.listarPorCategoria(1),.
          servicoService.listarPorCategoria(1),
          // Chamada: servicoService.listarPorCategoria(2),.
          servicoService.listarPorCategoria(2),
        ])
      )
      // Chamada: .then(([principais, extras]) => {.
      .then(([principais, extras]) => {
        // Chamada: setServicosPrincipais(principais);.
        setServicosPrincipais(principais);
        // Chamada: setServicosExtrasDisponiveis(extras);.
        setServicosExtrasDisponiveis(extras);
      })
      // Chamada: .catch(() => setErro("Não foi possível carregar os serviços disponíveis."));.
      .catch(() => setErro("Não foi possível carregar os serviços disponíveis."));
  }, []);

  // Efeito React: executa código colateral após render; dependências controlam quando reexecuta.
  useEffect(() => {
    void Promise.resolve()
      // Chamada: .then(() => agendamentoService.listarHorarios(form.data)).
      .then(() => agendamentoService.listarHorarios(form.data))
      // Chamada: .then((lista) => setHorarios(Array.from(new Set([horarioInicial, ...lista])).sort())).
      .then((lista) => setHorarios(Array.from(new Set([horarioInicial, ...lista])).sort()))
      // Chamada: .catch(() => setHorarios([horarioInicial]));.
      .catch(() => setHorarios([horarioInicial]));
  }, [form.data, horarioInicial]);

  function atualizarCampo(campo: keyof typeof form, valor: string) {
    // Chamada: setForm((atual) => ({ ...atual, [campo]: valor }));.
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  function alternarExtra(idServico: number) {
    // Chamada: setExtrasSelecionados((atual) =>.
    setExtrasSelecionados((atual) =>
      // Chamada: atual.includes(idServico).
      atual.includes(idServico)
        ? atual.filter((id) => id !== idServico)
        : [...atual, idServico]
    );
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    // Chamada: evento.preventDefault();.
    evento.preventDefault();
    // Chamada: setErro("");.
    setErro("");

    // Condição: !form.data || !form.horario.
    if (!form.data || !form.horario) {
      // Chamada: setErro("Informe a data e o horário do agendamento.");.
      setErro("Informe a data e o horário do agendamento.");
      return;
    }
    // Condição: dataEhDomingo(form.data).
    if (dataEhDomingo(form.data)) {
      // Chamada: setErro("A empresa não abre aos domingos. Escolha outra data.");.
      setErro("A empresa não abre aos domingos. Escolha outra data.");
      return;
    }
    // Condição: !validarPlaca(form.placa).
    if (!validarPlaca(form.placa)) {
      // Chamada: setErro("Informe uma placa válida (ex.: ABC-1D23).");.
      setErro("Informe uma placa válida (ex.: ABC-1D23).");
      return;
    }
    // Condição: form.modelo.trim().length < 2 || form.modelo.trim().length > 50.
    if (form.modelo.trim().length < 2 || form.modelo.trim().length > 50) {
      // Chamada: setErro("Informe o modelo do veículo (até 50 caracteres).");.
      setErro("Informe o modelo do veículo (até 50 caracteres).");
      return;
    }
    // Condição: !principalId.
    if (!principalId) {
      // Chamada: setErro("Selecione o serviço principal.");.
      setErro("Selecione o serviço principal.");
      return;
    }
    // Condição: extrasSelecionados.length > 9.
    if (extrasSelecionados.length > 9) {
      // Chamada: setErro("Selecione até 9 serviços extras.");.
      setErro("Selecione até 9 serviços extras.");
      return;
    }

    // Declara constante 'dataHora'.
    const dataHora = `${form.data}T${form.horario}:00-03:00`;
    // Condição: new Date(dataHora).getTime() <= Date.now().
    if (new Date(dataHora).getTime() <= Date.now()) {
      // Chamada: setErro("Escolha uma data e um horário futuros.");.
      setErro("Escolha uma data e um horário futuros.");
      return;
    }

    const dados: AtualizarMeuAgendamento = {
      data_hora: dataHora,
      placa_veiculo: mascararPlaca(form.placa),
      modelo_veiculo: form.modelo.trim(),
      servicos: [principalId, ...extrasSelecionados],
    };

    // Chamada: setSalvando(true);.
    setSalvando(true);
    // Bloco try: captura erros de chamadas assíncronas/rede/validação.
    try {
      // Aguarda operação assíncrona: agendamentoService.atualizarMeu(agendamento.id_agendamento, dados);.
      await agendamentoService.atualizarMeu(agendamento.id_agendamento, dados);
      // Chamada: onSalvo();.
      onSalvo();
    } catch (erroApi) {
      // Chamada: setErro(obterMensagemErro(erroApi));.
      setErro(obterMensagemErro(erroApi));
    } finally {
      // Chamada: setSalvando(false);.
      setSalvando(false);
    }
  }

  return (
    <form className={styles.formularioEdicao} onSubmit={salvar}>
      <h3>Editar agendamento</h3>
      <div className={styles.formulario}>
        <label className={styles.campo}>
          Data
          <input
            required
            // Atribuição: type="date".
            type="date"
            // Atribuição: value={form.data}.
            value={form.data}
            // Atribuição: onChange={(evento) => {.
            onChange={(evento) => {
              // Declara constante 'valor'.
              const valor = evento.target.value;
              // Condição: dataEhDomingo(valor).
              if (dataEhDomingo(valor)) {
                // Chamada: setErro("A empresa não abre aos domingos. Escolha outra data.");.
                setErro("A empresa não abre aos domingos. Escolha outra data.");
                return;
              }
              // Chamada: setErro("");.
              setErro("");
              // Chamada: setForm((atual) => ({ ...atual, data: valor, horario: "" }));.
              setForm((atual) => ({ ...atual, data: valor, horario: "" }));
            }}
          />
        </label>
        <label className={styles.campo}>
          Horário
          <select
            required
            // Atribuição: value={form.horario}.
            value={form.horario}
            // Atribuição: onChange={(evento) => atualizarCampo("horario", evento.target.value)}.
            onChange={(evento) => atualizarCampo("horario", evento.target.value)}
          >
            <option value="">Selecione</option>
            {horarios.map((horario) => (
              <option key={horario} value={horario}>
                {horario}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.campo}>
          Placa
          <input
            required
            // Atribuição: maxLength={8}.
            maxLength={8}
            // Atribuição: value={form.placa}.
            value={form.placa}
            // Atribuição: onChange={(evento) => atualizarCampo("placa", mascararPlaca(evento.target.value))}.
            onChange={(evento) => atualizarCampo("placa", mascararPlaca(evento.target.value))}
          />
        </label>
        <label className={styles.campo}>
          Modelo do veículo
          <input
            required
            // Atribuição: maxLength={50}.
            maxLength={50}
            // Atribuição: value={form.modelo}.
            value={form.modelo}
            // Atribuição: onChange={(evento) => atualizarCampo("modelo", evento.target.value)}.
            onChange={(evento) => atualizarCampo("modelo", evento.target.value)}
          />
        </label>
      </div>
      <fieldset className={styles.opcoesServicos}>
        <legend>Serviço principal</legend>
        {servicosPrincipais.length === 0 ? (
          <p>Carregando serviços...</p>
        ) : (
          // Chamada: servicosPrincipais.map((servico) => (.
          servicosPrincipais.map((servico) => (
            <label key={servico.id_servico} className={styles.opcaoServico}>
              <input
                // Atribuição: type="radio".
                type="radio"
                // Atribuição: name="servicoPrincipal".
                name="servicoPrincipal"
                // Atribuição: checked={principalId === servico.id_servico}.
                checked={principalId === servico.id_servico}
                // Atribuição: onChange={() => setPrincipalId(servico.id_servico)}.
                onChange={() => setPrincipalId(servico.id_servico)}
              />
              {servico.nome_servico}
            </label>
          ))
        )}
      </fieldset>
      <fieldset className={styles.opcoesServicos}>
        <legend>Serviços extras (opcional)</legend>
        {servicosExtrasDisponiveis.length === 0 ? (
          <p>Nenhum serviço extra disponível.</p>
        ) : (
          // Chamada: servicosExtrasDisponiveis.map((servico) => (.
          servicosExtrasDisponiveis.map((servico) => (
            <label key={servico.id_servico} className={styles.opcaoServico}>
              <input
                // Atribuição: type="checkbox".
                type="checkbox"
                // Atribuição: checked={extrasSelecionados.includes(servico.id_servico)}.
                checked={extrasSelecionados.includes(servico.id_servico)}
                // Atribuição: onChange={() => alternarExtra(servico.id_servico)}.
                onChange={() => alternarExtra(servico.id_servico)}
              />
              {servico.nome_servico}
            </label>
          ))
        )}
      </fieldset>
      <div className={styles.actionRow}>
        <button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
        <button
          // Atribuição: type="button".
          type="button"
          // Atribuição: className={styles.botaoSecundario}.
          className={styles.botaoSecundario}
          // Atribuição: onClick={onCancelarEdicao}.
          onClick={onCancelarEdicao}
        >
          Voltar
        </button>
        {erro && <p className={styles.mensagemErro} role="alert">{erro}</p>}
      </div>
    </form>
  );
}

function FormularioPerfilCliente({
  cliente,
  recarregar,
}: {
  cliente: PerfilCliente;
  recarregar: () => void;
}) {
  // Estado React: [form, setForm] criado com useState; atualizar o setter causa re-render do componente.
  const [form, setForm] = useState({
    nome: cliente.nome,
    cpf: cliente.cpf ?? "",
    telefone: cliente.telefone ?? "",
    senha: "",
    confirmarSenha: "",
  });
  // Estado React: [salvando, setSalvando] criado com useState; atualizar o setter causa re-render do componente.
  const [salvando, setSalvando] = useState(false);
  // Estado React: [erro, setErro] criado com useState; atualizar o setter causa re-render do componente.
  const [erro, setErro] = useState("");
  // Estado React: [sucesso, setSucesso] criado com useState; atualizar o setter causa re-render do componente.
  const [sucesso, setSucesso] = useState("");

  function atualizarCampo(campo: keyof typeof form, valor: string) {
    // Chamada: setForm((atual) => ({ ...atual, [campo]: valor }));.
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    // Chamada: evento.preventDefault();.
    evento.preventDefault();
    // Chamada: setErro("");.
    setErro("");
    // Chamada: setSucesso("");.
    setSucesso("");

    // Condição: !form.nome.trim().
    if (!form.nome.trim()) {
      // Chamada: setErro("Informe seu nome.");.
      setErro("Informe seu nome.");
      return;
    }
    // Condição: !validarCpf(form.cpf).
    if (!validarCpf(form.cpf)) {
      // Chamada: setErro("Informe um CPF válido.");.
      setErro("Informe um CPF válido.");
      return;
    }
    // Condição: ![10, 11].includes(form.telefone.replace(/\D/g, "").length).
    if (![10, 11].includes(form.telefone.replace(/\D/g, "").length)) {
      // Chamada: setErro("Informe um telefone com DDD e 10 ou 11 dígitos.");.
      setErro("Informe um telefone com DDD e 10 ou 11 dígitos.");
      return;
    }
    // Condição: form.senha || form.confirmarSenha.
    if (form.senha || form.confirmarSenha) {
      // Declara constante 'erroSenha'.
      const erroSenha = validarNivelSenha(form.senha);
      // Condição: erroSenha.
      if (erroSenha) {
        // Chamada: setErro(erroSenha);.
        setErro(erroSenha);
        return;
      }
      // Condição: form.senha !== form.confirmarSenha.
      if (form.senha !== form.confirmarSenha) {
        // Chamada: setErro("As senhas não coincidem.");.
        setErro("As senhas não coincidem.");
        return;
      }
    }

    // Chamada: setSalvando(true);.
    setSalvando(true);
    // Bloco try: captura erros de chamadas assíncronas/rede/validação.
    try {
      // Aguarda operação assíncrona: authService.atualizarPerfilCliente({.
      await authService.atualizarPerfilCliente({
        nome: form.nome.trim(),
        cpf: form.cpf,
        telefone: form.telefone,
        // Chamada: ...(form.senha ? { senha: form.senha } : {}),.
        ...(form.senha ? { senha: form.senha } : {}),
      });
      // Chamada: recarregar();.
      recarregar();
      // Chamada: setSucesso("Perfil atualizado com sucesso.");.
      setSucesso("Perfil atualizado com sucesso.");
      // Chamada: setForm((atual) => ({ ...atual, senha: "", confirmarSenha: "" }));.
      setForm((atual) => ({ ...atual, senha: "", confirmarSenha: "" }));
    } catch (erroApi) {
      // Chamada: setErro(obterMensagemErro(erroApi));.
      setErro(obterMensagemErro(erroApi));
    } finally {
      // Chamada: setSalvando(false);.
      setSalvando(false);
    }
  }

  return (
    <section className={styles.secao}>
      <h2>Editar perfil</h2>
      <form className={styles.formulario} onSubmit={salvar}>
        <label className={styles.campo}>
          Nome
          <input
            required
            // Atribuição: maxLength={100}.
            maxLength={100}
            // Atribuição: value={form.nome}.
            value={form.nome}
            // Atribuição: onChange={(evento) => atualizarCampo("nome", evento.target.value)}.
            onChange={(evento) => atualizarCampo("nome", evento.target.value)}
          />
        </label>
        <label className={styles.campo}>
          E-mail (não pode ser alterado)
          <input value={cliente.email} readOnly />
        </label>
        <label className={styles.campo}>
          CPF
          <input
            required
            // Atribuição: inputMode="numeric".
            inputMode="numeric"
            // Atribuição: autoComplete="tax-id".
            autoComplete="tax-id"
            // Atribuição: maxLength={14}.
            maxLength={14}
            // Atribuição: value={form.cpf}.
            value={form.cpf}
            // Atribuição: onChange={(evento) => atualizarCampo("cpf", mascararCPF(evento.target.value))}.
            onChange={(evento) => atualizarCampo("cpf", mascararCPF(evento.target.value))}
          />
        </label>
        <label className={styles.campo}>
          Telefone
          <input
            required
            // Atribuição: inputMode="tel".
            inputMode="tel"
            // Atribuição: autoComplete="tel".
            autoComplete="tel"
            // Atribuição: maxLength={15}.
            maxLength={15}
            // Atribuição: value={form.telefone}.
            value={form.telefone}
            // Atribuição: onChange={(evento) => atualizarCampo("telefone", mascararTelefone(evento.target.value))}.
            onChange={(evento) => atualizarCampo("telefone", mascararTelefone(evento.target.value))}
          />
        </label>
        <label className={styles.campo}>
          Nova senha (opcional)
          <input
            // Atribuição: type="password".
            type="password"
            // Atribuição: autoComplete="new-password".
            autoComplete="new-password"
            // Atribuição: value={form.senha}.
            value={form.senha}
            // Atribuição: onChange={(evento) => atualizarCampo("senha", evento.target.value)}.
            onChange={(evento) => atualizarCampo("senha", evento.target.value)}
          />
        </label>
        <label className={styles.campo}>
          Confirme a nova senha
          <input
            // Atribuição: type="password".
            type="password"
            // Atribuição: autoComplete="new-password".
            autoComplete="new-password"
            // Atribuição: value={form.confirmarSenha}.
            value={form.confirmarSenha}
            // Atribuição: onChange={(evento) => atualizarCampo("confirmarSenha", evento.target.value)}.
            onChange={(evento) => atualizarCampo("confirmarSenha", evento.target.value)}
          />
        </label>
        <div className={styles.actionRow}>
          <button type="submit" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
          {erro && <p className={styles.mensagemErro} role="alert">{erro}</p>}
          {sucesso && <p className={styles.mensagemSucesso} role="status">{sucesso}</p>}
        </div>
      </form>
    </section>
  );
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/site/MinhaConta.tsx) responsável por renderizar UI e orquestrar interações do usuário.
