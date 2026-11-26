import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAlert } from "react-alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruckRampBox, faPlus, faEdit, faCheckCircle, faBan, faRoute } from "@fortawesome/free-solid-svg-icons";

import Button from "components/button/Button";
import { Input } from "components/input/Input";
import Search from "components/search/Search";
import ConfirmModal from "modals/Confirm/ConfirmModal";
import { formatDia, hojeComoDia, paraInputDate } from "helpers/date-utils";
import { nomeDaCacamba, rotaUrl } from "helpers/locacao-utils";

import ClienteController from "../../controllers/ClienteController";
import CacambaController from "../../controllers/CacambaController";
import AuthContext from "contexts/AuthContext";
import LoadingContext from "../../contexts/LoadingContext";

import "../clientes/ClienteForm.scss";
import "../clientes/ClienteList.scss";
import "./Alugueis.scss";

const FILTROS = [
  ["todos", "Todos"],
  ["atrasado", "Atrasados"],
  ["hoje", "Retirar hoje"],
];

const SITUACAO = {
  atrasado: "Atrasado",
  hoje: "Retirar hoje",
  em_dia: "Em dia",
  sem_data: "Sem data",
};

let proximaChave = 1;

function novaLinha() {
  return { chave: `linha-${proximaChave++}`, bucketId: "" };
}

function novoAluguel(clienteId = "") {
  return {
    clienteId: String(clienteId),
    linhas: [novaLinha()],
    dataEntrada: hojeComoDia(),
    dataPrevista: "",
  };
}

function situacaoDe(locacao) {
  if (!locacao.dataPrevista) return "sem_data";

  const dia = paraInputDate(locacao.dataPrevista);
  const hoje = hojeComoDia();

  if (dia < hoje) return "atrasado";
  return dia === hoje ? "hoje" : "em_dia";
}

