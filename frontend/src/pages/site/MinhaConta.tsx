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
  return `${dia}/${mes}/${ano}${hora ? ` às ${hora.slice(0, 5)}` : ""}`;
}

function classeStatus(status: StatusMeuAgendamento): string {
  switch (status) {
    case "Pendente":
      return styles.statusPendente;
    case "Confirmado":
      return styles.statusConfirmado;
    case "Em atendimento":
      return styles.statusAtendimento;
    case "Concluído":
      return styles.statusConcluido;
    case "Cancelado":
      return styles.statusCancelado;
  }
}

function podeEditar(status: StatusMeuAgendamento): boolean {
  return status === "Pendente";
}

function precisaContato(status: StatusMeuAgendamento): boolean {
  return status === "Confirmado" || status === "Em atendimento";
}

function mensagemWhatsapp(
  agendamento: MeuAgendamento,
  acao: "editar" | "cancelar"
): string {
  const servicos = agendamento.servicos
    .map((servico) => servico.nome_servico)
    .join(", ");
  const verbo = acao === "editar" ? "editar" : "cancelar";

  return `Olá! Gostaria de ${verbo} o agendamento #${agendamento.id_agendamento} de ${formatarDataHora(agendamento.data_hora)} (${agendamento.modelo_veiculo}, placa ${agendamento.placa_veiculo}). Serviços: ${servicos}. Status atual: ${agendamento.status}.`;
}

