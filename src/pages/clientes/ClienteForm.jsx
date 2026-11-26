import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAlert } from "react-alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressBook, faArrowLeft, faSave, faMapMarkerAlt, faDumpster } from "@fortawesome/free-solid-svg-icons";

import Button from "components/button/Button";
import { Input } from "components/input/Input";

import { formatDia, formatMomento } from "helpers/date-utils";
import { nomeDaCacamba } from "helpers/locacao-utils";

import ClienteController from "../../controllers/ClienteController";
import AuthContext from "contexts/AuthContext";
import LoadingContext from "../../contexts/LoadingContext";

import "./ClienteForm.scss";

const LOCACAO_STATUS = {
  aberta: "Em andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

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

  useEffect(() => {
    if (isEdit) {
      loadCliente();
      loadLocacoes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadLocacoes = async () => {
    const response = await ClienteController.getLocacoes(id);
    if (response.status === 200) {
      setLocacoes(response.content || []);
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
        userId: user?.userLogged?.userId,
      };

      const response = isEdit
        ? await ClienteController.update(id, dataToSend)
        : await ClienteController.create(dataToSend);

      if (response.status === 200) {
        alert.success(`Cliente ${isEdit ? "atualizado" : "criado"} com sucesso!`);
        // Cadastro novo segue direto para o aluguel.
        navigate(
          isEdit || !response.cliente?.clienteId
            ? "/clientes"
            : `/alugueis?cliente=${response.cliente.clienteId}`
        );
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
        {isEdit && (
          <div className="form-card">
            <div className="locacao-topo">
              <div className="card-title">Aluguéis deste cliente</div>
              <Button type="button" onClick={() => navigate(`/alugueis?cliente=${id}`)}>
                <FontAwesomeIcon icon={faDumpster} /> Alugar caçamba
              </Button>
            </div>

            {locacoes.length === 0 && <p className="location-hint">Nenhum aluguel ainda.</p>}

            {locacoes.length > 0 && (
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
                        <td>{nomeDaCacamba(locacao)}</td>
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
            )}
          </div>
        )}

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
            <FontAwesomeIcon icon={faSave} /> {isEdit ? "Atualizar cliente" : "Salvar e alugar caçamba"}
          </Button>
        </div>
      </form>
    </section>
  );
}
