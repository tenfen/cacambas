import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAlert } from "react-alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressBook, faArrowLeft, faSave, faMapMarkerAlt, faDumpster } from "@fortawesome/free-solid-svg-icons";

import Button from "components/button/Button";
import { Input } from "components/input/Input";

import ClienteController from "../../controllers/ClienteController";
import CacambaController from "../../controllers/CacambaController";
import AuthContext from "contexts/AuthContext";
import LoadingContext from "../../contexts/LoadingContext";

import "./ClienteForm.scss";

function toDateInputValue(date) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
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
  bucketId: "",
  clienteDataEntrada: "",
  clienteDataSaida: "",
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
  const [cacambasDisponiveis, setCacambasDisponiveis] = useState([]);

  const userId = user?.userLogged?.userId;

  useEffect(() => {
    loadCacambasDisponiveis();

    if (isEdit) {
      loadCliente();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadCacambasDisponiveis = async () => {
    if (!userId) return;

    try {
      const [cacambasRes, clientesRes] = await Promise.all([
        CacambaController.getAll(userId),
        ClienteController.getAll(userId),
      ]);

      const todasCacambas = cacambasRes.status === 200 ? cacambasRes.content || [] : [];
      const todosClientes = clientesRes.status === 200 ? clientesRes.content || [] : [];

      /*
       * Uma caçamba já alocada em OUTRO cliente não entra na lista —
       * mas a que já está com este cliente (em edição) continua aparecendo.
       */
      const idsOcupados = todosClientes
        .filter((c) => String(c.clienteId) !== String(id) && c.bucketId)
        .map((c) => c.bucketId);

      setCacambasDisponiveis(
        todasCacambas.filter((b) => !idsOcupados.includes(b.bucketId))
      );
    } catch (error) {
      console.error("Erro ao carregar caçambas disponíveis:", error);
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
          bucketId: c.bucketId ?? "",
          clienteDataEntrada: toDateInputValue(c.clienteDataEntrada),
          clienteDataSaida: toDateInputValue(c.clienteDataSaida),
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.clienteNome || !formData.clienteTelefone) {
      alert.error("Nome e telefone são obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        bucketId: formData.bucketId === "" ? null : Number(formData.bucketId),
        clienteDataEntrada: formData.clienteDataEntrada || null,
        clienteDataSaida: formData.clienteDataSaida || null,
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
            <FontAwesomeIcon icon={faDumpster} /> Caçamba Alocada
          </div>

          <fieldset className="input-standard">
            <label>Caçamba:</label>
            <select
              value={formData.bucketId}
              onChange={(e) => handleChange("bucketId", e.target.value)}
            >
              <option value="">Nenhuma</option>
              {cacambasDisponiveis.map((cacamba) => (
                <option key={cacamba.bucketId} value={cacamba.bucketId}>
                  {cacamba.bucketName}
                  {cacamba.bucketNumber ? ` (${cacamba.bucketNumber})` : ""}
                </option>
              ))}
            </select>
            <span className="field-hint">
              Só aparecem aqui as caçambas que não estão com outro cliente.
            </span>
          </fieldset>

          <div className="form-row">
            <Input
              title="Data de entrada"
              type="date"
              value={formData.clienteDataEntrada}
              onChange={(e) => handleChange("clienteDataEntrada", e.target.value)}
            />

            <Input
              title="Data de saída (retirada)"
              type="date"
              value={formData.clienteDataSaida}
              onChange={(e) => handleChange("clienteDataSaida", e.target.value)}
            />
          </div>
        </div>

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
    </section>
  );
}
