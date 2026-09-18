import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAlert } from "react-alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDumpster, faArrowLeft, faSave } from "@fortawesome/free-solid-svg-icons";

import Button from "components/button/Button";
import { Input } from "components/input/Input";

import CacambaController from "../../controllers/CacambaController";
import AuthContext from "contexts/AuthContext";
import LoadingContext from "../../contexts/LoadingContext";

import "./CacambaForm.scss";

const initialState = {
  bucketName: "",
  bucketNumber: "",
  bucketSize: "",
  bucketStatus: "disponivel",
  bucketRentalValue: "",
  bucketNotes: "",
};

export default function CacambaForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const alert = useAlert();
  const { user } = useContext(AuthContext);
  const { setLoading } = useContext(LoadingContext);
  const isEdit = !!id;

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (isEdit) {
      loadCacamba();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadCacamba = async () => {
    setLoading(true);
    try {
      const response = await CacambaController.getById(id);
      if (response.status === 200 && response.content) {
        setFormData({
          bucketName: response.content.bucketName || "",
          bucketNumber: response.content.bucketNumber || "",
          bucketSize: response.content.bucketSize ?? "",
          bucketStatus: response.content.bucketStatus || "disponivel",
          bucketRentalValue: response.content.bucketRentalValue ?? "",
          bucketNotes: response.content.bucketNotes || "",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar caçamba:", error);
      alert.error("Erro ao carregar caçamba");
      navigate("/cacambas");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bucketName) {
      alert.error("Informe o nome/identificação da caçamba");
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        bucketSize: formData.bucketSize === "" ? null : Number(formData.bucketSize),
        bucketRentalValue:
          formData.bucketRentalValue === "" ? null : Number(formData.bucketRentalValue),
        userId: user?.userLogged?.userId,
      };

      const response = isEdit
        ? await CacambaController.update(id, dataToSend)
        : await CacambaController.create(dataToSend);

      if (response.status === 200) {
        alert.success(`Caçamba ${isEdit ? "atualizada" : "criada"} com sucesso!`);
        navigate("/cacambas");
      } else {
        alert.error(response.message || `Erro ao ${isEdit ? "atualizar" : "criar"} caçamba`);
      }
    } catch (error) {
      console.error("Erro:", error);
      alert.error(`Erro ao ${isEdit ? "atualizar" : "criar"} caçamba`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="cacamba-form">
      <div className="cacamba-form-header">
        <div className="header-content">
          <div className="header-title">
            <FontAwesomeIcon icon={faDumpster} className="header-icon" />
            <div>
              <h1>{isEdit ? "Editar Caçamba" : "Nova Caçamba"}</h1>
              <p>{isEdit ? "Atualize os dados da caçamba" : "Cadastre uma nova caçamba"}</p>
            </div>
          </div>
          <Button onClick={() => navigate("/cacambas")}>
            <FontAwesomeIcon icon={faArrowLeft} /> Voltar
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-card">
          <div className="form-row">
            <Input
              title="Nome/Identificação"
              type="text"
              value={formData.bucketName}
              onChange={(e) => handleChange("bucketName", e.target.value)}
              required
            />

            <Input
              title="Número"
              type="text"
              value={formData.bucketNumber}
              onChange={(e) => handleChange("bucketNumber", e.target.value)}
            />
          </div>

          <div className="form-row">
            <Input
              title="Tamanho (m³)"
              type="number"
              value={formData.bucketSize}
              onChange={(e) => handleChange("bucketSize", e.target.value)}
            />

            <Input
              title="Valor da locação (R$)"
              type="number"
              value={formData.bucketRentalValue}
              onChange={(e) => handleChange("bucketRentalValue", e.target.value)}
            />
          </div>

          <fieldset className="input-standard">
            <label>Status:</label>
            <select
              value={formData.bucketStatus}
              onChange={(e) => handleChange("bucketStatus", e.target.value)}
            >
              <option value="disponivel">Disponível</option>
              <option value="alugada">Alugada</option>
              <option value="manutencao">Manutenção</option>
            </select>
          </fieldset>

          <Input
            title="Observações"
            type="text"
            value={formData.bucketNotes}
            onChange={(e) => handleChange("bucketNotes", e.target.value)}
          />
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={() => navigate("/cacambas")}>
            Cancelar
          </Button>
          <Button type="submit">
            <FontAwesomeIcon icon={faSave} /> {isEdit ? "Atualizar" : "Salvar"} Caçamba
          </Button>
        </div>
      </form>
    </section>
  );
}
