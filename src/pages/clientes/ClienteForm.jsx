import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAlert } from "react-alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressBook, faArrowLeft, faSave, faMapMarkerAlt, faDumpster, faPlus } from "@fortawesome/free-solid-svg-icons";

import Button from "components/button/Button";
import { Input } from "components/input/Input";

import { formatDia, formatMomento } from "helpers/date-utils";
import ConfirmModal from "modals/Confirm/ConfirmModal";

import ClienteController from "../../controllers/ClienteController";
import CacambaController from "../../controllers/CacambaController";
import AuthContext from "contexts/AuthContext";
import LoadingContext from "../../contexts/LoadingContext";

import "./ClienteForm.scss";

function toDateInputValue(date) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

const LOCACAO_STATUS = {
  aberta: "Em andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

let proximaChave = 1;

function novaLinha() {
  return { chave: `nova-${proximaChave++}`, bucketId: "", dataEntrada: "", dataPrevista: "" };
}

const initialState = {
  clienteNome: "",
  clienteTelefone: "",
  clienteDocumento: "",
  clienteEmail: "",
  clienteAddressName: "",
  clienteAddressNumber: "",
  clienteAddressComplement: "",
  clienteAddressNeighborhood: "",
  clienteAddressCity: "",
  clienteAddressState: "",
  clienteAddressCEP: "",
  clienteAddressReference: "",
  clienteActive: true,
  clienteNotes: "",
};

export default function ClienteForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const alert = useAlert();
  const { user } = useContext(AuthContext);
  const { setLoading } = useContext(LoadingContext);
  const isEdit = !!id;

  const [formData, setFormData] = useState(initialState);
  const [coordenadas, setCoordenadas] = useState({ latitude: null, longitude: null });
  const [locacoes, setLocacoes] = useState([]);
  // Aluguéis em andamento (datas editáveis) e linhas novas do formulário.
  const [emAndamento, setEmAndamento] = useState([]);
  const [novas, setNovas] = useState(isEdit ? [] : [novaLinha()]);
  const [confirmacao, setConfirmacao] = useState(null);
  const [cacambasDisponiveis, setCacambasDisponiveis] = useState([]);

  const userId = user?.userLogged?.userId;

  useEffect(() => {
    loadCacambasDisponiveis();

    if (isEdit) {
      loadCliente();
      loadLocacoes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadCacambasDisponiveis = async () => {
    if (!userId) return;

    try {
      const response = await CacambaController.getAll(userId);

      if (response.status === 200) {
        setCacambasDisponiveis(
          (response.content || []).filter((b) => b.bucketStatus === "disponivel")
        );
      }
    } catch (error) {
      console.error("Erro ao carregar caçambas disponíveis:", error);
    }
  };

  const loadLocacoes = async () => {
    const response = await ClienteController.getLocacoes(id);
    if (response.status === 200) {
      const lista = response.content || [];
      setLocacoes(lista);

      // Mantém datas já digitadas e ainda não salvas.
      setEmAndamento((atuais) =>
        lista
          .filter((l) => l.status === "aberta")
          .map(
            (l) =>
              atuais.find((a) => a._id === l._id) || {
                _id: l._id,
                nome: `${l.bucketName || "Caçamba"}${l.bucketNumber ? ` (${l.bucketNumber})` : ""}`,
                dataEntrada: toDateInputValue(l.dataEntrada),
                dataPrevista: toDateInputValue(l.dataPrevista),
              }
          )
      );
    }
  };

  const loadCliente = async () => {
    setLoading(true);
    try {
      const response = await ClienteController.getById(id);
      if (response.status === 200 && response.content) {
        const c = response.content;
        setFormData({
          clienteNome: c.clienteNome || "",
          clienteTelefone: c.clienteTelefone || "",
          clienteDocumento: c.clienteDocumento || "",
          clienteEmail: c.clienteEmail || "",
          clienteAddressName: c.clienteAddressName || "",
          clienteAddressNumber: c.clienteAddressNumber || "",
          clienteAddressComplement: c.clienteAddressComplement || "",
          clienteAddressNeighborhood: c.clienteAddressNeighborhood || "",
          clienteAddressCity: c.clienteAddressCity || "",
          clienteAddressState: c.clienteAddressState || "",
          clienteAddressCEP: c.clienteAddressCEP || "",
          clienteAddressReference: c.clienteAddressReference || "",
          clienteActive: c.clienteActive !== false,
          clienteNotes: c.clienteNotes || "",
        });
        setCoordenadas({
          latitude: c.clienteLatitude ?? null,
          longitude: c.clienteLongitude ?? null,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar cliente:", error);
      alert.error("Erro ao carregar cliente");
      navigate("/clientes");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const alterarAndamento = (_id, field, value) => {
    setEmAndamento((lista) => lista.map((l) => (l._id === _id ? { ...l, [field]: value } : l)));
  };

  const alterarNova = (chave, field, value) => {
    setNovas((lista) => lista.map((l) => (l.chave === chave ? { ...l, [field]: value } : l)));
  };

  const confirmarAcao = async () => {
    const { acao, locacao } = confirmacao;
    setConfirmacao(null);
    setLoading(true);

    try {
      const response =
        acao === "recolher"
          ? await ClienteController.recolherLocacao(id, locacao._id)
          : await ClienteController.cancelarLocacao(id, locacao._id);

      if (response.status === 200) {
        alert.success(acao === "recolher" ? "Caçamba recolhida!" : "Aluguel cancelado.");

        if (response.cliente) {
          handleChange("clienteActive", response.cliente.clienteActive);
        }
      } else {
        alert.error(response.message || "Erro ao atualizar o aluguel");
      }

      await Promise.all([loadLocacoes(), loadCacambasDisponiveis()]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.clienteNome || !formData.clienteTelefone) {
      alert.error("Nome e telefone são obrigatórios");
      return;
    }

    // Linha com data e sem caçamba é esquecimento; toda vazia é ignorada.
    if (novas.some((l) => !l.bucketId && (l.dataEntrada || l.dataPrevista))) {
      alert.error("Selecione a caçamba do novo aluguel");
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        locacoes: [
          ...emAndamento.map(({ _id, dataEntrada, dataPrevista }) => ({
            _id,
            dataEntrada: dataEntrada || null,
            dataPrevista: dataPrevista || null,
          })),
          ...novas
            .filter((l) => l.bucketId)
            .map(({ bucketId, dataEntrada, dataPrevista }) => ({
              bucketId: Number(bucketId),
              dataEntrada: dataEntrada || null,
              dataPrevista: dataPrevista || null,
            })),
        ],
        userId: user?.userLogged?.userId,
      };

      const response = isEdit
        ? await ClienteController.update(id, dataToSend)
        : await ClienteController.create(dataToSend);

      if (response.status === 200) {
        alert.success(`Cliente ${isEdit ? "atualizado" : "criado"} com sucesso!`);
        navigate("/clientes");
      } else {
        alert.error(response.message || `Erro ao ${isEdit ? "atualizar" : "criar"} cliente`);
      }
    } catch (error) {
      console.error("Erro:", error);
      alert.error(`Erro ao ${isEdit ? "atualizar" : "criar"} cliente`);
    } finally {
      setLoading(false);
    }
  };

  const mapsUrl = (() => {
    if (coordenadas.latitude && coordenadas.longitude) {
      return `https://www.google.com/maps/search/?api=1&query=${coordenadas.latitude},${coordenadas.longitude}`;
    }

    const enderecoBusca = [
      formData.clienteAddressName,
      formData.clienteAddressNumber,
      formData.clienteAddressNeighborhood,
      formData.clienteAddressCity,
      formData.clienteAddressState,
    ]
      .filter(Boolean)
      .join(", ");

    if (!enderecoBusca) return null;

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoBusca)}`;
  })();

  return (
    <section className="cliente-form">
      <div className="cliente-form-header">
        <div className="header-content">
          <div className="header-title">
            <FontAwesomeIcon icon={faAddressBook} className="header-icon" />
            <div>
              <h1>{isEdit ? "Editar Cliente" : "Novo Cliente"}</h1>
              <p>{isEdit ? "Atualize os dados do cliente" : "Cadastre um novo cliente"}</p>
            </div>
          </div>
          <Button onClick={() => navigate("/clientes")}>
            <FontAwesomeIcon icon={faArrowLeft} /> Voltar
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-card">
          <div className="card-title">Dados do Cliente</div>

          <div className="form-row">
            <Input
              title="Nome"
              type="text"
              value={formData.clienteNome}
              onChange={(e) => handleChange("clienteNome", e.target.value)}
              required
            />

            <Input
              title="Telefone"
              type="text"
              value={formData.clienteTelefone}
              onChange={(e) => handleChange("clienteTelefone", e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <Input
              title="CPF/CNPJ"
              type="text"
              value={formData.clienteDocumento}
              onChange={(e) => handleChange("clienteDocumento", e.target.value)}
            />

            <Input
              title="Email"
              type="email"
              value={formData.clienteEmail}
              onChange={(e) => handleChange("clienteEmail", e.target.value)}
            />
          </div>

          <fieldset className="input-standard">
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={formData.clienteActive}
                onChange={(e) => handleChange("clienteActive", e.target.checked)}
              />
              Cliente ativo
            </label>
          </fieldset>
        </div>

        <div className="form-card">
          <div className="card-title">Endereço</div>

          <div className="form-row">
            <Input
              title="Rua"
              type="text"
              value={formData.clienteAddressName}
              onChange={(e) => handleChange("clienteAddressName", e.target.value)}
            />

            <Input
              title="Número"
              type="text"
              value={formData.clienteAddressNumber}
              onChange={(e) => handleChange("clienteAddressNumber", e.target.value)}
            />
          </div>

          <div className="form-row">
            <Input
              title="Complemento"
              type="text"
              value={formData.clienteAddressComplement}
              onChange={(e) => handleChange("clienteAddressComplement", e.target.value)}
            />

            <Input
              title="Bairro"
              type="text"
              value={formData.clienteAddressNeighborhood}
              onChange={(e) => handleChange("clienteAddressNeighborhood", e.target.value)}
            />
          </div>

          <div className="form-row">
            <Input
              title="Cidade"
              type="text"
              value={formData.clienteAddressCity}
              onChange={(e) => handleChange("clienteAddressCity", e.target.value)}
            />

            <Input
              title="Estado"
              type="text"
              value={formData.clienteAddressState}
              onChange={(e) => handleChange("clienteAddressState", e.target.value)}
            />
          </div>

          <div className="form-row">
            <Input
              title="CEP"
              type="text"
              value={formData.clienteAddressCEP}
              onChange={(e) => handleChange("clienteAddressCEP", e.target.value)}
            />

            <Input
              title="Referência"
              type="text"
              value={formData.clienteAddressReference}
              onChange={(e) => handleChange("clienteAddressReference", e.target.value)}
            />
          </div>
        </div>

        <div className="form-card">
          <div className="card-title">Localização (para rota no mapa)</div>

          <p className="location-hint">
            {coordenadas.latitude && coordenadas.longitude
              ? "Localização definida automaticamente a partir do endereço."
              : "A localização é calculada automaticamente a partir do endereço ao salvar — não precisa preencher nada aqui."}
          </p>

          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="maps-link">
              <FontAwesomeIcon icon={faMapMarkerAlt} /> Abrir no Google Maps
            </a>
          )}
        </div>

        <div className="form-card">
          <div className="card-title">
            <FontAwesomeIcon icon={faDumpster} /> Caçambas com este cliente
          </div>

          {emAndamento.map((locacao) => (
            <div className="locacao-linha" key={locacao._id}>
              <div className="locacao-topo">
                <strong>{locacao.nome}</strong>
                <div className="locacao-acoes">
                  <button
                    type="button"
                    className="locacao-btn locacao-btn-recolher"
                    onClick={() => setConfirmacao({ acao: "recolher", locacao })}
                  >
                    Recolhida
                  </button>
                  <button
                    type="button"
                    className="locacao-btn"
                    onClick={() => setConfirmacao({ acao: "cancelar", locacao })}
                  >
                    Cancelar aluguel
                  </button>
                </div>
              </div>

              <div className="form-row">
                <Input
                  title="Data de entrada"
                  type="date"
                  value={locacao.dataEntrada}
                  onChange={(e) => alterarAndamento(locacao._id, "dataEntrada", e.target.value)}
                />
                <Input
                  title="Retirada prevista"
                  type="date"
                  value={locacao.dataPrevista}
                  onChange={(e) => alterarAndamento(locacao._id, "dataPrevista", e.target.value)}
                />
              </div>
            </div>
          ))}

          {novas.map((linha) => (
            <div className="locacao-linha" key={linha.chave}>
              <fieldset className="input-standard">
                <label htmlFor={linha.chave}>Nova caçamba:</label>
                <select
                  id={linha.chave}
                  value={linha.bucketId}
                  onChange={(e) => alterarNova(linha.chave, "bucketId", e.target.value)}
                >
                  <option value="">Nenhuma</option>
                  {cacambasDisponiveis
                    .filter(
                      (b) =>
                        !novas.some(
                          (l) => l.chave !== linha.chave && l.bucketId === String(b.bucketId)
                        )
                    )
                    .map((cacamba) => (
                      <option key={cacamba.bucketId} value={cacamba.bucketId}>
                        {cacamba.bucketName}
                        {cacamba.bucketNumber ? ` (${cacamba.bucketNumber})` : ""}
                      </option>
                    ))}
                </select>
                <span className="field-hint">Só aparecem as caçambas disponíveis.</span>
              </fieldset>

              <div className="form-row">
                <Input
                  title="Data de entrada"
                  type="date"
                  value={linha.dataEntrada}
                  onChange={(e) => alterarNova(linha.chave, "dataEntrada", e.target.value)}
                />
                <Input
                  title="Retirada prevista"
                  type="date"
                  value={linha.dataPrevista}
                  onChange={(e) => alterarNova(linha.chave, "dataPrevista", e.target.value)}
                />
              </div>

              <button
                type="button"
                className="locacao-btn"
                onClick={() => setNovas((lista) => lista.filter((l) => l.chave !== linha.chave))}
              >
                Remover linha
              </button>
            </div>
          ))}

          <button
            type="button"
            className="locacao-btn locacao-btn-adicionar"
            onClick={() => setNovas((lista) => [...lista, novaLinha()])}
          >
            <FontAwesomeIcon icon={faPlus} /> Adicionar caçamba
          </button>
        </div>

        {locacoes.length > 0 && (
          <div className="form-card">
            <div className="card-title">Aluguéis deste cliente</div>

            <div className="locacoes-wrapper">
              <table className="locacoes-table">
                <thead>
                  <tr>
                    <th>Caçamba</th>
                    <th>Entrada</th>
                    <th>Retirada</th>
                    <th>Valor</th>
                    <th>Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {locacoes.map((locacao) => (
                    <tr key={locacao._id}>
                      <td>
                        {locacao.bucketName || "-"}
                        {locacao.bucketNumber ? ` (${locacao.bucketNumber})` : ""}
                      </td>
                      <td>{formatDia(locacao.dataEntrada)}</td>
                      <td>
                        {locacao.status === "concluida"
                          ? formatMomento(locacao.dataRecolhimento)
                          : formatDia(locacao.dataPrevista)}
                      </td>
                      <td>
                        {locacao.valor != null
                          ? `R$ ${Number(locacao.valor).toFixed(2).replace(".", ",")}`
                          : "-"}
                      </td>
                      <td>{LOCACAO_STATUS[locacao.status] || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="form-card">
          <div className="card-title">Observações</div>
          <Input
            type="text"
            value={formData.clienteNotes}
            onChange={(e) => handleChange("clienteNotes", e.target.value)}
          />
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={() => navigate("/clientes")}>
            Cancelar
          </Button>
          <Button type="submit">
            <FontAwesomeIcon icon={faSave} /> {isEdit ? "Atualizar" : "Salvar"} Cliente
          </Button>
        </div>
      </form>

      <ConfirmModal
        isOpen={!!confirmacao}
        variant={confirmacao?.acao === "recolher" ? "confirm" : undefined}
        confirmLabel="Confirmar"
        title={confirmacao?.acao === "recolher" ? "Marcar como recolhida" : "Cancelar aluguel"}
        content={
          confirmacao?.acao === "recolher"
            ? `Confirma que "${confirmacao?.locacao.nome}" já foi recolhida? O valor entra na receita.`
            : `Cancelar o aluguel de "${confirmacao?.locacao.nome}"? Ele não entra na receita.`
        }
        onConfirm={confirmarAcao}
        onCancel={() => setConfirmacao(null)}
      />
    </section>
  );
}
