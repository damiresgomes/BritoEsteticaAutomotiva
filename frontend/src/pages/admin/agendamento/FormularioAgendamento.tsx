import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import HeaderAdmin from "../../../components/HeaderAdmin";
import styles from "../../../components/AdminCrud/styles.module.css";
import { clienteService, type ClienteAdmin } from "../../../services/clients";
import { agendamentoService, type StatusAgendamento } from "../../../services/agendamentos";
import { servicoService, type Servico } from "../../../services/services";
import { obterMensagemErro } from "../../../utils/erros";
import { dataEhDomingo, dataLocalAtual } from "../../../utils/datas";

type Props = { id?: number };

type Formulario = {
  clienteId: string;
  placa: string;
  veiculo: string;
  servicoId: string;
  extras: number[];
  data: string;
  horario: string;
  observacoes: string;
  status: StatusAgendamento;
};

const FORMULARIO_VAZIO: Formulario = {
  clienteId: "",
  placa: "",
  veiculo: "",
  servicoId: "",
  extras: [],
  data: "",
  horario: "",
  observacoes: "",
  status: "Pendente",
};

export default function FormularioAgendamento({ id }: Props) {
  // Estado React: [form, setForm] criado com useState; atualizar o setter causa re-render do componente.
  const [form, setForm] = useState<Formulario>(FORMULARIO_VAZIO);
  // Estado React: [clientes, setClientes] criado com useState; atualizar o setter causa re-render do componente.
  const [clientes, setClientes] = useState<ClienteAdmin[]>([]);
  // Estado React: [servicos, setServicos] criado com useState; atualizar o setter causa re-render do componente.
  const [servicos, setServicos] = useState<Servico[]>([]);
  // Estado React: [extras, setExtras] criado com useState; atualizar o setter causa re-render do componente.
  const [extras, setExtras] = useState<Servico[]>([]);
  // Estado React: [carregando, setCarregando] criado com useState; atualizar o setter causa re-render do componente.
  const [carregando, setCarregando] = useState(true);
  // Estado React: [erro, setErro] criado com useState; atualizar o setter causa re-render do componente.
  const [erro, setErro] = useState("");
  // Estado React: [falhaCarregamento, setFalhaCarregamento] criado com useState; atualizar o setter causa re-render do componente.
  const [falhaCarregamento, setFalhaCarregamento] = useState(false);
  // Estado React: [salvando, setSalvando] criado com useState; atualizar o setter causa re-render do componente.
  const [salvando, setSalvando] = useState(false);
  // Hook de navegação: 'navigate' permite redirecionar programaticamente.
  const navigate = useNavigate();

  // Efeito React: executa código colateral após render; dependências controlam quando reexecuta.
  useEffect(() => {
    let cancelado = false;

    async function carregarDados() {
      // Bloco try: captura erros de chamadas assíncronas/rede/validação.
      try {
        const [listaClientes, servicosPrincipais, servicosExtras, agendamentos] =
          // Aguarda operação assíncrona: Promise.all([.
          await Promise.all([
            // Chamada: clienteService.listar(),.
            clienteService.listar(),
            // Chamada: servicoService.listarPorCategoria(1),.
            servicoService.listarPorCategoria(1),
            // Chamada: servicoService.listarPorCategoria(2),.
            servicoService.listarPorCategoria(2),
            // Atribuição: id === undefined ? Promise.resolve([]) : agendamentoService.listarAdmin(),.
            id === undefined ? Promise.resolve([]) : agendamentoService.listarAdmin(),
          ]);

        if (cancelado) return;
        // Chamada: setClientes(listaClientes);.
        setClientes(listaClientes);
        // Chamada: setServicos(servicosPrincipais);.
        setServicos(servicosPrincipais);
        // Chamada: setExtras(servicosExtras);.
        setExtras(servicosExtras);

        // Condição: id !== undefined.
        if (id !== undefined) {
          // Declara constante 'agendamento'.
          const agendamento = agendamentos.find((item) => item.id === id);
          // Condição: !agendamento.
          if (!agendamento) {
            // Chamada: setErro("Agendamento não encontrado.");.
            setErro("Agendamento não encontrado.");
            // Chamada: setFalhaCarregamento(true);.
            setFalhaCarregamento(true);
            return;
          }
          // Chamada: setForm({.
          setForm({
            clienteId: String(agendamento.clienteId),
            placa: agendamento.placa,
            veiculo: agendamento.veiculo,
            servicoId: String(agendamento.servicoId),
            extras: agendamento.extras,
            data: agendamento.data,
            horario: agendamento.horario,
            observacoes: agendamento.observacoes ?? "",
            status: agendamento.status,
          });
        }
      } catch (erroApi) {
        // Condição: !cancelado.
        if (!cancelado) {
          // Chamada: setErro(obterMensagemErro(erroApi));.
          setErro(obterMensagemErro(erroApi));
          // Chamada: setFalhaCarregamento(true);.
          setFalhaCarregamento(true);
        }
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    void carregarDados();
    return () => {
      // Atribuição: cancelado = true;.
      cancelado = true;
    };
  }, [id]);

  function atualizarCampo(campo: keyof Formulario, valor: string | number[]) {
    // Condição: campo === "data" && typeof valor === "string" && dataEhDomingo(valor).
    if (campo === "data" && typeof valor === "string" && dataEhDomingo(valor)) {
      // Chamada: setErro("A empresa não abre aos domingos. Escolha outra data.");.
      setErro("A empresa não abre aos domingos. Escolha outra data.");
      return;
    }
    if (campo === "data") setErro("");
    // Chamada: setForm((atual) => ({ ...atual, [campo]: valor }));.
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  function alternarExtra(idExtra: number) {
    // Chamada: setForm((atual) => ({.
    setForm((atual) => ({
      ...atual,
      extras: atual.extras.includes(idExtra)
        ? atual.extras.filter((item) => item !== idExtra)
        : [...atual.extras, idExtra],
    }));
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    // Chamada: evento.preventDefault();.
    evento.preventDefault();
    // Chamada: setErro("");.
    setErro("");

    // Condição: dataEhDomingo(form.data).
    if (dataEhDomingo(form.data)) {
      // Chamada: setErro("A empresa não abre aos domingos. Escolha outra data.");.
      setErro("A empresa não abre aos domingos. Escolha outra data.");
      return;
    }

    // Chamada: setSalvando(true);.
    setSalvando(true);

    // Declara constante 'dados'.
    const dados = {
      clienteId: Number(form.clienteId),
      placa: form.placa,
      veiculo: form.veiculo,
      servicoId: Number(form.servicoId),
      extras: form.extras,
      data: form.data,
      horario: form.horario,
      observacoes: form.observacoes,
    };

    // Bloco try: captura erros de chamadas assíncronas/rede/validação.
    try {
      // Condição: id === undefined.
      if (id === undefined) {
        // Aguarda operação assíncrona: agendamentoService.criarAdmin(dados);.
        await agendamentoService.criarAdmin(dados);
      } else {
        // Aguarda operação assíncrona: agendamentoService.atualizarAdmin(id, { ...dados, status: form.status });.
        await agendamentoService.atualizarAdmin(id, { ...dados, status: form.status });
      }
      // Chamada: navigate("/admin/agendamento");.
      navigate("/admin/agendamento");
    } catch (erroApi) {
      // Chamada: setErro(obterMensagemErro(erroApi));.
      setErro(obterMensagemErro(erroApi));
    } finally {
      // Chamada: setSalvando(false);.
      setSalvando(false);
    }
  }

  // Condição: carregando.
  if (carregando) {
    // Retorna <section className={styles.pagina}><p>Carregando formulário...</p></section>.
    return <section className={styles.pagina}><p>Carregando formulário...</p></section>;
  }

  // Condição: falhaCarregamento.
  if (falhaCarregamento) {
    return (
      <section className={styles.pagina}>
        <HeaderAdmin
          // Atribuição: titulo={id === undefined ? "CADASTRAR AGENDAMENTO" : "EDITAR AGENDAMENTO"}.
          titulo={id === undefined ? "CADASTRAR AGENDAMENTO" : "EDITAR AGENDAMENTO"}
          // Atribuição: links={[{ to: "/admin/agendamento", label: "← VOLTAR AOS AGENDAMENTOS" }]}.
          links={[{ to: "/admin/agendamento", label: "← VOLTAR AOS AGENDAMENTOS" }]}
        />
        <p className={styles.mensagem} role="alert">{erro}</p>
      </section>
    );
  }

  return (
    <section className={styles.pagina}>
      <HeaderAdmin
        // Atribuição: titulo={id === undefined ? "CADASTRAR AGENDAMENTO" : "EDITAR AGENDAMENTO"}.
        titulo={id === undefined ? "CADASTRAR AGENDAMENTO" : "EDITAR AGENDAMENTO"}
        // Atribuição: links={[{ to: "/admin/agendamento", label: "← VOLTAR AOS AGENDAMENTOS" }]}.
        links={[{ to: "/admin/agendamento", label: "← VOLTAR AOS AGENDAMENTOS" }]}
      />
      <form className={styles.formulario} onSubmit={salvar}>
        <label className={styles.campo}>
          Cliente
          <select
            required
            // Atribuição: value={form.clienteId}.
            value={form.clienteId}
            // Atribuição: onChange={(evento) => atualizarCampo("clienteId", evento.target.value)}.
            onChange={(evento) => atualizarCampo("clienteId", evento.target.value)}
          >
            <option value="">Selecione um cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}{cliente.status === "Inativo" ? " (inativo)" : ""}
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
            // Atribuição: placeholder="ABC1D23".
            placeholder="ABC1D23"
            // Atribuição: value={form.placa}.
            value={form.placa}
            // Atribuição: onChange={(evento) => atualizarCampo("placa", evento.target.value.toUpperCase())}.
            onChange={(evento) => atualizarCampo("placa", evento.target.value.toUpperCase())}
          />
        </label>

        <label className={styles.campo}>
          Veículo
          <input
            required
            // Atribuição: maxLength={50}.
            maxLength={50}
            // Atribuição: placeholder="Modelo do veículo".
            placeholder="Modelo do veículo"
            // Atribuição: value={form.veiculo}.
            value={form.veiculo}
            // Atribuição: onChange={(evento) => atualizarCampo("veiculo", evento.target.value)}.
            onChange={(evento) => atualizarCampo("veiculo", evento.target.value)}
          />
        </label>

        <label className={styles.campo}>
          Serviço principal
          <select
            required
            // Atribuição: value={form.servicoId}.
            value={form.servicoId}
            // Atribuição: onChange={(evento) => atualizarCampo("servicoId", evento.target.value)}.
            onChange={(evento) => atualizarCampo("servicoId", evento.target.value)}
          >
            <option value="">Selecione um serviço</option>
            {servicos.map((servico) => (
              <option key={servico.id_servico} value={servico.id_servico}>
                {servico.nome_servico}
              </option>
            ))}
          </select>
        </label>

        {extras.length > 0 && (
          <fieldset className={styles.campo}>
            <legend>Serviços adicionais</legend>
            {extras.map((extra) => (
              <label key={extra.id_servico}>
                <input
                  // Atribuição: type="checkbox".
                  type="checkbox"
                  // Atribuição: checked={form.extras.includes(extra.id_servico)}.
                  checked={form.extras.includes(extra.id_servico)}
                  // Atribuição: onChange={() => alternarExtra(extra.id_servico)}.
                  onChange={() => alternarExtra(extra.id_servico)}
                />
                {extra.nome_servico}
              </label>
            ))}
          </fieldset>
        )}

        <label className={styles.campo}>
          Data
          <input
            required
            // Atribuição: type="date".
            type="date"
            // Atribuição: min={dataLocalAtual()}.
            min={dataLocalAtual()}
            // Atribuição: value={form.data}.
            value={form.data}
            // Atribuição: onChange={(evento) => atualizarCampo("data", evento.target.value)}.
            onChange={(evento) => atualizarCampo("data", evento.target.value)}
          />
        </label>

        <label className={styles.campo}>
          Horário
          <input
            required
            // Atribuição: type="time".
            type="time"
            // Atribuição: value={form.horario}.
            value={form.horario}
            // Atribuição: onChange={(evento) => atualizarCampo("horario", evento.target.value)}.
            onChange={(evento) => atualizarCampo("horario", evento.target.value)}
          />
        </label>

        <label className={styles.campo}>
          Observações
          <textarea
            // Atribuição: maxLength={500}.
            maxLength={500}
            // Atribuição: placeholder="Observações pertinentes ao atendimento...".
            placeholder="Observações pertinentes ao atendimento..."
            // Atribuição: value={form.observacoes}.
            value={form.observacoes}
            // Atribuição: onChange={(evento) => atualizarCampo("observacoes", evento.target.value)}.
            onChange={(evento) => atualizarCampo("observacoes", evento.target.value)}
          />
        </label>

        {id !== undefined && (
          <label className={styles.campo}>
            Status
            <select
              // Atribuição: value={form.status}.
              value={form.status}
              // Atribuição: onChange={(evento) => atualizarCampo("status", evento.target.value as StatusAgendamento)}.
              onChange={(evento) => atualizarCampo("status", evento.target.value as StatusAgendamento)}
              // Atribuição: disabled={form.status === "Cancelado"}.
              disabled={form.status === "Cancelado"}
            >
              <option value="Pendente">Pendente</option>
              <option value="Confirmado">Confirmado</option>
              <option
                // Atribuição: value="Cancelado".
                value="Cancelado"
                // Atribuição: disabled={form.status !== "Pendente" && form.status !== "Cancelado"}.
                disabled={form.status !== "Pendente" && form.status !== "Cancelado"}
              >
                Cancelado
              </option>
            </select>
            {form.status === "Cancelado" && (
              <small>Agendamentos cancelados não podem ser reativados.</small>
            )}
          </label>
        )}

        {erro && <p className={styles.mensagem} role="alert">{erro}</p>}
        <button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : id === undefined ? "Cadastrar agendamento" : "Salvar alterações"}
        </button>
      </form>
    </section>
  );
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/admin/Agendamento/FormularioAgendamento.tsx) responsável por renderizar UI e orquestrar interações do usuário.