export default function MinhaConta() {
  const { cliente, carregando, erro, recarregar } = useUsuario();
  const navigate = useNavigate();
  const idCliente = cliente?.id_cliente;
  const [saindo, setSaindo] = useState(false);
  const [agendamentos, setAgendamentos] = useState<MeuAgendamento[]>([]);
  const [carregandoAgendamentos, setCarregandoAgendamentos] = useState(true);
  const [erroAgendamentos, setErroAgendamentos] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);

  const carregarAgendamentos = useCallback(async () => {
    setCarregandoAgendamentos(true);
    setErroAgendamentos("");
    try {
      setAgendamentos(await agendamentoService.listarMeus());
    } catch (erroApi) {
      setErroAgendamentos(obterMensagemErro(erroApi));
    } finally {
      setCarregandoAgendamentos(false);
    }
  }, []);

  useEffect(() => {
    if (!idCliente) return;
    void Promise.resolve().then(carregarAgendamentos);
  }, [idCliente, carregarAgendamentos]);

  async function sair() {
    setSaindo(true);
    await authService.logoutCliente();
    navigate("/autenticacao/login", { replace: true });
  }

  async function cancelar(id: number) {
    if (!window.confirm("Deseja cancelar este agendamento?")) return;

    setCancelandoId(id);
    setErroAgendamentos("");
    setMensagemSucesso("");
    try {
      await agendamentoService.cancelarMeu(id);
      setMensagemSucesso("Agendamento cancelado com sucesso.");
      await carregarAgendamentos();
    } catch (erroApi) {
      setErroAgendamentos(obterMensagemErro(erroApi));
    } finally {
      setCancelandoId(null);
    }
  }

  function aoSalvarEdicao() {
    setEditandoId(null);
    setMensagemSucesso("Agendamento atualizado com sucesso.");
    void carregarAgendamentos();
  }

  if (carregando && !cliente) {
    return <main className={styles.page}><p>Carregando sua conta...</p></main>;
  }

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
            <Link to="/autenticacao/login">Entrar</Link>
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
                const servicoPrincipal = agendamento.servicos.find(
                  (servico) => servico.id_categoria === 1
                );
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
                          type="button"
                          className={styles.botaoAcao}
                          onClick={() => {
                            setMensagemSucesso("");
                            setEditandoId(agendamento.id_agendamento);
                          }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className={`${styles.botaoAcao} ${styles.botaoCancelar}`}
                          onClick={() => cancelar(agendamento.id_agendamento)}
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
                            className={`${styles.botaoAcao} ${styles.botaoWhatsapp}`}
                            href={urlWhatsapp(mensagemWhatsapp(agendamento, "editar"))}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Solicitar edição
                          </a>
                          <a
                            className={`${styles.botaoAcao} ${styles.botaoWhatsapp}`}
                            href={urlWhatsapp(mensagemWhatsapp(agendamento, "cancelar"))}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Solicitar cancelamento
                          </a>
                        </div>
                      </>
                    )}
                    {editandoId === agendamento.id_agendamento && (
                      <FormularioEdicaoAgendamento
                        agendamento={agendamento}
                        onSalvo={aoSalvarEdicao}
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
  const horarioInicial = agendamento.data_hora.slice(11, 16);
  const [form, setForm] = useState({
    data: agendamento.data_hora.slice(0, 10),
    horario: horarioInicial,
    placa: agendamento.placa_veiculo,
    modelo: agendamento.modelo_veiculo,
  });
  const [horarios, setHorarios] = useState<string[]>([horarioInicial]);
  const [servicosPrincipais, setServicosPrincipais] = useState<Servico[]>([]);
  const [servicosExtrasDisponiveis, setServicosExtrasDisponiveis] = useState<Servico[]>([]);
  const [principalId, setPrincipalId] = useState(
    agendamento.servicos.find((servico) => servico.id_categoria === 1)?.id_servico ?? 0
  );
  const [extrasSelecionados, setExtrasSelecionados] = useState<number[]>(
    agendamento.servicos
      .filter((servico) => servico.id_categoria === 2)
      .map((servico) => servico.id_servico)
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    void Promise.resolve()
      .then(() =>
        Promise.all([
          servicoService.listarPorCategoria(1),
          servicoService.listarPorCategoria(2),
        ])
      )
      .then(([principais, extras]) => {
        setServicosPrincipais(principais);
        setServicosExtrasDisponiveis(extras);
      })
      .catch(() => setErro("Não foi possível carregar os serviços disponíveis."));
  }, []);

  useEffect(() => {
    void Promise.resolve()
      .then(() => agendamentoService.listarHorarios(form.data))
      .then((lista) => setHorarios(Array.from(new Set([horarioInicial, ...lista])).sort()))
      .catch(() => setHorarios([horarioInicial]));
  }, [form.data, horarioInicial]);

  function atualizarCampo(campo: keyof typeof form, valor: string) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  function alternarExtra(idServico: number) {
    setExtrasSelecionados((atual) =>
      atual.includes(idServico)
        ? atual.filter((id) => id !== idServico)
        : [...atual, idServico]
    );
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");

    if (!form.data || !form.horario) {
      setErro("Informe a data e o horário do agendamento.");
      return;
    }
    if (dataEhDomingo(form.data)) {
      setErro("A empresa não abre aos domingos. Escolha outra data.");
      return;
    }
    if (!validarPlaca(form.placa)) {
      setErro("Informe uma placa válida (ex.: ABC-1D23).");
      return;
    }
    if (form.modelo.trim().length < 2 || form.modelo.trim().length > 50) {
      setErro("Informe o modelo do veículo (até 50 caracteres).");
      return;
    }
    if (!principalId) {
      setErro("Selecione o serviço principal.");
      return;
    }
    if (extrasSelecionados.length > 9) {
      setErro("Selecione até 9 serviços extras.");
      return;
    }

    const dataHora = `${form.data}T${form.horario}:00-03:00`;
    if (new Date(dataHora).getTime() <= Date.now()) {
      setErro("Escolha uma data e um horário futuros.");
      return;
    }

    const dados: AtualizarMeuAgendamento = {
      data_hora: dataHora,
      placa_veiculo: mascararPlaca(form.placa),
      modelo_veiculo: form.modelo.trim(),
      servicos: [principalId, ...extrasSelecionados],
    };

    setSalvando(true);
    try {
      await agendamentoService.atualizarMeu(agendamento.id_agendamento, dados);
      onSalvo();
    } catch (erroApi) {
      setErro(obterMensagemErro(erroApi));
    } finally {
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
            type="date"
            value={form.data}
            onChange={(evento) => {
              const valor = evento.target.value;
              if (dataEhDomingo(valor)) {
                setErro("A empresa não abre aos domingos. Escolha outra data.");
                return;
              }
              setErro("");
              setForm((atual) => ({ ...atual, data: valor, horario: "" }));
            }}
          />
        </label>
        <label className={styles.campo}>
          Horário
          <select
            required
            value={form.horario}
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
            maxLength={8}
            value={form.placa}
            onChange={(evento) => atualizarCampo("placa", mascararPlaca(evento.target.value))}
          />
        </label>
        <label className={styles.campo}>
          Modelo do veículo
          <input
            required
            maxLength={50}
            value={form.modelo}
            onChange={(evento) => atualizarCampo("modelo", evento.target.value)}
          />
        </label>
      </div>
      <fieldset className={styles.opcoesServicos}>
        <legend>Serviço principal</legend>
        {servicosPrincipais.length === 0 ? (
          <p>Carregando serviços...</p>
        ) : (
          servicosPrincipais.map((servico) => (
            <label key={servico.id_servico} className={styles.opcaoServico}>
              <input
                type="radio"
                name="servicoPrincipal"
                checked={principalId === servico.id_servico}
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
          servicosExtrasDisponiveis.map((servico) => (
            <label key={servico.id_servico} className={styles.opcaoServico}>
              <input
                type="checkbox"
                checked={extrasSelecionados.includes(servico.id_servico)}
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
          type="button"
          className={styles.botaoSecundario}
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
  const [form, setForm] = useState({
    nome: cliente.nome,
    cpf: cliente.cpf ?? "",
    telefone: cliente.telefone ?? "",
    senha: "",
    confirmarSenha: "",
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  function atualizarCampo(campo: keyof typeof form, valor: string) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");
    setSucesso("");

    if (!form.nome.trim()) {
      setErro("Informe seu nome.");
      return;
    }
    if (!validarCpf(form.cpf)) {
      setErro("Informe um CPF válido.");
      return;
    }
    if (![10, 11].includes(form.telefone.replace(/\D/g, "").length)) {
      setErro("Informe um telefone com DDD e 10 ou 11 dígitos.");
      return;
    }
    if (form.senha || form.confirmarSenha) {
      const erroSenha = validarNivelSenha(form.senha);
      if (erroSenha) {
        setErro(erroSenha);
        return;
      }
      if (form.senha !== form.confirmarSenha) {
        setErro("As senhas não coincidem.");
        return;
      }
    }

    setSalvando(true);
    try {
      await authService.atualizarPerfilCliente({
        nome: form.nome.trim(),
        cpf: form.cpf,
        telefone: form.telefone,
        ...(form.senha ? { senha: form.senha } : {}),
      });
      recarregar();
      setSucesso("Perfil atualizado com sucesso.");
      setForm((atual) => ({ ...atual, senha: "", confirmarSenha: "" }));
    } catch (erroApi) {
      setErro(obterMensagemErro(erroApi));
    } finally {
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
            maxLength={100}
            value={form.nome}
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
            inputMode="numeric"
            autoComplete="tax-id"
            maxLength={14}
            value={form.cpf}
            onChange={(evento) => atualizarCampo("cpf", mascararCPF(evento.target.value))}
          />
        </label>
        <label className={styles.campo}>
          Telefone
          <input
            required
            inputMode="tel"
            autoComplete="tel"
            maxLength={15}
            value={form.telefone}
            onChange={(evento) => atualizarCampo("telefone", mascararTelefone(evento.target.value))}
          />
        </label>
        <label className={styles.campo}>
          Nova senha (opcional)
          <input
            type="password"
            autoComplete="new-password"
            value={form.senha}
            onChange={(evento) => atualizarCampo("senha", evento.target.value)}
          />
        </label>
        <label className={styles.campo}>
          Confirme a nova senha
          <input
            type="password"
            autoComplete="new-password"
            value={form.confirmarSenha}
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