export default function Alugueis() {
  const navigate = useNavigate();
  const alert = useAlert();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const { setLoading } = useContext(LoadingContext);
  const userId = user?.userLogged?.userId;

  const [clientes, setClientes] = useState([]);
  const [cacambas, setCacambas] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [form, setForm] = useState(() => {
    const clienteId = searchParams.get("cliente");
    return clienteId ? novoAluguel(clienteId) : null;
  });
  const [edicao, setEdicao] = useState(null);
  const [confirmacao, setConfirmacao] = useState(null);

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const carregar = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const [clientesRes, cacambasRes] = await Promise.all([
        ClienteController.getAll(userId),
        CacambaController.getAll(userId),
      ]);

      if (clientesRes.status === 200) setClientes(clientesRes.content || []);
      if (cacambasRes.status === 200) setCacambas(cacambasRes.content || []);

      if (clientesRes.status !== 200 || cacambasRes.status !== 200) {
        alert.error("Erro ao carregar os aluguéis");
      }
    } finally {
      setLoading(false);
    }
  };

  const alugueis = useMemo(
    () =>
      clientes
        .flatMap((cliente) =>
          (cliente.locacoesAbertas || []).map((locacao) => ({
            cliente,
            locacao,
            situacao: situacaoDe(locacao),
          }))
        )
        // Retirada mais próxima primeiro; sem data vai para o fim.
        .sort(
          (a, b) =>
            new Date(a.locacao.dataPrevista || "9999-12-31") -
            new Date(b.locacao.dataPrevista || "9999-12-31")
        ),
    [clientes]
  );

  const visiveis = alugueis.filter(
    ({ cliente, locacao, situacao }) =>
      (filtro === "todos" || situacao === filtro) &&
      `${cliente.clienteNome} ${cliente.clienteTelefone || ""} ${nomeDaCacamba(locacao)}`
        .toLowerCase()
        .includes(busca.toLowerCase())
  );

  const total = (situacao) =>
    situacao === "todos"
      ? alugueis.length
      : alugueis.filter((a) => a.situacao === situacao).length;

  const disponiveis = cacambas.filter((c) => c.bucketStatus === "disponivel");

  const alterarForm = (campo, valor) => setForm((atual) => ({ ...atual, [campo]: valor }));

  const alterarLinha = (chave, bucketId) =>
    setForm((atual) => ({
      ...atual,
      linhas: atual.linhas.map((l) => (l.chave === chave ? { ...l, bucketId } : l)),
    }));

  const salvarNovo = async (e) => {
    e.preventDefault();

    const bucketIds = form.linhas.filter((l) => l.bucketId).map((l) => Number(l.bucketId));

    if (!form.clienteId) return alert.error("Selecione o cliente");
    if (!bucketIds.length) return alert.error("Selecione a caçamba");
    if (form.dataEntrada && form.dataPrevista && form.dataPrevista < form.dataEntrada) {
      return alert.error("A retirada não pode ser antes da entrada");
    }

    setLoading(true);
    try {
      const response = await ClienteController.update(form.clienteId, {
        locacoes: bucketIds.map((bucketId) => ({
          bucketId,
          dataEntrada: form.dataEntrada || null,
          dataPrevista: form.dataPrevista || null,
        })),
      });

      if (response.status !== 200) {
        return alert.error(response.message || "Erro ao salvar o aluguel");
      }

      // Só confirma se o servidor devolver as caçambas vinculadas.
      const vinculadas = (response.cliente?.locacoesAbertas || []).map((l) => l.bucketId);

      if (!bucketIds.every((bucketId) => vinculadas.includes(bucketId))) {
        return alert.error("O servidor não registrou o aluguel. Tente de novo em alguns minutos.");
      }

      alert.success(bucketIds.length > 1 ? "Aluguéis registrados!" : "Aluguel registrado!");
      setForm(null);
      navigate("/alugueis", { replace: true });
      await carregar();
    } finally {
      setLoading(false);
    }
  };

  const salvarDatas = async (e) => {
    e.preventDefault();

    if (edicao.dataEntrada && edicao.dataPrevista && edicao.dataPrevista < edicao.dataEntrada) {
      return alert.error("A retirada não pode ser antes da entrada");
    }

    setLoading(true);
    try {
      const response = await ClienteController.update(edicao.clienteId, {
        locacoes: [
          {
            _id: edicao._id,
            dataEntrada: edicao.dataEntrada || null,
            dataPrevista: edicao.dataPrevista || null,
          },
        ],
      });

      if (response.status !== 200) {
        return alert.error(response.message || "Erro ao salvar as datas");
      }

      alert.success("Datas atualizadas!");
      setEdicao(null);
      await carregar();
    } finally {
      setLoading(false);
    }
  };

  const confirmarAcao = async () => {
    const { acao, cliente, locacao } = confirmacao;
    setConfirmacao(null);
    setLoading(true);

    try {
      const response =
        acao === "recolher"
          ? await ClienteController.recolherLocacao(cliente.clienteId, locacao._id)
          : await ClienteController.cancelarLocacao(cliente.clienteId, locacao._id);

      if (response.status === 200) {
        alert.success(acao === "recolher" ? "Caçamba recolhida!" : "Aluguel cancelado.");
      } else {
        alert.error(response.message || "Erro ao atualizar o aluguel");
      }

      await carregar();
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="cliente-list alugueis">
      <div className="cliente-list-header">
        <div className="header-content">
          <div className="header-title">
            <FontAwesomeIcon icon={faTruckRampBox} className="header-icon" />
            <div>
              <h1>Aluguéis</h1>
              <p>Caçambas que estão com clientes agora</p>
            </div>
          </div>
          {!form && (
            <Button onClick={() => setForm(novoAluguel())}>
              <span>+</span> Novo aluguel
            </Button>
          )}
        </div>
      </div>

      {form && (
        <div className="cliente-form">
          <form className="form-content" onSubmit={salvarNovo}>
            <div className="form-card">
              <div className="card-title">Novo aluguel</div>

              <fieldset className="input-standard">
                <label htmlFor="aluguel-cliente">Cliente:</label>
                <select
                  id="aluguel-cliente"
                  value={form.clienteId}
                  onChange={(e) => alterarForm("clienteId", e.target.value)}
                >
                  <option value="">Selecione</option>
                  {clientes.map((c) => (
                    <option key={c.clienteId} value={c.clienteId}>
                      {c.clienteNome} {c.clienteTelefone ? `- ${c.clienteTelefone}` : ""}
                    </option>
                  ))}
                </select>
                <span className="field-hint">
                  Cliente novo? <Link to="/clientes/novo">Cadastre primeiro</Link>.
                </span>
              </fieldset>

              {form.linhas.map((linha, indice) => (
                <fieldset className="input-standard" key={linha.chave}>
                  <label htmlFor={linha.chave}>
                    {form.linhas.length > 1 ? `Caçamba ${indice + 1}:` : "Caçamba:"}
                  </label>
                  <div className="linha-cacamba">
                    <select
                      id={linha.chave}
                      value={linha.bucketId}
                      onChange={(e) => alterarLinha(linha.chave, e.target.value)}
                    >
                      <option value="">Selecione</option>
                      {disponiveis
                        .filter(
                          (c) =>
                            !form.linhas.some(
                              (l) => l.chave !== linha.chave && l.bucketId === String(c.bucketId)
                            )
                        )
                        .map((c) => (
                          <option key={c.bucketId} value={c.bucketId}>
                            {nomeDaCacamba(c)}
                          </option>
                        ))}
                    </select>
                    {form.linhas.length > 1 && (
                      <button
                        type="button"
                        className="locacao-btn"
                        onClick={() =>
                          alterarForm(
                            "linhas",
                            form.linhas.filter((l) => l.chave !== linha.chave)
                          )
                        }
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </fieldset>
              ))}

              {form.linhas.length < disponiveis.length && (
                <button
                  type="button"
                  className="locacao-btn locacao-btn-adicionar"
                  onClick={() => alterarForm("linhas", [...form.linhas, novaLinha()])}
                >
                  <FontAwesomeIcon icon={faPlus} /> Mais uma caçamba
                </button>
              )}

              {!disponiveis.length && (
                <p className="sem-cacamba">Nenhuma caçamba disponível no momento.</p>
              )}

              <div className="form-row">
                <Input
                  title="Data de entrada"
                  type="date"
                  value={form.dataEntrada}
                  onChange={(e) => alterarForm("dataEntrada", e.target.value)}
                />
                <Input
                  title="Retirada prevista"
                  type="date"
                  value={form.dataPrevista}
                  onChange={(e) => alterarForm("dataPrevista", e.target.value)}
                />
              </div>

              <div className="form-actions">
                <Button type="button" variant="secondary" onClick={() => setForm(null)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar aluguel</Button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="filtros" role="group" aria-label="Filtrar aluguéis">
        {FILTROS.map(([valor, rotulo]) => (
          <button
            key={valor}
            type="button"
            className={`filtro filtro-${valor}`}
            aria-pressed={filtro === valor}
            onClick={() => setFiltro(valor)}
          >
            {rotulo} <strong>{total(valor)}</strong>
          </button>
        ))}
      </div>

      <Search
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por cliente, telefone ou caçamba..."
      />

      <div className="cliente-table">
        <table>
          <thead>
            <tr>
              <th>Caçamba</th>
              <th>Cliente</th>
              <th>Entrada</th>
              <th>Retirada</th>
              <th className="center-text">Situação</th>
              <th className="center-text">Ações</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  {alugueis.length ? "Nenhum aluguel neste filtro" : "Nenhuma caçamba alugada agora"}
                </td>
              </tr>
            ) : (
              visiveis.map(({ cliente, locacao, situacao }) => (
                <tr key={locacao._id}>
                  <td>
                    <strong>{nomeDaCacamba(locacao)}</strong>
                  </td>
                  <td>
                    <Link to={`/clientes/editar/${cliente.clienteId}`}>{cliente.clienteNome}</Link>
                    <div className="telefone">{cliente.clienteTelefone}</div>
                  </td>
                  <td>{formatDia(locacao.dataEntrada)}</td>
                  <td>{formatDia(locacao.dataPrevista)}</td>
                  <td className="center-text">
                    <span className={`situacao situacao-${situacao}`}>{SITUACAO[situacao]}</span>
                  </td>
                  <td className="center-text">
                    <div className="actions">
                      <button
                        className="action-btn action-recolher"
                        onClick={() => setConfirmacao({ acao: "recolher", cliente, locacao })}
                        title="Marcar como recolhida"
                      >
                        <FontAwesomeIcon icon={faCheckCircle} />
                      </button>
                      {rotaUrl(cliente) && (
                        <a
                          className="action-btn action-route"
                          href={rotaUrl(cliente)}
                          target="_blank"
                          rel="noreferrer"
                          title="Traçar rota até o cliente"
                        >
                          <FontAwesomeIcon icon={faRoute} />
                        </a>
                      )}
                      <button
                        className="action-btn action-edit"
                        onClick={() =>
                          setEdicao({
                            _id: locacao._id,
                            clienteId: cliente.clienteId,
                            titulo: `${nomeDaCacamba(locacao)} - ${cliente.clienteNome}`,
                            dataEntrada: paraInputDate(locacao.dataEntrada),
                            dataPrevista: paraInputDate(locacao.dataPrevista),
                          })
                        }
                        title="Alterar datas"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="action-btn action-delete"
                        onClick={() => setConfirmacao({ acao: "cancelar", cliente, locacao })}
                        title="Cancelar aluguel"
                      >
                        <FontAwesomeIcon icon={faBan} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {edicao && (
        <div className="datas-overlay">
          <div className="cliente-form datas-modal" role="dialog" aria-modal="true" aria-label="Alterar datas">
            <form className="form-content" onSubmit={salvarDatas}>
              <div className="form-card">
                <div className="card-title">{edicao.titulo}</div>
                <div className="form-row">
                  <Input
                    title="Data de entrada"
                    type="date"
                    value={edicao.dataEntrada}
                    onChange={(e) => setEdicao({ ...edicao, dataEntrada: e.target.value })}
                  />
                  <Input
                    title="Retirada prevista"
                    type="date"
                    value={edicao.dataPrevista}
                    onChange={(e) => setEdicao({ ...edicao, dataPrevista: e.target.value })}
                  />
                </div>
                <div className="form-actions">
                  <Button type="button" variant="secondary" onClick={() => setEdicao(null)}>
                    Voltar
                  </Button>
                  <Button type="submit">Salvar datas</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmacao}
        variant={confirmacao?.acao === "recolher" ? "confirm" : undefined}
        confirmLabel="Confirmar"
        title={confirmacao?.acao === "recolher" ? "Marcar como recolhida" : "Cancelar aluguel"}
        content={
          confirmacao &&
          (confirmacao.acao === "recolher"
            ? `Confirma que "${nomeDaCacamba(confirmacao.locacao)}" de "${confirmacao.cliente.clienteNome}" já foi recolhida? O valor entra na receita.`
            : `Cancelar o aluguel de "${nomeDaCacamba(confirmacao.locacao)}" para "${confirmacao.cliente.clienteNome}"? Ele não entra na receita.`)
        }
        onConfirm={confirmarAcao}
        onCancel={() => setConfirmacao(null)}
      />
    </section>
  );
}
