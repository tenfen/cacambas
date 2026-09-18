import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from "react-alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDumpster, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

import Button from "components/button/Button";
import Search from "components/search/Search";
import ConfirmModal from "modals/Confirm/ConfirmModal";

import CacambaController from "../../controllers/CacambaController";
import AuthContext from "contexts/AuthContext";
import LoadingContext from "../../contexts/LoadingContext";

import "./CacambaList.scss";

const STATUS_LABEL = {
  disponivel: "Disponível",
  alugada: "Alugada",
  manutencao: "Manutenção",
};

export default function CacambaList() {
  const navigate = useNavigate();
  const alert = useAlert();
  const { user } = useContext(AuthContext);
  const { setLoading } = useContext(LoadingContext);
  const userId = user?.userLogged?.userId;

  const [cacambas, setCacambas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    loadCacambas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadCacambas = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await CacambaController.getAll(userId);
      if (response.status === 200) {
        setCacambas(response.content || []);
      }
    } catch (error) {
      console.error("Erro ao carregar caçambas:", error);
      alert.error("Erro ao carregar caçambas");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;

    setLoading(true);
    try {
      const response = await CacambaController.remove(toDelete.bucketId);
      if (response.status === 200) {
        alert.success("Caçamba excluída com sucesso!");
        setCacambas(cacambas.filter((c) => c.bucketId !== toDelete.bucketId));
      } else {
        alert.error("Erro ao excluir caçamba");
      }
    } catch (error) {
      console.error("Erro ao excluir caçamba:", error);
      alert.error("Erro ao excluir caçamba");
    } finally {
      setLoading(false);
      setToDelete(null);
    }
  };

  const filteredCacambas = cacambas.filter((c) =>
    `${c.bucketName} ${c.bucketNumber || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <section className="cacamba-list">
      <div className="cacamba-list-header">
        <div className="header-content">
          <div className="header-title">
            <FontAwesomeIcon icon={faDumpster} className="header-icon" />
            <div>
              <h1>Caçambas</h1>
              <p>Gerencie a sua frota de caçambas</p>
            </div>
          </div>
          <Button onClick={() => navigate("/cacambas/novo")}>
            <span>+</span> Adicionar Caçamba
          </Button>
        </div>
        <Search
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome ou número..."
        />
      </div>

      <div className="cacamba-table">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Número</th>
              <th className="center-text">Tamanho (m³)</th>
              <th className="center-text">Status</th>
              <th className="center-text">Valor</th>
              <th className="center-text">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredCacambas.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  Nenhuma caçamba cadastrada
                </td>
              </tr>
            ) : (
              filteredCacambas.map((cacamba) => (
                <tr key={cacamba.bucketId}>
                  <td>{cacamba.bucketName}</td>
                  <td>{cacamba.bucketNumber || "-"}</td>
                  <td className="center-text">{cacamba.bucketSize ?? "-"}</td>
                  <td className="center-text">
                    <span className={`badge badge-status-${cacamba.bucketStatus || "disponivel"}`}>
                      {STATUS_LABEL[cacamba.bucketStatus] || "Disponível"}
                    </span>
                  </td>
                  <td className="center-text">
                    {cacamba.bucketRentalValue != null
                      ? `R$ ${Number(cacamba.bucketRentalValue).toFixed(2)}`
                      : "-"}
                  </td>
                  <td className="center-text">
                    <div className="actions">
                      <button
                        className="action-btn action-edit"
                        onClick={() => navigate(`/cacambas/editar/${cacamba.bucketId}`)}
                        title="Editar"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="action-btn action-delete"
                        onClick={() => setToDelete(cacamba)}
                        title="Excluir"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={!!toDelete}
        title="Excluir caçamba"
        content={`Tem certeza que deseja excluir a caçamba "${toDelete?.bucketName}"?`}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </section>
  );
}
